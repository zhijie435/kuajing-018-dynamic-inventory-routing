<?php
return new class {
    public function up(): array {
        return ["CREATE TABLE IF NOT EXISTS `warehouse_routing_strategies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `strategy_code` varchar(50) NOT NULL COMMENT '策略编码',
  `strategy_name` varchar(100) NOT NULL COMMENT '策略名称',
  `strategy_type` tinyint(1) NOT NULL DEFAULT '1' COMMENT '策略类型:1-优先级策略 2-就近策略 3-库存优先策略 4-综合加权策略',
  `description` varchar(500) DEFAULT NULL COMMENT '策略描述',
  `rules_config` text COMMENT '规则配置(JSON)',
  `is_default` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否默认策略:0-否 1-是',
  `sort_order` int(11) NOT NULL DEFAULT '0' COMMENT '排序',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态:0-禁用 1-启用',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_strategy_code` (`strategy_code`),
  KEY `idx_strategy_type` (`strategy_type`),
  KEY `idx_strategy_status` (`status`),
  KEY `idx_is_default` (`is_default`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='仓库路由策略表';",
"INSERT INTO `warehouse_routing_strategies` (`strategy_code`, `strategy_name`, `strategy_type`, `description`, `rules_config`, `is_default`, `sort_order`, `status`) VALUES
('PRIORITY_FIRST', '优先级优先策略', 1, '按照仓库设置的优先级顺序路由，优先级高的仓库优先出库', '{\"priority_source\":\"rule\",\"auto_fallback\":true}', 1, 1, 1),
('NEAREST_FIRST', '就近发货策略', 2, '根据收货地址与仓库的距离，选择最近的有货仓库发货', '{\"distance_unit\":\"km\",\"max_distance\":500,\"auto_fallback\":true}', 0, 2, 1),
('STOCK_FIRST', '库存充足优先', 3, '选择库存最充足的仓库发货，避免拆单', '{\"consider_lock\":true,\"min_stock_ratio\":0.3,\"auto_fallback\":true}', 0, 3, 1),
('WEIGHTED_COMPREHENSIVE', '综合加权策略', 4, '综合考虑优先级、距离、库存、成本等因素的加权策略', '{\"weights\":{\"priority\":40,\"distance\":30,\"stock\":20,\"cost\":10},\"auto_fallback\":true}', 0, 4, 1);"];
    }
    public function down(): array { return ["DROP TABLE IF EXISTS `warehouse_routing_strategies`;"]; }
    public function batch(): int { return 3; }
    public function description(): string { return '创建仓库路由策略表 warehouse_routing_strategies + 4种默认策略'; }
};
