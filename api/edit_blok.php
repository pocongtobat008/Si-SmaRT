<?php
require_once '../config/database.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? 0;
    $nama_blok = $_POST['nama_blok'] ?? '';
    $koordinator = $_POST['koordinator'] ?? '';

    if (empty($nama_blok) || empty($id)) {
        echo json_encode(['status' => 'error', 'message' => 'Data tidak lengkap!']);
        exit;
    }

    $logo_text = preg_match('/[A-Z0-9]$/i', $nama_blok, $match) ? strtoupper($match[0]) : substr(strtoupper($nama_blok), 0, 1);

    $logo_image = null;
    if (isset($_FILES['logo_image']) && $_FILES['logo_image']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = '../public/uploads/';
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
        
        $fileName = time() . '_' . basename($_FILES['logo_image']['name']);
        $targetPath = $uploadDir . $fileName;
        
        if (move_uploaded_file($_FILES['logo_image']['tmp_name'], $targetPath)) {
            $logo_image = 'public/uploads/' . $fileName;
        }
    }

    try {
        if ($logo_image) {
            $stmt = $pdo->prepare("UPDATE blok SET nama_blok = ?, koordinator = ?, logo_text = ?, logo_image = ? WHERE id = ?");
            $stmt->execute([$nama_blok, $koordinator, $logo_text, $logo_image, $id]);
        } else {
            $stmt = $pdo->prepare("UPDATE blok SET nama_blok = ?, koordinator = ?, logo_text = ? WHERE id = ?");
            $stmt->execute([$nama_blok, $koordinator, $logo_text, $id]);
        }
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}