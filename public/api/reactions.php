<?php
// Emoji reactions for blog posts and series.
//
//   GET  /api/reactions.php?target=post:<slug>&visitor=<uuid>
//   POST /api/reactions.php   {"target":"post:<slug>","emoji":"1f60d","visitor":"<uuid>","on":true}
//
// Both answer with {"counts":{"1f60d":3,...},"mine":["1f60d"]}. A visitor is a
// random id the browser keeps; each visitor can toggle each emoji once per
// target. Writes are rate limited per IP, and IPs are only stored as salted
// hashes. Tables create themselves on first use. Credentials come from
// config.php, which the deploy script writes from .env.deploy; it is never in
// git. Written for PHP 7.4+ so it runs on whatever the host provides.
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

const EMOJI = ['1f60d', '1f525', '1f92f', '1f44f', '1f914'];
const WRITE_LIMIT = 40;    // reaction changes allowed per IP...
const WRITE_WINDOW = 600;  // ...per this many seconds

function reply(int $status, array $body): void
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_SLASHES);
    exit;
}

function valid_target(string $t): bool
{
    if (!preg_match('/^(post|series):[a-z0-9][a-z0-9-]{0,98}$/', $t)) {
        return false;
    }
    // The build writes every real post and series id here, so reactions can't
    // be created for pages that don't exist.
    static $known = null;
    if ($known === null) {
        $file = __DIR__ . '/targets.json';
        $list = is_file($file) ? json_decode((string) file_get_contents($file), true) : null;
        $known = is_array($list) ? array_flip($list) : false;
    }
    return $known === false || isset($known[$t]);
}

function valid_visitor(string $v): bool
{
    return (bool) preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/', $v);
}

function state(PDO $pdo, string $target, string $visitor): array
{
    $counts = array_fill_keys(EMOJI, 0);
    $st = $pdo->prepare('SELECT emoji, COUNT(*) AS n FROM blog_reactions WHERE target = ? GROUP BY emoji');
    $st->execute([$target]);
    foreach ($st->fetchAll() as $row) {
        if (array_key_exists($row['emoji'], $counts)) {
            $counts[$row['emoji']] = (int) $row['n'];
        }
    }
    $mine = [];
    if ($visitor !== '') {
        $st = $pdo->prepare('SELECT emoji FROM blog_reactions WHERE target = ? AND visitor = ?');
        $st->execute([$target, $visitor]);
        $mine = array_values(array_intersect(EMOJI, array_column($st->fetchAll(), 'emoji')));
    }
    return ['counts' => $counts, 'mine' => $mine];
}

$configFile = __DIR__ . '/config.php';
if (!is_file($configFile)) {
    reply(503, ['error' => 'not_configured']);
}
$config = require $configFile;

try {
    $pdo = new PDO(
        sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', $config['host'], $config['name']),
        $config['user'],
        $config['pass'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
} catch (Throwable $e) {
    reply(503, ['error' => 'database_unavailable']);
}

try {
    $pdo->exec('CREATE TABLE IF NOT EXISTS blog_reactions (
        target VARCHAR(100) NOT NULL,
        emoji VARCHAR(16) NOT NULL,
        visitor CHAR(36) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (target, emoji, visitor),
        KEY by_target (target)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');
    $pdo->exec('CREATE TABLE IF NOT EXISTS blog_reaction_writes (
        ip_hash CHAR(64) NOT NULL,
        at INT UNSIGNED NOT NULL,
        KEY by_ip (ip_hash, at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');

    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

    if ($method === 'GET') {
        $target = (string) ($_GET['target'] ?? '');
        $visitor = (string) ($_GET['visitor'] ?? '');
        if (!valid_target($target)) {
            reply(400, ['error' => 'bad_target']);
        }
        if ($visitor !== '' && !valid_visitor($visitor)) {
            $visitor = '';
        }
        reply(200, state($pdo, $target, $visitor));
    }

    if ($method !== 'POST') {
        reply(405, ['error' => 'method_not_allowed']);
    }

    // JSON only: a plain cross-site form can't send it, which keeps drive-by
    // form spam out without needing tokens.
    if (strpos((string) ($_SERVER['CONTENT_TYPE'] ?? ''), 'application/json') !== 0) {
        reply(415, ['error' => 'json_only']);
    }
    $in = json_decode((string) file_get_contents('php://input'), true);
    if (!is_array($in)) {
        reply(400, ['error' => 'bad_json']);
    }
    $target = (string) ($in['target'] ?? '');
    $emoji = (string) ($in['emoji'] ?? '');
    $visitor = (string) ($in['visitor'] ?? '');
    $on = ($in['on'] ?? null) === true;
    if (!valid_target($target) || !in_array($emoji, EMOJI, true) || !valid_visitor($visitor)) {
        reply(400, ['error' => 'bad_request']);
    }

    $ipHash = hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . '|' . $config['salt']);
    $now = time();
    $pdo->prepare('DELETE FROM blog_reaction_writes WHERE at < ?')->execute([$now - WRITE_WINDOW]);
    $st = $pdo->prepare('SELECT COUNT(*) FROM blog_reaction_writes WHERE ip_hash = ? AND at >= ?');
    $st->execute([$ipHash, $now - WRITE_WINDOW]);
    if ((int) $st->fetchColumn() >= WRITE_LIMIT) {
        reply(429, ['error' => 'slow_down']);
    }
    $pdo->prepare('INSERT INTO blog_reaction_writes (ip_hash, at) VALUES (?, ?)')->execute([$ipHash, $now]);

    if ($on) {
        $pdo->prepare('INSERT IGNORE INTO blog_reactions (target, emoji, visitor) VALUES (?, ?, ?)')
            ->execute([$target, $emoji, $visitor]);
    } else {
        $pdo->prepare('DELETE FROM blog_reactions WHERE target = ? AND emoji = ? AND visitor = ?')
            ->execute([$target, $emoji, $visitor]);
    }
    reply(200, state($pdo, $target, $visitor));
} catch (Throwable $e) {
    error_log('reactions: ' . $e->getMessage());
    reply(500, ['error' => 'server_error']);
}
