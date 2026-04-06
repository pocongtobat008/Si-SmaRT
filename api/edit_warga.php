<?php
require_once '../config/database.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? 0;
    $nama_lengkap = $_POST['nama_lengkap'] ?? '';
    $nik = $_POST['nik'] ?? '';
    $nik_kepala = $_POST['nik_kepala'] ?? '';
    $no_wa = $_POST['no_wa'] ?? '';

    if (empty($nama_lengkap) || empty($id)) {
        echo json_encode(['status' => 'error', 'message' => 'Nama Kepala Keluarga & ID Warga wajib diisi!']);
        exit;
    }

    // Validasi angka
    if ((!empty($nik) && !preg_match('/^[0-9]+$/', $nik)) || (!empty($nik_kepala) && !preg_match('/^[0-9]+$/', $nik_kepala)) || (!empty($no_wa) && !preg_match('/^[0-9]+$/', $no_wa))) {
        echo json_encode(['status' => 'error', 'message' => 'No KK, NIK Kepala, dan No WhatsApp harus murni angka!']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("
            UPDATE warga SET nik = ?, nik_kepala = ?, nama_lengkap = ?, nomor_rumah = ?, no_wa = ?, tempat_lahir = ?, tanggal_lahir = ?, status_pernikahan = ?, status_kependudukan = ?
            WHERE id = ?
        ");
        $stmt->execute([$nik, $nik_kepala, $nama_lengkap, $_POST['nomor_rumah'], $no_wa, $_POST['tempat_lahir'], empty($_POST['tanggal_lahir']) ? null : $_POST['tanggal_lahir'], $_POST['status_pernikahan'], $_POST['status_kependudukan'], $id]);
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}