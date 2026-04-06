<!-- Page: Global Warga -->
<div id="page-global-warga" class="page-content hidden page-section">
    <div class="section-header" style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; width: 100%; flex-wrap: wrap; gap: 12px;">
        <h3 class="section-title" style="margin: 0;">Direktori Seluruh Warga</h3>
        <button class="button-primary button-sm" style="padding: 8px 16px; border-radius: 8px;" onclick="openFormWarga(true)"><i data-lucide="user-plus" style="margin-right: 6px; width: 18px; height: 18px;"></i> <span class="hide-text-mobile">Tambah Warga</span></button>
    </div>
    
    <!-- SUMMARY Global Warga -->
    <div class="summary-wrapper">
        <div class="summary-card-modern">
            <div class="summary-icon-wrapper bg-blue-light text-blue"><i data-lucide="users"></i></div>
            <p class="card-label m-0" style="margin:0;">Total Warga</p>
            <h3 id="sum-global-warga" class="card-value m-0" style="margin:0;">0</h3>
        </div>
        <div class="summary-card-modern">
            <div class="summary-icon-wrapper bg-purple-light text-purple"><i data-lucide="layout-grid"></i></div>
            <p class="card-label m-0" style="margin:0;">Tersebar Di</p>
            <h3 id="sum-global-blok" class="card-value m-0" style="margin:0;">0 Blok</h3>
        </div>
        <div class="summary-card-modern">
            <div class="summary-icon-wrapper bg-emerald-light text-emerald"><i data-lucide="user-check"></i></div>
            <p class="card-label m-0" style="margin:0;">Warga Tetap</p>
            <h3 id="sum-global-tetap" class="card-value m-0" style="margin:0;">0</h3>
        </div>
        <div class="summary-card-modern">
            <div class="summary-icon-wrapper bg-orange-light text-orange"><i data-lucide="user-minus"></i></div>
            <p class="card-label m-0" style="margin:0;">Warga Kontrak</p>
            <h3 id="sum-global-kontrak" class="card-value m-0" style="margin:0;">0</h3>
        </div>
    </div>
        
    <!-- Pencarian & Filter Global -->
    <div style="display: flex; gap: 12px; width: 100%; flex-wrap: wrap; margin-bottom: 24px;">
        <div class="input-with-icon" style="flex: 1; min-width: 200px;">
            <i data-lucide="search"></i>
            <input type="text" id="search-global-warga-input" placeholder="Cari nama atau NIK..." class="input-field" style="padding: 10px 16px 10px 40px; font-size: 0.875rem;" oninput="filterGlobalWargaList()">
        </div>
        <select id="filter-blok-global" class="input-field select-custom" style="font-size: 0.875rem; padding-top: 10px; padding-bottom: 10px; width: auto; min-width: 140px;" onchange="filterGlobalWargaList()">
            <option value="">Semua Blok</option>
        </select>
        <select id="filter-pernikahan-global" class="input-field select-custom" style="font-size: 0.875rem; padding-top: 10px; padding-bottom: 10px; width: auto; min-width: 140px;" onchange="filterGlobalWargaList()">
            <option value="">Status Nikah</option>
            <option value="Lajang">Lajang</option>
            <option value="Menikah">Menikah</option>
            <option value="Pisah">Pisah</option>
        </select>
        <select id="filter-status-global" class="input-field select-custom" style="font-size: 0.875rem; padding-top: 10px; padding-bottom: 10px; width: auto; min-width: 140px;" onchange="filterGlobalWargaList()">
            <option value="">Warga (Semua)</option>
            <option value="Tetap">Tetap</option>
            <option value="Kontrak">Kontrak</option>
        </select>
    </div>
    
    <div class="list-container" id="global-warga-list-container"></div>
    
    <div id="global-warga-pagination" style="display: none; justify-content: space-between; align-items: center; margin-top: 16px; padding-top: 16px; border-top: 1px dashed var(--border-color);">
        <span id="global-warga-page-info" class="text-secondary" style="font-size: 0.875rem;">Menampilkan 0-0 dari 0</span>
        <div style="display: flex; gap: 8px;"><button class="button-secondary button-sm" style="padding: 6px 12px; border-radius: 8px; font-size: 0.8rem;" onclick="prevPageGlobalWarga()">Sebelumnya</button><button class="button-secondary button-sm" style="padding: 6px 12px; border-radius: 8px; font-size: 0.8rem;" onclick="nextPageGlobalWarga()">Selanjutnya</button></div>
    </div>
</div>