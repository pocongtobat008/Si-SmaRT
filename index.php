<?php
// index.php - Main entry point

// Load Database Connection
require_once 'config/database.php';

// Include the head section (meta, title, CSS, JS libraries)
include 'views/layout/head.php';
?>
<!DOCTYPE html>
<html lang="id">
<body>
    <?php
    // Include the sidebar navigation
    include 'views/layout/sidebar.php';
    ?>
    <main id="main-content">
        <?php
        // Include the main content header
        include 'views/layout/header.php';

        // Determine which page content to load
        // For simplicity, we'll load all page contents and use JavaScript to show/hide them
        // In a more complex PHP application, you might use a router and load only one page.
        include 'views/pages/dashboard.php';
        include 'views/pages/warga.php';
        include 'views/pages/keuangan.php';
        include 'views/pages/keamanan.php';
        include 'views/pages/info.php';
        ?>
    </main>
    <!-- Include the footer section (closing tags and main JS script) -->
    <?php include 'views/layout/footer.php'; ?>
</body>
</html>