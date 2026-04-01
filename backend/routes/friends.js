const express = require('express');

const asyncHandler = require('../utils/asyncHandler');
const friendController = require('../controllers/friendController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);
router.get('/', asyncHandler(friendController.getFriends));
router.get('/pending', asyncHandler(friendController.getPendingRequests));
router.post('/request', asyncHandler(friendController.sendRequest));
router.put('/respond/:id', asyncHandler(friendController.respondRequest));
router.put('/:id', asyncHandler(friendController.updateFriend));
router.delete('/:id', asyncHandler(friendController.removeFriend));

module.exports = router;
