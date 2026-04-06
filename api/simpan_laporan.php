<?php
require_once '../config/database.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $id = $_POST['id'] ?? 0;
        $blok_id = $_POST['blok_id'] ?? 0;
        $judul = $_POST['judul'] ?? '';
        $keterangan = $_POST['keterangan'] ?? '';
        $status = $_POST['status'] ?? 'Baru';
        $tanggal_laporan = $_POST['tanggal_laporan'] ?? date('Y-m-d H:i:s');
        $tanggal_selesai = !empty($_POST['tanggal_selesai']) ? $_POST['tanggal_selesai'] : null;
        
        if(empty($judul)) throw new Exception("Judul laporan tidak boleh kosong");

        if ($id > 0) {
            $stmt = $pdo->prepare("UPDATE laporan_masalah SET judul_laporan=?, keterangan=?, status=?, tanggal_laporan=?, tanggal_selesai=? WHERE id=?");
            $stmt->execute([$judul, $keterangan, $status, $tanggal_laporan, $tanggal_selesai, $id]);
            $laporan_id = $id;
        } else {
            $stmt = $pdo->prepare("INSERT INTO laporan_masalah (blok_id, warga_id, judul_laporan, keterangan, status, tanggal_laporan, tanggal_selesai) VALUES (?, NULL, ?, ?, ?, ?, ?)");
            $stmt->execute([$blok_id, $judul, $keterangan, $status, $tanggal_laporan, $tanggal_selesai]);
            $laporan_id = $pdo->lastInsertId();
        }
        
        // Unggah Lampiran
        if (isset($_FILES['lampiran'])) {
            $uploadDir = '../public/uploads/lampiran_laporan/';
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
            
            $fileCount = count($_FILES['lampiran']['name']);
            for ($i = 0; $i < $fileCount; $i++) {
                if ($_FILES['lampiran']['error'][$i] === UPLOAD_ERR_OK) {
                    $tmpName = $_FILES['lampiran']['tmp_name'][$i];
                    $originalName = basename($_FILES['lampiran']['name'][$i]);
                    $fileName = time() . '_' . uniqid() . '_' . $originalName;
                    if (move_uploaded_file($tmpName, $uploadDir . $fileName)) {
                        $stmtLamp = $pdo->prepare("INSERT INTO laporan_lampiran (laporan_id, file_path, file_name) VALUES (?, ?, ?)");
                        $stmtLamp->execute([$laporan_id, 'public/uploads/lampiran_laporan/' . $fileName, $originalName]);
                    }
                }
            }
        }

        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}