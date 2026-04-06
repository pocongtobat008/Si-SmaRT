<?php
require_once '../config/database.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $id = $_POST['id'] ?? 0;
        
        // Hapus file fisik lampiran terlebih dahulu
        $stmtLamp = $pdo->prepare("SELECT file_path FROM laporan_lampiran WHERE laporan_id = ?");
        $stmtLamp->execute([$id]);
        $files = $stmtLamp->fetchAll(PDO::FETCH_COLUMN);
        foreach($files as $f) {
            if(file_exists('../' . $f)) unlink('../' . $f);
        }
        
        $stmt = $pdo->prepare("DELETE FROM laporan_masalah WHERE id = ?");
        $stmt->execute([$id]);
        
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}