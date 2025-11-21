// Authentication helper functions
import { auth } from './firebase-config.js';
import { 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    signInWithPopup,
    GoogleAuthProvider
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Check if user is authenticated
export function checkAuth() {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, (user) => {
            resolve(user);
        });
    });
}

// Get current user
export function getCurrentUser() {
    return auth.currentUser;
}

// Login user
export async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Register user
export async function registerUser(email, password, displayName) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Update display name
        if (displayName) {
            await updateProfile(userCredential.user, { displayName });
        }
        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Logout user
export async function logoutUser() {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Login with Google
export async function loginWithGoogle() {
    try {
        console.log('Attempting Google Sign-In...');
        const result = await signInWithPopup(auth, googleProvider);
        console.log('Google Sign-In successful:', result.user.email);
        return { success: true, user: result.user };
    } catch (error) {
        console.error('Google Sign-In error:', error);
        
        // Provide more user-friendly error messages
        let errorMessage = 'Login dengan Google gagal. ';
        
        if (error.code === 'auth/popup-closed-by-user') {
            errorMessage += 'Popup ditutup. Silakan coba lagi.';
        } else if (error.code === 'auth/popup-blocked') {
            errorMessage += 'Popup diblokir browser. Izinkan popup untuk domain ini.';
        } else if (error.code === 'auth/unauthorized-domain') {
            errorMessage += 'Domain tidak diizinkan. Hubungi administrator.';
        } else if (error.code === 'auth/operation-not-allowed') {
            errorMessage += 'Google Sign-In belum diaktifkan. Hubungi administrator.';
        } else {
            errorMessage += error.message || 'Terjadi kesalahan. Coba lagi.';
        }
        
        return { success: false, error: errorMessage, code: error.code };
    }
}

// Auth state listener
export function onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
}

