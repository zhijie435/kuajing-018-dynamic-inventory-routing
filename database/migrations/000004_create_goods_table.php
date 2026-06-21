<?php
return new class {
    public function up(): array {
        return ["CREATE TABLE IF NOT EXISTS `goods` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `goods_name` varchar(200) NOT NULL COMMENT '商品名称',
  `goods_no` varchar(50) NOT NULL COMMENT '商品编号',
  `price` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '商品单价',
  `stock` int(11) NOT NULL DEFAULT '0' COMMENT '库存数量',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_goods_no` (`goods_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';"];
    }
    public function down(): array { return ["DROP TABLE IF EXISTS `goods`;"]; }
    public function batch(): int { return 2; }
    public function description(): string { return '创建商品表 goods'; }
};
