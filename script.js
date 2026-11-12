// Fungsi untuk mengambil data dari backend API lokal kita
async function ambilDataUser() {
    const container = document.getElementById('hasil-data');
    container.innerHTML = "<p>Sedang memuat data dari Google Sheets...</p>";

    try {
        // 1. Lakukan 'fetch' ke endpoint backend Express.js kita
        // Karena backend berjalan di port 3000, kita arahkan ke http://localhost:3000/api/data?sheetName=USERS
        const response = await fetch('http://localhost:3000/api/data?sheetName=USERS');
        
        // 2. Ubah respons server menjadi format JSON
        const hasil = await response.json();

        // 3. Cek apakah pengambilan data berhasil
        if (hasil.success && hasil.data.length > 0) {
            let rows = hasil.data; // rows adalah array berisi baris-baris dari Google Sheets

            // 4. Buat elemen tabel HTML secara dinamis untuk menampilkan datanya
            let htmlTable = `<table><thead><tr>`;
            
            // Baris pertama diasumsikan sebagai Header kolom (Nama, Email, Role, dll)
            rows[0].forEach(header => {
                htmlTable += `<th>${header}</th>`;
            });
            htmlTable += `</tr></thead><tbody>`;

            // Baris berikutnya adalah isi datanya (mulai dari index 1)
            for (let i = 1; i < rows.length; i++) {
                htmlTable += `<tr>`;
                rows[i].forEach(cell => {
                    htmlTable += `<td>${cell}</td>`;
                });
                htmlTable += `</tr>`;
            }

            htmlTable += `</tbody></table>`;

            // 5. Masukkan tabel yang sudah jadi ke dalam elemen div di halaman HTML
            container.innerHTML = htmlTable;
        } else {
            container.innerHTML = "<p>Data di Google Sheets kosong atau tidak ditemukan.</p>";
        }

    } catch (error) {
        console.error('Terjadi kesalahan:', error);
        container.innerHTML = `<p style="color: red;">Gagal terhubung ke backend: ${error.message}</p>`;
    }
}

// Fungsi untuk mengirim data absensi baru ke backend API
async function kirimAbsensi(event) {
    event.preventDefault(); // Mencegah halaman melakukan refresh otomatis

    const nim = document.getElementById('nim').value;
    const nama = document.getElementById('nama').value;
    const status = document.getElementById('status').value;
    const pesanStatus = document.getElementById('pesan-status');
    
    // Mendapatkan tanggal hari ini secara otomatis (Format: YYYY-MM-DD)
    const tanggal = new Date().toISOString().split('T')[0];

    pesanStatus.style.color = "#38bdf8";
    pesanStatus.innerText = "Mengirim data ke Google Sheets...";

    try {
        // Melakukan request POST ke backend API kita
        const response = await fetch('/api/data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sheetName: "ABSENSI", // Pastikan nama sheet ini ada di Google Sheets Anda
                values: [nim, nama, status, tanggal]
            })
        });

        const hasil = await response.json();

        if (hasil.success) {
            pesanStatus.style.color = "#4ade80";
            pesanStatus.innerText = "Berhasil! Absensi telah tercatat di Google Sheets.";
            
            // Reset form setelah berhasil
            document.getElementById('form-absensi').reset();
            
            // Otomatis muat ulang data tabel jika fungsi ambilDataUser sudah ada
            // ambilDataUser(); 
        } else {
            pesanStatus.style.color = "#f87171";
            pesanStatus.innerText = "Gagal: " + hasil.error;
        }

    } catch (error) {
        console.error('Error:', error);
        pesanStatus.style.color = "#f87171";
        pesanStatus.innerText = "Terjadi kesalahan jaringan: " + error.message;
    }
}