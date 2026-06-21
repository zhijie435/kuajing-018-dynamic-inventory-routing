<?php
return new class {
    public function up(): array {
        return ["CREATE TABLE IF NOT EXISTS `warehouse_inventories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `warehouse_id` int(11) NOT NULL COMMENT '仓库ID',
  `warehouse_code` varchar(50) NOT NULL COMMENT '仓库编码',
  `goods_id` int(11) NOT NULL COMMENT '商品ID',
  `goods_no` varchar(50) NOT NULL COMMENT '商品编号',
  `goods_name` varchar(200) NOT NULL COMMENT '商品名称',
  `quantity` int(11) NOT NULL DEFAULT '0' COMMENT '总库存数量',
  `available_quantity` int(11) NOT NULL DEFAULT '0' COMMENT '可用库存数量',
  `locked_quantity` int(11) NOT NULL DEFAULT '0' COMMENT '锁定库存数量',
  `pre_order_quantity` int(11) NOT NULL DEFAULT '0' COMMENT '预占库存数量',
  `warning_quantity` int(11) NOT NULL DEFAULT '10' COMMENT '预警库存数量',
  `inbound_price` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '入库成本价',
  `last_inbound_time` datetime DEFAULT NULL COMMENT '最后入库时间',
  `last_outbound_time` datetime DEFAULT NULL COMMENT '最后出库时间',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态:0-禁用 1-正常',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_warehouse_goods` (`warehouse_id`, `goods_id`),
  KEY `idx_warehouse_id` (`warehouse_id`),
  KEY `idx_goods_id` (`goods_id`),
  KEY `idx_goods_no` (`goods_no`),
  KEY `idx_available_quantity` (`available_quantity`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='分仓库存表';",
"INSERT INTO `warehouse_inventories` (`warehouse_id`, `warehouse_code`, `goods_id`, `goods_no`, `goods_name`, `quantity`, `available_quantity`, `locked_quantity`, `pre_order_quantity`, `warning_quantity`, `inbound_price`) VALUES
(1, 'WH001', 1, 'SP001', '蓝牙耳机Pro', 500, 480, 20, 0, 50, 199.00),
(1, 'WH001', 2, 'SP002', '智能手表S1', 300, 285, 15, 0, 30, 899.00),
(1, 'WH001', 3, 'SP003', '无线充电器', 800, 780, 20, 0, 100, 49.00),
(1, 'WH001', 4, 'SP004', '手机壳套装', 1200, 1150, 50, 0, 200, 29.00),
(2, 'WH002', 1, 'SP001', '蓝牙耳机Pro', 200, 180, 20, 0, 50, 199.00),
(2, 'WH002', 2, 'SP002', '智能手表S1', 150, 140, 10, 0, 30, 899.00),
(2, 'WH002', 3, 'SP003', '无线充电器', 400, 390, 10, 0, 100, 49.00),
(2, 'WH002', 4, 'SP004', '手机壳套装', 600, 580, 20, 0, 200, 29.00),
(3, 'WH003', 1, 'SP001', '蓝牙耳机Pro', 0, 0, 0, 0, 50, 199.00),
(3, 'WH003', 2, 'SP002', '智能手表S1', 100, 95, 5, 0, 30, 899.00),
(3, 'WH003', 3, 'SP003', '无线充电器', 0, 0, 0, 0, 100, 49.00),
(3, 'WH003', 4, 'SP004', '手机壳套装', 300, 290, 10, 0, 200, 29.00),
(4, 'WH004', 1, 'SP001', '蓝牙耳机Pro', 250, 240, 10, 0, 50, 199.00),
(4, 'WH004', 2, 'SP002', '智能手表S1', 0, 0, 0, 0, 30, 899.00),
(4, 'WH004', 3, 'SP003', '无线充电器', 350, 340, 10, 0, 100, 49.00),
(4, 'WH004', 4, 'SP004', '手机壳套装', 0, 0, 0, 0, 200, 29.00),
(5, 'WH005', 1, 'SP001', '蓝牙耳机Pro', 180, 170, 10, 0, 50, 199.00),
(5, 'WH005', 2, 'SP002', '智能手表S1', 80, 75, 5, 0, 30, 899.00),
(5, 'WH005', 3, 'SP003', '无线充电器', 220, 210, 10, 0, 100, 49.00),
(5, 'WH005', 4, 'SP004', '手机壳套装', 450, 430, 20, 0, 200, 29.00);"];
    }
    public function down(): array { return ["DROP TABLE IF EXISTS `warehouse_inventories`;"]; }
    public function batch(): int { return 3; }
    public function description(): string { return '创建分仓库存表 warehouse_inventories + 测试数据'; }
};
