const express = require('express');

const asyncHandler = require('../utils/asyncHandler');
const messageController = require('../controllers/messageController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);
router.get('/conversations', asyncHandler(messageController.getConversations));
router.get('/:userId', asyncHandler(messageController.getMessages));
router.post('/', asyncHandler(messageController.sendMessage));
router.put('/:id', asyncHandler(messageController.editMessage));
router.delete('/:id', asyncHandler(messageController.deleteMessage));

module.exports = router;
