<!-- Sidebar (Left-side collapsible) -->
<aside id="sidebar" class="sidebar">
    <div class="sidebar-header">
        <a href="#" class="sidebar-brand"> <!-- Removed Tailwind classes -->
            <div class="brand-icon"> <!-- Custom class for icon container -->
                <i data-lucide="layout-dashboard"></i> <!-- Changed icon to layout-dashboard -->
            </div>
            <span class="brand-text">SmartRT <span class="text-emerald">v1</span></span> <!-- Custom class for text -->
        </a>
        <button id="desktop-sidebar-toggle" title="Toggle Sidebar"> <!-- Corrected ID -->
            <i data-lucide="chevron-left"></i>
        </button>
    </div>

    <nav class="sidebar-nav">
        <button onclick="showPage('dashboard')" id="nav-dashboard" class="active-tab" title="Beranda">
            <i data-lucide="home"></i> <!-- Changed icon to home -->
            <span>Beranda</span>
        </button>
        <button onclick="showPage('global-warga')" id="nav-global-warga" title="Daftar Warga">
            <i data-lucide="users"></i>
            <span>Daftar Warga</span>
        </button>
        <button onclick="showPage('warga')" id="nav-warga" title="Workspace">
            <i data-lucide="layout-grid"></i>
            <span>Workspace</span>
        </button>
        <button onclick="showPage('keuangan')" id="nav-keuangan" title="Laporan Keuangan"> <!-- Updated title -->
            <i data-lucide="wallet"></i>
            <span>Keuangan</span>
        </button>
        <button onclick="showPage('keamanan')" id="nav-keamanan" title="Keamanan Lingkungan"> <!-- Updated title -->
            <i data-lucide="shield-check"></i>
            <span>Keamanan</span>
        </button>
        <button onclick="showPage('info')" id="nav-info" title="Informasi Umum">
            <i data-lucide="megaphone"></i>
            <span>Info</span>
        </button>
    </nav>
</aside>