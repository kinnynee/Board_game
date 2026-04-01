const friendsService = require('../services/friendsService');

function parsePositiveInt(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function isFriendshipParticipant(friendship, userId) {
  const normalizedUserId = Number(userId);
  return Number(friendship.user_id) === normalizedUserId || Number(friendship.friend_id) === normalizedUserId;
}

const friendController = {
  async getFriends(req, res) {
    const friends = await friendsService.getFriends(req.user.id);
    res.json(friends);
  },

  async getPendingRequests(req, res) {
    const requests = await friendsService.getPendingRequests(req.user.id);
    res.json(requests);
  },

  async sendRequest(req, res) {
    const userId = Number(req.user.id);
    const friendId = parsePositiveInt(req.body.friend_id);

    if (!friendId) {
      throw createHttpError(400, 'friend_id is required and must be a number');
    }

    if (friendId === userId) {
      throw createHttpError(400, 'Cannot add yourself as friend');
    }

    const existing = await friendsService.findFriendshipBetweenUsers(userId, friendId);

    if (existing) {
      if (existing.status === 'pending') {
        throw createHttpError(400, 'Friend request is already pending');
      }

      if (existing.status === 'accepted') {
        throw createHttpError(400, 'User is already your friend');
      }
    }

    const id = await friendsService.createFriendRequest(userId, friendId);
    res.status(201).json({ id, message: 'Friend request sent' });
  },

  async respondRequest(req, res) {
    const requestId = parsePositiveInt(req.params.id);
    const { action } = req.body;

    if (!requestId) {
      throw createHttpError(400, 'Invalid friend request id');
    }

    if (!['accept', 'reject'].includes(action)) {
      throw createHttpError(400, 'Action must be reject or accept');
    }

    const request = await friendsService.getPendingRequestForRecipient(requestId, req.user.id);

    if (!request) {
      throw createHttpError(404, 'Friend request not found');
    }

    if (action === 'accept') {
      await friendsService.acceptFriendRequest(requestId);
      return res.json({ message: 'Friend request accepted' });
    }

    await friendsService.rejectFriendRequest(requestId);
    res.json({ message: 'Friend request rejected' });
  },

  async updateFriend(req, res) {
    const friendshipId = parsePositiveInt(req.params.id);
    const { nickname } = req.body;

    if (!friendshipId) {
      throw createHttpError(400, 'Invalid friendship id');
    }

    if (typeof nickname !== 'string') {
      throw createHttpError(400, 'nickname must be a string');
    }

    const friendship = await friendsService.getFriendshipById(friendshipId);

    if (!friendship) {
      throw createHttpError(404, 'Friendship not found');
    }

    if (!isFriendshipParticipant(friendship, req.user.id)) {
      throw createHttpError(403, 'Not authorized');
    }

    await friendsService.updateFriendNickname(friendshipId, nickname);
    res.json({ message: 'Friend nickname updated' });
  },

  async removeFriend(req, res) {
    const friendshipId = parsePositiveInt(req.params.id);

    if (!friendshipId) {
      throw createHttpError(400, 'Invalid friendship id');
    }

    const friendship = await friendsService.getFriendshipById(friendshipId);

    if (!friendship) {
      throw createHttpError(404, 'Friendship not found');
    }

    if (!isFriendshipParticipant(friendship, req.user.id)) {
      throw createHttpError(403, 'Not authorized');
    }

    await friendsService.removeFriendship(friendshipId);
    res.json({ message: 'Friend removed' });
  },
};

module.exports = friendController;
