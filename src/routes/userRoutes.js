const express = require('express');
const { createUser, getUser,getBalanceSheet, loginUser } = require('../controllers/userController');
const { authenticate } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/createUser', createUser);
router.post('/login', loginUser);
router.get('/:id',authenticate, getUser);
router.get('/balanceSheet/:id',authenticate,getBalanceSheet)

module.exports = router;
