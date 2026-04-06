<?php
require_once '../config/database.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $file_path = $_POST['file_path'] ?? '';
        $laporan_id = $_POST['laporan_id'] ?? 0;
        
        $stmt = $pdo->prepare("DELETE FROM laporan_lampiran WHERE laporan_id = ? AND file_path = ?");
        $stmt->execute([$laporan_id, $file_path]);
        
        if (file_exists('../' . $file_path)) unlink('../' . $file_path);
        
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}