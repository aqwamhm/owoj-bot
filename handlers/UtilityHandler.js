const NotFoundError = require("../exceptions/NotFoundError");
const { validate } = require("../utils/validator");
const errorMessages = require("../views/error");
const utilityViews = require("../views/utility");
const tafsir = require("../resources/tafsir/pages.json");
const { chapters } = require("../resources/tafsir/chapters.json");

class UtilityHandler {
    constructor(utilityViews) {
        this.utilityViews = utilityViews;
        this.prayerTimeUrl = "https://api.myquran.com/v2/sholat";
    }

    async handleMotivationRequest() {
        const url = "https://openrouter.ai/api/v1/chat/completions";
        const apiKey = process.env.OPENROUTER_API_TOKEN;

        if (!apiKey) {
            throw new Error(
                "OPENROUTER_API_TOKEN tidak ditemukan di file .env"
            );
        }

        const headers = {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        };

        const prompt = `Anda adalah seorang motivator muslim yang berpengalaman dalam memberikan semangat kepada komunitas One Week One Juz. One Week One Juz (OWOJ) adalah komunitas yang membaca Al-Qur'an dengan target 1 juz per minggu. Setiap grup WhatsApp berisi 30 anggota yang masing-masing bertanggung jawab atas 1 juz.

        Tugas anda:
        1. Buatkan pesan penyemangat untuk anggota grup OWOJ
        2. Pesan harus pendek, TIDAK BOLEH LEBIH DARI 1 PARAGRAF. 
        3. Gunakan bahasa yang sopan
        4. Masukkan nilai-nilai islami dalam pesan tersebut
        5. Pesan harus bersifat memotivasi dan mendorong konsistensi
        6. Jangan mengutip ayat Al-Qur'an atau Hadits secara langsung
        7. Anda harus kreatif! Namun tetap fokus pada SEMANGAT dan KONSISTENSI
        8. Tambahkan emoji-emoji yang relevan (terlebih emoji islami) di dalam pesan
        9. JANGAN PERNAH menyebut nomor juz atau progress tertentu

        Berikan satu pesan yang memenuhi seluruh kriteria di atas dengan menggabungkan kata-kata islami secara natural dan tidak berlebihan.

        Panduan penggunaan kata-kata Islami:
        - Selalu mulai dengan salam (Assalamualaikum Warahmatullahi Wabarakatuh)
        - Gunakan kata-kata islami yang umum seperti: Baarakallahu fiikum, Jazakumullah khairan, Alhamdulillah, MasyaAllah, InsyaAllah, dan lain-lain

        PENTING: 
        - HINDARI menyebut progress atau juz spesifik
        - HINDARI kata-kata seperti "sampai di juz berapa" atau "progress juz kita"
        - HINDARI setiap kata-kata yang kita baca adalah cahaya  
        - FOKUS pada SEMANGAT BERSAMA dan KONSISTENSI`;

        const data = {
            model: "meta-llama/llama-3.1-70b-instruct:free",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            presence_penalty: 0.8,
            frequency_penalty: 0.8,
        };

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                return;
            }

            const result = await response.json();
            return result.choices[0].message.content;
        } catch {
            return this.utilityViews.motivation.error.request();
        }
    }

    async handlePrayerTimeRequest({ message, validation }) {
        const { location, days } = validate({
            command: message.body,
            validation,
            errorMessage: errorMessages.validation({
                format: "/waktu-sholat nama kota/kabupaten +jumlah hari kedepan",
                example: `/waktu-sholat Kota Jakarta (untuk hari ini)
/waktu-sholat Kota Jakarta +1 (untuk satu hari kedepan)
/waktu-sholat Kota Jakarta +2 (untuk dua hari kedepan)`,
            }),
        });

        const formattedLocation = location
            .toUpperCase()
            .replace(/\bKABUPATEN\b/, "KAB.")
            .replace(/\s+/g, "%20");

        const locationResponse = await fetch(
            `${this.prayerTimeUrl}/kota/cari/${formattedLocation}`
        );

        const { data: locationData } = await locationResponse.json();

        const locationId = locationData?.[0]?.id;

        if (!locationId) {
            throw new NotFoundError(
                this.utilityViews.prayerTime.error.locationNotFound()
            );
        }

        function addDays(date, days) {
            const newDate = new Date(date);
            newDate.setDate(newDate.getDate() + (days || 0));
            return newDate;
        }

        const currentDate = addDays(new Date(), parseInt(days, 10))
            .toLocaleDateString("en-CA", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            })
            .split("/")
            .reverse()
            .join("-");

        try {
            const prayerTimeResponse = await fetch(
                `${this.prayerTimeUrl}/jadwal/${locationId}/${currentDate}`
            );

            const prayerTime = await prayerTimeResponse.json();

            return this.utilityViews.prayerTime.success({
                prayerTime: prayerTime.data,
            });
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async handleTafsirRequest({ message, validation }) {
        const { page } = validate({
            command: message.body,
            validation,
            errorMessage: errorMessages.validation({
                format: "/tafsir halaman",
                example: "/tafsir 1",
            }),
        });

        if (page > 604 || page < 1) {
            throw new NotFoundError(
                this.utilityViews.tafsir.error.pageNotFound()
            );
        }

        const tafsirPage = tafsir.pages.find((p) => p.id == page);

        return this.utilityViews.tafsir.success({
            tafsir: tafsirPage,
            chapters: chapters,
        });
    }
}

module.exports = new UtilityHandler(utilityViews);
