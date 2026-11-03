require('dotenv').config();

// --- TAMBAHKAN KODE DEBUGGING INI ---
console.log("Cek Email:", process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? "TERBACA" : "KOSONG/TIDAK KETEMU");
console.log("Cek Spreadsheet ID:", process.env.SPREADSHEET_ID ? "TERBACA" : "KOSONG/TIDAK KETEMU");

require('dotenv').config(); // <-- PASTIKAN BARIS INI ADA DI PALING ATAS

const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');

const app = express();
app.use(cors());
app.use(express.json());

// Fungsi helper untuk koneksi aman ke Google Sheets menggunakan Service Account
async function getGoogleSheetsInstance() {
    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            // Menyesuaikan format baris baru pada private key di lingkungan Vercel/Node
            private_key: process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const client = await auth.getClient();
    const googleSheets = google.sheets({ version: 'v4', auth: client });
    const spreadsheetId = process.env.SPREADSHEET_ID;

    return { googleSheets, spreadsheetId };
}

// 1. Endpoint untuk MEMBACA data (Contoh: /api/data?sheetName=USERS)
app.get('/api/data', async (req, res) => {
    try {
        const { sheetName } = req.query; 
        if (!sheetName) {
            return res.status(400).json({ success: false, error: 'Parameter sheetName wajib diisi!' });
        }

        const { googleSheets, spreadsheetId } = await getGoogleSheetsInstance();

        const getRows = await googleSheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${sheetName}!A:Z`,
        });

        res.status(200).json({
            success: true,
            data: getRows.data.values || [],
        });
    } catch (error) {
        console.error('Error reading sheet:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 2. Endpoint untuk MENULIS data (Contoh: Menambah data absensi / user baru)
app.post('/api/data', async (req, res) => {
    try {
        const { sheetName, values } = req.body; 
        // values berupa array data, misal: ["12345", "Budi Santoso", "Hadir"]

        if (!sheetName || !values) {
            return res.status(400).json({ success: false, error: 'sheetName dan values wajib diisi di body request!' });
        }

        const { googleSheets, spreadsheetId } = await getGoogleSheetsInstance();

        const response = await googleSheets.spreadsheets.values.append({
            spreadsheetId,
            range: `${sheetName}!A:Z`,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [values],
            },
        });

        res.status(200).json({
            success: true,
            message: 'Data berhasil ditambahkan ke spreadsheet!',
            updates: response.data.updates,
        });
    } catch (error) {
        console.error('Error writing sheet:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Root endpoint pengecekan status server
app.get('/', (req, res) => {
    res.status(200).send('DIGICLASS Backend API is running smoothly on Vercel!');
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server lokal DIGICLASS berjalan di http://localhost:${PORT}`);
    });
}

module.exports = app;