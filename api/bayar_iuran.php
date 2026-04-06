<?php
require_once '../config/database.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Ambil tanggal dari form, gabungkan dengan jam saat ini agar valid untuk kolom DATETIME
        $tanggal_input = !empty($_POST['tanggal']) ? $_POST['tanggal'] : date('Y-m-d');
        $tanggal_bayar = $tanggal_input . ' ' . date('H:i:s');

        $stmt = $pdo->prepare("UPDATE pembayaran_iuran SET status = 'LUNAS', tanggal_bayar = ?, metode_pembayaran = ?, jumlah_dibayar = total_tagihan WHERE id = ?");
        $stmt->execute([$tanggal_bayar, $_POST['metode'], $_POST['id']]);
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}