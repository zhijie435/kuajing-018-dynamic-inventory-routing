<?php
declare(strict_types=1);

define('PROJECT_ROOT', __DIR__);
define('MIGRATIONS_DIR', PROJECT_ROOT . '/database/migrations');
define('MIGRATIONS_TABLE', '_migrations');

function env($key, $default = null) {
    static $loaded = false;
    if (!$loaded && file_exists(PROJECT_ROOT . '/.env')) {
        $lines = @file(PROJECT_ROOT . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];
        foreach ($lines as $line) {
            if (strpos(trim($line), '#') === 0) continue;
            if (strpos($line, '=') === false) continue;
            list($k, $v) = explode('=', $line, 2);
            $k = trim($k); $v = trim($v);
            if (strlen($v) >= 2 && $v[0] === '"' && $v[strlen($v)-1] === '"') $v = substr($v, 1, -1);
            if ($v === 'true') { $_ENV[$k] = true; putenv("$k=true"); }
            elseif ($v === 'false') { $_ENV[$k] = false; putenv("$k=false"); }
            elseif ($v === 'null') { $_ENV[$k] = null; putenv("$k=null"); }
            else { $_ENV[$k] = $v; putenv("$k=$v"); }
        }
        $loaded = true;
    }
    $v = getenv($key);
    if ($v === false) return $default;
    if ($v === 'true') return true;
    if ($v === 'false') return false;
    if ($v === 'null') return null;
    return $v;
}

function getDb(): PDO {
    static $pdo = null;
    if ($pdo) return $pdo;
    $driver = env('DB_DRIVER', 'mysql');
    if ($driver === 'sqlite') {
        $path = env('DB_PATH', PROJECT_ROOT . '/data/app.sqlite');
        $dir = dirname($path);
        if (!is_dir($dir)) @mkdir($dir, 0755, true);
        $pdo = new PDO('sqlite:' . $path);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        $pdo->exec('PRAGMA foreign_keys = ON');
        return $pdo;
    }
    $host = env('DB_HOST', 'localhost');
    $port = (int)env('DB_PORT', 3306);
    $name = env('DB_NAME', 'ecommerce_settlement');
    $user = env('DB_USER', 'root');
    $pass = env('DB_PASS', '');
    $charset = env('DB_CHARSET', 'utf8mb4');
    $dsn = "mysql:host=$host;port=$port;charset=$charset";
    try {
        $pdo = new PDO($dsn, $user, $pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    } catch (PDOException $e) {
        fwrite(STDERR, "[ERROR] 数据库连接失败: " . $e->getMessage() . PHP_EOL);
        exit(1);
    }
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$name` DEFAULT CHARACTER SET $charset COLLATE utf8mb4_unicode_ci;");
    $pdo->exec("USE `$name`;");
    return $pdo;
}

function ensureMigrationTable(PDO $pdo, string $driver): void {
    if ($driver === 'sqlite') {
        $sql = "CREATE TABLE IF NOT EXISTS `_migrations` (
            `id` INTEGER PRIMARY KEY AUTOINCREMENT,
            `migration` VARCHAR(255) NOT NULL UNIQUE,
            `batch` INTEGER NOT NULL,
            `description` VARCHAR(500),
            `migrated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        )";
    } else {
        $sql = "CREATE TABLE IF NOT EXISTS `_migrations` (
            `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
            `migration` VARCHAR(255) NOT NULL UNIQUE,
            `batch` INT(11) NOT NULL,
            `description` VARCHAR(500) DEFAULT NULL,
            `migrated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            KEY `idx_batch` (`batch`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='迁移台账表'";
    }
    $pdo->exec($sql);
}

function loadMigrations(): array {
    $files = glob(MIGRATIONS_DIR . '/*.php');
    if (!$files) return [];
    sort($files);
    $result = [];
    foreach ($files as $file) {
        $name = basename($file, '.php');
        $obj = require $file;
        $result[$name] = ['file' => $file, 'name' => $name, 'obj' => $obj];
    }
    return $result;
}

function getMigrated(PDO $pdo): array {
    $stmt = $pdo->query("SELECT `migration`, `batch` FROM `_migrations` ORDER BY `batch` DESC, `id` DESC");
    $rows = $stmt->fetchAll();
    $r = [];
    foreach ($rows as $row) $r[$row['migration']] = (int)$row['batch'];
    return $r;
}

function cmdStatus(): void {
    $pdo = getDb();
    $driver = env('DB_DRIVER', 'mysql');
    ensureMigrationTable($pdo, $driver);
    $migrations = loadMigrations();
    $migrated = getMigrated($pdo);
    echo str_repeat('=', 80) . PHP_EOL;
    echo sprintf(" 迁移状态台账 (共 %d 个迁移文件, 已执行 %d 个)", count($migrations), count($migrated)) . PHP_EOL;
    echo str_repeat('=', 80) . PHP_EOL;
    echo sprintf(" %-6s  %-42s  %-6s  %s", '编号', '迁移名称', '批次', '状态 / 描述') . PHP_EOL;
    echo str_repeat('-', 80) . PHP_EOL;
    $pending = $done = 0;
    foreach ($migrations as $name => $m) {
        $obj = $m['obj'];
        $batch = method_exists($obj, 'batch') ? $obj->batch() : '?';
        $desc = method_exists($obj, 'description') ? $obj->description() : '';
        if (isset($migrated[$name])) {
            $status = "[✓ 已执行] (batch={$migrated[$name]})";
            $done++;
        } else {
            $status = "[○ 待执行]";
            $pending++;
        }
        echo sprintf(" %-6s  %-42s  %-6s  %s %s", substr($name, 0, 6), $name, $batch, $status, $desc ? "[$desc]" : '') . PHP_EOL;
    }
    echo str_repeat('-', 80) . PHP_EOL;
    echo " 汇总: 已执行 $done, 待执行 $pending" . PHP_EOL;
}

function cmdRun(): void {
    $pdo = getDb();
    $driver = env('DB_DRIVER', 'mysql');
    ensureMigrationTable($pdo, $driver);
    $migrations = loadMigrations();
    $migrated = getMigrated($pdo);
    $stmt = $pdo->query("SELECT COALESCE(MAX(batch), 0) as b FROM `_migrations`");
    $maxBatch = (int)$stmt->fetch()['b'];
    $pending = [];
    foreach ($migrations as $name => $m) if (!isset($migrated[$name])) $pending[$name] = $m;
    if (!$pending) { echo "[OK] 所有迁移已执行，没有待执行项。" . PHP_EOL; return; }
    echo "[INFO] 将执行 " . count($pending) . " 个迁移 (当前最大batch=$maxBatch)" . PHP_EOL;
    $pdo->beginTransaction();
    try {
        $count = 0;
        foreach ($pending as $name => $m) {
            echo "  → 执行 $name ... ";
            $obj = $m['obj'];
            $batch = method_exists($obj, 'batch') ? $obj->batch() : ($maxBatch + 1);
            $desc = method_exists($obj, 'description') ? $obj->description() : null;
            foreach ($obj->up() as $sql) {
                if (trim($sql)) $pdo->exec($sql);
            }
            $stmt = $pdo->prepare("INSERT INTO `_migrations` (`migration`, `batch`, `description`) VALUES (?, ?, ?)");
            $stmt->execute([$name, $batch, $desc]);
            echo "OK (batch=$batch)" . PHP_EOL;
            $count++;
        }
        $pdo->commit();
        echo PHP_EOL . "[SUCCESS] 迁移完成！共执行 $count 个迁移文件" . PHP_EOL;
    } catch (Exception $e) {
        $pdo->rollBack();
        fwrite(STDERR, PHP_EOL . "[ERROR] 迁移失败，已回滚: " . $e->getMessage() . PHP_EOL);
        exit(1);
    }
}

function cmdRollback(): void {
    $pdo = getDb();
    $driver = env('DB_DRIVER', 'mysql');
    ensureMigrationTable($pdo, $driver);
    $migrations = loadMigrations();
    $migrated = getMigrated($pdo);
    if (!$migrated) { echo "[OK] 没有已执行的迁移，无需回滚。" . PHP_EOL; return; }
    $maxBatch = max($migrated);
    $toRollback = [];
    foreach ($migrated as $name => $batch) {
        if ($batch === $maxBatch && isset($migrations[$name])) $toRollback[$name] = $migrations[$name];
    }
    krsort($toRollback);
    echo "[INFO] 将回滚批次 batch=$maxBatch 的 " . count($toRollback) . " 个迁移" . PHP_EOL;
    $pdo->beginTransaction();
    try {
        $count = 0;
        foreach ($toRollback as $name => $batch) {
            echo "  ← 回滚 $name ... ";
            $obj = $migrations[$name]['obj'];
            foreach ($obj->down() as $sql) {
                if (trim($sql)) $pdo->exec($sql);
            }
            $stmt = $pdo->prepare("DELETE FROM `_migrations` WHERE `migration` = ?");
            $stmt->execute([$name]);
            echo "OK" . PHP_EOL;
            $count++;
        }
        $pdo->commit();
        echo PHP_EOL . "[SUCCESS] 回滚完成！共回滚 $count 个迁移 (batch=$maxBatch)" . PHP_EOL;
    } catch (Exception $e) {
        $pdo->rollBack();
        fwrite(STDERR, PHP_EOL . "[ERROR] 回滚失败: " . $e->getMessage() . PHP_EOL);
        exit(1);
    }
}

function cmdReset(): void {
    echo "[WARN] 即将删除所有表！此操作不可恢复！" . PHP_EOL;
    echo "  请输入 'YES' 确认继续: ";
    $confirm = trim(fgets(STDIN));
    if ($confirm !== 'YES') { echo "[ABORT] 已取消。" . PHP_EOL; exit(0); }
    $pdo = getDb();
    $driver = env('DB_DRIVER', 'mysql');
    if ($driver === 'sqlite') {
        $tables = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")->fetchAll();
        $pdo->exec('PRAGMA foreign_keys = OFF');
        foreach ($tables as $t) {
            echo "  DROP TABLE {$t['name']} ... " . PHP_EOL;
            $pdo->exec("DROP TABLE IF EXISTS `{$t['name']}`");
        }
        $pdo->exec('PRAGMA foreign_keys = ON');
    } else {
        $name = env('DB_NAME', 'ecommerce_settlement');
        $pdo->exec("DROP DATABASE IF EXISTS `$name`");
        $charset = env('DB_CHARSET', 'utf8mb4');
        $pdo->exec("CREATE DATABASE `$name` DEFAULT CHARACTER SET $charset COLLATE utf8mb4_unicode_ci");
        $pdo->exec("USE `$name`");
    }
    echo PHP_EOL . "[SUCCESS] 数据库已重置！" . PHP_EOL;
}

function cmdSeed(): void {
    $seedFile = MIGRATIONS_DIR . '/000010_seed_initial_data.php';
    if (!file_exists($seedFile)) {
        fwrite(STDERR, "[ERROR] 种子数据迁移文件不存在: $seedFile" . PHP_EOL);
        exit(1);
    }
    $pdo = getDb();
    $obj = require $seedFile;
    echo "[INFO] 正在导入种子数据..." . PHP_EOL;
    foreach ($obj->up() as $i => $sql) {
        if (!trim($sql)) continue;
        echo "  → 种子段 #" . ($i+1) . " ... ";
        foreach (array_filter(array_map('trim', explode(';', $sql))) as $s) {
            try { $pdo->exec($s); } catch (Throwable $e) { /* 忽略重复数据 */ }
        }
        echo "OK" . PHP_EOL;
    }
    echo PHP_EOL . "[SUCCESS] 种子数据导入完成！" . PHP_EOL;
}

$cmd = $argv[1] ?? 'status';
$map = [
    'status' => 'cmdStatus', 's' => 'cmdStatus',
    'run' => 'cmdRun', 'r' => 'cmdRun', 'up' => 'cmdRun',
    'rollback' => 'cmdRollback', 'rb' => 'cmdRollback', 'down' => 'cmdRollback',
    'reset' => 'cmdReset', 'fresh' => 'cmdReset',
    'seed' => 'cmdSeed',
];

if ($cmd === 'help' || $cmd === 'h' || !isset($map[$cmd])) {
    echo "电商订单库存后台 - 数据库迁移执行器" . PHP_EOL . PHP_EOL;
    echo "用法: php migration_runner.php <command>" . PHP_EOL . PHP_EOL;
    echo "命令:" . PHP_EOL;
    echo "  status, s    查看迁移状态台账" . PHP_EOL;
    echo "  run, r, up   执行全部待执行迁移" . PHP_EOL;
    echo "  rollback,rb,down  回滚最后一批迁移" . PHP_EOL;
    echo "  reset, fresh 重置数据库(删除所有表)" . PHP_EOL;
    echo "  seed         导入种子数据" . PHP_EOL;
    echo "  help, h      显示帮助" . PHP_EOL;
    exit(0);
}

if (!is_dir(MIGRATIONS_DIR)) @mkdir(MIGRATIONS_DIR, 0755, true);
call_user_func($map[$cmd]);
