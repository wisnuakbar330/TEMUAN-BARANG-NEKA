// --- DATABASE LOKAL / INITIAL DATA DUMMY ---
const INITIAL_DATA = [
    {
        id: "RPT-1001",
        type: "Hilang",
        reporterName: "Budi Santoso",
        reporterClass: "Siswa Kelas 10",
        itemName: "Botol Tupperware Biru",
        category: "Botol/Tempat Makan",
        location: "Kantin Sekolah",
        description: "Botol minum Tupperware warna biru tua kapasitas 750ml. Ada stiker logo anime Naruto di bagian samping bawah.",
        tags: ["tupperware", "biru", "750ml", "stiker", "naruto", "kantin"],
        image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&auto=format&fit=crop&q=60",
        date: "2026-03-28 09:30",
        status: "Aktif"
    },
    {
        id: "RPT-1002",
        type: "Temuan",
        reporterName: "Siti Rahma",
        reporterClass: "Siswa Kelas 11",
        itemName: "Botol Minum Biru Ada Stiker",
        category: "Botol/Tempat Makan",
        location: "Kantin Sekolah",
        description: "Ditemukan botol minum plastik warna biru merk Tupperware dekat meja kantin ibu Lis. Tertempel stiker kartun.",
        tags: ["botol", "biru", "tupperware", "kantin", "stiker"],
        image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&auto=format&fit=crop&q=60",
        date: "2026-03-28 10:15",
        status: "Aktif"
    },
    {
        id: "RPT-1003",
        type: "Hilang",
        reporterName: "Ahmad Rizky",
        reporterClass: "Siswa Kelas 12",
        itemName: "Kunci Motor Honda + Gantungan Leather",
        category: "Kunci",
        location: "Lapangan Olahraga",
        description: "Kunci motor Honda dengan dompet stnk kecil warna cokelat kulit. Hilang saat jam olahraga kelas 12.",
        tags: ["kunci", "motor", "honda", "dompet", "stnk", "kulit", "cokelat"],
        image: "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=400&auto=format&fit=crop&q=60",
        date: "2026-03-27 14:00",
        status: "Aktif"
    },
    {
        id: "RPT-1004",
        type: "Temuan",
        reporterName: "Pak Supri (Satpam)",
        reporterClass: "Guru BK",
        itemName: "Kartu Pelajar SMA a.n. Dimas",
        category: "Dokumen/Kartu",
        location: "Perpustakaan",
        description: "Ditemukan Kartu Tanda Pelajar atas nama Dimas Nugraha kelas X-3 di meja baca perpustakaan.",
        tags: ["kartu", "pelajar", "dimas", "perpustakaan", "x-3"],
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=60",
        date: "2026-03-26 11:20",
        status: "Selesai"
    }
];

let reportsData = [];
let currentTab = 'lapor';
let activeImageBase64 = null;

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('findit_reports');
    if (saved) {
        try {
            reportsData = JSON.parse(saved);
        } catch (e) {
            reportsData = [...INITIAL_DATA];
        }
    } else {
        reportsData = [...INITIAL_DATA];
        saveToLocalStorage();
    }

    updateClassInputByRole();
    renderData();
    calculateAIMatches();
    updateStatistics();
});

function saveToLocalStorage() {
    localStorage.setItem('findit_reports', JSON.stringify(reportsData));
}

// --- USER ROLE MANAGEMENT ---
function changeRole() {
    const role = document.getElementById('userRole').value;
    const bkBanner = document.getElementById('bkBanner');

    if (role === "Guru BK") {
        bkBanner.classList.remove('hidden');
    } else {
        bkBanner.classList.add('hidden');
    }

    updateClassInputByRole();
    renderData();
    calculateAIMatches();
}

function updateClassInputByRole() {
    const role = document.getElementById('userRole').value;
    const classInput = document.getElementById('reporterClass');
    if (classInput) classInput.value = role;
}

// --- TAB SWITCHING ---
function switchTab(tab) {
    currentTab = tab;
    
    const btnLapor = document.getElementById('tabLapor');
    const btnMatch = document.getElementById('tabMatch');
    const btnStat = document.getElementById('tabStat');

    btnLapor.className = "flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 text-slate-600 hover:bg-slate-100";
    btnMatch.className = "flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 text-slate-600 hover:bg-slate-100 relative";
    btnStat.className = "flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 text-slate-600 hover:bg-slate-100";

    if (tab === 'lapor') {
        btnLapor.className = "flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 bg-indigo-600 text-white shadow-sm";
        document.getElementById('tabContentLapor').classList.remove('hidden');
        document.getElementById('tabContentPencocokan').classList.add('hidden');
        document.getElementById('tabContentStatistik').classList.add('hidden');
    } else if (tab === 'pencocokan') {
        btnMatch.className = "flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 bg-indigo-600 text-white shadow-sm relative";
        document.getElementById('tabContentLapor').classList.add('hidden');
        document.getElementById('tabContentPencocokan').classList.remove('hidden');
        document.getElementById('tabContentStatistik').classList.add('hidden');
        calculateAIMatches();
    } else if (tab === 'statistik') {
        btnStat.className = "flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 bg-indigo-600 text-white shadow-sm";
        document.getElementById('tabContentLapor').classList.add('hidden');
        document.getElementById('tabContentPencocokan').classList.add('hidden');
        document.getElementById('tabContentStatistik').classList.remove('hidden');
        updateStatistics();
    }
}

// --- AI AUTO TAGGING ENGINE ---
function generateAutoTags() {
    const textInput = document.getElementById('itemDesc');
    const tagContainer = document.getElementById('tagContainer');
    if (!textInput || !tagContainer) return;

    const text = textInput.value.toLowerCase();
    const stopWords = ["yang", "di", "ke", "dari", "pada", "dalam", "dengan", "dan", "atau", "ini", "itu", "ada", "saya", "punya", "warna", "hilang", "ditemukan", "adalah"];
    
    const words = text.replace(/[^\w\s]/gi, '').split(/\s+/);
    const filteredTags = words.filter(word => word.length > 2 && !stopWords.includes(word));
    const uniqueTags = [...new Set(filteredTags)].slice(0, 8);

    if (uniqueTags.length === 0) {
        tagContainer.innerHTML = `<span class="text-[10px] text-slate-400 italic px-1">Ketik deskripsi untuk generate tag otomatis...</span>`;
        return;
    }

    tagContainer.innerHTML = uniqueTags.map(tag => `
        <span class="bg-indigo-100 text-indigo-700 font-medium text-[10px] px-2 py-0.5 rounded-md animate-fade-in flex items-center gap-1">
            #${tag}
        </span>
    `).join('');
}

// --- PREVIEW IMAGE FILE ---
function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            activeImageBase64 = e.target.result;
            const previewImg = document.getElementById('imagePreview');
            const previewContainer = document.getElementById('imagePreviewContainer');
            if (previewImg && previewContainer) {
                previewImg.src = e.target.result;
                previewContainer.classList.remove('hidden');
            }
        }
        reader.readAsDataURL(file);
    }
}

// --- SUBMIT FORM LAPORAN ---
function submitReport(event) {
    event.preventDefault();

    const reportTypeElement = document.querySelector('input[name="reportType"]:checked');
    const reporterNameElement = document.getElementById('reporterName');
    const reporterClassElement = document.getElementById('reporterClass');
    const itemNameElement = document.getElementById('itemName');
    const categoryElement = document.getElementById('itemCategory');
    const locationElement = document.getElementById('itemLocation');
    const descriptionElement = document.getElementById('itemDesc');

    if (!reportTypeElement || !reporterNameElement || !itemNameElement || !descriptionElement) return;

    const reportType = reportTypeElement.value;
    const reporterName = reporterNameElement.value;
    const reporterClass = reporterClassElement ? reporterClassElement.value : "Siswa Kelas 10";
    const itemName = itemNameElement.value;
    const category = categoryElement ? categoryElement.value : "Lainnya";
    const location = locationElement ? locationElement.value : "Lainnya";
    const description = descriptionElement.value;

    const stopWords = ["yang", "di", "ke", "dari", "pada", "dalam", "dengan", "dan", "atau", "ini", "itu", "ada", "saya", "punya"];
    const words = (itemName + " " + description).toLowerCase().replace(/[^\w\s]/gi, '').split(/\s+/);
    const tags = [...new Set(words.filter(w => w.length > 2 && !stopWords.includes(w)))];

    const defaultImg = reportType === 'Hilang' 
        ? "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=400&auto=format&fit=crop&q=60"
        : "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=400&auto=format&fit=crop&q=60";

    const newReport = {
        id: "RPT-" + Math.floor(1000 + Math.random() * 9000),
        type: reportType,
        reporterName,
        reporterClass,
        itemName,
        category,
        location,
        description,
        tags,
        image: activeImageBase64 || defaultImg,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: "Aktif"
    };

    reportsData.unshift(newReport);
    saveToLocalStorage();

    const form = document.getElementById('reportForm');
    if (form) form.reset();
    const previewContainer = document.getElementById('imagePreviewContainer');
    if (previewContainer) previewContainer.classList.add('hidden');
    activeImageBase64 = null;
    generateAutoTags();

    renderData();
    calculateAIMatches();
    updateStatistics();

    alert("Berhasil! Laporan Anda telah diterbitkan dan diproses oleh sistem AI.");
}

// --- RENDER CARDS LAPORAN ---
function renderData() {
    const container = document.getElementById('itemsContainer');
    const searchInput = document.getElementById('searchInput');
    const filterTypeElement = document.getElementById('filterType');
    const filterCategoryElement = document.getElementById('filterCategory');

    if (!container) return;

    const search = searchInput ? searchInput.value.toLowerCase() : "";
    const filterType = filterTypeElement ? filterTypeElement.value : "Semua";
    const filterCategory = filterCategoryElement ? filterCategoryElement.value : "Semua";

    const filtered = reportsData.filter(item => {
        const tags = item.tags || [];
        const matchesSearch = item.itemName.toLowerCase().includes(search) || 
                              item.description.toLowerCase().includes(search) || 
                              item.location.toLowerCase().includes(search) ||
                              tags.some(t => t.toLowerCase().includes(search));
        
        let matchesType = true;
        if (filterType === 'Selesai') {
            matchesType = (item.status === 'Selesai');
        } else if (filterType !== 'Semua') {
            matchesType = (item.type === filterType && item.status === 'Aktif');
        }

        const matchesCat = filterCategory === 'Semua' ? true : item.category === filterCategory;

        return matchesSearch && matchesType && matchesCat;
    });

    const badge = document.getElementById('totalItemsBadge');
    if (badge) badge.innerText = `${filtered.length} Barang`;

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                <i class="fa-solid fa-box-open text-4xl text-slate-300 mb-2"></i>
                <p class="text-xs font-semibold text-slate-500">Tidak ada laporan barang yang ditemukan.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(item => {
        const itemTags = item.tags || [];
        return `
            <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between animate-fade-in">
                <div>
                    <div class="relative h-40 bg-slate-100 overflow-hidden">
                        <img src="${item.image}" alt="${item.itemName}" class="w-full h-full object-cover">
                        <div class="absolute top-3 left-3 flex gap-1.5">
                            <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white ${item.type === 'Hilang' ? 'bg-rose-500' : 'bg-emerald-500'} shadow-md">
                                ${item.type}
                            </span>
                            ${item.status === 'Selesai' ? '<span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-white shadow-md"><i class="fa-solid fa-check"></i> Selesai</span>' : ''}
                        </div>
                        <span class="absolute bottom-2 right-2 bg-slate-900/70 text-white text-[10px] px-2 py-0.5 rounded-md backdrop-blur-sm">
                            <i class="fa-solid fa-location-dot mr-1"></i>${item.location}
                        </span>
                    </div>

                    <div class="p-4 space-y-2">
                        <div class="flex justify-between items-start">
                            <h4 class="font-bold text-sm text-slate-800 line-clamp-1">${item.itemName}</h4>
                        </div>
                        <p class="text-xs text-slate-600 line-clamp-2 leading-relaxed">${item.description}</p>
                        <div class="flex flex-wrap gap-1 pt-1">
                            ${itemTags.slice(0, 4).map(t => `<span class="bg-slate-100 text-slate-600 text-[9px] px-1.5 py-0.5 rounded font-medium">#${t}</span>`).join('')}
                        </div>
                    </div>
                </div>

                <div class="p-4 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <div class="mt-2">
                        <p class="font-semibold text-slate-700">${item.reporterName} (${item.reporterClass})</p>
                        <p class="text-[10px] text-slate-400">${item.date}</p>
                    </div>
                    <button onclick="openDetailModal('${item.id}')" class="mt-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3 py-1.5 rounded-xl transition text-xs">
                        Detail <i class="fa-solid fa-chevron-right text-[10px] ml-0.5"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// --- AI MATCHING ALGORITHM ENGINE ---
function calculateAIMatches() {
    const activeLost = reportsData.filter(i => i.type === 'Hilang' && i.status === 'Aktif');
    const activeFound = reportsData.filter(i => i.type === 'Temuan' && i.status === 'Aktif');

    const matches = [];

    activeLost.forEach(lost => {
        activeFound.forEach(found => {
            let score = 0;
            const lostTags = lost.tags || [];
            const foundTags = found.tags || [];

            if (lost.category === found.category) score += 35;
            if (lost.location === found.location) score += 25;

            const sharedTags = lostTags.filter(tag => foundTags.includes(tag));
            const minLen = Math.min(lostTags.length, foundTags.length);
            
            if (minLen > 0) {
                const tagRatio = sharedTags.length / minLen;
                score += Math.round(tagRatio * 40);
            }

            score = Math.min(score, 98);

            if (score >= 40) {
                matches.push({
                    lost,
                    found,
                    score,
                    sharedTags
                });
            }
        });
    });

    matches.sort((a, b) => b.score - a.score);

    const matchBadge = document.getElementById('matchBadge');
    if (matchBadge) {
        matchBadge.innerText = matches.length;
        if (matches.length > 0) {
            matchBadge.classList.remove('hidden');
        } else {
            matchBadge.classList.add('hidden');
        }
    }

    renderAIMatches(matches);
}

function renderAIMatches(matches) {
    const container = document.getElementById('aiMatchContainer');
    if (!container) return;

    if (matches.length === 0) {
        container.innerHTML = `
            <div class="py-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                <i class="fa-solid fa-wand-magic-sparkles text-4xl text-indigo-300 mb-2"></i>
                <p class="text-xs font-semibold text-slate-600">Belum ada potensi kecocokan yang terdeteksi oleh AI.</p>
                <p class="text-[11px] text-slate-400 mt-1">Sistem akan otomatis mencocokkan jika ada barang hilang & temuan yang mirip.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = matches.map(m => `
        <div class="bg-white rounded-2xl border border-indigo-100 shadow-sm p-4 relative overflow-hidden animate-fade-in space-y-3">
            <div class="flex items-center justify-between border-b border-slate-100 pb-2">
                <div class="flex items-center gap-2">
                    <span class="text-xs font-bold px-2.5 py-1 rounded-lg ${m.score >= 75 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'} flex items-center gap-1">
                        <i class="fa-solid fa-bolt"></i> Match Score: ${m.score}%
                    </span>
                    <span class="text-[11px] text-slate-400">Algoritma Kecocokan AI</span>
                </div>
                <span class="text-[11px] text-slate-500 font-semibold">Kategori: ${m.lost.category}</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="bg-rose-50/50 p-3 rounded-xl border border-rose-100">
                    <span class="text-[10px] font-bold text-rose-600 uppercase">Barang Hilang</span>
                    <h5 class="font-bold text-xs text-slate-800 mt-0.5">${m.lost.itemName}</h5>
                    <p class="text-[11px] text-slate-600 mt-1 line-clamp-2">${m.lost.description}</p>
                    <p class="text-[10px] text-slate-400 mt-2"><i class="fa-solid fa-user mr-1"></i>${m.lost.reporterName} (${m.lost.reporterClass})</p>
                </div>

                <div class="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                    <span class="text-[10px] font-bold text-emerald-600 uppercase">Barang Temuan</span>
                    <h5 class="font-bold text-xs text-slate-800 mt-0.5">${m.found.itemName}</h5>
                    <p class="text-[11px] text-slate-600 mt-1 line-clamp-2">${m.found.description}</p>
                    <p class="text-[10px] text-slate-400 mt-2"><i class="fa-solid fa-user mr-1"></i>${m.found.reporterName} (${m.found.reporterClass})</p>
                </div>
            </div>

            <div class="flex items-center justify-between pt-1">
                <div class="flex items-center gap-1 flex-wrap">
                    <span class="text-[10px] font-bold text-slate-400">Kata Kunci Cocok:</span>
                    ${m.sharedTags.map(t => `<span class="bg-indigo-50 text-indigo-600 text-[10px] font-medium px-1.5 py-0.5 rounded">#${t}</span>`).join('')}
                </div>
                <button onclick="openClaimProcess('${m.lost.id}', '${m.found.id}')" class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition shadow-sm flex items-center gap-1">
                    <i class="fa-solid fa-handshake"></i> Hubungkan Laporan
                </button>
            </div>
        </div>
    `).join('');
}

// --- MODAL SYSTEM & CLAIM PROCESS ---
function openDetailModal(id) {
    const item = reportsData.find(r => r.id === id);
    if (!item) return;

    const modal = document.getElementById('detailModal');
    const content = document.getElementById('modalContent');
    const currentRoleElement = document.getElementById('userRole');
    const currentRole = currentRoleElement ? currentRoleElement.value : "Siswa Kelas 10";

    if (!modal || !content) return;

    content.innerHTML = `
        <div class="space-y-4">
            <div class="relative h-48 bg-slate-100 rounded-xl overflow-hidden">
                <img src="${item.image}" class="w-full h-full object-cover">
                <span class="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase text-white ${item.type === 'Hilang' ? 'bg-rose-500' : 'bg-emerald-500'}">
                    ${item.type}
                </span>
            </div>

            <div>
                <div class="flex justify-between items-start">
                    <h3 class="text-base font-extrabold text-slate-800">${item.itemName}</h3>
                    <span class="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-semibold">${item.status}</span>
                </div>
                <p class="text-xs text-indigo-600 font-medium mt-0.5"><i class="fa-solid fa-location-dot mr-1"></i>${item.location} • Kategori: ${item.category}</p>
            </div>

            <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <p class="text-xs font-semibold text-slate-700 mb-1">Deskripsi & Ciri-Ciri:</p>
                <p class="text-xs text-slate-600 leading-relaxed">${item.description}</p>
            </div>

            <div class="grid grid-cols-2 gap-2 text-xs bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                <div>
                    <span class="text-slate-400 block text-[10px]">Pelapor:</span>
                    <span class="font-bold text-slate-700">${item.reporterName}</span>
                </div>
                <div>
                    <span class="text-slate-400 block text-[10px]">Akses Kelas/Role:</span>
                    <span class="font-bold text-slate-700">${item.reporterClass}</span>
                </div>
                <div>
                    <span class="text-slate-400 block text-[10px]">Waktu Lapor:</span>
                    <span class="font-medium text-slate-600">${item.date}</span>
                </div>
                <div>
                    <span class="text-slate-400 block text-[10px]">ID Laporan:</span>
                    <span class="font-mono text-slate-600">${item.id}</span>
                </div>
            </div>

            <div class="pt-2 flex gap-2">
                ${item.status === 'Aktif' ? `
                    <button onclick="markAsResolved('${item.id}')" class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5">
                        <i class="fa-solid fa-check-circle"></i> Tandai Selesai / Terklaim
                    </button>
                ` : ''}
                ${currentRole === 'Guru BK' ? `
                    <button onclick="deleteReport('${item.id}')" class="bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold px-3 py-2 rounded-xl text-xs transition">
                        <i class="fa-solid fa-trash"></i> Hapus
                    </button>
                ` : ''}
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
}

function closeModal() {
    const modal = document.getElementById('detailModal');
    if (modal) modal.classList.add('hidden');
}

function markAsResolved(id) {
    const item = reportsData.find(r => r.id === id);
    if (item) {
        item.status = 'Selesai';
        saveToLocalStorage();
        closeModal();
        renderData();
        calculateAIMatches();
        updateStatistics();
        alert(`Laporan ${id} telah ditandai Selesai. Terima kasih!`);
    }
}

function deleteReport(id) {
    if (confirm("Apakah Anda yakin ingin menghapus laporan ini? (Aksi Guru BK)")) {
        reportsData = reportsData.filter(r => r.id !== id);
        saveToLocalStorage();
        closeModal();
        renderData();
        calculateAIMatches();
        updateStatistics();
    }
}

function openClaimProcess(lostId, foundId) {
    alert(`[Klaim Diproses]\nSistem AI telah mencatat hubungan antara Laporan ${lostId} dan ${foundId}.\n\nSilakan datangi Ruang BK dengan menunjukkan Kartu Pelajar untuk verifikasi fisik barang.`);
}

// --- STATISTICS & MANAGER DATA ---
function updateStatistics() {
    const total = reportsData.length;
    const hilang = reportsData.filter(r => r.type === 'Hilang' && r.status === 'Aktif').length;
    const temuan = reportsData.filter(r => r.type === 'Temuan' && r.status === 'Aktif').length;
    const selesai = reportsData.filter(r => r.status === 'Selesai').length;

    const elTotal = document.getElementById('statTotal');
    const elHilang = document.getElementById('statHilang');
    const elTemuan = document.getElementById('statTemuan');
    const elSelesai = document.getElementById('statSelesai');

    if (elTotal) elTotal.innerText = total;
    if (elHilang) elHilang.innerText = hilang;
    if (elTemuan) elTemuan.innerText = temuan;
    if (elSelesai) elSelesai.innerText = selesai;
}

function exportData() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportsData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Laporan_Barang_Hilang_BK_${new Date().toISOString().substring(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

function resetData() {
    if (confirm("Apakah Anda yakin ingin mereset data ke setelan awal contoh?")) {
        reportsData = [...INITIAL_DATA];
        saveToLocalStorage();
        renderData();
        calculateAIMatches();
        updateStatistics();
        alert("Data telah di-reset ke data bawaan.");
    }
}

// --- FLOATING AI CHATBOT SYSTEM ---
function toggleChatbot() {
    const chatWindow = document.getElementById('chatWindow');
    if (chatWindow) chatWindow.classList.toggle('hidden');
}

function sendChatMessage(event) {
    event.preventDefault();
    const input = document.getElementById('chatInput');
    if (!input) return;

    const query = input.value.trim();
    if (!query) return;

    const chatLogs = document.getElementById('chatLogs');
    if (!chatLogs) return;

    chatLogs.innerHTML += `
        <div class="flex gap-2 items-start justify-end">
            <div class="bg-indigo-600 text-white p-2.5 rounded-2xl rounded-tr-none max-w-[80%] shadow-sm">
                ${query}
            </div>
        </div>
    `;

    input.value = '';
    chatLogs.scrollTop = chatLogs.scrollHeight;

    setTimeout(() => {
        let reply = generateAIReply(query);
        chatLogs.innerHTML += `
            <div class="flex gap-2 items-start animate-fade-in">
                <div class="bg-indigo-600 text-white p-1.5 rounded-full text-[10px]">
                    <i class="fa-solid fa-robot"></i>
                </div>
                <div class="bg-white p-2.5 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm text-slate-700 max-w-[80%]">
                    ${reply}
                </div>
            </div>
        `;
        chatLogs.scrollTop = chatLogs.scrollHeight;
    }, 600);
}

function generateAIReply(text) {
    const q = text.toLowerCase();

    if (q.includes('bk') || q.includes('ruang bk') || q.includes('lokasi')) {
        return "Ruang Bimbingan Konseling (BK) berada di Gedung Utama Lt. 1, tepat di sebelah Laboratorium Komputer. Pengambilan barang temuan dilayani pada jam istirahat sekolah.";
    } else if (q.includes('syarat') || q.includes('klaim') || q.includes('ambil')) {
        return "Untuk mengklaim barang temuan, silakan bawa **Kartu Pelajar** aktif dan tunjukkan nomor ID Laporan atau bukti kepemilikan khusus (misal: membuka kunci pola HP / ciri stiker khusus).";
    } else if (q.includes('sore') || q.includes('jam') || q.includes('buka')) {
        return "Layanan verifikasi barang hilang oleh Guru BK buka setiap hari Senin - Jumat pukul 07.30 - 15.30 WIB.";
    } else if (q.includes('tupperware') || q.includes('kunci') || q.includes('kartu')) {
        return "Silakan periksa tab **AI Match** atau gunakan kolom pencarian di bagian atas untuk mencocokkan kata kunci barang Anda secara otomatis!";
    } else {
        return "Saya mengerti pertanyaan Anda! Untuk bantuan lebih lanjut, Anda dapat membuat laporan pada menu **Buat Laporan** atau langsung berkonsultasi dengan Guru BK di sekolah.";
    }
}
