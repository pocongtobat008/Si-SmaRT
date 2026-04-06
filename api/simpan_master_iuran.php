<?php
require_once '../config/database.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $blok_id = $_POST['blok_id'] ?? 0;
    $komponen = $_POST['komponen'] ?? [];
    $nominal = $_POST['nominal'] ?? [];

    try {
        $pdo->beginTransaction();
        
        // Hapus konfigurasi master yang lama KHUSUS untuk blok ini
        $stmtDel = $pdo->prepare("DELETE FROM master_iuran WHERE blok_id = ?");
        $stmtDel->execute([$blok_id]);
        
        $stmt = $pdo->prepare("INSERT INTO master_iuran (blok_id, nama_komponen, nominal) VALUES (?, ?, ?)");
        for ($i = 0; $i < count($komponen); $i++) {
            if (!empty(trim($komponen[$i])) && is_numeric($nominal[$i])) {
                $stmt->execute([$blok_id, trim($komponen[$i]), $nominal[$i]]);
            }
        }
        $pdo->commit();
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}