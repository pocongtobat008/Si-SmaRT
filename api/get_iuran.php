<?php
require_once '../config/database.php';
header('Content-Type: application/json');

$blok_id = $_GET['blok_id'] ?? 0;
$bulan = $_GET['bulan'] ?? date('n') - 1;
$tahun = $_GET['tahun'] ?? date('Y');

try {
    // Ambil detail master iuran khusus blok ini
    $stmtMaster = $pdo->prepare("SELECT id, nama_komponen, nominal FROM master_iuran WHERE blok_id = ?");
    $stmtMaster->execute([$blok_id]);
    $masterList = $stmtMaster->fetchAll(PDO::FETCH_ASSOC);
    
    // Jika belum ada pengaturan khusus blok, gunakan pengaturan default (NULL)
    if (empty($masterList)) {
        $stmtMaster = $pdo->query("SELECT id, nama_komponen, nominal FROM master_iuran WHERE blok_id IS NULL");
        $masterList = $stmtMaster->fetchAll(PDO::FETCH_ASSOC);
    }

    $total_master = 0;
    foreach ($masterList as $m) {
        $total_master += $m['nominal'];
    }

    // Cek Warga di blok ini
    $stmtWarga = $pdo->prepare("SELECT id, nama_lengkap, nomor_rumah, no_wa FROM warga WHERE blok_id = ?");
    $stmtWarga->execute([$blok_id]);
    $wargaList = $stmtWarga->fetchAll(PDO::FETCH_ASSOC);

    // Insert tagihan otomatis jika belum ada untuk bulan tsb
    $stmtCek = $pdo->prepare("SELECT id FROM pembayaran_iuran WHERE warga_id = ? AND bulan = ? AND tahun = ?");
    $stmtInsert = $pdo->prepare("INSERT INTO pembayaran_iuran (warga_id, bulan, tahun, total_tagihan, status) VALUES (?, ?, ?, ?, 'MENUNGGAK')");

    foreach ($wargaList as $w) {
        $stmtCek->execute([$w['id'], $bulan, $tahun]);
        if (!$stmtCek->fetch()) {
            $stmtInsert->execute([$w['id'], $bulan, $tahun, $total_master]);
        }
    }

    // Ambil Data Iuran Lengkap
    $stmtData = $pdo->prepare("SELECT p.*, w.nama_lengkap, w.nomor_rumah, w.no_wa, DATE_FORMAT(p.tanggal_bayar, '%d %b %Y') as tgl_bayar, DATE_FORMAT(p.tanggal_setor, '%d %b %Y') as tgl_setor FROM pembayaran_iuran p JOIN warga w ON p.warga_id = w.id WHERE w.blok_id = ? AND p.bulan = ? AND p.tahun = ? ORDER BY w.nomor_rumah ASC");
    $stmtData->execute([$blok_id, $bulan, $tahun]);
    
    echo json_encode([
        'status' => 'success',
        'data' => $stmtData->fetchAll(PDO::FETCH_ASSOC),
        'master' => $masterList
    ]);
} catch (Exception $e) {
    echo json_encode(['error' => true, 'message' => $e->getMessage()]);
}