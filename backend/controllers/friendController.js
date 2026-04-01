const friendsService = require('../services/friendsService');

function parsePositiveInt(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function isFriendshipParticipant(friendship, userId) {
  const normalizedUserId = Number(userId);
  return Number(friendship.user_id) === normalizedUserId || Number(friendship.friend_id) === normalizedUserId;
}

const friendController = {
  async getFriends(req, res) {
    try {
      const friends = await friendsService.getFriends(req.user.id);
      res.json(friends);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getPendingRequests(req, res) {
    try {
      const requests = await friendsService.getPendingRequests(req.user.id);
      res.json(requests);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async sendRequest(req, res) {
    try {
      const userId = Number(req.user.id);
      const friendId = parsePositiveInt(req.body.friend_id);

      if (!friendId) {
        return res.status(400).json({ error: 'friend_id is required and must be a number' });
      }
      if (friendId === userId) {
        return res.status(400).json({ error: 'Cannot add yourself as friend' });
      }

      const existing = await friendsService.findFriendshipBetweenUsers(userId, friendId);

      if (existing) {
        if (existing.status === 'pending') {
          return res.status(400).json({ error: 'Friend request is already pending' });
        }
        if (existing.status === 'accepted') {
          return res.status(400).json({ error: 'User is already your friend' });
        }
      }

      const id = await friendsService.createFriendRequest(userId, friendId);
      res.status(201).json({ id, message: 'Friend request sent' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async respondRequest(req, res) {
    try {
      const requestId = parsePositiveInt(req.params.id);
      const { action } = req.body;

      if (!requestId) {
        return res.status(400).json({ error: 'Invalid friend request id' });
      }

      if (!['accept', 'reject'].includes(action)) {
        return res.status(400).json({ error: 'Action must be reject or accept' });
      }

      const request = await friendsService.getPendingRequestForRecipient(requestId, req.user.id);

      if (!request) {
        return res.status(404).json({ error: 'Friend request not found' });
      }

      if (action === 'accept') {
        await friendsService.acceptFriendRequest(requestId);
        return res.json({ message: 'Friend request accepted' });
      }

      await friendsService.rejectFriendRequest(requestId);
      res.json({ message: 'Friend request rejected' });
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message });
    }
  },

  async updateFriend(req, res) {
    try {
      const friendshipId = parsePositiveInt(req.params.id);
      const { nickname } = req.body;

      if (!friendshipId) {
        return res.status(400).json({ error: 'Invalid friendship id' });
      }

      if (typeof nickname !== 'string') {
        return res.status(400).json({ error: 'nickname must be a string' });
      }

      const friendship = await friendsService.getFriendshipById(friendshipId);
      if (!friendship) {
        return res.status(404).json({ error: 'Friendship not found' });
      }

      if (!isFriendshipParticipant(friendship, req.user.id)) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      await friendsService.updateFriendNickname(friendshipId, nickname);
      res.json({ message: 'Friend nickname updated' });
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message });
    }
  },

  async removeFriend(req, res) {
    try {
      const friendshipId = parsePositiveInt(req.params.id);

      if (!friendshipId) {
        return res.status(400).json({ error: 'Invalid friendship id' });
      }

      const friendship = await friendsService.getFriendshipById(friendshipId);

      if (!friendship) {
        return res.status(404).json({ error: 'Friendship not found' });
      }

      if (!isFriendshipParticipant(friendship, req.user.id)) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      await friendsService.removeFriendship(friendshipId);
      res.json({ message: 'Friend removed' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = friendController;
