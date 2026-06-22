const WarehouseRouting = {
  name: 'WarehouseRouting',
  template: `
<div class="warehouse-routing">
  <el-tabs v-model="activeSubTab" type="border-card">
    <el-tab-pane label="仓库管理" name="warehouses">
      <div class="toolbar">
        <el-button type="primary" @click="openWarehouseCreate">新增仓库</el-button>
        <el-button @click="fetchWarehouses">刷新</el-button>
      </div>
      <el-table :data="warehouses" border stripe v-loading="warehouseLoading" style="width:100%">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="warehouse_code" label="仓库编码" width="120" />
        <el-table-column prop="warehouse_name" label="仓库名称" width="150" />
        <el-table-column prop="warehouse_type" label="类型" width="100">
          <template #default="{row}">
            {{ row.warehouse_type === 1 ? '中心仓' : row.warehouse_type === 2 ? '分仓' : '其他' }}
          </template>
        </el-table-column>
        <el-table-column prop="province" label="省份" width="100" />
        <el-table-column prop="city" label="城市" width="100" />
        <el-table-column prop="address" label="地址" min-width="200" show-overflow-tooltip />
        <el-table-column prop="contact" label="联系人" width="100" />
        <el-table-column prop="phone" label="电话" width="130" />
        <el-table-column prop="is_default" label="默认" width="70" align="center">
          <template #default="{row}">
            <el-tag :type="row.is_default === 1 ? 'success' : 'info'" size="small">
              {{ row.is_default === 1 ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{row}">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="{row}">
            <el-button type="primary" link size="small" @click="openWarehouseEdit(row)">编辑</el-button>
            <el-button :type="row.status === 1 ? 'warning' : 'success'" link size="small" @click="toggleWarehouseStatus(row)">
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button type="danger" link size="small" @click="deleteWarehouse(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-tab-pane>

    <el-tab-pane label="分仓库存" name="inventories">
      <div class="toolbar">
        <el-select v-model="inventoryFilter.warehouse_code" placeholder="按仓库筛选" clearable style="width:200px;margin-right:10px" @change="fetchInventories">
          <el-option v-for="w in warehouses" :key="w.warehouse_code" :label="w.warehouse_name" :value="w.warehouse_code" />
        </el-select>
        <el-select v-model="inventoryFilter.goods_no" placeholder="按商品筛选" clearable style="width:200px;margin-right:10px" @change="fetchInventories">
          <el-option v-for="g in goodsOptions" :key="g.value" :label="g.label" :value="g.value" />
        </el-select>
        <el-button @click="fetchInventories">刷新</el-button>
      </div>
      <el-table :data="inventories" border stripe v-loading="inventoryLoading" style="width:100%">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="warehouse_code" label="仓库编码" width="120" />
        <el-table-column prop="warehouse_name" label="仓库名称" width="130" />
        <el-table-column prop="goods_no" label="商品编码" width="110" />
        <el-table-column prop="goods_name" label="商品名称" width="130" />
        <el-table-column prop="quantity" label="总库存" width="90" align="right" />
        <el-table-column prop="available_quantity" label="可用库存" width="90" align="right">
          <template #default="{row}">
            <span :style="{color: row.available_quantity <= row.warning_quantity ? '#f56c6c' : '#67c23a'}">
              {{ row.available_quantity }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="locked_quantity" label="锁定库存" width="90" align="right" />
        <el-table-column prop="warning_quantity" label="预警值" width="80" align="right" />
        <el-table-column label="库存状态" width="100" align="center">
          <template #default="{row}">
            <el-tag :type="row.available_quantity <= 0 ? 'danger' : row.available_quantity <= row.warning_quantity ? 'warning' : 'success'" size="small">
              {{ row.available_quantity <= 0 ? '缺货' : row.available_quantity <= row.warning_quantity ? '预警' : '正常' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right" align="center">
          <template #default="{row}">
            <el-button type="primary" link size="small" @click="openInventoryEdit(row)">调整</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-tab-pane>

    <el-tab-pane label="路由策略" name="strategies">
      <div class="toolbar">
        <el-button type="primary" @click="openStrategyCreate">新增策略</el-button>
        <el-button type="warning" @click="openRouteTest">路由模拟测试</el-button>
        <el-button @click="fetchStrategies">刷新</el-button>
      </div>
      <el-table :data="strategies" border stripe v-loading="strategyLoading" style="width:100%">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="strategy_code" label="策略编码" width="200" />
        <el-table-column prop="strategy_name" label="策略名称" width="150" />
        <el-table-column prop="strategy_type" label="策略类型" width="130">
          <template #default="{row}">
            <el-tag :type="strategyTypeTag[row.strategy_type]" size="small">
              {{ strategyTypeMap[row.strategy_type] || '未知' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="is_default" label="默认" width="70" align="center">
          <template #default="{row}">
            <el-tag :type="row.is_default === 1 ? 'success' : 'info'" size="small">
              {{ row.is_default === 1 ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort_order" label="排序" width="70" align="center" />
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{row}">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="{row}">
            <el-button type="primary" link size="small" @click="openStrategyEdit(row)">编辑</el-button>
            <el-button :type="row.status === 1 ? 'warning' : 'success'" link size="small" @click="toggleStrategyStatus(row)">
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button type="danger" link size="small" @click="deleteStrategy(row)" :disabled="row.is_default === 1">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-tab-pane>

    <el-tab-pane label="优先级规则" name="priority_rules">
      <div class="toolbar">
        <el-button type="primary" @click="openPriorityCreate">新增规则</el-button>
        <el-button @click="fetchPriorityRules">刷新</el-button>
      </div>
      <el-table :data="priorityRules" border stripe v-loading="priorityLoading" style="width:100%">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="rule_code" label="规则编码" width="200" />
        <el-table-column prop="rule_name" label="规则名称" width="160" />
        <el-table-column prop="rule_type" label="规则类型" width="130">
          <template #default="{row}">
            <el-tag :type="ruleTypeTag[row.rule_type]" size="small">
              {{ ruleTypeMap[row.rule_type] || '未知' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="priority_level" label="优先级" width="80" align="center" />
        <el-table-column prop="warehouse_code" label="关联仓库" width="110">
          <template #default="{row}">
            {{ row.warehouse_code || '全局' }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="sort_order" label="排序" width="70" align="center" />
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{row}">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="{row}">
            <el-button type="primary" link size="small" @click="openPriorityEdit(row)">编辑</el-button>
            <el-button :type="row.status === 1 ? 'warning' : 'success'" link size="small" @click="togglePriorityStatus(row)">
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button type="danger" link size="small" @click="deletePriorityRule(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-tab-pane>
  </el-tabs>

  <el-dialog v-model="warehouseDialogVisible" :title="warehouseFormMode === 'create' ? '新增仓库' : '编辑仓库'" width="650px" destroy-on-close>
    <el-form ref="warehouseFormRef" :model="warehouseFormData" :rules="warehouseFormRules" label-width="100px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="仓库编码" prop="warehouse_code">
            <el-input v-model="warehouseFormData.warehouse_code" :disabled="warehouseFormMode === 'edit'" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="仓库名称" prop="warehouse_name">
            <el-input v-model="warehouseFormData.warehouse_name" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="仓库类型" prop="warehouse_type">
            <el-select v-model="warehouseFormData.warehouse_type" style="width:100%">
              <el-option label="中心仓" :value="1" />
              <el-option label="分仓" :value="2" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="排序">
            <el-input-number v-model="warehouseFormData.sort_order" :min="0" style="width:100%" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="省份" prop="province">
            <el-input v-model="warehouseFormData.province" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="城市" prop="city">
            <el-input v-model="warehouseFormData.city" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="区县">
            <el-input v-model="warehouseFormData.district" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="详细地址" prop="address">
        <el-input v-model="warehouseFormData.address" />
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="联系人">
            <el-input v-model="warehouseFormData.contact" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="电话">
            <el-input v-model="warehouseFormData.phone" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="经度">
            <el-input-number v-model="warehouseFormData.longitude" :precision="4" :step="0.1" style="width:100%" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="纬度">
            <el-input-number v-model="warehouseFormData.latitude" :precision="4" :step="0.1" style="width:100%" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="默认仓库">
            <el-switch v-model="warehouseFormData.is_default" :active-value="1" :inactive-value="0" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="状态">
            <el-switch v-model="warehouseFormData.status" :active-value="1" :inactive-value="0" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="warehouseDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitWarehouseForm" :loading="warehouseSubmitting">保存</el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="inventoryDialogVisible" title="调整库存" width="500px" destroy-on-close>
    <el-form :model="inventoryFormData" label-width="100px">
      <el-form-item label="仓库">
        <el-input :model-value="inventoryFormData.warehouse_name" disabled />
      </el-form-item>
      <el-form-item label="商品">
        <el-input :model-value="inventoryFormData.goods_name" disabled />
      </el-form-item>
      <el-form-item label="当前库存">
        <el-input :model-value="inventoryFormData.quantity" disabled />
      </el-form-item>
      <el-form-item label="可用库存">
        <el-input :model-value="inventoryFormData.available_quantity" disabled />
      </el-form-item>
      <el-form-item label="调整后库存">
        <el-input-number v-model="inventoryFormData.quantity" :min="0" style="width:100%" />
      </el-form-item>
      <el-form-item label="调整后可用">
        <el-input-number v-model="inventoryFormData.available_quantity" :min="0" style="width:100%" />
      </el-form-item>
      <el-form-item label="预警值">
        <el-input-number v-model="inventoryFormData.warning_quantity" :min="0" style="width:100%" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="inventoryDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitInventoryForm">保存</el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="strategyDialogVisible" :title="strategyFormMode === 'create' ? '新增策略' : '编辑策略'" width="600px" destroy-on-close>
    <el-form ref="strategyFormRef" :model="strategyFormData" :rules="strategyFormRules" label-width="100px">
      <el-form-item label="策略编码" prop="strategy_code">
        <el-input v-model="strategyFormData.strategy_code" :disabled="strategyFormMode === 'edit'" />
      </el-form-item>
      <el-form-item label="策略名称" prop="strategy_name">
        <el-input v-model="strategyFormData.strategy_name" />
      </el-form-item>
      <el-form-item label="策略类型" prop="strategy_type">
        <el-select v-model="strategyFormData.strategy_type" style="width:100%">
          <el-option label="优先级策略" :value="1" />
          <el-option label="就近策略" :value="2" />
          <el-option label="库存优先策略" :value="3" />
          <el-option label="综合加权策略" :value="4" />
        </el-select>
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="strategyFormData.description" type="textarea" :rows="2" />
      </el-form-item>
      <el-form-item label="规则配置">
        <el-input v-model="strategyFormData.rules_config" type="textarea" :rows="4" placeholder="JSON格式" />
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="默认策略">
            <el-switch v-model="strategyFormData.is_default" :active-value="1" :inactive-value="0" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="排序">
            <el-input-number v-model="strategyFormData.sort_order" :min="0" style="width:100%" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="状态">
            <el-switch v-model="strategyFormData.status" :active-value="1" :inactive-value="0" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="strategyDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitStrategyForm" :loading="strategySubmitting">保存</el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="priorityDialogVisible" :title="priorityFormMode === 'create' ? '新增规则' : '编辑规则'" width="650px" destroy-on-close>
    <el-form ref="priorityFormRef" :model="priorityFormData" :rules="priorityFormRules" label-width="100px">
      <el-form-item label="规则编码" prop="rule_code">
        <el-input v-model="priorityFormData.rule_code" :disabled="priorityFormMode === 'edit'" />
      </el-form-item>
      <el-form-item label="规则名称" prop="rule_name">
        <el-input v-model="priorityFormData.rule_name" />
      </el-form-item>
      <el-form-item label="规则类型" prop="rule_type">
        <el-select v-model="priorityFormData.rule_type" style="width:100%">
          <el-option label="区域优先" :value="1" />
          <el-option label="商品优先" :value="2" />
          <el-option label="客户等级优先" :value="3" />
          <el-option label="活动优先" :value="4" />
          <el-option label="全局通用" :value="5" />
        </el-select>
      </el-form-item>
      <el-form-item label="关联仓库">
        <el-select v-model="priorityFormData.warehouse_id" clearable placeholder="全局规则可留空" style="width:100%" @change="onPriorityWarehouseChange">
          <el-option v-for="w in warehouses" :key="w.id" :label="w.warehouse_name" :value="w.id" />
        </el-select>
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="优先级">
            <el-input-number v-model="priorityFormData.priority_level" :min="1" :max="999" style="width:100%" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="排序">
            <el-input-number v-model="priorityFormData.sort_order" :min="0" style="width:100%" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="状态">
            <el-switch v-model="priorityFormData.status" :active-value="1" :inactive-value="0" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="规则条件">
        <el-input v-model="priorityFormData.rule_condition" type="textarea" :rows="3" placeholder="JSON格式，如: {\\"regions\\":[\\"上海市\\"]}" />
      </el-form-item>
      <el-form-item label="规则动作">
        <el-input v-model="priorityFormData.rule_action" type="textarea" :rows="3" placeholder="JSON格式，如: {\\"set_as_first\\":true}" />
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="priorityFormData.description" type="textarea" :rows="2" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="priorityDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitPriorityForm" :loading="prioritySubmitting">保存</el-button>
    </template>
  </el-dialog>

  <el-drawer v-model="routeTestVisible" title="路由模拟测试" size="55%" destroy-on-close>
    <div class="route-test-panel">
      <div class="test-form-section">
        <h4>模拟参数</h4>
        <el-form :model="routeTestParams" label-width="100px" size="default">
          <el-form-item label="路由策略">
            <el-select v-model="routeTestParams.strategy_id" placeholder="默认策略" clearable style="width:100%">
              <el-option v-for="s in strategies" :key="s.id" :label="s.strategy_name" :value="s.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="收货省份">
            <el-select v-model="routeTestParams.province" filterable allow-create placeholder="选择或输入省份" style="width:100%">
              <el-option v-for="p in provinceOptions" :key="p" :label="p" :value="p" />
            </el-select>
          </el-form-item>
          <el-form-item label="收货城市">
            <el-input v-model="routeTestParams.city" placeholder="如：上海市" />
          </el-form-item>
          <el-form-item label="客户等级">
            <el-select v-model="routeTestParams.customer_level" placeholder="普通用户" clearable style="width:100%">
              <el-option label="VIP1" value="VIP1" />
              <el-option label="VIP2" value="VIP2" />
              <el-option label="VIP3" value="VIP3" />
            </el-select>
          </el-form-item>
          <el-form-item label="活动标签">
            <el-select v-model="routeTestParams.promotion_tag" placeholder="无活动" clearable style="width:100%">
              <el-option label="618" value="618" />
              <el-option label="双11" value="double11" />
            </el-select>
          </el-form-item>
          <el-divider content-position="left">商品列表</el-divider>
          <div v-for="(item, idx) in routeTestParams.goods_list" :key="idx" style="margin-bottom:10px">
            <el-row :gutter="10">
              <el-col :span="10">
                <el-select v-model="item.goods_no" placeholder="选择商品" style="width:100%">
                  <el-option v-for="g in goodsOptions" :key="g.value" :label="g.label" :value="g.value" />
                </el-select>
              </el-col>
              <el-col :span="8">
                <el-input-number v-model="item.quantity" :min="1" :max="9999" style="width:100%" />
              </el-col>
              <el-col :span="6">
                <el-button type="danger" link @click="routeTestParams.goods_list.splice(idx, 1)">移除</el-button>
              </el-col>
            </el-row>
          </div>
          <el-button type="primary" link @click="routeTestParams.goods_list.push({goods_no: '', quantity: 1})">+ 添加商品</el-button>
          <el-form-item style="margin-top:20px">
            <el-button type="primary" @click="runRouteTest" :loading="routeTestLoading" size="large">执行路由计算</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="test-result-section" v-if="routeTestResult">
        <el-divider content-position="left">计算结果</el-divider>
        <div class="result-summary">
          <el-row :gutter="16">
            <el-col :span="8">
              <el-statistic title="使用策略" :value="routeTestResult.strategy?.strategy_name || '默认'" />
            </el-col>
            <el-col :span="8">
              <el-statistic title="商品数" :value="routeTestResult.total_goods" />
            </el-col>
            <el-col :span="8">
              <el-statistic title="满足数">
                <template #default>
                  <span :style="{color: routeTestResult.all_fulfilled ? '#67c23a' : '#f56c6c'}">
                    {{ routeTestResult.fulfilled_goods }} / {{ routeTestResult.total_goods }}
                  </span>
                </template>
              </el-statistic>
            </el-col>
          </el-row>
        </div>

        <div v-for="(goodsResult, idx) in routeTestResult.results" :key="idx" class="goods-routing-card">
          <div class="goods-routing-header">
            <span class="goods-name">{{ goodsResult.goods_name }}</span>
            <span class="goods-qty">需求: {{ goodsResult.quantity }}件</span>
            <span class="goods-available">可用: {{ goodsResult.total_available }}件</span>
            <el-tag :type="goodsResult.allocated ? 'success' : 'danger'" size="small">
              {{ goodsResult.allocated ? '已满足' : '库存不足' }}
            </el-tag>
          </div>

          <el-table :data="goodsResult.allocations" border size="small" v-if="goodsResult.allocations.length">
            <el-table-column prop="warehouse_name" label="仓库" />
            <el-table-column prop="allocate_quantity" label="分配数量" width="100" align="center" />
            <el-table-column prop="available_quantity" label="仓库可用" width="100" align="center" />
            <el-table-column prop="distance" label="距离(km)" width="100" align="center">
              <template #default="{row}">
                {{ row.distance !== null ? row.distance : '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="score" label="评分" width="80" align="center">
              <template #default="{row}">
                {{ Math.round(row.score) }}
              </template>
            </el-table-column>
          </el-table>

          <div class="switch-log" v-if="goodsResult.switch_log && goodsResult.switch_log.length">
            <div class="log-title">路由切换日志</div>
            <div v-for="(log, logIdx) in goodsResult.switch_log" :key="logIdx"
                 :class="['log-item', 'log-' + log.type]">
              <span class="log-icon">
                {{ log.type === 'allocate' ? '\u2713' : log.type === 'switch' ? '\u21BB' : log.type === 'skip' ? '-' : '!' }}
              </span>
              <span>{{ log.message }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-drawer>
</div>
`,
  setup() {
    const { ref, reactive, computed, onMounted } = Vue;
    const { ElMessage, ElMessageBox } = ElementPlus;

    const activeSubTab = ref('warehouses');

    const warehouseLoading = ref(false);
    const warehouses = ref([]);
    const warehouseDialogVisible = ref(false);
    const warehouseFormRef = ref(null);
    const warehouseFormMode = ref('create');
    const warehouseSubmitting = ref(false);
    const warehouseFormData = reactive({
      id: null, warehouse_code: '', warehouse_name: '', warehouse_type: 1,
      province: '', city: '', district: '', address: '', contact: '', phone: '',
      longitude: 0, latitude: 0, is_default: 0, sort_order: 0, status: 1,
    });
    const warehouseFormRules = {
      warehouse_code: [{ required: true, message: '请输入仓库编码', trigger: 'blur' }],
      warehouse_name: [{ required: true, message: '请输入仓库名称', trigger: 'blur' }],
      province: [{ required: true, message: '请输入省份', trigger: 'blur' }],
      city: [{ required: true, message: '请输入城市', trigger: 'blur' }],
    };

    const inventoryLoading = ref(false);
    const inventories = ref([]);
    const inventoryDialogVisible = ref(false);
    const inventoryFormData = reactive({
      id: null, warehouse_id: null, warehouse_code: '', warehouse_name: '',
      goods_no: '', goods_name: '', quantity: 0, available_quantity: 0,
      locked_quantity: 0, warning_quantity: 0,
    });
    const inventoryFilter = reactive({ warehouse_code: '', goods_no: '' });

    const strategyLoading = ref(false);
    const strategies = ref([]);
    const strategyDialogVisible = ref(false);
    const strategyFormRef = ref(null);
    const strategyFormMode = ref('create');
    const strategySubmitting = ref(false);
    const strategyFormData = reactive({
      id: null, strategy_code: '', strategy_name: '', strategy_type: 1,
      description: '', rules_config: '{}', is_default: 0, sort_order: 0, status: 1,
    });
    const strategyFormRules = {
      strategy_code: [{ required: true, message: '请输入策略编码', trigger: 'blur' }],
      strategy_name: [{ required: true, message: '请输入策略名称', trigger: 'blur' }],
      strategy_type: [{ required: true, message: '请选择策略类型', trigger: 'change' }],
    };

    const priorityLoading = ref(false);
    const priorityRules = ref([]);
    const priorityDialogVisible = ref(false);
    const priorityFormRef = ref(null);
    const priorityFormMode = ref('create');
    const prioritySubmitting = ref(false);
    const priorityFormData = reactive({
      id: null, rule_code: '', rule_name: '', warehouse_id: null, warehouse_code: null,
      priority_level: 50, rule_type: 1, rule_condition: '{}', rule_action: '{}',
      description: '', sort_order: 0, status: 1,
    });
    const priorityFormRules = {
      rule_code: [{ required: true, message: '请输入规则编码', trigger: 'blur' }],
      rule_name: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
      rule_type: [{ required: true, message: '请选择规则类型', trigger: 'change' }],
    };

    const routeTestVisible = ref(false);
    const routeTestLoading = ref(false);
    const routeTestResult = ref(null);
    const routeTestParams = reactive({
      strategy_id: null, province: '', city: '',
      customer_level: '', promotion_tag: '',
      goods_list: [{ goods_no: 'SP001', quantity: 100 }],
    });

    const strategyTypeMap = { 1: '优先级策略', 2: '就近策略', 3: '库存优先', 4: '综合加权' };
    const strategyTypeTag = { 1: '', 2: 'success', 3: 'warning', 4: 'danger' };
    const ruleTypeMap = { 1: '区域优先', 2: '商品优先', 3: '客户等级', 4: '活动优先', 5: '全局通用' };
    const ruleTypeTag = { 1: '', 2: 'success', 3: 'warning', 4: 'danger', 5: 'info' };

    const goodsOptions = computed(() => {
      const map = {};
      inventories.value.forEach(inv => {
        if (!map[inv.goods_no]) {
          map[inv.goods_no] = { value: inv.goods_no, label: `${inv.goods_no} - ${inv.goods_name}` };
        }
      });
      return Object.values(map);
    });

    const provinceOptions = [
      '上海市', '北京市', '广东省', '四川省', '湖北省', '浙江省', '江苏省',
      '福建省', '山东省', '河南省', '湖南省', '安徽省', '河北省', '天津市',
      '重庆市', '云南省', '贵州省', '广西省', '海南省', '江西省',
    ];

    const requestApi = async (path, options = {}) => {
      const baseUrl = '/api';
      const resp = await fetch(baseUrl + path, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
      });
      if (!resp.ok) {
        throw new Error(`服务器响应异常（HTTP ${resp.status}）`);
      }
      const data = await resp.json();
      if (data.code !== 0) {
        throw new Error(data.msg || '操作失败');
      }
      return data.data;
    };

    const fetchWarehouses = async () => {
      warehouseLoading.value = true;
      try {
        const data = await requestApi('/warehouses');
        warehouses.value = data || [];
      } catch (e) {
        ElMessage.error(e.message);
      } finally {
        warehouseLoading.value = false;
      }
    };

    const fetchInventories = async () => {
      inventoryLoading.value = true;
      try {
        const params = new URLSearchParams();
        if (inventoryFilter.warehouse_code) params.set('warehouse_code', inventoryFilter.warehouse_code);
        if (inventoryFilter.goods_no) params.set('goods_no', inventoryFilter.goods_no);
        const qs = params.toString();
        const data = await requestApi('/inventories' + (qs ? '?' + qs : ''));
        inventories.value = data || [];
      } catch (e) {
        ElMessage.error(e.message);
      } finally {
        inventoryLoading.value = false;
      }
    };

    const fetchStrategies = async () => {
      strategyLoading.value = true;
      try {
        const data = await requestApi('/strategies');
        strategies.value = data || [];
      } catch (e) {
        ElMessage.error(e.message);
      } finally {
        strategyLoading.value = false;
      }
    };

    const fetchPriorityRules = async () => {
      priorityLoading.value = true;
      try {
        const data = await requestApi('/priority-rules');
        priorityRules.value = data || [];
      } catch (e) {
        ElMessage.error(e.message);
      } finally {
        priorityLoading.value = false;
      }
    };

    const resetWarehouseForm = () => {
      Object.assign(warehouseFormData, {
        id: null, warehouse_code: '', warehouse_name: '', warehouse_type: 1,
        province: '', city: '', district: '', address: '', contact: '', phone: '',
        longitude: 0, latitude: 0, is_default: 0, sort_order: 0, status: 1,
      });
    };

    const openWarehouseCreate = () => {
      resetWarehouseForm();
      warehouseFormMode.value = 'create';
      warehouseDialogVisible.value = true;
    };

    const openWarehouseEdit = (row) => {
      Object.assign(warehouseFormData, { ...row });
      warehouseFormMode.value = 'edit';
      warehouseDialogVisible.value = true;
    };

    const submitWarehouseForm = async () => {
      if (!warehouseFormRef.value) return;
      try {
        await warehouseFormRef.value.validate();
      } catch (e) {
        ElMessage.warning('请检查表单填写是否完整');
        return;
      }
      warehouseSubmitting.value = true;
      try {
        const data = { ...warehouseFormData };
        if (warehouseFormMode.value === 'edit' && !data.id) {
          data.id = warehouseFormData.id;
        }
        await requestApi('/warehouses', {
          method: 'POST',
          body: JSON.stringify(data),
        });
        ElMessage.success(warehouseFormMode.value === 'create' ? '创建成功' : '编辑成功');
        warehouseDialogVisible.value = false;
        await fetchWarehouses();
      } catch (e) {
        ElMessage.error(e.message);
      } finally {
        warehouseSubmitting.value = false;
      }
    };

    const toggleWarehouseStatus = async (row) => {
      const newStatus = row.status === 1 ? 0 : 1;
      try {
        await requestApi('/warehouses', {
          method: 'POST',
          body: JSON.stringify({ id: row.id, status: newStatus }),
        });
        ElMessage.success('状态更新成功');
        await fetchWarehouses();
      } catch (e) {
        ElMessage.error(e.message);
      }
    };

    const deleteWarehouse = async (row) => {
      try {
        await ElMessageBox.confirm(`确定要删除仓库 "${row.warehouse_name}" 吗？`, '确认删除', { type: 'warning' });
        await requestApi(`/warehouses/${row.id}`, { method: 'DELETE' });
        ElMessage.success('删除成功');
        await fetchWarehouses();
      } catch (e) {
        if (e !== 'cancel') {
          ElMessage.error(e.message || '删除失败');
        }
      }
    };

    const openInventoryEdit = (row) => {
      Object.assign(inventoryFormData, { ...row });
      inventoryDialogVisible.value = true;
    };

    const submitInventoryForm = async () => {
      try {
        const data = { ...inventoryFormData };
        await requestApi('/inventories', {
          method: 'POST',
          body: JSON.stringify(data),
        });
        ElMessage.success('保存成功');
        inventoryDialogVisible.value = false;
        await fetchInventories();
      } catch (e) {
        ElMessage.error(e.message);
      }
    };

    const resetStrategyForm = () => {
      Object.assign(strategyFormData, {
        id: null, strategy_code: '', strategy_name: '', strategy_type: 1,
        description: '', rules_config: '{}', is_default: 0, sort_order: 0, status: 1,
      });
    };

    const openStrategyCreate = () => {
      resetStrategyForm();
      strategyFormMode.value = 'create';
      strategyDialogVisible.value = true;
    };

    const openStrategyEdit = (row) => {
      Object.assign(strategyFormData, { ...row });
      strategyFormMode.value = 'edit';
      strategyDialogVisible.value = true;
    };

    const submitStrategyForm = async () => {
      if (!strategyFormRef.value) return;
      try {
        await strategyFormRef.value.validate();
      } catch (e) {
        ElMessage.warning('请检查表单填写是否完整');
        return;
      }

      const data = { ...strategyFormData };
      if (typeof data.rules_config === 'string') {
        try { JSON.parse(data.rules_config); } catch (e) {
          ElMessage.error('规则配置JSON格式不正确，请检查');
          return;
        }
      }

      strategySubmitting.value = true;
      try {
        await requestApi('/strategies', {
          method: 'POST',
          body: JSON.stringify(data),
        });
        ElMessage.success(strategyFormMode.value === 'create' ? '创建成功' : '编辑成功');
        strategyDialogVisible.value = false;
        await fetchStrategies();
      } catch (e) {
        ElMessage.error(e.message);
      } finally {
        strategySubmitting.value = false;
      }
    };

    const toggleStrategyStatus = async (row) => {
      const newStatus = row.status === 1 ? 0 : 1;
      try {
        await requestApi('/strategies', {
          method: 'POST',
          body: JSON.stringify({ id: row.id, status: newStatus }),
        });
        ElMessage.success('状态更新成功');
        await fetchStrategies();
      } catch (e) {
        ElMessage.error(e.message);
      }
    };

    const deleteStrategy = async (row) => {
      try {
        await ElMessageBox.confirm(`确定要删除策略 "${row.strategy_name}" 吗？`, '确认删除', { type: 'warning' });
        await requestApi(`/strategies/${row.id}`, { method: 'DELETE' });
        ElMessage.success('删除成功');
        await fetchStrategies();
      } catch (e) {
        if (e !== 'cancel') {
          ElMessage.error(e.message || '删除失败');
        }
      }
    };

    const resetPriorityForm = () => {
      Object.assign(priorityFormData, {
        id: null, rule_code: '', rule_name: '', warehouse_id: null, warehouse_code: null,
        priority_level: 50, rule_type: 1, rule_condition: '{}', rule_action: '{}',
        description: '', sort_order: 0, status: 1,
      });
    };

    const openPriorityCreate = () => {
      resetPriorityForm();
      priorityFormMode.value = 'create';
      priorityDialogVisible.value = true;
    };

    const openPriorityEdit = (row) => {
      Object.assign(priorityFormData, { ...row });
      priorityFormMode.value = 'edit';
      priorityDialogVisible.value = true;
    };

    const onPriorityWarehouseChange = (val) => {
      const w = warehouses.value.find(w => w.id === val);
      priorityFormData.warehouse_code = w ? w.warehouse_code : null;
    };

    const submitPriorityForm = async () => {
      if (!priorityFormRef.value) return;
      try {
        await priorityFormRef.value.validate();
      } catch (e) {
        ElMessage.warning('请检查表单填写是否完整');
        return;
      }

      const data = { ...priorityFormData };
      if (typeof data.rule_condition === 'string') {
        try { JSON.parse(data.rule_condition); } catch (e) {
          ElMessage.error('规则条件JSON格式不正确，请检查');
          return;
        }
      }
      if (typeof data.rule_action === 'string') {
        try { JSON.parse(data.rule_action); } catch (e) {
          ElMessage.error('规则动作JSON格式不正确，请检查');
          return;
        }
      }

      prioritySubmitting.value = true;
      try {
        await requestApi('/priority-rules', {
          method: 'POST',
          body: JSON.stringify(data),
        });
        ElMessage.success(priorityFormMode.value === 'create' ? '创建成功' : '编辑成功');
        priorityDialogVisible.value = false;
        await fetchPriorityRules();
      } catch (e) {
        ElMessage.error(e.message);
      } finally {
        prioritySubmitting.value = false;
      }
    };

    const togglePriorityStatus = async (row) => {
      const newStatus = row.status === 1 ? 0 : 1;
      try {
        await requestApi('/priority-rules', {
          method: 'POST',
          body: JSON.stringify({ id: row.id, status: newStatus }),
        });
        ElMessage.success('状态更新成功');
        await fetchPriorityRules();
      } catch (e) {
        ElMessage.error(e.message);
      }
    };

    const deletePriorityRule = async (row) => {
      try {
        await ElMessageBox.confirm(`确定要删除规则 "${row.rule_name}" 吗？`, '确认删除', { type: 'warning' });
        await requestApi(`/priority-rules/${row.id}`, { method: 'DELETE' });
        ElMessage.success('删除成功');
        await fetchPriorityRules();
      } catch (e) {
        if (e !== 'cancel') {
          ElMessage.error(e.message || '删除失败');
        }
      }
    };

    const openRouteTest = () => {
      routeTestResult.value = null;
      routeTestVisible.value = true;
    };

    const runRouteTest = async () => {
      if (!routeTestParams.goods_list.length || !routeTestParams.goods_list.some(g => g.goods_no)) {
        ElMessage.warning('请至少添加一个商品');
        return;
      }
      routeTestLoading.value = true;
      try {
        const params = {
          strategy_id: routeTestParams.strategy_id,
          province: routeTestParams.province,
          city: routeTestParams.city,
          customer_level: routeTestParams.customer_level,
          promotion_tag: routeTestParams.promotion_tag,
          goods_list: routeTestParams.goods_list.filter(g => g.goods_no),
        };
        const data = await requestApi('/route/calculate', {
          method: 'POST',
          body: JSON.stringify(params),
        });
        routeTestResult.value = data;
        ElMessage.success('路由计算完成');
      } catch (e) {
        ElMessage.error(e.message);
      } finally {
        routeTestLoading.value = false;
      }
    };

    onMounted(() => {
      fetchWarehouses();
      fetchInventories();
      fetchStrategies();
      fetchPriorityRules();
    });

    return {
      activeSubTab,

      warehouseLoading, warehouses,
      warehouseDialogVisible, warehouseFormRef, warehouseFormMode, warehouseSubmitting,
      warehouseFormData, warehouseFormRules,
      openWarehouseCreate, openWarehouseEdit,
      submitWarehouseForm, deleteWarehouse, toggleWarehouseStatus,

      inventoryLoading, inventories,
      inventoryDialogVisible, inventoryFormData,
      inventoryFilter, goodsOptions,
      openInventoryEdit, submitInventoryForm,

      strategyLoading, strategies,
      strategyDialogVisible, strategyFormRef, strategyFormMode, strategySubmitting,
      strategyFormData, strategyFormRules,
      openStrategyCreate, openStrategyEdit,
      submitStrategyForm, deleteStrategy, toggleStrategyStatus,

      priorityLoading, priorityRules,
      priorityDialogVisible, priorityFormRef, priorityFormMode, prioritySubmitting,
      priorityFormData, priorityFormRules,
      openPriorityCreate, openPriorityEdit,
      submitPriorityForm, deletePriorityRule, togglePriorityStatus,
      onPriorityWarehouseChange,

      routeTestVisible, routeTestLoading, routeTestResult, routeTestParams,
      openRouteTest, runRouteTest,

      strategyTypeMap, strategyTypeTag,
      ruleTypeMap, ruleTypeTag,
      provinceOptions,
    };
  }
};
