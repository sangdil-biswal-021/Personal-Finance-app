const express = require('express');
const router = express.Router();
const plaidClient = require('../config/plaidConfig');
const { savePlaidAccessToken, getPlaidAccessToken } = require('../models/userModel');

// Generate Link Token
router.post('/create_link_token', async (req, res) => {
  try {
    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: req.user.uid },
      client_name: 'Your Finance App',
      products: ['auth', 'transactions'],
      country_codes: ['US'],
      language: 'en'
    });
    res.json({ link_token: response.data.link_token });
  } catch (error) {
    console.error('Error creating link token:', error);
    res.status(500).json({ error: error.message });
  }
});

// Exchange Public Token
router.post('/exchange_public_token', async (req, res) => {
  try {
    const { publicToken } = req.body;
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken
    });
    
    // Store access_token in your database associated with the user
    await savePlaidAccessToken(req.user.uid, response.data.access_token);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error exchanging public token:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Accounts
router.get('/accounts/:userId', async (req, res) => {
  try {
    const accessToken = await getPlaidAccessToken(req.params.userId);
    if (!accessToken) {
      return res.status(404).json({ error: 'No linked accounts found' });
    }
    
    const response = await plaidClient.accountsGet({
      access_token: accessToken
    });
    
    res.json(response.data.accounts.map(acc => ({
      id: acc.account_id,
      name: acc.name,
      type: acc.type,
      balances: acc.balances
    })));
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
