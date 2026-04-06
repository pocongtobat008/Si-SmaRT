<?php
require_once '../config/database.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $tanggal_input = !empty($_POST['tanggal']) ? $_POST['tanggal'] : date('Y-m-d');
        $tanggal_setor = $tanggal_input . ' ' . date('H:i:s');

        // Update semua tagihan LUNAS yang BELUM disetorkan pada bulan dan blok yang dipilih
        $stmt = $pdo->prepare("
            UPDATE pembayaran_iuran p 
            JOIN warga w ON p.warga_id = w.id 
            SET p.tanggal_setor = ? 
            WHERE w.blok_id = ? AND p.bulan = ? AND p.tahun = ? AND p.status = 'LUNAS' AND p.tanggal_setor IS NULL
        ");
        $stmt->execute([$tanggal_setor, $_POST['blok_id'], $_POST['bulan'], $_POST['tahun']]);
        
        echo json_encode(['status' => 'success', 'updated' => $stmt->rowCount()]);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}