// Menginisialisasi Vue instance untuk halaman Stok Bahan Ajar
new Vue({
    el: "#app",
    data: {
        // --- 1. Data Dummy dari dataBahanAjar (1).js ---
        upbjjList: ["Jakarta", "Surabaya", "Makassar", "Padang", "Denpasar"],
        kategoriList: ["MK Wajib", "MK Pilihan", "Praktikum", "Problem-Based"],
        stok: [
            {
                kode: "EKMA4116",
                judul: "Pengantar Manajemen",
                kategori: "MK Wajib",
                upbjj: "Jakarta",
                lokasiRak: "R1-A3",
                harga: 65000,
                qty: 28,
                safety: 20,
                catatanHTML: "<em>Edisi 2024, cetak ulang</em>",
            },
            {
                kode: "EKMA4115",
                judul: "Pengantar Akuntansi",
                kategori: "MK Wajib",
                upbjj: "Jakarta",
                lokasiRak: "R1-A4",
                harga: 60000,
                qty: 7,
                safety: 15,
                catatanHTML: "<strong>Cover baru</strong>",
            },
            {
                kode: "BIOL4201",
                judul: "Biologi Umum (Praktikum)",
                kategori: "Praktikum",
                upbjj: "Surabaya",
                lokasiRak: "R3-B2",
                harga: 80000,
                qty: 12,
                safety: 10,
                catatanHTML: "Butuh <u>pendingin</u> untuk kit basah",
            },
            {
                kode: "FISIP4001",
                judul: "Dasar-Dasar Sosiologi",
                kategori: "MK Pilihan",
                upbjj: "Makassar",
                lokasiRak: "R2-C1",
                harga: 55000,
                qty: 2,
                safety: 8,
                catatanHTML: "Stok <i>menipis</i>, prioritaskan reorder",
            },
        ],

        // --- 2. State untuk Filter & Sorting ---
        filterUpbjj: "",
        filterKategori: "",
        hanyaReorder: false,
        sortBy: "",

        // --- 3. State untuk Form Tambah (Data Binding) ---
        form: {
            kode: "",
            judul: "",
            kategori: "",
            upbjj: "",
            lokasiRak: "",
            qty: "",
            safety: "",
            harga: "",
            catatanHTML: "",
        },
        pesanError: "",

        // --- 4. State untuk Edit Baris ---
        editKode: null,
        editForm: {},
    },

    computed: {
        // Computed property memproses filter tanpa recompute ulang data asal
        filteredStok() {
            let result = this.stok;

            // Filter berdasarkan UT-Daerah
            if (this.filterUpbjj !== "") {
                result = result.filter(
                    (item) => item.upbjj === this.filterUpbjj,
                );
            }

            // Filter Kategori (Dependent Filter: hanya aktif jika filterUpbjj terisi)
            if (this.filterUpbjj !== "" && this.filterKategori !== "") {
                result = result.filter(
                    (item) => item.kategori === this.filterKategori,
                );
            }

            // Filter untuk Re-Order: qty < safety ATAU qty == 0
            if (this.hanyaReorder) {
                result = result.filter(
                    (item) => item.qty < item.safety || item.qty === 0,
                );
            }

            // Mengurutkan (Sorting)
            if (this.sortBy === "judul") {
                result = result
                    .slice()
                    .sort((a, b) => a.judul.localeCompare(b.judul));
            } else if (this.sortBy === "qty") {
                result = result.slice().sort((a, b) => a.qty - b.qty);
            } else if (this.sortBy === "harga") {
                result = result.slice().sort((a, b) => a.harga - b.harga);
            }

            return result;
        },
    },

    watch: {
        // WATCHER 1: Mengosongkan filter kategori ketika UT-Daerah diubah/dikosongkan
        filterUpbjj(newVal) {
            if (!newVal) {
                this.filterKategori = "";
            }
        },
        // WATCHER 2: Memantau input quantity (qty) pada form tambah agar tidak minus
        "form.qty"(newVal) {
            if (newVal < 0) {
                this.form.qty = 0;
                this.pesanError =
                    "Perhatian: Jumlah stok tidak boleh di bawah 0.";
            } else {
                this.pesanError = "";
            }
        },
        // WATCHER 3: Memantau input safety stock agar tidak minus
        "form.safety"(newVal) {
            if (newVal < 0) {
                this.form.safety = 0;
            }
        },
    },

    methods: {
        // Fitur reset ulang semua filter
        resetFilter() {
            this.filterUpbjj = "";
            this.filterKategori = "";
            this.hanyaReorder = false;
            this.sortBy = "";
        },

        // Validasi input sederhana dan tambah data
        tambahBahanAjar() {
            if (
                !this.form.kode ||
                !this.form.judul ||
                !this.form.kategori ||
                !this.form.upbjj
            ) {
                this.pesanError =
                    "Pastikan Kode, Judul, Kategori, dan UT-Daerah telah diisi.";
                return;
            }

            // Validasi duplikasi kode MK
            const exists = this.stok.find(
                (item) =>
                    item.kode.toUpperCase() === this.form.kode.toUpperCase(),
            );
            if (exists) {
                this.pesanError =
                    "Kode Mata Kuliah ini sudah terdaftar di sistem!";
                return;
            }

            // Menyimpan objek baru ke dalam array utama
            this.stok.push({
                ...this.form,
                kode: this.form.kode.toUpperCase(),
            });

            // Mereset form kembali kosong
            this.form = {
                kode: "",
                judul: "",
                kategori: "",
                upbjj: "",
                lokasiRak: "",
                qty: "",
                safety: "",
                harga: "",
                catatanHTML: "",
            };
            this.pesanError = "";
        },

        // Fungsi inisiasi Edit
        mulaiEdit(item) {
            this.editKode = item.kode;
            this.editForm = { ...item }; // Membuat salinan objek agar tidak reaktif secara langsung
        },

        // Fungsi menyimpan hasil Edit
        simpanEdit(item) {
            const index = this.stok.findIndex((s) => s.kode === item.kode);
            if (index !== -1) {
                // Menggunakan array.splice agar Vue mendeteksi pembaruan array secara reaktif
                this.stok.splice(index, 1, this.editForm);
            }
            this.editKode = null; // Menutup mode edit
        },

        // Batal edit
        batalEdit() {
            this.editKode = null;
        },

        // Menghapus baris tabel
        hapusItem(item) {
            if (
                confirm(
                    "Yakin ingin menghapus bahan ajar " +
                        item.judul +
                        " dari daftar stok?",
                )
            ) {
                this.stok = this.stok.filter((s) => s.kode !== item.kode);
            }
        },
    },
});
