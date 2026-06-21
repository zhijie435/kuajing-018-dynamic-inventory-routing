<?php
return new class {
    public function up(): array {
        return ["CREATE TABLE IF NOT EXISTS `fund_flows` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `flow_no` varchar(50) NOT NULL COMMENT '流水编号',
  `flow_type` varchar(50) NOT NULL COMMENT '流水类型:withholding-预扣 refund-退款 settlement-结算 adjust-调整',
  `direction` tinyint(1) NOT NULL COMMENT '资金方向:1-流入 2-流出',
  `amount` decimal(15,2) NOT NULL COMMENT '流水金额',
  `balance` decimal(15,2) NOT NULL DEFAULT '0.00' COMMENT '流水后账户余额',
  `currency` varchar(10) NOT NULL DEFAULT 'CNY' COMMENT '币种',
  `related_type` varchar(50) DEFAULT NULL COMMENT '关联业务类型',
  `related_id` int(11) DEFAULT NULL COMMENT '关联业务ID',
  `withholding_detail_id` int(11) DEFAULT NULL COMMENT '关联预扣明细ID',
  `order_no` varchar(100) DEFAULT NULL COMMENT '关联订单号',
  `operator` varchar(100) DEFAULT NULL COMMENT '操作人',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态:0-待处理 1-已完成 2-失败 3-已取消 4-已冲正',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_fund_flow_no` (`flow_no`),
  KEY `idx_fund_flow_type` (`flow_type`),
  KEY `idx_fund_direction` (`direction`),
  KEY `idx_fund_withholding` (`withholding_detail_id`),
  KEY `idx_fund_order_no` (`order_no`),
  KEY `idx_fund_related` (`related_type`,`related_id`),
  KEY `idx_fund_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='资金流水表';"];
    }
    public function down(): array { return ["DROP TABLE IF EXISTS `fund_flows`;"]; }
    public function batch(): int { return 1; }
    public function description(): string { return '创建资金流水表 fund_flows'; }
};
