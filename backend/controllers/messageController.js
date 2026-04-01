const messagesService = require('../services/messagesServices');

function parsePositiveInt(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

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
      const userId = Number(req.user.id);
      const otherId = parsePositiveInt(req.params.userId);

      if (!otherId) {
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
      const userId = Number(req.user.id);
      const receiverId = parsePositiveInt(req.body.receiver_id);
      const { content } = req.body;

      if (!receiverId || typeof content !== 'string' || !content.trim()) {
        return res.status(400).json({ error: 'receiver_id and content are required' });
      }

      if (receiverId === userId) {
        return res.status(400).json({ error: 'Cannot send message to yourself' });
      }

      if (!(await messagesService.areFriends(userId, receiverId))) {
        return res.status(403).json({ error: 'Can only send messages to accepted friends' });
      }

      const message = await messagesService.createMessage(userId, receiverId, content);
      res.status(201).json(message);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async editMessage(req, res) {
    try {
      const messageId = parsePositiveInt(req.params.id);
      const { content } = req.body;

      if (!messageId || typeof content !== 'string' || !content.trim()) {
        return res.status(400).json({ error: 'message id and content are required' });
      }

      const message = await messagesService.getMessageById(messageId);

      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }

      if (Number(message.sender_id) !== Number(req.user.id)) {
        return res.status(403).json({ error: 'Not authorized to edit this message' });
      }

      await messagesService.updateMessageContent(messageId, content);
      res.json({ message: 'Message updated' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async deleteMessage(req, res) {
    try {
      const messageId = parsePositiveInt(req.params.id);
      if (!messageId) {
        return res.status(400).json({ error: 'Invalid message id' });
      }

      const message = await messagesService.getMessageById(messageId);

      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }

      if (Number(message.sender_id) !== Number(req.user.id)) {
        return res.status(403).json({ error: 'Not authorized to delete this message' });
      }

      await messagesService.deleteMessage(messageId);
      res.json({ message: 'Message deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = messageController;
