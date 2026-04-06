<?php
require_once '../config/database.php';

$blok_id = $_GET['blok_id'] ?? 0;

header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="Data_Warga_Blok_'.$blok_id.'.csv"');

$output = fopen('php://output', 'w');

// Tambahkan BOM untuk memastikan Excel membaca format UTF-8 dengan sempurna
fputs($output, $bom = ( chr(0xEF) . chr(0xBB) . chr(0xBF) ));

// Header Kolom Excel
fputcsv($output, ['No Rumah', 'No KK', 'NIK Kepala Keluarga', 'Nama Lengkap', 'No WhatsApp', 'Tempat Lahir', 'Tanggal Lahir (YYYY-MM-DD)', 'Status Pernikahan', 'Status Warga']);

try {
    $stmt = $pdo->prepare("SELECT nomor_rumah, nik, nik_kepala, nama_lengkap, no_wa, tempat_lahir, tanggal_lahir, status_pernikahan, status_kependudukan FROM warga WHERE blok_id = ? ORDER BY nomor_rumah ASC");
    $stmt->execute([$blok_id]);
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        fputcsv($output, $row);
    }
} catch (Exception $e) {
    fputcsv($output, ['Error: ' . $e->getMessage()]);
}
fclose($output);