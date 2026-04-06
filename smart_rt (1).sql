-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 06, 2026 at 11:16 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `smart_rt`
--

-- --------------------------------------------------------

--
-- Table structure for table `agenda_gallery`
--

CREATE TABLE `agenda_gallery` (
  `id` int(11) NOT NULL,
  `agenda_id` int(11) NOT NULL,
  `file_path` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `agenda_gallery`
--

INSERT INTO `agenda_gallery` (`id`, `agenda_id`, `file_path`) VALUES
(2, 1, 'public/uploads/gallery/1775462921_69d36a099c57c_Gemini_Generated_Image_xjle90xjle90xjle.png'),
(3, 1, 'public/uploads/gallery/1775462921_69d36a099d005_WhatsApp Image 2026-02-23 at 09.29.58.jpeg'),
(4, 1, 'public/uploads/gallery/1775462921_69d36a099dc2e_WhatsApp Image 2026-02-23 at 09.25.23.jpeg'),
(5, 1, 'public/uploads/gallery/1775462921_69d36a099f083_WhatsApp Image 2026-02-12 at 15.03.12.jpeg'),
(6, 1, 'public/uploads/gallery/1775462921_69d36a099fba5_12223232.png'),
(7, 1, 'public/uploads/gallery/1775462921_69d36a09a0949_Gemini_Generated_Image_rjy067rjy067rjy0 (1).png'),
(8, 1, 'public/uploads/gallery/1775462921_69d36a09a1b06_Gemini_Generated_Image_rjy067rjy067rjy0.png'),
(9, 1, 'public/uploads/gallery/1775462921_69d36a09a25b2_WIN_20260205_11_06_56_Pro.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `agenda_kegiatan`
--

CREATE TABLE `agenda_kegiatan` (
  `id` int(11) NOT NULL,
  `blok_id` int(11) NOT NULL,
  `judul` varchar(255) NOT NULL,
  `keterangan` text DEFAULT NULL,
  `biaya_estimasi` decimal(15,2) DEFAULT 0.00,
  `tanggal_kegiatan` datetime NOT NULL,
  `status` enum('Direncanakan','Selesai','Dibatalkan') DEFAULT 'Direncanakan'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `agenda_kegiatan`
--

INSERT INTO `agenda_kegiatan` (`id`, `blok_id`, `judul`, `keterangan`, `biaya_estimasi`, `tanggal_kegiatan`, `status`) VALUES
(1, 1, 'Kerja Bakti Membersihkan Selokan', 'Diharapkan semua warga Blok A membawa peralatan kebersihan masing-masing. Titik kumpul di taman blok.', 150000.00, '2026-04-25 07:00:00', 'Selesai'),
(3, 1, 'Kerja Bakti Membersihkan Selokan', 'Diharapkan semua warga Blok A membawa peralatan kebersihan masing-masing. Titik kumpul di taman blok.', 150000.00, '2026-04-25 07:00:00', 'Direncanakan'),
(4, 1, 'Lomba 17-an Tingkat Blok', 'Perayaan HUT RI dengan berbagai lomba untuk anak-anak dan dewasa.', 1200000.00, '2025-08-17 08:00:00', 'Selesai');

-- --------------------------------------------------------

--
-- Table structure for table `agenda_lampiran`
--

CREATE TABLE `agenda_lampiran` (
  `id` int(11) NOT NULL,
  `agenda_id` int(11) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `blok`
--

CREATE TABLE `blok` (
  `id` int(11) NOT NULL,
  `nama_blok` varchar(50) NOT NULL,
  `koordinator` varchar(100) DEFAULT 'Belum Ada',
  `kas_blok` decimal(15,2) DEFAULT 0.00,
  `logo_class` varchar(20) DEFAULT 'logo-a',
  `logo_text` varchar(5) DEFAULT 'A',
  `logo_image` varchar(255) DEFAULT NULL,
  `periode_mulai_bulan` int(11) DEFAULT NULL,
  `periode_mulai_tahun` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `blok`
--

INSERT INTO `blok` (`id`, `nama_blok`, `koordinator`, `kas_blok`, `logo_class`, `logo_text`, `logo_image`, `periode_mulai_bulan`, `periode_mulai_tahun`) VALUES
(1, 'Blok A', 'Budi Santoso', 1250000.00, 'logo-a', 'A', 'public/uploads/1775447002_mata.jpg', 3, 2026),
(2, 'Blok B', 'Andi Herlambang', 2100000.00, 'logo-b', 'B', 'public/uploads/1775447150_Gemini_Generated_Image_j3vixpj3vixpj3vi.png', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `laporan_lampiran`
--

CREATE TABLE `laporan_lampiran` (
  `id` int(11) NOT NULL,
  `laporan_id` int(11) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `laporan_masalah`
--

CREATE TABLE `laporan_masalah` (
  `id` int(11) NOT NULL,
  `blok_id` int(11) NOT NULL,
  `warga_id` int(11) DEFAULT NULL,
  `judul_laporan` varchar(255) NOT NULL,
  `keterangan` text DEFAULT NULL,
  `status` enum('Baru','Diproses','Selesai') DEFAULT 'Baru',
  `tanggal_laporan` datetime DEFAULT current_timestamp(),
  `tanggal_selesai` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `laporan_masalah`
--

INSERT INTO `laporan_masalah` (`id`, `blok_id`, `warga_id`, `judul_laporan`, `keterangan`, `status`, `tanggal_laporan`, `tanggal_selesai`) VALUES
(7, 1, NULL, 'Pencurian', 'rumah tidak di huni', 'Baru', '2026-04-06 15:08:00', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `master_iuran`
--

CREATE TABLE `master_iuran` (
  `id` int(11) NOT NULL,
  `blok_id` int(11) DEFAULT NULL,
  `nama_komponen` varchar(100) NOT NULL,
  `nominal` decimal(15,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `master_iuran`
--

INSERT INTO `master_iuran` (`id`, `blok_id`, `nama_komponen`, `nominal`) VALUES
(1, NULL, 'Uang Sampah', 18000.00),
(2, NULL, 'Uang Keamanan / Satpam', 18000.00),
(3, NULL, 'Kas RT', 5000.00),
(4, NULL, 'Kas Sosial', 2000.00),
(5, NULL, 'Kas Kegiatan', 2000.00),
(11, 1, 'Uang Sampah', 18000.00),
(12, 1, 'Uang Keamanan / Satpam', 18000.00),
(13, 1, 'Kas RT', 5000.00),
(14, 1, 'Kas Sosial', 2000.00),
(15, 1, 'Kas Kegiatan', 2000.00);

-- --------------------------------------------------------

--
-- Table structure for table `pembayaran_iuran`
--

CREATE TABLE `pembayaran_iuran` (
  `id` int(11) NOT NULL,
  `warga_id` int(11) NOT NULL,
  `bulan` int(11) NOT NULL,
  `tahun` int(11) NOT NULL,
  `total_tagihan` decimal(15,2) NOT NULL,
  `jumlah_dibayar` decimal(15,2) DEFAULT 0.00,
  `metode_pembayaran` enum('Cash','Transfer') DEFAULT 'Cash',
  `status` enum('LUNAS','MENUNGGAK') DEFAULT 'MENUNGGAK',
  `tanggal_bayar` datetime DEFAULT NULL,
  `tanggal_setor` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pembayaran_iuran`
--

INSERT INTO `pembayaran_iuran` (`id`, `warga_id`, `bulan`, `tahun`, `total_tagihan`, `jumlah_dibayar`, `metode_pembayaran`, `status`, `tanggal_bayar`, `tanggal_setor`) VALUES
(1, 1, 2, 2026, 45000.00, 45000.00, 'Cash', 'MENUNGGAK', NULL, NULL),
(2, 7, 2, 2026, 45000.00, 45000.00, 'Cash', 'LUNAS', '2026-04-06 08:26:42', NULL),
(3, 1, 1, 2026, 45000.00, 0.00, 'Cash', 'MENUNGGAK', NULL, NULL),
(4, 7, 1, 2026, 45000.00, 0.00, 'Cash', 'MENUNGGAK', NULL, NULL),
(5, 1, 3, 2026, 45000.00, 0.00, 'Cash', 'MENUNGGAK', NULL, NULL),
(6, 7, 3, 2026, 45000.00, 0.00, 'Cash', 'MENUNGGAK', NULL, NULL),
(7, 1, 0, 2026, 45000.00, 0.00, 'Cash', 'MENUNGGAK', NULL, NULL),
(8, 7, 0, 2026, 45000.00, 0.00, 'Cash', 'MENUNGGAK', NULL, NULL),
(9, 3, 2, 2026, 45000.00, 0.00, 'Cash', 'MENUNGGAK', NULL, NULL),
(10, 4, 2, 2026, 45000.00, 0.00, 'Cash', 'MENUNGGAK', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `warga`
--

CREATE TABLE `warga` (
  `id` int(11) NOT NULL,
  `blok_id` int(11) DEFAULT NULL,
  `nik` varchar(16) DEFAULT NULL,
  `nik_kepala` varchar(16) DEFAULT NULL,
  `nama_lengkap` varchar(100) NOT NULL,
  `tempat_lahir` varchar(50) DEFAULT NULL,
  `tanggal_lahir` date DEFAULT NULL,
  `status_pernikahan` enum('Lajang','Menikah','Pisah') DEFAULT 'Lajang',
  `nomor_rumah` varchar(10) DEFAULT NULL,
  `no_wa` varchar(20) DEFAULT NULL,
  `status_kependudukan` enum('Tetap','Kontrak') DEFAULT 'Tetap',
  `status_iuran` enum('LUNAS','TERTUNGGAK') DEFAULT 'LUNAS'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `warga`
--

INSERT INTO `warga` (`id`, `blok_id`, `nik`, `nik_kepala`, `nama_lengkap`, `tempat_lahir`, `tanggal_lahir`, `status_pernikahan`, `nomor_rumah`, `no_wa`, `status_kependudukan`, `status_iuran`) VALUES
(1, 1, '3201010000000001', '3201010000000001', 'Budi Santoso', 'semarang', '1990-01-01', 'Menikah', 'A-01', '082193102039', 'Tetap', 'LUNAS'),
(3, 2, '3201010000000003', NULL, 'Andi Herlambang', NULL, NULL, 'Lajang', 'B-12', NULL, 'Tetap', 'TERTUNGGAK'),
(4, 2, '3201010000000004', NULL, 'Wahyu Hidayat', NULL, NULL, 'Lajang', 'B-15', NULL, 'Tetap', 'LUNAS'),
(7, 1, '3201010000000002', '3201010000000002', 'dodo', '', NULL, 'Lajang', '', '', 'Tetap', 'LUNAS');

-- --------------------------------------------------------

--
-- Table structure for table `warga_anak`
--

CREATE TABLE `warga_anak` (
  `id` int(11) NOT NULL,
  `warga_id` int(11) NOT NULL,
  `nik` varchar(16) DEFAULT NULL,
  `nama_lengkap` varchar(100) NOT NULL,
  `tempat_lahir` varchar(50) DEFAULT NULL,
  `tanggal_lahir` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `warga_dokumen`
--

CREATE TABLE `warga_dokumen` (
  `id` int(11) NOT NULL,
  `warga_id` int(11) NOT NULL,
  `file_path` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `warga_kendaraan`
--

CREATE TABLE `warga_kendaraan` (
  `id` int(11) NOT NULL,
  `warga_id` int(11) NOT NULL,
  `nopol` varchar(20) NOT NULL,
  `jenis_kendaraan` varchar(20) DEFAULT 'Motor'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `warga_orang_lain`
--

CREATE TABLE `warga_orang_lain` (
  `id` int(11) NOT NULL,
  `warga_id` int(11) NOT NULL,
  `nama_lengkap` varchar(100) NOT NULL,
  `umur` int(11) DEFAULT NULL,
  `status_hubungan` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `warga_pasangan`
--

CREATE TABLE `warga_pasangan` (
  `id` int(11) NOT NULL,
  `warga_id` int(11) NOT NULL,
  `nik` varchar(16) DEFAULT NULL,
  `nama_lengkap` varchar(100) NOT NULL,
  `tempat_lahir` varchar(50) DEFAULT NULL,
  `tanggal_lahir` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `agenda_gallery`
--
ALTER TABLE `agenda_gallery`
  ADD PRIMARY KEY (`id`),
  ADD KEY `agenda_id` (`agenda_id`);

--
-- Indexes for table `agenda_kegiatan`
--
ALTER TABLE `agenda_kegiatan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `blok_id` (`blok_id`);

--
-- Indexes for table `agenda_lampiran`
--
ALTER TABLE `agenda_lampiran`
  ADD PRIMARY KEY (`id`),
  ADD KEY `agenda_id` (`agenda_id`);

--
-- Indexes for table `blok`
--
ALTER TABLE `blok`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `laporan_lampiran`
--
ALTER TABLE `laporan_lampiran`
  ADD PRIMARY KEY (`id`),
  ADD KEY `laporan_id` (`laporan_id`);

--
-- Indexes for table `laporan_masalah`
--
ALTER TABLE `laporan_masalah`
  ADD PRIMARY KEY (`id`),
  ADD KEY `blok_id` (`blok_id`),
  ADD KEY `warga_id` (`warga_id`);

--
-- Indexes for table `master_iuran`
--
ALTER TABLE `master_iuran`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `pembayaran_iuran`
--
ALTER TABLE `pembayaran_iuran`
  ADD PRIMARY KEY (`id`),
  ADD KEY `warga_id` (`warga_id`);

--
-- Indexes for table `warga`
--
ALTER TABLE `warga`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nik` (`nik`),
  ADD KEY `blok_id` (`blok_id`);

--
-- Indexes for table `warga_anak`
--
ALTER TABLE `warga_anak`
  ADD PRIMARY KEY (`id`),
  ADD KEY `warga_id` (`warga_id`);

--
-- Indexes for table `warga_dokumen`
--
ALTER TABLE `warga_dokumen`
  ADD PRIMARY KEY (`id`),
  ADD KEY `warga_id` (`warga_id`);

--
-- Indexes for table `warga_kendaraan`
--
ALTER TABLE `warga_kendaraan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `warga_id` (`warga_id`);

--
-- Indexes for table `warga_orang_lain`
--
ALTER TABLE `warga_orang_lain`
  ADD PRIMARY KEY (`id`),
  ADD KEY `warga_id` (`warga_id`);

--
-- Indexes for table `warga_pasangan`
--
ALTER TABLE `warga_pasangan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `warga_id` (`warga_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `agenda_gallery`
--
ALTER TABLE `agenda_gallery`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `agenda_kegiatan`
--
ALTER TABLE `agenda_kegiatan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `agenda_lampiran`
--
ALTER TABLE `agenda_lampiran`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `blok`
--
ALTER TABLE `blok`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `laporan_lampiran`
--
ALTER TABLE `laporan_lampiran`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `laporan_masalah`
--
ALTER TABLE `laporan_masalah`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `master_iuran`
--
ALTER TABLE `master_iuran`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `pembayaran_iuran`
--
ALTER TABLE `pembayaran_iuran`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `warga`
--
ALTER TABLE `warga`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `warga_anak`
--
ALTER TABLE `warga_anak`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `warga_dokumen`
--
ALTER TABLE `warga_dokumen`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `warga_kendaraan`
--
ALTER TABLE `warga_kendaraan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `warga_orang_lain`
--
ALTER TABLE `warga_orang_lain`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `warga_pasangan`
--
ALTER TABLE `warga_pasangan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `agenda_gallery`
--
ALTER TABLE `agenda_gallery`
  ADD CONSTRAINT `agenda_gallery_ibfk_1` FOREIGN KEY (`agenda_id`) REFERENCES `agenda_kegiatan` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `agenda_kegiatan`
--
ALTER TABLE `agenda_kegiatan`
  ADD CONSTRAINT `agenda_kegiatan_ibfk_1` FOREIGN KEY (`blok_id`) REFERENCES `blok` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `agenda_lampiran`
--
ALTER TABLE `agenda_lampiran`
  ADD CONSTRAINT `agenda_lampiran_ibfk_1` FOREIGN KEY (`agenda_id`) REFERENCES `agenda_kegiatan` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `laporan_lampiran`
--
ALTER TABLE `laporan_lampiran`
  ADD CONSTRAINT `laporan_lampiran_ibfk_1` FOREIGN KEY (`laporan_id`) REFERENCES `laporan_masalah` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `laporan_masalah`
--
ALTER TABLE `laporan_masalah`
  ADD CONSTRAINT `laporan_masalah_ibfk_1` FOREIGN KEY (`blok_id`) REFERENCES `blok` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `laporan_masalah_ibfk_2` FOREIGN KEY (`warga_id`) REFERENCES `warga` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `pembayaran_iuran`
--
ALTER TABLE `pembayaran_iuran`
  ADD CONSTRAINT `pembayaran_iuran_ibfk_1` FOREIGN KEY (`warga_id`) REFERENCES `warga` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `warga`
--
ALTER TABLE `warga`
  ADD CONSTRAINT `warga_ibfk_1` FOREIGN KEY (`blok_id`) REFERENCES `blok` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `warga_anak`
--
ALTER TABLE `warga_anak`
  ADD CONSTRAINT `warga_anak_ibfk_1` FOREIGN KEY (`warga_id`) REFERENCES `warga` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `warga_dokumen`
--
ALTER TABLE `warga_dokumen`
  ADD CONSTRAINT `warga_dokumen_ibfk_1` FOREIGN KEY (`warga_id`) REFERENCES `warga` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `warga_kendaraan`
--
ALTER TABLE `warga_kendaraan`
  ADD CONSTRAINT `warga_kendaraan_ibfk_1` FOREIGN KEY (`warga_id`) REFERENCES `warga` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `warga_orang_lain`
--
ALTER TABLE `warga_orang_lain`
  ADD CONSTRAINT `warga_orang_lain_ibfk_1` FOREIGN KEY (`warga_id`) REFERENCES `warga` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `warga_pasangan`
--
ALTER TABLE `warga_pasangan`
  ADD CONSTRAINT `warga_pasangan_ibfk_1` FOREIGN KEY (`warga_id`) REFERENCES `warga` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
