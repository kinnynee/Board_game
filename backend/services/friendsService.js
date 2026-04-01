const db = require('../db');

let nicknameColumnCheck;

async function hasNicknameColumn() {
  if (!nicknameColumnCheck) {
    nicknameColumnCheck = db.schema.hasColumn('friends', 'nickname');
  }

  return nicknameColumnCheck;
}

function normalizeUserId(userId) {
  return Number(userId);
}

function buildStatusError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function getFriends(userId) {
  const normalizedUserId = normalizeUserId(userId);
  const includeNickname = await hasNicknameColumn();

  const columns = [
    'friends.id',
    'friends.status',
    'friends.created_at',
    'u1.id as user1_id',
    'u1.username as user1_username',
    'u1.display_name as user1_display_name',
    'u1.avatar as user1_avatar',
    'u2.id as user2_id',
    'u2.username as user2_username',
    'u2.display_name as user2_display_name',
    'u2.avatar as user2_avatar',
  ];

  if (includeNickname) {
    columns.push('friends.nickname');
  }

  const friends = await db('friends')
    .where(function () {
      this.where({ user_id: normalizedUserId, status: 'accepted' })
        .orWhere({ friend_id: normalizedUserId, status: 'accepted' });
    })
    .leftJoin('users as u1', 'friends.user_id', 'u1.id')
    .leftJoin('users as u2', 'friends.friend_id', 'u2.id')
    .select(columns);

  return friends.map((friendship) => {
    const isRequester = Number(friendship.user1_id) === normalizedUserId;
    const friend = isRequester
      ? {
          id: friendship.user2_id,
          username: friendship.user2_username,
          display_name: friendship.user2_display_name,
          avatar: friendship.user2_avatar,
        }
      : {
          id: friendship.user1_id,
          username: friendship.user1_username,
          display_name: friendship.user1_display_name,
          avatar: friendship.user1_avatar,
        };

    return {
      friendship_id: friendship.id,
      status: friendship.status,
      created_at: friendship.created_at,
      nickname: includeNickname ? friendship.nickname || null : null,
      friend,
    };
  });
}

async function getPendingRequests(userId) {
  return db('friends')
    .where({ friend_id: normalizeUserId(userId), status: 'pending' })
    .join('users', 'friends.user_id', 'users.id')
    .select(
      'friends.id',
      'friends.created_at',
      'users.id as sender_id',
      'users.username',
      'users.display_name',
      'users.avatar'
    );
}

async function findFriendshipBetweenUsers(userId, friendId) {
  return db('friends')
    .where(function () {
      this.where({ user_id: userId, friend_id: friendId })
        .orWhere({ user_id: friendId, friend_id: userId });
    })
    .first();
}

async function createFriendRequest(userId, friendId) {
  const normalizedUserId = normalizeUserId(userId);
  const normalizedFriendId = normalizeUserId(friendId);

  try {
    const insertedRows = await db('friends')
      .insert({
        user_id: normalizedUserId,
        friend_id: normalizedFriendId,
        status: 'pending',
      })
      .returning('id');

    if (Array.isArray(insertedRows) && insertedRows.length > 0) {
      const firstRow = insertedRows[0];
      return typeof firstRow === 'object' && firstRow !== null ? firstRow.id : firstRow;
    }

    return null;
  } catch (error) {
    if (error?.code === '23505') {
      throw buildStatusError(409, 'Friend request already exists.');
    }

    if (error?.code === '23503') {
      throw buildStatusError(404, 'The selected user could not be found.');
    }

    throw error;
  }
}

async function getPendingRequestForRecipient(requestId, userId) {
  return db('friends')
    .where({
      id: Number(requestId),
      friend_id: normalizeUserId(userId),
      status: 'pending',
    })
    .first();
}

async function acceptFriendRequest(requestId) {
  const updatedRows = await db('friends')
    .where({ id: Number(requestId), status: 'pending' })
    .update({ status: 'accepted' });

  if (!updatedRows) {
    const error = new Error('Friend request could not be accepted because it was already processed');
    error.status = 409;
    throw error;
  }
}

async function rejectFriendRequest(requestId) {
  const deletedRows = await db('friends')
    .where({ id: Number(requestId), status: 'pending' })
    .delete();

  if (!deletedRows) {
    const error = new Error('Friend request could not be rejected because it was already processed');
    error.status = 409;
    throw error;
  }
}

async function getFriendshipById(friendshipId) {
  return db('friends').where({ id: Number(friendshipId) }).first();
}

async function updateFriendNickname(friendshipId, nickname) {
  const includeNickname = await hasNicknameColumn();

  if (!includeNickname) {
    const error = new Error('Nickname is not supported by the current database schema');
    error.status = 400;
    throw error;
  }

  await db('friends').where({ id: Number(friendshipId) }).update({ nickname });
}

async function removeFriendship(friendshipId) {
  await db('friends').where({ id: Number(friendshipId) }).delete();
}

module.exports = {
  getFriends,
  getPendingRequests,
  findFriendshipBetweenUsers,
  createFriendRequest,
  getPendingRequestForRecipient,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriendshipById,
  updateFriendNickname,
  removeFriendship,
};
