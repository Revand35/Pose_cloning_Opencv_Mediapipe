// Import MediaPipe modules
import {
    PoseLandmarker,
    FilesetResolver,
    DrawingUtils
} from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.9';

// Import REBA/RULA calculator
import { calculateREBA, calculateRULA } from './reba_rula.js';

// Import Firebase
import { checkAuth, getCurrentUser } from './auth.js';
import { database } from './firebase-config.js';
import { ref, push, set, update } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

// Global variables untuk pose detection
let poseLandmarker = null;
let drawingUtils = null;
let isRunning = false;
let lastTime = 0;
let frameCount = 0;
let fps = 0;
let animationFrameId = null;
let currentUser = null;
let lastSaveTime = 0;
const SAVE_INTERVAL = 5000; // Save every 5 seconds
let currentSessionRef = null; // Reference ke session yang sedang aktif
let sessionStartTime = null; // Waktu mulai session

// DOM elements
const videoElement = document.getElementById('videoElement');
const canvasElement = document.getElementById('canvasElement');
const canvasCtx = canvasElement.getContext('2d');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const toggleSettingsBtn = document.getElementById('toggleSettingsBtn');
const settingsPanel = document.getElementById('settingsPanel');
const statusIndicator = document.querySelector('.status-dot');
const statusText = document.getElementById('statusText');
const landmarkCountEl = document.getElementById('landmarkCount');
const fpsCounter = document.getElementById('fpsCounter');
const detectionStatus = document.getElementById('detectionStatus');

// REBA/RULA elements
const rebaScoreEl = document.getElementById('rebaScore');
const rebaRiskEl = document.getElementById('rebaRisk');
const rulaScoreEl = document.getElementById('rulaScore');
const rulaRiskEl = document.getElementById('rulaRisk');

// Settings elements
const minDetectionConfidence = document.getElementById('minDetectionConfidence');
const minTrackingConfidence = document.getElementById('minTrackingConfidence');
const modelComplexity = document.getElementById('modelComplexity');
const enableSmoothing = document.getElementById('enableSmoothing');
const minDetectionValue = document.getElementById('minDetectionValue');
const minTrackingValue = document.getElementById('minTrackingValue');

// POSE_CONNECTIONS untuk menggambar skeleton
// Koneksi ini sesuai dengan MediaPipe Pose Landmarker (33 landmarks)
const POSE_CONNECTIONS = [
    // Face (jika ada)
    // Upper body
    [11, 12], // Shoulders
    [11, 13], [13, 15], // Left arm
    [12, 14], [14, 16], // Right arm
    [15, 17], [15, 19], [15, 21], // Left hand connections
    [16, 18], [16, 20], [16, 22], // Right hand connections
    [17, 19], [18, 20], // Hand details
    // Torso
    [11, 23], [12, 24], // Shoulder to hip
    [23, 24], // Hips
    // Lower body
    [23, 25], [25, 27], [27, 29], [27, 31], // Left leg
    [24, 26], [26, 28], [28, 30], [28, 32], // Right leg
    [29, 31], [30, 32] // Foot connections
];

// Initialize MediaPipe Pose Landmarker
async function initializePose() {
    try {
        statusText.textContent = 'Menginisialisasi MediaPipe...';
        
        // Load MediaPipe Vision Tasks
        const vision = await FilesetResolver.forVisionTasks(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.9/wasm'
        );
        
        // Determine model path based on complexity
        const modelPaths = {
            '0': 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
            '1': 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task',
            '2': 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/1/pose_landmarker_heavy.task'
        };
        
        // Create PoseLandmarker
        poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: modelPaths[modelComplexity.value],
                delegate: 'GPU' // Use GPU if available, fallback to CPU
            },
            runningMode: 'VIDEO',
            numPoses: 1,
            minPoseDetectionConfidence: parseFloat(minDetectionConfidence.value),
            minPosePresenceConfidence: parseFloat(minTrackingConfidence.value),
            minTrackingConfidence: parseFloat(minTrackingConfidence.value)
        });
        
        // Initialize DrawingUtils
        drawingUtils = new DrawingUtils(canvasCtx);
        
        console.log('MediaPipe Pose Landmarker initialized');
        statusText.textContent = 'Siap - Klik "Mulai Tracking" untuk memulai';
    } catch (error) {
        console.error('Error initializing MediaPipe:', error);
        statusText.textContent = 'Error: Gagal menginisialisasi MediaPipe';
        alert('Error: Gagal menginisialisasi MediaPipe. Pastikan koneksi internet aktif.');
    }
}

// Function untuk memproses frame dan menggambar hasil
function processFrame() {
    if (!isRunning || !poseLandmarker) return;
    
    // Update FPS counter
    updateFPS();
    
    // Set canvas size sesuai dengan video
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;
    
    // Clear canvas
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    
    // Draw video frame ke canvas
    canvasCtx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
    
    // Detect pose
    const results = poseLandmarker.detectForVideo(videoElement, performance.now());
    
    // Draw pose landmarks jika terdeteksi
    if (results.landmarks && results.landmarks.length > 0) {
        const landmarks = results.landmarks[0];
        
        // Update landmark count
        landmarkCountEl.textContent = landmarks.length;
        detectionStatus.textContent = 'Aktif';
        detectionStatus.style.color = '#44ff44';
        
        // Calculate REBA and RULA scores
        const rebaResult = calculateREBA(landmarks);
        const rulaResult = calculateRULA(landmarks);
        
        // Update REBA/RULA display
        if (rebaScoreEl) {
            rebaScoreEl.textContent = rebaResult.score;
            rebaScoreEl.style.color = rebaResult.riskColor;
        }
        if (rebaRiskEl) {
            rebaRiskEl.textContent = rebaResult.riskLevel;
            rebaRiskEl.style.color = rebaResult.riskColor;
        }
        if (rulaScoreEl) {
            rulaScoreEl.textContent = rulaResult.score;
            rulaScoreEl.style.color = rulaResult.riskColor;
        }
        if (rulaRiskEl) {
            rulaRiskEl.textContent = rulaResult.riskLevel;
            rulaRiskEl.style.color = rulaResult.riskColor;
        }
        
        // Save to Firebase Realtime Database
        const currentTime = Date.now();
        if (currentUser && (currentTime - lastSaveTime) >= SAVE_INTERVAL) {
            saveScoresToFirebase(rebaResult, rulaResult);
            lastSaveTime = currentTime;
        }
        
        // Draw connections (skeleton) dengan warna hijau
        // Gunakan POSE_CONNECTIONS dari PoseLandmarker jika tersedia, atau gunakan yang kita definisikan
        const connections = PoseLandmarker.POSE_CONNECTIONS || POSE_CONNECTIONS;
        drawingUtils.drawConnectors(landmarks, connections, {
            color: '#00FF00',
            lineWidth: 2
        });
        
        // Draw landmarks (keypoints) dengan warna merah
        drawingUtils.drawLandmarks(landmarks, {
            color: '#FF0000',
            radius: 4
        });
    } else {
        // Tidak ada pose yang terdeteksi
        landmarkCountEl.textContent = '0';
        detectionStatus.textContent = 'Tidak Terdeteksi';
        detectionStatus.style.color = '#ff4444';
        
        // Reset REBA/RULA scores
        if (rebaScoreEl) {
            rebaScoreEl.textContent = '0';
            rebaScoreEl.style.color = '#999';
        }
        if (rebaRiskEl) {
            rebaRiskEl.textContent = 'N/A';
            rebaRiskEl.style.color = '#999';
        }
        if (rulaScoreEl) {
            rulaScoreEl.textContent = '0';
            rulaScoreEl.style.color = '#999';
        }
        if (rulaRiskEl) {
            rulaRiskEl.textContent = 'N/A';
            rulaRiskEl.style.color = '#999';
        }
    }
    
    canvasCtx.restore();
    
    // Continue processing frames
    if (isRunning) {
        animationFrameId = requestAnimationFrame(processFrame);
    }
}

// Function untuk update FPS counter
function updateFPS() {
    frameCount++;
    const currentTime = performance.now();
    const elapsed = currentTime - lastTime;
    
    if (elapsed >= 1000) {
        fps = Math.round((frameCount * 1000) / elapsed);
        fpsCounter.textContent = fps;
        frameCount = 0;
        lastTime = currentTime;
    }
}

// Function untuk memulai pose tracking
async function startPoseTracking() {
    if (isRunning || !poseLandmarker) return;
    
    try {
        // Request camera access
        statusText.textContent = 'Meminta akses kamera...';
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });
        
        // Set video source
        videoElement.srcObject = stream;
        
        // Wait for video to be ready
        await new Promise((resolve) => {
            videoElement.onloadedmetadata = () => {
                videoElement.play();
                resolve();
            };
        });
        
        // Create new session di Firebase saat start tracking
        if (currentUser) {
            const sessionsRef = ref(database, `users/${currentUser.uid}/sessions`);
            currentSessionRef = push(sessionsRef);
            sessionStartTime = Date.now();
            
            // Initialize session dengan data awal
            const initialSessionData = {
                startTime: sessionStartTime,
                lastUpdate: sessionStartTime,
                rebaScore: 0,
                rulaScore: 0,
                rebaRiskLevel: 'N/A',
                rulaRiskLevel: 'N/A',
                duration: 0
            };
            
            await set(currentSessionRef, initialSessionData);
            console.log('New session created in Firebase:', currentSessionRef.key);
        }
        
        // Update UI
        startBtn.disabled = true;
        stopBtn.disabled = false;
        statusText.textContent = 'Tracking aktif';
        statusIndicator.classList.add('active');
        detectionStatus.textContent = 'Memulai...';
        
        // Start processing frames
        isRunning = true;
        lastTime = performance.now();
        frameCount = 0;
        lastSaveTime = Date.now(); // Reset save time
        processFrame();
        
        console.log('Pose tracking started');
    } catch (error) {
        console.error('Error starting pose tracking:', error);
        statusText.textContent = 'Error: ' + error.message;
        statusIndicator.classList.remove('active');
        startBtn.disabled = false;
        stopBtn.disabled = true;
        alert('Error: Gagal mengakses kamera. Pastikan kamera tersedia dan izin diberikan.');
    }
}

// Function untuk menghentikan pose tracking
async function stopPoseTracking() {
    if (!isRunning) return;
    
    // Stop animation frame
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    
    // Stop camera stream
    if (videoElement.srcObject) {
        const tracks = videoElement.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        videoElement.srcObject = null;
    }
    
    // Finalize session di Firebase saat stop tracking
    if (currentSessionRef && sessionStartTime) {
        try {
            const finalSessionData = {
                endTime: Date.now(),
                lastUpdate: Date.now(),
                duration: Date.now() - sessionStartTime,
                status: 'completed'
            };
            
            await update(currentSessionRef, finalSessionData);
            console.log('Session finalized in Firebase');
        } catch (error) {
            console.error('Error finalizing session:', error);
        }
        
        // Reset session references
        currentSessionRef = null;
        sessionStartTime = null;
    }
    
    // Clear canvas
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    
    // Update UI
    isRunning = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    statusText.textContent = 'Dihentikan';
    statusIndicator.classList.remove('active');
    landmarkCountEl.textContent = '0';
    fpsCounter.textContent = '0';
    detectionStatus.textContent = 'Tidak Aktif';
    detectionStatus.style.color = '#666';
    
    // Reset REBA/RULA scores
    if (rebaScoreEl) {
        rebaScoreEl.textContent = '0';
        rebaScoreEl.style.color = '#999';
    }
    if (rebaRiskEl) {
        rebaRiskEl.textContent = 'N/A';
        rebaRiskEl.style.color = '#999';
    }
    if (rulaScoreEl) {
        rulaScoreEl.textContent = '0';
        rulaScoreEl.style.color = '#999';
    }
    if (rulaRiskEl) {
        rulaRiskEl.textContent = 'N/A';
        rulaRiskEl.style.color = '#999';
    }
    
    console.log('Pose tracking stopped');
}

// Event listeners untuk buttons
startBtn.addEventListener('click', startPoseTracking);
stopBtn.addEventListener('click', stopPoseTracking);

// Toggle settings panel
toggleSettingsBtn.addEventListener('click', () => {
    settingsPanel.classList.toggle('hidden');
});

// Event listeners untuk settings
minDetectionConfidence.addEventListener('input', (e) => {
    minDetectionValue.textContent = e.target.value;
    // Reinitialize pose landmarker dengan settings baru
    if (poseLandmarker) {
        initializePose();
    }
});

minTrackingConfidence.addEventListener('input', (e) => {
    minTrackingValue.textContent = e.target.value;
    // Reinitialize pose landmarker dengan settings baru
    if (poseLandmarker) {
        initializePose();
    }
});

modelComplexity.addEventListener('change', (e) => {
    // Reinitialize pose landmarker dengan model complexity baru
    if (poseLandmarker) {
        initializePose();
    }
});

enableSmoothing.addEventListener('change', (e) => {
    // Smoothing is handled by MediaPipe internally
    console.log('Smoothing:', e.target.checked);
});

// Function untuk menyimpan skor ke Firebase Realtime Database
async function saveScoresToFirebase(rebaResult, rulaResult) {
    if (!currentUser || !currentSessionRef) return;
    
    try {
        // Update session yang sama dengan data terbaru
        const sessionData = {
            lastUpdate: Date.now(),
            rebaScore: rebaResult.score,
            rulaScore: rulaResult.score,
            rebaRiskLevel: rebaResult.riskLevel,
            rulaRiskLevel: rulaResult.riskLevel,
            rebaComponents: rebaResult.components,
            rulaComponents: rulaResult.components,
            duration: Date.now() - sessionStartTime // Durasi session dalam milliseconds
        };
        
        // Update session yang sama (bukan membuat baru)
        await update(currentSessionRef, sessionData);
        
        console.log('Scores updated in Firebase');
    } catch (error) {
        console.error('Error updating scores in Firebase:', error);
    }
}

// Check authentication on page load
window.addEventListener('load', async () => {
    console.log('Initializing application...');
    
    // Check if user is authenticated
    currentUser = await checkAuth();
    if (!currentUser) {
        // Redirect to login if not authenticated
        window.location.href = 'login.html';
        return;
    }
    
    console.log('User authenticated:', currentUser.email);
    initializePose();
});

// Cleanup saat halaman ditutup
window.addEventListener('beforeunload', () => {
    stopPoseTracking();
});

