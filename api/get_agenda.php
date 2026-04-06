<?php
require_once '../config/database.php';
header('Content-Type: application/json');

$blok_id = $_GET['blok_id'] ?? 0;

try {
    $stmt = $pdo->prepare("SELECT * FROM agenda_kegiatan WHERE blok_id = ? ORDER BY tanggal_kegiatan DESC");
    $stmt->execute([$blok_id]);
    $agendas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $stmtGal = $pdo->prepare("SELECT file_path FROM agenda_gallery WHERE agenda_id = ?");
    $stmtLamp = $pdo->prepare("SELECT file_path, file_name FROM agenda_lampiran WHERE agenda_id = ?");
    
    foreach ($agendas as &$a) {
        $stmtGal->execute([$a['id']]);
        $a['gallery'] = $stmtGal->fetchAll(PDO::FETCH_COLUMN);
        
        $stmtLamp->execute([$a['id']]);
        $a['lampiran'] = $stmtLamp->fetchAll(PDO::FETCH_ASSOC);
    }

    echo json_encode(['status' => 'success', 'data' => $agendas]);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}