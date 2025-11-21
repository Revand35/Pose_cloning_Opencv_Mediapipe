// REBA (Rapid Entire Body Assessment) dan RULA (Rapid Upper Limb Assessment) Calculator
// Berdasarkan pose landmarks dari MediaPipe

/**
 * MediaPipe Pose Landmark Indices:
 * 0-10: Face
 * 11: Left shoulder
 * 12: Right shoulder
 * 13: Left elbow
 * 14: Right elbow
 * 15: Left wrist
 * 16: Right wrist
 * 17-22: Hand landmarks
 * 23: Left hip
 * 24: Right hip
 * 25: Left knee
 * 26: Right knee
 * 27: Left ankle
 * 28: Right ankle
 * 29-32: Foot landmarks
 */

// Smoothing buffer untuk mengurangi noise
let angleHistory = {
    neck: [],
    trunk: [],
    leftArm: [],
    rightArm: [],
    leftWrist: [],
    rightWrist: [],
    leftLeg: [],
    rightLeg: []
};

const HISTORY_SIZE = 5; // Jumlah frame untuk smoothing

// Helper function untuk menghitung sudut antara 3 titik (dalam derajat)
function calculateAngle(point1, point2, point3) {
    // point2 adalah vertex (titik tengah)
    const radians = Math.atan2(
        point3.y - point2.y,
        point3.x - point2.x
    ) - Math.atan2(
        point1.y - point2.y,
        point1.x - point2.x
    );
    
    let angle = Math.abs(radians * 180.0 / Math.PI);
    if (angle > 180.0) {
        angle = 360 - angle;
    }
    return angle;
}

// Helper function untuk menghitung sudut dari vertikal (0 = vertikal ke bawah, 90 = horizontal)
function calculateAngleFromVertical(point1, point2) {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    // atan2(dx, dy) memberikan sudut dari vertikal (ke bawah)
    const angle = Math.abs(Math.atan2(dx, dy) * 180.0 / Math.PI);
    return angle;
}

// Helper function untuk smoothing angle
function smoothAngle(angle, historyKey) {
    angleHistory[historyKey].push(angle);
    if (angleHistory[historyKey].length > HISTORY_SIZE) {
        angleHistory[historyKey].shift();
    }
    
    if (angleHistory[historyKey].length === 0) return angle;
    
    const sum = angleHistory[historyKey].reduce((a, b) => a + b, 0);
    return sum / angleHistory[historyKey].length;
}

/**
 * REBA Assessment Functions
 */

// Menilai postur leher (REBA) - lebih akurat
function assessNeckPosture(landmarks) {
    const nose = landmarks[0];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    
    if (!nose || !leftShoulder || !rightShoulder) return 1;
    
    const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
    const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
    
    // Hitung deviasi vertikal (fleksi/ekstensi leher)
    const verticalDeviation = Math.abs(nose.y - shoulderMidY);
    const horizontalDeviation = Math.abs(nose.x - shoulderMidX);
    
    // Hitung sudut leher dari vertikal
    const neckAngle = calculateAngleFromVertical(
        {x: shoulderMidX, y: shoulderMidY},
        {x: nose.x, y: nose.y}
    );
    
    const smoothedAngle = smoothAngle(neckAngle, 'neck');
    
    // Leher netral: 0-15 derajat dari vertikal
    if (smoothedAngle < 15 || smoothedAngle > 165) return 1;
    // Leher sedikit fleksi: 15-30 derajat
    if ((smoothedAngle >= 15 && smoothedAngle < 30) || (smoothedAngle > 150 && smoothedAngle <= 165)) return 2;
    // Leher fleksi sedang: 30-45 derajat
    if ((smoothedAngle >= 30 && smoothedAngle < 45) || (smoothedAngle > 135 && smoothedAngle <= 150)) return 3;
    // Leher fleksi berat: >45 derajat
    return 4;
}

// Menilai postur batang tubuh/trunk (REBA) - lebih akurat
function assessTrunkPosture(landmarks) {
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    
    if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) return 1;
    
    const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
    const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
    const hipMidX = (leftHip.x + rightHip.x) / 2;
    const hipMidY = (leftHip.y + rightHip.y) / 2;
    
    // Hitung sudut trunk dari vertikal
    const trunkAngle = calculateAngleFromVertical(
        {x: hipMidX, y: hipMidY},
        {x: shoulderMidX, y: shoulderMidY}
    );
    
    const smoothedAngle = smoothAngle(trunkAngle, 'trunk');
    
    // Trunk netral: 0-20 derajat dari vertikal
    if (smoothedAngle < 20) return 1;
    // Trunk sedikit fleksi: 20-45 derajat
    if (smoothedAngle >= 20 && smoothedAngle < 45) return 2;
    // Trunk fleksi sedang: 45-60 derajat
    if (smoothedAngle >= 45 && smoothedAngle < 60) return 3;
    // Trunk fleksi berat: >60 derajat
    return 4;
}

// Menilai postur lengan (REBA) - lebih akurat
function assessArmPosture(landmarks, side = 'left') {
    const shoulderIdx = side === 'left' ? 11 : 12;
    const elbowIdx = side === 'left' ? 13 : 14;
    
    const shoulder = landmarks[shoulderIdx];
    const elbow = landmarks[elbowIdx];
    
    if (!shoulder || !elbow) return 1;
    
    // Hitung sudut lengan atas dari vertikal
    const upperArmAngle = calculateAngleFromVertical(shoulder, elbow);
    const historyKey = side === 'left' ? 'leftArm' : 'rightArm';
    const smoothedAngle = smoothAngle(upperArmAngle, historyKey);
    
    // Lengan di samping tubuh (0-20 derajat dari vertikal)
    if (smoothedAngle < 20 || smoothedAngle > 160) return 1;
    // Lengan sedikit terangkat (20-45 derajat)
    if ((smoothedAngle >= 20 && smoothedAngle < 45) || (smoothedAngle > 135 && smoothedAngle <= 160)) return 2;
    // Lengan terangkat sedang (45-90 derajat)
    if ((smoothedAngle >= 45 && smoothedAngle < 90) || (smoothedAngle > 90 && smoothedAngle <= 135)) return 3;
    // Lengan terangkat tinggi (sekitar 90 derajat horizontal)
    return 4;
}

// Menilai postur pergelangan tangan (REBA) - lebih akurat
function assessWristPosture(landmarks, side = 'left') {
    const elbowIdx = side === 'left' ? 13 : 14;
    const wristIdx = side === 'left' ? 15 : 16;
    const handIdx = side === 'left' ? 19 : 20; // Index finger tip
    
    const elbow = landmarks[elbowIdx];
    const wrist = landmarks[wristIdx];
    const hand = landmarks[handIdx];
    
    if (!elbow || !wrist) return 1;
    
    // Jika hand landmark tidak tersedia, gunakan wrist saja
    if (!hand) {
        // Hitung sudut pergelangan tangan dari lengan bawah
        const forearmAngle = calculateAngleFromVertical(elbow, wrist);
        // Asumsikan netral jika tidak ada data hand
        return 1;
    }
    
    // Hitung sudut pergelangan tangan
    const wristAngle = calculateAngle(elbow, wrist, hand);
    const historyKey = side === 'left' ? 'leftWrist' : 'rightWrist';
    const smoothedAngle = smoothAngle(wristAngle, historyKey);
    
    // Pergelangan tangan netral: 160-200 derajat (hampir lurus)
    if (smoothedAngle > 160 && smoothedAngle < 200) return 1;
    // Pergelangan tangan sedikit deviasi: 140-160 atau 200-220 derajat
    if ((smoothedAngle >= 140 && smoothedAngle <= 160) || (smoothedAngle >= 200 && smoothedAngle <= 220)) return 2;
    // Pergelangan tangan deviasi berat: <140 atau >220 derajat
    return 3;
}

// Menilai postur kaki (REBA) - lebih akurat
function assessLegPosture(landmarks, side = 'left') {
    const hipIdx = side === 'left' ? 23 : 24;
    const kneeIdx = side === 'left' ? 25 : 26;
    const ankleIdx = side === 'left' ? 27 : 28;
    
    const hip = landmarks[hipIdx];
    const knee = landmarks[kneeIdx];
    const ankle = landmarks[ankleIdx];
    
    if (!hip || !knee || !ankle) return 1;
    
    // Hitung sudut lutut
    const kneeAngle = calculateAngle(hip, knee, ankle);
    const historyKey = side === 'left' ? 'leftLeg' : 'rightLeg';
    const smoothedAngle = smoothAngle(kneeAngle, historyKey);
    
    // Kaki lurus: 160-180 derajat
    if (smoothedAngle >= 160 && smoothedAngle <= 180) return 1;
    // Kaki sedikit fleksi: 120-160 derajat
    if (smoothedAngle >= 120 && smoothedAngle < 160) return 2;
    // Kaki fleksi sedang: 90-120 derajat
    if (smoothedAngle >= 90 && smoothedAngle < 120) return 3;
    // Kaki fleksi berat: <90 derajat
    return 4;
}

/**
 * Menghitung skor REBA dengan formula yang lebih akurat
 * @param {Array} landmarks - Array of pose landmarks dari MediaPipe
 * @returns {Object} - Object berisi skor REBA dan detail komponen
 */
export function calculateREBA(landmarks) {
    if (!landmarks || landmarks.length < 33) {
        return {
            score: 0,
            riskLevel: 'N/A',
            riskColor: '#999',
            components: {}
        };
    }
    
    // Hitung skor untuk setiap komponen
    const neckScore = assessNeckPosture(landmarks);
    const trunkScore = assessTrunkPosture(landmarks);
    const leftArmScore = assessArmPosture(landmarks, 'left');
    const rightArmScore = assessArmPosture(landmarks, 'right');
    const leftWristScore = assessWristPosture(landmarks, 'left');
    const rightWristScore = assessWristPosture(landmarks, 'right');
    const leftLegScore = assessLegPosture(landmarks, 'left');
    const rightLegScore = assessLegPosture(landmarks, 'right');
    
    // Gunakan skor tertinggi untuk lengan dan pergelangan tangan
    const armScore = Math.max(leftArmScore, rightArmScore);
    const wristScore = Math.max(leftWristScore, rightWristScore);
    const legScore = Math.max(leftLegScore, rightLegScore);
    
    // Formula REBA yang lebih akurat
    // Group A: Trunk + Leg
    const groupA = trunkScore + legScore;
    
    // Group B: Arm + Wrist
    const groupB = armScore + wristScore;
    
    // Lookup table untuk REBA (simplified)
    // Group A score (1-8) + Group B score (1-6) + Neck (1-4)
    let rebaScore = 0;
    
    // Calculate base score
    if (groupA <= 2 && groupB <= 2) {
        rebaScore = 1;
    } else if (groupA <= 3 && groupB <= 3) {
        rebaScore = 2;
    } else if (groupA <= 4 && groupB <= 4) {
        rebaScore = 3;
    } else if (groupA <= 5 && groupB <= 5) {
        rebaScore = 4;
    } else if (groupA <= 6 && groupB <= 6) {
        rebaScore = 5;
    } else if (groupA <= 7 && groupB <= 7) {
        rebaScore = 6;
    } else {
        rebaScore = 7;
    }
    
    // Add neck score
    rebaScore += neckScore - 1;
    
    // Add load/activity modifiers (default: no load, static)
    // In real REBA, this would be based on actual load and activity
    
    // Normalisasi skor ke range 1-15
    rebaScore = Math.min(15, Math.max(1, rebaScore));
    
    // Tentukan level risiko
    let riskLevel, riskColor;
    if (rebaScore <= 3) {
        riskLevel = 'Acceptable';
        riskColor = '#10b981'; // Green
    } else if (rebaScore <= 7) {
        riskLevel = 'Investigate';
        riskColor = '#f59e0b'; // Yellow/Orange
    } else {
        riskLevel = 'Action Required';
        riskColor = '#ef4444'; // Red
    }
    
    return {
        score: rebaScore,
        riskLevel: riskLevel,
        riskColor: riskColor,
        components: {
            neck: neckScore,
            trunk: trunkScore,
            arm: armScore,
            wrist: wristScore,
            leg: legScore
        }
    };
}

/**
 * Menghitung skor RULA dengan formula yang lebih akurat
 * @param {Array} landmarks - Array of pose landmarks dari MediaPipe
 * @returns {Object} - Object berisi skor RULA dan detail komponen
 */
export function calculateRULA(landmarks) {
    if (!landmarks || landmarks.length < 33) {
        return {
            score: 0,
            riskLevel: 'N/A',
            riskColor: '#999',
            components: {}
        };
    }
    
    // Hitung skor untuk setiap komponen
    const neckScore = assessNeckPosture(landmarks);
    const trunkScore = assessTrunkPosture(landmarks);
    const leftArmScore = assessArmPosture(landmarks, 'left');
    const rightArmScore = assessArmPosture(landmarks, 'right');
    const leftWristScore = assessWristPosture(landmarks, 'left');
    const rightWristScore = assessWristPosture(landmarks, 'right');
    
    // Gunakan skor tertinggi
    const armScore = Math.max(leftArmScore, rightArmScore);
    const wristScore = Math.max(leftWristScore, rightWristScore);
    
    // Formula RULA yang lebih akurat
    // Upper arm + Lower arm + Wrist
    const upperLimbScore = armScore + wristScore;
    
    // Neck + Trunk
    const bodyScore = neckScore + trunkScore;
    
    // RULA scoring (simplified lookup table)
    let rulaScore = 0;
    
    if (upperLimbScore <= 2 && bodyScore <= 2) {
        rulaScore = 1;
    } else if (upperLimbScore <= 3 && bodyScore <= 3) {
        rulaScore = 2;
    } else if (upperLimbScore <= 4 && bodyScore <= 4) {
        rulaScore = 3;
    } else if (upperLimbScore <= 5 && bodyScore <= 5) {
        rulaScore = 4;
    } else if (upperLimbScore <= 6 && bodyScore <= 6) {
        rulaScore = 5;
    } else {
        rulaScore = 6;
    }
    
    // Normalisasi skor ke range 1-7
    rulaScore = Math.min(7, Math.max(1, rulaScore));
    
    // Tentukan level risiko
    let riskLevel, riskColor;
    if (rulaScore <= 2) {
        riskLevel = 'Acceptable';
        riskColor = '#10b981'; // Green
    } else if (rulaScore <= 4) {
        riskLevel = 'Investigate';
        riskColor = '#f59e0b'; // Yellow/Orange
    } else {
        riskLevel = 'Action Required';
        riskColor = '#ef4444'; // Red
    }
    
    return {
        score: rulaScore,
        riskLevel: riskLevel,
        riskColor: riskColor,
        components: {
            neck: neckScore,
            trunk: trunkScore,
            arm: armScore,
            wrist: wristScore
        }
    };
}
