<!-- Page: Warga -->
<div id="page-warga" class="page-content hidden page-section"> <!-- Added page-section class -->
    
    <div class="section-header">
        <div>
            <h3 class="section-title">Pilih Workspace</h3>
            <p class="text-secondary" style="font-size: 0.875rem; margin-top: 4px;">Pilih blok untuk mengelola data, iuran, dan agenda spesifik.</p>
        </div>
    </div>

    <div class="grid-container">
        <?php
        // Ambil data blok beserta total warga per blok
        $current_month = date('n') - 1; // Array bulan JS (0-11)
        $current_year = date('Y');

        $stmt = $pdo->prepare("
            SELECT b.*, 
                   COUNT(w.id) as total_warga,
                   (SELECT SUM(p.total_tagihan) 
                    FROM pembayaran_iuran p 
                    JOIN warga w2 ON p.warga_id = w2.id 
                    WHERE w2.blok_id = b.id AND p.bulan = ? AND p.tahun = ? AND p.status = 'LUNAS'
                   ) as setor_bulan_ini
            FROM blok b 
            LEFT JOIN warga w ON b.id = w.blok_id 
            GROUP BY b.id
        ");
        $stmt->execute([$current_month, $current_year]);
        $bloks = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($bloks as $blok):
            $blok_id = $blok['id'];
            $nama_blok = htmlspecialchars($blok['nama_blok']);
            $koordinator = htmlspecialchars($blok['koordinator']);
            $total_warga = $blok['total_warga'];
            $kas_format = 'Rp ' . number_format($blok['kas_blok'], 0, ',', '.');
            $setor_bulan_ini = $blok['setor_bulan_ini'] ?? 0;
            $setor_format = 'Rp ' . number_format($setor_bulan_ini, 0, ',', '.');
            $logo_class = htmlspecialchars($blok['logo_class']);
            $logo_text = htmlspecialchars($blok['logo_text']);
            
            // Biarkan kosong jika tidak ada gambar agar memunculkan inisial NAMA BLOK
            $logo_image = isset($blok['logo_image']) && !empty($blok['logo_image']) ? htmlspecialchars($blok['logo_image']) : '';
        ?>
        <!-- Dynamic Workspace Card -->
        <div class="interactive-ws-card" onclick="openWorkspaceModal(<?= $blok_id ?>, '<?= $nama_blok ?>', '<?= $koordinator ?>', '<?= $total_warga ?>', '<?= $kas_format ?>', '<?= $logo_class ?>', '<?= $logo_text ?>', '<?= $logo_image ?>')">
            <div class="ws-hero <?= $logo_class ?>">
                <?php if ($logo_image): ?>
                    <img src="<?= $logo_image ?>" alt="Cover <?= $nama_blok ?>" class="ws-hero-img">
                <?php else: ?>
                    <span class="hero-letter"><?= $logo_text ?></span>
                <?php endif; ?>
            </div>
            <section>
                <h2><?= $nama_blok ?></h2>
                <p>Koordinator: <?= $koordinator ?><br>Jumlah Warga: <?= $total_warga ?> KK</p>
                <div class="card-footer">
                    <div style="display: flex; flex-direction: column;">
                        <span style="font-size: 0.65rem; color: var(--text-secondary-color); font-weight: 600; text-transform: uppercase;">Iuran Bulan Ini</span>
                        <span class="tag text-emerald font-bold" style="padding: 0; background: transparent; font-size: 1.1rem;"><?= $setor_format ?></span>
                    </div>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <button onclick="event.stopPropagation(); editBlok(<?= $blok_id ?>, '<?= addslashes($nama_blok) ?>', '<?= addslashes($koordinator) ?>')" title="Edit Blok" style="background: var(--secondary-bg); border: 1px solid var(--border-color); border-radius: 50%; padding: 6px; cursor: pointer; color: var(--text-secondary-color); display: flex; align-items: center; justify-content: center;"><i data-lucide="edit-2" style="width: 16px; height: 16px;"></i></button>
                        <button onclick="event.stopPropagation(); hapusBlok(<?= $blok_id ?>, '<?= addslashes($nama_blok) ?>', <?= $total_warga ?>)" title="Hapus Blok" style="background: var(--secondary-bg); border: 1px solid var(--border-color); border-radius: 50%; padding: 6px; cursor: pointer; color: #ef4444; display: flex; align-items: center; justify-content: center;"><i data-lucide="trash-2" style="width: 16px; height: 16px;"></i></button>
                        <button class="ws-action-btn">Buka</button>
                    </div>
                </div>
            </section>
        </div>
        <?php endforeach; ?>

        <!-- Tambah Blok Baru -->
        <div class="interactive-ws-card" onclick="openAddBlockModal()">
            <div class="ws-hero logo-new">
                <i data-lucide="plus" class="hero-letter" style="color: var(--text-secondary-color);"></i>
            </div>
            <section>
                <h2>Tambah Blok</h2>
                <p>Buat workspace blok baru<br>untuk mengelola warga.</p>
                <div class="card-footer">
                    <span class="tag text-secondary font-bold">Baru</span>
                    <button class="ws-action-btn">Buat</button>
                </div>
            </section>
        </div>
    </div>

</div>

<!-- Full-Screen Modal Workspace (System in a System) -->
<div id="workspace-modal" class="modal-overlay hidden">
    <div class="fullscreen-modal glass-card">
        
        <!-- Modal Header -->
        <div class="modal-header">
            <div class="modal-header-info">
                <button id="modal-sidebar-toggle" class="modal-toggle-btn"><i data-lucide="menu"></i></button>
                <div id="modal-block-logo" class="ws-logo-container logo-a">A</div>
                <div>
                    <h2 id="modal-block-title" class="ws-title">Nama Blok</h2>
                    <p id="modal-block-coord" class="text-secondary" style="font-size: 0.875rem; margin-top: 4px;">Koordinator: -</p>
                </div>
            </div>
            <button class="modal-close-btn" onclick="closeWorkspaceModal()"><i data-lucide="x"></i></button>
        </div>

        <!-- Modal Body & Sidebar Internal -->
        <div class="modal-body">
            <!-- Sidebar Menu Internal -->
            <div id="modal-sidebar" class="modal-nav hide-scrollbar">
                <button class="modal-tab active" onclick="switchModalTab('modal-dash', this)"><i data-lucide="pie-chart"></i> <span>Ringkasan</span></button>
                <button class="modal-tab" onclick="switchModalTab('modal-warga-list', this)"><i data-lucide="users"></i> <span>Data Warga</span></button>
                <button class="modal-tab" onclick="switchModalTab('modal-keuangan', this)"><i data-lucide="wallet"></i> <span>Iuran Blok</span></button>
                <button class="modal-tab" onclick="switchModalTab('modal-agenda', this)"><i data-lucide="calendar"></i> <span>Agenda & Laporan</span></button>
            </div>

            <!-- Konten Dinamis Internal -->
            <div class="modal-content-area">
                
                <!-- Tab 1: Ringkasan / Dashboard -->
                <div id="modal-dash" class="modal-tab-content">
                    
                    <!-- Pencarian Cepat & Quick Actions -->
                    <div style="margin-bottom: 24px; position: relative;">
                        <div class="input-with-icon" style="margin-bottom: 16px;">
                            <i data-lucide="search" style="color: var(--accent-color); width: 20px; height: 20px;"></i>
                            <input type="text" id="quick-search-input" class="input-field" placeholder="Pencarian Cepat (Ketik nama warga/NIK lalu Enter...)" onkeypress="handleQuickSearch(event)" style="padding: 16px 20px 16px 48px; border-radius: 16px; box-shadow: 0 10px 30px -10px var(--shadow-color); border-color: transparent;">
                        </div>
                        <div class="quick-action-hub">
                            <button class="quick-action-btn" onclick="switchModalTab('modal-warga-list', document.querySelectorAll('.modal-tab')[1]); setTimeout(openFormWarga, 300);"><i data-lucide="user-plus" class="text-emerald"></i> Tambah Warga</button>
                            <button class="quick-action-btn" onclick="switchModalTab('modal-keuangan', document.querySelectorAll('.modal-tab')[2]);"><i data-lucide="wallet" class="text-orange"></i> Catat Iuran</button>
                            <button class="quick-action-btn" onclick="switchModalTab('modal-agenda', document.querySelectorAll('.modal-tab')[3]); setTimeout(openFormLaporanDrawer, 300);"><i data-lucide="flag" class="text-red"></i> Lapor Masalah</button>
                        </div>
                    </div>

                    <h3 class="section-title" style="margin-bottom: 16px;">Overview Utama</h3>
                    <div class="summary-wrapper">
                        <div class="summary-card-modern">
                            <div class="summary-icon-wrapper bg-blue-light text-blue"><i data-lucide="users"></i></div>
                            <p class="card-label m-0" style="margin:0;">Total Penghuni</p>
                            <h3 id="dash-stat-warga" class="card-value text-color m-0" style="margin:0;">0 KK</h3>
                        </div>
                        <div class="summary-card-modern">
                            <div class="summary-icon-wrapper bg-emerald-light text-emerald"><i data-lucide="banknote"></i></div>
                            <p class="card-label m-0" style="margin:0;">Saldo Kas Internal</p>
                            <h3 id="dash-stat-kas" class="card-value text-emerald m-0" style="margin:0;">Rp 0</h3>
                        </div>
                        <div class="summary-card-modern">
                            <div class="summary-icon-wrapper bg-orange-light text-orange"><i data-lucide="alert-triangle"></i></div>
                            <p class="card-label m-0" style="margin:0;">Laporan Aktif</p>
                            <h3 id="dash-stat-laporan" class="card-value text-color m-0" style="margin:0;">0 Laporan</h3>
                        </div>
                        <div class="summary-card-modern">
                            <div class="summary-icon-wrapper bg-purple-light text-purple"><i data-lucide="calendar-clock"></i></div>
                            <p class="card-label m-0" style="margin:0;">Agenda Terdekat</p>
                            <h3 id="dash-stat-agenda" class="card-value text-color m-0" style="font-size: 1rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="Menunggu Data">Memuat...</h3>
                        </div>
                    </div>
                    
                    <!-- Area Grafik Statistik (Charts) -->
                    <div class="grid-container-2-col" style="gap: 20px; margin-bottom: 24px;">
                        <div class="glass-card" style="padding: 20px; display: flex; flex-direction: column;">
                            <h4 class="section-title" style="font-size: 1rem; margin-bottom: 16px;">Demografi Warga</h4>
                            <div style="position: relative; height: 220px; width: 100%; margin: auto;">
                                <canvas id="chartDemografi"></canvas>
                            </div>
                        </div>
                        <div class="glass-card" style="padding: 20px; display: flex; flex-direction: column;">
                            <h4 class="section-title" style="font-size: 1rem; margin-bottom: 16px;">Pemasukan Kas (6 Bulan Terakhir)</h4>
                            <div style="position: relative; height: 220px; width: 100%;">
                                <canvas id="chartPemasukan"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Tab 2: Data Warga Khusus Blok -->
                <div id="modal-warga-list" class="modal-tab-content hidden">
                    <div class="section-header" style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; width: 100%; flex-wrap: wrap; gap: 12px;">
                        <h3 class="section-title" style="margin: 0;">Daftar Warga Blok</h3>
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                            <button class="button-secondary button-sm" style="padding: 8px 12px; border-radius: 8px;" onclick="downloadTemplateWarga()" title="Download Template Import"><i data-lucide="file-spreadsheet" style="width: 18px; height: 18px;"></i> <span class="hide-text-mobile">Template</span></button>
                            <button class="button-secondary button-sm" style="padding: 8px 12px; border-radius: 8px;" onclick="exportWargaCSV()" title="Export ke Excel (CSV)"><i data-lucide="download" style="width: 18px; height: 18px;"></i> <span class="hide-text-mobile">Export</span></button>
                            <label class="button-secondary button-sm" style="padding: 8px 12px; cursor: pointer; margin: 0; border-radius: 8px;" title="Import dari Excel (CSV)">
                                <i data-lucide="upload" style="width: 18px; height: 18px;"></i> <span class="hide-text-mobile">Import</span>
                                <input type="file" id="import-warga-csv" accept=".csv" class="hidden" onchange="importWargaCSV(this)">
                            </label>
                            <button class="button-primary button-sm" style="padding: 8px 16px; border-radius: 8px;" onclick="openFormWarga()"><i data-lucide="user-plus" style="margin-right: 6px; width: 18px; height: 18px;"></i> <span class="hide-text-mobile">Tambah Warga</span></button>
                        </div>
                    </div>
                    
                    <!-- SUMMARY Warga -->
                    <div class="summary-wrapper">
                        <div class="summary-card-modern">
                            <div class="summary-icon-wrapper bg-blue-light text-blue"><i data-lucide="users"></i></div>
                            <p class="card-label m-0" style="margin:0;">Total Warga (Filter)</p>
                            <h3 id="sum-warga-total" class="card-value m-0" style="margin:0;">0</h3>
                        </div>
                        <div class="summary-card-modern">
                            <div class="summary-icon-wrapper bg-emerald-light text-emerald"><i data-lucide="user-check"></i></div>
                            <p class="card-label m-0" style="margin:0;">Warga Tetap</p>
                            <h3 id="sum-warga-tetap" class="card-value m-0" style="margin:0;">0</h3>
                        </div>
                        <div class="summary-card-modern">
                            <div class="summary-icon-wrapper bg-orange-light text-orange"><i data-lucide="user-minus"></i></div>
                            <p class="card-label m-0" style="margin:0;">Warga Kontrak</p>
                            <h3 id="sum-warga-kontrak" class="card-value m-0" style="margin:0;">0</h3>
                        </div>
                    </div>
                        
                    <!-- Pencarian & Filter -->
                    <div style="display: flex; gap: 12px; width: 100%; flex-wrap: wrap; margin-bottom: 24px;">
                        <div class="input-with-icon" style="flex: 1; min-width: 200px;">
                            <i data-lucide="search"></i>
                            <input type="text" id="search-warga-input" placeholder="Cari nama atau NIK..." class="input-field" style="padding: 10px 16px 10px 40px; font-size: 0.875rem;" oninput="filterWargaList()">
                        </div>
                        <select id="filter-pernikahan" class="input-field select-custom" style="font-size: 0.875rem; padding-top: 10px; padding-bottom: 10px; width: auto; min-width: 140px;" onchange="filterWargaList()">
                            <option value="">Pernikahan (Semua)</option>
                            <option value="Lajang">Lajang</option>
                            <option value="Menikah">Menikah</option>
                            <option value="Pisah">Pisah</option>
                        </select>
                        <select id="filter-status" class="input-field select-custom" style="font-size: 0.875rem; padding-top: 10px; padding-bottom: 10px; width: auto; min-width: 140px;" onchange="filterWargaList()">
                            <option value="">Status (Semua)</option>
                            <option value="Tetap">Tetap</option>
                            <option value="Kontrak">Kontrak</option>
                            <option value="Weekend">Weekend</option>
                        </select>
                    </div>
                    <div class="list-container" id="modal-warga-list-container">
                        <!-- Data Warga Akan Dimuat di Sini via AJAX -->
                        <p class="text-secondary text-center py-4">Memuat data...</p>
                    </div>
                    
                    <div id="warga-pagination" style="display: none; justify-content: space-between; align-items: center; margin-top: 16px; padding-top: 16px; border-top: 1px dashed var(--border-color);">
                        <span id="warga-page-info" class="text-secondary" style="font-size: 0.875rem;">Menampilkan 0-0 dari 0</span>
                        <div style="display: flex; gap: 8px;">
                            <button class="button-secondary button-sm" style="padding: 6px 12px; border-radius: 8px; font-size: 0.8rem;" onclick="prevPageWarga()">Sebelumnya</button>
                            <button class="button-secondary button-sm" style="padding: 6px 12px; border-radius: 8px; font-size: 0.8rem;" onclick="nextPageWarga()">Selanjutnya</button>
                        </div>
                    </div>
                </div>

                <!-- Tab 3 & 4 (Placeholder) -->
                <div id="modal-keuangan" class="modal-tab-content hidden">
                    <div class="section-header" style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; width: 100%; flex-wrap: wrap; gap: 12px;">
                        <h3 class="section-title" style="margin: 0;">Kelola Kas & Iuran Blok</h3>
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                            <button class="button-secondary button-sm" style="padding: 8px 16px; border-radius: 12px; background-color: color-mix(in srgb, var(--accent-color) 15%, transparent); border: 1px solid var(--accent-color); color: var(--accent-color); font-weight: 700; box-shadow: 0 4px 10px -2px color-mix(in srgb, var(--accent-color) 30%, transparent);" onclick="openMasterIuran()"><i data-lucide="settings" style="width: 18px; height: 18px;"></i> <span class="hide-text-mobile">Master Iuran</span></button>
                            <button class="button-secondary button-sm" style="padding: 8px 16px; border-radius: 12px; font-weight: 600;" onclick="openRekonsiliasi()"><i data-lucide="activity" style="width: 18px; height: 18px; margin-right: 6px;"></i> <span class="hide-text-mobile">Rekonsiliasi</span></button>
                            <button class="button-secondary button-sm" style="padding: 8px 16px; border-radius: 12px;" onclick="bayarTerpilihIuran()"><i data-lucide="check-square" style="width: 18px; height: 18px; margin-right: 6px;"></i> <span class="hide-text-mobile">Tandai Terpilih</span></button>
                            <button class="button-secondary button-sm" style="padding: 8px 16px; border-radius: 12px;" onclick="bayarSemuaIuran()"><i data-lucide="check-circle" style="width: 18px; height: 18px; margin-right: 6px;"></i> <span class="hide-text-mobile">Tandai Semua</span></button>
                            <button class="button-primary button-sm" style="padding: 8px 16px; border-radius: 12px;" onclick="setorKeRT()"><i data-lucide="send" style="margin-right: 6px; width: 18px; height: 18px;"></i> <span class="hide-text-mobile">Setor ke RT Pusat</span></button>
                        </div>
                    </div>

                    <!-- Summary Iuran Dinamis -->
                    <div id="iuran-summary" class="summary-wrapper">
                        <div class="summary-card-modern">
                            <div class="summary-icon-wrapper bg-emerald-light text-emerald"><i data-lucide="wallet"></i></div>
                            <p class="card-label m-0" style="margin:0;">Sudah Bayar (Lunas)</p>
                            <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                                <h3 id="summary-lunas" class="card-value text-color m-0" style="margin: 0; font-size: 1.2rem;">Rp 0</h3>
                                <span id="summary-count-lunas" class="badge bg-emerald-light text-emerald" style="display: inline-flex; align-items: center; gap: 4px;">0 Warga</span>
                            </div>
                        </div>
                        <div class="summary-card-modern">
                            <div class="summary-icon-wrapper bg-red-light text-red"><i data-lucide="alert-circle"></i></div>
                            <p class="card-label m-0" style="margin:0;">Belum Dibayar</p>
                            <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                                <h3 id="summary-menunggak" class="card-value text-color m-0" style="margin: 0; font-size: 1.2rem;">Rp 0</h3>
                                <span id="summary-count-menunggak" class="badge bg-red-light text-red" style="display: inline-flex; align-items: center; gap: 4px;">0 Warga</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Filter Tagihan -->
                    <div style="display: flex; gap: 12px; width: 100%; flex-wrap: wrap; margin-bottom: 24px;">
                        <div class="input-with-icon" style="flex: 1; min-width: 200px;">
                            <i data-lucide="search"></i>
                            <input type="text" id="search-iuran-input" placeholder="Cari nama warga..." class="input-field" style="padding: 10px 16px 10px 40px; font-size: 0.875rem;" oninput="filterIuranList()">
                        </div>
                        <div style="display: flex; gap: 8px; align-items: center;">
                            <button class="button-secondary button-sm" style="padding: 10px; border-radius: 8px;" onclick="prevMonthIuran()" title="Bulan Sebelumnya"><i data-lucide="chevron-left" style="width: 16px; height: 16px;"></i></button>
                            <select id="filter-bulan-iuran" class="input-field select-custom" style="font-size: 0.875rem; padding-top: 10px; padding-bottom: 10px; width: auto; min-width: 150px;" onchange="loadDataIuran()">
                                <!-- Diisi dinamis oleh JS -->
                            </select>
                            <button class="button-secondary button-sm" style="padding: 10px; border-radius: 8px;" onclick="nextMonthIuran()" title="Bulan Selanjutnya"><i data-lucide="chevron-right" style="width: 16px; height: 16px;"></i></button>
                        </div>
                        <select id="filter-status-iuran" class="input-field select-custom" style="font-size: 0.875rem; padding-top: 10px; padding-bottom: 10px; width: auto; min-width: 140px;" onchange="filterIuranList()">
                            <option value="">Semua Status</option>
                            <option value="LUNAS">Sudah Bayar</option>
                            <option value="MENUNGGAK">Belum Bayar</option>
                        </select>
                    </div>

                    <div class="list-container" id="modal-iuran-list-container">
                        <p class="text-secondary text-center py-4">Memuat data iuran...</p>
                    </div>
                    
                    <div id="iuran-pagination" style="display: none; justify-content: space-between; align-items: center; margin-top: 16px; padding-top: 16px; border-top: 1px dashed var(--border-color);">
                        <span id="iuran-page-info" class="text-secondary" style="font-size: 0.875rem;">Menampilkan 0-0 dari 0</span>
                        <div style="display: flex; gap: 8px;">
                            <button class="button-secondary button-sm" style="padding: 6px 12px; border-radius: 8px; font-size: 0.8rem;" onclick="prevPageIuran()">Sebelumnya</button>
                            <button class="button-secondary button-sm" style="padding: 6px 12px; border-radius: 8px; font-size: 0.8rem;" onclick="nextPageIuran()">Selanjutnya</button>
                        </div>
                    </div>
                </div>

                <div id="modal-agenda" class="modal-tab-content hidden">
                    <div class="section-header" style="margin-bottom: 16px;">
                        <h3 class="section-title">Agenda & Laporan</h3>
                        <button class="button-primary button-sm" style="padding: 8px 16px; border-radius: 12px;" onclick="openFormAgenda()"><i data-lucide="plus" style="margin-right: 6px;"></i> Buat Baru</button>
                    </div>
                    
                    <!-- SUMMARY AGENDA & LAPORAN -->
                    <div class="summary-wrapper">
                        <div class="summary-card-modern">
                            <div class="summary-icon-wrapper bg-purple-light text-purple"><i data-lucide="calendar"></i></div>
                            <p class="card-label m-0" style="margin:0;">Total Agenda</p>
                            <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                                <h3 id="sum-agenda-total" class="card-value m-0" style="margin:0;">0</h3>
                                <span id="sum-agenda-selesai" class="badge bg-purple-light text-purple" style="font-size: 0.7rem;">0 Selesai</span>
                            </div>
                        </div>
                        <div class="summary-card-modern">
                            <div class="summary-icon-wrapper bg-orange-light text-orange"><i data-lucide="flag"></i></div>
                            <p class="card-label m-0" style="margin:0;">Laporan Masalah</p>
                            <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                                <h3 id="sum-laporan-total" class="card-value m-0" style="margin:0;">0</h3>
                                <span id="sum-laporan-selesai" class="badge bg-emerald-light text-emerald" style="font-size: 0.7rem;">0 Selesai</span>
                            </div>
                        </div>
                    </div>

                    <!-- Sub-navigation -->
                    <div class="sub-nav-container">
                        <button class="sub-nav-tab active" onclick="switchSubTab(this, 'sub-tab-agenda')">
                            <i data-lucide="calendar-days"></i> Agenda Kegiatan
                        </button>
                        <button class="sub-nav-tab" onclick="switchSubTab(this, 'sub-tab-laporan')">
                            <i data-lucide="flag"></i> Laporan Masalah
                        </button>
                    </div>

                    <!-- Sub-tab Content -->
                    <div id="sub-tab-agenda" class="sub-tab-content">
                        <!-- Pencarian & Filter Agenda -->
                        <div style="display: flex; gap: 12px; width: 100%; flex-wrap: wrap; margin-bottom: 24px;">
                            <div class="input-with-icon" style="flex: 1; min-width: 200px;">
                                <i data-lucide="search"></i>
                                <input type="text" id="search-agenda-input" placeholder="Cari judul atau keterangan..." class="input-field" style="padding: 10px 16px 10px 40px; font-size: 0.875rem;" oninput="filterAgendaList()">
                            </div>
                            <select id="filter-status-agenda" class="input-field select-custom" style="font-size: 0.875rem; padding-top: 10px; padding-bottom: 10px; width: auto; min-width: 140px;" onchange="filterAgendaList()">
                                <option value="">Semua Status</option>
                                <option value="Direncanakan">Direncanakan</option>
                                <option value="Selesai">Selesai</option>
                                <option value="Dibatalkan">Dibatalkan</option>
                            </select>
                        </div>
                        
                        <div id="agenda-list-container"></div>
                        
                        <div id="agenda-pagination" style="display: none; justify-content: space-between; align-items: center; margin-top: 16px; padding-top: 16px; border-top: 1px dashed var(--border-color);">
                            <span id="agenda-page-info" class="text-secondary" style="font-size: 0.875rem;">Menampilkan 0-0 dari 0</span>
                            <div style="display: flex; gap: 8px;">
                                <button class="button-secondary button-sm" style="padding: 6px 12px; border-radius: 8px; font-size: 0.8rem;" onclick="prevPageAgenda()">Sebelumnya</button>
                                <button class="button-secondary button-sm" style="padding: 6px 12px; border-radius: 8px; font-size: 0.8rem;" onclick="nextPageAgenda()">Selanjutnya</button>
                            </div>
                        </div>
                    </div>
                    <div id="sub-tab-laporan" class="sub-tab-content hidden">
                        <!-- Pencarian & Filter Laporan -->
                        <div style="display: flex; gap: 12px; width: 100%; flex-wrap: wrap; margin-bottom: 24px;">
                            <div class="input-with-icon" style="flex: 1; min-width: 200px;">
                                <i data-lucide="search"></i>
                                <input type="text" id="search-laporan-input" placeholder="Cari judul laporan..." class="input-field" style="padding: 10px 16px 10px 40px; font-size: 0.875rem;" oninput="filterLaporanList()">
                            </div>
                            <select id="filter-status-laporan" class="input-field select-custom" style="font-size: 0.875rem; padding-top: 10px; padding-bottom: 10px; width: auto; min-width: 140px;" onchange="filterLaporanList()">
                                <option value="">Semua Status</option>
                                <option value="Baru">Baru</option>
                                <option value="Diproses">Diproses</option>
                                <option value="Selesai">Selesai</option>
                            </select>
                        </div>
                        
                        <div id="laporan-list-container"></div>
                        
                        <div id="laporan-pagination" style="display: none; justify-content: space-between; align-items: center; margin-top: 16px; padding-top: 16px; border-top: 1px dashed var(--border-color);">
                            <span id="laporan-page-info" class="text-secondary" style="font-size: 0.875rem;">Menampilkan 0-0 dari 0</span>
                            <div style="display: flex; gap: 8px;">
                                <button class="button-secondary button-sm" style="padding: 6px 12px; border-radius: 8px; font-size: 0.8rem;" onclick="prevPageLaporan()">Sebelumnya</button>
                                <button class="button-secondary button-sm" style="padding: 6px 12px; border-radius: 8px; font-size: 0.8rem;" onclick="nextPageLaporan()">Selanjutnya</button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</div>

<!-- Modal Rekonsiliasi & Periode -->
<div id="modal-rekonsiliasi" class="modal-overlay hidden" style="z-index: 10005 !important;">
    <div class="glass-card" style="width: 100%; max-width: 500px; padding: 32px; position: relative; max-height: 90vh; display: flex; flex-direction: column;">
        <button class="modal-close-btn" style="position: absolute; top: 16px; right: 16px;" onclick="document.getElementById('modal-rekonsiliasi').classList.add('hidden')"><i data-lucide="x"></i></button>
        <h2 class="section-title" style="margin-bottom: 8px;">Audit & Rekonsiliasi Kas</h2>
        <p class="text-secondary" style="font-size: 0.875rem; margin-bottom: 24px;">Deteksi otomatis warga yang menunggak berdasarkan periode pencatatan awal.</p>
        
        <div style="background: var(--hover-bg); padding: 16px; border-radius: 16px; margin-bottom: 24px; display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 120px;">
                <label class="card-label">Bulan Mulai Mencatat</label>
                <select id="rekon-bulan" class="input-field select-custom" style="margin-top: 8px; padding-left: 16px;">
                    <option value="0">Januari</option><option value="1">Februari</option><option value="2">Maret</option>
                    <option value="3">April</option><option value="4">Mei</option><option value="5">Juni</option>
                    <option value="6">Juli</option><option value="7">Agustus</option><option value="8">September</option>
                    <option value="9">Oktober</option><option value="10">November</option><option value="11">Desember</option>
                </select>
            </div>
            <div style="flex: 1; min-width: 100px;">
                <label class="card-label">Tahun</label>
                <input type="number" id="rekon-tahun" class="input-field" style="margin-top: 8px; padding-left: 16px;">
            </div>
            <button class="button-primary" style="height: 46px; border-radius: 12px; margin-top: auto;" onclick="simpanPeriodeRekon(this)"><i data-lucide="save"></i></button>
        </div>

        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 16px;">
            <span class="font-bold text-color">Daftar Penunggak (Diurutkan Terlama)</span>
            <span id="rekon-total-warga" class="badge bg-red-light text-red" style="font-size: 0.75rem;">Memuat...</span>
        </div>

        <div id="rekonsiliasi-list" class="hide-scrollbar" style="overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 12px; padding-bottom: 16px;">
            <!-- Data akan diisi oleh JS -->
            <p class="text-center text-secondary py-4">Memuat data rekonsiliasi...</p>
        </div>
    </div>
</div>

<!-- Modal Bayar Iuran -->
<div id="modal-bayar-iuran" class="modal-overlay hidden" style="z-index: 10005 !important;">
    <div class="glass-card" style="width: 100%; max-width: 400px; padding: 32px; position: relative;">
        <button class="modal-close-btn" style="position: absolute; top: 16px; right: 16px;" onclick="document.getElementById('modal-bayar-iuran').classList.add('hidden')"><i data-lucide="x"></i></button>
        <h2 class="section-title" style="margin-bottom: 8px;">Tandai Dibayar</h2>
        <p class="text-secondary" style="font-size: 0.875rem; margin-bottom: 24px;">Konfirmasi pembayaran iuran untuk bulan ini.</p>
        
        <input type="hidden" id="bayar-iuran-id">
        <div style="margin-bottom: 16px;">
            <label class="card-label">Tanggal Pembayaran</label>
            <input type="date" id="bayar-tanggal" class="input-field" style="margin-top: 8px; padding-left: 20px;">
        </div>
        <div style="margin-bottom: 32px;">
            <label class="card-label">Metode Pembayaran</label>
            <select id="bayar-metode" class="input-field select-custom" style="margin-top: 8px;">
                <option value="Cash">Tunai (Cash)</option>
                <option value="Transfer">Transfer Bank / E-Wallet</option>
            </select>
        </div>
        <button class="button-primary" style="width: 100%; justify-content: center;" onclick="submitBayarIuran(this)"><i data-lucide="check-circle" style="margin-right: 8px;"></i> Konfirmasi Pembayaran</button>
    </div>
</div>

<!-- Modal Setor ke Kas RT -->
<div id="modal-setor-rt" class="modal-overlay hidden" style="z-index: 10005 !important;">
    <div class="glass-card" style="width: 100%; max-width: 400px; padding: 32px; position: relative;">
        <button class="modal-close-btn" style="position: absolute; top: 16px; right: 16px;" onclick="document.getElementById('modal-setor-rt').classList.add('hidden')"><i data-lucide="x"></i></button>
        <h2 class="section-title" style="margin-bottom: 8px;">Setor ke Kas RT</h2>
        <p class="text-secondary" style="font-size: 0.875rem; margin-bottom: 24px;">Setorkan semua dana iuran yang sudah <b class="text-emerald">LUNAS</b> di bulan ini ke Kas Pusat RT.</p>
        
        <div style="margin-bottom: 32px;">
            <label class="card-label">Tanggal Setor</label>
            <input type="date" id="setor-tanggal" class="input-field" style="margin-top: 8px; padding-left: 20px;">
        </div>
        <div class="glass-card" style="padding: 12px 16px; background: rgba(59, 130, 246, 0.1); border-color: #3b82f6; margin-bottom: 24px; font-size: 0.8rem; color: var(--text-color);">
            <i data-lucide="info" style="display:inline; width:16px; height:16px; margin-right:4px; color: #3b82f6;"></i> Hanya tagihan berstatus LUNAS yang akan disetorkan.
        </div>
        <button class="button-primary" style="width: 100%; justify-content: center;" onclick="submitSetorRT(this)"><i data-lucide="send" style="margin-right: 8px;"></i> Konfirmasi Setoran</button>
    </div>
</div>

<!-- Modal Edit Iuran -->
<div id="modal-edit-iuran" class="modal-overlay hidden" style="z-index: 10005 !important;">
    <div class="glass-card" style="width: 100%; max-width: 400px; padding: 32px; position: relative;">
        <button class="modal-close-btn" style="position: absolute; top: 16px; right: 16px;" onclick="document.getElementById('modal-edit-iuran').classList.add('hidden')"><i data-lucide="x"></i></button>
        <h2 class="section-title" style="margin-bottom: 8px;">Edit Tagihan</h2>
        <p class="text-secondary" style="font-size: 0.875rem; margin-bottom: 24px;">Ubah nominal atau status tagihan.</p>
        
        <input type="hidden" id="edit-iuran-id">
        <div style="margin-bottom: 16px;">
            <label class="card-label">Total Tagihan (Rp)</label>
            <input type="number" id="edit-iuran-nominal" class="input-field" style="margin-top: 8px; padding-left: 20px;">
        </div>
        <div style="margin-bottom: 16px;">
            <label class="card-label">Status</label>
            <select id="edit-iuran-status" class="input-field select-custom" style="margin-top: 8px;" onchange="toggleEditIuranDates(this.value)">
                <option value="MENUNGGAK">Belum Bayar</option>
                <option value="LUNAS">Lunas</option>
            </select>
        </div>
        <div style="margin-bottom: 16px;">
            <label class="card-label">Metode Pembayaran</label>
            <select id="edit-iuran-metode" class="input-field select-custom" style="margin-top: 8px;">
                <option value="Cash">Tunai (Cash)</option>
                <option value="Transfer">Transfer Bank / E-Wallet</option>
            </select>
        </div>
        <div id="edit-iuran-dates-container" style="display: none;">
            <div style="margin-bottom: 16px;">
                <label class="card-label">Tanggal Bayar</label>
                <input type="date" id="edit-iuran-tgl-bayar" class="input-field" style="margin-top: 8px; padding-left: 20px;">
            </div>
            <div style="margin-bottom: 32px;">
                <label class="card-label">Tanggal Setor RT (Opsional/Kosongkan jika belum)</label>
                <input type="date" id="edit-iuran-tgl-setor" class="input-field" style="margin-top: 8px; padding-left: 20px;">
            </div>
        </div>
        <button class="button-primary" style="width: 100%; justify-content: center;" onclick="submitEditIuran(this)">Simpan Perubahan</button>
    </div>
</div>

<!-- Modal Detail Iuran -->
<div id="modal-detail-iuran" class="modal-overlay hidden" style="z-index: 10005 !important;">
    <div class="glass-card" style="width: 100%; max-width: 400px; padding: 32px; position: relative;">
        <button class="modal-close-btn" style="position: absolute; top: 16px; right: 16px;" onclick="document.getElementById('modal-detail-iuran').classList.add('hidden')"><i data-lucide="x"></i></button>
        <h2 class="section-title" style="margin-bottom: 8px;">Rincian Tagihan</h2>
        <p class="text-secondary" style="font-size: 0.875rem; margin-bottom: 24px;">Rincian alokasi dana iuran bulan ini.</p>
        
        <div id="detail-iuran-list" style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px;">
            <!-- Diisi oleh JS -->
        </div>
        <div style="border-top: 2px dashed var(--border-color); padding-top: 16px; display: flex; justify-content: space-between; align-items: center;">
            <span class="font-bold text-color">Total Tagihan</span>
            <h3 id="detail-iuran-total" class="text-emerald m-0" style="margin:0;">Rp 0</h3>
        </div>
    </div>
</div>

<!-- Drawer Modal: Master Iuran -->
<div id="drawer-master-iuran" class="modal-overlay hidden" style="z-index: 10010 !important; align-items: flex-end; justify-content: flex-end; padding: 0;">
    <div class="drawer-panel glass-card">
        <div class="drawer-header">
            <div>
                <h2 class="ws-title">Master Pembayaran</h2>
                <p class="text-secondary" style="font-size: 0.875rem; margin-top: 4px;">Kelola komponen iuran wajib bulanan blok.</p>
            </div>
            <button class="modal-close-btn" onclick="closeMasterIuran()"><i data-lucide="x"></i></button>
        </div>
        
        <div class="drawer-body hide-scrollbar" style="padding-top: 16px;">
            <div class="glass-card" style="padding: 16px; background: rgba(16, 185, 129, 0.1); border-color: var(--accent-color); margin-bottom: 24px;">
                <p class="text-emerald font-bold" style="margin: 0; font-size: 0.875rem;"><i data-lucide="info" style="display:inline; width:16px; height:16px; margin-right:4px;"></i> Total Tagihan Per Bulan: <span id="total-master-iuran" style="font-size: 1.2rem; float:right;">Rp 0</span></p>
            </div>

            <div id="master-iuran-list" class="list-container" style="gap: 12px;">
                <!-- List Komponen dari JS -->
            </div>

            <div class="dynamic-add-section">
                <button type="button" class="button-secondary button-full-width" style="border-style: dashed; color: var(--accent-color); border-color: var(--accent-color);" onclick="addMasterIuranField()"><i data-lucide="plus"></i> Tambah Komponen Baru</button>
            </div>
        </div>
        
        <div class="drawer-footer">
            <button type="button" class="button-secondary" onclick="closeMasterIuran()">Tutup</button>
            <button type="button" class="button-primary flex-grow" onclick="simpanMasterIuran()"><i data-lucide="save" style="margin-right: 8px;"></i> Simpan Pengaturan</button>
        </div>
    </div>
</div>

<!-- Include Drawer Form Data Warga -->
<?php include 'views/components/datawargablok.php'; ?>
,
<!-- Drawer Form Agenda -->
<div id="drawer-agenda" class="modal-overlay hidden" style="z-index: 10010 !important; align-items: flex-end; justify-content: flex-end; padding: 0;">
    <div class="drawer-panel glass-card">
        <div class="drawer-header">
            <div>
                <h2 id="drawer-agenda-title" class="ws-title">Tambah Agenda</h2>
                <p class="text-secondary" style="font-size: 0.875rem; margin-top: 4px;">Kelola jadwal dan kegiatan blok.</p>
            </div>
            <button class="modal-close-btn" onclick="closeFormAgendaDrawer()"><i data-lucide="x"></i></button>
        </div>
        
        <div class="drawer-body hide-scrollbar">
            <input type="hidden" id="agenda_id" value="0">
            <div class="form-group" style="margin-bottom: 16px;">
                <label class="card-label">Judul Kegiatan</label>
                <input type="text" id="agenda_judul" class="input-field" style="margin-top: 8px;">
            </div>
            <div class="form-group" style="margin-bottom: 16px;">
                <label class="card-label">Tanggal & Waktu</label>
                <input type="datetime-local" id="agenda_tanggal" class="input-field" style="margin-top: 8px; padding-left: 20px;">
            </div>
            <div class="form-group" style="margin-bottom: 16px;">
                <label class="card-label">Estimasi Biaya (Rp)</label>
                <input type="number" id="agenda_biaya" class="input-field" style="margin-top: 8px; padding-left: 20px;">
            </div>
            <div class="form-group" style="margin-bottom: 16px;">
                <label class="card-label">Keterangan</label>
                <textarea id="agenda_keterangan" class="input-field" style="margin-top: 8px; padding: 12px 20px; min-height: 100px; border-radius: 16px; resize: vertical;"></textarea>
            </div>
            <div class="form-group" style="margin-bottom: 16px;">
                <label class="card-label">Status</label>
                <select id="agenda_status" class="input-field select-custom" style="margin-top: 8px;" onchange="toggleAgendaGallery(this.value)">
                    <option value="Direncanakan">Direncanakan</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Dibatalkan">Dibatalkan</option>
                </select>
            </div>
            
            <div class="form-group" style="margin-bottom: 16px; padding-top: 16px; border-top: 1px dashed var(--border-color);">
                <label class="card-label">Lampiran Dokumen / Surat (Opsional)</label>
                <input type="file" id="agenda_lampiran_files" multiple class="input-field file-input-modern" style="margin-top: 8px; width: 100%;">
                <div id="agenda_existing_lampiran" style="display: flex; gap: 8px; flex-direction: column; margin-top: 12px;"></div>
            </div>
            
            <div id="agenda_gallery_section" class="hidden" style="margin-bottom: 16px; padding-top: 16px; border-top: 1px dashed var(--border-color);">
                <label class="card-label">Unggah Galeri (Foto & Video Sekaligus)</label>
                <input type="file" id="agenda_gallery_files" accept="image/*,video/mp4,video/webm" multiple class="input-field file-input-modern" style="margin-top: 8px; width: 100%;" onchange="previewAgendaGallery(this)">
                <div id="agenda_gallery_preview" style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px;"></div>
                <div id="agenda_existing_gallery" style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px;"></div>
            </div>
        </div>
        
        <div class="drawer-footer">
            <button type="button" class="button-secondary" onclick="closeFormAgendaDrawer()">Batal</button>
            <button type="button" class="button-primary flex-grow" onclick="simpanAgenda()"><i data-lucide="save" style="margin-right: 8px;"></i> Simpan Agenda</button>
        </div>
    </div>
</div>

<!-- Drawer Form Laporan -->
<div id="drawer-laporan" class="modal-overlay hidden" style="z-index: 10010 !important; align-items: flex-end; justify-content: flex-end; padding: 0;">
    <div class="drawer-panel glass-card">
        <div class="drawer-header">
            <div>
                <h2 id="drawer-laporan-title" class="ws-title">Buat Laporan</h2>
                <p class="text-secondary" style="font-size: 0.875rem; margin-top: 4px;">Catat permasalahan atau keluhan di lingkungan.</p>
            </div>
            <button class="modal-close-btn" onclick="closeFormLaporanDrawer()"><i data-lucide="x"></i></button>
        </div>
        
        <div class="drawer-body hide-scrollbar">
            <input type="hidden" id="laporan_id" value="0">
            <div class="form-group" style="margin-bottom: 16px;">
                <label class="card-label">Judul Laporan</label>
                <input type="text" id="laporan_judul" class="input-field" style="margin-top: 8px;">
            </div>
            <div class="form-group" style="margin-bottom: 16px;">
                <label class="card-label">Tanggal Laporan</label>
                <input type="datetime-local" id="laporan_tanggal" class="input-field" style="margin-top: 8px; padding-left: 20px;">
            </div>
            <div class="form-group" style="margin-bottom: 16px;">
                <label class="card-label">Keterangan / Detail Masalah</label>
                <textarea id="laporan_keterangan" class="input-field" style="margin-top: 8px; padding: 12px 20px; min-height: 120px; border-radius: 16px; resize: vertical;"></textarea>
            </div>
            <div class="form-group" style="margin-bottom: 16px;">
                <label class="card-label">Status</label>
                <select id="laporan_status" class="input-field select-custom" style="margin-top: 8px;" onchange="toggleLaporanSelesai(this.value)">
                    <option value="Baru">Baru</option>
                    <option value="Diproses">Diproses</option>
                    <option value="Selesai">Selesai</option>
                </select>
            </div>
            <div id="laporan_tanggal_selesai_section" class="form-group hidden" style="margin-bottom: 16px;">
                <label class="card-label">Tanggal Selesai</label>
                <input type="datetime-local" id="laporan_tanggal_selesai" class="input-field" style="margin-top: 8px; padding-left: 20px;">
            </div>
            
            <div class="form-group" style="margin-bottom: 16px; padding-top: 16px; border-top: 1px dashed var(--border-color);">
                <label class="card-label">Lampiran Bukti (Foto/Dokumen)</label>
                <input type="file" id="laporan_lampiran_files" multiple class="input-field file-input-modern" style="margin-top: 8px; width: 100%;">
                <div id="laporan_existing_lampiran" style="display: flex; gap: 8px; flex-direction: column; margin-top: 12px;"></div>
            </div>
        </div>
        
        <div class="drawer-footer">
            <button type="button" class="button-secondary" onclick="closeFormLaporanDrawer()">Batal</button>
            <button type="button" class="button-primary flex-grow" onclick="simpanLaporan()"><i data-lucide="save" style="margin-right: 8px;"></i> Simpan Laporan</button>
        </div>
    </div>
</div>

<!-- Modal Edit Workspace -->
<div id="edit-block-modal" class="modal-overlay hidden" style="z-index: 10005 !important;">
    <div class="glass-card" style="width: 100%; max-width: 400px; padding: 32px; position: relative;">
        <button class="modal-close-btn" style="position: absolute; top: 16px; right: 16px;" onclick="closeEditBlockModal()"><i data-lucide="x"></i></button>
        <h2 class="section-title" style="margin-bottom: 8px;">Edit Blok</h2>
        <p class="text-secondary" style="font-size: 0.875rem; margin-bottom: 24px;">Perbarui nama workspace dan koordinator.</p>
        
        <input type="hidden" id="edit-blok-id">
        <div style="margin-bottom: 16px;">
            <label class="card-label">Nama Blok</label>
            <input type="text" id="edit-nama-blok" class="input-field" style="margin-top: 8px; padding-left: 20px;">
        </div>
        <div style="margin-bottom: 16px;">
            <label class="card-label">Koordinator</label>
            <input type="text" id="edit-koordinator-blok" class="input-field" style="margin-top: 8px; padding-left: 20px;">
        </div>
        <div style="margin-bottom: 32px;">
            <label class="card-label">Ubah Logo Blok (Opsional)</label>
            <input type="file" id="edit-logo-blok" accept="image/*" class="input-field" style="margin-top: 8px; padding: 10px 20px;">
        </div>
        <button class="button-primary" style="width: 100%; justify-content: center;" onclick="submitEditBlock(this)">Simpan Perubahan</button>
    </div>
</div>

<!-- Modal Add Workspace (Card Stack Form) dipindah ke luar agar tidak nyangkut -->
<div id="add-block-modal" class="modal-overlay hidden modal-stack-bg" style="z-index: 10005 !important;">
    <button class="modal-close-btn" style="position: absolute; top: 24px; right: 24px; z-index: 10001;" onclick="closeAddBlockModal()"><i data-lucide="x"></i></button>

    <div class="stack-container" id="form-stack">
        <!-- Step 1: Nama Blok -->
        <div class="stack-card variant-1">
            <div class="stack-card-header">
                <span class="stack-chip">Langkah 1</span>
                <span class="stack-card-number">01/04</span>
            </div>
            <div>
                <h2>Blok Baru</h2>
                <p>Tentukan nama blok atau area yang ingin Anda tambahkan ke dalam sistem SmaRT.</p>
                <input type="text" id="input-nama-blok" class="input-field" placeholder="Contoh: Blok C" style="width: 100%; margin-top: 10px;">
            </div>
            <div class="stack-card-footer">
                <button class="button-secondary next-stack-btn" style="border-radius: 12px;">Lanjut <i data-lucide="arrow-right" style="width:16px;height:16px;margin-left:8px;"></i></button>
            </div>
        </div>

        <!-- Step 2: Koordinator -->
        <div class="stack-card variant-2">
            <div class="stack-card-header">
                <span class="stack-chip">Langkah 2</span>
                <span class="stack-card-number">02/04</span>
            </div>
            <div>
                <h2>Koordinator</h2>
                <p>Siapa yang akan mengelola dan bertanggung jawab penuh atas blok ini?</p>
                <input type="text" id="input-koordinator-blok" class="input-field" placeholder="Nama Lengkap..." style="width: 100%; margin-top: 10px;">
            </div>
            <div class="stack-card-footer">
                <button class="button-secondary next-stack-btn" style="border-radius: 12px;">Lanjut <i data-lucide="arrow-right" style="width:16px;height:16px;margin-left:8px;"></i></button>
            </div>
        </div>

        <!-- Step 3: Upload Gambar / Logo (Baru) -->
        <div class="stack-card variant-4">
            <div class="stack-card-header">
                <span class="stack-chip">Langkah 3</span>
                <span class="stack-card-number">03/04</span>
            </div>
            <div>
                <h2>Logo Blok</h2>
                <p>Unggah foto visual blok/gedung. (Jika dilewati, gambar default akan digunakan).</p>
                <div class="upload-box-container">
                    <input type="file" id="blok-image-upload" accept="image/*" class="upload-input-hidden">
                    <div class="upload-box-visual">
                        <i data-lucide="upload-cloud" class="upload-icon"></i>
                        <p id="upload-text-main" class="upload-text-main">Klik untuk Unggah Foto</p>
                        <p id="upload-text-sub" class="upload-text-sub">JPG, PNG maks 2MB</p>
                    </div>
                </div>
            </div>
            <div class="stack-card-footer">
                <button class="button-secondary next-stack-btn" style="border-radius: 12px;">Lewati / Lanjut <i data-lucide="arrow-right" style="width:16px;height:16px;margin-left:8px;"></i></button>
            </div>
        </div>

        <!-- Step 4: Confirmation -->
        <div class="stack-card variant-3">
            <div class="stack-card-header">
                <span class="stack-chip">Langkah 4</span>
                <span class="stack-card-number">04/04</span>
            </div>
            <div>
                <h2>Selesai!</h2>
                <p>Periksa kembali data yang dimasukkan. Simpan data workspace baru ke dalam database?</p>
            </div>
            <div class="stack-card-footer">
                <button class="button-primary" style="width: 100%; justify-content: center;" onclick="submitNewBlock(this)">Simpan Blok <i data-lucide="check-circle" style="width:16px;height:16px;margin-left:8px;"></i></button>
            </div>
        </div>
    </div>
</div>

<!-- GSAP Infinity Gallery Modal -->
<div id="gsap-gallery-modal" class="hidden">
    <div class="gsap-bg-container">
        <div id="gsap-bg1" class="gsap-bg-image active"></div>
        <div id="gsap-bg2" class="gsap-bg-image"></div>
    </div>
    <div class="gsap-bg-noise"></div>
    
    <!-- Area Scroll Palsu (Untuk memicu ScrollTrigger) -->
    <div class="gsap-scroll-container hide-scrollbar"><div style="height: 6000px;"></div></div>

    <div class="gsap-ui-layer">
        <div class="gsap-header">
            <div class="gsap-brand"><i data-lucide="image"></i> Galeri Kegiatan</div>
            <button class="gsap-close-btn" onclick="closeGsapGallery()"><i data-lucide="x"></i></button>
        </div>
        <div class="gsap-controls">
            <button class="gsap-nav-btn gsap-prev"><i data-lucide="chevron-left"></i></button>
            <button class="gsap-nav-btn gsap-next"><i data-lucide="chevron-right"></i></button>
        </div>
    </div>
    <div class="gsap-gallery"><ul class="gsap-cards"></ul></div>
    <div class="gsap-loader">MEMUAT...</div>
</div>