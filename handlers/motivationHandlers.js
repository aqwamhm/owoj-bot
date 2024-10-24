const handleMotivationRequest = async (message) => {
    const url = "https://openrouter.ai/api/v1/chat/completions";
    const apiKey = process.env.OPENROUTER_API_TOKEN;

    if (!apiKey) {
        throw new Error("OPENROUTER_API_TOKEN tidak ditemukan di file .env");
    }

    const headers = {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
    };

    const prompt = `Anda adalah seorang motivator muslim yang berpengalaman dalam memberikan semangat kepada komunitas pembaca Al-Qur'an.

    Konteks: One Week One Juz (OWOJ) adalah komunitas yang membaca Al-Qur'an dengan target 1 juz per minggu. Setiap grup WhatsApp berisi 30 anggota yang masing-masing bertanggung jawab atas 1 juz.

    Tugas anda:
    1. Buatkan pesan penyemangat untuk anggota grup OWOJ
    2. Pesan harus singkat (maksimal 1 paragraf atau 3-4 kalimat) dan mudah dipahami
    3. Gunakan bahasa yang santai namun tetap sopan
    4. Masukkan nilai-nilai islami dalam pesan tersebut
    5. Pesan harus bersifat memotivasi dan mendorong konsistensi
    6. Jangan mengutip ayat Al-Qur'an atau Hadits secara langsung
    7. Anda harus kreatif! Namun tetap fokus pada SEMANGAT BERSAMA dan KONSISTENSI
    8. Tambahkan emoji-emoji yang relevan (terlebih emoji islami) di dalam pesan
    9. Hindari penggunaan kata-kata klise atau terlalu formal
    10. JANGAN PERNAH menyebut nomor juz atau progress tertentu

    Berikan satu pesan yang memenuhi seluruh kriteria di atas dengan menggabungkan kata-kata islami secara natural dan tidak berlebihan.

    Panduan penggunaan kata-kata Islami:
    - Selalu mulai dengan salam (Assalamualaikum Warahmatullahi Wabarakatuh)
    - Gunakan kata-kata islami yang umum seperti: Baarakallahu fiikum, Jazakumullah khairan, Alhamdulillah, MasyaAllah, InsyaAllah, dan lain-lain

    PENTING: 
    - HINDARI menyebut progress atau juz spesifik
    - HINDARI kata-kata seperti "sampai di juz berapa" atau "progress juz kita"
    - HINDARI kata-kata yang kita baca adalah cahaya  
    - FOKUS pada SEMANGAT BERSAMA dan KONSISTENSI`;

    const data = {
        model: "nousresearch/hermes-3-llama-3.1-405b:free",
        messages: [
            {
                role: "user",
                content: prompt,
            },
        ],
        max_tokens: 200,
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            console.log(response);
            return;
        }

        const result = await response.json();
        return result.choices[0].message.content;
    } catch (error) {
        return motivationViews.error.request();
    }
};

module.exports = { handleMotivationRequest };
