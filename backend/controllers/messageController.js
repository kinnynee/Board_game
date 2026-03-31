const db = require('../config/db');

const messageController = {
  async getConversations(req, res) {
    try {
      const userId = req.user.id;
      const messages = await db('messages')
        .where({ sender_id: userId })
        .orWhere({ receiver_id: userId })
        .orderBy('created_at', 'desc');

      const conversations = {};
      messages.forEach(msg => {
        const otherId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
        if (!conversations[otherId]) {
          conversations[otherId] = {
            user_id: otherId,
            last_message: msg.content,
            last_time: msg.created_at,
            unread: 0
          };
        }
        if (msg.receiver_id === userId && !msg.is_read) {
          conversations[otherId].unread++;
        }
      });

      const userIds = Object.keys(conversations).map(Number);
      if (userIds.length > 0) {
        const users = await db('users').whereIn('id', userIds).select('id', 'username', 'display_name', 'avatar');
        const userMap = {};
        users.forEach(u => userMap[u.id] = u);
        const result = Object.values(conversations).map(c => ({
          ...c,
          user: userMap[c.user_id] || { id: c.user_id, username: 'Unknown' }
        }));
        return res.json(result);
      }
      res.json([]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getMessages(req, res) {
    try {
      const userId = req.user.id;
      const otherId = parseInt(req.params.userId);
      const messages = await db('messages')
        .where(function() {
          this.where({ sender_id: userId, receiver_id: otherId })
            .orWhere({ sender_id: otherId, receiver_id: userId });
        })
        .orderBy('created_at', 'asc');

      // Mark as read
      await db('messages')
        .where({ sender_id: otherId, receiver_id: userId, is_read: false })
        .update({ is_read: true });

      res.json(messages);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async editMessage(req, res) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const message = await db('messages').where({ id, sender_id: req.user.id }).first();
      if (!message) return res.status(404).json({ error: 'Message not found or not authorized' });
      await db('messages').where({ id }).update({ content });
      res.json({ message: 'Message updated' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async deleteMessage(req, res) {
    try {
      const { id } = req.params;
      const message = await db('messages').where({ id, sender_id: req.user.id }).first();
      if (!message) return res.status(404).json({ error: 'Message not found or not authorized' });
      await db('messages').where({ id }).delete();
      res.json({ message: 'Message deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = messageController;
