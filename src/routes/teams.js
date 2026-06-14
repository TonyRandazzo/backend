const express = require('express');
const { createTeam, joinTeam, getUserTeams, getAllTeams, getTeamMessages } = require('../controllers/teamsController');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/', auth, createTeam);
router.post('/join/:teamId', auth, joinTeam);
router.get('/', auth, getUserTeams);
router.get('/all', auth, getAllTeams);
router.get('/:teamId/messages', auth, getTeamMessages);

module.exports = router;