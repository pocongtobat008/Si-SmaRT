<?php
require_once '../config/database.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? 0;
    if (empty($id)) {
        echo json_encode(['status' => 'error', 'message' => 'ID tidak valid!']); exit;
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM warga WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}