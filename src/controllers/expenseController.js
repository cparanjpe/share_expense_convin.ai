const db = require('../config/db');

// Add expense with split methods
exports.addExpense = async (req, res) => {
    try {
        const { amount, userId, participants, splitMethod } = req.body;

        // Validate and prepare participant data
        let totalShare = 0;
        const shareData = [];

        if (splitMethod === 'equal') {
            const totalParticipants = participants.length;
            const share = (amount / totalParticipants).toFixed(2);
            participants.forEach(participant => {
                shareData.push({ userId: participant.userId, share: parseFloat(share) });
                totalShare += parseFloat(share);
            });
        } else if (splitMethod === 'exact') {
            participants.forEach(participant => {
                shareData.push({ userId: participant.userId, share: participant.share });
                totalShare += participant.share;
            });
            if (totalShare !== amount) {
                return res.status(400).json({ error: 'Exact shares must total the expense amount' });
            }
        } else if (splitMethod === 'percentage') {
            participants.forEach(participant => {
                const share = ((participant.percentage / 100) * amount).toFixed(2);
                shareData.push({ userId: participant.userId, share: parseFloat(share) });
                totalShare += parseFloat(share);
            });
            if (totalShare !== amount) {
                return res.status(400).json({ error: 'Calculated shares must equal the expense amount' });
            }
        } else {
            return res.status(400).json({ error: 'Invalid split method' });
        }

        // Insert expense
        const expenseQuery = 'INSERT INTO expenses (amount, user_id, split_method) VALUES (?, ?, ?)';
        
        db.execute(expenseQuery, [amount, userId, splitMethod], (err, results) => {
            if (err) {
                return res.status(400).json({ error: err.message });
            }

            const expenseId = results.insertId;

            // Insert shares
            const sharePromises = shareData.map(participant => {
                const shareQuery = 'INSERT INTO expense_shares (expense_id, user_id, share) VALUES (?, ?, ?)';
                return new Promise((resolve, reject) => {
                    db.execute(shareQuery, [expenseId, participant.userId, participant.share], (err) => {
                        if (err) return reject(err);
                        resolve();
                    });
                });
            });

            Promise.all(sharePromises)
                .then(() => res.status(201).json({ id: expenseId }))
                .catch(err => res.status(400).json({ error: err.message }));
        });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Get user expenses with calculated shares
exports.getUserExpenses = async (req, res) => {
    try {
        const query = `
            SELECT share, user_id FROM expense_shares WHERE user_id = ?
        `;
        
        db.execute(query, [req.params.id], (err, results) => {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            res.json(results);
        });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Get overall expenses for all users
exports.getOverallExpenses = async (req, res) => {
    try {
        const query = `
            SELECT u.id, IFNULL(SUM(es.share), 0) AS total_expense 
            FROM users u
            LEFT JOIN expense_shares es ON es.user_id = u.id
            GROUP BY u.id;
        `;
        
        db.execute(query, (err, results) => {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            res.json(results);
        });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
};
