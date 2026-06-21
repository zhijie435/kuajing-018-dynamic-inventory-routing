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
            ['id' => 1, 'warehouse_code' => 'WH001', 'warehouse_name' => '上海中心仓', 'warehouse_type' => 1, 'province' => '上海市', 'city' => '上海市', 'address' => '浦东新区张江高科技园区88号', 'longitude' => 121.5447, 'latitude' => 31.2282, 'is_default' => 1, 'sort_order' => 1, 'status' => 1],
            ['id' => 2, 'warehouse_code' => 'WH002', 'warehouse_name' => '广州分仓', 'warehouse_type' => 1, 'province' => '广东省', 'city' => '广州市', 'address' => '白云区太和镇物流园A栋', 'longitude' => 113.3245, 'latitude' => 23.1291, 'is_default' => 0, 'sort_order' => 2, 'status' => 1],
            ['id' => 3, 'warehouse_code' => 'WH003', 'warehouse_name' => '成都分仓', 'warehouse_type' => 1, 'province' => '四川省', 'city' => '成都市', 'address' => '双流区航空港物流中心B区', 'longitude' => 104.0668, 'latitude' => 30.5728, 'is_default' => 0, 'sort_order' => 3, 'status' => 1],
            ['id' => 4, 'warehouse_code' => 'WH004', 'warehouse_name' => '北京分仓', 'warehouse_type' => 1, 'province' => '北京市', 'city' => '北京市', 'address' => '大兴区亦庄经济开发区C1栋', 'longitude' => 116.4074, 'latitude' => 39.9042, 'is_default' => 0, 'sort_order' => 4, 'status' => 1],
            ['id' => 5, 'warehouse_code' => 'WH005', 'warehouse_name' => '武汉分仓', 'warehouse_type' => 2, 'province' => '湖北省', 'city' => '武汉市', 'address' => '东西湖区走马岭物流园D栋', 'longitude' => 114.3055, 'latitude' => 30.5928, 'is_default' => 0, 'sort_order' => 5, 'status' => 1],
        ];

        $this->mockData['inventories'] = [
            ['warehouse_id' => 1, 'warehouse_code' => 'WH001', 'goods_id' => 1, 'goods_no' => 'SP001', 'goods_name' => '蓝牙耳机Pro', 'quantity' => 500, 'available_quantity' => 480],
            ['warehouse_id' => 1, 'warehouse_code' => 'WH001', 'goods_id' => 2, 'goods_no' => 'SP002', 'goods_name' => '智能手表S1', 'quantity' => 300, 'available_quantity' => 285],
            ['warehouse_id' => 1, 'warehouse_code' => 'WH001', 'goods_id' => 3, 'goods_no' => 'SP003', 'goods_name' => '无线充电器', 'quantity' => 800, 'available_quantity' => 780],
            ['warehouse_id' => 1, 'warehouse_code' => 'WH001', 'goods_id' => 4, 'goods_no' => 'SP004', 'goods_name' => '手机壳套装', 'quantity' => 1200, 'available_quantity' => 1150],
            ['warehouse_id' => 2, 'warehouse_code' => 'WH002', 'goods_id' => 1, 'goods_no' => 'SP001', 'goods_name' => '蓝牙耳机Pro', 'quantity' => 200, 'available_quantity' => 180],
            ['warehouse_id' => 2, 'warehouse_code' => 'WH002', 'goods_id' => 2, 'goods_no' => 'SP002', 'goods_name' => '智能手表S1', 'quantity' => 150, 'available_quantity' => 140],
            ['warehouse_id' => 2, 'warehouse_code' => 'WH002', 'goods_id' => 3, 'goods_no' => 'SP003', 'goods_name' => '无线充电器', 'quantity' => 400, 'available_quantity' => 390],
            ['warehouse_id' => 2, 'warehouse_code' => 'WH002', 'goods_id' => 4, 'goods_no' => 'SP004', 'goods_name' => '手机壳套装', 'quantity' => 600, 'available_quantity' => 580],
            ['warehouse_id' => 3, 'warehouse_code' => 'WH003', 'goods_id' => 1, 'goods_no' => 'SP001', 'goods_name' => '蓝牙耳机Pro', 'quantity' => 0, 'available_quantity' => 0],
            ['warehouse_id' => 3, 'warehouse_code' => 'WH003', 'goods_id' => 2, 'goods_no' => 'SP002', 'goods_name' => '智能手表S1', 'quantity' => 100, 'available_quantity' => 95],
            ['warehouse_id' => 3, 'warehouse_code' => 'WH003', 'goods_id' => 3, 'goods_no' => 'SP003', 'goods_name' => '无线充电器', 'quantity' => 0, 'available_quantity' => 0],
            ['warehouse_id' => 3, 'warehouse_code' => 'WH003', 'goods_id' => 4, 'goods_no' => 'SP004', 'goods_name' => '手机壳套装', 'quantity' => 300, 'available_quantity' => 290],
            ['warehouse_id' => 4, 'warehouse_code' => 'WH004', 'goods_id' => 1, 'goods_no' => 'SP001', 'goods_name' => '蓝牙耳机Pro', 'quantity' => 250, 'available_quantity' => 240],
            ['warehouse_id' => 4, 'warehouse_code' => 'WH004', 'goods_id' => 2, 'goods_no' => 'SP002', 'goods_name' => '智能手表S1', 'quantity' => 0, 'available_quantity' => 0],
            ['warehouse_id' => 4, 'warehouse_code' => 'WH004', 'goods_id' => 3, 'goods_no' => 'SP003', 'goods_name' => '无线充电器', 'quantity' => 350, 'available_quantity' => 340],
            ['warehouse_id' => 4, 'warehouse_code' => 'WH004', 'goods_id' => 4, 'goods_no' => 'SP004', 'goods_name' => '手机壳套装', 'quantity' => 0, 'available_quantity' => 0],
            ['warehouse_id' => 5, 'warehouse_code' => 'WH005', 'goods_id' => 1, 'goods_no' => 'SP001', 'goods_name' => '蓝牙耳机Pro', 'quantity' => 180, 'available_quantity' => 170],
            ['warehouse_id' => 5, 'warehouse_code' => 'WH005', 'goods_id' => 2, 'goods_no' => 'SP002', 'goods_name' => '智能手表S1', 'quantity' => 80, 'available_quantity' => 75],
            ['warehouse_id' => 5, 'warehouse_code' => 'WH005', 'goods_id' => 3, 'goods_no' => 'SP003', 'goods_name' => '无线充电器', 'quantity' => 220, 'available_quantity' => 210],
            ['warehouse_id' => 5, 'warehouse_code' => 'WH005', 'goods_id' => 4, 'goods_no' => 'SP004', 'goods_name' => '手机壳套装', 'quantity' => 450, 'available_quantity' => 430],
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
            } catch (Exception $e) {
            }
        }
        $data = $this->mockData[$table] ?? [];
        foreach ($where as $key => $value) {
            $data = array_filter($data, function($item) use ($key, $value) {
                return $item[$key] === $value;
            });
        }
        return array_values($data);
    }

    private function getInventoriesByGoods($goodsNo) {
        if ($this->db) {
            try {
                $sql = "SELECT wi.*, w.warehouse_name, w.province, w.city, w.longitude, w.latitude 
                        FROM warehouse_inventories wi 
                        LEFT JOIN warehouses w ON wi.warehouse_id = w.id 
                        WHERE wi.goods_no = :goods_no AND wi.status = 1 AND w.status = 1";
                return $this->db->fetchAll($sql, ['goods_no' => $goodsNo]);
            } catch (Exception $e) {
            }
        }
        $inventories = array_filter($this->mockData['inventories'], function($inv) use ($goodsNo) {
            return $inv['goods_no'] === $goodsNo;
        });
        $result = [];
        foreach ($inventories as $inv) {
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
            } catch (Exception $e) {
            }
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
            } catch (Exception $e) {
            }
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
        return round($earth