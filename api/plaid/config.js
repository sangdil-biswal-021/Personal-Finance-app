import { auth } from '../firebase/config';

// Update with your actual backend URL
const API_BASE = 'http://localhost:5000/api/plaid';

export async function getPlaidLinkToken() {
  try {
    const token = await auth.currentUser.getIdToken();
    const res = await fetch(`${API_BASE}/create_link_token`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data.link_token;
  } catch (error) {
    console.error('Error getting link token:', error);
    throw error;
  }
}

export async function exchangePlaidToken(publicToken) {
  try {
    const token = await auth.currentUser.getIdToken();
    const res = await fetch(`${API_BASE}/exchange_public_token`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ publicToken })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data.success;
  } catch (error) {
    console.error('Error exchanging token:', error);
    throw error;
  }
}

export async function getBankAccounts() {
  try {
    const token = await auth.currentUser.getIdToken();
    const userId = auth.currentUser.uid;
    const res = await fetch(`${API_BASE}/accounts/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return [];
  }
}
