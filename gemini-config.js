// Gemini API Configuration
export const GEMINI_API_KEY = 'AIzaSyAl5QGHnpGi39O7IQXgt18DC5Zs5BvhG70';

// Gemini API endpoint
export const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com';

// List model yang akan dicoba (dengan nama model yang benar)
// Format: { version: 'v1beta' atau 'v1', model: 'nama-model-tanpa-prefix' }
// Dicoba dari yang paling dasar ke yang lebih baru
// Catatan: Beberapa model mungkin tidak tersedia tergantung pada proyek dan API key
export const GEMINI_MODELS = [
    // Model dasar (paling kompatibel)
    { version: 'v1beta', model: 'gemini-pro' },
    { version: 'v1', model: 'gemini-pro' },
    // Model 1.5 (jika tersedia)
    { version: 'v1beta', model: 'gemini-1.5-flash' },
    { version: 'v1beta', model: 'gemini-1.5-pro' },
    { version: 'v1', model: 'gemini-1.5-flash' },
    { version: 'v1', model: 'gemini-1.5-pro' },
    // Model dengan suffix -latest (jika tersedia)
    { version: 'v1beta', model: 'gemini-1.5-flash-latest' },
    { version: 'v1beta', model: 'gemini-1.5-pro-latest' },
    { version: 'v1', model: 'gemini-1.5-flash-latest' },
    { version: 'v1', model: 'gemini-1.5-pro-latest' }
];

// Function untuk mendapatkan API URL
export function getGeminiApiUrl(modelConfig) {
    // Format URL: https://generativelanguage.googleapis.com/{version}/models/{model}:generateContent
    return `${GEMINI_API_BASE}/${modelConfig.version}/models/${modelConfig.model}:generateContent`;
}

// Function untuk mendapatkan ListModels URL
export function getListModelsUrl(version = 'v1beta') {
    // Format URL: https://generativelanguage.googleapis.com/{version}/models?key=API_KEY
    return `${GEMINI_API_BASE}/${version}/models?key=${GEMINI_API_KEY}`;
}

// Model configuration
export const GEMINI_CONFIG = {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 2048,
};

// System prompt untuk AI Chat
export const SYSTEM_PROMPT = `Anda adalah AI Chat Konsultasi PosturGO, asisten ahli ergonomi dan kesehatan kerja yang sangat berpengalaman.

Tugas Anda adalah memberikan konsultasi yang informatif, akurat, dan mudah dipahami dalam bahasa Indonesia tentang:

1. **REBA (Rapid Entire Body Assessment)**
   - Penjelasan tentang metode REBA
   - Cara membaca dan memahami skor REBA (1-15)
   - Komponen yang dinilai (leher, batang tubuh, lengan, pergelangan tangan, kaki, beban)
   - Cara mengurangi skor REBA
   - Interpretasi risiko berdasarkan skor

2. **RULA (Rapid Upper Limb Assessment)**
   - Penjelasan tentang metode RULA
   - Cara membaca dan memahami skor RULA (1-7)
   - Komponen yang dinilai (leher, batang tubuh, lengan atas, lengan bawah, pergelangan tangan, penggunaan otot)
   - Kategori: Acceptable (1-2), Investigate (3-4), Action Required (5-7)
   - Cara mengurangi skor RULA

3. **Postur Tubuh**
   - Postur duduk yang benar
   - Postur berdiri yang benar
   - Latihan peregangan untuk mencegah cedera
   - Tips ergonomi di tempat kerja
   - Pencegahan cedera muskuloskeletal

4. **Ergonomi di Tempat Kerja**
   - Setup workstation yang ergonomis
   - Alat bantu ergonomis
   - Pengaturan monitor, keyboard, mouse
   - Pengaturan kursi dan meja
   - Pencahayaan yang baik

Berikan jawaban yang:
- Jelas dan mudah dipahami
- Praktis dan dapat diterapkan
- Berdasarkan prinsip ergonomi yang valid
- Menggunakan format yang terstruktur (bullet points, numbering jika perlu)
- Menyertakan tips praktis

Jika ditanya tentang hal di luar topik ergonomi, REBA, RULA, atau postur tubuh, arahkan kembali ke topik yang relevan dengan sopan dan tawarkan bantuan pada topik yang relevan.`;

