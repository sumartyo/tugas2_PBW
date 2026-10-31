new Vue({
    el: "#app",
    data: {
        // --- DATA ACUAN (Diambil dari dummy dataBahanAjar.js) ---
        pengirimanList: [
            { kode: "REG", nama: "Reguler (3-5 hari)" },
            { kode: "EXP", nama: "Ekspres (1-2 hari)" },
        ],
        paketList: [
            {
                kode: "PAKET-UT-001",
                nama: "PAKET IPS Dasar",
                isi: ["EKMA4116", "EKMA4115"],
                harga: 120000,
            },
            {
                kode: "PAKET-UT-002",
                nama: "PAKET IPA Dasar",
                isi: ["BIOL4201", "FISIP4001"],
                harga: 140000,
            },
        ],
        // Objek Data Tracking DO
        trackingData: {
            "DO2025-001": {
                nim: "123456789",
                nama: "Rina Wulandari",
                status: "Dalam Perjalanan",
                ekspedisi: "Reguler (3-5 hari)",
                tanggalKirim: "2025-08-25",
                paket: "PAKET-UT-001",
                total: 120000,
                perjalanan: [
                    {
                        waktu: "2025-08-25 10:12:20",
                        keterangan: "Penerimaan di Loket: TANGSEL",
                    },
                    {
                        waktu: "2025-08-25 14:07:56",
                        keterangan: "Tiba di Hub: JAKSEL",
                    },
                ],
            },
        },

        // --- STATE FORMULIR DO BARU ---
        formDO: {
            nim: "",
            nama: "",
            ekspedisi: "",
            paket: "",
            tanggalKirim: "",
            totalHarga: 0,
        },
        pesanError: "",
        pesanSukses: "",
    },

    created() {
        // Otomatis mengatur tanggal kirim default ke hari ini
        this.formDO.tanggalKirim = this.getTanggalHariIni();
    },

    computed: {
        // Membangun Nomor DO Otomatis (Format: DO + Tahun + Sequence 3 Digit)
        generatedDO() {
            const tahun = new Date().getFullYear();
            const jumlahDO = Object.keys(this.trackingData).length;
            const sequenceBaru = String(jumlahDO + 1).padStart(3, "0");
            return `DO${tahun}-${sequenceBaru}`;
        },
        // Mencari objek detail paket berdasarkan paket yang dipilih di dropdown
        selectedPaketDetail() {
            if (!this.formDO.paket) return null;
            return this.paketList.find((p) => p.kode === this.formDO.paket);
        },
    },

    watch: {
        // WATCHER 1: Otomatisasi Harga. Mengubah totalHarga saat Pilihan Paket berubah
        "formDO.paket"(newKodePaket) {
            if (newKodePaket) {
                const paketInfo = this.paketList.find(
                    (p) => p.kode === newKodePaket,
                );
                this.formDO.totalHarga = paketInfo ? paketInfo.harga : 0;
            } else {
                this.formDO.totalHarga = 0;
            }
        },
        // WATCHER 2: Validasi NIM agar huruf/karakter selain angka otomatis dihapus secara real-time
        "formDO.nim"(newNim) {
            if (newNim) {
                this.formDO.nim = newNim.replace(/[^0-9]/g, "");
            }
        },
    },

    methods: {
        // Fungsi helper untuk mendapatkan tanggal lokal (YYYY-MM-DD)
        getTanggalHariIni() {
            const now = new Date();
            const yyyy = now.getFullYear();
            const mm = String(now.getMonth() + 1).padStart(2, "0");
            const dd = String(now.getDate()).padStart(2, "0");
            return `${yyyy}-${mm}-${dd}`;
        },

        // Fungsi submit formulir untuk menambahkan DO Baru
        tambahDO() {
            this.pesanError = "";
            this.pesanSukses = "";

            // Validasi Input Sederhana
            if (
                !this.formDO.nim ||
                !this.formDO.nama ||
                !this.formDO.ekspedisi ||
                !this.formDO.paket
            ) {
                this.pesanError = "Mohon lengkapi semua field yang diwajibkan!";
                return;
            }
            if (this.formDO.nim.length < 5) {
                this.pesanError = "NIM tidak valid (minimal 5 angka).";
                return;
            }

            // Menyusun Object DO Baru
            const dataBaru = {
                nim: this.formDO.nim,
                nama: this.formDO.nama,
                status: "Diproses", // Status awal paket
                ekspedisi: this.formDO.ekspedisi,
                tanggalKirim: this.formDO.tanggalKirim,
                paket: this.formDO.paket,
                total: this.formDO.totalHarga,
                perjalanan: [
                    {
                        waktu: new Date().toLocaleString("id-ID"),
                        keterangan:
                            "DO Berhasil dibuat. Menunggu penyerahan paket ke Kurir.",
                    },
                ],
            };

            // Menggunakan vue.$set agar pembaruan data pada Object terdeteksi oleh reactivity Vue
            this.$set(this.trackingData, this.generatedDO, dataBaru);

            this.pesanSukses = `Data ${this.generatedDO} berhasil ditambahkan!`;

            // Mereset Formulir
            this.formDO = {
                nim: "",
                nama: "",
                ekspedisi: "",
                paket: "",
                tanggalKirim: this.getTanggalHariIni(),
                totalHarga: 0,
            };

            // Menghilangkan pesan sukses setelah 3 detik
            setTimeout(() => {
                this.pesanSukses = "";
            }, 3000);
        },
    },
});
