const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Parser } = require('json2csv');

const JWT_SECRET = process.env.JWT_SECRET;

// Password validation regex (example: at least 8 characters, 1 uppercase, 1 lowercase, 1 number)
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

exports.createUser = async (req, res) => {
    try {
        const { email, name, mobileNumber, password } = req.body;

        // Validate password strength
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long, contain an uppercase letter, a lowercase letter, and a number.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = 'INSERT INTO users (email, name, mobile_number, password) VALUES (?, ?, ?, ?)';
        db.execute(query, [email, name, mobileNumber, hashedPassword], (err, results) => {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            res.status(201).json({ id: results.insertId });
        });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const query = 'SELECT * FROM users WHERE email = ?';
        db.execute(query, [email], async (err, results) => {
            if (err || results.length === 0) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            const user = results[0];

            // Check password
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            // Generate JWT token
            const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
            res.json({ token });
        });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getUser = (req, res) => {
    try {
        const query = 'SELECT name, email, mobile_number FROM users WHERE id = ?';
        db.execute(query, [req.params.id], (err, results) => {
            if (err || results.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json(results[0]);
        });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getBalanceSheet = (req, res) => {
    try {
        const userId = req.params.id;

        const query = `
            SELECT user_id, share FROM expense_shares WHERE user_id = ?
        `;

        db.execute(query, [userId], (err, results) => {
            if (err) {
                return res.status(400).json({ error: err.message });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: "No expenses found for this user." });
            }

            // Convert results to CSV
            const fields = ['share', 'user_id'];
            const json2csvParser = new Parser({ fields });
            const csv = json2csvParser.parse(results);

            // Set the response headers
            res.header('Content-Type', 'text/csv');
            res.attachment('balance_sheet.csv');
            res.send(csv);
        });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
};
