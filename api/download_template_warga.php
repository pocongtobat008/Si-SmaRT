<?php
header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="Template_Import_Warga.csv"');

$output = fopen('php://output', 'w');

// Header Kolom Excel Terlengkap
fputcsv($output, ['No Rumah', 'No KK', 'NIK Kepala Keluarga', 'Nama Lengkap', 'No WhatsApp', 'Tempat Lahir', 'Tanggal Lahir (YYYY-MM-DD)', 'Status Pernikahan', 'Status Warga']);

// Baris ke-2 sebagai Contoh Pengisian
fputcsv($output, ['A-01', '3201010000000000', '3201012345678901', 'Budi Santoso', '081234567890', 'Jakarta', '1980-01-01', 'Menikah', 'Tetap']);
fputcsv($output, ['A-02', '', '', 'Siti Aminah', '', '', '', 'Lajang', 'Kontrak']);

fclose($output);
exit;