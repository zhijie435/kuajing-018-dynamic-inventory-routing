const WithholdingView = {
  name: 'WithholdingView',
  setup() {
    const { ref, reactive, computed, onMounted, watch, nextTick } = Vue;
    const { ElMessage, ElMessageBox, ElLoading } = ElementPlus;

    const API_BASE = 'api';

    const loading = ref(false);
    const calculating = ref(false);
    const previewing = ref(false);
    const detailVisible = ref(false);
    const errorDialogVisible = ref(false);
    const drawerVisible = ref(false);

    const tableData = ref([]);
    const currentPage = ref(1);
    const pageSize = ref(20);
    const total = ref(0);
    const statusStats = ref({});

    const searchForm = reactive({
      formula_id: '',
      formula_code: '',
      order_no: '',
      status: '',
    });

    const formulaList = ref([]);
    const selectedFormula = ref(null);

    const calculateForm = reactive({
      formula_code: '',
      variables: {},
      order_no: '',
      operator: 'system',
      remark: '',
    });

    const previewResult = ref(null);
    const formErrors = ref([]);
    const currentDetail = ref(null);

    const statusTypes = ref({ labels: {}, tag_types: {} });

    const canCalculate = computed(() => {
      if (calculating.value || previewing.value) return false;
      if (!calculateForm.formula_code) return false;
      if (!selectedFormula.value) return false;
      if (formErrors.value.length > 0) return false;
      return true;
    });

    const canPreview = computed(() => {
      if (previewing.value || calculating.value) return false;
      if (!calculateForm.formula_code) return false;
      if (!selectedFormula.value) return false;
      return true;
    });

    const requiredVariables = computed(() => {
      if (!selectedFormula.value || !selectedFormula.value.variables) return [];
      return selectedFormula.value.variables.filter(v => v.required !== false);
    });

    const requestApi = async (url, options = {}) => {
      const response = await fetch(url, options);
      if (!response.ok) {
        try {
          const errResult = await response.json();
          if (errResult.data && errResult.data.errors) {
            return errResult;
          }
          throw new Error(errResult.msg || `HTTP ${response.status}`);
        } catch (e) {
          throw new Error(`服务器响应异常（HTTP ${response.status}）`);
        }
      }
      return await response.json();
    };

    const showErrors = (msg, errors) => {
      formErrors.value = Array.isArray(errors) ? errors : [];
      errorDialogVisible.value = true;
      ElMessage.error(msg || '校验失败');
    };

    const hideErrors = () => {
      formErrors.value = [];
      errorDialogVisible.value = false;
    };

    const fetchFormulaList = async () => {
      try {
        const result = await requestApi(`${API_BASE}/withholding_formula.php?action=enabled_list`);
        if (result.code === 0) {
          formulaList.value = result.data.list || [];
        }
      } catch (error) {
        console.error('获取公式列表失败:', error);
      }
    };

    const fetchStatusTypes = async () => {
      try {
        const result = await requestApi(`${API_BASE}/withholding_calculate.php?action=status_types`);
        if (result.code === 0) {
          statusTypes.value = result.data;
        }
      } catch (error) {
        console.error('获取状态类型失败:', error);
      }
    };

    const fetchData = async () => {
      loading.value = true;
      try {
        const params = new URLSearchParams({
          page: currentPage.value,
          pageSize: pageSize.value,
        });
        if (searchForm.formula_id) params.append('formula_id', searchForm.formula_id);
        if (searchForm.formula_code) params.append('formula_code', searchForm.formula_code);
        if (searchForm.order_no) params.append('order_no', searchForm.order_no);
        if (searchForm.status !== '') params.append('status', searchForm.status);

        const result = await requestApi(`${API_BASE}/withholding_calculate.php?${params}`);
        if (result.code === 0) {
          tableData.value = result.data.list;
          total.value = result.data.total;
          statusStats.value = result.data.status_stats || {};
        } else {
          const errors = result.data && result.data.errors ? result.data.errors : [];
          showErrors(result.msg || '查询失败', errors);
        }
      } catch (error) {
        console.error('查询失败:', error);
        ElMessage.error(error.message || '网络错误');
      } finally {
        loading.value = false;
      }
    };

    const fetchDetail = async (id) => {
      loading.value = true;
      try {
        const result = await requestApi(`${API_BASE}/withholding_calculate.php?id=${id}`);
        if (result.code === 0) {
          currentDetail.value = result.data;
          drawerVisible.value = true;
        } else {
          const errors = result.data && result.data.errors ? result.data.errors : [];
          showErrors(result.msg || '获取详情失败', errors);
        }
      } catch (error) {
        ElMessage.error(error.message || '网络错误');
      } finally {
        loading.value = false;
      }
    };

    const handleFormulaChange = (formulaCode) => {
      const formula = formulaList.value.find(f => f.formula_code === formulaCode);
      selectedFormula.value = formula || null;
      calculateForm.variables = {};
      previewResult.value = null;
      formErrors.value = [];

      if (formula && formula.variables) {
        formula.variables.forEach(v => {
          if (v.default !== undefined && v.default !== null && v.default !== '') {
            calculateForm.variables[v.name] = v.default;
          }
        });
      }
    };

    const validateVariables = () => {
      const errors = [];

      if (!selectedFormula.value) {
        errors.push('请先选择计算公式');
        return errors;
      }

      const variables = selectedFormula.value.variables || [];
      variables.forEach(v => {
        const value = calculateForm.variables[v.name];
        if (v.required !== false) {
          if (value === undefined || value === null || value === '') {
            if (v.default === undefined || v.default === null || v.default === '') {
              errors.push(`变量 '${v.label || v.name}' 的值不能为空`);
            }
          } else if (isNaN(Number(value))) {
            errors.push(`变量 '${v.label || v.name}' 的值必须是数字`);
          }
        } else if (value !== '' && value !== null && value !== undefined) {
          if (isNaN(Number(value))) {
            errors.push(`变量 '${v.label || v.name}' 的值必须是数字`);
          }
        }
      });

      return errors;
    };

    const handlePreview = async () => {
      const localErrors = validateVariables();
      if (localErrors.length > 0) {
        showErrors('参数校验失败', localErrors);
        return;
      }

      previewing.value = true;
      formErrors.value = [];
      try {
        const result = await requestApi(`${API_BASE}/withholding_calculate.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'preview',
            formula_code: calculateForm.formula_code,
            variables: calculateForm.variables,
          }),
        });

        if (result.code === 0) {
          previewResult.value = result.data;
          ElMessage.success('预览成功');
        } else {
          const errors = result.data && result.data.errors ? result.data.errors : [result.msg || '预览失败'];
          showErrors(result.msg || '预览失败', errors);
        }
      } catch (error) {
        showErrors('预览失败', [error.message || '网络错误']);
      } finally {
        previewing.value = false;
      }
    };

    const handleCalculate = async () => {
      const localErrors = validateVariables();
      if (localErrors.length > 0) {
        showErrors('参数校验失败', localErrors);
        return;
      }

      calculating.value = true;
      formErrors.value = [];
      try {
        const result = await requestApi(`${API_BASE}/withholding_calculate.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'calculate',
            formula_code: calculateForm.formula_code,
            variables: calculateForm.variables,
            order_no: calculateForm.order_no,
            operator: calculateForm.operator,
            remark: calculateForm.remark,
          }),
        });

        if (result.code === 0) {
          ElMessage.success('计算成功');
          previewResult.value = result.data;
          fetchData();
        } else {
          const errors = result.data && result.data.errors ? result.data.errors : [result.msg || '计算失败'];
          showErrors(result.msg || '计算失败', errors);
        }
      } catch (error) {
        showErrors('计算失败', [error.message || '网络错误']);
      } finally {
        calculating.value = false;
      }
    };

    const handleStatusChange = async (row, newStatus) => {
      const oldLabel = statusTypes.value.labels[row.status] || '未知';
      const newLabel = statusTypes.value.labels[newStatus] || '未知';

      try {
        await ElMessageBox.confirm(
          `确定要将状态从 [${oldLabel}] 变更为 [${newLabel}] 吗？`,
          '确认操作',
          { type: 'warning' }
        );
      } catch {
        return;
      }

      loading.value = true;
      try {
        const result = await requestApi(`${API_BASE}/withholding_calculate.php?id=${row.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'status',
            status: newStatus,
            operator: calculateForm.operator,
          }),
        });

        if (result.code === 0) {
          ElMessage.success('状态更新成功');
          const idx = tableData.value.findIndex(item => item.id === row.id);
          if (idx !== -1) {
            tableData.value[idx] = result.data;
          }
          if (currentDetail.value && currentDetail.value.id === row.id) {
            currentDetail.value = result.data;
          }
        } else {
          const errors = result.data && result.data.errors ? result.data.errors : [];
          showErrors(result.msg || '状态更新失败', errors);
        }
      } catch (error) {
        ElMessage.error(error.message || '网络错误');
      } finally {
        loading.value = false;
      }
    };

    const handleBatchCalculate = async () => {
      detailVisible.value = true;
    };

    const resetForm = () => {
      calculateForm.formula_code = '';
      calculateForm.variables = {};
      calculateForm.order_no = '';
      calculateForm.remark = '';
      selectedFormula.value = null;
      previewResult.value = null;
      formErrors.value = [];
    };

    const handleSearch = () => {
      currentPage.value = 1;
      fetchData();
    };

    const handleReset = () => {
      searchForm.formula_id = '';
      searchForm.formula_code = '';
      searchForm.order_no = '';
      searchForm.status = '';
      currentPage.value = 1;
      fetchData();
    };

    const handleSizeChange = (size) => {
      pageSize.value = size;
      currentPage.value = 1;
      fetchData();
    };

    const handleCurrentChange = (page) => {
      currentPage.value = page;
      fetchData();
    };

    const formatMoney = (value) => {
      if (!value && value !== 0) return '0.00';
      return Number(value).toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    };

    onMounted(() => {
      fetchFormulaList();
      fetchStatusTypes();
      fetchData();
    });

    return {
      loading,
      calculating,
      previewing,
      detailVisible,
      errorDialogVisible,
      drawerVisible,
      tableData,
      currentPage,
      pageSize,
      total,
      statusStats,
      searchForm,
      formulaList,
      selectedFormula,
      calculateForm,
      previewResult,
      formErrors,
      currentDetail,
      statusTypes,
      canCalculate,
      canPreview,
      requiredVariables,
      fetchData,
      fetchDetail,
      handleFormulaChange,
      validateVariables,
      handlePreview,
      handleCalculate,
      handleStatusChange,
      handleBatchCalculate,
      resetForm,
      showErrors,
      hideErrors,
      handleSearch,
      handleReset,
      handleSizeChange,
      handleCurrentChange,
      formatMoney,
    };
  },

  template: `
    <div class="page-container">
      <div class="page-header">
        <h2 class="page-title">
          <el-icon><Money /></el-icon>
          预扣计算明细
        </h2>
        <p class="page-subtitle">执行预扣金额计算，查看计算结果和明细</p>
      </div>

      <el-row :gutter="20">
        <el-col :span="8">
          <div class="table-section">
            <h3 class="section-title">
              <el-icon><Edit /></el-icon>
              执行计算
            </h3>

            <el-form :model="calculateForm" label-width="100px">
              <el-form-item label="计算公式" required>
                <el-select
                  v-model="calculateForm.formula_code"
                  placeholder="请选择计算公式"
                  style="width: 100%;"
                  @change="handleFormulaChange"
                >
                  <el-option
                    v-for="f in formulaList"
                    :key="f.formula_code"
                    :label="f.formula_name + ' (' + f.formula_code + ')'"
                    :value="f.formula_code"
                  >
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <span>{{ f.formula_name }}</span>
                      <el-tag size="small" type="info">{{ f.formula_code }}</el-tag>
                    </div>
                  </el-option>
                </el-select>
              </el-form-item>

              <el-form-item v-if="selectedFormula" label="公式说明">
                <code class="formula-badge" style="display: block; padding: 8px;">{{ selectedFormula.formula }}</code>
              </el-form-item>

              <el-form-item v-if="selectedFormula && selectedFormula.description" label="描述">
                <span style="color: #606266;">{{ selectedFormula.description }}</span>
              </el-form-item>

              <el-form-item label="变量输入" v-if="selectedFormula">
                <div style="width: 100%;">
                  <div
                    v-for="v in selectedFormula.variables"
                    :key="v.name"
                    class="variable-row"
                    style="margin-bottom: 12px;"
                  >
                    <label style="width: 140px; display: inline-block; text-align: right; padding-right: 12px;">
                      {{ v.label || v.name }}
                      <span v-if="v.required !== false" style="color: #f56c6c;">*</span>
                    </label>
                    <el-input
                      v-model="calculateForm.variables[v.name]"
                      :placeholder="'请输入' + (v.label || v.name)"
                      style="width: calc(100% - 152px);"
                      :type="v.default !== undefined && v.default !== null ? 'number' : 'text'"
                    >
                      <template #append>
                        <span v-if="v.default !== undefined && v.default !== null" style="color: #909399; font-size: 12px;">
                          默认: {{ v.default }}
                        </span>
                      </template>
                    </el-input>
                  </div>
                </div>
              </el-form-item>

              <el-form-item label="订单编号">
                <el-input v-model="calculateForm.order_no" placeholder="选填，关联订单号" />
              </el-form-item>

              <el-form-item label="操作人">
                <el-input v-model="calculateForm.operator" placeholder="操作人标识" />
              </el-form-item>

              <el-form-item label="备注">
                <el-input
                  v-model="calculateForm.remark"
                  type="textarea"
                  :rows="2"
                  placeholder="选填，备注说明"
                />
              </el-form-item>

              <el-alert
                v-if="formErrors.length > 0"
                :title="'发现 ' + formErrors.length + ' 处错误'"
                type="error"
                show-icon
                :closable="false"
                style="margin-bottom: 16px;"
              >
                <template #default>
                  <div style="margin-top: 8px;">
                    <div v-for="(err, idx) in formErrors" :key="idx" style="font-size: 13px; line-height: 1.8;">
                      {{ idx + 1 }}. {{ err }}
                    </div>
                  </div>
                </template>
              </el-alert>

              <el-form-item>
                <el-button type="primary" @click="handlePreview" :loading="previewing" :disabled="!canPreview" :icon="ElementPlusIconsVue.View">
                  预览计算
                </el-button>
                <el-button type="success" @click="handleCalculate" :loading="calculating" :disabled="!canCalculate" :icon="ElementPlusIconsVue.Check">
                  执行计算
                </el-button>
                <el-button @click="resetForm" :icon="ElementPlusIconsVue.Refresh">
                  重置
                </el-button>
              </el-form-item>
            </el-form>

            <el-alert
              v-if="previewResult"
              title="计算结果"
              type="success"
              show-icon
              :closable="false"
            >
              <template #default>
                <div style="margin-top: 8px;">
                  <div style="font-size: 24px; font-weight: bold; color: #67c23a; margin-bottom: 8px;">
                    ¥ {{ formatMoney(previewResult.result) }}
                  </div>
                  <div style="font-size: 13px; color: #606266;">
                    <div style="margin-bottom: 4px;">公式: <code>{{ previewResult.formula }}</code></div>
                    <div>变量: 
                      <el-tag
                        v-for="(value, key) in previewResult.variables"
                        :key="key"
                        size="small"
                        style="margin-right: 4px;"
                      >
                        {{ key }} = {{ value }}
                      </el-tag>
                    </div>
                  </div>
                  <div v-if="previewResult.detail_id" style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e1e3e8;">
                    <el-tag type="success" size="small">✓ 已记录</el-tag>
                    <span style="margin-left: 8px; color: #909399;">明细ID: {{ previewResult.detail_id }}</span>
                  </div>
                </div>
              </template>
            </el-alert>
          </div>
        </el-col>

        <el-col :span="16">
          <div class="filter-section">
            <el-form :inline="true" :model="searchForm" class="filter-form">
              <el-form-item label="公式编码">
                <el-select v-model="searchForm.formula_id" placeholder="全部" clearable style="width: 160px;">
                  <el-option
                    v-for="f in formulaList"
                    :key="f.id"
                    :label="f.formula_name"
                    :value="f.id"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="订单号">
                <el-input v-model="searchForm.order_no" placeholder="订单编号" clearable style="width: 160px;" />
              </el-form-item>
              <el-form-item label="状态">
                <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 120px;">
                  <el-option
                    v-for="(label, value) in statusTypes.labels"
                    :key="value"
                    :label="label"
                    :value="value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSearch" :icon="ElementPlusIconsVue.Search">查询</el-button>
                <el-button @click="handleReset" :icon="ElementPlusIconsVue.Refresh">重置</el-button>
              </el-form-item>
            </el-form>

            <div class="status-bar">
              <el-tag
                v-for="(count, status) in statusStats"
                :key="status"
                :type="statusTypes.tag_types[status] || 'info'"
                style="margin-right: 12px;"
              >
                {{ statusTypes.labels[status] || status }}: {{ count }}
              </el-tag>
            </div>
          </div>

          <div class="table-section">
            <h3 class="section-title">
              <el-icon><List /></el-icon>
              计算明细
            </h3>

            <el-table
              :data="tableData"
              style="width: 100%"
              v-loading="loading"
              border
              size="small"
            >
              <el-table-column type="index" label="序号" width="60" align="center" />
              <el-table-column prop="id" label="ID" width="80" align="center" />
              <el-table-column prop="formula_code" label="公式编码" width="120" />
              <el-table-column prop="formula_name" label="公式名称" width="140" />
              <el-table-column prop="result" label="预扣金额" width="120" align="right">
                <template #default="{ row }">
                  <span style="color: #f56c6c; font-weight: bold;">¥ {{ formatMoney(row.result) }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="order_no" label="订单编号" width="140" show-overflow-tooltip />
              <el-table-column prop="operator" label="操作人" width="100" />
              <el-table-column label="状态" width="100" align="center">
                <template #default="{ row }">
                  <el-tag :type="row.status_tag_type || 'info'" size="small">
                    {{ row.status_label }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="created_at" label="创建时间" width="160" align="center" />
              <el-table-column label="操作" width="180" fixed="right" align="center">
                <template #default="{ row }">
                  <el-button type="primary" link size="small" @click="fetchDetail(row.id)">
                    详情
                  </el-button>
                  <el-dropdown
                    v-if="row.valid_transitions && row.valid_transitions.length > 0"
                    @command="(status) => handleStatusChange(row, status)"
                  >
                    <el-button type="warning" link size="small">
                      变更状态<el-icon><ArrowDown /></el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item
                          v-for="status in row.valid_transitions"
                          :key="status"
                          :command="status"
                        >
                          变更为: {{ statusTypes.labels[status] || status }}
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </template>
              </el-table-column>
            </el-table>

            <div class="pagination">
              <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :page-sizes="[10, 20, 50, 100]"
                :total="total"
                layout="total, sizes, prev, pager, next, jumper"
                background
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
          </div>
        </el-col>
      </el-row>

      <el-drawer
        v-model="drawerVisible"
        title="预扣明细详情"
        direction="rtl"
        size="600px"
      >
        <div v-if="currentDetail">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="ID">{{ currentDetail.id }}</el-descriptions-item>
            <el-descriptions-item label="公式编码">{{ currentDetail.formula_code }}</el-descriptions-item>
            <el-descriptions-item label="公式名称">{{ currentDetail.formula_name }}</el-descriptions-item>
            <el-descriptions-item label="预扣金额">
              <span style="color: #f56c6c; font-weight: bold;">¥ {{ formatMoney(currentDetail.result) }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="公式表达式" :span="2">
              <code class="formula-badge">{{ currentDetail.formula }}</code>
            </el-descriptions-item>
            <el-descriptions-item label="订单编号">{{ currentDetail.order_no || '-' }}</el-descriptions-item>
            <el-descriptions-item label="操作人">{{ currentDetail.operator }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="currentDetail.status_tag_type" size="small">
                {{ currentDetail.status_label }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ currentDetail.created_at }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ currentDetail.updated_at }}</el-descriptions-item>
            <el-descriptions-item label="变量配置" :span="2">
              <el-tag
                v-for="(value, key) in currentDetail.variables"
                :key="key"
                class="variable-tag"
                size="small"
                type="info"
              >
                {{ key }} = {{ value }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="备注" :span="2">
              {{ currentDetail.remark || '-' }}
            </el-descriptions-item>
          </el-descriptions>

          <h4 style="margin: 20px 0 12px;">
            <el-icon><Wallet /></el-icon>
            关联资金流水
          </h4>
          <el-table
            v-if="currentDetail.fund_flows && currentDetail.fund_flows.length > 0"
            :data="currentDetail.fund_flows"
            size="small"
            border
          >
            <el-table-column prop="flow_no" label="流水号" width="180" />
            <el-table-column prop="type_label" label="类型" width="100" align="center" />
            <el-table-column prop="direction_label" label="方向" width="80" align="center" />
            <el-table-column prop="amount" label="金额" width="100" align="right">
              <template #default="{ row }">
                <span :style="{ color: row.direction === 1 ? '#67c23a' : '#f56c6c', fontWeight: 'bold' }">
                  {{ row.direction === 1 ? '+' : '-' }}¥ {{ formatMoney(row.amount) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="balance" label="余额" width="120" align="right">
              <template #default="{ row }">¥ {{ formatMoney(row.balance) }}</template>
            </el-table-column>
            <el-table-column label="状态" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="row.status_tag_type" size="small">{{ row.status_label }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="created_at" label="创建时间" width="160" align="center" />
          </el-table>
          <el-empty v-else description="暂无关联资金流水" />

          <h4 style="margin: 20px 0 12px;">
            <el-icon><Document /></el-icon>
            操作日志
          </h4>
          <el-table
            v-if="currentDetail.operation_logs && currentDetail.operation_logs.length > 0"
            :data="currentDetail.operation_logs"
            size="small"
            border
          >
            <el-table-column prop="action_label" label="操作" width="100" />
            <el-table-column prop="username" label="操作人" width="100" />
            <el-table-column prop="ip_address" label="IP" width="120" />
            <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
            <el-table-column prop="created_at" label="时间" width="160" align="center" />
          </el-table>
          <el-empty v-else description="暂无操作日志" />
        </div>
      </el-drawer>

      <el-dialog
        v-model="errorDialogVisible"
        title="错误详情"
        width="560px"
        type="error"
      >
        <el-alert type="error" :title="'共 ' + formErrors.length + ' 处错误'" show-icon :closable="false" />
        <div style="margin-top: 16px; max-height: 300px; overflow-y: auto;">
          <div
            v-for="(err, idx) in formErrors"
            :key="idx"
            style="padding: 10px 12px; border-left: 3px solid #f56c6c; background: #fef0f0; margin-bottom: 8px; border-radius: 0 4px 4px 0;"
          >
            <b style="color: #f56c6c;">{{ idx + 1 }}.</b> {{ err }}
          </div>
        </div>
        <template #footer>
          <el-button type="primary" @click="hideErrors">我知道了</el-button>
        </template>
      </el-dialog>
    </div>
  `,
};
