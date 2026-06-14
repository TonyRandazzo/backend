const express = require('express');
const { searchStudents } = require('../controllers/searchController');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, searchStudents);

module.exports = router;