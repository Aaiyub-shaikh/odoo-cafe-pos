const express = require('express');

const {
  signup,
  signupEmployee,
  login,
  updateProfile,
  getMe,
} = require('../controllers/authController');

const {
  protect,
} = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', signup);

router.post('/signup/employee', signupEmployee);

router.post('/login', login);

router.patch(
  '/profile',
  protect,
  updateProfile
);

router.get(
  '/me',
  protect,
  getMe
);

module.exports = router;