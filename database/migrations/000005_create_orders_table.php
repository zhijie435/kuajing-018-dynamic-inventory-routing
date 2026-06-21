<?php
return new class {
    public function up(): array {
        return ["CREATE TABLE IF NOT EXISTS `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_no` varchar(32) NOT NULL COMMENT '订单编号',
  `goods_id` int(11) NOT NULL COMMENT '商品ID',
  `goods_name` varchar(200) NOT NULL COMMENT '商品名称',
  `goods_no` varchar(50) NOT NULL COMMENT '商品编号',
  `quantity` int(11) NOT NULL DEFAULT '1' COMMENT '购买数量',
  `unit_price` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '单价',
  `total_amount` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '订单总金额',
  `discount_amount` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '优惠金额',
  `pay_amount` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '实付金额',
  `order_status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '订单状态：1-待付款 2-已付款 3-已发货 4-已完成 5-已取消',
  `pay_time` datetime DEFAULT NULL COMMENT '支付时间',
  `buyer_name` varchar(100) DEFAULT NULL COMMENT '买家名称',
  `buyer_phone` varchar(20) DEFAULT NULL COMMENT '买家电话',
  `receiver_name` varchar(100) DEFAULT NULL COMMENT '收货人',
  `receiver_phone` varchar(20) DEFAULT NULL COMMENT '收货电话',
  `receiver_address` varchar(500) DEFAULT NULL COMMENT '收货地址',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_order_no` (`order_no`),
  KEY `idx_goods_id` (`goods_id`),
  KEY `idx_order_status` (`order_status`),
  KEY `idx_pay_time` (`pay_time`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';"];
    }
    public function down(): array { return ["DROP TABLE IF EXISTS `orders`;"]; }
    public function batch(): int { return 2; }
    public function description(): string { return '创建订单表 orders'; }
};
