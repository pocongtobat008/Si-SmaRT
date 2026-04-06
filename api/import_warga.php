<?php
require_once '../config/database.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $blok_id = $_POST['blok_id'] ?? 0;

    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK || empty($blok_id)) {
        echo json_encode(['status' => 'error', 'message' => 'File tidak valid atau gagal diunggah.']);
        exit;
    }

    $fileTemp = $_FILES['file']['tmp_name'];
    $imported = 0;

    try {
        $pdo->beginTransaction();
        $stmt = $pdo->prepare("INSERT INTO warga (blok_id, nomor_rumah, nik, nik_kepala, nama_lengkap, no_wa, tempat_lahir, tanggal_lahir, status_pernikahan, status_kependudukan) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        if (($handle = fopen($fileTemp, 'r')) !== FALSE) {
            fgetcsv($handle); // Abaikan baris pertama (Header)
            
            while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
                // Validasi nama kosong
                $nama_lengkap = trim($data[3] ?? '');
                if (empty($nama_lengkap)) continue; // Lewati baris jika nama kosong

                $stmt->execute([
                    $blok_id, 
                    trim($data[0] ?? null), // nomor_rumah
                    trim($data[1] ?? null), // nik (KK)
                    trim($data[2] ?? null), // nik_kepala
                    $nama_lengkap, 
                    trim($data[4] ?? null), // no_wa
                    trim($data[5] ?? null), // tempat_lahir
                    empty(trim($data[6])) ? null : trim($data[6]), // tanggal_lahir
                    trim($data[7] ?? 'Lajang'), // status_pernikahan
                    trim($data[8] ?? 'Tetap')   // status_kependudukan
                ]);
                $imported++;
            }
            fclose($handle);
        }
        $pdo->commit();
        echo json_encode(['status' => 'success', 'imported' => $imported]);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}