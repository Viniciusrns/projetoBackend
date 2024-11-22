import admin from "firebase-admin";
import fs from 'fs';

const serviceAccountPath = "./src/database/tccvinicius-a1fa0-firebase-adminsdk-wv8pb-9447136358.json";

let serviceAccount;

try {
  serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
} catch (error) {
  console.error("Erro ao ler o arquivo de credenciais do Firebase:", error);
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} else {
  console.log("Firebase Admin já inicializado");
}

export const authAdmin = admin.auth();
export const db = admin.firestore();
