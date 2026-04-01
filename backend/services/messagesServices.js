const db = require('../db');

function normalizeUserId(userId) {
  return Number(userId);
}

function buildStatusError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function areFriends(userId, otherId) {
  const normalizedUserId = normalizeUserId(userId);
  const normalizedOtherId = normalizeUserId(otherId);

  const friendship = await db('friends')
    .where(function () {
      this.where({ user_id: normalizedUserId, friend_id: normalizedOtherId })
        .orWhere({ user_id: normalizedOtherId, friend_id: normalizedUserId });
    })
    .andWhere({ status: 'accepted' })
    .first();

  return Boolean(friendship);
}

async function getConversations(userId) {
  const normalizedUserId = normalizeUserId(userId);
  const messages = await db('messages')
    .where({ sender_id: normalizedUserId })
    .orWhere({ receiver_id: normalizedUserId })
    .orderBy('created_at', 'desc');

  const conversations = {};

  for (const message of messages) {
    const otherId = Number(message.sender_id) === normalizedUserId
      ? message.receiver_id
      : message.sender_id;

    if (!conversations[otherId]) {
      conversations[otherId] = {
        user_id: otherId,
        last_message: message.content,
        last_time: message.created_at,
        unread: 0,
      };
    }

    if (Number(message.receiver_id) === normalizedUserId && !message.is_read) {
      conversations[otherId].unread += 1;
    }
  }

  const userIds = Object.keys(conversations).map(Number);

  if (userIds.length === 0) {
    return [];
  }

  const users = await db('users')
    .whereIn('id', userIds)
    .select('id', 'username', 'display_name', 'avatar');

  const userMap = Object.fromEntries(users.map((user) => [user.id, user]));

  return Object.values(conversations).map((conversation) => ({
    ...conversation,
    user: userMap[conversation.user_id] || {
      id: conversation.user_id,
      username: 'Unknown',
      display_name: 'Unknown',
      avatar: null,
    },
  }));
}

async function getMessages(userId, otherId) {
  const normalizedUserId = normalizeUserId(userId);
  const normalizedOtherId = normalizeUserId(otherId);

  await db('messages')
    .where({
      sender_id: normalizedOtherId,
      receiver_id: normalizedUserId,
      is_read: false,
    })
    .update({ is_read: true });

  return db('messages')
    .where(function () {
      this.where({ sender_id: normalizedUserId, receiver_id: normalizedOtherId })
        .orWhere({ sender_id: normalizedOtherId, receiver_id: normalizedUserId });
    })
    .orderBy('created_at', 'asc');
}

async function createMessage(senderId, receiverId, content) {
  const normalizedSenderId = normalizeUserId(senderId);
  const normalizedReceiverId = normalizeUserId(receiverId);

  try {
    const insertedRows = await db('messages')
      .insert({
        sender_id: normalizedSenderId,
        receiver_id: normalizedReceiverId,
        content: content.trim(),
        is_read: false,
      })
      .returning('id');

    if (!Array.isArray(insertedRows) || insertedRows.length === 0) {
      throw buildStatusError(500, 'Message was created but no id was returned.');
    }

    const firstRow = insertedRows[0];
    const messageId = typeof firstRow === 'object' && firstRow !== null ? firstRow.id : firstRow;

    return db('messages').where({ id: messageId }).first();
  } catch (error) {
    if (error?.code === '23503') {
      throw buildStatusError(404, 'The selected receiver could not be found.');
    }

    throw error;
  }
}

async function getMessageById(messageId) {
  return db('messages').where({ id: Number(messageId) }).first();
}

async function updateMessageContent(messageId, content) {
  await db('messages')
    .where({ id: Number(messageId) })
    .update({ content: content.trim() });
}

async function deleteMessage(messageId) {
  await db('messages').where({ id: Number(messageId) }).delete();
}

module.exports = {
  areFriends,
  getConversations,
  getMessages,
  createMessage,
  getMessageById,
  updateMessageContent,
  deleteMessage,
};
