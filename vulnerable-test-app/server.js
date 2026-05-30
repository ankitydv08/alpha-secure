const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();

// VULNERABILITY: CORS Wildcard (allows any origin to access the API)
// BegXSecure should flag this as a missing security header / bad config.
app.use(cors({ origin: '*' }));

// VULNERABILITY: Missing Helmet (no security headers)
// BegXSecure should flag missing Helmet middleware.

// VULNERABILITY: Hardcoded JWT Secret (Secret Detection)
const JWT_SECRET = "super_secret_admin_key_12345!";

// VULNERABILITY: Hardcoded AWS Key (Secret Detection)
const AWS_ACCESS_KEY_ID = "AKIAIOSFODNN7EXAMPLE";
const AWS_SECRET_ACCESS_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";

// Dummy Route
app.get('/', (req, res) => {
  res.send('Welcome to the vulnerable test API!');
});

// VULNERABILITY: eval() execution (Code Pattern Analysis)
app.post('/calculate', (req, res) => {
  const { formula } = req.body;
  // This is extremely dangerous and allows Remote Code Execution (RCE)
  const result = eval(formula); 
  res.json({ result });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
