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