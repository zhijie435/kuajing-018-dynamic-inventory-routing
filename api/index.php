<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/Db.php';
require_once __DIR__ . '/Response.php';
require_once __DIR__ . '/services/WarehouseRouter.php';

$uri = $_SERVER['REQUEST_URI'] ?? '';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

$basePath = '/api/';
if (strpos($uri, $basePath) === 0) {
    $path = substr($uri, strlen($basePath));
} else {
    $path = $uri;
}

$path = strtok($path, '?');
$path = trim($path, '/');
$segments = explode('/', $path);

$router = new WarehouseRouter();

try {
    switch ($segments[0] ?? '') {
        case 'warehouses':
            if ($method === 'GET') {
                $where = [];
                if (isset($_GET['status'])) $where['status'] = intval($_GET['status']);
                if (isset($_GET['warehouse_code'])) $where['warehouse_code'] = $_GET['warehouse_code'];
                $data = $router->getWarehouses($where);
                Response::success($data);
            } elseif ($method === 'POST') {
                $input = json_decode(file_get_contents('php://input'), true);
                if (!$input) {
                    Response::error('参数错误');
                }
                $result = $router->saveWarehouse($input);
                if ($result) {
                    Response::success(['id' => $result], '保存成功');
                } else {
                    Response::error('保存失败');
                }
            } elseif ($method === 'DELETE' && isset($segments[1])) {
                $id = intval($segments[1]);
                $result = $router->deleteWarehouse($id);
                if ($result) {
                    Response::success(null, '删除成功');
                } else {
                    Response::error('删除失败');
                }
            } else {
                Response::error('不支持的请求', 404);
            }
            break;

        case 'inventories':
            if ($method === 'GET') {
                $where = [];
                if (isset($_GET['warehouse_id'])) $where['warehouse_id'] = intval($_GET['warehouse_id']);
                if (isset($_GET['goods_no'])) $where['goods_no'] = $_GET['goods_no'];
                if (isset($_GET['status'])) $where['status'] = intval($_GET['status']);
                $data = $router->getInventories($where);
                Response::success($data);
            } elseif ($method === 'POST') {
                $input = json_decode(file_get_contents('php://input'), true);
                if (!$input) {
                    Response::error('参数错误');
                }
                $result = $router->saveInventory($input);
                if ($result) {
                    Response::success(['id' => $result], '保存成功');
                } else {
                    Response::error('保存失败');
                }
            } else {
                Response::error('不支持的请求', 404);
            }
            break;

        case 'strategies':
            if ($method === 'GET') {
                $where = [];
                if (isset($_GET['status'])) $where['status'] = intval($_GET['status']);
                if (isset($_GET['strategy_type'])) $where['strategy_type'] = intval($_GET['strategy_type']);
                $data = $router->getStrategies($where);
                Response::success($data);
            } elseif ($method === 'POST') {
                $input = json_decode(file_get_contents('php://input'), true);
                if (!$input) {
                    Response::error('参数错误');
                }
                $result = $router->saveStrategy($input);
                if ($result) {
                    Response::success(['id' => $result], '保存成功');
                } else {
                    Response::error('保存失败');
                }
            } elseif ($method === 'DELETE' && isset($segments[1])) {
                $id = intval($segments[1]);
                $result = $router->deleteStrategy($id);
                if ($result) {
                    Response::success(null, '删除成功');
                } else {
                    Response::error('删除失败');
                }
            } else {
                Response::error('不支持的请求', 404);
            }
            break;

        case 'priority-rules':
            if ($method === 'GET') {
                $where = [];
                if (isset($_GET['status'])) $where['status'] = intval($_GET['status']);
                if (isset($_GET['rule_type'])) $where['rule_type'] = intval($_GET['rule_type']);
                if (isset($_GET['warehouse_code'])) $where['warehouse_code'] = $_GET['warehouse_code'];
                $data = $router->getPriorityRules($where);
                Response::success($data);
            } elseif ($method === 'POST') {
                $input = json_decode(file_get_contents('php://input'), true);
                if (!$input) {
                    Response::error('参数错误');
                }
                $result = $router->savePriorityRule($input);
                if ($result) {
                    Response::success(['id' => $result], '保存成功');
                } else {
                    Response::error('保存失败');
                }
            } elseif ($method === 'DELETE' && isset($segments[1])) {
                $id = intval($segments[1]);
                $result = $router->deletePriorityRule($id);
                if ($result) {
                    Response::success(null, '删除成功');
                } else {
                    Response::error('删除失败');
                }
            } else {
                Response::error('不支持的请求', 404);
            }
            break;

        case 'route':
            if ($segments[1] ?? '' === 'calculate' && $method === 'POST') {
                $input = json_decode(file_get_contents('php://input'), true);
                if (!$input) {
                    Response::error('参数错误');
                }
                $result = $router->calculateRoute($input);
                Response::success($result);
            } else {
                Response::error('不支持的请求', 404);
            }
            break;

        default:
            Response::error('接口不存在', 404);
    }
} catch (Exception $e) {
    Response::error($e->getMessage());
}
