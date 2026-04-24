/* ============================================================
   SHIVA EDITOR - FIREBASE SERVICES
   ============================================================ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBeiIUdVEv5kvJ6GFSzWZwFav8Nx3Mxhkg",
  authDomain: "code-editor-ai.firebaseapp.com",
  projectId: "code-editor-ai",
  storageBucket: "code-editor-ai.firebasestorage.app",
  messagingSenderId: "145185559673",
  appId: "1:145185559673:web:5646addc66bb365209b0a8",
  measurementId: "G-CYWKWQJGP0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Saves current code to Firestore 'projects/user_code'
 */
export async function saveCodeToCloud(code) {
  const statusIcon = document.querySelector("#syncStatus i");
  const statusText = document.querySelector("#syncStatus");
  
  if (!statusText) return;

  try {
    // Start spinning animation
    if (statusIcon) statusIcon.classList.add("spinning");
    
    await setDoc(doc(db, "projects", "user_code"), {
      content: code,
      lastUpdated: new Date()
    });

    // Success state
    if (statusIcon) {
      statusIcon.classList.remove("spinning");
      statusIcon.className = "ph ph-cloud-check";
    }
    statusText.innerHTML = `<i class="ph ph-cloud-check"></i> Cloud Synced`;
  } catch (e) {
    console.error("Firebase Save Error:", e);
    if (statusIcon) {
      statusIcon.classList.remove("spinning");
      statusIcon.className = "ph ph-cloud-warning";
    }
    statusText.innerHTML = `<i class="ph ph-cloud-warning"></i> Save Failed`;
  }
}

/**
 * Loads code from Firestore
 */
export async function loadCodeFromCloud() {
  try {
    const docSnap = await getDoc(doc(db, "projects", "user_code"));
    if (docSnap.exists()) {
      return docSnap.data().content;
    }
    return null;
  } catch (e) {
    console.error("Firebase Load Error:", e);
    return null;
  }
}

// Global window exposure (for non-module scripts)
window.saveCloud = saveCodeToCloud;
window.loadCloud = loadCodeFromCloud;
