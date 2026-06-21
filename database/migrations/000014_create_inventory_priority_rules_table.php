<?php
return new class {
    public function up(): array {
        return ["CREATE TABLE IF NOT EXISTS `inventory_priority_rules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `rule_code` varchar(50) NOT NULL COMMENT '规则编码',
  `rule_name` varchar(100) NOT NULL COMMENT '规则名称',
  `warehouse_id` int(11) DEFAULT NULL COMMENT '关联仓库ID(空表示全局)',
  `warehouse_code` varchar(50) DEFAULT NULL COMMENT '关联仓库编码',
  `priority_level` int(11) NOT NULL DEFAULT '0' COMMENT '优先级级别(数字越大优先级越高)',
  `rule_type` tinyint(1) NOT NULL DEFAULT '1' COMMENT '规则类型:1-区域优先 2-商品优先 3-客户等级优先 4-活动优先 5-全局通用',
  `rule_condition` text COMMENT '规则条件(JSON)',
  `rule_action` text COMMENT '规则动作(JSON)',
  `time_start` datetime DEFAULT NULL COMMENT '生效开始时间',
  `time_end` datetime DEFAULT NULL COMMENT '生效结束时间',
  `description` varchar(500) DEFAULT NULL COMMENT '规则描述',
  `sort_order` int(11) NOT NULL DEFAULT '0' COMMENT '排序',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态:0-禁用 1-启用',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_rule_code` (`rule_code`),
  KEY `idx_warehouse_id` (`warehouse_id`),
  KEY `idx_priority_level` (`priority_level`),
  KEY `idx_rule_type` (`rule_type`),
  KEY `idx_status` (`status`),
  KEY `idx_time_range` (`time_start`, `time_end`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='库存优先级规则表';",
"INSERT INTO `inventory_priority_rules` (`rule_code`, `rule_name`, `warehouse_id`, `warehouse_code`, `priority_level`, `rule_type`, `rule_condition`, `rule_action`, `description`, `sort_order`, `status`) VALUES
('GLOBAL_PRIORITY', '全局仓库优先级', NULL, NULL, 100, 5, '{\"applies_to\":\"all\"}', '{\"warehouse_priority\":[\"WH001\",\"WH002\",\"WH004\",\"WH005\",\"WH003\"]}', '全局默认的仓库优先级配置，适用于所有场景', 1, 1),
('EAST_CHINA_PRIORITY', '华东地区优先上海仓', 1, 'WH001', 90, 1, '{\"regions\":[\"上海市\",\"江苏省\",\"浙江省\",\"安徽省\"],\"match_type\":\"province\"}', '{\"set_as_first\":true,\"skip_if_out_of_stock\":true}', '华东地区订单优先从上海中心仓发货', 2, 1),
('SOUTH_CHINA_PRIORITY', '华南地区优先广州仓', 2, 'WH002', 90, 1, '{\"regions\":[\"广东省\",\"广西省\",\"福建省\",\"海南省\"],\"match_type\":\"province\"}', '{\"set_as_first\":true,\"skip_if_out_of_stock\":true}', '华南地区订单优先从广州分仓发货', 3, 1),
('NORTH_CHINA_PRIORITY', '华北地区优先北京仓', 4, 'WH004', 90, 1, '{\"regions\":[\"北京市\",\"天津市\",\"河北省\",\"山东省\"],\"match_type\":\"province\"}', '{\"set_as_first\":true,\"skip_if_out_of_stock\":true}', '华北地区订单优先从北京分仓发货', 4, 1),
('WEST_CHINA_PRIORITY', '西南地区优先成都仓', 3, 'WH003', 90, 1, '{\"regions\":[\"四川省\",\"重庆市\",\"云南省\",\"贵州省\"],\"match_type\":\"province\"}', '{\"set_as_first\":true,\"skip_if_out_of_stock\":true}', '西南地区订单优先从成都分仓发货', 5, 1),
('CENTRAL_CHINA_PRIORITY', '华中地区优先武汉仓', 5, 'WH005', 90, 1, '{\"regions\":[\"湖北省\",\"湖南省\",\"河南省\",\"江西省\"],\"match_type\":\"province\"}', '{\"set_as_first\":true,\"skip_if_out_of_stock\":true}', '华中地区订单优先从武汉分仓发货', 6, 1),
('VIP_CUSTOMER_PRIORITY', 'VIP客户优先发货', NULL, NULL, 80, 3, '{\"customer_level\":[\"VIP1\",\"VIP2\",\"VIP3\"],\"min_priority_bonus\":50}', '{\"priority_bonus\":50,\"skip_low_stock\":true}', 'VIP客户订单优先处理，优先分配高优先级仓库', 7, 1),
('PROMOTION_PRIORITY', '大促活动专用优先级', NULL, NULL, 85, 4, '{\"promotion_tag\":\"618\",\"double11\":true}', '{\"use_stock_first\":[\"WH001\",\"WH002\",\"WH005\"],\"emergency_transfer\":true}', '大促期间使用指定的高库存仓优先发货', 8, 1),
('HOT_SKU_PRIORITY', '热销商品专属配置', NULL, NULL, 70, 2, '{\"goods_tags\":[\"hot\",\"bestseller\"],\"sales_volume_high\":true}', '{\"split_allowed\":true,\"multi_warehouse\":true}', '热销商品允许拆单，从多仓库并发发货', 9, 1);"];
    }
    public function down(): array { return ["DROP TABLE IF EXISTS `inventory_priority_rules`;"]; }
    public function batch(): int { return 3; }
    public function description(): string { return '创建库存优先级规则表 inventory_priority_rules + 测试规则数据'; }
};
