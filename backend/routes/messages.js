const router = require('express').Router();
const messageController = require('../controllers/messageController');
const { auth } = require('../middleware/auth');

router.get('/conversations', auth, messageController.getConversations);
router.get('/:userId', auth, messageController.getMessages);
router.put('/:id', auth, messageController.editMessage);
router.delete('/:id', auth, messageController.deleteMessage);

module.exports = router;
