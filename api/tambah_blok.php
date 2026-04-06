<?php
require_once '../config/database.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nama_blok = $_POST['nama_blok'] ?? '';
    $koordinator = $_POST['koordinator'] ?? 'Belum Ada';

    if (empty($nama_blok)) {
        echo json_encode(['status' => 'error', 'message' => 'Nama blok wajib diisi!']);
        exit;
    }

    $logo_image = null;
    // Proses Upload Gambar (Jika ada)
    if (isset($_FILES['logo_image']) && $_FILES['logo_image']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = '../public/uploads/';
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true); // Buat folder jika belum ada
        
        $fileName = time() . '_' . basename($_FILES['logo_image']['name']);
        $targetPath = $uploadDir . $fileName;
        
        if (move_uploaded_file($_FILES['logo_image']['tmp_name'], $targetPath)) {
            $logo_image = 'public/uploads/' . $fileName;
        }
    }

    // Buat inisial logo (Misal: "Blok C" -> "C")
    $logo_text = preg_match('/[A-Z0-9]$/i', $nama_blok, $match) ? strtoupper($match[0]) : substr(strtoupper($nama_blok), 0, 1);

    try {
        $stmt = $pdo->prepare("INSERT INTO blok (nama_blok, koordinator, logo_text, logo_image) VALUES (?, ?, ?, ?)");
        $stmt->execute([$nama_blok, $koordinator, $logo_text, $logo_image]);
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}