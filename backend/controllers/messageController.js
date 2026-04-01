const messagesService = require('../services/messagesServices');

const messageController = {
  async getConversations(req, res) {
    try {
      const conversations = await messagesService.getConversations(req.user.id);
      return res.json(conversations);
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

      const canAccess = await messagesService.areFriends(userId, otherId);
      if (!canAccess) {
        return res.status(403).json({ error: 'You are not friends with this user' });
      }

      const messages = await messagesService.getMessages(userId, otherId);
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

      if (!(await messagesService.areFriends(userId, receiver_id))) {
        return res.status(403).json({ error: 'Can only send messages to accepted friends' });
      }

      const message = await messagesService.createMessage(userId, receiver_id, content);
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

      const message = await messagesService.getOwnedMessage(messageId, req.user.id);

      if (!message) {
        return res.status(404).json({ error: 'Message not found or not authorized' });
      }

      await messagesService.updateMessageContent(messageId, content);
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

      const message = await messagesService.getOwnedMessage(messageId, req.user.id);

      if (!message) {
        return res.status(404).json({ error: 'Message not found or not authorized' });
      }

      await messagesService.deleteMessage(messageId);
      res.json({ message: 'Message deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = messageController;
