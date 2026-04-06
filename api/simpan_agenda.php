<?php
require_once '../config/database.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $id = $_POST['id'] ?? 0;
        $blok_id = $_POST['blok_id'] ?? 0;
        $judul = $_POST['judul'] ?? '';
        $keterangan = $_POST['keterangan'] ?? '';
        $biaya_estimasi = $_POST['biaya_estimasi'] ?? 0;
        $tanggal_kegiatan = $_POST['tanggal_kegiatan'] ?? date('Y-m-d H:i:s');
        $status = $_POST['status'] ?? 'Direncanakan';
        
        if(empty($judul)) throw new Exception("Judul kegiatan tidak boleh kosong");

        if ($id > 0) {
            $stmt = $pdo->prepare("UPDATE agenda_kegiatan SET judul=?, keterangan=?, biaya_estimasi=?, tanggal_kegiatan=?, status=? WHERE id=?");
            $stmt->execute([$judul, $keterangan, $biaya_estimasi, $tanggal_kegiatan, $status, $id]);
            $agenda_id = $id;
        } else {
            $stmt = $pdo->prepare("INSERT INTO agenda_kegiatan (blok_id, judul, keterangan, biaya_estimasi, tanggal_kegiatan, status) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$blok_id, $judul, $keterangan, $biaya_estimasi, $tanggal_kegiatan, $status]);
            $agenda_id = $pdo->lastInsertId();
        }

        // Unggah Gambar (Multifile)
        if ($status === 'Selesai' && isset($_FILES['gallery'])) {
            $uploadDir = '../public/uploads/gallery/';
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
            
            $fileCount = count($_FILES['gallery']['name']);
            for ($i = 0; $i < $fileCount; $i++) {
                if ($_FILES['gallery']['error'][$i] === UPLOAD_ERR_OK) {
                    $tmpName = $_FILES['gallery']['tmp_name'][$i];
                    $fileName = time() . '_' . uniqid() . '_' . basename($_FILES['gallery']['name'][$i]);
                    if (move_uploaded_file($tmpName, $uploadDir . $fileName)) {
                        $stmtGal = $pdo->prepare("INSERT INTO agenda_gallery (agenda_id, file_path) VALUES (?, ?)");
                        $stmtGal->execute([$agenda_id, 'public/uploads/gallery/' . $fileName]);
                    }
                }
            }
        }
        
        // Unggah Lampiran Dokumen
        if (isset($_FILES['lampiran'])) {
            $uploadDir = '../public/uploads/lampiran_agenda/';
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
            
            $fileCount = count($_FILES['lampiran']['name']);
            for ($i = 0; $i < $fileCount; $i++) {
                if ($_FILES['lampiran']['error'][$i] === UPLOAD_ERR_OK) {
                    $tmpName = $_FILES['lampiran']['tmp_name'][$i];
                    $originalName = basename($_FILES['lampiran']['name'][$i]);
                    $fileName = time() . '_' . uniqid() . '_' . $originalName;
                    if (move_uploaded_file($tmpName, $uploadDir . $fileName)) {
                        $stmtLamp = $pdo->prepare("INSERT INTO agenda_lampiran (agenda_id, file_path, file_name) VALUES (?, ?, ?)");
                        $stmtLamp->execute([$agenda_id, 'public/uploads/lampiran_agenda/' . $fileName, $originalName]);
                    }
                }
            }
        }
        
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}