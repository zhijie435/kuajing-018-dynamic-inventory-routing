<?php
class Response {
    public static function success($data = null, $msg = 'success', $code = 0) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'code' => $code,
            'msg' => $msg,
            'data' => $data
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    public static function error($msg = 'error', $code = 1, $data = null) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'code' => $code,
            'msg' => $msg,
            'data' => $data
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    public static function paginate($list, $total, $page = 1, $pageSize = 20, $msg = 'success') {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'code' => 0,
            'msg' => $msg,
            'data' => [
                'list' => $list,
                'total' => $total,
                'page' => $page,
                'page_size' => $pageSize,
                'total_pages' => ceil($total / $pageSize)
            ]
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}
