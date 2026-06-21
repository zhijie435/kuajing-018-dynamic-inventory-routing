<?php
return new class {
    public function up(): array {
        return ["CREATE TABLE IF NOT EXISTS `settlement_detail` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `settlement_date` date NOT NULL COMMENT '结算日期',
  `order_id` int(11) NOT NULL COMMENT '订单ID',
  `order_no` varchar(32) NOT NULL COMMENT '订单编号',
  `goods_id` int(11) NOT NULL COMMENT '商品ID',
  `goods_name` varchar(200) NOT NULL COMMENT '商品名称',
  `goods_no` varchar(50) NOT NULL COMMENT '商品编号',
  `quantity` int(11) NOT NULL DEFAULT '0' COMMENT '数量',
  `unit_price` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '单价',
  `order_amount` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '订单金额',
  `discount_amount` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '优惠金额',
  `settlement_amount` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '结算金额',
  `commission_fee` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '手续费/佣金',
  `net_amount` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '净收入',
  `settlement_type` tinyint(1) NOT NULL DEFAULT '1' COMMENT '结算类型：1-正常结算 2-退款 3-补款',
  `settlement_status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '结算状态：1-待结算 2-已结算 3-已对账',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_settlement_date` (`settlement_date`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_order_no` (`order_no`),
  KEY `idx_goods_id` (`goods_id`),
  KEY `idx_settlement_status` (`settlement_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='结算明细表';"];
    }
    public function down(): array { return ["DROP TABLE IF EXISTS `settlement_detail`;"]; }
    public function batch(): int { return 2; }
    public function description(): string { return '创建结算明细表 settlement_detail'; }
};
