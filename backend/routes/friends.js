const router = require('express').Router();
const friendController = require('../controllers/friendController');
const { auth } = require('../middleware/auth');

router.get('/', auth, friendController.getFriends);
router.get('/pending', auth, friendController.getPendingRequests);
router.post('/request', auth, friendController.sendRequest);
router.put('/respond/:id', auth, friendController.respondRequest);
router.put('/:id', auth, friendController.updateFriend);

module.exports = router;
