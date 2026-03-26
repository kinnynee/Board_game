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
        .join('users as u1', function() {
          this.on('friends.user_id', '=', 'u1.id');
        })
        .join('users as u2', function() {
          this.on('friends.friend_id', '=', 'u2.id');
        })
        .select(
          'friends.id', 'friends.status', 'friends.created_at',
          'u1.id as user1_id', 'u1.username as user1_username', 'u1.display_name as user1_display_name', 'u1.avatar as user1_avatar',
          'u2.id as user2_id', 'u2.username as user2_username', 'u2.display_name as user2_display_name', 'u2.avatar as user2_avatar'
        );

      const result = friends.map(f => {
        const friend = f.user1_id === userId
          ? { id: f.user2_id, username: f.user2_username, display_name: f.user2_display_name, avatar: f.user2_avatar }
          : { id: f.user1_id, username: f.user1_username, display_name: f.user1_display_name, avatar: f.user1_avatar };
        return { friendship_id: f.id, status: f.status, created_at: f.created_at, friend };
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
      if (friend_id === req.user.id) return res.status(400).json({ error: 'Cannot add yourself' });
      const existing = await db('friends')
        .where(function() {
          this.where({ user_id: req.user.id, friend_id })
            .orWhere({ user_id: friend_id, friend_id: req.user.id });
        }).first();
      if (existing) return res.status(400).json({ error: 'Friend request already exists' });
      const [id] = await db('friends').insert({ user_id: req.user.id, friend_id, status: 'pending' });
      res.status(201).json({ id, message: 'Friend request sent' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async respondRequest(req, res) {
    try {
      const { id } = req.params;
      const { action } = req.body;
      const request = await db('friends').where({ id, friend_id: req.user.id }).first();
      if (!request) return res.status(404).json({ error: 'Request not found' });
      if (action === 'accept') {
        await db('friends').where({ id }).update({ status: 'accepted' });
        res.json({ message: 'Friend request accepted' });
      } else {
        await db('friends').where({ id }).delete();
        res.json({ message: 'Friend request rejected' });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async removeFriend(req, res) {
    try {
      const { id } = req.params;
      await db('friends').where({ id }).delete();
      res.json({ message: 'Friend removed' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = friendController;
