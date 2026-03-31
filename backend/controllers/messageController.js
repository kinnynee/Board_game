const db = require('../config/db');

async function areFriends(userId, otherId) {
  const friendship = await db('friends')
    .where(function() {
      this.where({ user_id: userId, friend_id: otherId })
        .orWhere({ user_id: otherId, friend_id: userId });
    })
    .andWhere({ status: 'accepted' })
    .first();
  return Boolean(friendship);
}

const messageController = {
  async getConversations(req, res) {
    try {
      const userId = req.user.id;
      const messages = await db('messages')
        .where({ sender_id: userId })
        .orWhere({ receiver_id: userId })
        .orderBy('created_at', 'desc');

      const conversations = {};
      for (const msg of messages) {
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
      }

      const userIds = Object.keys(conversations).map(Number);
      if (userIds.length === 0) return res.json([]);

      const users = await db('users')
        .whereIn('id', userIds)
        .select('id', 'username', 'display_name', 'avatar');

      const userMap = users.reduce((acc, u) => ({ ...acc, [u.id]: u }), {});
      const result = Object.values(conversations).map(c => ({
        ...c,
        user: userMap[c.user_id] || { id: c.user_id, username: 'Unknown' }
      }));

      return res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getMessages(req, res) {
    try {
      const userId = req.user.id;
      const otherId = Number(req.params.userId);

      if (Number.isNaN(otherId)) {
        return res.status(400).json({ error: 'Invalid userId' });
      }

      const canAccess = await areFriends(userId, otherId);
      if (!canAccess) {
        return res.status(403).json({ error: 'You are not friends with this user' });
      }

      const messages = await db('messages')
        .where(function() {
          this.where({ sender_id: userId, receiver_id: otherId })
            .orWhere({ sender_id: otherId, receiver_id: userId });
        })
        .orderBy('created_at', 'asc');

      await db('messages')
        .where({ sender_id: otherId, receiver_id: userId, is_read: false })
        .update({ is_read: true });

      res.json(messages);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async sendMessage(req, res) {
    try {
      const userId = req.user.id;
      const { receiver_id, content } = req.body;

      if (typeof receiver_id !== 'number' || typeof content !== 'string' || !content.trim()) {
        return res.status(400).json({ error: 'receiver_id and content are required' });
      }

      if (!(await areFriends(userId, receiver_id))) {
        return res.status(403).json({ error: 'Can only send messages to accepted friends' });
      }

      const [id] = await db('messages').insert({ sender_id: userId, receiver_id, content, is_read: false });
      const message = await db('messages').where({ id }).first();

      res.status(201).json(message);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async editMessage(req, res) {
    try {
      const messageId = Number(req.params.id);
      const { content } = req.body;

      if (Number.isNaN(messageId) || typeof content !== 'string' || !content.trim()) {
        return res.status(400).json({ error: 'message id and content are required' });
      }

      const message = await db('messages')
        .where({ id: messageId, sender_id: req.user.id })
        .first();

      if (!message) {
        return res.status(404).json({ error: 'Message not found or not authorized' });
      }

      await db('messages').where({ id: messageId }).update({ content });
      res.json({ message: 'Message updated' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async deleteMessage(req, res) {
    try {
      const messageId = Number(req.params.id);
      if (Number.isNaN(messageId)) {
        return res.status(400).json({ error: 'Invalid message id' });
      }

      const message = await db('messages')
        .where({ id: messageId, sender_id: req.user.id })
        .first();

      if (!message) {
        return res.status(404).json({ error: 'Message not found or not authorized' });
      }

      await db('messages').where({ id: messageId }).delete();
      res.json({ message: 'Message deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = messageController;
