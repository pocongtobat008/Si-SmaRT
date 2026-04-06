<?php
require_once '../config/database.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? 0;

    if (empty($id)) {
        echo json_encode(['status' => 'error', 'message' => 'ID Blok tidak valid!']);
        exit;
    }

    try {
        // Cek apakah masih ada data warga di blok ini
        $stmtCheck = $pdo->prepare("SELECT COUNT(*) FROM warga WHERE blok_id = ?");
        $stmtCheck->execute([$id]);
        $count = $stmtCheck->fetchColumn();

        if ($count > 0) {
            echo json_encode(['status' => 'error', 'message' => 'Tidak dapat menghapus blok yang masih memiliki data warga! Kosongkan warga terlebih dahulu.']);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM blok WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}