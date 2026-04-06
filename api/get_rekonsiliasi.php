<?php
require_once '../config/database.php';
header('Content-Type: application/json');

$blok_id = $_GET['blok_id'] ?? 0;

try {
    // Cek pengaturan periode mulai pencatatan
    $stmt = $pdo->prepare("SELECT periode_mulai_bulan, periode_mulai_tahun FROM blok WHERE id = ?");
    $stmt->execute([$blok_id]);
    $blok = $stmt->fetch(PDO::FETCH_ASSOC);

    $m_start = $blok['periode_mulai_bulan'];
    $y_start = $blok['periode_mulai_tahun'];

    // Jika belum diatur atau kosong, default ke bulan tagihan terakhir
    if ($m_start === null || $y_start === null || $m_start === "" || $y_start === "") {
        $m_start = (int)date('n') - 2; 
        $y_start = (int)date('Y');
        if ($m_start < 0) { $m_start += 12; $y_start -= 1; }
    } else {
        $m_start = (int)$m_start;
        $y_start = (int)$y_start;
    }

    // Batas akhir kewajiban bayar adalah Bulan Lalu
    $m_now = (int)date('n') - 2;
    $y_now = (int)date('Y');
    if ($m_now < 0) {
        $m_now += 12;
        $y_now -= 1;
    }

    // Hitung ekspektasi berapa bulan warga seharusnya sudah membayar
    $total_expected = (($y_now - $y_start) * 12) + ($m_now - $m_start) + 1;
    if ($total_expected < 1) $total_expected = 0;

    // Hitung Estimasi Nilai Tagihan 1 Bulan (dari Master Iuran)
    $stmtMaster = $pdo->prepare("SELECT SUM(nominal) FROM master_iuran WHERE blok_id = ?");
    $stmtMaster->execute([$blok_id]);
    $total_master = $stmtMaster->fetchColumn() ?: 65000;
    if (!$total_master) {
        $total_master = $pdo->query("SELECT SUM(nominal) FROM master_iuran WHERE blok_id IS NULL")->fetchColumn() ?: 65000;
    }

    $stmtWarga = $pdo->prepare("SELECT id, nama_lengkap, nomor_rumah, no_wa FROM warga WHERE blok_id = ?");
    $stmtWarga->execute([$blok_id]);
    $wargaList = $stmtWarga->fetchAll(PDO::FETCH_ASSOC);

    $rekonsiliasi = [];
    // Rumus membandingkan bulan+tahun ke format numerik agar akurat
    $math_start = $y_start * 12 + $m_start;
    $math_now = $y_now * 12 + $m_now;

    $stmtLunas = $pdo->prepare("SELECT COUNT(*) FROM pembayaran_iuran WHERE warga_id = ? AND status = 'LUNAS' AND (tahun * 12 + bulan) >= ? AND (tahun * 12 + bulan) <= ?");

    foreach ($wargaList as $w) {
        if ($total_expected > 0) {
            $stmtLunas->execute([$w['id'], $math_start, $math_now]);
            $lunas_count = $stmtLunas->fetchColumn();
            
            $tunggakan_bulan = $total_expected - $lunas_count;
            if ($tunggakan_bulan > 0) {
                $w['tunggakan_bulan'] = $tunggakan_bulan;
                $w['estimasi_hutang'] = $tunggakan_bulan * $total_master;
                $rekonsiliasi[] = $w;
            }
        }
    }

    // Urutkan dari tunggakan paling lama (Terbesar ke Terkecil)
    usort($rekonsiliasi, function($a, $b) { return $b['tunggakan_bulan'] <=> $a['tunggakan_bulan']; });

    echo json_encode(['status' => 'success', 'periode_bulan' => $m_start, 'periode_tahun' => $y_start, 'data' => $rekonsiliasi]);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}