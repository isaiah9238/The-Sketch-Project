import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../libs/firebase-init.js';

export async function handleGoogleLogin() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // This object matches standard user data structures perfectly
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email || "Surveyor",
      photoURL: user.photoURL,
    };
  } catch (error) {
    console.error("Strict Auth Initiation Failed:", error);
    throw error;
  }
}

export async function handleLogout() {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Logout Failed:", error);
    }
}
