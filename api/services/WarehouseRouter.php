<?php
require_once __DIR__ . '/../Db.php';

class WarehouseRouter {
    private $db;
    private $mockData = [];

    public function __construct() {
        try {
            $this->db = Db::getInstance();
        } catch (Exception $e) {
            $this->db = null;
        }
        $this->initMockData();
    }

    private function initMockData() {
        $this->mockData['warehouses'] = [
            ['id' => 1, 'warehouse_code' => 'WH001', 'warehouse_name' => '上海中心仓', 'warehouse_type' => 1, 'province' => '上海市', 'city' => '上海市', 'district' => '浦东新区', 'address' => '浦东新区张江高科技园区88号', 'contact' => '张经理', 'phone' => '021-50000001', 'longitude' => 121.5447, 'latitude' => 31.2282, 'is_default' => 1, 'sort_order' => 1, 'status' => 1],
            ['id' => 2, 'warehouse_code' => 'WH002', 'warehouse_name' => '广州分仓', 'warehouse_type' => 1, 'province' => '广东省', 'city' => '广州市', 'district' => '白云区', 'address' => '白云区太和镇物流园A栋', 'contact' => '李经理', 'phone' => '020-80000002', 'longitude' => 113.3245, 'latitude' => 23.1291, 'is_default' => 0, 'sort_order' => 2, 'status' => 1],
            ['id' => 3, 'warehouse_code' => 'WH003', 'warehouse_name' => '成都分仓', 'warehouse_type' => 1, 'province' => '四川省', 'city' => '成都市', 'district' => '双流区', 'address' => '双流区航空港物流中心B区', 'contact' => '王经理', 'phone' => '028-70000003', 'longitude' => 104.0668, 'latitude' => 30.5728, 'is_default' => 0, 'sort_order' => 3, 'status' => 1],
            ['id' => 4, 'warehouse_code' => 'WH004', 'warehouse_name' => '北京分仓', 'warehouse_type' => 1, 'province' => '北京市', 'city' => '北京市', 'district' => '大兴区', 'address' => '大兴区亦庄经济开发区C1栋', 'contact' => '赵经理', 'phone' => '010-60000004', 'longitude' => 116.4074, 'latitude' => 39.9042, 'is_default' => 0, 'sort_order' => 4, 'status' => 1],
            ['id' => 5, 'warehouse_code' => 'WH005', 'warehouse_name' => '武汉分仓', 'warehouse_type' => 2, 'province' => '湖北省', 'city' => '武汉市', 'district' => '东西湖区', 'address' => '东西湖区走马岭物流园D栋', 'contact' => '陈经理', 'phone' => '027-80000005', 'longitude' => 114.3055, 'latitude' => 30.5928, 'is_default' => 0, 'sort_order' => 5, 'status' => 1],
        ];

        $this->mockData['inventories'] = [
            ['id' => 1, 'warehouse_id' => 1, 'warehouse_code' => 'WH001', 'goods_id' => 1, 'goods_no' => 'SP001', 'goods_name' => '蓝牙耳机Pro', 'quantity' => 500, 'available_quantity' => 480, 'locked_quantity' => 15, 'warning_quantity' => 50, 'status' => 1],
            ['id' => 2, 'warehouse_id' => 1, 'warehouse_code' => 'WH001', 'goods_id' => 2, 'goods_no' => 'SP002', 'goods_name' => '智能手表S1', 'quantity' => 300, 'available_quantity' => 285, 'locked_quantity' => 10, 'warning_quantity' => 30, 'status' => 1],
            ['id' => 3, 'warehouse_id' => 1, 'warehouse_code' => 'WH001', 'goods_id' => 3, 'goods_no' => 'SP003', 'goods_name' => '无线充电器', 'quantity' => 800, 'available_quantity' => 780, 'locked_quantity' => 15, 'warning_quantity' => 80, 'status' => 1],
            ['id' => 4, 'warehouse_id' => 1, 'warehouse_code' => 'WH001', 'goods_id' => 4, 'goods_no' => 'SP004', 'goods_name' => '手机壳套装', 'quantity' => 1200, 'available_quantity' => 1150, 'locked_quantity' => 40, 'warning_quantity' => 100, 'status' => 1],
            ['id' => 5, 'warehouse_id' => 2, 'warehouse_code' => 'WH002', 'goods_id' => 1, 'goods_no' => 'SP001', 'goods_name' => '蓝牙耳机Pro', 'quantity' => 200, 'available_quantity' => 180, 'locked_quantity' => 15, 'warning_quantity' => 20, 'status' => 1],
            ['id' => 6, 'warehouse_id' => 2, 'warehouse_code' => 'WH002', 'goods_id' => 2, 'goods_no' => 'SP002', 'goods_name' => '智能手表S1', 'quantity' => 150, 'available_quantity' => 140, 'locked_quantity' => 5, 'warning_quantity' => 15, 'status' => 1],
            ['id' => 7, 'warehouse_id' => 2, 'warehouse_code' => 'WH002', 'goods_id' => 3, 'goods_no' => 'SP003', 'goods_name' => '无线充电器', 'quantity' => 400, 'available_quantity' => 390, 'locked_quantity' => 8, 'warning_quantity' => 40, 'status' => 1],
            ['id' => 8, 'warehouse_id' => 2, 'warehouse_code' => 'WH002', 'goods_id' => 4, 'goods_no' => 'SP004', 'goods_name' => '手机壳套装', 'quantity' => 600, 'available_quantity' => 580, 'locked_quantity' => 15, 'warning_quantity' => 60, 'status' => 1],
            ['id' => 9, 'warehouse_id' => 3, 'warehouse_code' => 'WH003', 'goods_id' => 1, 'goods_no' => 'SP001', 'goods_name' => '蓝牙耳机Pro', 'quantity' => 0, 'available_quantity' => 0, 'locked_quantity' => 0, 'warning_quantity' => 20, 'status' => 1],
            ['id' => 10, 'warehouse_id' => 3, 'warehouse_code' => 'WH003', 'goods_id' => 2, 'goods_no' => 'SP002', 'goods_name' => '智能手表S1', 'quantity' => 100, 'available_quantity' => 95, 'locked_quantity' => 3, 'warning_quantity' => 10, 'status' => 1],
            ['id' => 11, 'warehouse_id' => 3, 'warehouse_code' => 'WH003', 'goods_id' => 3, 'goods_no' => 'SP003', 'goods_name' => '无线充电器', 'quantity' => 0, 'available_quantity' => 0, 'locked_quantity' => 0, 'warning_quantity' => 40, 'status' => 1],
            ['id' => 12, 'warehouse_id' => 3, 'warehouse_code' => 'WH003', 'goods_id' => 4, 'goods_no' => 'SP004', 'goods_name' => '手机壳套装', 'quantity' => 300, 'available_quantity' => 290, 'locked_quantity' => 8, 'warning_quantity' => 30, 'status' => 1],
            ['id' => 13, 'warehouse_id' => 4, 'warehouse_code' => 'WH004', 'goods_id' => 1, 'goods_no' => 'SP001', 'goods_name' => '蓝牙耳机Pro', 'quantity' => 250, 'available_quantity' => 240, 'locked_quantity' => 8, 'warning_quantity' => 25, 'status' => 1],
            ['id' => 14, 'warehouse_id' => 4, 'warehouse_code' => 'WH004', 'goods_id' => 2, 'goods_no' => 'SP002', 'goods_name' => '智能手表S1', 'quantity' => 0, 'available_quantity' => 0, 'locked_quantity' => 0, 'warning_quantity' => 15, 'status' => 1],
            ['id' => 15, 'warehouse_id' => 4, 'warehouse_code' => 'WH004', 'goods_id' => 3, 'goods_no' => 'SP003', 'goods_name' => '无线充电器', 'quantity' => 350, 'available_quantity' => 340, 'locked_quantity' => 8, 'warning_quantity' => 35, 'status' => 1],
            ['id' => 16, 'warehouse_id' => 4, 'warehouse_code' => 'WH004', 'goods_id' => 4, 'goods_no' => 'SP004', 'goods_name' => '手机壳套装', 'quantity' => 0, 'available_quantity' => 0, 'locked_quantity' => 0, 'warning_quantity' => 30, 'status' => 1],
            ['id' => 17, 'warehouse_id' => 5, 'warehouse_code' => 'WH005', 'goods_id' => 1, 'goods_no' => 'SP001', 'goods_name' => '蓝牙耳机Pro', 'quantity' => 180, 'available_quantity' => 170, 'locked_quantity' => 8, 'warning_quantity' => 18, 'status' => 1],
            ['id' => 18, 'warehouse_id' => 5, 'warehouse_code' => 'WH005', 'goods_id' => 2, 'goods_no' => 'SP002', 'goods_name' => '智能手表S1', 'quantity' => 80, 'available_quantity' => 75, 'locked_quantity' => 3, 'warning_quantity' => 8, 'status' => 1],
            ['id' => 19, 'warehouse_id' => 5, 'warehouse_code' => 'WH005', 'goods_id' => 3, 'goods_no' => 'SP003', 'goods_name' => '无线充电器', 'quantity' => 220, 'available_quantity' => 210, 'locked_quantity' => 8, 'warning_quantity' => 22, 'status' => 1],
            ['id' => 20, 'warehouse_id' => 5, 'warehouse_code' => 'WH005', 'goods_id' => 4, 'goods_no' => 'SP004', 'goods_name' => '手机壳套装', 'quantity' => 450, 'available_quantity' => 430, 'locked_quantity' => 15, 'warning_quantity' => 45, 'status' => 1],
        ];

        $this->mockData['strategies'] = [
            ['id' => 1, 'strategy_code' => 'PRIORITY_FIRST', 'strategy_name' => '优先级优先策略', 'strategy_type' => 1, 'description' => '按照仓库设置的优先级顺序路由，优先级高的仓库优先出库', 'rules_config' => '{"priority_source":"rule","auto_fallback":true}', 'is_default' => 1, 'sort_order' => 1, 'status' => 1],
            ['id' => 2, 'strategy_code' => 'NEAREST_FIRST', 'strategy_name' => '就近发货策略', 'strategy_type' => 2, 'description' => '根据收货地址与仓库的距离，选择最近的有货仓库发货', 'rules_config' => '{"distance_unit":"km","max_distance":500,"auto_fallback":true}', 'is_default' => 0, 'sort_order' => 2, 'status' => 1],
            ['id' => 3, 'strategy_code' => 'STOCK_FIRST', 'strategy_name' => '库存充足优先', 'strategy_type' => 3, 'description' => '选择库存最充足的仓库发货，避免拆单', 'rules_config' => '{"consider_lock":true,"min_stock_ratio":0.3,"auto_fallback":true}', 'is_default' => 0, 'sort_order' => 3, 'status' => 1],
            ['id' => 4, 'strategy_code' => 'WEIGHTED_COMPREHENSIVE', 'strategy_name' => '综合加权策略', 'strategy_type' => 4, 'description' => '综合考虑优先级、距离、库存、成本等因素的加权策略', 'rules_config' => '{"weights":{"priority":40,"distance":30,"stock":20,"cost":10},"auto_fallback":true}', 'is_default' => 0, 'sort_order' => 4, 'status' => 1],
        ];

        $this->mockData['priority_rules'] = [
            ['id' => 1, 'rule_code' => 'GLOBAL_PRIORITY', 'rule_name' => '全局仓库优先级', 'warehouse_id' => null, 'warehouse_code' => null, 'priority_level' => 100, 'rule_type' => 5, 'rule_condition' => '{"applies_to":"all"}', 'rule_action' => '{"warehouse_priority":["WH001","WH002","WH004","WH005","WH003"]}', 'description' => '全局默认的仓库优先级配置', 'sort_order' => 1, 'status' => 1],
            ['id' => 2, 'rule_code' => 'EAST_CHINA_PRIORITY', 'rule_name' => '华东地区优先上海仓', 'warehouse_id' => 1, 'warehouse_code' => 'WH001', 'priority_level' => 90, 'rule_type' => 1, 'rule_condition' => '{"regions":["上海市","江苏省","浙江省","安徽省"],"match_type":"province"}', 'rule_action' => '{"set_as_first":true,"skip_if_out_of_stock":true}', 'description' => '华东地区订单优先从上海中心仓发货', 'sort_order' => 2, 'status' => 1],
            ['id' => 3, 'rule_code' => 'SOUTH_CHINA_PRIORITY', 'rule_name' => '华南地区优先广州仓', 'warehouse_id' => 2, 'warehouse_code' => 'WH002', 'priority_level' => 90, 'rule_type' => 1, 'rule_condition' => '{"regions":["广东省","广西省","福建省","海南省"],"match_type":"province"}', 'rule_action' => '{"set_as_first":true,"skip_if_out_of_stock":true}', 'description' => '华南地区订单优先从广州分仓发货', 'sort_order' => 3, 'status' => 1],
            ['id' => 4, 'rule_code' => 'NORTH_CHINA_PRIORITY', 'rule_name' => '华北地区优先北京仓', 'warehouse_id' => 4, 'warehouse_code' => 'WH004', 'priority_level' => 90, 'rule_type' => 1, 'rule_condition' => '{"regions":["北京市","天津市","河北省","山东省"],"match_type":"province"}', 'rule_action' => '{"set_as_first":true,"skip_if_out_of_stock":true}', 'description' => '华北地区订单优先从北京分仓发货', 'sort_order' => 4, 'status' => 1],
            ['id' => 5, 'rule_code' => 'WEST_CHINA_PRIORITY', 'rule_name' => '西南地区优先成都仓', 'warehouse_id' => 3, 'warehouse_code' => 'WH003', 'priority_level' => 90, 'rule_type' => 1, 'rule_condition' => '{"regions":["四川省","重庆市","云南省","贵州省"],"match_type":"province"}', 'rule_action' => '{"set_as_first":true,"skip_if_out_of_stock":true}', 'description' => '西南地区订单优先从成都分仓发货', 'sort_order' => 5, 'status' => 1],
            ['id' => 6, 'rule_code' => 'CENTRAL_CHINA_PRIORITY', 'rule_name' => '华中地区优先武汉仓', 'warehouse_id' => 5, 'warehouse_code' => 'WH005', 'priority_level' => 90, 'rule_type' => 1, 'rule_condition' => '{"regions":["湖北省","湖南省","河南省","江西省"],"match_type":"province"}', 'rule_action' => '{"set_as_first":true,"skip_if_out_of_stock":true}', 'description' => '华中地区订单优先从武汉分仓发货', 'sort_order' => 6, 'status' => 1],
            ['id' => 7, 'rule_code' => 'VIP_CUSTOMER_PRIORITY', 'rule_name' => 'VIP客户优先发货', 'warehouse_id' => null, 'warehouse_code' => null, 'priority_level' => 80, 'rule_type' => 3, 'rule_condition' => '{"customer_level":["VIP1","VIP2","VIP3"],"min_priority_bonus":50}', 'rule_action' => '{"priority_bonus":50,"skip_low_stock":true}', 'description' => 'VIP客户订单优先处理', 'sort_order' => 7, 'status' => 1],
            ['id' => 8, 'rule_code' => 'PROMOTION_PRIORITY', 'rule_name' => '大促活动专用优先级', 'warehouse_id' => null, 'warehouse_code' => null, 'priority_level' => 85, 'rule_type' => 4, 'rule_condition' => '{"promotion_tag":"618","double11":true}', 'rule_action' => '{"use_stock_first":["WH001","WH002","WH005"],"emergency_transfer":true}', 'description' => '大促期间使用指定的高库存仓优先发货', 'sort_order' => 8, 'status' => 1],
            ['id' => 9, 'rule_code' => 'HOT_SKU_PRIORITY', 'rule_name' => '热销商品专属配置', 'warehouse_id' => null, 'warehouse_code' => null, 'priority_level' => 70, 'rule_type' => 2, 'rule_condition' => '{"goods_tags":["hot","bestseller"],"sales_volume_high":true}', 'rule_action' => '{"split_allowed":true,"multi_warehouse":true}', 'description' => '热销商品允许拆单', 'sort_order' => 9, 'status' => 1],
        ];
    }

    private function getData($table, $where = []) {
        if ($this->db) {
            try {
                $sql = "SELECT * FROM `{$table}` WHERE 1=1";
                $params = [];
                foreach ($where as $key => $value) {
                    if ($value === null) {
                        $sql .= " AND `{$key}` IS NULL";
                    } else {
                        $sql .= " AND `{$key}` = :{$key}";
                        $params[$key] = $value;
                    }
                }
                $sql .= " ORDER BY sort_order ASC, id ASC";
                return $this->db->fetchAll($sql, $params);
            } catch (Exception $e) {}
        }
        $data = $this->mockData[$table] ?? [];
        foreach ($where as $key => $value) {
            $data = array_filter($data, function($item) use ($key, $value) {
                return ($item[$key] ?? null) === $value;
            });
        }
        return array_values($data);
    }

    private function getInventoriesWithWarehouse($where = []) {
        if ($this->db) {
            try {
                $sql = "SELECT wi.*, w.warehouse_name, w.province, w.city, w.longitude, w.latitude 
                        FROM warehouse_inventories wi 
                        LEFT JOIN warehouses w ON wi.warehouse_id = w.id 
                        WHERE 1=1";
                $params = [];
                foreach ($where as $key => $value) {
                    if ($value === null) {
                        $sql .= " AND wi.`{$key}` IS NULL";
                    } else {
                        $sql .= " AND wi.`{$key}` = :{$key}";
                        $params[$key] = $value;
                    }
                }
                $sql .= " ORDER BY wi.warehouse_id ASC, wi.goods_id ASC";
                return $this->db->fetchAll($sql, $params);
            } catch (Exception $e) {}
        }
        $result = [];
        foreach ($this->mockData['inventories'] as $inv) {
            $match = true;
            foreach ($where as $key => $value) {
                if (($inv[$key] ?? null) !== $value) {
                    $match = false;
                    break;
                }
            }
            if ($match) {
                $warehouse = $this->getWarehouseById($inv['warehouse_id']);
                if ($warehouse) {
                    $result[] = array_merge($inv, [
                        'warehouse_name' => $warehouse['warehouse_name'],
                        'province' => $warehouse['province'],
                        'city' => $warehouse['city'],
                        'longitude' => $warehouse['longitude'],
                        'latitude' => $warehouse['latitude'],
                    ]);
                }
            }
        }
        return $result;
    }

    private function getWarehouseById($id) {
        foreach ($this->mockData['warehouses'] as $w) {
            if ($w['id'] == $id) return $w;
        }
        return null;
    }

    private function getDefaultStrategy() {
        if ($this->db) {
            try {
                $sql = "SELECT * FROM warehouse_routing_strategies WHERE is_default = 1 AND status = 1 LIMIT 1";
                $result = $this->db->fetchOne($sql);
                if ($result) return $result;
            } catch (Exception $e) {}
        }
        foreach ($this->mockData['strategies'] as $s) {
            if ($s['is_default'] == 1) return $s;
        }
        return $this->mockData['strategies'][0] ?? null;
    }

    private function getActivePriorityRules() {
        if ($this->db) {
            try {
                $sql = "SELECT * FROM inventory_priority_rules WHERE status = 1 ORDER BY priority_level DESC, sort_order ASC";
                return $this->db->fetchAll($sql);
            } catch (Exception $e) {}
        }
        $rules = $this->mockData['priority_rules'];
        usort($rules, function($a, $b) {
            if ($a['priority_level'] != $b['priority_level']) {
                return $b['priority_level'] - $a['priority_level'];
            }
            return $a['sort_order'] - $b['sort_order'];
        });
        return $rules;
    }

    private function calculateDistance($lat1, $lon1, $lat2, $lon2) {
        if ($lat1 === null || $lon1 === null || $lat2 === null || $lon2 === null) {
            return 99999;
        }
        $earthRadius = 6371;
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);
        $a = sin($dLat/2) * sin($dLat/2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLon/2) * sin($dLon/2);
        $c = 2 * atan2(sqrt($a), sqrt(1-$a));
        return round($earthRadius * $c, 2);
    }

    private function estimateDistance($province1, $province2) {
        $distances = [
            '上海市-广东省' => 1210, '上海市-四川省' => 1700, '上海市-北京市' => 1060,
            '上海市-湖北省' => 690, '广东省-四川省' => 1300, '广东省-北京市' => 1890,
            '广东省-湖北省' => 870, '四川省-北京市' => 1520, '四川省-湖北省' => 860,
            '北京市-湖北省' => 1050,
        ];
        $key1 = $province1 . '-' . $province2;
        $key2 = $province2 . '-' . $province1;
        if (isset($distances[$key1])) return $distances[$key1];
        if (isset($distances[$key2])) return $distances[$key2];
        if ($province1 === $province2) return 50;
        return 1000;
    }

    public function calculateRoute($params) {
        $goodsList = $params['goods_list'] ?? [];
        $province = $params['province'] ?? '';
        $city = $params['city'] ?? '';
        $strategyId = $params['strategy_id'] ?? null;
        $customerLevel = $params['customer_level'] ?? '';
        $promotionTag = $params['promotion_tag'] ?? '';

        $strategy = null;
        if ($strategyId) {
            $strategies = $this->getData('strategies', ['id' => $strategyId]);
            $strategy = $strategies[0] ?? null;
        }
        if (!$strategy) {
            $strategy = $this->getDefaultStrategy();
        }

        $priorityRules = $this->getActivePriorityRules();

        $results = [];
        $totalAvailable = true;

        foreach ($goodsList as $goods) {
            $goodsNo = $goods['goods_no'] ?? '';
            $quantity = intval($goods['quantity'] ?? 1);

            $inventories = [];
            foreach ($this->mockData['inventories'] as $inv) {
                if ($inv['goods_no'] === $goodsNo && $inv['status'] == 1) {
                    $warehouse = $this->getWarehouseById($inv['warehouse_id']);
                    if ($warehouse && $warehouse['status'] == 1) {
                        $inventories[] = array_merge($inv, [
                            'warehouse_name' => $warehouse['warehouse_name'],
                            'province' => $warehouse['province'],
                            'city' => $warehouse['city'],
                            'longitude' => $warehouse['longitude'],
                            'latitude' => $warehouse['latitude'],
                        ]);
                    }
                }
            }

            if (empty($inventories)) {
                $results[] = [
                    'goods_no' => $goodsNo,
                    'goods_name' => $goods['goods_name'] ?? $goodsNo,
                    'quantity' => $quantity,
                    'total_available' => 0,
                    'allocated' => false,
                    'allocations' => [],
                    'switch_log' => [['type' => 'warning', 'message' => "商品 {$goodsNo} 无可用库存"]],
                ];
                $totalAvailable = false;
                continue;
            }

            $scored = $this->scoreWarehouses($inventories, $strategy, $priorityRules, [
                'province' => $province,
                'city' => $city,
                'customer_level' => $customerLevel,
                'promotion_tag' => $promotionTag,
                'goods_no' => $goodsNo,
            ]);

            $remaining = $quantity;
            $allocations = [];
            $switchLog = [];

            foreach ($scored as $item) {
                if ($remaining <= 0) break;

                $avail = $item['available_quantity'];
                if ($avail <= 0) {
                    $switchLog[] = [
                        'type' => 'skip',
                        'message' => "{$item['warehouse_name']}({$item['warehouse_code']}) 无可用库存，跳过",
                    ];
                    continue;
                }

                $allocate = min($remaining, $avail);
                $allocations[] = [
                    'warehouse_id' => $item['warehouse_id'],
                    'warehouse_code' => $item['warehouse_code'],
                    'warehouse_name' => $item['warehouse_name'],
                    'allocate_quantity' => $allocate,
                    'available_quantity' => $avail,
                    'distance' => $item['distance'] ?? null,
                    'score' => $item['score'] ?? 0,
                ];

                if ($allocate < $remaining) {
                    $switchLog[] = [
                        'type' => 'switch',
                        'message' => "{$item['warehouse_name']} 库存不足(需{$remaining}，有{$avail})，分配{$allocate}件后切换仓库",
                    ];
                } else {
                    $switchLog[] = [
                        'type' => 'allocate',
                        'message' => "{$item['warehouse_name']} 分配{$allocate}件，满足需求",
                    ];
                }

                $remaining -= $allocate;
            }

            $totalAvailForGoods = array_sum(array_column($inventories, 'available_quantity'));
            $goodsResult = [
                'goods_no' => $goodsNo,
                'goods_name' => $inventories[0]['goods_name'] ?? $goodsNo,
                'quantity' => $quantity,
                'total_available' => $totalAvailForGoods,
                'allocated' => $remaining <= 0,
                'allocations' => $allocations,
                'switch_log' => $switchLog,
            ];

            if ($remaining > 0) {
                $switchLog[] = [
                    'type' => 'warning',
                    'message' => "所有仓库库存不足，还差{$remaining}件无法满足",
                ];
                $totalAvailable = false;
            }

            $results[] = $goodsResult;
        }

        return [
            'strategy' => $strategy ? [
                'id' => $strategy['id'],
                'strategy_code' => $strategy['strategy_code'],
                'strategy_name' => $strategy['strategy_name'],
                'strategy_type' => $strategy['strategy_type'],
            ] : null,
            'request_params' => $params,
            'results' => $results,
            'all_fulfilled' => $totalAvailable,
            'total_goods' => count($goodsList),
            'fulfilled_goods' => count(array_filter($results, function($r) { return $r['allocated']; })),
        ];
    }

    private function scoreWarehouses($inventories, $strategy, $priorityRules, $context) {
        $strategyType = $strategy['strategy_type'] ?? 1;
        $rulesConfig = json_decode($strategy['rules_config'] ?? '{}', true);

        $scored = [];
        foreach ($inventories as $inv) {
            $score = 0;
            $distance = null;
            $warehouse = $this->getWarehouseById($inv['warehouse_id']);

            if ($warehouse) {
                if ($context['province'] && $warehouse['latitude'] && $warehouse['longitude']) {
                    $provinceCoords = $this->getProvinceCoords($context['province']);
                    if ($provinceCoords) {
                        $distance = $this->calculateDistance(
                            $provinceCoords['lat'], $provinceCoords['lon'],
                            $warehouse['latitude'], $warehouse['longitude']
                        );
                    } else {
                        $distance = $this->estimateDistance($context['province'], $warehouse['province']);
                    }
                }
            }

            $priorityBonus = 0;
            foreach ($priorityRules as $rule) {
                $match = $this->checkRuleMatch($rule, $context, $inv);
                if ($match) {
                    $action = json_decode($rule['rule_action'] ?? '{}', true);
                    if (isset($action['set_as_first']) && $action['set_as_first'] && $rule['warehouse_code'] === $inv['warehouse_code']) {
                        $priorityBonus += 200;
                    }
                    if (isset($action['priority_bonus'])) {
                        $priorityBonus += $action['priority_bonus'];
                    }
                }
            }

            switch ($strategyType) {
                case 1:
                    $score = 1000 - ($inv['warehouse_id'] * 10) + $priorityBonus;
                    break;
                case 2:
                    $score = ($distance !== null) ? (2000 - $distance * 2) : 0;
                    $score += $priorityBonus;
                    break;
                case 3:
                    $score = $inv['available_quantity'] * 2 + $priorityBonus;
                    break;
                case 4:
                    $weights = $rulesConfig['weights'] ?? ['priority' => 40, 'distance' => 30, 'stock' => 20, 'cost' => 10];
                    $pScore = 1000 - ($inv['warehouse_id'] * 10);
                    $dScore = ($distance !== null) ? (2000 - $distance * 2) : 0;
                    $sScore = $inv['available_quantity'] * 2;
                    $cScore = 500;
                    $score = ($pScore * $weights['priority'] / 100) +
                             ($dScore * $weights['distance'] / 100) +
                             ($sScore * $weights['stock'] / 100) +
                             ($cScore * $weights['cost'] / 100) +
                             $priorityBonus;
                    break;
                default:
                    $score = 1000 - ($inv['warehouse_id'] * 10) + $priorityBonus;
            }

            $scored[] = array_merge($inv, [
                'score' => $score,
                'distance' => $distance,
            ]);
        }

        usort($scored, function($a, $b) {
            return $b['score'] - $a['score'];
        });

        return $scored;
    }

    private function checkRuleMatch($rule, $context, $inventory) {
        $condition = json_decode($rule['rule_condition'] ?? '{}', true);
        $ruleType = $rule['rule_type'] ?? 0;

        switch ($ruleType) {
            case 1:
                if (isset($condition['regions']) && $context['province']) {
                    return in_array($context['province'], $condition['regions']);
                }
                return false;
            case 2:
                if (isset($condition['goods_tags'])) {
                    return true;
                }
                return false;
            case 3:
                if (isset($condition['customer_level']) && $context['customer_level']) {
                    return in_array($context['customer_level'], $condition['customer_level']);
                }
                return false;
            case 4:
                if (isset($condition['promotion_tag']) && $context['promotion_tag']) {
                    return $context['promotion_tag'] === $condition['promotion_tag'] ||
                           !empty($condition['double11']);
                }
                return false;
            case 5:
                return true;
            default:
                return false;
        }
    }

    private function getProvinceCoords($province) {
        $coords = [
            '上海市' => ['lat' => 31.2304, 'lon' => 121.4737],
            '北京市' => ['lat' => 39.9042, 'lon' => 116.4074],
            '广东省' => ['lat' => 23.1291, 'lon' => 113.2644],
            '四川省' => ['lat' => 30.5728, 'lon' => 104.0668],
            '湖北省' => ['lat' => 30.5928, 'lon' => 114.3055],
            '浙江省' => ['lat' => 30.2741, 'lon' => 120.1551],
            '江苏省' => ['lat' => 32.0603, 'lon' => 118.7969],
            '福建省' => ['lat' => 26.0745, 'lon' => 119.2965],
            '山东省' => ['lat' => 36.6512, 'lon' => 117.1201],
            '河南省' => ['lat' => 34.7466, 'lon' => 113.6253],
            '湖南省' => ['lat' => 27.6104, 'lon' => 111.7088],
            '安徽省' => ['lat' => 31.8206, 'lon' => 117.2272],
            '河北省' => ['lat' => 38.0428, 'lon' => 114.5149],
            '天津市' => ['lat' => 39.0842, 'lon' => 117.2010],
            '重庆市' => ['lat' => 29.5630, 'lon' => 106.5516],
            '云南省' => ['lat' => 25.0389, 'lon' => 102.7183],
            '贵州省' => ['lat' => 26.6470, 'lon' => 106.6302],
            '广西省' => ['lat' => 22.8170, 'lon' => 108.3665],
            '海南省' => ['lat' => 20.0174, 'lon' => 110.3492],
            '江西省' => ['lat' => 27.6104, 'lon' => 115.8919],
        ];
        return $coords[$province] ?? null;
    }

    public function getWarehouses($where = []) {
        return $this->getData('warehouses', $where);
    }

    public function getInventories($where = []) {
        return $this->getInventoriesWithWarehouse($where);
    }

    public function getStrategies($where = []) {
        return $this->getData('strategies', $where);
    }

    public function getPriorityRules($where = []) {
        return $this->getData('priority_rules', $where);
    }

    public function saveWarehouse($data) {
        if ($this->db) {
            try {
                if (!empty($data['id'])) {
                    $this->db->update('warehouses', $data, 'id = :where_id', ['where_id' => $data['id']]);
                    return $data['id'];
                } else {
                    unset($data['id']);
                    return $this->db->insert('warehouses', $data);
                }
            } catch (Exception $e) {}
        }
        if (!empty($data['id'])) {
            foreach ($this->mockData['warehouses'] as &$w) {
                if ($w['id'] == $data['id']) {
                    $w = array_merge($w, $data);
                    return $data['id'];
                }
            }
        } else {
            $maxId = max(array_column($this->mockData['warehouses'], 'id'));
            $data['id'] = $maxId + 1;
            $this->mockData['warehouses'][] = $data;
            return $data['id'];
        }
        return false;
    }

    public function saveInventory($data) {
        if ($this->db) {
            try {
                if (!empty($data['id'])) {
                    $this->db->update('warehouse_inventories', $data, 'id = :where_id', ['where_id' => $data['id']]);
                    return $data['id'];
                } else {
                    unset($data['id']);
                    return $this->db->insert('warehouse_inventories', $data);
                }
            } catch (Exception $e) {}
        }
        if (!empty($data['id'])) {
            foreach ($this->mockData['inventories'] as &$inv) {
                if ($inv['id'] == $data['id']) {
                    $inv = array_merge($inv, $data);
                    return $data['id'];
                }
            }
        } else {
            $maxId = max(array_column($this->mockData['inventories'], 'id'));
            $data['id'] = $maxId + 1;
            $this->mockData['inventories'][] = $data;
            return $data['id'];
        }
        return false;
    }

    public function saveStrategy($data) {
        if ($this->db) {
            try {
                if (!empty($data['id'])) {
                    $this->db->update('warehouse_routing_strategies', $data, 'id = :where_id', ['where_id' => $data['id']]);
                    return $data['id'];
                } else {
                    unset($data['id']);
                    return $this->db->insert('warehouse_routing_strategies', $data);
                }
            } catch (Exception $e) {}
        }
        if (!empty($data['id'])) {
            foreach ($this->mockData['strategies'] as &$s) {
                if ($s['id'] == $data['id']) {
                    $s = array_merge($s, $data);
                    return $data['id'];
                }
            }
        } else {
            $maxId = max(array_column($this->mockData['strategies'], 'id'));
            $data['id'] = $maxId + 1;
            $this->mockData['strategies'][] = $data;
            return $data['id'];
        }
        return false;
    }

    public function savePriorityRule($data) {
        if ($this->db) {
            try {
                if (!empty($data['id'])) {
                    $this->db->update('inventory_priority_rules', $data, 'id = :where_id', ['where_id' => $data['id']]);
                    return $data['id'];
                } else {
                    unset($data['id']);
                    return $this->db->insert('inventory_priority_rules', $data);
                }
            } catch (Exception $e) {}
        }
        if (!empty($data['id'])) {
            foreach ($this->mockData['priority_rules'] as &$r) {
                if ($r['id'] == $data['id']) {
                    $r = array_merge($r, $data);
                    return $data['id'];
                }
            }
        } else {
            $maxId = max(array_column($this->mockData['priority_rules'], 'id'));
            $data['id'] = $maxId + 1;
            $this->mockData['priority_rules'][] = $data;
            return $data['id'];
        }
        return false;
    }

    public function deleteWarehouse($id) {
        if ($this->db) {
            try {
                return $this->db->delete('warehouses', 'id = :id', ['id' => $id]);
            } catch (Exception $e) {}
        }
        $this->mockData['warehouses'] = array_values(array_filter($this->mockData['warehouses'], function($w) use ($id) {
            return $w['id'] != $id;
        }));
        return true;
    }

    public function deleteStrategy($id) {
        if ($this->db) {
            try {
                return $this->db->delete('warehouse_routing_strategies', 'id = :id', ['id' => $id]);
            } catch (Exception $e) {}
        }
        $this->mockData['strategies'] = array_values(array_filter($this->mockData['strategies'], function($s) use ($id) {
            return $s['id'] != $id;
        }));
        return true;
    }

    public function deletePriorityRule($id) {
        if ($this->db) {
            try {
                return $this->db->delete('inventory_priority_rules', 'id = :id', ['id' => $id]);
            } catch (Exception $e) {}
        }
        $this->mockData['priority_rules'] = array_values(array_filter($this->mockData['priority_rules'], function($r) use ($id) {
            return $r['id'] != $id;
        }));
        return true;
    }

    public function exportPriorityRules($params = []) {
        $rules = $this->getPriorityRules();
        $ruleTypeMap = [1 => '区域优先', 2 => '商品优先', 3 => '客户等级', 4 => '活动优先', 5 => '全局通用'];
        $statusMap = [0 => '禁用', 1 => '启用'];

        $headers = ['规则编码', '规则名称', '规则类型', '优先级', '关联仓库', '描述', '排序', '状态', '规则条件', '规则动作'];
        $rows = [];
        foreach ($rules as $r) {
            $rows[] = [
                $r['rule_code'],
                $r['rule_name'],
                $ruleTypeMap[$r['rule_type']] ?? '未知',
                $r['priority_level'],
                $r['warehouse_code'] ?? '全局',
                $r['description'],
                $r['sort_order'],
                $statusMap[$r['status']] ?? '未知',
                $r['rule_condition'],
                $r['rule_action'],
            ];
        }
        return ['headers' => $headers, 'rows' => $rows, 'filename' => 'inventory_priority_rules_' . date('YmdHis')];
    }

    public function exportRouteResult($routeResult) {
        $headers = ['商品编码', '商品名称', '需求数量', '总可用库存', '是否满足', '仓库编码', '仓库名称', '分配数量', '仓库可用', '距离(km)', '评分', '切换类型', '切换说明'];
        $rows = [];

        if (!empty($routeResult['results'])) {
            foreach ($routeResult['results'] as $goodsResult) {
                $goodsNo = $goodsResult['goods_no'] ?? '';
                $goodsName = $goodsResult['goods_name'] ?? '';
                $quantity = $goodsResult['quantity'] ?? 0;
                $totalAvailable = $goodsResult['total_available'] ?? 0;
                $allocated = !empty($goodsResult['allocated']) ? '是' : '否';

                if (!empty($goodsResult['allocations'])) {
                    foreach ($goodsResult['allocations'] as $idx => $alloc) {
                        $switchLog = $goodsResult['switch_log'][$idx] ?? null;
                        $switchType = '';
                        $switchMsg = '';
                        if ($switchLog) {
                            $switchType = $switchLog['type'] ?? '';
                            $switchMsg = $switchLog['message'] ?? '';
                        }
                        $rows[] = [
                            $goodsNo,
                            $goodsName,
                            $quantity,
                            $totalAvailable,
                            $allocated,
                            $alloc['warehouse_code'],
                            $alloc['warehouse_name'],
                            $alloc['allocate_quantity'],
                            $alloc['available_quantity'],
                            $alloc['distance'] ?? '-',
                            round($alloc['score'] ?? 0),
                            $this->getSwitchTypeName($switchType),
                            $switchMsg,
                        ];
                    }
                } else {
                    $rows[] = [
                    $goodsNo,
                    $goodsName,
                    $quantity,
                    $totalAvailable,
                    $allocated,
                    '',
                    '',
                    0,
                    0,
                    '',
                    0,
                    '',
                    '无可用库存',
                ];
            }
        }
        return ['headers' => $headers, 'rows' => $rows, 'filename' => 'route_allocation_result_' . date('YmdHis')];
    }

    private function getSwitchTypeName($type) {
        $map = [
            'allocate' => '分配成功',
            'switch' => '仓库切换',
            'skip' => '跳过仓库',
            'warning' => '异常警告',
        ];
        return $map[$type] ?? $type;
    }

    public function exportInventories($params = []) {
        $inventories = $this->getInventoriesWithWarehouse();
        $headers = ['仓库编码', '仓库名称', '商品编码', '商品名称', '总库存', '可用库存', '锁定库存', '预警值', '库存状态', '是否异常', '异常说明'];
        $rows = [];

        foreach ($inventories as $inv) {
            $status = '正常';
            $isAbnormal = '否';
            $abnormalReason = '';

            if ($inv['available_quantity'] <= 0) {
                $status = '缺货';
                $isAbnormal = '是';
                $abnormalReason = '库存为零，需补货';
            } elseif ($inv['available_quantity'] <= $inv['warning_quantity']) {
                $status = '预警';
                $isAbnormal = '是';
                $abnormalReason = '库存低于预警值';
            }

            if ($inv['quantity'] != ($inv['available_quantity'] + $inv['locked_quantity'])) {
                $isAbnormal = '是';
                $abnormalReason .= ($abnormalReason ? '；' : '') . '库存数量不一致';
            }

            $rows[] = [
                $inv['warehouse_code'],
                $inv['warehouse_name'],
                $inv['goods_no'],
                $inv['goods_name'],
                $inv['quantity'],
                $inv['available_quantity'],
                $inv['locked_quantity'],
                $inv['warning_quantity'],
                $status,
                $isAbnormal,
                $abnormalReason,
            ];
        }
        return ['headers' => $headers, 'rows' => $rows, 'filename' => 'warehouse_inventories_' . date('YmdHis')];
    }

    public function checkInventoryConsistency() {
        $inventories = $this->getInventoriesWithWarehouse();
        $abnormalItems = [];
        $warningItems = [];
        $outOfStockItems = [];
        $totalItems = 0;
        $normalItems = 0;

        foreach ($inventories as $inv) {
            $totalItems++;
            $abnormal = false;
            $reasons = [];

            if ($inv['quantity'] != ($inv['available_quantity'] + $inv['locked_quantity'])) {
                $abnormal = true;
                $reasons[] = '库存数量不一致：总库存≠可用+锁定';
            }

            if ($inv['available_quantity'] <= 0) {
                $abnormal = true;
                $reasons[] = '缺货';
                $outOfStockItems[] = array_merge($inv, ['abnormal_reasons' => $reasons]);
            } elseif ($inv['available_quantity'] <= $inv['warning_quantity']) {
                $warningItems[] = array_merge($inv, ['abnormal_reasons' => ['低于预警值']]);
            }

            if ($abnormal) {
                $abnormalItems[] = array_merge($inv, ['abnormal_reasons' => $reasons]);
            } else {
                $normalItems++;
            }
        }

        return [
            'total_items' => $totalItems,
            'normal_items' => $normalItems,
            'abnormal_count' => count($abnormalItems),
            'warning_count' => count($warningItems),
            'out_of_stock_count' => count($outOfStockItems),
            'abnormal_items' => $abnormalItems,
            'warning_items' => $warningItems,
            'out_of_stock_items' => $outOfStockItems,
            'check_time' => date('Y-m-d H:i:s'),
        ];
    }

    public function getInventoryAlerts() {
        $result = $this->checkInventoryConsistency();
        $alerts = [];

        if (!empty($result['out_of_stock_items'])) {
            $alerts[] = [
                'type' => 'danger',
                'level' => '严重',
                'title' => '缺货告警',
                'count' => count($result['out_of_stock_count'],
                'message' => '有 ' . count($result['out_of_stock_count']) . ' 个商品库存为零，需立即补货',
                'items' => array_slice($result['out_of_stock_items'], 0, 5),
            ];
        }

        if (!empty($result['warning_items'])) {
            $alerts[] = [
                'type' => 'warning',
                'level' => '预警',
                'title' => '库存预警',
                'count' => count($result['warning_count']),
                'message' => '有 ' . count($result['warning_count']) . ' 个商品库存低于预警值',
                'items' => array_slice($result['warning_items'], 0, 5),
            ];
        }

        $abnormalCount = 0;
        $abnormalList = [];
        foreach ($result['abnormal_items'] as $item) {
            $hasQtyIssue = false;
            foreach ($item['abnormal_reasons'] as $reason) {
                if (strpos($reason, '库存数量不一致') !== false) {
                    $hasQtyIssue = true;
                    break;
                }
            }
            if ($hasQtyIssue) {
                $abnormalCount++;
                $abnormalList[] = $item;
            }
        }

        if ($abnormalCount > 0) {
            $alerts[] = [
                'type' => 'error',
                'level' => '异常',
                'title' => '库存数据异常',
                'count' => $abnormalCount,
                'message' => '有 ' . $abnormalCount . ' 条库存数据不一致，需核对',
                'items' => array_slice($abnormalList, 0, 5),
            ];
        }

        return [
            'alerts' => $alerts,
            'summary' => $result,
        ];
    }
}
