<?php
return new class {
    public function up(): array {
        return ["CREATE TABLE IF NOT EXISTS `settlement_daily` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `settlement_date` date NOT NULL COMMENT '结算日期',
  `order_count` int(11) NOT NULL DEFAULT '0' COMMENT '订单数量',
  `goods_count` int(11) NOT NULL DEFAULT '0' COMMENT '商品数量',
  `total_order_amount` decimal(12,2) NOT NULL DEFAULT '0.00' COMMENT '订单总金额',
  `total_discount_amount` decimal(12,2) NOT NULL DEFAULT '0.00' COMMENT '优惠总金额',
  `total_settlement_amount` decimal(12,2) NOT NULL DEFAULT '0.00' COMMENT '结算总金额',
  `total_commission_fee` decimal(12,2) NOT NULL DEFAULT '0.00' COMMENT '手续费总金额',
  `total_net_amount` decimal(12,2) NOT NULL DEFAULT '0.00' COMMENT '净收入总额',
  `refund_count` int(11) NOT NULL DEFAULT '0' COMMENT '退款笔数',
  `refund_amount` decimal(12,2) NOT NULL DEFAULT '0.00' COMMENT '退款金额',
  `settlement_status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '结算状态：1-待结算 2-已结算 3-已对账',
  `check_status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '核对状态：0-未核对 1-核对通过 2-核对异常',
  `check_remark` varchar(500) DEFAULT NULL COMMENT '核对备注',
  `checked_at` datetime DEFAULT NULL COMMENT '核对时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_settlement_date` (`settlement_date`),
  KEY `idx_settlement_status` (`settlement_status`),
  KEY `idx_check_status` (`check_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='日结算汇总表';"];
    }
    public function down(): array { return ["DROP TABLE IF EXISTS `settlement_daily`;"]; }
    public function batch(): int { return 2; }
    public function description(): string { return '创建日结算汇总表 settlement_daily'; }
};
