<?php
return new class {
    public function up(): array {
        return ["CREATE TABLE IF NOT EXISTS `warehouses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `warehouse_code` varchar(50) NOT NULL COMMENT '仓库编码',
  `warehouse_name` varchar(100) NOT NULL COMMENT '仓库名称',
  `warehouse_type` tinyint(1) NOT NULL DEFAULT '1' COMMENT '仓库类型:1-自建仓 2-第三方仓 3-虚拟仓',
  `province` varchar(50) DEFAULT NULL COMMENT '省份',
  `city` varchar(50) DEFAULT NULL COMMENT '城市',
  `district` varchar(50) DEFAULT NULL COMMENT '区县',
  `address` varchar(500) DEFAULT NULL COMMENT '详细地址',
  `contact` varchar(50) DEFAULT NULL COMMENT '联系人',
  `phone` varchar(20) DEFAULT NULL COMMENT '联系电话',
  `longitude` decimal(10,7) DEFAULT NULL COMMENT '经度',
  `latitude` decimal(10,7) DEFAULT NULL COMMENT '纬度',
  `is_default` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否默认仓:0-否 1-是',
  `sort_order` int(11) NOT NULL DEFAULT '0' COMMENT '排序',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态:0-禁用 1-启用',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_warehouse_code` (`warehouse_code`),
  KEY `idx_warehouse_status` (`status`),
  KEY `idx_warehouse_city` (`city`),
  KEY `idx_warehouse_type` (`warehouse_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='仓库表';",
"INSERT INTO `warehouses` (`warehouse_code`, `warehouse_name`, `warehouse_type`, `province`, `city`, `district`, `address`, `contact`, `phone`, `is_default`, `sort_order`, `status`) VALUES
('WH001', '上海中心仓', 1, '上海市', '上海市', '浦东新区', '浦东新区张江高科技园区88号', '张经理', '13800138001', 1, 1, 1),
('WH002', '广州分仓', 1, '广东省', '广州市', '白云区', '白云区太和镇物流园A栋', '李主管', '13800138002', 0, 2, 1),
('WH003', '成都分仓', 1, '四川省', '成都市', '双流区', '双流区航空港物流中心B区', '王经理', '13800138003', 0, 3, 1),
('WH004', '北京分仓', 1, '北京市', '北京市', '大兴区', '大兴区亦庄经济开发区C1栋', '赵主管', '13800138004', 0, 4, 1),
('WH005', '武汉分仓', 2, '湖北省', '武汉市', '东西湖区', '东西湖区走马岭物流园D栋', '刘经理', '13800138005', 0, 5, 1);"];
    }
    public function down(): array { return ["DROP TABLE IF EXISTS `warehouses`;"]; }
    public function batch(): int { return 3; }
    public function description(): string { return '创建仓库表 warehouses + 5个测试仓库'; }
};
