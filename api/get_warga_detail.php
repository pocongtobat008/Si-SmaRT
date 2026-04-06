<?php
require_once '../config/database.php';
header('Content-Type: application/json');

$id = $_GET['id'] ?? 0;

try {
    $stmt = $pdo->prepare("SELECT * FROM warga WHERE id = ?");
    $stmt->execute([$id]);
    $warga = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode($warga);
} catch (Exception $e) {
    echo json_encode(null);
}