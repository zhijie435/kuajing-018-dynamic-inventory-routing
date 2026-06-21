<?php
return new class {
    public function up(): array {
        return ["CREATE TABLE IF NOT EXISTS `operation_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL COMMENT '操作用户ID',
  `username` varchar(50) DEFAULT NULL COMMENT '操作用户名',
  `module` varchar(50) NOT NULL COMMENT '模块:settlement export check auth',
  `action` varchar(50) NOT NULL COMMENT '操作:view export check_pass check_fail login logout',
  `resource_type` varchar(50) DEFAULT NULL COMMENT '资源类型:settlement_daily settlement_detail',
  `resource_id` varchar(100) DEFAULT NULL COMMENT '资源ID',
  `old_value` text COMMENT '变更前值(JSON)',
  `new_value` text COMMENT '变更后值(JSON)',
  `request_params` text COMMENT '请求参数(JSON)',
  `response_code` int(11) DEFAULT NULL COMMENT '响应码',
  `ip_address` varchar(50) DEFAULT NULL COMMENT 'IP地址',
  `user_agent` varchar(500) DEFAULT NULL COMMENT '用户代理',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态:0-失败 1-成功',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_module_action` (`module`,`action`),
  KEY `idx_resource` (`resource_type`,`resource_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作审计日志表';"];
    }
    public function down(): array { return ["DROP TABLE IF EXISTS `operation_logs`;"]; }
    public function batch(): int { return 3; }
    public function description(): string { return '创建操作审计日志表 operation_logs'; }
};
