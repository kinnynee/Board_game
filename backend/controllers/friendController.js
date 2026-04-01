const db = require('../config/db');

function parsePositiveInt(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function isFriendshipParticipant(friendship, userId) {
  const normalizedUserId = Number(userId);
  return Number(friendship.user_id) === normalizedUserId || Number(friendship.friend_id) === normalizedUserId;
}

const friendController = {
  async getFriends(req, res) {
    try {
      const userId = Number(req.user.id);
      const friends = await db('friends')
        .where(function () {
          this.where({ user_id: userId, status: 'accepted' })
            .orWhere({ friend_id: userId, status: 'accepted' });
        })
        .leftJoin('users as u1', 'friends.user_id', 'u1.id')
        .leftJoin('users as u2', 'friends.friend_id', 'u2.id')
        .select(
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
          'u2.avatar as user2_avatar'
        );

      const result = friends.map((friendship) => {
        const friend = Number(friendship.user1_id) === userId
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
          nickname: null,
          friend,
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
        .where({ friend_id: Number(req.user.id), status: 'pending' })
        .join('users', 'friends.user_id', 'users.id')
        .select(
          'friends.id',
          'friends.created_at',
          'users.id as sender_id',
          'users.username',
          'users.display_name',
          'users.avatar'
        );
      res.json(requests);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async sendRequest(req, res) {
    try {
      const userId = Number(req.user.id);
      const friendId = parsePositiveInt(req.body.friend_id);

      if (!friendId) {
        return res.status(400).json({ error: 'friend_id is required and must be a number' });
      }
      if (friendId === userId) {
        return res.status(400).json({ error: 'Cannot add yourself as friend' });
      }

      const existing = await db('friends')
        .where(function () {
          this.where({ user_id: userId, friend_id: friendId })
            .orWhere({ user_id: friendId, friend_id: userId });
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

      const [id] = await db('friends').insert({ user_id: userId, friend_id: friendId, status: 'pending' });
      res.status(201).json({ id, message: 'Friend request sent' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async respondRequest(req, res) {
    try {
      const requestId = parsePositiveInt(req.params.id);
      const { action } = req.body;

      if (!requestId) {
        return res.status(400).json({ error: 'Invalid friend request id' });
      }

      if (!['accept', 'reject'].includes(action)) {
        return res.status(400).json({ error: 'Action must be reject or accept' });
      }

      const request = await db('friends')
        .where({ id: requestId, friend_id: Number(req.user.id), status: 'pending' })
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
      const friendshipId = parsePositiveInt(req.params.id);
      const { nickname } = req.body;

      if (!friendshipId) {
        return res.status(400).json({ error: 'Invalid friendship id' });
      }

      if (typeof nickname !== 'string') {
        return res.status(400).json({ error: 'nickname must be a string' });
      }

      const friendship = await db('friends').where({ id: friendshipId }).first();
      if (!friendship) {
        return res.status(404).json({ error: 'Friendship not found' });
      }

      if (!isFriendshipParticipant(friendship, req.user.id)) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      res.status(400).json({ error: 'Nickname is not supported by the current database schema' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async removeFriend(req, res) {
    try {
      const friendshipId = parsePositiveInt(req.params.id);

      if (!friendshipId) {
        return res.status(400).json({ error: 'Invalid friendship id' });
      }

      const friendship = await db('friends').where({ id: friendshipId }).first();

      if (!friendship) {
        return res.status(404).json({ error: 'Friendship not found' });
      }

      if (!isFriendshipParticipant(friendship, req.user.id)) {
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
