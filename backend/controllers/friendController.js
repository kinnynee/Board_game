const db = require('../config/db');

const friendController = {
  async getFriends(req, res) {
    try {
      const userId = req.user.id;
      const friends = await db('friends')
        .where(function() {
          this.where({ user_id: userId, status: 'accepted' })
            .orWhere({ friend_id: userId, status: 'accepted' });
        })
        .leftJoin('users as u1', 'friends.user_id', 'u1.id')
        .leftJoin('users as u2', 'friends.friend_id', 'u2.id')
        .select(
          'friends.id', 'friends.status', 'friends.created_at', 'friends.nickname',
          'u1.id as user1_id', 'u1.username as user1_username', 'u1.display_name as user1_display_name', 'u1.avatar as user1_avatar',
          'u2.id as user2_id', 'u2.username as user2_username', 'u2.display_name as user2_display_name', 'u2.avatar as user2_avatar'
        );

      const result = friends.map(f => {
        const friend = f.user1_id === userId
          ? { id: f.user2_id, username: f.user2_username, display_name: f.user2_display_name, avatar: f.user2_avatar }
          : { id: f.user1_id, username: f.user1_username, display_name: f.user1_display_name, avatar: f.user1_avatar };

        return {
          friendship_id: f.id,
          status: f.status,
          created_at: f.created_at,
          nickname: f.nickname || null,
          friend
        };
      });

      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getPendingRequests(req, res) {
    try {
      const requests = await db('friends')
        .where({ friend_id: req.user.id, status: 'pending' })
        .join('users', 'friends.user_id', 'users.id')
        .select('friends.id', 'friends.created_at', 'users.id as sender_id', 'users.username', 'users.display_name', 'users.avatar');
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

      const existing = await db('friends')
        .where(function() {
          this.where({ user_id: userId, friend_id })
            .orWhere({ user_id: friend_id, friend_id: userId });
        })
        .first();

      if (existing) {
        if (existing.status === 'pending') {
          return res.status(400).json({ error: 'Friend request is already pending' });
        }
        if (existing.status === 'accepted') {
          return res.status(400).json({ error: 'User is already your friend' });
        }
      }

      const [id] = await db('friends').insert({ user_id: userId, friend_id, status: 'pending' });
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

      const request = await db('friends')
        .where({ id: requestId, friend_id: req.user.id, status: 'pending' })
        .first();

      if (!request) {
        return res.status(404).json({ error: 'Friend request not found' });
      }

      if (action === 'accept') {
        await db('friends').where({ id: requestId }).update({ status: 'accepted' });
        return res.json({ message: 'Friend request accepted' });
      }

      await db('friends').where({ id: requestId }).delete();
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

      const friendship = await db('friends').where({ id: friendshipId }).first();
      if (!friendship) {
        return res.status(404).json({ error: 'Friendship not found' });
      }

      if (friendship.user_id !== req.user.id && friendship.friend_id !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      await db('friends').where({ id: friendshipId }).update({ nickname });
      res.json({ message: 'Friend nickname updated' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async removeFriend(req, res) {
    try {
      const friendshipId = Number(req.params.id);
      const friendship = await db('friends').where({ id: friendshipId }).first();

      if (!friendship) {
        return res.status(404).json({ error: 'Friendship not found' });
      }

      if (friendship.user_id !== req.user.id && friendship.friend_id !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      await db('friends').where({ id: friendshipId }).delete();
      res.json({ message: 'Friend removed' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = friendController;
