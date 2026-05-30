import {cert, getApps, initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth'
import { getFirestore } from "firebase-admin/firestore";

const initFirebaseAdmin = () => {
    const apps = getApps();
    if (!apps.length) {
        try {
            const privateKey = process.env.FIREBASE_PRIVATE_KEY;
            if (!privateKey) {
                throw new Error('FIREBASE_PRIVATE_KEY environment variable is not set');
            }

            // Properly handle escaped newlines in the private key
            const formattedPrivateKey = privateKey
                .replace(/\\n/g, '\n')
                .replace(/^"(.*)"$/, '$1'); // Remove quotes if present

            initializeApp({
                credential: cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: formattedPrivateKey,
                })
            });
        } catch (error) {
            console.error('Failed to initialize Firebase Admin:', error);
            throw error;
        }
    }
    return {
        auth: getAuth(),
        db: getFirestore()
    };
};

export const { auth, db } = initFirebaseAdmin();

