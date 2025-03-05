const axios = require("axios");
const fs = require("fs");
const randomName = require("random-name");
const readline = require("readline-sync");

// Minta input referral code dan jumlah akun yang ingin dibuat
const referralCode = readline.question("Masukkan referral code: ");
const jumlahAkun = parseInt(readline.question("Masukkan jumlah akun yang ingin dibuat: "), 10);

// Fungsi untuk generate nama + angka (digunakan untuk email & username)
function generateRandomNameWithNumber() {
    const firstName = randomName.first(); 
    const randomNumber = Math.floor(1000 + Math.random() * 9000); 
    return `${firstName}${randomNumber}`;
}

// Fungsi untuk registrasi ke Algora
async function registerAlgora() {
    for (let i = 0; i < jumlahAkun; i++) {
        try {
            let nameWithNumber = generateRandomNameWithNumber(); 
            let email = `${nameWithNumber.toLowerCase()}@gmail.com`; 
            let password = "Pass1234"; 
            let username = nameWithNumber; 

            // Request register akun
            let response = await axios.post(
                "https://api-v1.algora.network/account/create",
                {
                    email,
                    password,
                    username,
                    ref_username: referralCode
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
                    },
                }
            );

            if (response.status === 200 && response.data.token) {
                let token = response.data.token;
                console.log(`✅ Berhasil daftar: ${email} | ${password} | ${username} | Token: ${token}`);

                // Membuat miner setelah mendapatkan token
                await createMiner(token);

                // Simpan ke file txt
                fs.appendFileSync("accounts.txt", `${email} | ${password} | ${username} | ${token}\n`);
            } else {
                console.log(`❌ Gagal daftar untuk ${email}`);
            }
        } catch (error) {
            console.error(`❌ Error registrasi:`, error.response?.data || error.message);
        }
    }
}

// Fungsi untuk membuat miner
async function createMiner(token) {
    try {
        let response = await axios.post(
            "https://api-v1.algora.network/order/create",
            {
                id: "1c-miner",
                num_months: 1,
                currency: "eth"
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
                },
            }
        );

        if (response.status === 200) {
            console.log(`⛏️ Miner berhasil dibuat untuk akun ini!`);
        } else {
            console.log(`⚠️ Gagal membuat miner`);
        }
    } catch (error) {
        console.error(`❌ Error membuat miner:`, error.response?.data || error.message);
    }
}

// Jalankan pendaftaran
registerAlgora();
