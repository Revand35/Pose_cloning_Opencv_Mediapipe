import { checkAuth, getCurrentUser, logoutUser } from './auth.js';
import { database } from './firebase-config.js';
import { ref, get } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

// Check authentication
checkAuth().then(user => {
    if (!user) {
        window.location.href = 'login.html';
    } else {
        loadUserData(user);
    }
});

async function loadUserData(user) {
    // Display user info
    document.getElementById('displayName').textContent = user.displayName || 'Tidak ada nama';
    document.getElementById('userEmail').textContent = user.email || '-';
    document.getElementById('userId').textContent = user.uid.substring(0, 8) + '...';
    
    // Load statistics
    try {
        const userRef = ref(database, `users/${user.uid}/sessions`);
        const snapshot = await get(userRef);
        
        if (snapshot.exists()) {
            const sessions = snapshot.val();
            const sessionCount = Object.keys(sessions).length;
            document.getElementById('totalSessions').textContent = sessionCount;
            
            // Calculate averages
            let totalReba = 0;
            let totalRula = 0;
            let count = 0;
            
            Object.values(sessions).forEach(session => {
                if (session.rebaScore) {
                    totalReba += session.rebaScore;
                    count++;
                }
                if (session.rulaScore) {
                    totalRula += session.rulaScore;
                }
            });
            
            if (count > 0) {
                document.getElementById('avgReba').textContent = (totalReba / count).toFixed(1);
                document.getElementById('avgRula').textContent = (totalRula / count).toFixed(1);
            }
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

document.getElementById('logoutBtn').addEventListener('click', async () => {
    const result = await logoutUser();
    if (result.success) {
        window.location.href = 'login.html';
    }
});

