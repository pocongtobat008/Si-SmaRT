<?php
require_once '../config/database.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $stmt = $pdo->prepare("UPDATE blok SET periode_mulai_bulan = ?, periode_mulai_tahun = ? WHERE id = ?");
        $stmt->execute([$_POST['bulan'], $_POST['tahun'], $_POST['blok_id']]);
        
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}