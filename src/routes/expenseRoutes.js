const express = require('express');
const { addExpense, getUserExpenses, getOverallExpenses } = require('../controllers/expenseController');
const { authenticate } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/addExpense',authenticate, addExpense);
router.get('/user/:id',authenticate, getUserExpenses);
router.get('/overall',authenticate, getOverallExpenses);

module.exports = router;
