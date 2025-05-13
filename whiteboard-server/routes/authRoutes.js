//============== authRoutes.js===============
const express = require('express');
const {register, login} = require('../Controllers/AuthController');
const { registerValidation, loginValidation } = require('../Middlewares/AuthValidation');
const router = express.Router();

// Temporary in-memory store (replace with DB later)
// const users = [];

router.post('/login', loginValidation, login);
router.post('/register', registerValidation, register);

module.exports = router;