<?php
require_once '../config/database.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $file_path = $_POST['file_path'] ?? '';
        $agenda_id = $_POST['agenda_id'] ?? 0;
        
        $stmt = $pdo->prepare("DELETE FROM agenda_lampiran WHERE agenda_id = ? AND file_path = ?");
        $stmt->execute([$agenda_id, $file_path]);
        
        if (file_exists('../' . $file_path)) unlink('../' . $file_path);
        
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}