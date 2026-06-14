const express = require('express');
const { getConversation, markAsRead, getUnreadCounts } = require('../controllers/messagesController');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/unread', auth, getUnreadCounts);
router.put('/read/:otherUserId', auth, markAsRead);
router.get('/:otherUserId', auth, getConversation);

module.exports = router;