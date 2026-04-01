const messagesService = require('../services/messagesServices');

function parsePositiveInt(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

const messageController = {
  async getConversations(req, res) {
    const conversations = await messagesService.getConversations(req.user.id);
    return res.json(conversations);
  },

  async getMessages(req, res) {
    const userId = Number(req.user.id);
    const otherId = parsePositiveInt(req.params.userId);

    if (!otherId) {
      throw createHttpError(400, 'Invalid userId');
    }

    const canAccess = await messagesService.areFriends(userId, otherId);
    if (!canAccess) {
      throw createHttpError(403, 'You are not friends with this user');
    }

    const messages = await messagesService.getMessages(userId, otherId);
    res.json(messages);
  },

  async sendMessage(req, res) {
    const userId = Number(req.user.id);
    const receiverId = parsePositiveInt(req.body.receiver_id);
    const { content } = req.body;

    if (!receiverId || typeof content !== 'string' || !content.trim()) {
      throw createHttpError(400, 'receiver_id and content are required');
    }

    if (receiverId === userId) {
      throw createHttpError(400, 'Cannot send message to yourself');
    }

    if (!(await messagesService.areFriends(userId, receiverId))) {
      throw createHttpError(403, 'Can only send messages to accepted friends');
    }

    const message = await messagesService.createMessage(userId, receiverId, content);
    res.status(201).json(message);
  },

  async editMessage(req, res) {
    const messageId = parsePositiveInt(req.params.id);
    const { content } = req.body;

    if (!messageId || typeof content !== 'string' || !content.trim()) {
      throw createHttpError(400, 'message id and content are required');
    }

    const message = await messagesService.getMessageById(messageId);

    if (!message) {
      throw createHttpError(404, 'Message not found');
    }

    if (Number(message.sender_id) !== Number(req.user.id)) {
      throw createHttpError(403, 'Not authorized to edit this message');
    }

    await messagesService.updateMessageContent(messageId, content);
    res.json({ message: 'Message updated' });
  },

  async deleteMessage(req, res) {
    const messageId = parsePositiveInt(req.params.id);

    if (!messageId) {
      throw createHttpError(400, 'Invalid message id');
    }

    const message = await messagesService.getMessageById(messageId);

    if (!message) {
      throw createHttpError(404, 'Message not found');
    }

    if (Number(message.sender_id) !== Number(req.user.id)) {
      throw createHttpError(403, 'Not authorized to delete this message');
    }

    await messagesService.deleteMessage(messageId);
    res.json({ message: 'Message deleted' });
  },
};

module.exports = messageController;
