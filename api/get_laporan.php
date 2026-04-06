<?php
require_once '../config/database.php';
header('Content-Type: application/json');

$blok_id = $_GET['blok_id'] ?? 0;

try {
    $stmt = $pdo->prepare("SELECT * FROM laporan_masalah WHERE blok_id = ? ORDER BY tanggal_laporan DESC");
    $stmt->execute([$blok_id]);
    $laporans = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $stmtLamp = $pdo->prepare("SELECT file_path, file_name FROM laporan_lampiran WHERE laporan_id = ?");
    foreach ($laporans as &$l) {
        $stmtLamp->execute([$l['id']]);
        $l['lampiran'] = $stmtLamp->fetchAll(PDO::FETCH_ASSOC);
    }
    
    echo json_encode(['status' => 'success', 'data' => $laporans]);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}