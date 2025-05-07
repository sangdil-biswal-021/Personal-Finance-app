const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

const db = admin.database();

// Save Plaid access token to Firebase
const savePlaidAccessToken = async (userId, accessToken) => {
  try {
    await db.ref(`users/${userId}/plaidAccess`).set({
      accessToken,
      createdAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error saving access token:', error);
    throw error;
  }
};

// Get Plaid access token from Firebase
const getPlaidAccessToken = async (userId) => {
  try {
    const snapshot = await db.ref(`users/${userId}/plaidAccess`).once('value');
    const data = snapshot.val();
    return data ? data.accessToken : null;
  } catch (error) {
    console.error('Error fetching access token:', error);
    throw error;
  }
};

module.exports = { savePlaidAccessToken, getPlaidAccessToken };
