const express = require('express');
const mysql = require('mysql');
const router = express.Router();

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'admin_password_123', // VULNERABILITY: Hardcoded database password
  database: 'test_db'
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // VULNERABILITY: SQL Injection (Code Pattern Analysis)
  // BegXSecure should flag this unsanitized string interpolation in a SQL query.
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  
  connection.query(query, (error, results) => {
    if (error) throw error;
    if (results.length > 0) {
      res.json({ success: true, token: "dummy_token" });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  });
});

router.get('/profile', (req, res) => {
  const { debug } = req.query;

  // VULNERABILITY: XSS Vector via raw HTML injection (Code Pattern Analysis)
  if (debug === "true") {
      res.send(`<h1>Debug Mode Active</h1><p>Query params: ${req.url}</p>`); 
  } else {
      res.send("Profile page");
  }
});

module.exports = router;
