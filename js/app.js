const { createApp, ref, reactive, computed, onMounted, watch, nextTick } = Vue;
const { ElMessage, ElMessageBox, ElLoading } = ElementPlus;

const API_BASE = 'api';

const app = createApp({
  setup() {
    const loading = ref(false);
    const detailLoading = ref(false);
    const checkLoading = ref(false);
    const checkDialogVisible = ref(false);

    const todayDate = ref(new Date().toISOString().split('T')[0]);
    const activeTab = ref('daily');

    const tableData = ref([]);
    const currentPage = ref(1);
    const pageSize = ref(20);
    const total = ref(0);
    const summary = ref({});

    const dateRange = ref([]);
    const filterForm = reactive({
      checkStatus: '',
      settlementStatus: '',
    });

    const expandRowKeys = ref([]);
    const detailData = ref([]);
    const detailSummary = ref({});
    const currentExpandedDate = ref('');
    const currentExpandedRow = ref(null);

    const checkForm = reactive({
      check_status: 1,
      check_remark: '',
    });
    const checkRow = ref({});
    const checkFormRef = ref(null);
    const forceRecheck = ref(false);

    const withholdingList = ref([]);
    const withholdingLoading = ref(false);
    const withholdingPage = ref(1);
    const withholdingPageSize = ref(20);
    const withholdingTotal = ref(0);
    const withholdingStatusLabels = ref({});
    const withholdingTagTypes = ref({});
    const withholdingStatusStats = ref({});
    const withholdingFilter = reactive({
      formula_code: '',
      order_no: '',
      status: '',
    });

    const withholdingDetailVisible = ref(false);
    const currentWithholdingDetail = ref(null);

    const withholdingStatusDialogVisible = ref(false);
    const withholdingStatusLoading = ref(false);
    const currentWithholdingRow = ref({});
    const withholdingStatusForm = reactive({
      status: null,
      remark: '',
      operator: '',
    });
    const withholdingStatusFormRef = ref(null);

    const withholdingRemarkDialogVisible = ref(false);
    const withholdingRemarkLoading = ref(false);
    const withholdingRemarkForm = reactive({
      remark: '',
      operator: '',
    });
    const withholdingRemarkFormRef = ref(null);

    const withholdingCalcDialogVisible = ref(false);
    const withholdingCalcLoading = ref(false);
    const availableFormulas = ref([]);
    const currentFormulaVariables = ref([]);
    const previewResult = ref(null);
    const withholdingCalcForm = reactive({
      formula_code: '',
      order_no: '',
      variables: {},
      initial_status: null,
      operator: '',
      remark: '',
    });
    const withholdingCalcFormRef = ref(null);

    const fundFlowList = ref([]);
    const fundLoading = ref(false);
    const fundPage = ref(1);
    const fundPageSize = ref(20);
    const fundTotal = ref(0);
    const fundTotalCount = ref(0);
    const fundStats = ref({
      current_balance: 0,
      total_in: 0,
      total_out: 0,
      status_stats: {},
    });
    const fundStatusLabels = ref({});
    const fundTagTypes = ref({});
    const fundTypeLabels = ref({});
    const fundDirectionLabels = ref({});
    const fundFilter = reactive({
      status: '',
      flow_type: '',
      direction: '',
      keyword: '',
      min_amount: '',
      max_amount: '',
      withholding_detail_id: '',
    });
    const fundDateRange = ref([]);

    const fundDetailVisible = ref(false);
    const currentFundDetail = ref(null);

    const fundStatusDialogVisible = ref(false);
    const fundStatusLoading = ref(false);
    const currentFundRow = ref({});
    const fundStatusForm = reactive({
      status: null,
      remark: '',
      operator: '',
    });
    const fundStatusFormRef = ref(null);

    const fundRemarkDialogVisible = ref(false);
    const fundRemarkLoading = ref(false);
    const fundRemarkForm = reactive({
      remark: '',
      operator: '',
    });
    const fundRemarkFormRef = ref(null);

    const canPreview = computed(() => {
      if (!withholdingCalcForm.formula_code) return false;
      for (const varDef of currentFormulaVariables.value) {
        if (varDef.default === undefined &&
            (withholdingCalcForm.variables[varDef.name] === '' ||
             withholdingCalcForm.variables[varDef.name] === null ||
             withholdingCalcForm.variables[varDef.name] === undefined)) {
          return false;
        }
      }
      return true;
    });

    const validateCheckRemark = (rule, value, callback) => {
      if (checkForm.check_status === 2 && (!value || !value.trim())) {
        callback(new Error('标记为核对异常时，必须填写异常原因'));
      } else {
        callback();
      }
    };

    const checkFormRules = reactive({
      check_status: [
        { required: true, message: '请选择核对结果', trigger: 'change' },
      ],
      check_remark: [
        { validator: validateCheckRemark, trigger: 'blur' },
      ],
    });

    const withholdingStatusRules = reactive({
      status: [
        { required: true, message: '请选择目标状态', trigger: 'change' },
      ],
      remark: [
        { required: true, message: '请输入变更原因', trigger: 'blur' },
      ],
    });

    const withholdingRemarkRules = reactive({
      remark: [
        { required: true, message: '请输入备注内容', trigger: 'blur' },
      ],
    });

    const withholdingCalcRules = reactive({
      formula_code: [
        { required: true, message: '请选择预扣公式', trigger: 'change' },
      ],
      operator: [
        { required: true, message: '请输入操作人', trigger: 'blur' },
      ],
    });

    const fundStatusRules = reactive({
      status: [
        { required: true, message: '请选择目标状态', trigger: 'change' },
      ],
      remark: [
        { required: true, message: '请输入变更原因', trigger: 'blur' },
      ],
    });

    const fundRemarkRules = reactive({
      remark: [
        { required: true, message: '请输入备注内容', trigger: 'blur' },
      ],
    });

    const getVariableRule = (varDef) => {
      if (varDef.default !== undefined) return [];
      return [
        { required: true, message: `请输入${varDef.label || varDef.name}`, trigger: 'blur' },
      ];
    };

    const formatMoney = (value) => {
      if (!value && value !== 0) return '0.00';
      return Number(value).toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    };

    const getCheckStatusName = (status) => {
      const map = { 0: '未核对', 1: '核对通过', 2: '核对异常' };
      return map[status] || '未知';
    };

    const getCheckStatusTag = (status) => {
      const map = { 0: 'info', 1: 'success', 2: 'danger' };
      return map[status] || 'info';
    };

    const getSettleStatusName = (status) => {
      const map = { 1: '待结算', 2: '已结算', 3: '已对账' };
      return map[status] || '未知';
    };

    const getSettleStatusTag = (status) => {
      const map = { 1: 'warning', 2: 'success', 3: 'primary' };
      return map[status] || 'info';
    };

    const getStatusName = (status) => {
      const map = { 1: '待结算', 2: '已结算', 3: '已对账' };
      return map[status] || '未知';
    };

    const getStatusTag = (status) => {
      const map = { 1: 'warning', 2: 'success', 3: 'primary' };
      return map[status] || 'info';
    };

    const getSettlementTypeName = (type) => {
      const map = { 1: '正常结算', 2: '退款', 3: '补款' };
      return map[type] || '未知';
    };

    const getSettlementTypeTag = (type) => {
      const map = { 1: 'success', 2: 'danger', 3: 'warning' };
      return map[type] || 'info';
    };

    const getWithholdingStatusTip = (status) => {
      const map = {
        0: '待处理：等待进一步操作',
        1: '已完成：预扣计算完成',
        2: '失败：预扣计算失败',
        3: '已取消：预扣已取消',
        4: '已冲销：预扣已冲销',
        5: '已结算：预扣已结算',
      };
      return map[status] || '未知状态';
    };

    const getFundStatusTip = (status) => {
      const map = {
        0: '待处理：等待确认',
        1: '已完成：交易已生效',
        2: '失败：交易失败',
        3: '已取消：交易已取消',
        4: '已冲销：交易已冲销',
      };
      return map[status] || '未知状态';
    };

    const getLogActionLabel = (action) => {
      const map = {
        'create': '创建',
        'status_change': '状态变更',
        'remark': '添加备注',
        'update': '更新',
        'delete': '删除',
      };
      return map[action] || action;
    };

    const getLogTagType = (action) => {
      const map = {
        'create': 'success',
        'status_change': 'warning',
        'remark': 'info',
        'update': 'primary',
        'delete': 'danger',
      };
      return map[action] || 'info';
    };

    const getLogTimelineType = (action) => {
      const map = {
        'create': 'success',
        'status_change': 'warning',
        'remark': 'info',
        'update': 'primary',
        'delete': 'danger',
      };
      return map[action] || 'info';
    };

    const clearDetailCache = () => {
      expandRowKeys.value = [];
      detailData.value = [];
      detailSummary.value = {};
      currentExpandedDate.value = '';
      currentExpandedRow.value = null;
    };

    const handleApiError = (code, msg) => {
      if (code === 401) {
        ElMessageBox.alert(
          '登录状态已失效，请重新登录后再操作',
          '未登录或登录已过期',
          {
            confirmButtonText: '我知道了',
            type: 'warning',
            showClose: false,
          }
        );
        return true;
      }
      if (code === 403) {
        ElMessage.error('权限不足，无法执行此操作（' + (msg || '请联系管理员') + '）');
        return true;
      }
      if (code === 405) {
        ElMessage.error('请求方式错误：' + (msg || '请使用正确的HTTP方法'));
        return true;
      }
      if (code === 500) {
        ElMessage.error('服务器内部错误，请稍后重试或联系管理员');
        return true;
      }
      return false;
    };

    const requestApi = async (url, options = {}) => {
      const response = await fetch(url, options);
      if (!response.ok) {
        let errorMsg = '';
        try {
          const errResult = await response.json();
          errorMsg = errResult.msg || '';
          if (!handleApiError(response.status, errorMsg) && !handleApiError(errResult.code, errorMsg)) {
            throw new Error(`服务器响应异常（HTTP ${response.status}）：${errorMsg || '未知错误'}`);
          }
          return {
            code: errResult.code || response.status,
            msg: errorMsg || `服务器响应异常（HTTP ${response.status}）`,
            data: errResult.data || null,
            _http_error: true,
          };
        } catch (parseErr) {
          if (!handleApiError(response.status, '')) {
            throw new Error(`服务器响应异常（HTTP ${response.status}）`);
          }
          return {
            code: response.status,
            msg: `服务器响应异常（HTTP ${response.status}）`,
            data: null,
            _http_error: true,
          };
        }
      }

      let result;
      try {
        result = await response.json();
      } catch (parseErr) {
        throw new Error('服务器返回数据格式异常，请稍后重试');
      }

      handleApiError(result.code, result.msg);
      return result;
    };

    const handleTabChange = (tab) => {
      if (tab === 'withholding') {
        loadWithholdingStatusTypes();
        fetchWithholdingList();
      } else if (tab === 'fundflow') {
        loadFundStatusTypes();
        fetchFundStats();
        fetchFundFlowList();
      }
    };

    const fetchDailyData = async () => {
      loading.value = true;
      try {
        const params = new URLSearchParams({
          page: currentPage.value,
          pageSize: pageSize.value,
        });
        if (dateRange.value && dateRange.value.length === 2) {
          params.append('startDate', dateRange.value[0]);
          params.append('endDate', dateRange.value[1]);
        }
        if (filterForm.checkStatus !== '') {
          params.append('checkStatus', filterForm.checkStatus);
        }
        if (filterForm.settlementStatus !== '') {
          params.append('settlementStatus', filterForm.settlementStatus);
        }

        const result = await requestApi(`${API_BASE}/settlement_daily.php?${params}`);

        if (result.code === 0) {
          tableData.value = result.data.list;
          total.value = result.data.total;
          summary.value = result.data.summary || {};
        } else if (!result._http_error) {
          ElMessage.error(result.msg || '查询失败');
        }
      } catch (error) {
        console.error('查询失败:', error);
        ElMessage.error(error.message || '网络错误，请稍后重试');
      } finally {
        loading.value = false;
      }
    };

    const fetchDetailData = async (settlementDate) => {
      detailData.value = [];
      detailSummary.value = {};
      detailLoading.value = true;
      try {
        const params = new URLSearchParams({
          settlementDate: settlementDate,
        });

        const result = await requestApi(`${API_BASE}/settlement_detail.php?${params}`);

        if (result.code === 0) {
          detailData.value = result.data.list;
          detailSummary.value = result.data.summary || {};
        } else {
          detailData.value = [];
          detailSummary.value = {};
          if (!result._http_error) {
            ElMessage.error(result.msg || '查询明细失败');
          }
        }
      } catch (error) {
        detailData.value = [];
        detailSummary.value = {};
        console.error('查询明细失败:', error);
        ElMessage.error(error.message || '网络错误，请稍后重试');
      } finally {
        detailLoading.value = false;
      }
    };

    const handleExpandChange = async (row, expandedRows) => {
      const isExpanded = expandedRows.some(r => r.id === row.id);

      if (isExpanded) {
        currentExpandedDate.value = row.settlement_date;
        currentExpandedRow.value = row;
        expandRowKeys.value = [row.id];
        await fetchDetailData(row.settlement_date);
      } else {
        expandRowKeys.value = expandedRows.map(r => r.id);
        if (expandRowKeys.value.length === 0) {
          detailData.value = [];
          detailSummary.value = {};
          currentExpandedDate.value = '';
          currentExpandedRow.value = null;
        }
      }
    };

    const handleViewDetail = async (row) => {
      const isExpanded = expandRowKeys.value.includes(row.id);

      if (!isExpanded) {
        expandRowKeys.value = [row.id];
        currentExpandedDate.value = row.settlement_date;
        currentExpandedRow.value = row;
        await fetchDetailData(row.settlement_date);
      }
    };

    const handleSearch = () => {
      currentPage.value = 1;
      clearDetailCache();
      fetchDailyData();
    };

    const handleReset = () => {
      dateRange.value = [];
      filterForm.checkStatus = '';
      filterForm.settlementStatus = '';
      currentPage.value = 1;
      clearDetailCache();
      fetchDailyData();
    };

    const handleSizeChange = (size) => {
      pageSize.value = size;
      currentPage.value = 1;
      clearDetailCache();
      fetchDailyData();
    };

    const handleCurrentChange = (page) => {
      currentPage.value = page;
      clearDetailCache();
      fetchDailyData();
    };

    const handleCheck = (row, status) => {
      if (row.settlement_status === 1) {
        ElMessage.warning('该记录尚未结算，无法进行核对，请先完成结算');
        return;
      }

      checkRow.value = row;
      checkForm.check_status = status;
      checkForm.check_remark = '';
      forceRecheck.value = false;
      checkDialogVisible.value = true;

      nextTick(() => {
        if (checkFormRef.value) {
          checkFormRef.value.clearValidate();
        }
      });
    };

    const handleCheckStatusChange = (val) => {
      nextTick(() => {
        if (checkFormRef.value) {
          checkFormRef.value.clearValidate('check_remark');
          if (val === 2 && !checkForm.check_remark.trim()) {
            checkFormRef.value.validateField('check_remark');
          }
        }
      });
    };

    const resetCheckForm = () => {
      checkForm.check_status = 1;
      checkForm.check_remark = '';
      forceRecheck.value = false;
      if (checkFormRef.value) {
        checkFormRef.value.resetFields();
      }
    };

    const submitCheck = async () => {
      if (!checkFormRef.value) return;

      try {
        await checkFormRef.value.validate();
      } catch {
        ElMessage.warning('请完善核对信息后再提交');
        return;
      }

      checkLoading.value = true;
      try {
        const checkedId = checkRow.value.id;
        const checkedDate = checkRow.value.settlement_date;
        const isCurrentExpanded = currentExpandedRow.value && currentExpandedRow.value.id === checkedId;

        const requestBody = {
          id: checkedId,
          check_status: checkForm.check_status,
          check_remark: checkForm.check_remark,
        };
        if (forceRecheck.value) {
          requestBody.force_recheck = true;
        }

        let result;
        try {
          result = await requestApi(`${API_BASE}/settlement_check.php`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });
        } catch (err) {
          ElMessage.error(err.message || '请求失败，请稍后重试');
          return;
        }

        if (result._http_error) {
          return;
        }

        if (result.code === 0) {
          ElMessage.success('核对成功');
          checkDialogVisible.value = false;

          clearDetailCache();
          await fetchDailyData();
          await nextTick();

          const updatedRow = tableData.value.find(r => r.id === checkedId);
          if (updatedRow && isCurrentExpanded) {
            expandRowKeys.value = [checkedId];
            currentExpandedDate.value = checkedDate;
            currentExpandedRow.value = updatedRow;
            await nextTick();
            await fetchDetailData(checkedDate);
          }
        } else if (result.code === 1006 || result.code === 1007) {
          try {
            await ElMessageBox.confirm(
              result.msg,
              '确认操作',
              {
                confirmButtonText: '确认重新核对',
                cancelButtonText: '取消',
                type: 'warning',
              }
            );
            forceRecheck.value = true;
            checkLoading.value = false;
            await submitCheck();
            return;
          } catch {
            ElMessage.info('已取消重新核对');
          }
        } else if (result.code === 1005) {
          ElMessage.warning(result.msg);
        } else if (result.code === 1999 && result.data && result.data.rolled_back) {
          try {
            await ElMessageBox.confirm(
              result.msg + '\n\n建议：请检查数据后点击"重试"按钮重新提交',
              '提交失败（已自动回滚）',
              {
                confirmButtonText: '重试',
                cancelButtonText: '关闭',
                type: 'error',
                showClose: false,
              }
            );
            checkLoading.value = false;
            await submitCheck();
            return;
          } catch {
            ElMessage.info('已关闭错误提示');
          }
        } else {
          try {
            await ElMessageBox.confirm(
              (result.msg || '核对失败') + '\n\n是否重试？',
              '提交失败',
              {
                confirmButtonText: '重试',
                cancelButtonText: '关闭',
                type: 'error',
              }
            );
            checkLoading.value = false;
            await submitCheck();
            return;
          } catch {
            ElMessage.info('已关闭错误提示');
          }
        }
      } catch (error) {
        console.error('核对失败:', error);
        try {
          await ElMessageBox.confirm(
            '网络错误，请检查网络连接后点击"重试"按钮\n\n错误详情：' + (error.message || String(error)),
            '网络异常',
            {
              confirmButtonText: '重试',
              cancelButtonText: '关闭',
              type: 'error',
            }
          );
          checkLoading.value = false;
          await submitCheck();
          return;
        } catch {
          ElMessage.info('已关闭错误提示');
        }
      } finally {
        checkLoading.value = false;
      }
    };

    const handleExportDaily = () => {
      const params = new URLSearchParams({
        type: 'daily',
        format: 'excel',
      });
      if (dateRange.value && dateRange.value.length === 2) {
        params.append('startDate', dateRange.value[0]);
        params.append('endDate', dateRange.value[1]);
      }
      if (filterForm.checkStatus !== '') {
        params.append('checkStatus', filterForm.checkStatus);
      }

      window.open(`${API_BASE}/export.php?${params}`, '_blank');
      ElMessage.success('正在导出汇总报表...');
    };

    const handleExportDetail = () => {
      if (!currentExpandedDate.value) {
        ElMessage.warning('请先展开一条日结算记录查看明细');
        return;
      }

      const params = new URLSearchParams({
        type: 'detail',
        format: 'excel',
        settlementDate: currentExpandedDate.value,
      });

      window.open(`${API_BASE}/export.php?${params}`, '_blank');
      ElMessage.success('正在导出明细报表...');
    };

    const loadWithholdingStatusTypes = async () => {
      try {
        const result = await requestApi(`${API_BASE}/withholding_calculate.php?action=status_types`);
        if (result.code === 0) {
          withholdingStatusLabels.value = result.data.labels;
          withholdingTagTypes.value = result.data.tag_types;
        }
      } catch (error) {
        console.error('加载状态类型失败:', error);
      }
    };

    const fetchWithholdingList = async () => {
      withholdingLoading.value = true;
      try {
        const params = new URLSearchParams({
          page: withholdingPage.value,
          pageSize: withholdingPageSize.value,
        });
        if (withholdingFilter.formula_code) {
          params.append('formula_code', withholdingFilter.formula_code);
        }
        if (withholdingFilter.order_no) {
          params.append('order_no', withholdingFilter.order_no);
        }
        if (withholdingFilter.status !== '') {
          params.append('status', withholdingFilter.status);
        }

        const result = await requestApi(`${API_BASE}/withholding_calculate.php?${params}`);

        if (result.code === 0) {
          withholdingList.value = result.data.list;
          withholdingTotal.value = result.data.total;
          withholdingStatusStats.value = result.data.status_stats || {};
        } else if (!result._http_error) {
          ElMessage.error(result.msg || '查询失败');
        }
      } catch (error) {
        console.error('查询失败:', error);
        ElMessage.error(error.message || '网络错误，请稍后重试');
      } finally {
        withholdingLoading.value = false;
      }
    };

    const resetWithholdingFilter = () => {
      withholdingFilter.formula_code = '';
      withholdingFilter.order_no = '';
      withholdingFilter.status = '';
      withholdingPage.value = 1;
      fetchWithholdingList();
    };

    const handleWithholdingSizeChange = (size) => {
      withholdingPageSize.value = size;
      withholdingPage.value = 1;
      fetchWithholdingList();
    };

    const handleWithholdingPageChange = (page) => {
      withholdingPage.value = page;
      fetchWithholdingList();
    };

    const openWithholdingDetail = async (row) => {
      try {
        const result = await requestApi(`${API_BASE}/withholding_calculate.php?id=${row.id}`);
        if (result.code === 0) {
          currentWithholdingDetail.value = result.data;
          withholdingDetailVisible.value = true;
        } else if (!result._http_error) {
          ElMessage.error(result.msg || '查询详情失败');
        }
      } catch (error) {
        console.error('查询详情失败:', error);
        ElMessage.error(error.message || '网络错误，请稍后重试');
      }
    };

    const openWithholdingStatusDialog = (row) => {
      currentWithholdingRow.value = row;
      withholdingStatusForm.status = null;
      withholdingStatusForm.remark = '';
      withholdingStatusForm.operator = '';
      withholdingStatusDialogVisible.value = true;
      nextTick(() => {
        if (withholdingStatusFormRef.value) {
          withholdingStatusFormRef.value.clearValidate();
        }
      });
    };

    const resetWithholdingStatusForm = () => {
      withholdingStatusForm.status = null;
      withholdingStatusForm.remark = '';
      withholdingStatusForm.operator = '';
      if (withholdingStatusFormRef.value) {
        withholdingStatusFormRef.value.resetFields();
      }
    };

    const submitWithholdingStatus = async () => {
      if (!withholdingStatusFormRef.value) return;

      try {
        await withholdingStatusFormRef.value.validate();
      } catch {
        ElMessage.warning('请完善信息后再提交');
        return;
      }

      withholdingStatusLoading.value = true;
      try {
        const result = await requestApi(`${API_BASE}/withholding_calculate.php?id=${currentWithholdingRow.value.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'status',
            status: withholdingStatusForm.status,
            remark: withholdingStatusForm.remark,
            operator: withholdingStatusForm.operator,
          }),
        });

        if (result._http_error) {
          return;
        }

        if (result.code === 0) {
          ElMessage.success('状态变更成功');
          withholdingStatusDialogVisible.value = false;
          fetchWithholdingList();
          if (currentWithholdingDetail.value && currentWithholdingDetail.value.id === currentWithholdingRow.value.id) {
            openWithholdingDetail(currentWithholdingRow.value);
          }
        } else {
          ElMessage.error(result.msg || '状态变更失败');
        }
      } catch (error) {
        console.error('状态变更失败:', error);
        ElMessage.error(error.message || '网络错误，请稍后重试');
      } finally {
        withholdingStatusLoading.value = false;
      }
    };

    const openWithholdingRemark = (row) => {
      currentWithholdingRow.value = row;
      withholdingRemarkForm.remark = '';
      withholdingRemarkForm.operator = '';
      withholdingRemarkDialogVisible.value = true;
      nextTick(() => {
        if (withholdingRemarkFormRef.value) {
          withholdingRemarkFormRef.value.clearValidate();
        }
      });
    };

    const resetWithholdingRemarkForm = () => {
      withholdingRemarkForm.remark = '';
      withholdingRemarkForm.operator = '';
      if (withholdingRemarkFormRef.value) {
        withholdingRemarkFormRef.value.resetFields();
      }
    };

    const submitWithholdingRemark = async () => {
      if (!withholdingRemarkFormRef.value) return;

      try {
        await withholdingRemarkFormRef.value.validate();
      } catch {
        ElMessage.warning('请完善信息后再提交');
        return;
      }

      withholdingRemarkLoading.value = true;
      try {
        const result = await requestApi(`${API_BASE}/withholding_calculate.php?id=${currentWithholdingRow.value.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'remark',
            remark: withholdingRemarkForm.remark,
            operator: withholdingRemarkForm.operator,
          }),
        });

        if (result._http_error) {
          return;
        }

        if (result.code === 0) {
          ElMessage.success('备注添加成功');
          withholdingRemarkDialogVisible.value = false;
          fetchWithholdingList();
          if (currentWithholdingDetail.value && currentWithholdingDetail.value.id === currentWithholdingRow.value.id) {
            openWithholdingDetail(currentWithholdingRow.value);
          }
        } else {
          ElMessage.error(result.msg || '备注添加失败');
        }
      } catch (error) {
        console.error('备注添加失败:', error);
        ElMessage.error(error.message || '网络错误，请稍后重试');
      } finally {
        withholdingRemarkLoading.value = false;
      }
    };

    const openWithholdingCalc = async () => {
      try {
        const result = await requestApi(`${API_BASE}/withholding_calculate.php?action=list_formulas`);
        if (result.code === 0) {
          availableFormulas.value = result.data.list || [];
        }
      } catch (error) {
        console.error('加载公式列表失败:', error);
      }
      resetWithholdingCalcForm();
      withholdingCalcDialogVisible.value = true;
    };

    const resetWithholdingCalcForm = () => {
      withholdingCalcForm.formula_code = '';
      withholdingCalcForm.order_no = '';
      withholdingCalcForm.variables = {};
      withholdingCalcForm.initial_status = null;
      withholdingCalcForm.operator = '';
      withholdingCalcForm.remark = '';
      currentFormulaVariables.value = [];
      previewResult.value = null;
      if (withholdingCalcFormRef.value) {
        withholdingCalcFormRef.value.resetFields();
      }
    };

    const onFormulaChange = async (formulaCode) => {
      withholdingCalcForm.variables = {};
      previewResult.value = null;
      const formula = availableFormulas.value.find(f => f.formula_code === formulaCode);
      if (formula && formula.variables) {
        try {
          const vars = JSON.parse(formula.variables);
          if (Array.isArray(vars)) {
            currentFormulaVariables.value = vars;
            for (const varDef of vars) {
              if (varDef.default !== undefined) {
                withholdingCalcForm.variables[varDef.name] = varDef.default;
              }
            }
          } else {
            currentFormulaVariables.value = [];
          }
        } catch {
          currentFormulaVariables.value = [];
        }
      } else {
        currentFormulaVariables.value = [];
      }
    };

    const previewWithholdingCalc = async () => {
      if (!canPreview.value) {
        ElMessage.warning('请填写完整的变量值');
        return;
      }

      try {
        const result = await requestApi(`${API_BASE}/withholding_calculate.php`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'preview',
            formula_code: withholdingCalcForm.formula_code,
            variables: withholdingCalcForm.variables,
          }),
        });

        if (result._http_error) {
          return;
        }

        if (result.code === 0) {
          previewResult.value = result.data.result;
          ElMessage.success('预览成功');
        } else {
          ElMessage.error(result.msg || '预览失败');
        }
      } catch (error) {
        console.error('预览失败:', error);
        ElMessage.error(error.message || '网络错误，请稍后重试');
      }
    };

    const submitWithholdingCalc = async () => {
      if (!withholdingCalcFormRef.value) return;

      try {
        await withholdingCalcFormRef.value.validate();
      } catch {
        ElMessage.warning('请完善信息后再提交');
        return;
      }

      withholdingCalcLoading.value = true;
      try {
        const body = {
          action: 'calculate',
          formula_code: withholdingCalcForm.formula_code,
          variables: withholdingCalcForm.variables,
          order_no: withholdingCalcForm.order_no,
          operator: withholdingCalcForm.operator,
          remark: withholdingCalcForm.remark,
        };
        if (withholdingCalcForm.initial_status !== null) {
          body.initial_status = withholdingCalcForm.initial_status;
        }

        const result = await requestApi(`${API_BASE}/withholding_calculate.php`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        if (result._http_error) {
          return;
        }

        if (result.code === 0) {
          ElMessage.success('预扣计算成功');
          withholdingCalcDialogVisible.value = false;
          fetchWithholdingList();
        } else {
          ElMessage.error(result.msg || '计算失败');
        }
      } catch (error) {
        console.error('计算失败:', error);
        ElMessage.error(error.message || '网络错误，请稍后重试');
      } finally {
        withholdingCalcLoading.value = false;
      }
    };

    const loadFundStatusTypes = async () => {
      try {
        const result = await requestApi(`${API_BASE}/fund_flow.php?action=status_types`);
        if (result.code === 0) {
          fundStatusLabels.value = result.data.labels;
          fundTagTypes.value = result.data.tag_types;
          fundTypeLabels.value = result.data.type_labels;
          fundDirectionLabels.value = result.data.direction_labels;
        }
      } catch (error) {
        console.error('加载状态类型失败:', error);
      }
    };

    const fetchFundStats = async () => {
      try {
        const result = await requestApi(`${API_BASE}/fund_flow.php?action=stats`);
        if (result.code === 0) {
          fundStats.value = result.data;
          let total = 0;
          if (result.data.status_stats) {
            for (const key in result.data.status_stats) {
              total += result.data.status_stats[key];
            }
          }
          fundTotalCount.value = total;
        }
      } catch (error) {
        console.error('加载统计数据失败:', error);
      }
    };

    const fetchFundFlowList = async () => {
      fundLoading.value = true;
      try {
        const params = new URLSearchParams({
          page: fundPage.value,
          pageSize: fundPageSize.value,
        });
        if (fundFilter.status !== '') {
          params.append('status', fundFilter.status);
        }
        if (fundFilter.flow_type) {
          params.append('flow_type', fundFilter.flow_type);
        }
        if (fundFilter.direction !== '') {
          params.append('direction', fundFilter.direction);
        }
        if (fundFilter.keyword) {
          params.append('keyword', fundFilter.keyword);
        }
        if (fundFilter.min_amount !== '') {
          params.append('min_amount', fundFilter.min_amount);
        }
        if (fundFilter.max_amount !== '') {
          params.append('max_amount', fundFilter.max_amount);
        }
        if (fundDateRange.value && fundDateRange.value.length === 2) {
          params.append('start_date', fundDateRange.value[0]);
          params.append('end_date', fundDateRange.value[1]);
        }

        const result = await requestApi(`${API_BASE}/fund_flow.php?${params}`);

        if (result.code === 0) {
          fundFlowList.value = result.data.list;
          fundTotal.value = result.data.total;
        } else if (!result._http_error) {
          ElMessage.error(result.msg || '查询失败');
        }
      } catch (error) {
        console.error('查询失败:', error);
        ElMessage.error(error.message || '网络错误，请稍后重试');
      } finally {
        fundLoading.value = false;
      }
    };

    const resetFundFilter = () => {
      fundFilter.status = '';
      fundFilter.flow_type = '';
      fundFilter.direction = '';
      fundFilter.keyword = '';
      fundFilter.min_amount = '';
      fundFilter.max_amount = '';
      fundDateRange.value = [];
      fundPage.value = 1;
      fetchFundFlowList();
    };

    const handleFundSizeChange = (size) => {
      fundPageSize.value = size;
      fundPage.value = 1;
      fetchFundFlowList();
    };

    const handleFundPageChange = (page) => {
      fundPage.value = page;
      fetchFundFlowList();
    };

    const openFundDetail = async (row) => {
      try {
        const result = await requestApi(`${API_BASE}/fund_flow.php?id=${row.id}`);
        if (result.code === 0) {
          currentFundDetail.value = result.data;
          fundDetailVisible.value = true;
        } else if (!result._http_error) {
          ElMessage.error(result.msg || '查询详情失败');
        }
      } catch (error) {
        console.error('查询详情失败:', error);
        ElMessage.error(error.message || '网络错误，请稍后重试');
      }
    };

    const openFundStatusDialog = (row) => {
      currentFundRow.value = row;
      fundStatusForm.status = null;
      fundStatusForm.remark = '';
      fundStatusForm.operator = '';
      fundStatusDialogVisible.value = true;
      nextTick(() => {
        if (fundStatusFormRef.value) {
          fundStatusFormRef.value.clearValidate();
        }
      });
    };

    const resetFundStatusForm = () => {
      fundStatusForm.status = null;
      fundStatusForm.remark = '';
      fundStatusForm.operator = '';
      if (fundStatusFormRef.value) {
        fundStatusFormRef.value.resetFields();
      }
    };

    const submitFundStatus = async () => {
      if (!fundStatusFormRef.value) return;

      try {
        await fundStatusFormRef.value.validate();
      } catch {
        ElMessage.warning('请完善信息后再提交');
        return;
      }

      fundStatusLoading.value = true;
      try {
        const result = await requestApi(`${API_BASE}/fund_flow.php?id=${currentFundRow.value.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'status',
            status: fundStatusForm.status,
            remark: fundStatusForm.remark,
            operator: fundStatusForm.operator,
          }),
        });

        if (result._http_error) {
          return;
        }

        if (result.code === 0) {
          ElMessage.success('状态变更成功');
          fundStatusDialogVisible.value = false;
          fetchFundFlowList();
          fetchFundStats();
          if (currentFundDetail.value && currentFundDetail.value.id === currentFundRow.value.id) {
            openFundDetail(currentFundRow.value);
          }
        } else {
          ElMessage.error(result.msg || '状态变更失败');
        }
      } catch (error) {
        console.error('状态变更失败:', error);
        ElMessage.error(error.message || '网络错误，请稍后重试');
      } finally {
        fundStatusLoading.value = false;
      }
    };

    const openFundRemark = (row) => {
      currentFundRow.value = row;
      fundRemarkForm.remark = '';
      fundRemarkForm.operator = '';
      fundRemarkDialogVisible.value = true;
      nextTick(() => {
        if (fundRemarkFormRef.value) {
          fundRemarkFormRef.value.clearValidate();
        }
      });
    };

    const resetFundRemarkForm = () => {
      fundRemarkForm.remark = '';
      fundRemarkForm.operator = '';
      if (fundRemarkFormRef.value) {
        fundRemarkFormRef.value.resetFields();
      }
    };

    const submitFundRemark = async () => {
      if (!fundRemarkFormRef.value) return;

      try {
        await fundRemarkFormRef.value.validate();
      } catch {
        ElMessage.warning('请完善信息后再提交');
        return;
      }

      fundRemarkLoading.value = true;
      try {
        const result = await requestApi(`${API_BASE}/fund_flow.php?id=${currentFundRow.value.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'remark',
            remark: fundRemarkForm.remark,
            operator: fundRemarkForm.operator,
          }),
        });

        if (result._http_error) {
          return;
        }

        if (result.code === 0) {
          ElMessage.success('备注添加成功');
          fundRemarkDialogVisible.value = false;
          fetchFundFlowList();
          if (currentFundDetail.value && currentFundDetail.value.id === currentFundRow.value.id) {
            openFundDetail(currentFundRow.value);
          }
        } else {
          ElMessage.error(result.msg || '备注添加失败');
        }
      } catch (error) {
        console.error('备注添加失败:', error);
        ElMessage.error(error.message || '网络错误，请稍后重试');
      } finally {
        fundRemarkLoading.value = false;
      }
    };

    onMounted(() => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 29);

      dateRange.value = [
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0],
      ];

      fetchDailyData();
    });

    return {
      loading,
      detailLoading,
      checkLoading,
      checkDialogVisible,
      todayDate,
      activeTab,
      tableData,
      currentPage,
      pageSize,
      total,
      summary,
      dateRange,
      filterForm,
      expandRowKeys,
      detailData,
      detailSummary,
      currentExpandedDate,
      currentExpandedRow,
      checkForm,
      checkFormRef,
      checkFormRules,
      checkRow,
      forceRecheck,
      withholdingList,
      withholdingLoading,
      withholdingPage,
      withholdingPageSize,
      withholdingTotal,
      withholdingStatusLabels,
      withholdingTagTypes,
      withholdingStatusStats,
      withholdingFilter,
      withholdingDetailVisible,
      currentWithholdingDetail,
      withholdingStatusDialogVisible,
      withholdingStatusLoading,
      currentWithholdingRow,
      withholdingStatusForm,
      withholdingStatusFormRef,
      withholdingStatusRules,
      withholdingRemarkDialogVisible,
      withholdingRemarkLoading,
      withholdingRemarkForm,
      withholdingRemarkFormRef,
      withholdingRemarkRules,
      withholdingCalcDialogVisible,
      withholdingCalcLoading,
      availableFormulas,
      currentFormulaVariables,
      previewResult,
      canPreview,
      withholdingCalcForm,
      withholdingCalcFormRef,
      withholdingCalcRules,
      fundFlowList,
      fundLoading,
      fundPage,
      fundPageSize,
      fundTotal,
      fundTotalCount,
      fundStats,
      fundStatusLabels,
      fundTypeLabels,
      fundDirectionLabels,
      fundFilter,
      fundDateRange,
      fundDetailVisible,
      currentFundDetail,
      fundStatusDialogVisible,
      fundStatusLoading,
      currentFundRow,
      fundStatusForm,
      fundStatusFormRef,
      fundStatusRules,
      fundRemarkDialogVisible,
      fundRemarkLoading,
      fundRemarkForm,
      fundRemarkFormRef,
      fundRemarkRules,
      formatMoney,
      getCheckStatusName,
      getCheckStatusTag,
      getSettleStatusName,
      getSettleStatusTag,
      getStatusName,
      getStatusTag,
      getSettlementTypeName,
      getSettlementTypeTag,
      getWithholdingStatusTip,
      getFundStatusTip,
      getLogActionLabel,
      getLogTagType,
      getLogTimelineType,
      getVariableRule,
      handleTabChange,
      handleExpandChange,
      handleViewDetail,
      handleSearch,
      handleReset,
      handleSizeChange,
      handleCurrentChange,
      handleCheck,
      handleCheckStatusChange,
      resetCheckForm,
      submitCheck,
      handleExportDaily,
      handleExportDetail,
      fetchWithholdingList,
      resetWithholdingFilter,
      handleWithholdingSizeChange,
      handleWithholdingPageChange,
      openWithholdingDetail,
      openWithholdingStatusDialog,
      resetWithholdingStatusForm,
      submitWithholdingStatus,
      openWithholdingRemark,
      resetWithholdingRemarkForm,
      submitWithholdingRemark,
      openWithholdingCalc,
      resetWithholdingCalcForm,
      onFormulaChange,
      previewWithholdingCalc,
      submitWithholdingCalc,
      fetchFundFlowList,
      resetFundFilter,
      handleFundSizeChange,
      handleFundPageChange,
      openFundDetail,
      openFundStatusDialog,
      resetFundStatusForm,
      submitFundStatus,
      openFundRemark,
      resetFundRemarkForm,
      submitFundRemark,
      Search: ElementPlusIconsVue.Search,
      Refresh: ElementPlusIconsVue.Refresh,
      Download: ElementPlusIconsVue.Download,
      Plus: ElementPlusIconsVue.Plus,
      ArrowRight: ElementPlusIconsVue.ArrowRight,
      Document: ElementPlusIconsVue.Document,
      Tickets: ElementPlusIconsVue.Tickets,
      Wallet: ElementPlusIconsVue.Wallet,
      ShoppingCart: ElementPlusIconsVue.ShoppingCart,
      Money: ElementPlusIconsVue.Money,
      Top: ElementPlusIconsVue.Top,
      Bottom: ElementPlusIconsVue.Bottom,
      DataLine: ElementPlusIconsVue.DataLine,
    };
  },
});

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.use(ElementPlus);
app.mount('#app');
