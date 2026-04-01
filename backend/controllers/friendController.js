const friendsService = require('../services/friendsService');

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
      const { friend_id } = req.body;
      const userId = req.user.id;

      if (typeof friend_id !== 'number') {
        return res.status(400).json({ error: 'friend_id is required and must be a number' });
      }
      if (friend_id === userId) {
        return res.status(400).json({ error: 'Cannot add yourself as friend' });
      }

      const existing = await friendsService.findFriendshipBetweenUsers(userId, friend_id);

      if (existing) {
        if (existing.status === 'pending') {
          return res.status(400).json({ error: 'Friend request is already pending' });
        }
        if (existing.status === 'accepted') {
          return res.status(400).json({ error: 'User is already your friend' });
        }
      }

      const id = await friendsService.createFriendRequest(userId, friend_id);
      res.status(201).json({ id, message: 'Friend request sent' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async respondRequest(req, res) {
    try {
      const requestId = Number(req.params.id);
      const { action } = req.body;
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
      res.status(500).json({ error: err.message });
    }
  },

  async updateFriend(req, res) {
    try {
      const friendshipId = Number(req.params.id);
      const { nickname } = req.body;

      if (typeof nickname !== 'string') {
        return res.status(400).json({ error: 'nickname must be a string' });
      }

      const friendship = await friendsService.getFriendshipById(friendshipId);
      if (!friendship) {
        return res.status(404).json({ error: 'Friendship not found' });
      }

      if (friendship.user_id !== req.user.id && friendship.friend_id !== req.user.id) {
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
      const friendshipId = Number(req.params.id);
      const friendship = await friendsService.getFriendshipById(friendshipId);

      if (!friendship) {
        return res.status(404).json({ error: 'Friendship not found' });
      }

      if (friendship.user_id !== req.user.id && friendship.friend_id !== req.user.id) {
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
