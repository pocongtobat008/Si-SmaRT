<?php
require_once '../config/database.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $ids = json_decode($_POST['ids'] ?? '[]');
        
        if (empty($ids) || !is_array($ids)) {
            echo json_encode(['status' => 'error', 'message' => 'Tidak ada tagihan yang dipilih.']);
            exit;
        }

        $tanggal_bayar = date('Y-m-d H:i:s');
        $inQuery = implode(',', array_fill(0, count($ids), '?'));
        
        $stmt = $pdo->prepare("UPDATE pembayaran_iuran SET status = 'LUNAS', tanggal_bayar = ?, metode_pembayaran = 'Cash', jumlah_dibayar = total_tagihan WHERE id IN ($inQuery) AND status = 'MENUNGGAK'");
        
        $params = array_merge([$tanggal_bayar], $ids);
        $stmt->execute($params);
        
        echo json_encode(['status' => 'success', 'updated' => $stmt->rowCount()]);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}