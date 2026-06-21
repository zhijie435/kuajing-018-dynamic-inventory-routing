<?php
return new class {
    public function up(): array {
        return ["CREATE TABLE IF NOT EXISTS `withholding_details` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `formula_id` int(11) NOT NULL COMMENT '公式ID',
  `formula_code` varchar(100) NOT NULL COMMENT '公式编码',
  `formula_name` varchar(200) NOT NULL COMMENT '公式名称',
  `formula` text NOT NULL COMMENT '公式快照',
  `variables` text NOT NULL COMMENT '变量值快照(JSON)',
  `result` decimal(15,2) NOT NULL COMMENT '计算结果(预扣金额)',
  `order_no` varchar(100) DEFAULT NULL COMMENT '关联订单号',
  `related_type` varchar(50) DEFAULT NULL COMMENT '关联业务类型',
  `related_id` int(11) DEFAULT NULL COMMENT '关联业务ID',
  `operator` varchar(100) DEFAULT NULL COMMENT '操作人',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态:0-待处理 1-已完成 2-失败 3-已取消 4-已冲正 5-已结算',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_withholding_formula_id` (`formula_id`),
  KEY `idx_withholding_formula_code` (`formula_code`),
  KEY `idx_withholding_order_no` (`order_no`),
  KEY `idx_withholding_related` (`related_type`,`related_id`),
  KEY `idx_withholding_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='预扣明细表';"];
    }
    public function down(): array { return ["DROP TABLE IF EXISTS `withholding_details`;"]; }
    public function batch(): int { return 1; }
    public function description(): string { return '创建预扣明细表 withholding_details'; }
};
