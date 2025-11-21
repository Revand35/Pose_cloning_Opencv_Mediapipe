import { checkAuth, getCurrentUser } from './auth.js';
import { GEMINI_API_KEY, GEMINI_MODELS, getGeminiApiUrl, getListModelsUrl, GEMINI_CONFIG, SYSTEM_PROMPT } from './gemini-config.js';

// Check authentication
checkAuth().then(user => {
    if (!user) {
        window.location.href = 'login.html';
    }
});

const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const suggestionBtns = document.querySelectorAll('.suggestion-btn');

// Chat history untuk context
let chatHistory = [];
let currentModelIndex = 0;
let availableModels = []; // Cache untuk model yang tersedia

// Auto-resize textarea
userInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 120) + 'px';
});

function addMessage(text, isUser = false, isLoading = false) {
    // Remove empty state jika ada
    const emptyState = chatMessages.querySelector('.empty-state');
    if (emptyState) {
        emptyState.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'assistant'} ${isLoading ? 'loading' : ''}`;
    
    if (isLoading) {
        messageDiv.innerHTML = `
            <div class="message-header">
                <span>🤖 AI Chat</span>
            </div>
            <div class="message-bubble">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
    } else {
        const header = isUser ? '👤 Anda' : '🤖 AI Chat';
        messageDiv.innerHTML = `
            <div class="message-header">${header}</div>
            <div class="message-bubble">
                <div class="message-content">${formatMessage(text)}</div>
            </div>
        `;
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return messageDiv;
}

function formatMessage(text) {
    // Format markdown-like text untuk tampilan yang lebih baik
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>')
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^# (.*$)/gm, '<h2>$1</h2>')
        .replace(/^\d+\.\s(.*$)/gm, '<li>$1</li>')
        .replace(/^-\s(.*$)/gm, '<li>$1</li>');
}

// Knowledge base untuk REBA/RULA dan ergonomi
const knowledgeBase = {
    reba: {
        keywords: ['reba', 'rapid entire body assessment'],
        response: `**REBA (Rapid Entire Body Assessment)** adalah metode penilaian ergonomi yang digunakan untuk mengevaluasi risiko cedera pada seluruh tubuh.

**Skor REBA:**
- **1-2**: Risiko rendah, postur dapat diterima
- **3-4**: Risiko sedang, perlu perbaikan
- **5-6**: Risiko tinggi, perlu perbaikan segera
- **7-10**: Risiko sangat tinggi, perbaikan mendesak
- **11+**: Risiko ekstrem, perbaikan segera diperlukan

**Komponen yang dinilai:**
1. Posisi leher
2. Posisi batang tubuh
3. Posisi lengan
4. Posisi pergelangan tangan
5. Posisi kaki
6. Beban/force yang diberikan

**Cara mengurangi skor REBA:**
- Perbaiki postur duduk/berdiri
- Sesuaikan tinggi meja dan kursi
- Gunakan alat bantu ergonomis
- Istirahat secara teratur
- Lakukan peregangan`
    },
    rula: {
        keywords: ['rula', 'rapid upper limb assessment'],
        response: `**RULA (Rapid Upper Limb Assessment)** adalah metode penilaian ergonomi yang fokus pada anggota tubuh bagian atas (lengan, leher, batang tubuh).

**Skor RULA:**
- **1-2**: Acceptable (Dapat diterima)
- **3-4**: Investigate (Perlu investigasi)
- **5-6**: Action Required (Perlu tindakan)
- **7**: Action Required Now (Perlu tindakan segera)

**Komponen yang dinilai:**
1. Posisi leher
2. Posisi batang tubuh
3. Posisi lengan atas
4. Posisi lengan bawah
5. Posisi pergelangan tangan
6. Penggunaan otot

**Cara mengurangi skor RULA:**
- Pastikan monitor setinggi mata
- Lengan membentuk sudut 90 derajat
- Punggung lurus dan bersandar
- Pergelangan tangan lurus
- Gunakan keyboard dan mouse ergonomis`
    },
    postur: {
        keywords: ['postur', 'postur tubuh', 'duduk', 'berdiri', 'perbaiki'],
        response: `**Tips Memperbaiki Postur Tubuh:**

**Saat Duduk:**
1. ✅ Kaki rata di lantai, lutut sejajar dengan pinggul
2. ✅ Punggung lurus dan bersandar pada sandaran kursi
3. ✅ Monitor setinggi mata, jarak 50-70 cm
4. ✅ Lengan membentuk sudut 90 derajat
5. ✅ Pergelangan tangan lurus saat mengetik

**Saat Berdiri:**
1. ✅ Berat badan merata pada kedua kaki
2. ✅ Bahu rileks, tidak tegang
3. ✅ Kepala tegak, tidak menunduk
4. ✅ Perut ditarik sedikit
5. ✅ Gunakan alas kaki yang nyaman

**Latihan Peregangan:**
- Putar bahu ke belakang (10x)
- Regangkan leher ke kiri-kanan (tahan 15 detik)
- Regangkan lengan ke atas (tahan 15 detik)
- Putar pergelangan tangan (10x setiap arah)

**Frekuensi:**
- Lakukan peregangan setiap 30-60 menit
- Berdiri dan berjalan setiap 1-2 jam
- Istirahat mata setiap 20 menit (20-20-20 rule)`
    },
    skor_tinggi: {
        keywords: ['skor tinggi', 'risiko tinggi', 'bahaya', 'berbahaya'],
        response: `**Jika Skor REBA/RULA Tinggi:**

**Tindakan Segera:**
1. ⚠️ **Hentikan aktivitas** yang menyebabkan skor tinggi
2. ⚠️ **Ubah postur** segera
3. ⚠️ **Lakukan peregangan** untuk meredakan ketegangan

**Perbaikan Jangka Panjang:**
1. 🔧 **Sesuaikan workstation:**
   - Tinggi meja dan kursi
   - Posisi monitor
   - Posisi keyboard dan mouse

2. 🔧 **Gunakan alat bantu:**
   - Footrest
   - Lumbar support
   - Keyboard tray
   - Monitor arm

3. 🔧 **Latihan rutin:**
   - Strengthening exercises
   - Stretching exercises
   - Posture correction exercises

4. 🔧 **Konsultasi profesional:**
   - Ergonomist
   - Fisioterapis
   - Dokter spesialis

**Pencegahan:**
- Lakukan penilaian REBA/RULA secara berkala
- Monitor postur tubuh secara rutin
- Gunakan aplikasi PosturGO untuk tracking`
    },
    default: {
        response: `Saya dapat membantu Anda dengan konsultasi tentang:

**📊 REBA & RULA:**
- Penjelasan tentang skor REBA dan RULA
- Cara membaca hasil penilaian
- Tips mengurangi skor

**💪 Postur Tubuh:**
- Cara memperbaiki postur duduk
- Cara memperbaiki postur berdiri
- Latihan peregangan

**🏢 Ergonomi:**
- Setup workstation yang ergonomis
- Alat bantu ergonomis
- Pencegahan cedera

Silakan tanyakan hal spesifik yang ingin Anda ketahui!`
    }
};

// Function untuk mendapatkan daftar model yang tersedia dari API
async function listAvailableModels() {
    // Jika sudah ada cache, gunakan cache
    if (availableModels.length > 0) {
        return availableModels;
    }
    
    // Coba v1beta terlebih dahulu, lalu v1
    const versions = ['v1beta', 'v1'];
    
    for (const version of versions) {
        try {
            const listUrl = getListModelsUrl(version);
            console.log(`Mencoba mendapatkan daftar model dari ${version}...`);
            
            const response = await fetch(listUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.models && data.models.length > 0) {
                    // Filter model yang mendukung generateContent
                    const supportedModels = data.models
                        .filter(model => 
                            model.supportedGenerationMethods && 
                            model.supportedGenerationMethods.includes('generateContent')
                        )
                        .map(model => {
                            // Extract model name dari full name (misal: "models/gemini-pro" -> "gemini-pro")
                            const modelName = model.name.replace(/^models\//, '');
                            return {
                                version: version,
                                model: modelName,
                                displayName: model.displayName || modelName
                            };
                        });
                    
                    if (supportedModels.length > 0) {
                        // Sort models: prioritaskan flash (lebih ringan) daripada pro
                        supportedModels.sort((a, b) => {
                            const aIsFlash = a.model.includes('flash');
                            const bIsFlash = b.model.includes('flash');
                            if (aIsFlash && !bIsFlash) return -1;
                            if (!aIsFlash && bIsFlash) return 1;
                            // Jika sama, prioritaskan yang tidak preview/experimental
                            const aIsPreview = a.model.includes('preview') || a.model.includes('exp');
                            const bIsPreview = b.model.includes('preview') || b.model.includes('exp');
                            if (!aIsPreview && bIsPreview) return -1;
                            if (aIsPreview && !bIsPreview) return 1;
                            return 0;
                        });
                        console.log(`✅ Ditemukan ${supportedModels.length} model yang tersedia (diurutkan berdasarkan prioritas):`, supportedModels);
                        availableModels = supportedModels;
                        return availableModels;
                    }
                }
            } else {
                console.log(`Tidak dapat mendapatkan daftar model dari ${version}:`, response.status);
            }
        } catch (error) {
            console.error(`Error saat mendapatkan daftar model dari ${version}:`, error);
        }
    }
    
    // Jika gagal, return empty array
    console.warn('⚠️ Tidak dapat mendapatkan daftar model dari API, akan menggunakan daftar default');
    return [];
}

// Load available models saat halaman dimuat
listAvailableModels().then(models => {
    if (models.length > 0) {
        console.log(`✅ Siap menggunakan ${models.length} model yang tersedia`);
    } else {
        console.log('⚠️ Menggunakan daftar model default');
    }
});

async function getAIResponse(question) {
    // Jika belum ada available models, coba dapatkan dulu
    if (availableModels.length === 0) {
        await listAvailableModels();
    }
    
    // Gunakan available models jika ada, jika tidak gunakan default models
    const modelsToTry = availableModels.length > 0 ? availableModels : GEMINI_MODELS;
    
    // Track berapa banyak model yang mengalami rate limit berturut-turut
    let consecutiveRateLimits = 0;
    const maxConsecutiveRateLimits = 3; // Jika 3 model berturut-turut rate limit, langsung fallback
    
    // Coba dengan Gemini API terlebih dahulu
    for (let attempt = 0; attempt < modelsToTry.length; attempt++) {
        const modelConfig = modelsToTry[currentModelIndex % modelsToTry.length];
        const apiUrl = getGeminiApiUrl(modelConfig);
        
        try {
            console.log(`Mencoba model: ${modelConfig.version}/${modelConfig.model}`);
            
            // Build contents array dengan chat history
            const contents = [];
            
            // Jika belum ada history, tambahkan system prompt di awal
            if (chatHistory.length === 0) {
                contents.push({
                    role: 'user',
                    parts: [{ text: SYSTEM_PROMPT }]
                });
                contents.push({
                    role: 'model',
                    parts: [{ text: 'Baik, saya siap membantu Anda dengan konsultasi tentang REBA, RULA, postur tubuh, dan ergonomi. Ada yang bisa saya bantu?' }]
                });
            } else {
                // Convert chat history ke format Gemini
                chatHistory.forEach(msg => {
                    contents.push({
                        role: msg.role === 'user' ? 'user' : 'model',
                        parts: [{ text: msg.content }]
                    });
                });
            }
            
            // Tambahkan pertanyaan user saat ini
            contents.push({
                role: 'user',
                parts: [{ text: question }]
            });
            
            const requestBody = {
                contents: contents,
                generationConfig: GEMINI_CONFIG
            };
            
            const response = await fetch(`${apiUrl}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });
            
            if (response.ok) {
                const data = await response.json();
                
                if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                    const aiResponse = data.candidates[0].content.parts[0].text;
                    console.log(`Berhasil menggunakan model: ${modelConfig.version}/${modelConfig.model}`);
                    return aiResponse;
                }
            } else {
                // Log error details untuk debugging
                const errorData = await response.json().catch(() => ({}));
                console.error(`Error ${response.status} dengan model ${modelConfig.version}/${modelConfig.model}:`, errorData);
                
                // Tampilkan detail error jika ada
                if (errorData.error) {
                    console.error('Detail error:', errorData.error.message || errorData.error);
                }
                
                // Jika 429 (Rate Limit / Quota Exceeded), skip model ini dan coba model berikutnya
                if (response.status === 429) {
                    consecutiveRateLimits++;
                    const errorData = await response.json().catch(() => ({}));
                    const retryAfter = errorData.error?.retryDelay || errorData.error?.retry_after;
                    console.warn(`⚠️ Quota/rate limit untuk model ${modelConfig.version}/${modelConfig.model}${retryAfter ? ` (retry setelah ${retryAfter}s)` : ''}`);
                    
                    // Jika terlalu banyak model berturut-turut mengalami rate limit, langsung fallback
                    if (consecutiveRateLimits >= maxConsecutiveRateLimits) {
                        console.warn(`⚠️ ${consecutiveRateLimits} model berturut-turut mengalami rate limit. Langsung menggunakan knowledge base lokal.`);
                        break; // Keluar dari loop, langsung ke fallback
                    }
                    
                    console.warn(`Mencoba model berikutnya...`);
                    currentModelIndex = (currentModelIndex + 1) % modelsToTry.length;
                    continue;
                }
                
                // Reset counter jika berhasil atau error selain rate limit
                consecutiveRateLimits = 0;
                
                // Jika error, coba model berikutnya
                if (response.status === 404) {
                    console.log(`Model ${modelConfig.version}/${modelConfig.model} tidak ditemukan, mencoba model berikutnya...`);
                    currentModelIndex = (currentModelIndex + 1) % modelsToTry.length;
                    continue;
                }
                
                // Jika 403 (Forbidden) atau 401 (Unauthorized), kemungkinan API key bermasalah
                if (response.status === 403 || response.status === 401) {
                    console.error('⚠️ API key mungkin tidak valid atau tidak memiliki izin. Pastikan:');
                    console.error('1. Generative Language API sudah di-enable di Google Cloud Console');
                    console.error('2. API key memiliki akses ke Generative Language API');
                    console.error('3. API key valid dan tidak expired');
                    // Tetap coba model berikutnya
                    currentModelIndex = (currentModelIndex + 1) % modelsToTry.length;
                    continue;
                }
            }
        } catch (error) {
            console.error(`Error calling Gemini API dengan model ${modelConfig.version}/${modelConfig.model}:`, error);
            // Coba model berikutnya
            if (attempt < modelsToTry.length - 1) {
                currentModelIndex = (currentModelIndex + 1) % modelsToTry.length;
                continue;
            }
        }
    }
    
    // Jika semua model gagal, tampilkan pesan error yang informatif
    console.warn('⚠️ Semua model Gemini API gagal atau quota habis.');
    console.warn('💡 Menggunakan knowledge base lokal sebagai fallback...');
    console.warn('');
    console.warn('📋 Jika ingin menggunakan Gemini API:');
    console.warn('1. Periksa quota di https://ai.dev/usage?tab=rate-limit');
    console.warn('2. Upgrade ke paid plan jika perlu');
    console.warn('3. Atau tunggu hingga quota reset');
    
    // Fallback ke knowledge base lokal jika Gemini API gagal
    const lowerQuestion = question.toLowerCase();
    
    // Cek keyword untuk menentukan response
    for (const [key, data] of Object.entries(knowledgeBase)) {
        if (key === 'default') continue;
        
        for (const keyword of data.keywords) {
            if (lowerQuestion.includes(keyword)) {
                return data.response;
            }
        }
    }
    
    // Response berdasarkan konteks
    if (lowerQuestion.includes('skor') && (lowerQuestion.includes('reba') || lowerQuestion.includes('rula'))) {
        if (lowerQuestion.includes('tinggi') || lowerQuestion.includes('bahaya')) {
            return knowledgeBase.skor_tinggi.response;
        }
        if (lowerQuestion.includes('reba')) {
            return knowledgeBase.reba.response;
        }
        if (lowerQuestion.includes('rula')) {
            return knowledgeBase.rula.response;
        }
    }
    
    // Default response
    return knowledgeBase.default.response;
}

async function sendMessage() {
    const question = userInput.value.trim();
    if (!question) return;
    
    // Disable input saat processing
    userInput.disabled = true;
    sendBtn.disabled = true;
    
    // Add user message
    addMessage(question, true);
    userInput.value = '';
    userInput.style.height = 'auto';
    
    // Add loading message
    const loadingMessage = addMessage('', false, true);
    
    // Get AI response (dengan Gemini API atau fallback ke knowledge base)
    try {
        const response = await getAIResponse(question);
        
        // Remove loading message
        loadingMessage.remove();
        
        // Add AI response
        addMessage(response, false);
        
        // Update chat history
        chatHistory.push({ role: 'user', content: question });
        chatHistory.push({ role: 'assistant', content: response });
        
        // Limit history
        if (chatHistory.length > 20) {
            chatHistory = chatHistory.slice(-20);
        }
        
    } catch (error) {
        console.error('Error:', error);
        loadingMessage.remove();
        addMessage('Maaf, terjadi kesalahan. Silakan coba lagi.', false);
    } finally {
        // Re-enable input
        userInput.disabled = false;
        sendBtn.disabled = false;
        userInput.focus();
    }
}

// Event listeners
sendBtn.addEventListener('click', sendMessage);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !userInput.disabled) {
        e.preventDefault();
        sendMessage();
    }
});

suggestionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        if (userInput.disabled) return;
        const question = btn.getAttribute('data-question');
        userInput.value = question;
        userInput.style.height = 'auto';
        userInput.style.height = Math.min(userInput.scrollHeight, 120) + 'px';
        sendMessage();
    });
});

// Handle activity summary collapse
const activitySummary = document.getElementById('activitySummary');
const closeActivitySummary = document.getElementById('closeActivitySummary');

if (closeActivitySummary) {
    closeActivitySummary.addEventListener('click', (e) => {
        e.stopPropagation();
        activitySummary.classList.add('collapsed');
        // Hide content after animation
        setTimeout(() => {
            const content = activitySummary.querySelector('.activity-summary-content');
            if (content) {
                content.style.display = 'none';
            }
        }, 300);
    });
}

// Handle attach button (placeholder for future file upload)
const attachBtn = document.getElementById('attachBtn');
if (attachBtn) {
    attachBtn.addEventListener('click', () => {
        // Placeholder: Future file upload functionality
        console.log('File attachment feature coming soon');
        // You can add file input here later
    });
}

