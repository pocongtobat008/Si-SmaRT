<?php
require_once '../config/database.php';
header('Content-Type: application/json');

$blok_id = $_GET['blok_id'] ?? 0;

try {
    // Ambil data warga berdasarkan ID Blok
    $stmt = $pdo->prepare("SELECT * FROM warga WHERE blok_id = ? ORDER BY nama_lengkap ASC");
    $stmt->execute([$blok_id]);
    $warga = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($warga);
} catch (Exception $e) {
    echo json_encode([]);
}