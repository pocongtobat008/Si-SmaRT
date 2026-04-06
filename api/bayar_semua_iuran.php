<?php
require_once '../config/database.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $stmt = $pdo->prepare("UPDATE pembayaran_iuran p JOIN warga w ON p.warga_id = w.id SET p.status = 'LUNAS', p.tanggal_bayar = NOW(), p.metode_pembayaran = 'Cash' WHERE w.blok_id = ? AND p.bulan = ? AND p.tahun = ? AND p.status = 'MENUNGGAK'");
        $stmt->execute([$_POST['blok_id'], $_POST['bulan'], $_POST['tahun']]);
        echo json_encode(['status' => 'success', 'updated' => $stmt->rowCount()]);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error']);
    }
}