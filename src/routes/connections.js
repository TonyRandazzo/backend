const express = require('express');
const { sendRequest, acceptRequest, getPendingRequests, getAcceptedConnections } = require('../controllers/connectionsController');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/request', auth, sendRequest);
router.post('/accept', auth, acceptRequest);
router.get('/pending', auth, getPendingRequests);
router.get('/accepted', auth, getAcceptedConnections);

module.exports = router;