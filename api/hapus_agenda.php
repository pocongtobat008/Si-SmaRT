<?php
require_once '../config/database.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $id = $_POST['id'] ?? 0;
        
        // Hapus fisik file foto yang terkait terlebih dahulu
        $stmtGal = $pdo->prepare("SELECT file_path FROM agenda_gallery WHERE agenda_id = ?");
        $stmtGal->execute([$id]);
        $files = $stmtGal->fetchAll(PDO::FETCH_COLUMN);
        foreach($files as $f) {
            if(file_exists('../' . $f)) unlink('../' . $f);
        }
        
        $stmtLamp = $pdo->prepare("SELECT file_path FROM agenda_lampiran WHERE agenda_id = ?");
        $stmtLamp->execute([$id]);
        $lampFiles = $stmtLamp->fetchAll(PDO::FETCH_COLUMN);
        foreach($lampFiles as $f) {
            if(file_exists('../' . $f)) unlink('../' . $f);
        }
        
        $stmt = $pdo->prepare("DELETE FROM agenda_kegiatan WHERE id = ?");
        $stmt->execute([$id]);
        
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}