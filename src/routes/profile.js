const express = require('express');
const { getProfile, updateProfile, updateLocation, updateAvatar, deleteAccount } = require('../controllers/profileController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

router.get('/', auth, getProfile);
router.put('/', auth, updateProfile);
router.post('/location', auth, updateLocation);
router.post('/avatar', auth, upload.single('avatar'), updateAvatar);
router.delete('/', auth, deleteAccount);   

module.exports = router;