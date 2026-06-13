import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAI, getGenerativeModel, GoogleAIBackend, Schema } from "firebase/ai";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: `${import.meta.env.VITE_FIREBASE_API_KEY}`,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}`,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  messagingSenderId: `${import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID}`,
  appId: `${import.meta.env.VITE_APP_ID}`,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Force the Google login to ask for account selection every time (great for testing)
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize the Firebase AI Logic service (Gemini Developer API)
export const ai = getAI(app, { backend: new GoogleAIBackend() });

// Define structured output schema for land surveying traverse steps
const traverseVectorSchema = Schema.object({
  properties: {
    azimuth: Schema.number({ description: "Direction angle of the line in degrees (0 to 360)" }),
    distance: Schema.number({ description: "Distance or length of the line in feet or meters" })
  },
  required: ["azimuth", "distance"]
});

const traverseListSchema = Schema.array({
  description: "An array of geodetic traverse vector steps parsed from text field notes",
  items: traverseVectorSchema
});

// Configure and export the Gemini 3.5 Flash model for structured JSON response
export const aiModel = getGenerativeModel(ai, {
  model: "gemini-3.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: traverseListSchema,
    temperature: 0.1
  },
  systemInstruction: "You are an expert land surveying parsing engine. Read the natural language input, extract each boundary line's azimuth (bearing/direction) and distance, and output them as a structured list of traverse vectors. If there is a note that doesn't contain any traverse vector information, return an empty array."
});