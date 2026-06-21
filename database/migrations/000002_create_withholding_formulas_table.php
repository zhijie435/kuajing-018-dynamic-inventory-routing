<?php
return new class {
    public function up(): array {
        return ["CREATE TABLE IF NOT EXISTS `withholding_formulas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL COMMENT '公式名称',
  `code` varchar(100) NOT NULL COMMENT '公式编码',
  `formula` text NOT NULL COMMENT '公式表达式',
  `description` text COMMENT '公式描述',
  `variables` text COMMENT '公式变量定义(JSON)',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态:0-禁用 1-启用',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_formula_code` (`code`),
  KEY `idx_formula_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='预扣公式表';",
"INSERT INTO `withholding_formulas` (`name`, `code`, `formula`, `description`, `variables`, `status`) VALUES
('订单金额比例预扣', 'ORDER_AMOUNT_RATE', 'order_amount * rate', '按照订单金额的一定比例进行预扣',
 '[{\"name\":\"order_amount\",\"label\":\"订单金额\",\"type\":\"number\",\"default\":0},{\"name\":\"rate\",\"label\":\"预扣比例\",\"type\":\"number\",\"default\":0.05}]', 1),
('阶梯式预扣', 'STEP_WITHHOLDING', 'order_amount <= 1000 ? order_amount * 0.03 : (order_amount <= 5000 ? order_amount * 0.05 : order_amount * 0.08)', '根据订单金额区间采用不同比例预扣',
 '[{\"name\":\"order_amount\",\"label\":\"订单金额\",\"type\":\"number\",\"default\":0}]', 1),
('固定金额加比例', 'FIXED_PLUS_RATE', 'fixed_fee + order_amount * rate', '固定手续费加订单金额比例',
 '[{\"name\":\"fixed_fee\",\"label\":\"固定手续费\",\"type\":\"number\",\"default\":10},{\"name\":\"order_amount\",\"label\":\"订单金额\",\"type\":\"number\",\"default\":0},{\"name\":\"rate\",\"label\":\"比例\",\"type\":\"number\",\"default\":0.02}]', 1),
('库存占用预扣', 'INVENTORY_OCCUPY', 'quantity * unit_price * occupy_rate + storage_fee', '根据库存占用数量和单价计算预扣金额',
 '[{\"name\":\"quantity\",\"label\":\"库存数量\",\"type\":\"number\",\"default\":0},{\"name\":\"unit_price\",\"label\":\"单价\",\"type\":\"number\",\"default\":0},{\"name\":\"occupy_rate\",\"label\":\"占用费率\",\"type\":\"number\",\"default\":0.1},{\"name\":\"storage_fee\",\"label\":\"仓储费\",\"type\":\"number\",\"default\":5}]', 1);"];
    }
    public function down(): array { return ["DROP TABLE IF EXISTS `withholding_formulas`;"]; }
    public function batch(): int { return 1; }
    public function description(): string { return '创建预扣公式表 + 4条默认公式'; }
};
