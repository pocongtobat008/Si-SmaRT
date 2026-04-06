<?php
require_once '../config/database.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $status = $_POST['status'];
        $tgl_bayar = null;
        $tgl_setor = null;
        
        if ($status === 'LUNAS') {
            $tgl_bayar = !empty($_POST['tgl_bayar']) ? $_POST['tgl_bayar'] . ' 12:00:00' : date('Y-m-d H:i:s');
            $tgl_setor = !empty($_POST['tgl_setor']) ? $_POST['tgl_setor'] . ' 12:00:00' : null;
        }

        $stmt = $pdo->prepare("UPDATE pembayaran_iuran SET total_tagihan = ?, status = ?, metode_pembayaran = ?, tanggal_bayar = ?, tanggal_setor = ? WHERE id = ?");
        $stmt->execute([$_POST['tagihan'], $status, $_POST['metode'], $tgl_bayar, $tgl_setor, $_POST['id']]);
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}