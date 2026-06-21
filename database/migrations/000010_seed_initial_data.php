<?php
return new class {
    public function up(): array {
        return [
"INSERT INTO `goods` (`goods_name`, `goods_no`, `price`, `stock`) VALUES
('苹果 iPhone 15 Pro 256G', 'IP15P-256', 8999.00, 100),
('华为 Mate 60 Pro 12+512G', 'HW-M60P-512', 6999.00, 150),
('小米 14 Ultra 16+512G', 'MI-14U-512', 5999.00, 200),
('OPPO Find X7 Ultra 16+512G', 'OPPO-FX7U-512', 5999.00, 120),
('vivo X100 Pro 12+256G', 'VIVO-X100P-256', 4999.00, 180),
('苹果 AirPods Pro 2', 'APP-APP2', 1899.00, 300),
('华为 FreeBuds Pro 3', 'HW-FBP3', 1299.00, 250),
('小米手环 8 Pro', 'MI-B8P', 399.00, 500),
('iPad Pro 11寸 256G WiFi', 'IPAD-P11-256', 6799.00, 80),
('MacBook Air 13寸 M3 256G', 'MBA-13-M3-256', 8999.00, 60);",
"INSERT INTO `permissions` (`name`, `code`, `module`, `description`) VALUES
('查看日结算汇总', 'settlement:daily:view', 'settlement', '查看日结算汇总报表'),
('查看结算明细', 'settlement:detail:view', 'settlement', '查看结算明细数据'),
('导出日结算汇总', 'export:daily', 'export', '导出日结算汇总报表'),
('导出结算明细', 'export:detail', 'export', '导出结算明细报表'),
('执行结算核对', 'check:operate', 'check', '执行结算核对操作'),
('查看审计日志', 'audit:log:view', 'audit', '查看操作审计日志'),
('用户管理', 'user:manage', 'system', '管理系统用户'),
('角色权限管理', 'role:manage', 'system', '管理角色和权限');",
"INSERT INTO `roles` (`name`, `code`, `description`) VALUES
('超级管理员', 'super_admin', '拥有系统所有权限'),
('财务管理员', 'finance_admin', '负责结算管理和导出'),
('财务核对员', 'finance_checker', '负责结算核对'),
('普通查看员', 'viewer', '仅可查看报表数据');",
"INSERT INTO `role_permissions` (`role_id`, `permission_id`) SELECT 1, id FROM `permissions`;",
"INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES (2, 1), (2, 2), (2, 3), (2, 4), (2, 5);",
"INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES (3, 1), (3, 2), (3, 5);",
"INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES (4, 1), (4, 2);",
"INSERT INTO `users` (`username`, `password_hash`, `real_name`, `email`, `status`) VALUES
('admin', '\$2y\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '系统管理员', 'admin@example.com', 1),
('finance', '\$2y\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '财务管理员', 'finance@example.com', 1),
('checker', '\$2y\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '财务核对员', 'checker@example.com', 1),
('viewer', '\$2y\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '普通查看员', 'viewer@example.com', 1);",
"INSERT INTO `user_roles` (`user_id`, `role_id`) VALUES (1, 1), (2, 2), (3, 3), (4, 4);"
        ];
    }
    public function down(): array {
        return ["DELETE FROM `user_roles`;","DELETE FROM `users` WHERE username IN ('admin','finance','checker','viewer');","DELETE FROM `role_permissions`;","DELETE FROM `roles`;","DELETE FROM `permissions`;","DELETE FROM `goods`;"];
    }
    public function batch(): int { return 3; }
    public function description(): string { return '初始化种子数据(商品10条+权限+角色+用户及关联)'; }
};
