<?php
// Konfigurasi Database PDO
$host = 'localhost';
$dbname = 'smart_rt';
$username = 'root'; // Default XAMPP username
$password = '';     // Default XAMPP password (kosong)

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die("Koneksi Database Gagal: " . $e->getMessage());
}