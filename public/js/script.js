// Initialize Lucide Icons
lucide.createIcons();

/**
 * Applies the specified theme to the document and updates the theme toggle icon.
 * @param {string} theme - The theme to apply ('light-theme' or 'dark-theme').
 */
function applyTheme(theme) {
    document.documentElement.classList.remove('light-theme', 'dark-theme');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);

    const themeToggleButton = document.getElementById('theme-toggle');
    if (themeToggleButton) {
        const iconElement = themeToggleButton.querySelector('i');
        if (iconElement) {
            if (theme === 'dark-theme') {
                iconElement.setAttribute('data-lucide', 'moon');
            } else {
                iconElement.setAttribute('data-lucide', 'sun');
            }
            lucide.createIcons(); // Re-render the icon
        }
    }
}

/**
 * Toggles between 'light-theme' and 'dark-theme'.
 */
function toggleTheme() {
    // Default to light if no theme is saved, or if the saved theme is invalid
    const currentTheme = localStorage.getItem('theme') || 'light-theme'; 
    const newTheme = currentTheme === 'dark-theme' ? 'light-theme' : 'dark-theme';
    applyTheme(newTheme);
}

// Apply theme on initial load
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        // Check user's system preference if no theme is saved
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            applyTheme('dark-theme');
        } else {
            applyTheme('light-theme');
        }
    }

    // Attach event listener for theme toggle button
    const themeToggleButton = document.getElementById('theme-toggle');
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', toggleTheme);
    }
}); 

/**
 * Toggles the collapsed state of the sidebar (for desktop).
 */
function toggleDesktopSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
        if (mainContent) {
            mainContent.classList.toggle('sidebar-collapsed');
        }
    }
}

// --- Sidebar Toggling ---
/**
 * Toggles the active state of the sidebar (for mobile).
 */
function toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('active'); // 'active' class for mobile visibility
    }
}

// Attach event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Desktop sidebar toggle button (inside sidebar)
    const desktopSidebarToggleButton = document.getElementById('desktop-sidebar-toggle');
    if (desktopSidebarToggleButton) {
        desktopSidebarToggleButton.addEventListener('click', toggleDesktopSidebar);
    }

    // Mobile sidebar toggle button (inside header)
    const mobileSidebarToggleButton = document.getElementById('mobile-sidebar-toggle');
    if (mobileSidebarToggleButton) {
        mobileSidebarToggleButton.addEventListener('click', toggleMobileSidebar);
    }

    // Modal sidebar toggle
    const modalSidebarToggle = document.getElementById('modal-sidebar-toggle');
    if (modalSidebarToggle) {
        modalSidebarToggle.addEventListener('click', toggleModalSidebar);
    }

    // --- Stack Form Logic (Add Workspace) ---
    const formStack = document.getElementById('form-stack');
    if (formStack) {
        formStack.addEventListener('click', (e) => {
            // Pastikan yang diklik adalah tombol Lanjut
            const nextBtn = e.target.closest('.next-stack-btn');
            if (!nextBtn) return; // Abaikan jika mengklik area lain/input teks

            const card = e.target.closest('.stack-card');
            if (!card || card !== formStack.firstElementChild || stackAnimating) return;

            stackAnimating = true;
            card.classList.add('throw-out-left');

            setTimeout(() => {
                card.classList.remove('throw-out-left');
                card.classList.add('no-transition');
                formStack.appendChild(card); // Pindahkan ke tumpukan paling belakang
                updateFormStack();
                void card.offsetWidth; // Flush CSS
                card.classList.remove('no-transition');
                stackAnimating = false;
            }, 600);
        });
    }

    // --- File Upload Logic ---
    const imageUploadInput = document.getElementById('blok-image-upload');
    if (imageUploadInput) {
        imageUploadInput.addEventListener('change', function(e) {
            const fileName = e.target.files[0] ? e.target.files[0].name : null;
            if (fileName) {
                document.getElementById('upload-text-main').innerText = "File Dipilih:";
                document.getElementById('upload-text-main').style.color = 'var(--accent-color)';
                document.getElementById('upload-text-sub').innerText = fileName;
            }
        });
    }

    // Mengembalikan pengguna ke halaman terakhir setelah reload
    const activePage = localStorage.getItem('activePage') || 'dashboard';
    setTimeout(() => showPage(activePage), 50); // Sedikit delay agar DOM siap
    loadAllBloks();
});

// --- Workspace Full-Screen Modal Functions ---

// Menyimpan ID blok yang sedang aktif agar bisa diakses fungsi lain
window.currentBlokId = 0;

function openWorkspaceModal(blokId, blockName, coord, warga, kas, logoClass, logoText, logoImage) {
    window.currentBlokId = blokId;
    // Set Modal Data
    document.getElementById('modal-block-title').innerText = blockName;
    document.getElementById('modal-block-coord').innerText = 'Koordinator: ' + coord;
    if (document.getElementById('dash-stat-warga')) document.getElementById('dash-stat-warga').innerText = warga + ' KK';
    if (document.getElementById('dash-stat-kas')) document.getElementById('dash-stat-kas').innerText = kas;
    
    // Set Modal Logo Dinamis
    const logoEl = document.getElementById('modal-block-logo');
    if (logoEl) {
        if (logoImage) {
            logoEl.className = 'ws-logo-container';
            logoEl.innerHTML = `<img src="${logoImage}" alt="Logo" class="ws-modal-img">`;
        } else {
            logoEl.className = 'ws-logo-container ' + logoClass;
            logoEl.innerHTML = logoText;
        }
    }

    // Load Data Warga Khusus Blok Ini via AJAX
    const wargaListContainer = document.getElementById('modal-warga-list-container');
    wargaListContainer.innerHTML = '<p class="text-secondary text-center py-4">Memuat data warga...</p>';
    
    fetch(`api/get_warga.php?blok_id=${blokId}`)
        .then(response => response.json())
        .then(data => {
            window.currentWargaData = data; // Simpan data global untuk fungsi Search
            
            // Kosongkan pengaturan filter setiap kali blok baru dibuka
            window.currentWargaPage = 1;
            document.getElementById('search-warga-input').value = ''; 
            document.getElementById('filter-pernikahan').value = ''; 
            document.getElementById('filter-status').value = ''; 
            
            if(document.getElementById('search-agenda-input')) document.getElementById('search-agenda-input').value = '';
            if(document.getElementById('filter-status-agenda')) document.getElementById('filter-status-agenda').value = '';
            if(document.getElementById('search-laporan-input')) document.getElementById('search-laporan-input').value = '';
            if(document.getElementById('filter-status-laporan')) document.getElementById('filter-status-laporan').value = '';
            
            filterWargaList();
        });

    loadDashboardSummary(blokId);

    // Tampilkan Modal
    const modal = document.getElementById('workspace-modal');
    modal.classList.remove('hidden');
    
    // Reset tab modal kembali ke "Ringkasan" agar tidak menumpuk ke tampilan sebelumnya
    const firstTabBtn = document.querySelector('.modal-nav button');
    if (firstTabBtn) switchModalTab('modal-dash', firstTabBtn);
    
    // Cegah body scrolling saat modal terbuka
    document.body.style.overflow = 'hidden'; 
    lucide.createIcons(); // Render ulang ikon dalam modal
}

function closeWorkspaceModal() {
    const modal = document.getElementById('workspace-modal');
    modal.classList.add('hidden');
    
    // Kembalikan body scrolling
    document.body.style.overflow = '';
}

function toggleModalSidebar() {
    const modalSidebar = document.getElementById('modal-sidebar');
    if (modalSidebar) {
        modalSidebar.classList.toggle('collapsed');
    }
}

function switchModalTab(tabId, element) {
    // Sembunyikan semua konten tab internal
    document.querySelectorAll('.modal-tab-content').forEach(el => el.classList.add('hidden'));
    
    // Hapus status aktif di semua tombol tab
    document.querySelectorAll('.modal-tab').forEach(el => el.classList.remove('active'));
    
    // Tampilkan konten yang dipilih dengan animasi
    const target = document.getElementById(tabId);
    target.classList.remove('hidden');
    
    // Aktifkan tombol yang diklik
    if(element) element.classList.add('active');

    // Jika tab keuangan diklik, inisialisasi fungsinya
    if (tabId === 'modal-keuangan') {
        initKeuanganBlok();
    } else if (tabId === 'modal-agenda') {
        initAgendaLaporan();
    }
}

// --- DASHBOARD CHARTS & SUMMARY ---
let chartDemografi, chartPemasukan;

function loadDashboardSummary(blokId) {
    fetch(`api/get_dashboard_summary.php?blok_id=${blokId}`)
    .then(r => r.json())
    .then(res => {
        if(res.status === 'success') {
            const d = res.data;
            document.getElementById('dash-stat-warga').innerText = d.total_warga + ' KK';
            document.getElementById('dash-stat-kas').innerText = 'Rp ' + parseInt(d.kas_blok).toLocaleString('id-ID');
            document.getElementById('dash-stat-laporan').innerText = d.laporan_aktif + ' Laporan';
            document.getElementById('dash-stat-agenda').innerText = d.agenda_terdekat;
            
            renderDashboardCharts(d.demografi, d.iuran_labels, d.iuran_data);
        }
    });
}

function renderDashboardCharts(demografi, labels, dataIuran) {
    const rootStyles = getComputedStyle(document.documentElement);
    const textColor = rootStyles.getPropertyValue('--text-color').trim() || '#64748b';
    const gridColor = rootStyles.getPropertyValue('--border-color').trim() || '#e2e8f0';

    // 1. Chart Demografi (Doughnut)
    if (chartDemografi) chartDemografi.destroy();
    const ctxD = document.getElementById('chartDemografi').getContext('2d');
    chartDemografi = new Chart(ctxD, {
        type: 'doughnut',
        data: {
            labels: ['Warga Tetap', 'Kontrak', 'Weekend'],
            datasets: [{
                data: [demografi.Tetap || 0, demografi.Kontrak || 0, demografi.Weekend || 0],
                backgroundColor: ['#10b981', '#f97316', '#a855f7'],
                borderWidth: 0, hoverOffset: 4
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: textColor, font: { family: 'Inter', size: 11 } } } }, cutout: '75%' }
    });

    // 2. Chart Pemasukan (Bar)
    if (chartPemasukan) chartPemasukan.destroy();
    const ctxP = document.getElementById('chartPemasukan').getContext('2d');
    chartPemasukan = new Chart(ctxP, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{ label: 'Iuran Lunas (Rp)', data: dataIuran, backgroundColor: 'rgba(16, 185, 129, 0.8)', borderRadius: 6, barThickness: 'flex', maxBarThickness: 32 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: textColor, font: { size: 10 } }, grid: { display: false } }, y: { ticks: { color: textColor, font: { size: 10 }, callback: function(val) { return 'Rp ' + (val/1000) + 'k'; } }, grid: { color: gridColor, drawBorder: false } } } }
    });
}

function handleQuickSearch(event) {
    if(event.key === 'Enter') {
        const q = event.target.value;
        const wargaTabBtn = document.querySelectorAll('.modal-tab')[1];
        if(wargaTabBtn) switchModalTab('modal-warga-list', wargaTabBtn);
        document.getElementById('search-warga-input').value = q;
        filterWargaList();
    }
}

// --- Add Workspace (Card Stack Form) Functions ---
let stackAnimating = false;
const stackConfig = { offsetY: 16, scaleStep: 0.05, brightnessStep: 10 };

function updateFormStack() {
    const stack = document.getElementById('form-stack');
    if (!stack) return;
    const cards = Array.from(stack.children);

    cards.forEach((card, index) => {
        const scale = 1 - (index * stackConfig.scaleStep);
        const translateY = index * stackConfig.offsetY;
        const zIndex = cards.length - index;
        const brightness = 100 - (index * stackConfig.brightnessStep);

        card.style.pointerEvents = index === 0 ? 'auto' : 'none'; // Hanya kartu teratas yang aktif
        card.style.zIndex = zIndex;
        card.style.transform = `translateY(${translateY}px) scale(${scale})`;
        card.style.filter = `brightness(${brightness}%)`;
        card.style.opacity = index > 2 ? 0 : 1; // Sembunyikan kartu berlebih
    });
}

function openAddBlockModal() {
    document.getElementById('add-block-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    setTimeout(updateFormStack, 50); // Memuat posisi awal tumpukan kartu
}

function closeAddBlockModal() {
    document.getElementById('add-block-modal').classList.add('hidden');
    document.body.style.overflow = '';
}

function submitNewBlock(btn) {
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i data-lucide="loader"></i> Menyimpan...';
    lucide.createIcons();
    
    const namaBlok = document.getElementById('input-nama-blok').value;
    const koordinator = document.getElementById('input-koordinator-blok').value;
    const imageUpload = document.getElementById('blok-image-upload');

    const formData = new FormData();
    formData.append('nama_blok', namaBlok);
    formData.append('koordinator', koordinator);
    if (imageUpload.files.length > 0) {
        formData.append('logo_image', imageUpload.files[0]);
    }

    fetch('api/tambah_blok.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            window.location.reload(); // Refresh halaman untuk menampilkan blok baru
        } else {
            alert('Gagal: ' + data.message);
            btn.innerHTML = originalText;
        }
    })
    .catch(error => {
        alert('Terjadi kesalahan koneksi.');
        btn.innerHTML = originalText;
    });
}

// --- Edit & Delete Workspace Functions ---
function editBlok(id, nama, koordinator) {
    document.getElementById('edit-blok-id').value = id;
    document.getElementById('edit-nama-blok').value = nama;
    document.getElementById('edit-koordinator-blok').value = koordinator;
    document.getElementById('edit-logo-blok').value = ''; // Reset input gambar
    
    document.getElementById('edit-block-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeEditBlockModal() {
    document.getElementById('edit-block-modal').classList.add('hidden');
    document.body.style.overflow = '';
}

function submitEditBlock(btn) {
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i data-lucide="loader"></i> Menyimpan...';
    lucide.createIcons();

    const id = document.getElementById('edit-blok-id').value;
    const nama = document.getElementById('edit-nama-blok').value;
    const koordinator = document.getElementById('edit-koordinator-blok').value;

    const formData = new FormData();
    formData.append('id', id);
    formData.append('nama_blok', nama);
    formData.append('koordinator', koordinator);
    
    // Tangkap gambar jika ada file yang diunggah saat edit
    const logoUpload = document.getElementById('edit-logo-blok');
    if (logoUpload && logoUpload.files.length > 0) {
        formData.append('logo_image', logoUpload.files[0]);
    }

    fetch('api/edit_blok.php', { method: 'POST', body: formData })
    .then(r => r.json())
    .then(data => {
        if (data.status === 'success') window.location.reload();
        else { alert('Gagal: ' + data.message); btn.innerHTML = originalText; }
    }).catch(e => { alert('Terjadi kesalahan koneksi'); btn.innerHTML = originalText; });
}

function hapusBlok(id, nama, totalWarga) {
    // Validasi pencegahan hapus jika masih ada warga
    if (totalWarga > 0) {
        alert(`PENGHAPUSAN DITOLAK!\n\nTidak dapat menghapus ${nama} karena masih terdapat ${totalWarga} data warga di dalamnya. Kosongkan atau pindahkan data warga terlebih dahulu.`);
        return;
    }

    if (confirm(`PERINGATAN:\nApakah Anda yakin ingin menghapus ${nama} secara permanen? Tindakan ini tidak dapat dibatalkan.`)) {
        const formData = new FormData();
        formData.append('id', id);
        
        fetch('api/hapus_blok.php', { method: 'POST', body: formData })
        .then(r => r.json())
        .then(data => {
            if (data.status === 'success') window.location.reload();
            else alert('Gagal menghapus: ' + data.message);
        }).catch(e => alert('Terjadi kesalahan koneksi'));
    }
}

// Global variable menyimpan array data
window.currentWargaData = [];
window.currentWargaPage = 1;
const wargaItemsPerPage = 15;

function filterWargaList() {
    if (!window.currentWargaData) return;
    
    const q = document.getElementById('search-warga-input').value.toLowerCase();
    const fPernikahan = document.getElementById('filter-pernikahan').value;
    const fStatus = document.getElementById('filter-status').value;

    const filtered = window.currentWargaData.filter(w => {
        const matchQ = (w.nama_lengkap && w.nama_lengkap.toLowerCase().includes(q)) || 
                       (w.nik && w.nik.toLowerCase().includes(q)) ||
                       (w.nik_kepala && w.nik_kepala.toLowerCase().includes(q)) ||
                       (w.nomor_rumah && w.nomor_rumah.toLowerCase().includes(q));
        
        const matchP = fPernikahan === '' || w.status_pernikahan === fPernikahan;
        const matchS = fStatus === '' || w.status_kependudukan === fStatus;

        return matchQ && matchP && matchS;
    });
    
    // Update Kartu Ringkasan Data Warga
    document.getElementById('sum-warga-total').innerText = filtered.length;
    document.getElementById('sum-warga-tetap').innerText = filtered.filter(w => w.status_kependudukan === 'Tetap').length;
    document.getElementById('sum-warga-kontrak').innerText = filtered.filter(w => w.status_kependudukan === 'Kontrak').length;

    // Paginasi Data Warga
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / wargaItemsPerPage);
    if (window.currentWargaPage > totalPages && totalPages > 0) window.currentWargaPage = totalPages;
    if (window.currentWargaPage < 1) window.currentWargaPage = 1;

    const startIndex = (window.currentWargaPage - 1) * wargaItemsPerPage;
    const endIndex = Math.min(startIndex + wargaItemsPerPage, totalItems);
    const paginatedItems = filtered.slice(startIndex, endIndex);

    const paginationContainer = document.getElementById('warga-pagination');
    if (totalItems > 0) {
        paginationContainer.style.display = 'flex';
        document.getElementById('warga-page-info').innerText = `Menampilkan ${startIndex + 1}-${endIndex} dari ${totalItems}`;
    } else {
        paginationContainer.style.display = 'none';
    }

    renderWargaList(paginatedItems);
}

function renderWargaList(data, blockName = '') {
    const container = document.getElementById('modal-warga-list-container');
    if (!blockName) blockName = document.getElementById('modal-block-title').innerText;
    
    if (data.length === 0) {
        container.innerHTML = '<p class="text-secondary text-center py-4">Belum ada data warga ditemukan.</p>';
        return;
    }

    let html = '<div class="warga-grid">';
    data.forEach(w => {
        
        // Menyesuaikan Badge dengan Status Kependudukan Warga
        let statusKependudukan = w.status_kependudukan || '-';
        let statusClass = 'bg-emerald-light text-emerald'; // Tetap
        if (statusKependudukan === 'Kontrak') statusClass = 'bg-orange-light text-orange';
        else if (statusKependudukan === 'Weekend') statusClass = 'bg-purple-light text-purple';
        
        let waLink = '';
        if (w.no_wa) {
            let cleanWa = w.no_wa.replace(/\D/g, ''); 
            if (cleanWa.startsWith('0')) cleanWa = '62' + cleanWa.substring(1);
            waLink = `<a href="https://wa.me/${cleanWa}" target="_blank" class="button-secondary" style="border-radius: 12px; padding: 8px 16px; color: #25D366; border-color: transparent; background: rgba(37, 211, 102, 0.1); font-size: 0.8rem; font-weight: 600; display: flex; align-items: center; gap: 8px; box-shadow: none;" title="Chat WhatsApp" onclick="event.stopPropagation();"><i data-lucide="message-circle" style="width: 16px; height: 16px;"></i> Chat WA</a>`;
        }

        let btnEdit = `<button onclick="event.stopPropagation(); editWarga(${w.id})" class="button-secondary" style="border-radius: 12px; padding: 8px; color: var(--accent-color); border-color: transparent; background: color-mix(in srgb, var(--accent-color) 10%, transparent); box-shadow: none;" title="Edit Data Warga"><i data-lucide="edit-2" style="width: 18px; height: 18px;"></i></button>`;
        let btnDelete = `<button onclick="event.stopPropagation(); hapusWarga(${w.id}, '${w.nama_lengkap}')" class="button-secondary" style="border-radius: 12px; padding: 8px; color: #ef4444; border-color: transparent; background: rgba(239, 68, 68, 0.1); box-shadow: none;" title="Hapus Data"><i data-lucide="trash-2" style="width: 18px; height: 18px;"></i></button>`;

        html += `
            <div class="warga-card glass-card" style="padding: 24px;">
                <div class="warga-card-header">
                    <div class="avatar bg-emerald-light text-emerald" style="width: 48px; height: 48px; font-size: 1.2rem;">${w.nama_lengkap.charAt(0)}</div>
                    <div style="flex: 1; overflow: hidden;">
                        <h4 style="margin: 0; font-size: 1.1rem; color: var(--text-color); white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">${w.nama_lengkap}</h4>
                        <span class="badge ${statusClass}" style="margin-top: 6px; display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px;"><i data-lucide="${w.status_kependudukan === 'Tetap' ? 'user-check' : 'user'}" style="width: 12px; height: 12px;"></i> Status: ${statusKependudukan}</span>
                    </div>
                </div>
                <div class="warga-card-body">
                    <div class="warga-detail-item"><i data-lucide="map-pin"></i> <span>Blok ${blockName} - No. ${w.nomor_rumah || '-'}</span></div>
                    <div class="warga-detail-item"><i data-lucide="credit-card"></i> <span>NIK: ${w.nik_kepala || w.nik || '-'}</span></div>
                    <div class="warga-detail-item"><i data-lucide="user-check"></i> <span>Pernikahan: ${w.status_pernikahan || 'Lajang'}</span></div>
                    <div class="warga-detail-item"><i data-lucide="calendar"></i> <span>${w.tempat_lahir || '-'}, ${w.tanggal_lahir || '-'}</span></div>
                </div>
                <div class="warga-card-actions" style="display: flex; justify-content: space-between; align-items: center; margin-top: auto; border-top: 1px dashed var(--border-color); padding-top: 16px;">
                    <div>${waLink}</div>
                    <div class="warga-action-group">
                        ${btnEdit}
                        ${btnDelete}
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
    lucide.createIcons();
}

function prevPageWarga() {
    if (window.currentWargaPage > 1) { window.currentWargaPage--; filterWargaList(); }
}

function nextPageWarga() {
    window.currentWargaPage++;
    filterWargaList();
}

// Variable untuk menyimpan status edit Warga
window.currentWargaId = 0;

// Fungsi untuk memuat ulang daftar warga tanpa merefresh halaman
function refreshWargaList() {
    if (window.currentBlokId === 0) return;
    const wargaListContainer = document.getElementById('modal-warga-list-container');
    wargaListContainer.innerHTML = '<p class="text-secondary text-center py-4">Memuat data warga...</p>';
    
    fetch(`api/get_warga.php?blok_id=${window.currentBlokId}`)
        .then(response => response.json())
        .then(data => {
            window.currentWargaData = data; 
            filterWargaList();
        });
}

// --- Data Warga Blok (Drawer Form Logic) ---
function openFormWarga(isGlobal = false) {
    window.currentWargaId = 0; // Reset ke mode Tambah
    document.getElementById('form-tambah-warga').reset(); // Kosongkan form
    document.querySelector('#drawer-warga .ws-title').innerText = 'Tambah Data Warga';
    
    const blokSelect = document.getElementById('warga_blok_id');
    if (isGlobal) {
        blokSelect.disabled = false; blokSelect.value = '';
    } else {
        blokSelect.value = window.currentBlokId; blokSelect.disabled = true; // Kunci input jika dari workspace
    }
    
    const drawer = document.getElementById('drawer-warga');
    drawer.classList.remove('hidden');
    setTimeout(() => drawer.classList.add('drawer-active'), 50); // Memicu slide animasi
}

function closeFormWarga() {
    const drawer = document.getElementById('drawer-warga');
    drawer.classList.remove('drawer-active');
    setTimeout(() => drawer.classList.add('hidden'), 400); // Tunggu animasi selesai
}

function togglePasangan(status) {
    const section = document.getElementById('section-pasangan');
    if (status === 'Menikah') {
        section.classList.remove('hidden');
    } else {
        section.classList.add('hidden');
    }
}

function generateAnakFields(jumlah) {
    const container = document.getElementById('container-anak');
    container.innerHTML = '';
    const num = parseInt(jumlah);
    
    if (num > 0) {
        container.classList.remove('hidden');
        for (let i = 1; i <= num; i++) {
            container.innerHTML += `
                <div style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid var(--border-color);">
                    <p class="card-label" style="margin-bottom: 12px; color: var(--accent-color);">Data Anak Ke-${i}</p>
                    <div class="form-grid">
                        <div class="form-group"><input type="text" inputmode="numeric" class="input-field" placeholder="NIK Anak (Opsional)"></div>
                        <div class="form-group"><input type="text" class="input-field" placeholder="Nama Lengkap Anak"></div>
                        <div class="form-group"><input type="text" class="input-field" placeholder="Tempat Lahir"></div>
                        <div class="form-group"><input type="date" class="input-field" style="padding-left: 20px;"></div>
                    </div>
                </div>`;
        }
    } else {
        container.classList.add('hidden');
    }
}

function generateOrangLainFields(jumlah) {
    const container = document.getElementById('container-oranglain');
    container.innerHTML = '';
    const num = parseInt(jumlah);
    
    if (num > 0) {
        container.classList.remove('hidden');
        for (let i = 1; i <= num; i++) {
            container.innerHTML += `
                <div style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid var(--border-color);">
                    <p class="card-label" style="margin-bottom: 12px; color: var(--accent-color);">Data Orang Ke-${i}</p>
                    <div class="form-grid">
                        <div class="form-group" style="grid-column: 1 / -1;"><input type="text" class="input-field" placeholder="Nama Lengkap"></div>
                        <div class="form-group"><input type="text" inputmode="numeric" class="input-field" placeholder="Umur (Tahun)"></div>
                        <div class="form-group">
                            <select class="input-field select-custom">
                                <option value="Keluarga">Keluarga (Paman, Bibi, dll)</option>
                                <option value="ART">Asisten Rumah Tangga (ART)</option>
                                <option value="Supir">Supir / Pekerja</option>
                                <option value="Teman/Lainnya">Teman / Lainnya</option>
                            </select>
                        </div>
                    </div>
                </div>`;
        }
    } else {
        container.classList.add('hidden');
    }
}

function addKendaraanField() {
    const div = document.createElement('div');
    div.style.cssText = 'display: flex; gap: 8px; margin-bottom: 8px; animation: pageFadeIn 0.3s forwards;';
    div.innerHTML = `<input type="text" class="input-field" placeholder="Nopol (cth: B 1234 CD)" style="flex: 1;"><select class="input-field select-custom" style="width: 120px;"><option>Motor</option><option>Mobil</option></select><button type="button" class="button-secondary" style="border-radius: 9999px; color: #ef4444;" onclick="this.parentElement.remove()"><i data-lucide="trash-2" style="width: 18px; height: 18px;"></i></button>`;
    document.getElementById('container-kendaraan').appendChild(div);
    lucide.createIcons();
}

function addDokumenField() {
    const div = document.createElement('div');
    div.style.cssText = 'display: flex; gap: 8px; margin-bottom: 8px; animation: pageFadeIn 0.3s forwards;';
    div.innerHTML = `<input type="file" class="input-field file-input-modern" style="flex: 1;"><button type="button" class="button-secondary" style="border-radius: 9999px; color: #ef4444;" onclick="this.parentElement.remove()"><i data-lucide="trash-2" style="width: 18px; height: 18px;"></i></button>`;
    document.getElementById('container-dokumen').appendChild(div);
    lucide.createIcons();
}

function simpanDataWarga() {
    const btn = document.querySelector('.drawer-footer .button-primary');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i data-lucide="loader"></i> Menyimpan...';
    
    const valNoKk = document.getElementById('warga_nokk').value;
    const valNik = document.getElementById('warga_nik_kepala').value;
    const valWa = document.getElementById('warga_nowa').value;
    const selectedBlokId = document.getElementById('warga_blok_id').value;

    if (!selectedBlokId) {
        alert('Silakan pilih Domisili Blok warga terlebih dahulu!');
        btn.innerHTML = originalText;
        lucide.createIcons();
        return;
    }
    
    // Validasi: Harus berupa angka (boleh kosong)
    const isNumber = (val) => /^\d*$/.test(val);
    if (!isNumber(valNoKk) || !isNumber(valNik) || !isNumber(valWa)) {
        alert('Validasi Gagal: No KK, NIK, dan No WhatsApp harus berupa angka!');
        btn.innerHTML = originalText;
        lucide.createIcons();
        return;
    }

    const formData = new FormData();
    if (window.currentWargaId > 0) {
        formData.append('id', window.currentWargaId);
    }
    formData.append('blok_id', selectedBlokId);
    formData.append('nomor_rumah', document.getElementById('warga_norumah').value);
    formData.append('nik', valNoKk); // Asumsi KK disimpan di kolom nik
    formData.append('nik_kepala', valNik);
    formData.append('nama_lengkap', document.getElementById('warga_kepala').value);
    formData.append('no_wa', valWa);
    formData.append('tempat_lahir', document.getElementById('warga_tempatlahir').value);
    formData.append('tanggal_lahir', document.getElementById('warga_tgllahir').value);
    formData.append('status_pernikahan', document.getElementById('warga_pernikahan').value);
    formData.append('status_kependudukan', document.getElementById('warga_status').value);

    const apiEndpoint = window.currentWargaId > 0 ? 'api/edit_warga.php' : 'api/tambah_warga.php';

    fetch(apiEndpoint, { method: 'POST', body: formData })
    .then(r => r.json())
    .then(data => {
        if (data.status === 'success') {
            if (localStorage.getItem('activePage') === 'global-warga') loadGlobalWarga();
            else refreshWargaList(); 
            closeFormWarga(); // Tutup laci form
            btn.innerHTML = originalText;
        } else {
            alert('Gagal: ' + data.message);
            btn.innerHTML = originalText;
        }
    })
    .catch(e => { alert('Kesalahan koneksi'); btn.innerHTML = originalText; });
}

function hapusWarga(id, nama) {
    if (confirm(`Hapus data warga ${nama}?`)) {
        const fd = new FormData(); fd.append('id', id);
        fetch('api/hapus_warga.php', { method: 'POST', body: fd })
        .then(r => r.json())
        .then(res => {
            if(res.status === 'success') {
                if (localStorage.getItem('activePage') === 'global-warga') loadGlobalWarga();
                else refreshWargaList();
            }
            else alert('Gagal: ' + res.message);
        });
    }
}

function editWarga(id) {
    window.currentWargaId = id;
    document.querySelector('#drawer-warga .ws-title').innerText = 'Edit Data Warga';

    fetch(`api/get_warga_detail.php?id=${id}`)
    .then(r => r.json())
    .then(data => {
        if (data) {
            const blokSelect = document.getElementById('warga_blok_id');
            blokSelect.value = data.blok_id || '';
            blokSelect.disabled = (localStorage.getItem('activePage') !== 'global-warga');

            document.getElementById('warga_norumah').value = data.nomor_rumah || '';
            document.getElementById('warga_nokk').value = data.nik || '';
            document.getElementById('warga_nik_kepala').value = data.nik_kepala || '';
            document.getElementById('warga_kepala').value = data.nama_lengkap || '';
            document.getElementById('warga_nowa').value = data.no_wa || '';
            document.getElementById('warga_tempatlahir').value = data.tempat_lahir || '';
            document.getElementById('warga_tgllahir').value = data.tanggal_lahir || '';
            document.getElementById('warga_pernikahan').value = data.status_pernikahan || 'Lajang';
            document.getElementById('warga_status').value = data.status_kependudukan || 'Tetap';

            togglePasangan(data.status_pernikahan);

            const drawer = document.getElementById('drawer-warga');
            drawer.classList.remove('hidden');
            setTimeout(() => drawer.classList.add('drawer-active'), 50);
        }
    })
    .catch(e => alert('Gagal mengambil data warga.'));
}

function downloadTemplateWarga() {
    window.location.href = 'api/download_template_warga.php';
}

function exportWargaCSV() {
    if (window.currentBlokId === 0) return;
    window.location.href = `api/export_warga.php?blok_id=${window.currentBlokId}`;
}

function importWargaCSV(input) {
    if (input.files.length === 0 || window.currentBlokId === 0) return;
    
    const fd = new FormData();
    fd.append('file', input.files[0]);
    fd.append('blok_id', window.currentBlokId);
    
    fetch('api/import_warga.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(res => {
        if(res.status === 'success') {
            alert(`Import Berhasil! ${res.imported} data warga ditambahkan.`);
            refreshWargaList();
        } else {
            alert('Gagal Import: ' + res.message);
        }
    }).catch(e => alert('Terjadi kesalahan saat mengunggah file.'));
}

function showPage(pageId) {
    // Simpan halaman yang sedang dibuka ke Local Storage
    localStorage.setItem('activePage', pageId);

    // Hide all pages
    document.querySelectorAll('.page-content').forEach(p => p.classList.add('hidden'));
    // Remove active state from nav
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('active-tab'));
    
    // Show requested page
    const targetPage = document.getElementById('page-' + pageId);
    targetPage.classList.remove('hidden');
    
    // Trigger fade-in animation
    targetPage.classList.remove('page-enter');
    void targetPage.offsetWidth; // Trigger DOM reflow to restart animation
    targetPage.classList.add('page-enter');

    // Set active state to nav
    document.getElementById('nav-' + pageId).classList.add('active-tab');

    // Update Header
    const titles = {
        'dashboard': ['Beranda', 'Selamat datang di dashboard warga.'],
        'global-warga': ['Daftar Warga', 'Pusat direktori data seluruh warga.'],
        'warga': ['Workspace', 'Kelola workspace blok dan data warga.'],
        'keuangan': ['Laporan Keuangan', 'Transparansi kas dan iuran RT.'],
        'keamanan': ['Keamanan', 'Pusat kendali laporan dan bantuan.'],
        'info': ['Informasi Umum', 'Pusat dokumen dan nomor darurat.']
    };

    document.getElementById('page-title').innerText = titles[pageId][0];
    document.getElementById('page-subtitle').innerText = titles[pageId][1];

    // Re-render icons for dynamic content if any
    lucide.createIcons();

    if (pageId === 'global-warga') {
        loadGlobalWarga();
    }
    
    // Scroll to top
    window.scrollTo(0,0);
}

// --- GLOBAL WARGA (DIRECTORY) LOGIC ---
window.allBloks = [];
window.globalWargaData = [];
window.globalWargaPage = 1;
const globalWargaItemsPerPage = 15;

function loadAllBloks() {
    fetch('api/get_bloks.php').then(r=>r.json()).then(res => {
        window.allBloks = res.data || [];
        let options = '<option value="">-- Pilih Blok --</option>';
        let filterOptions = '<option value="">Semua Blok</option>';
        window.allBloks.forEach(b => {
            options += `<option value="${b.id}">${b.nama_blok}</option>`;
            filterOptions += `<option value="${b.id}">${b.nama_blok}</option>`;
        });
        const formSelect = document.getElementById('warga_blok_id');
        if(formSelect) formSelect.innerHTML = options;
        const filterSelect = document.getElementById('filter-blok-global');
        if(filterSelect) filterSelect.innerHTML = filterOptions;
    });
}

function loadGlobalWarga() {
    const container = document.getElementById('global-warga-list-container');
    if(!container) return;
    container.innerHTML = '<p class="text-center text-secondary py-4">Memuat direktori warga...</p>';
    window.globalWargaPage = 1;
    
    fetch(`api/get_global_warga.php`)
    .then(r => r.json())
    .then(res => {
        if(res.status === 'success') {
            window.globalWargaData = res.data; filterGlobalWargaList();
        } else container.innerHTML = `<p class="text-red text-center py-4">${res.message}</p>`;
    });
}

function filterGlobalWargaList() {
    if (!window.globalWargaData) return;
    const q = document.getElementById('search-global-warga-input').value.toLowerCase();
    const fB = document.getElementById('filter-blok-global').value;
    const fP = document.getElementById('filter-pernikahan-global').value;
    const fS = document.getElementById('filter-status-global').value;

    const filtered = window.globalWargaData.filter(w => {
        const matchQ = (w.nama_lengkap && w.nama_lengkap.toLowerCase().includes(q)) || (w.nik && w.nik.toLowerCase().includes(q)) || (w.nik_kepala && w.nik_kepala.toLowerCase().includes(q));
        const matchB = fB === '' || w.blok_id == fB;
        const matchP = fP === '' || w.status_pernikahan === fP;
        const matchS = fS === '' || w.status_kependudukan === fS;
        return matchQ && matchB && matchP && matchS;
    });

    // Extract Unique Blocks
    const uniqueBloks = [...new Set(filtered.map(item => item.blok_id))];
    
    document.getElementById('sum-global-warga').innerText = filtered.length;
    document.getElementById('sum-global-blok').innerText = uniqueBloks.length + ' Blok';
    document.getElementById('sum-global-tetap').innerText = filtered.filter(w => w.status_kependudukan === 'Tetap').length;
    document.getElementById('sum-global-kontrak').innerText = filtered.filter(w => w.status_kependudukan === 'Kontrak').length;

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / globalWargaItemsPerPage);
    if (window.globalWargaPage > totalPages && totalPages > 0) window.globalWargaPage = totalPages;
    if (window.globalWargaPage < 1) window.globalWargaPage = 1;

    const startIndex = (window.globalWargaPage - 1) * globalWargaItemsPerPage;
    const paginated = filtered.slice(startIndex, Math.min(startIndex + globalWargaItemsPerPage, totalItems));

    const pageContainer = document.getElementById('global-warga-pagination');
    if (totalItems > 0) { pageContainer.style.display = 'flex'; document.getElementById('global-warga-page-info').innerText = `Menampilkan ${startIndex + 1}-${Math.min(startIndex + globalWargaItemsPerPage, totalItems)} dari ${totalItems}`; } 
    else { pageContainer.style.display = 'none'; }

    renderGlobalWargaList(paginated);
}

function renderGlobalWargaList(data) {
    const container = document.getElementById('global-warga-list-container');
    if (data.length === 0) { container.innerHTML = '<p class="text-secondary text-center py-4">Belum ada data warga ditemukan.</p>'; return; }

    let html = '<div class="warga-grid">';
    data.forEach(w => {
        let sK = w.status_kependudukan || '-';
        let statusClass = sK === 'Kontrak' ? 'bg-orange-light text-orange' : (sK === 'Weekend' ? 'bg-purple-light text-purple' : 'bg-emerald-light text-emerald');
        let waLink = w.no_wa ? `<a href="https://wa.me/${w.no_wa.replace(/\D/g, '').startsWith('0') ? '62'+w.no_wa.replace(/\D/g, '').substring(1) : w.no_wa.replace(/\D/g, '')}" target="_blank" class="button-secondary" style="border-radius: 12px; padding: 8px 16px; color: #25D366; border-color: transparent; background: rgba(37, 211, 102, 0.1); font-size: 0.8rem; font-weight: 600; display: flex; align-items: center; gap: 8px; box-shadow: none;" title="Chat WA"><i data-lucide="message-circle" style="width: 16px; height: 16px;"></i> Chat WA</a>` : '';
        let bE = `<button onclick="editWarga(${w.id})" class="button-secondary" style="border-radius: 12px; padding: 8px; color: var(--accent-color); border-color: transparent; background: color-mix(in srgb, var(--accent-color) 10%, transparent); box-shadow: none;" title="Edit"><i data-lucide="edit-2" style="width: 18px; height: 18px;"></i></button>`;
        let bD = `<button onclick="hapusWarga(${w.id}, '${w.nama_lengkap}')" class="button-secondary" style="border-radius: 12px; padding: 8px; color: #ef4444; border-color: transparent; background: rgba(239, 68, 68, 0.1); box-shadow: none;" title="Hapus"><i data-lucide="trash-2" style="width: 18px; height: 18px;"></i></button>`;

        html += `<div class="warga-card glass-card" style="padding: 24px;"><div class="warga-card-header"><div class="avatar bg-blue-light text-blue" style="width: 48px; height: 48px; font-size: 1.2rem;">${w.nama_lengkap.charAt(0)}</div><div style="flex: 1; overflow: hidden;"><h4 style="margin: 0; font-size: 1.1rem; color: var(--text-color); white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">${w.nama_lengkap}</h4><div style="display:flex; gap:6px; margin-top:6px; flex-wrap:wrap;"><span class="badge bg-secondary-light text-secondary" style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; background: rgba(128,128,128,0.1);"><i data-lucide="map" style="width: 12px; height: 12px;"></i> ${w.nama_blok || 'Blok ?'}</span><span class="badge ${statusClass}" style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px;"><i data-lucide="${sK === 'Tetap' ? 'user-check' : 'user'}" style="width: 12px; height: 12px;"></i> ${sK}</span></div></div></div><div class="warga-card-body"><div class="warga-detail-item"><i data-lucide="map-pin"></i> <span>No. Rumah: ${w.nomor_rumah || '-'}</span></div><div class="warga-detail-item"><i data-lucide="credit-card"></i> <span>NIK: ${w.nik_kepala || w.nik || '-'}</span></div><div class="warga-detail-item"><i data-lucide="user-check"></i> <span>Pernikahan: ${w.status_pernikahan || 'Lajang'}</span></div></div><div class="warga-card-actions" style="display: flex; justify-content: space-between; align-items: center; margin-top: auto; border-top: 1px dashed var(--border-color); padding-top: 16px;"><div>${waLink}</div><div class="warga-action-group">${bE}${bD}</div></div></div>`;
    });
    html += '</div>'; container.innerHTML = html; lucide.createIcons();
}

function prevPageGlobalWarga() { if (window.globalWargaPage > 1) { window.globalWargaPage--; filterGlobalWargaList(); } }
function nextPageGlobalWarga() { window.globalWargaPage++; filterGlobalWargaList(); }

// --- Logika Kas Blok & Iuran ---
window.currentIuranData = [];
window.currentMasterIuran = [];

function initKeuanganBlok() {
    const selectBulan = document.getElementById('filter-bulan-iuran');
    if (selectBulan.options.length === 0) {
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const now = new Date();
        
        // Default: Bulan Sebelumnya
        let defaultMonth = now.getMonth() - 1;
        let defaultYear = now.getFullYear();
        if (defaultMonth < 0) { defaultMonth = 11; defaultYear -= 1; }

        for (let i = 0; i < 12; i++) {
            const opt = document.createElement('option');
            opt.value = `${i}-${defaultYear}`;
            opt.text = `${months[i]} ${defaultYear}`;
            if (i === defaultMonth) opt.selected = true;
            selectBulan.appendChild(opt);
        }
    }
    
    loadDataIuran();
}

function prevMonthIuran() {
    const select = document.getElementById('filter-bulan-iuran');
    if (select.selectedIndex > 0) {
        select.selectedIndex--;
        loadDataIuran(); // Minta database memuat data bulan sebelumnya
    }
}

function nextMonthIuran() {
    const select = document.getElementById('filter-bulan-iuran');
    if (select.selectedIndex < select.options.length - 1) {
        select.selectedIndex++;
        loadDataIuran(); // Minta database memuat data bulan selanjutnya
    }
}

window.currentIuranPage = 1;
const iuranItemsPerPage = 15;

function loadDataIuran() {
    const selectBulan = document.getElementById('filter-bulan-iuran').value;
    if (!selectBulan) return;
    
    const [bulan, tahun] = selectBulan.split('-');
    const container = document.getElementById('modal-iuran-list-container');
    container.innerHTML = '<p class="text-secondary text-center py-4">Memuat data iuran...</p>';
    window.currentIuranPage = 1; // Reset halaman ke 1 saat ganti bulan

    fetch(`api/get_iuran.php?blok_id=${window.currentBlokId}&bulan=${bulan}&tahun=${tahun}`)
        .then(async r => {
            const text = await r.text();
            try {
                return JSON.parse(text);
            } catch (e) {
                console.error("Server Response Error:", text);
                throw new Error("Respon Server bukan JSON. Pastikan tabel pembayaran_iuran ada, dan file api/get_iuran.php valid.");
            }
        })
        .then(data => {
            if(data.error) {
                container.innerHTML = `<p class="text-red text-center py-4">${data.message}</p>`;
                return;
            }
            window.currentIuranData = data.data;
            window.currentMasterIuran = data.master || [];
            filterIuranList();
        })
        .catch(e => {
            container.innerHTML = `<p class="text-red text-center py-4" style="font-size: 0.875rem;"><b>Error:</b> ${e.message}</p>`;
        });
}

function filterIuranList() {
    const q = document.getElementById('search-iuran-input').value.toLowerCase();
    const fStatus = document.getElementById('filter-status-iuran').value;
    
    let totalLunas = 0;
    let totalMenunggak = 0;
    let countLunas = 0;
    let countMenunggak = 0;

    const filtered = window.currentIuranData.filter(d => {
        const matchQ = d.nama_lengkap.toLowerCase().includes(q) || d.nomor_rumah.toLowerCase().includes(q);
        const matchS = fStatus === '' || d.status === fStatus;
        return matchQ && matchS;
    });

    // Akumulasi data ke Summary Cards
    filtered.forEach(d => {
        const tagihanInt = parseInt(d.total_tagihan) || 0;
        if (d.status === 'LUNAS') {
            totalLunas += tagihanInt;
            countLunas++;
        } else {
            totalMenunggak += tagihanInt;
            countMenunggak++;
        }
    });

    document.getElementById('summary-lunas').innerText = 'Rp ' + totalLunas.toLocaleString('id-ID');
    document.getElementById('summary-menunggak').innerText = 'Rp ' + totalMenunggak.toLocaleString('id-ID');
    document.getElementById('summary-count-lunas').innerHTML = `<i data-lucide="users" style="width: 14px; height: 14px;"></i> ${countLunas} Warga`;
    document.getElementById('summary-count-menunggak').innerHTML = `<i data-lucide="users" style="width: 14px; height: 14px;"></i> ${countMenunggak} Warga`;

    // Logika Paginasi (Membagi data per 15 baris)
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / iuranItemsPerPage);
    if (window.currentIuranPage > totalPages && totalPages > 0) window.currentIuranPage = totalPages;
    if (window.currentIuranPage < 1) window.currentIuranPage = 1;

    const startIndex = (window.currentIuranPage - 1) * iuranItemsPerPage;
    const endIndex = Math.min(startIndex + iuranItemsPerPage, totalItems);
    const paginatedItems = filtered.slice(startIndex, endIndex);

    const paginationContainer = document.getElementById('iuran-pagination');
    if (totalItems > 0) {
        paginationContainer.style.display = 'flex';
        document.getElementById('iuran-page-info').innerText = `Menampilkan ${startIndex + 1}-${endIndex} dari ${totalItems}`;
    } else {
        paginationContainer.style.display = 'none';
    }

    const container = document.getElementById('modal-iuran-list-container');
    if (paginatedItems.length === 0) {
        container.innerHTML = '<p class="text-secondary text-center py-4">Tidak ada data tagihan.</p>';
        lucide.createIcons();
        return;
    }

    let html = '<div style="display: flex; flex-direction: column; gap: 12px;">';
    paginatedItems.forEach(d => {
        const isLunas = d.status === 'LUNAS';
        const statusClass = isLunas ? 'bg-emerald-light text-emerald' : 'bg-red-light text-red';
        const warningBorder = isLunas ? '' : 'border-left: 4px solid #ef4444; background: rgba(239, 68, 68, 0.05);';
        
        // Format tombol WA untuk Tagihan
        let waLink = '';
        if (d.no_wa) {
            let cleanWa = d.no_wa.replace(/\D/g, ''); 
            if (cleanWa.startsWith('0')) cleanWa = '62' + cleanWa.substring(1);
            waLink = `<a href="https://wa.me/${cleanWa}" target="_blank" class="button-secondary" style="border-radius: 50%; padding: 8px; color: #25D366; border-color: transparent; background: rgba(37, 211, 102, 0.1); box-shadow: none;" title="Chat WhatsApp" onclick="event.stopPropagation();"><i data-lucide="message-circle" style="width: 18px; height: 18px;"></i></a>`;
        }

        // Lencana Status Setoran (Di Bendahara vs Disetor RT)
        let statusSetorBadge = '';
        if (isLunas) {
            if (d.tgl_setor) {
                statusSetorBadge = `<span class="badge bg-purple-light text-purple" style="font-size: 0.7rem; padding: 4px 10px; display: inline-flex; align-items: center; gap: 4px;"><i data-lucide="check-check" style="width: 14px; height: 14px;"></i> Disetor RT</span>`;
            } else {
                statusSetorBadge = `<span class="badge bg-orange-light text-orange" style="font-size: 0.7rem; padding: 4px 10px; display: inline-flex; align-items: center; gap: 4px;"><i data-lucide="wallet" style="width: 14px; height: 14px;"></i> Di Bendahara</span>`;
            }
        }

        // Checkbox untuk Tandai Sebagian (Multiple Select)
        const checkboxHtml = !isLunas 
            ? `<input type="checkbox" class="iuran-checkbox" value="${d.id}" style="width: 20px; height: 20px; cursor: pointer; accent-color: var(--accent-color);" onclick="event.stopPropagation();">` 
            : `<div style="width: 20px;"></div>`;

        const actionBtn = isLunas 
            ? `<div class="text-secondary" style="font-size: 0.75rem; text-align:right; display: flex; flex-direction: column; align-items: flex-end;"><span style="display: flex; align-items: center; gap: 4px;"><i data-lucide="calendar" style="width: 14px; height: 14px;"></i> ${d.tgl_bayar}</span><span>Via: <b class="text-color">${d.metode_pembayaran || 'Cash'}</b></span></div>`
            : `<button class="button-primary button-sm" style="padding: 8px 16px; font-size: 0.75rem; border-radius: 12px; display: flex; align-items: center; gap: 6px;" onclick="bayarIuran(${d.id})"><i data-lucide="check-circle" style="width: 16px; height: 16px;"></i> Tandai Dibayar</button>`;

        // Tombol CRUD Detail, Edit, Hapus untuk Iuran
        const crudBtns = `
            <button onclick="detailIuran(${d.id})" class="button-secondary" style="border-radius: 50%; padding: 8px; color: var(--accent-color); border-color: transparent; background: color-mix(in srgb, var(--accent-color) 10%, transparent); box-shadow: none;" title="Detail Tagihan"><i data-lucide="file-text" style="width: 16px; height: 16px;"></i></button>
            <button onclick="editIuran(${d.id})" class="button-secondary" style="border-radius: 50%; padding: 8px; color: var(--text-secondary-color); border-color: transparent; background: var(--hover-bg); box-shadow: none;" title="Edit Tagihan"><i data-lucide="edit-2" style="width: 16px; height: 16px;"></i></button>
            <button onclick="hapusIuran(${d.id})" class="button-secondary" style="border-radius: 50%; padding: 8px; color: #ef4444; border-color: transparent; background: rgba(239, 68, 68, 0.1); box-shadow: none;" title="Hapus Riwayat"><i data-lucide="trash-2" style="width: 16px; height: 16px;"></i></button>
        `;

        // Detail Breakdown Iuran Bergaya Tabel Struk Modern
        let breakdownHtml = '';
        if (window.currentMasterIuran && window.currentMasterIuran.length > 0) {
            let details = window.currentMasterIuran.map(m => `
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; padding: 6px 0;">
                    <span style="color: var(--text-secondary-color);">${m.nama_komponen}</span>
                    <span style="font-weight: 600; color: var(--text-color);">Rp ${parseInt(m.nominal).toLocaleString('id-ID')}</span>
                </div>
            `).join('<div style="border-bottom: 1px dashed var(--border-color); opacity: 0.5;"></div>');
            
            breakdownHtml = `
                <div style="width: 100%; background: var(--primary-bg); border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; margin-top: 8px;">
                    <div style="display: flex; justify-content: space-between; padding: 8px 12px; background: color-mix(in srgb, var(--hover-bg) 50%, transparent); border-bottom: 1px solid var(--border-color);">
                        <span style="font-size: 0.65rem; font-weight: 700; color: var(--text-secondary-color); text-transform: uppercase; letter-spacing: 0.05em;">Rincian Komponen Tagihan</span>
                        <span style="font-size: 0.65rem; font-weight: 700; color: var(--text-secondary-color); text-transform: uppercase; letter-spacing: 0.05em;">Nominal</span>
                    </div>
                    <div style="padding: 4px 12px; max-height: 140px; overflow-y: auto;" class="hide-scrollbar">
                        ${details}
                    </div>
                </div>
            `;
        }

        html += `
            <div class="glass-card" style="padding: 20px; display: flex; flex-direction: column; gap: 16px; ${warningBorder}">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 20px;">
                    
                    <!-- Info Warga -->
                    <div class="list-item-left" style="flex: 1; min-width: 240px; display: flex; align-items: center; gap: 16px;">
                        ${checkboxHtml}
                        <div class="avatar bg-emerald-light text-emerald" style="width: 48px; height: 48px; font-size: 1.2rem;">${d.nama_lengkap.charAt(0)}</div>
                        <div class="list-item-content">
                            <h4 style="margin: 0; font-size: 1.1rem; color: var(--text-color); font-weight: 700;">${d.nama_lengkap}</h4>
                            <p class="list-item-subtitle" style="font-size: 0.85rem; margin-top: 4px;">Blok No: <b>${d.nomor_rumah}</b></p>
                            <p class="list-item-subtitle" style="font-size: 0.85rem; margin-top: 2px;">Tagihan: <b class="text-color">Rp ${parseInt(d.total_tagihan).toLocaleString('id-ID')}</b></p>
                        </div>
                    </div>
                    
                    <!-- Aksi & Status -->
                    <div class="list-item-right" style="display: flex; flex-direction: column; align-items: flex-end; gap: 12px; flex: 1; min-width: 240px;">
                        <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; width: 100%;">
                            <span class="badge ${statusClass}" style="font-size: 0.7rem; padding: 4px 10px; display: inline-flex; align-items: center; gap: 4px;"><i data-lucide="${isLunas ? 'check-circle' : 'alert-circle'}" style="width: 14px; height: 14px;"></i> ${isLunas ? 'LUNAS' : 'BELUM BAYAR'}</span>
                            ${statusSetorBadge}
                        </div>
                        <div style="display: flex; justify-content: flex-end; width: 100%;">
                            ${actionBtn}
                        </div>
                        <div style="display: flex; gap: 8px; align-items: center; justify-content: flex-end; margin-top: 4px;">
                            ${waLink}
                            ${waLink ? '<div style="width: 1px; height: 24px; background-color: var(--border-color); margin: 0 4px;"></div>' : ''}
                            ${crudBtns}
                        </div>
                    </div>
                </div>
                ${breakdownHtml}
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
    lucide.createIcons();
}

function prevPageIuran() {
    if (window.currentIuranPage > 1) {
        window.currentIuranPage--;
        filterIuranList();
    }
}

function nextPageIuran() {
    const q = document.getElementById('search-iuran-input').value.toLowerCase();
    const fStatus = document.getElementById('filter-status-iuran').value;
    const filtered = window.currentIuranData.filter(d => (d.nama_lengkap.toLowerCase().includes(q) || d.nomor_rumah.toLowerCase().includes(q)) && (fStatus === '' || d.status === fStatus));
    
    const totalPages = Math.ceil(filtered.length / iuranItemsPerPage);
    if (window.currentIuranPage < totalPages) {
        window.currentIuranPage++;
        filterIuranList();
    }
}

// Fungsi pembantu untuk mendapatkan format YYYY-MM-DD sesuai zona waktu komputer Anda
function getLocalDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function bayarIuran(wargaId) {
    document.getElementById('bayar-iuran-id').value = wargaId;
    
    // Gunakan fungsi lokal agar tanggal form tidak blank/error
    document.getElementById('bayar-tanggal').value = getLocalDateString();
    
    document.getElementById('modal-bayar-iuran').classList.remove('hidden');
}

function submitBayarIuran(btn) {
    const id = document.getElementById('bayar-iuran-id').value;
    const metode = document.getElementById('bayar-metode').value;
    const tanggal = document.getElementById('bayar-tanggal').value;
    
    btn.innerHTML = "Memproses...";
    const fd = new FormData(); fd.append('id', id); fd.append('metode', metode); fd.append('tanggal', tanggal);
    
    fetch('api/bayar_iuran.php', {method: 'POST', body: fd}).then(r=>r.json()).then(res=>{
        if(res.status === 'success') { document.getElementById('modal-bayar-iuran').classList.add('hidden'); loadDataIuran(); }
        else alert("Gagal: " + res.message);
        btn.innerHTML = `<i data-lucide="check-circle" style="margin-right: 8px;"></i> Konfirmasi Pembayaran`;
        lucide.createIcons();
    });
}

function bayarSemuaIuran() {
    if(confirm("Tandai SEMUA tagihan yang belum bayar di bulan ini menjadi LUNAS (Via Cash)?")) {
        const selectBulan = document.getElementById('filter-bulan-iuran').value;
        const [bulan, tahun] = selectBulan.split('-');
        const fd = new FormData(); fd.append('blok_id', window.currentBlokId); fd.append('bulan', bulan); fd.append('tahun', tahun);
        
        fetch('api/bayar_semua_iuran.php', {method: 'POST', body: fd}).then(r=>r.json()).then(res=>{
            if(res.status === 'success') { alert(res.updated + " warga berhasil ditandai LUNAS."); loadDataIuran(); }
        });
    }
}

function bayarTerpilihIuran() {
    const checkboxes = document.querySelectorAll('.iuran-checkbox:checked');
    if (checkboxes.length === 0) {
        alert("Pilih minimal satu tagihan untuk ditandai lunas.");
        return;
    }

    if(confirm(`Tandai ${checkboxes.length} tagihan terpilih menjadi LUNAS (Via Cash)?`)) {
        const ids = Array.from(checkboxes).map(cb => cb.value);
        const fd = new FormData(); 
        fd.append('ids', JSON.stringify(ids));
        
        fetch('api/bayar_sebagian_iuran.php', {method: 'POST', body: fd}).then(r=>r.json()).then(res=>{
            if(res.status === 'success') { alert(res.updated + " tagihan berhasil ditandai LUNAS."); loadDataIuran(); }
            else alert("Gagal: " + res.message);
        }).catch(e => alert("Terjadi kesalahan koneksi."));
    }
}

function setorKeRT() {
    document.getElementById('setor-tanggal').value = getLocalDateString();
    document.getElementById('modal-setor-rt').classList.remove('hidden');
}

function submitSetorRT(btn) {
    const selectBulan = document.getElementById('filter-bulan-iuran').value;
    const [bulan, tahun] = selectBulan.split('-');
    const tanggal = document.getElementById('setor-tanggal').value;

    btn.innerHTML = "Memproses...";
    const fd = new FormData();
    fd.append('blok_id', window.currentBlokId);
    fd.append('bulan', bulan);
    fd.append('tahun', tahun);
    fd.append('tanggal', tanggal);

    fetch('api/setor_kas_rt.php', {method: 'POST', body: fd}).then(r=>r.json()).then(res=>{
        if(res.status === 'success') {
            document.getElementById('modal-setor-rt').classList.add('hidden');
            alert(`Berhasil menyetorkan kas blok ke RT Pusat!`);
            loadDataIuran();
        } else alert("Gagal: " + res.message);
        btn.innerHTML = `<i data-lucide="send" style="margin-right: 8px;"></i> Konfirmasi Setoran`;
        lucide.createIcons();
    }).catch(e => { alert("Kesalahan koneksi."); btn.innerHTML = `<i data-lucide="send" style="margin-right: 8px;"></i> Konfirmasi Setoran`; lucide.createIcons(); });
}

function detailIuran(id) {
    const w = window.currentIuranData.find(x => x.id == id);
    const tagihanUtama = parseInt(w.total_tagihan);
    document.getElementById('detail-iuran-total').innerText = 'Rp ' + tagihanUtama.toLocaleString('id-ID');
    
    // Generate breakdown rincian berdasarkan Master Iuran saat ini
    let html = '';
    let totalMaster = 0;
    window.currentMasterIuran.forEach(m => {
        totalMaster += parseInt(m.nominal);
        html += `<div style="display:flex; justify-content:space-between; font-size:0.875rem;"><span>${m.nama_komponen}</span><span>Rp ${parseInt(m.nominal).toLocaleString('id-ID')}</span></div>`;
    });
    
    // Jika ada selisih (contoh: tagihan diubah manual melalui Edit Tagihan)
    if (tagihanUtama !== totalMaster && totalMaster > 0) {
        html += `<div style="display:flex; justify-content:space-between; font-size:0.875rem; color: var(--text-secondary-color); margin-top: 8px; border-top: 1px dashed var(--border-color); padding-top: 8px;"><span>Sisa / Penyesuaian Manual</span><span>Rp ${(tagihanUtama - totalMaster).toLocaleString('id-ID')}</span></div>`;
    }

    document.getElementById('detail-iuran-list').innerHTML = html;
    document.getElementById('modal-detail-iuran').classList.remove('hidden');
}
function toggleEditIuranDates(status) {
    const container = document.getElementById('edit-iuran-dates-container');
    container.style.display = (status === 'LUNAS') ? 'block' : 'none';
}
function editIuran(id) {
    const w = window.currentIuranData.find(x => x.id == id);
    document.getElementById('edit-iuran-id').value = id;
    document.getElementById('edit-iuran-nominal').value = w.total_tagihan;
    document.getElementById('edit-iuran-status').value = w.status;
    document.getElementById('edit-iuran-metode').value = w.metode_pembayaran || 'Cash';
    
    if (w.tanggal_bayar) document.getElementById('edit-iuran-tgl-bayar').value = w.tanggal_bayar.split(' ')[0];
    else document.getElementById('edit-iuran-tgl-bayar').value = getLocalDateString();
    
    if (w.tanggal_setor) document.getElementById('edit-iuran-tgl-setor').value = w.tanggal_setor.split(' ')[0];
    else document.getElementById('edit-iuran-tgl-setor').value = '';

    toggleEditIuranDates(w.status);
    document.getElementById('modal-edit-iuran').classList.remove('hidden');
}
function submitEditIuran(btn) {
    const origText = btn.innerHTML;
    btn.innerHTML = "Memproses...";
    
    const fd = new FormData();
    fd.append('id', document.getElementById('edit-iuran-id').value);
    fd.append('tagihan', document.getElementById('edit-iuran-nominal').value);
    fd.append('status', document.getElementById('edit-iuran-status').value);
    fd.append('metode', document.getElementById('edit-iuran-metode').value);
    fd.append('tgl_bayar', document.getElementById('edit-iuran-tgl-bayar').value);
    fd.append('tgl_setor', document.getElementById('edit-iuran-tgl-setor').value);
    fetch('api/edit_iuran.php', {method: 'POST', body: fd}).then(r=>r.json()).then(res=>{
        if(res.status==='success') { document.getElementById('modal-edit-iuran').classList.add('hidden'); loadDataIuran(); }
        else { alert("Gagal: " + (res.message || "Error saat update")); }
        btn.innerHTML = origText;
    });
}
function hapusIuran(id) {
    if(confirm("PERINGATAN:\nYakin ingin menghapus riwayat tagihan ini secara permanen?")) {
        const fd = new FormData(); fd.append('id', id);
        fetch('api/hapus_iuran.php', {method: 'POST', body: fd}).then(r=>r.json()).then(res=>{
            if(res.status==='success') loadDataIuran();
        });
    }
}

// --- Master Iuran Drawer ---
function openMasterIuran() {
    const drawer = document.getElementById('drawer-master-iuran');
    drawer.classList.remove('hidden');
    setTimeout(() => drawer.classList.add('drawer-active'), 50);
    renderMasterIuranList();
}
function closeMasterIuran() {
    const drawer = document.getElementById('drawer-master-iuran');
    drawer.classList.remove('drawer-active');
    setTimeout(() => drawer.classList.add('hidden'), 400);
}
function renderMasterIuranList() {
    const container = document.getElementById('master-iuran-list');
    const komponen = window.currentMasterIuran;
    
    let total = 0; let html = '';
    komponen.forEach((k, idx) => {
        const nom = parseInt(k.nominal);
        total += nom;
        html += `
            <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 12px;">
                <input type="text" name="master_nama[]" class="input-field flex-grow" value="${k.nama_komponen}" placeholder="Nama Komponen" oninput="updateMasterTotal()">
                <input type="number" name="master_nominal[]" class="input-field" value="${nom}" style="width: 140px;" placeholder="Nominal (Rp)" oninput="updateMasterTotal()">
                <button type="button" class="button-secondary" style="border-radius: 50%; color: #ef4444; padding: 10px;" onclick="this.parentElement.remove(); updateMasterTotal();"><i data-lucide="trash-2" style="width: 16px; height: 16px;"></i></button>
            </div>`;
    });
    container.innerHTML = html;
    document.getElementById('total-master-iuran').innerText = 'Rp ' + total.toLocaleString('id-ID');
    lucide.createIcons();
}
function updateMasterTotal() {
    let t = 0;
    document.querySelectorAll('input[name="master_nominal[]"]').forEach(el => { t += (parseInt(el.value) || 0); });
    document.getElementById('total-master-iuran').innerText = 'Rp ' + t.toLocaleString('id-ID');
}
function addMasterIuranField() {
    const div = document.createElement('div');
    div.style.cssText = 'display: flex; gap: 12px; align-items: center; margin-bottom: 12px; animation: pageFadeIn 0.3s forwards;';
    div.innerHTML = `<input type="text" name="master_nama[]" class="input-field flex-grow" placeholder="Cth: Uang Agustusan" oninput="updateMasterTotal()"><input type="number" name="master_nominal[]" class="input-field" style="width: 140px;" placeholder="Nominal (Rp)" oninput="updateMasterTotal()"><button type="button" class="button-secondary" style="border-radius: 50%; color: #ef4444; padding: 10px;" onclick="this.parentElement.remove(); updateMasterTotal();"><i data-lucide="trash-2" style="width: 16px; height: 16px;"></i></button>`;
    document.getElementById('master-iuran-list').appendChild(div);
    lucide.createIcons();
}
function simpanMasterIuran() { 
    const btn = document.querySelector('#drawer-master-iuran .button-primary');
    const orig = btn.innerHTML; btn.innerHTML = '<i data-lucide="loader"></i> Menyimpan...';

    const fd = new FormData();
    fd.append('blok_id', window.currentBlokId); // Tambahkan ID Blok
    document.querySelectorAll('input[name="master_nama[]"]').forEach(el => fd.append('komponen[]', el.value));
    document.querySelectorAll('input[name="master_nominal[]"]').forEach(el => fd.append('nominal[]', el.value));
    
    fetch('api/simpan_master_iuran.php', { method: 'POST', body: fd })
    .then(async r => {
        const text = await r.text();
        try {
            return JSON.parse(text);
        } catch (e) {
            console.error("Server Error:", text);
            throw new Error("Respon Server bukan JSON. Cek console log atau pastikan file api/simpan_master_iuran.php ada.");
        }
    })
    .then(res => {
        if (res.status === 'success') { closeMasterIuran(); loadDataIuran(); } 
        else alert('Gagal: ' + res.message);
        btn.innerHTML = orig;
    }).catch(e => { alert('Error Server:\n' + e.message); btn.innerHTML = orig; lucide.createIcons(); });
}

// --- Rekonsiliasi & Audit Kas ---
function openRekonsiliasi() {
    document.getElementById('modal-rekonsiliasi').classList.remove('hidden');
    loadRekonsiliasi();
}

function loadRekonsiliasi() {
    const container = document.getElementById('rekonsiliasi-list');
    container.innerHTML = '<p class="text-center text-secondary py-4">Menghitung dan memuat data rekonsiliasi...</p>';
    document.getElementById('rekon-total-warga').innerText = 'Memuat...';

    fetch(`api/get_rekonsiliasi.php?blok_id=${window.currentBlokId}`)
    .then(r => r.json())
    .then(res => {
        if (res.status !== 'success') { container.innerHTML = `<p class="text-red text-center">${res.message}</p>`; return; }

        document.getElementById('rekon-bulan').value = res.periode_bulan;
        document.getElementById('rekon-tahun').value = res.periode_tahun;

        if (res.data.length === 0) {
            container.innerHTML = '<div class="glass-card" style="padding: 32px; text-align: center; border-color: var(--accent-color);"><i data-lucide="check-circle" style="color: var(--accent-color); width: 48px; height: 48px; margin: 0 auto 16px auto;"></i><p class="font-bold text-color" style="font-size: 1.2rem;">Luar Biasa!</p><p class="text-secondary" style="font-size: 0.875rem;">Semua warga di blok ini telah melunasi iurannya secara penuh.</p></div>';
            document.getElementById('rekon-total-warga').innerText = '0 Warga';
            document.getElementById('rekon-total-warga').className = 'badge bg-emerald-light text-emerald';
            lucide.createIcons(); return;
        }

        document.getElementById('rekon-total-warga').innerText = `${res.data.length} Warga Menunggak`;
        document.getElementById('rekon-total-warga').className = 'badge bg-red-light text-red';

        let html = '';
        res.data.forEach(w => {
            let waLink = '';
            if (w.no_wa) {
                let cleanWa = w.no_wa.replace(/\D/g, ''); if (cleanWa.startsWith('0')) cleanWa = '62' + cleanWa.substring(1);
                const msg = encodeURIComponent(`Halo Bp/Ibu ${w.nama_lengkap},\nMenginformasikan dari sistem Kas Blok bahwa terdapat *tunggakan iuran wajib sebanyak ${w.tunggakan_bulan} Bulan* (Estimasi: Rp ${w.estimasi_hutang.toLocaleString('id-ID')}).\nMohon konfirmasi pembayarannya ya. Terima kasih.`);
                waLink = `<a href="https://wa.me/${cleanWa}?text=${msg}" target="_blank" class="button-secondary" style="border-radius: 50%; padding: 8px; color: #25D366; border-color: transparent; background: rgba(37, 211, 102, 0.1); box-shadow: none;" title="Kirim Tagihan WA"><i data-lucide="message-circle" style="width: 16px; height: 16px;"></i></a>`;
            }

            html += `<div class="glass-card" style="padding: 16px; border-left: 4px solid #ef4444; display: flex; justify-content: space-between; align-items: center;"><div><p class="font-bold text-color" style="margin: 0; font-size: 1rem;">${w.nama_lengkap}</p><p class="text-secondary" style="font-size: 0.75rem; margin-top: 4px;">Blok No: ${w.nomor_rumah}</p></div><div style="display: flex; align-items: center; gap: 16px;"><div style="text-align: right;"><p class="text-red font-bold" style="margin: 0; font-size: 0.9rem;">${w.tunggakan_bulan} Bulan</p><p class="text-secondary" style="font-size: 0.7rem; margin-top: 2px;">~ Rp ${w.estimasi_hutang.toLocaleString('id-ID')}</p></div>${waLink}</div></div>`;
        });
        container.innerHTML = html;
        lucide.createIcons();
    });
}

function simpanPeriodeRekon(btn) {
    const orig = btn.innerHTML; btn.innerHTML = '<i data-lucide="loader"></i>'; lucide.createIcons();

    const fd = new FormData();
    fd.append('blok_id', window.currentBlokId);
    fd.append('bulan', document.getElementById('rekon-bulan').value);
    fd.append('tahun', document.getElementById('rekon-tahun').value);

    fetch('api/simpan_periode_blok.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(res => {
        btn.innerHTML = orig; // Kembalikan bentuk tombol
        lucide.createIcons();
        if(res.status === 'success') loadRekonsiliasi();
        else { alert('Gagal menyimpan periode: ' + res.message); }
    })
    .catch(e => {
        btn.innerHTML = orig; // Kembalikan bentuk tombol jika error
        lucide.createIcons();
        alert('Terjadi kesalahan koneksi jaringan.');
    });
}

// Handle Mobile Interaction (vibration etc)
document.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('touchstart', function() {
        if ('vibrate' in navigator) {
            navigator.vibrate(5);
        }
    });
});

// --- Agenda & Laporan ---
window.currentAgendaData = [];
window.currentLaporanData = [];
window.currentAgendaPage = 1;
const agendaItemsPerPage = 15;
window.currentLaporanPage = 1;
const laporanItemsPerPage = 15;

function initAgendaLaporan() {
    // Reset ke tab pertama
    const firstSubTab = document.querySelector('.sub-nav-tab');
    if (firstSubTab) switchSubTab(firstSubTab, 'sub-tab-agenda');

    loadAgendaData();
    loadLaporanData();
}

function loadAgendaData() {
    const container = document.getElementById('agenda-list-container');
    if(container) container.innerHTML = '<p class="text-center text-secondary py-4">Memuat agenda...</p>';
    window.currentAgendaPage = 1;
    
    fetch(`api/get_agenda.php?blok_id=${window.currentBlokId}`)
    .then(r => r.json())
    .then(res => {
        if(res.status === 'success') {
            window.currentAgendaData = res.data;
            filterAgendaList();
        } else {
            if(container) container.innerHTML = `<p class="text-red text-center py-4">${res.message}</p>`;
        }
    });
}

function filterAgendaList() {
    if (!window.currentAgendaData) return;
    
    const q = document.getElementById('search-agenda-input').value.toLowerCase();
    const fStatus = document.getElementById('filter-status-agenda').value;

    const filtered = window.currentAgendaData.filter(a => {
        const matchQ = (a.judul && a.judul.toLowerCase().includes(q)) || 
                       (a.keterangan && a.keterangan.toLowerCase().includes(q));
        const matchS = fStatus === '' || a.status === fStatus;
        return matchQ && matchS;
    });

    // Update Kartu Ringkasan Agenda
    document.getElementById('sum-agenda-total').innerText = filtered.length;
    document.getElementById('sum-agenda-selesai').innerText = filtered.filter(a => a.status === 'Selesai').length + ' Selesai';

    // Pagination Agenda
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / agendaItemsPerPage);
    if (window.currentAgendaPage > totalPages && totalPages > 0) window.currentAgendaPage = totalPages;
    if (window.currentAgendaPage < 1) window.currentAgendaPage = 1;

    const startIndex = (window.currentAgendaPage - 1) * agendaItemsPerPage;
    const endIndex = Math.min(startIndex + agendaItemsPerPage, totalItems);
    const paginatedItems = filtered.slice(startIndex, endIndex);

    const paginationContainer = document.getElementById('agenda-pagination');
    if (totalItems > 0) {
        paginationContainer.style.display = 'flex';
        document.getElementById('agenda-page-info').innerText = `Menampilkan ${startIndex + 1}-${endIndex} dari ${totalItems}`;
    } else {
        paginationContainer.style.display = 'none';
    }

    renderAgendaList(paginatedItems);
}

function prevPageAgenda() {
    if (window.currentAgendaPage > 1) { window.currentAgendaPage--; filterAgendaList(); }
}

function nextPageAgenda() {
    window.currentAgendaPage++; filterAgendaList();
}

function loadLaporanData() {
    const container = document.getElementById('laporan-list-container');
    if(container) container.innerHTML = '<p class="text-center text-secondary py-4">Memuat laporan...</p>';
    window.currentLaporanPage = 1;
    
    fetch(`api/get_laporan.php?blok_id=${window.currentBlokId}`)
    .then(r => r.json())
    .then(res => {
        if(res.status === 'success') {
            window.currentLaporanData = res.data;
            filterLaporanList();
        } else {
            if(container) container.innerHTML = `<p class="text-red text-center py-4">${res.message}</p>`;
        }
    });
}

function filterLaporanList() {
    if (!window.currentLaporanData) return;
    
    const q = document.getElementById('search-laporan-input').value.toLowerCase();
    const fStatus = document.getElementById('filter-status-laporan').value;

    const filtered = window.currentLaporanData.filter(l => {
        const matchQ = (l.judul_laporan && l.judul_laporan.toLowerCase().includes(q)) || 
                       (l.keterangan && l.keterangan.toLowerCase().includes(q));
        const matchS = fStatus === '' || l.status === fStatus;
        return matchQ && matchS;
    });

    // Update Kartu Ringkasan Laporan
    document.getElementById('sum-laporan-total').innerText = filtered.length;
    document.getElementById('sum-laporan-selesai').innerText = filtered.filter(l => l.status === 'Selesai').length + ' Selesai';

    // Pagination Laporan
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / laporanItemsPerPage);
    if (window.currentLaporanPage > totalPages && totalPages > 0) window.currentLaporanPage = totalPages;
    if (window.currentLaporanPage < 1) window.currentLaporanPage = 1;

    const startIndex = (window.currentLaporanPage - 1) * laporanItemsPerPage;
    const endIndex = Math.min(startIndex + laporanItemsPerPage, totalItems);
    const paginatedItems = filtered.slice(startIndex, endIndex);

    const paginationContainer = document.getElementById('laporan-pagination');
    if (totalItems > 0) {
        paginationContainer.style.display = 'flex';
        document.getElementById('laporan-page-info').innerText = `Menampilkan ${startIndex + 1}-${endIndex} dari ${totalItems}`;
    } else {
        paginationContainer.style.display = 'none';
    }

    renderLaporanList(paginatedItems);
}

function prevPageLaporan() {
    if (window.currentLaporanPage > 1) { window.currentLaporanPage--; filterLaporanList(); }
}

function nextPageLaporan() {
    window.currentLaporanPage++; filterLaporanList();
}

function switchSubTab(element, tabId) {
    document.querySelectorAll('.sub-tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.sub-nav-tab').forEach(el => el.classList.remove('active'));

    document.getElementById(tabId).classList.remove('hidden');
    element.classList.add('active');
}

function renderAgendaList(agendas) {
    const container = document.getElementById('agenda-list-container');
    if(agendas.length === 0) {
        container.innerHTML = '<div class="glass-card" style="padding: 32px; text-align: center;"><i data-lucide="calendar" style="width: 48px; height: 48px; margin: 0 auto 16px auto; color: var(--text-secondary-color);"></i><p>Belum ada agenda kegiatan.</p></div>';
        lucide.createIcons();
        return;
    }

    let html = '<div style="display: flex; flex-direction: column; gap: 16px;">';
    agendas.forEach(a => {
        const isSelesai = a.status === 'Selesai';
        const statusClass = isSelesai ? 'bg-emerald-light text-emerald' : (a.status === 'Dibatalkan' ? 'bg-red-light text-red' : 'bg-blue-light text-blue');
        const tgl = new Date(a.tanggal_kegiatan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

        let galleryHtml = '';
        if (isSelesai && a.gallery && a.gallery.length > 0) {
            galleryHtml += '<div class="agenda-gallery">';
            const galData = encodeURIComponent(JSON.stringify(a.gallery));
            a.gallery.forEach(img => {
                const isVideo = img.match(/\.(mp4|webm|ogg)$/i) != null;
                if (isVideo) {
                    galleryHtml += `<div class="gallery-item" style="position: relative; overflow: hidden; cursor: pointer; border-radius: 12px;" onclick="openGsapGallery(this)" data-gallery="${galData}">
                        <video src="${img}" style="width: 100%; height: 100%; object-fit: cover; pointer-events: none;" muted></video>
                        <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.3); pointer-events: none;"><i data-lucide="play-circle" style="color: white; width: 24px; height: 24px;"></i></div>
                    </div>`;
                } else {
                    galleryHtml += `<img src="${img}" class="gallery-item" data-gallery="${galData}" onclick="openGsapGallery(this)">`;
                }
            });
            galleryHtml += '</div>';
        }

        let lampiranHtml = '';
        if (a.lampiran && a.lampiran.length > 0) {
            lampiranHtml += '<div style="margin-top: 12px; display: flex; flex-wrap: wrap; gap: 8px;">';
            a.lampiran.forEach(doc => {
                lampiranHtml += `<a href="${doc.file_path}" target="_blank" class="document-item" style="padding: 6px 12px; background: var(--hover-bg); border-radius: 8px; display: inline-flex; align-items: center; gap: 6px; width: fit-content; text-decoration: none; border: 1px solid var(--border-color);"><i data-lucide="paperclip" style="width: 14px; height: 14px; color: var(--text-secondary-color);"></i><span style="font-size: 0.75rem; color: var(--text-color);">${doc.file_name}</span></a>`;
            });
            lampiranHtml += '</div>';
        }

        html += `
            <div class="agenda-card">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <h4 style="margin: 0; font-size: 1.1rem; color: var(--text-color);">${a.judul}</h4>
                        <p class="text-secondary" style="font-size: 0.8rem; margin-top: 4px;">${tgl}</p>
                    </div>
                    <span class="badge ${statusClass}">${a.status}</span>
                </div>
                <p class="text-secondary" style="font-size: 0.875rem; margin: 12px 0; white-space: pre-wrap;">${a.keterangan}</p>
                ${lampiranHtml}
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed var(--border-color); padding-top: 12px; margin-top: 8px;">
                    <span style="font-size: 0.8rem; color: var(--text-secondary-color);">Estimasi Biaya: <b class="text-color">Rp ${parseInt(a.biaya_estimasi).toLocaleString('id-ID')}</b></span>
                    <div class="warga-action-group">
                        <button onclick="editAgenda(${a.id})" class="button-secondary" style="border-radius: 50%; padding: 8px; color: var(--text-secondary-color); border-color: transparent; background: var(--hover-bg); box-shadow: none;" title="Edit"><i data-lucide="edit-2" style="width: 16px; height: 16px;"></i></button>
                        <button onclick="hapusAgenda(${a.id})" class="button-secondary" style="border-radius: 50%; padding: 8px; color: #ef4444; border-color: transparent; background: rgba(239, 68, 68, 0.1); box-shadow: none;" title="Hapus"><i data-lucide="trash-2" style="width: 16px; height: 16px;"></i></button>
                    </div>
                </div>
                ${galleryHtml}
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
    lucide.createIcons();
}

function renderLaporanList(laporans) {
    const container = document.getElementById('laporan-list-container');
    if(laporans.length === 0) {
        container.innerHTML = '<div class="glass-card" style="padding: 32px; text-align: center;"><i data-lucide="flag" style="width: 48px; height: 48px; margin: 0 auto 16px auto; color: var(--text-secondary-color);"></i><p>Belum ada laporan masalah.</p></div>';
        lucide.createIcons();
        return;
    }

    let html = '<div style="display: flex; flex-direction: column; gap: 16px;">';
    laporans.forEach(l => {
        let statusClass = 'bg-blue-light text-blue';
        if (l.status === 'Diproses') statusClass = 'bg-orange-light text-orange';
        else if (l.status === 'Selesai') statusClass = 'bg-emerald-light text-emerald';

        let lampiranHtml = '';
        if (l.lampiran && l.lampiran.length > 0) {
            lampiranHtml += '<div style="margin-top: 12px; display: flex; flex-wrap: wrap; gap: 8px;">';
            l.lampiran.forEach(doc => {
                const isImage = doc.file_name.match(/\.(jpeg|jpg|gif|png)$/i) != null;
                if (isImage) {
                    lampiranHtml += `<a href="${doc.file_path}" target="_blank" style="display: inline-block; border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden;"><img src="${doc.file_path}" style="height: 60px; width: 60px; object-fit: cover;"></a>`;
                } else {
                    lampiranHtml += `<a href="${doc.file_path}" target="_blank" class="document-item" style="padding: 6px 12px; background: var(--hover-bg); border-radius: 8px; display: inline-flex; align-items: center; gap: 6px; width: fit-content; text-decoration: none; border: 1px solid var(--border-color);"><i data-lucide="paperclip" style="width: 14px; height: 14px; color: var(--text-secondary-color);"></i><span style="font-size: 0.75rem; color: var(--text-color);">${doc.file_name}</span></a>`;
                }
            });
            lampiranHtml += '</div>';
        }
        
        let tglSelesaiHtml = '';
        if (l.status === 'Selesai' && l.tanggal_selesai) {
            tglSelesaiHtml = `<p class="text-emerald" style="font-size: 0.8rem; margin-top: 4px; font-weight: 600;"><i data-lucide="check-circle" style="width: 12px; height: 12px; display: inline;"></i> Selesai pada: ${new Date(l.tanggal_selesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>`;
        }

        html += `
            <div class="laporan-card">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <h4 style="margin: 0; font-size: 1.1rem; color: var(--text-color);">${l.judul_laporan}</h4>
                    <span class="badge ${statusClass}">${l.status}</span>
                </div>
                <p class="text-secondary" style="font-size: 0.8rem; margin-top: 4px;">Dilaporkan pada: ${new Date(l.tanggal_laporan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                ${tglSelesaiHtml}
                <p class="text-secondary" style="font-size: 0.875rem; margin: 12px 0; white-space: pre-wrap;">${l.keterangan}</p>
                ${lampiranHtml}
                <div style="display: flex; justify-content: flex-end; align-items: center; border-top: 1px dashed var(--border-color); padding-top: 12px; margin-top: 8px;">
                    <div class="warga-action-group">
                        <button onclick="editLaporan(${l.id})" class="button-secondary" style="border-radius: 50%; padding: 8px; color: var(--text-secondary-color); border-color: transparent; background: var(--hover-bg); box-shadow: none;" title="Edit"><i data-lucide="edit-2" style="width: 16px; height: 16px;"></i></button>
                        <button onclick="hapusLaporan(${l.id})" class="button-secondary" style="border-radius: 50%; padding: 8px; color: #ef4444; border-color: transparent; background: rgba(239, 68, 68, 0.1); box-shadow: none;" title="Hapus"><i data-lucide="trash-2" style="width: 16px; height: 16px;"></i></button>
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
    lucide.createIcons();
}

function openFormAgenda() {
    // Cek tab mana yang sedang aktif
    const isAgenda = document.getElementById('sub-tab-agenda').classList.contains('hidden') === false;
    if (isAgenda) {
        openFormAgendaDrawer();
    } else {
        openFormLaporanDrawer();
    }
}

// Fungsi pembantu format datetime-local
function formatDateTimeLocal(dtStr) {
    if(!dtStr) return '';
    let dt = dtStr.replace(' ', 'T');
    if(dt.length > 16) dt = dt.substring(0, 16);
    return dt;
}

// Drawer Agenda
function openFormAgendaDrawer() {
    document.getElementById('agenda_id').value = 0;
    document.getElementById('agenda_judul').value = '';
    document.getElementById('agenda_tanggal').value = '';
    document.getElementById('agenda_biaya').value = '';
    document.getElementById('agenda_keterangan').value = '';
    document.getElementById('agenda_status').value = 'Direncanakan';
    document.getElementById('agenda_gallery_files').value = '';
    document.getElementById('agenda_lampiran_files').value = '';
    document.getElementById('agenda_existing_gallery').innerHTML = '';
    document.getElementById('agenda_gallery_preview').innerHTML = '';
    document.getElementById('agenda_existing_lampiran').innerHTML = '';
    toggleAgendaGallery('Direncanakan');
    
    document.getElementById('drawer-agenda-title').innerText = 'Tambah Agenda';
    
    const drawer = document.getElementById('drawer-agenda');
    drawer.classList.remove('hidden');
    setTimeout(() => drawer.classList.add('drawer-active'), 50);
}

function closeFormAgendaDrawer() {
    const drawer = document.getElementById('drawer-agenda');
    drawer.classList.remove('drawer-active');
    setTimeout(() => drawer.classList.add('hidden'), 400);
}

function previewAgendaGallery(input) {
    const preview = document.getElementById('agenda_gallery_preview');
    preview.innerHTML = '';
    if(input.files) {
        Array.from(input.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const isVideo = file.type.startsWith('video/');
                const el = isVideo 
                    ? `<video src="${e.target.result}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;" muted></video>`
                    : `<img src="${e.target.result}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">`;
                preview.innerHTML += `<div style="position: relative; display: inline-block; animation: pageFadeIn 0.3s forwards;">${el}</div>`;
            }
            reader.readAsDataURL(file);
        });
    }
}

function toggleAgendaGallery(status) {
    const sec = document.getElementById('agenda_gallery_section');
    if (status === 'Selesai') sec.classList.remove('hidden');
    else sec.classList.add('hidden');
}

function editAgenda(id) {
    const a = window.currentAgendaData.find(x => x.id == id);
    if(!a) return;
    
    document.getElementById('agenda_id').value = a.id;
    document.getElementById('agenda_judul').value = a.judul;
    document.getElementById('agenda_tanggal').value = formatDateTimeLocal(a.tanggal_kegiatan);
    document.getElementById('agenda_biaya').value = a.biaya_estimasi;
    document.getElementById('agenda_keterangan').value = a.keterangan;
    document.getElementById('agenda_status').value = a.status;
    document.getElementById('agenda_gallery_files').value = '';
    document.getElementById('agenda_lampiran_files').value = '';
    document.getElementById('agenda_gallery_preview').innerHTML = '';
    
    let galHtml = '';
    if(a.gallery) {
        a.gallery.forEach(img => {
            const isVideo = img.match(/\.(mp4|webm|ogg)$/i) != null;
            const mediaEl = isVideo ? `<video src="${img}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;" muted></video>` : `<img src="${img}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">`;
            galHtml += `<div style="position: relative; display: inline-block;">
                ${mediaEl}
                <button type="button" onclick="hapusFotoAgenda(${a.id}, '${img}', this)" style="position: absolute; top: -5px; right: -5px; background: red; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; display:flex; align-items:center; justify-content:center; font-size:10px;"><i data-lucide="x" style="width: 12px; height: 12px;"></i></button>
            </div>`;
        });
    }
    document.getElementById('agenda_existing_gallery').innerHTML = galHtml;

    let lampHtml = '';
    if(a.lampiran) {
        a.lampiran.forEach(doc => {
            lampHtml += `<div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 12px; background: var(--hover-bg); border-radius: 8px; border: 1px solid var(--border-color);"><span style="font-size: 0.75rem; color: var(--text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 80%;">${doc.file_name}</span><button type="button" onclick="hapusLampiranAgenda(${a.id}, '${doc.file_path}', this)" style="color: #ef4444; border: none; background: transparent; cursor: pointer; padding: 4px;"><i data-lucide="trash-2" style="width: 14px; height: 14px;"></i></button></div>`;
        });
    }
    document.getElementById('agenda_existing_lampiran').innerHTML = lampHtml;

    lucide.createIcons();
    
    toggleAgendaGallery(a.status);
    document.getElementById('drawer-agenda-title').innerText = 'Edit Agenda';
    
    const drawer = document.getElementById('drawer-agenda');
    drawer.classList.remove('hidden');
    setTimeout(() => drawer.classList.add('drawer-active'), 50);
}

function simpanAgenda() {
    const btn = document.querySelector('#drawer-agenda .button-primary');
    const origText = btn.innerHTML;
    btn.innerHTML = '<i data-lucide="loader"></i> Menyimpan...';
    
    const fd = new FormData();
    fd.append('id', document.getElementById('agenda_id').value);
    fd.append('blok_id', window.currentBlokId);
    fd.append('judul', document.getElementById('agenda_judul').value);
    fd.append('tanggal_kegiatan', document.getElementById('agenda_tanggal').value.replace('T', ' ') + ':00');
    fd.append('biaya_estimasi', document.getElementById('agenda_biaya').value);
    fd.append('keterangan', document.getElementById('agenda_keterangan').value);
    fd.append('status', document.getElementById('agenda_status').value);
    
    const files = document.getElementById('agenda_gallery_files').files;
    for(let i=0; i<files.length; i++) {
        fd.append('gallery[]', files[i]);
    }

    const lampiranFiles = document.getElementById('agenda_lampiran_files').files;
    for(let i=0; i<lampiranFiles.length; i++) {
        fd.append('lampiran[]', lampiranFiles[i]);
    }
    
    fetch('api/simpan_agenda.php', { method: 'POST', body: fd })
    .then(r=>r.json())
    .then(res => {
        if(res.status === 'success') {
            closeFormAgendaDrawer();
            loadAgendaData();
        } else {
            alert('Gagal: ' + res.message);
        }
        btn.innerHTML = origText;
    }).catch(e => { alert('Error: ' + e.message); btn.innerHTML = origText; });
}

function hapusAgenda(id) {
    if(confirm('Hapus agenda ini?')) {
        const fd = new FormData(); fd.append('id', id);
        fetch('api/hapus_agenda.php', {method: 'POST', body: fd}).then(r=>r.json()).then(res=>{
            if(res.status === 'success') loadAgendaData();
        });
    }
}

function hapusFotoAgenda(agenda_id, file_path, btnEl) {
    if(confirm('Hapus foto ini?')) {
        btnEl.innerHTML = '...';
        const fd = new FormData(); fd.append('agenda_id', agenda_id); fd.append('file_path', file_path);
        fetch('api/hapus_foto_agenda.php', {method: 'POST', body: fd}).then(r=>r.json()).then(res=>{
            if(res.status === 'success') {
                btnEl.parentElement.remove();
                const a = window.currentAgendaData.find(x => x.id == agenda_id);
                if(a && a.gallery) {
                    a.gallery = a.gallery.filter(g => g !== file_path);
                }
                loadAgendaData();
            }
        });
    }
}

function hapusLampiranAgenda(agenda_id, file_path, btnEl) {
    if(confirm('Hapus lampiran ini?')) {
        btnEl.innerHTML = '...';
        const fd = new FormData(); fd.append('agenda_id', agenda_id); fd.append('file_path', file_path);
        fetch('api/hapus_lampiran_agenda.php', {method: 'POST', body: fd}).then(r=>r.json()).then(res=>{
            if(res.status === 'success') {
                btnEl.parentElement.remove();
                loadAgendaData();
            } else {
                alert("Gagal menghapus: " + res.message);
                btnEl.innerHTML = '<i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>';
                lucide.createIcons();
            }
        });
    }
}

function toggleLaporanSelesai(status) {
    const sec = document.getElementById('laporan_tanggal_selesai_section');
    if (status === 'Selesai') sec.classList.remove('hidden');
    else sec.classList.add('hidden');
}

// Drawer Laporan
function openFormLaporanDrawer() {
    document.getElementById('laporan_id').value = 0;
    document.getElementById('laporan_judul').value = '';
    document.getElementById('laporan_tanggal').value = getLocalDateString() + 'T' + new Date().toTimeString().slice(0,5);
    document.getElementById('laporan_keterangan').value = '';
    document.getElementById('laporan_status').value = 'Baru';
    document.getElementById('laporan_tanggal_selesai').value = '';
    document.getElementById('laporan_lampiran_files').value = '';
    document.getElementById('laporan_existing_lampiran').innerHTML = '';
    toggleLaporanSelesai('Baru');
    
    document.getElementById('drawer-laporan-title').innerText = 'Buat Laporan';
    
    const drawer = document.getElementById('drawer-laporan');
    drawer.classList.remove('hidden');
    setTimeout(() => drawer.classList.add('drawer-active'), 50);
}

function closeFormLaporanDrawer() {
    const drawer = document.getElementById('drawer-laporan');
    drawer.classList.remove('drawer-active');
    setTimeout(() => drawer.classList.add('hidden'), 400);
}

function editLaporan(id) {
    const l = window.currentLaporanData.find(x => x.id == id);
    if(!l) return;
    
    document.getElementById('laporan_id').value = l.id;
    document.getElementById('laporan_judul').value = l.judul_laporan;
    document.getElementById('laporan_tanggal').value = formatDateTimeLocal(l.tanggal_laporan);
    document.getElementById('laporan_keterangan').value = l.keterangan;
    document.getElementById('laporan_status').value = l.status;
    document.getElementById('laporan_tanggal_selesai').value = formatDateTimeLocal(l.tanggal_selesai);
    document.getElementById('laporan_lampiran_files').value = '';

    let lampHtml = '';
    if(l.lampiran) {
        l.lampiran.forEach(doc => {
            lampHtml += `<div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 12px; background: var(--hover-bg); border-radius: 8px; border: 1px solid var(--border-color);"><span style="font-size: 0.75rem; color: var(--text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 80%;">${doc.file_name}</span><button type="button" onclick="hapusLampiranLaporan(${l.id}, '${doc.file_path}', this)" style="color: #ef4444; border: none; background: transparent; cursor: pointer; padding: 4px;"><i data-lucide="trash-2" style="width: 14px; height: 14px;"></i></button></div>`;
        });
    }
    document.getElementById('laporan_existing_lampiran').innerHTML = lampHtml;
    lucide.createIcons();

    toggleLaporanSelesai(l.status);
    
    document.getElementById('drawer-laporan-title').innerText = 'Edit Laporan';
    
    const drawer = document.getElementById('drawer-laporan');
    drawer.classList.remove('hidden');
    setTimeout(() => drawer.classList.add('drawer-active'), 50);
}

function simpanLaporan() {
    const btn = document.querySelector('#drawer-laporan .button-primary');
    const origText = btn.innerHTML;
    btn.innerHTML = '<i data-lucide="loader"></i> Menyimpan...';
    
    const fd = new FormData();
    fd.append('id', document.getElementById('laporan_id').value);
    fd.append('blok_id', window.currentBlokId);
    fd.append('judul', document.getElementById('laporan_judul').value);
    fd.append('tanggal_laporan', document.getElementById('laporan_tanggal').value.replace('T', ' ') + ':00');
    fd.append('keterangan', document.getElementById('laporan_keterangan').value);
    fd.append('status', document.getElementById('laporan_status').value);
    if (document.getElementById('laporan_status').value === 'Selesai' && document.getElementById('laporan_tanggal_selesai').value) {
        fd.append('tanggal_selesai', document.getElementById('laporan_tanggal_selesai').value.replace('T', ' ') + ':00');
    }
    const lampiranFiles = document.getElementById('laporan_lampiran_files').files;
    for(let i=0; i<lampiranFiles.length; i++) {
        fd.append('lampiran[]', lampiranFiles[i]);
    }
    
    fetch('api/simpan_laporan.php', { method: 'POST', body: fd })
    .then(r=>r.json())
    .then(res => {
        if(res.status === 'success') {
            closeFormLaporanDrawer();
            loadLaporanData();
        } else {
            alert('Gagal: ' + res.message);
        }
        btn.innerHTML = origText;
    }).catch(e => { alert('Error: ' + e.message); btn.innerHTML = origText; });
}

function hapusLaporan(id) {
    if(confirm('Hapus laporan ini?')) {
        const fd = new FormData(); fd.append('id', id);
        fetch('api/hapus_laporan.php', {method: 'POST', body: fd}).then(r=>r.json()).then(res=>{
            if(res.status === 'success') loadLaporanData();
        });
    }
}

function hapusLampiranLaporan(laporan_id, file_path, btnEl) {
    if(confirm('Hapus lampiran ini?')) {
        btnEl.innerHTML = '...';
        const fd = new FormData(); fd.append('laporan_id', laporan_id); fd.append('file_path', file_path);
        fetch('api/hapus_lampiran_laporan.php', {method: 'POST', body: fd}).then(r=>r.json()).then(res=>{
            if(res.status === 'success') {
                btnEl.parentElement.remove();
                loadLaporanData();
            } else {
                alert("Gagal menghapus: " + res.message);
                btnEl.innerHTML = '<i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>';
                lucide.createIcons();
            }
        });
    }
}

// --- GSAP Infinity Gallery Logic ---
let galleryGsapContext;

function openGsapGallery(el) {
    // Pendaftaran Plugin GSAP
    gsap.registerPlugin(ScrollTrigger);
    
    document.getElementById('gsap-gallery-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    document.querySelector('.gsap-loader').style.opacity = 1;

    // Dapatkan array gambar yang diklik dan perbanyak agar efek loop 3D terasa panjang
    const originalImages = JSON.parse(decodeURIComponent(el.getAttribute('data-gallery')));
    let imageUrls = [];
    while (imageUrls.length < 12) { imageUrls = imageUrls.concat(originalImages); }

    const cardContainer = document.querySelector('.gsap-cards');
    cardContainer.innerHTML = ''; 
    const totalCards = imageUrls.length;

    for (let i = 0; i < totalCards; i++) {
        const li = document.createElement('li');
        li.className = 'gsap-card';
        const isVideo = imageUrls[i].match(/\.(mp4|webm|ogg)$/i) != null;
        if(isVideo) {
            li.style.backgroundColor = '#111';
            li.innerHTML = `<video src="${imageUrls[i]}" autoplay loop muted playsinline style="width:100%; height:100%; object-fit:cover; position:absolute; top:0; left:0; z-index:0;"></video><div class="gsap-card-content" style="z-index: 10;"><span class="gsap-card-num">VIDEO ${i + 1}</span><h3 class="gsap-card-title">Galeri Kegiatan</h3></div>`;
        } else {
            li.style.backgroundImage = `url(${imageUrls[i]})`;
            li.innerHTML = `<div class="gsap-card-content"><span class="gsap-card-num">FOTO ${i + 1}</span><h3 class="gsap-card-title">Galeri Kegiatan</h3></div>`;
        }
        cardContainer.appendChild(li);
    }

    const bgImages = [document.getElementById('gsap-bg1'), document.getElementById('gsap-bg2')];
    let currentBgIndex = 0;
    const isFirstVideo = imageUrls[0].match(/\.(mp4|webm|ogg)$/i) != null;
    
    bgImages[0].style.backgroundImage = isFirstVideo ? 'none' : `url(${imageUrls[0]})`;
    if(isFirstVideo) bgImages[0].style.backgroundColor = '#000';
    
    bgImages[0].classList.add('active');
    bgImages[1].classList.remove('active');

    // Bersihkan instansi GSAP sebelumnya jika modal pernah dibuka
    if (galleryGsapContext) galleryGsapContext.revert();

    galleryGsapContext = gsap.context(() => {
        const spacing = 0.1;
        const cards = gsap.utils.toArray(".gsap-cards li");
        const seamlessLoop = buildSeamlessLoop(cards, spacing);

        const scrub = gsap.to(seamlessLoop, { totalTime: 0, duration: 0.5, ease: "power1.out", paused: true });
        let iteration = 0; let activeCardIndex = 0;
        const scroller = document.querySelector('.gsap-scroll-container');
        scroller.scrollTop = 0; // Reset scroll palsu

        const trigger = ScrollTrigger.create({
            scroller: scroller,
            start: 0, end: "+=6000", scrub: 1,
            onUpdate(self) {
                if (self.progress === 1 && self.direction > 0 && !self.wrapping) {
                    iteration++; self.wrapping = true; self.scroll(self.start + 1);
                } else if (self.progress < 1e-5 && self.direction < 0 && !self.wrapping) {
                    iteration--;
                    if (iteration < 0) { iteration = 9; seamlessLoop.totalTime(seamlessLoop.totalTime() + seamlessLoop.duration() * 10); scrub.pause(); }
                    self.wrapping = true; self.scroll(self.end - 1);
                } else {
                    const scrubTime = (iteration + self.progress) * seamlessLoop.duration();
                    const snappedTime = gsap.utils.snap(spacing, scrubTime);
                    scrub.vars.totalTime = snappedTime; scrub.invalidate().restart();
                    self.wrapping = false;
                    
                    // Update Active Card & Background
                    const totalDuration = seamlessLoop.duration();
                    let index = Math.round(((scrubTime % totalDuration) / totalDuration) * totalCards) % totalCards;
                    if (index < 0) index = totalCards + index;
                    if (index !== activeCardIndex) {
                        activeCardIndex = index;
                        cards.forEach((c, i) => { if (i === index) c.classList.add('active'); else c.classList.remove('active'); });
                        const nextBgIndex = (currentBgIndex + 1) % 2;
                        const nextBg = bgImages[nextBgIndex]; const currentBg = bgImages[currentBgIndex];
                        
                        const isVid = imageUrls[index].match(/\.(mp4|webm|ogg)$/i) != null;
                        if (isVid) {
                            nextBg.style.backgroundImage = 'none'; nextBg.style.backgroundColor = '#000';
                            nextBg.classList.add('active'); currentBg.classList.remove('active'); currentBgIndex = nextBgIndex;
                        } else {
                            const img = new Image(); img.src = imageUrls[index];
                            img.onload = () => { nextBg.style.backgroundImage = `url(${imageUrls[index]})`; nextBg.classList.add('active'); currentBg.classList.remove('active'); currentBgIndex = nextBgIndex; }
                        }
                    }
                }
            }
        });

        function scrubTo(totalTime) {
            let progress = (totalTime - seamlessLoop.duration() * iteration) / seamlessLoop.duration();
            if (progress > 1) { iteration++; trigger.wrapping = true; trigger.scroll(trigger.start + 1); } 
            else if (progress < 0) { iteration--; if (iteration < 0) { iteration = 9; seamlessLoop.totalTime(seamlessLoop.totalTime() + seamlessLoop.duration() * 10); scrub.pause(); } trigger.wrapping = true; trigger.scroll(trigger.end - 1); } 
            else { trigger.scroll(trigger.start + progress * (trigger.end - trigger.start)); }
        }

        document.querySelector(".gsap-next").addEventListener("click", () => scrubTo(scrub.vars.totalTime + spacing));
        document.querySelector(".gsap-prev").addEventListener("click", () => scrubTo(scrub.vars.totalTime - spacing));

        let touchStartX = 0; let touchEndX = 0;
        scroller.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
        scroller.addEventListener('touchend', e => { touchEndX = e.changedTouches[0].screenX; const limit = 50; if (touchStartX - touchEndX > limit) scrubTo(scrub.vars.totalTime + spacing); if (touchEndX - touchStartX > limit) scrubTo(scrub.vars.totalTime - spacing); }, { passive: true });

        cards[0].classList.add('active');

        function buildSeamlessLoop(items, spacing) {
            let overlap = Math.ceil(1 / spacing), startTime = items.length * spacing + 0.5, loopTime = (items.length + overlap) * spacing + 1,
                rawSequence = gsap.timeline({ paused: true }), seamlessLoop = gsap.timeline({ paused: true, repeat: -1, onRepeat() { this._time === this._dur && (this._tTime += this._dur - 0.01); } }),
                l = items.length + overlap * 2, time = 0, i, index, item;
            gsap.set(items, { xPercent: 400, autoAlpha: 0, scale: 0 });
            const blurVal = window.innerWidth < 768 ? "0px" : "4px";
            for (i = 0; i < l; i++) {
                index = i % items.length; item = items[index]; time = i * spacing;
                rawSequence.fromTo(item, { scale: 0.5, autoAlpha: 0.3, zIndex: 1, filter: `blur(${blurVal})` }, { scale: 1.5, autoAlpha: 1, zIndex: 100, filter: "blur(0px)", duration: 0.5, yoyo: true, repeat: 1, ease: "sine.inOut", immediateRender: false }, time)
                           .fromTo(item, { xPercent: 450 }, { xPercent: -450, duration: 1, ease: "none", immediateRender: false }, time);
                i <= items.length && seamlessLoop.add("label" + i, time);
            }
            rawSequence.time(startTime);
            seamlessLoop.to(rawSequence, { time: loopTime, duration: loopTime - startTime, ease: "none" }).fromTo(rawSequence, { time: overlap * spacing + 1 }, { time: startTime, duration: startTime - (overlap * spacing + 1), immediateRender: false, ease: "none" });
            return seamlessLoop;
        }
    }); // Akhir Context

    setTimeout(() => { document.querySelector('.gsap-loader').style.opacity = 0; }, 500);
}

function closeGsapGallery() {
    document.getElementById('gsap-gallery-modal').classList.add('hidden');
    document.body.style.overflow = '';
    if (galleryGsapContext) galleryGsapContext.revert();
}