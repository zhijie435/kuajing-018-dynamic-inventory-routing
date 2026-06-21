const FormulaView = {
  name: 'FormulaView',
  setup() {
    const { ref, reactive, computed, onMounted, watch, nextTick } = Vue;
    const { ElMessage, ElMessageBox, ElLoading } = ElementPlus;

    const API_BASE = 'api';

    const loading = ref(false);
    const saving = ref(false);
    const validating = ref(false);
    const dialogVisible = ref(false);
    const errorDialogVisible = ref(false);

    const tableData = ref([]);
    const currentPage = ref(1);
    const pageSize = ref(20);
    const total = ref(0);

    const searchForm = reactive({
      keyword: '',
      is_enabled: '',
    });

    const formRef = ref(null);
    const formMode = ref('create');
    const currentId = ref(null);

    const formData = reactive({
      formula_code: '',
      formula_name: '',
      formula: '',
      variables: [],
      description: '',
      sort_order: 0,
      is_enabled: 1,
    });

    const formErrors = ref([]);
    const validationResult = ref(null);
    const formulaChanged = ref(false);

    const canSave = computed(() => {
      if (saving.value || validating.value) return false;
      if (!formData.formula_code.trim()) return false;
      if (!formData.formula_name.trim()) return false;
      if (!formData.formula.trim()) return false;
      if (formErrors.value.length > 0) return false;
      return true;
    });

    const extractVariablesFromFormula = computed(() => {
      if (!formData.formula.trim()) return [];
      const pattern = /\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g;
      const matches = formData.formula.match(pattern) || [];
      const reserved = ['true', 'false', 'null', 'and', 'or', 'xor', 'not', 'if', 'else', 'elseif', 'while', 'for', 'foreach', 'return', 'break', 'continue', 'switch', 'case', 'default', 'function', 'class', 'new', 'instanceof', 'clone', 'throw', 'try', 'catch', 'finally', 'echo', 'print', 'isset', 'empty', 'count', 'sizeof', 'abs', 'round', 'ceil', 'floor', 'max', 'min', 'intval', 'floatval', 'strval', 'sqrt', 'pow', 'rand', 'mt_rand', 'date', 'time'];
      return [...new Set(matches.filter(m => !reserved.includes(m)))];
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

    const fetchData = async () => {
      loading.value = true;
      try {
        const params = new URLSearchParams({
          page: currentPage.value,
          pageSize: pageSize.value,
        });
        if (searchForm.keyword) params.append('keyword', searchForm.keyword);
        if (searchForm.is_enabled !== '') params.append('is_enabled', searchForm.is_enabled);

        const result = await requestApi(`${API_BASE}/withholding_formula.php?${params}`);
        if (result.code === 0) {
          tableData.value = result.data.list;
          total.value = result.data.total;
        } else {
          ElMessage.error(result.msg || '查询失败');
        }
      } catch (error) {
        console.error('查询失败:', error);
        ElMessage.error(error.message || '网络错误');
      } finally {
        loading.value = false;
      }
    };

    const validateFormula = async (showSuccess = false) => {
      if (!formData.formula.trim()) {
        formErrors.value = ['公式不能为空'];
        validationResult.value = null;
        return false;
      }

      validating.value = true;
      try {
        const result = await requestApi(`${API_BASE}/withholding_formula.php?action=validate&formula=${encodeURIComponent(formData.formula)}`);
        if (result.code === 0) {
          formErrors.value = [];
          validationResult.value = result.data;
          if (showSuccess) {
            ElMessage.success('公式校验通过');
          }
          return true;
        } else {
          const errors = result.data && result.data.errors ? result.data.errors : [result.msg || '校验失败'];
          formErrors.value = errors;
          validationResult.value = null;
          return false;
        }
      } catch (error) {
        formErrors.value = [error.message || '校验失败'];
        validationResult.value = null;
        return false;
      } finally {
        validating.value = false;
      }
    };

    const validateFull = async () => {
      validating.value = true;
      try {
        const result = await requestApi(`${API_BASE}/withholding_formula.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'validate',
            formula: formData.formula,
            variables: formData.variables,
          }),
        });
        if (result.code === 0) {
          formErrors.value = [];
          validationResult.value = result.data;
          return true;
        } else {
          const errors = result.data && result.data.errors ? result.data.errors : [result.msg || '校验失败'];
          formErrors.value = errors;
          return false;
        }
      } catch (error) {
        formErrors.value = [error.message || '校验失败'];
        return false;
      } finally {
        validating.value = false;
      }
    };

    const openCreate = () => {
      formMode.value = 'create';
      currentId.value = null;
      formData.formula_code = '';
      formData.formula_name = '';
      formData.formula = '';
      formData.variables = [];
      formData.description = '';
      formData.sort_order = 0;
      formData.is_enabled = 1;
      formErrors.value = [];
      validationResult.value = null;
      formulaChanged.value = false;
      dialogVisible.value = true;
    };

    const openEdit = async (row) => {
      loading.value = true;
      try {
        const result = await requestApi(`${API_BASE}/withholding_formula.php?id=${row.id}`);
        if (result.code === 0) {
          formMode.value = 'edit';
          currentId.value = row.id;
          formData.formula_code = result.data.formula_code;
          formData.formula_name = result.data.formula_name;
          formData.formula = result.data.formula;
          formData.variables = result.data.variables || [];
          formData.description = result.data.description || '';
          formData.sort_order = result.data.sort_order || 0;
          formData.is_enabled = result.data.is_enabled;
          formErrors.value = [];
          validationResult.value = result.data.validation || null;
          formulaChanged.value = false;
          dialogVisible.value = true;
        } else {
          ElMessage.error(result.msg || '获取详情失败');
        }
      } catch (error) {
        ElMessage.error(error.message || '网络错误');
      } finally {
        loading.value = false;
      }
    };

    const handleSave = async () => {
      if (!canSave.value) {
        const isValid = await validateFull();
        if (!isValid) {
          showErrors('请先修正以下错误', formErrors.value);
          return;
        }
      }

      const isFullValid = await validateFull();
      if (!isFullValid) {
        showErrors('请先修正以下错误', formErrors.value);
        return;
      }

      saving.value = true;
      try {
        let result;
        const body = {
          formula_code: formData.formula_code,
          formula_name: formData.formula_name,
          formula: formData.formula,
          variables: formData.variables,
          description: formData.description,
          sort_order: formData.sort_order,
          is_enabled: formData.is_enabled,
        };

        if (formMode.value === 'create') {
          result = await requestApi(`${API_BASE}/withholding_formula.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
        } else {
          result = await requestApi(`${API_BASE}/withholding_formula.php?id=${currentId.value}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
        }

        if (result.code === 0) {
          ElMessage.success(formMode.value === 'create' ? '创建成功' : '更新成功');
          dialogVisible.value = false;

          const savedData = result.data;
          if (formMode.value === 'create') {
            tableData.value.unshift(savedData);
            total.value++;
          } else {
            const idx = tableData.value.findIndex(item => item.id === currentId.value);
            if (idx !== -1) {
              tableData.value[idx] = savedData;
            }
          }
        } else {
          const errors = result.data && result.data.errors ? result.data.errors : [result.msg || '保存失败'];
          showErrors(result.msg || '保存失败', errors);
        }
      } catch (error) {
        ElMessage.error(error.message || '网络错误');
      } finally {
        saving.value = false;
      }
    };

    const handleDelete = async (row) => {
      try {
        await ElMessageBox.confirm(
          `确定要删除公式 "${row.formula_name}" 吗？删除后无法恢复。`,
          '确认删除',
          { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' }
        );
      } catch {
        return;
      }

      loading.value = true;
      try {
        const result = await requestApi(`${API_BASE}/withholding_formula.php?id=${row.id}`, {
          method: 'DELETE',
        });
        if (result.code === 0) {
          ElMessage.success('删除成功');
          tableData.value = tableData.value.filter(item => item.id !== row.id);
          total.value--;
        } else {
          const errors = result.data && result.data.errors ? result.data.errors : [];
          showErrors(result.msg || '删除失败', errors);
        }
      } catch (error) {
        ElMessage.error(error.message || '网络错误');
      } finally {
        loading.value = false;
      }
    };

    const handleToggle = async (row) => {
      const newStatus = row.is_enabled === 1 ? 0 : 1;
      const action = newStatus === 1 ? '启用' : '禁用';

      try {
        await ElMessageBox.confirm(
          `确定要${action}公式 "${row.formula_name}" 吗？`,
          '确认操作',
          { type: 'warning' }
        );
      } catch {
        return;
      }

      loading.value = true;
      try {
        const result = await requestApi(`${API_BASE}/withholding_formula.php?id=${row.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'toggle' }),
        });
        if (result.code === 0) {
          ElMessage.success(`${action}成功`);
          const idx = tableData.value.findIndex(item => item.id === row.id);
          if (idx !== -1) {
            tableData.value[idx] = result.data;
          }
        } else {
          const errors = result.data && result.data.errors ? result.data.errors : [];
          showErrors(result.msg || '操作失败', errors);
        }
      } catch (error) {
        ElMessage.error(error.message || '网络错误');
      } finally {
        loading.value = false;
      }
    };

    const addVariable = () => {
      formData.variables.push({
        name: '',
        label: '',
        default: '',
        required: true,
      });
    };

    const removeVariable = (index) => {
      formData.variables.splice(index, 1);
    };

    const syncVariables = () => {
      const existingNames = formData.variables.map(v => v.name);
      const formulaVars = extractVariablesFromFormula.value;

      formulaVars.forEach(varName => {
        if (!existingNames.includes(varName)) {
          formData.variables.push({
            name: varName,
            label: varName,
            default: '',
            required: true,
          });
        }
      });

      ElMessage.info(`已同步 ${formulaVars.length} 个变量`);
    };

    watch(() => formData.formula, () => {
      formulaChanged.value = true;
    });

    const handleSearch = () => {
      currentPage.value = 1;
      fetchData();
    };

    const handleReset = () => {
      searchForm.keyword = '';
      searchForm.is_enabled = '';
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

    onMounted(() => {
      fetchData();
    });

    return {
      loading,
      saving,
      validating,
      dialogVisible,
      errorDialogVisible,
      tableData,
      currentPage,
      pageSize,
      total,
      searchForm,
      formRef,
      formMode,
      formData,
      formErrors,
      validationResult,
      canSave,
      extractVariablesFromFormula,
      fetchData,
      validateFormula,
      validateFull,
      openCreate,
      openEdit,
      handleSave,
      handleDelete,
      handleToggle,
      addVariable,
      removeVariable,
      syncVariables,
      showErrors,
      hideErrors,
      handleSearch,
      handleReset,
      handleSizeChange,
      handleCurrentChange,
    };
  },

  template: `
    <div class="page-container">
      <div class="page-header">
        <h2 class="page-title">
          <el-icon><Calculator /></el-icon>
          预扣公式管理
        </h2>
        <p class="page-subtitle">管理预扣金额计算公式，支持实时校验和错误提示</p>
      </div>

      <div class="filter-section">
        <el-form :inline="true" :model="searchForm" class="filter-form">
          <el-form-item label="关键词">
            <el-input
              v-model="searchForm.keyword"
              placeholder="编码/名称/公式"
              clearable
              style="width: 240px;"
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.is_enabled" placeholder="全部" clearable style="width: 120px;">
              <el-option label="启用" :value="1"></el-option>
              <el-option label="禁用" :value="0"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch" :icon="ElementPlusIconsVue.Search">查询</el-button>
            <el-button @click="handleReset" :icon="ElementPlusIconsVue.Refresh">重置</el-button>
          </el-form-item>
          <el-form-item style="float: right;">
            <el-button type="success" @click="openCreate" :icon="ElementPlusIconsVue.Plus">新建公式</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="table-section">
        <el-table
          :data="tableData"
          style="width: 100%"
          v-loading="loading"
          border
        >
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="formula_code" label="公式编码" width="140" />
          <el-table-column prop="formula_name" label="公式名称" width="160" />
          <el-table-column prop="formula" label="公式表达式" min-width="240" show-overflow-tooltip>
            <template #default="{ row }">
              <code class="formula-badge">{{ row.formula }}</code>
            </template>
          </el-table-column>
          <el-table-column label="变量" width="180">
            <template #default="{ row }">
              <el-tag
                v-for="v in row.variables"
                :key="v.name"
                class="variable-tag"
                size="small"
                type="info"
              >
                {{ v.label || v.name }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="sort_order" label="排序" width="80" align="center" />
          <el-table-column label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.is_enabled === 1 ? 'success' : 'info'" size="small">
                {{ row.is_enabled === 1 ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="240" fixed="right" align="center">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="openEdit(row)">编辑</el-button>
              <el-button
                :type="row.is_enabled === 1 ? 'warning' : 'success'"
                link
                size="small"
                @click="handleToggle(row)"
              >
                {{ row.is_enabled === 1 ? '禁用' : '启用' }}
              </el-button>
              <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
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

      <el-dialog
        v-model="dialogVisible"
        :title="formMode === 'create' ? '新建公式' : '编辑公式'"
        width="720px"
        :close-on-click-modal="false"
        @closed="formErrors = []"
      >
        <el-alert
          v-if="formErrors.length > 0"
          :title="'发现 ' + formErrors.length + ' 处错误，请修正后再保存'"
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

        <el-form ref="formRef" :model="formData" label-width="100px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="公式编码" required>
                <el-input v-model="formData.formula_code" placeholder="如: service_fee" maxlength="50" show-word-limit />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="公式名称" required>
                <el-input v-model="formData.formula_name" placeholder="如: 服务费预扣" maxlength="100" show-word-limit />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="公式表达式" required>
            <el-input
              v-model="formData.formula"
              type="textarea"
              :rows="3"
              placeholder="如: order_amount * 0.05 + (service_fee > 10 ? 5 : 0)"
            />
            <div style="margin-top: 8px;">
              <el-button size="small" @click="validateFormula(true)" :loading="validating" :icon="ElementPlusIconsVue.CircleCheck">
                校验公式
              </el-button>
              <el-button size="small" @click="syncVariables" :icon="ElementPlusIconsVue.RefreshRight">
                同步变量
              </el-button>
              <span v-if="validationResult && validationResult.variables.length > 0" style="margin-left: 12px; color: #67c23a;">
                ✓ 提取变量: {{ validationResult.variables.join(', ') }}
              </span>
              <span v-if="formulaChanged" style="margin-left: 12px; color: #e6a23c;">
                ⚠ 公式已修改，请重新校验
              </span>
            </div>
          </el-form-item>

          <el-form-item label="变量配置">
            <div style="width: 100%;">
              <div v-for="(v, idx) in formData.variables" :key="idx" class="variable-row">
                <el-input
                  v-model="v.name"
                  placeholder="变量名"
                  style="width: 140px; margin-right: 8px;"
                />
                <el-input
                  v-model="v.label"
                  placeholder="显示名称"
                  style="width: 140px; margin-right: 8px;"
                />
                <el-input
                  v-model="v.default"
                  placeholder="默认值(选填)"
                  style="width: 120px; margin-right: 8px;"
                />
                <el-switch v-model="v.required" active-text="必填" style="margin-right: 8px;" />
                <el-button
                  type="danger"
                  size="small"
                  :icon="ElementPlusIconsVue.Delete"
                  @click="removeVariable(idx)"
                />
              </div>
              <el-button size="small" :icon="ElementPlusIconsVue.Plus" @click="addVariable" style="margin-top: 8px;">
                添加变量
              </el-button>
            </div>
          </el-form-item>

          <el-form-item label="描述">
            <el-input
              v-model="formData.description"
              type="textarea"
              :rows="2"
              placeholder="公式用途说明"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="排序">
                <el-input-number v-model="formData.sort_order" :min="0" style="width: 100%;" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="状态">
                <el-radio-group v-model="formData.is_enabled">
                  <el-radio :value="1">启用</el-radio>
                  <el-radio :value="0">禁用</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>

        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSave" :loading="saving" :disabled="!canSave">
            {{ formMode === 'create' ? '创建' : '保存' }}
          </el-button>
        </template>
      </el-dialog>

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
