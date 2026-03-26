const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
  // Clear all tables
  await knex('ratings').del();
  await knex('user_achievements').del();
  await knex('achievements').del();
  await knex('messages').del();
  await knex('friends').del();
  await knex('game_scores').del();
  await knex('game_saves').del();
  await knex('games').del();
  await knex('users').del();

  // Insert users
  const hash = await bcrypt.hash('123456', 10);
  const adminHash = await bcrypt.hash('admin123', 10);

  await knex('users').insert([
    { id: 1, username: 'admin', email: 'admin@boardgame.com', password_hash: adminHash, display_name: 'Admin', role: 'admin', bio: 'System Administrator' },
    { id: 2, username: 'player1', email: 'player1@test.com', password_hash: hash, display_name: 'Nguyen Van A', bio: 'Love board games!' },
    { id: 3, username: 'player2', email: 'player2@test.com', password_hash: hash, display_name: 'Tran Thi B', bio: 'Caro champion' },
    { id: 4, username: 'player3', email: 'player3@test.com', password_hash: hash, display_name: 'Le Van C', bio: 'Snake master' },
    { id: 5, username: 'player4', email: 'player4@test.com', password_hash: hash, display_name: 'Pham Thi D', bio: 'Memory queen' },
    { id: 6, username: 'player5', email: 'player5@test.com', password_hash: hash, display_name: 'Hoang Van E', bio: 'Casual gamer' },
  ]);

  // Insert games
  await knex('games').insert([
    { id: 1, name: 'Caro 5', slug: 'caro5', description: 'Xếp 5 quân liên tiếp trên bàn cờ 15x15', instructions: 'Đặt quân cờ lên bàn, ai xếp được 5 quân liên tiếp (ngang, dọc, chéo) thì thắng. Dùng Left/Right để di chuyển, ENTER để đặt quân.', board_width: 15, board_height: 15, category: 'strategy' },
    { id: 2, name: 'Caro 4', slug: 'caro4', description: 'Xếp 4 quân liên tiếp trên bàn cờ 10x10', instructions: 'Tương tự Caro 5 nhưng chỉ cần 4 quân liên tiếp để thắng. Bàn cờ 10x10.', board_width: 10, board_height: 10, category: 'strategy' },
    { id: 3, name: 'Tic-Tac-Toe', slug: 'tictactoe', description: 'Trò chơi cờ XO kinh điển 3x3', instructions: 'Đặt X hoặc O lên bàn 3x3. Ai xếp được 3 quân liên tiếp thì thắng.', board_width: 3, board_height: 3, category: 'strategy' },
    { id: 4, name: 'Rắn Săn Mồi', slug: 'snake', description: 'Điều khiển rắn ăn mồi và tránh va chạm', instructions: 'Dùng Left/Right để đổi hướng rắn. ENTER để tạm dừng. Ăn mồi để tăng điểm. Tránh va vào tường và thân rắn.', board_width: 20, board_height: 15, category: 'action' },
    { id: 5, name: 'Ghép Hàng 3', slug: 'match3', description: 'Ghép 3 viên cùng màu để tiêu diệt (Candy Crush)', instructions: 'Dùng Left/Right để chọn viên, ENTER để chọn và đổi chỗ. Ghép 3 viên cùng màu liên tiếp để ghi điểm.', board_width: 8, board_height: 8, category: 'puzzle' },
    { id: 6, name: 'Cờ Trí Nhớ', slug: 'memory', description: 'Lật và ghép các cặp thẻ giống nhau', instructions: 'Dùng Left/Right để chọn thẻ, ENTER để lật. Tìm và lật 2 thẻ giống nhau để ghi điểm. Nhớ vị trí các thẻ!', board_width: 6, board_height: 6, category: 'puzzle' },
    { id: 7, name: 'Bảng Vẽ Tự Do', slug: 'drawing', description: 'Vẽ tự do trên bảng với nhiều màu sắc', instructions: 'Dùng Left/Right để di chuyển cọ, ENTER để tô màu. Dùng Hint để đổi màu. Back để xóa ô.', board_width: 20, board_height: 15, category: 'creative' },
  ]);

  // Insert sample scores
  await knex('game_scores').insert([
    { user_id: 2, game_slug: 'caro5', score: 1500, duration: 300, result: 'win' },
    { user_id: 2, game_slug: 'tictactoe', score: 800, duration: 60, result: 'win' },
    { user_id: 3, game_slug: 'caro5', score: 2000, duration: 250, result: 'win' },
    { user_id: 3, game_slug: 'snake', score: 1200, duration: 180, result: 'lose' },
    { user_id: 4, game_slug: 'snake', score: 3500, duration: 400, result: 'win' },
    { user_id: 4, game_slug: 'memory', score: 2800, duration: 120, result: 'win' },
    { user_id: 5, game_slug: 'match3', score: 4500, duration: 200, result: 'win' },
    { user_id: 5, game_slug: 'memory', score: 3200, duration: 90, result: 'win' },
    { user_id: 6, game_slug: 'caro4', score: 1800, duration: 350, result: 'win' },
    { user_id: 6, game_slug: 'tictactoe', score: 600, duration: 45, result: 'draw' },
  ]);

  // Insert achievements
  await knex('achievements').insert([
    { id: 1, name: 'Người mới', description: 'Chơi trò chơi đầu tiên', icon: '🎮', game_slug: null, condition_type: 'games_played', condition_value: 1 },
    { id: 2, name: 'Chiến thắng đầu tiên', description: 'Thắng trò chơi đầu tiên', icon: '🏆', game_slug: null, condition_type: 'wins', condition_value: 1 },
    { id: 3, name: 'Vua Caro', description: 'Thắng 10 ván Caro', icon: '👑', game_slug: 'caro5', condition_type: 'wins', condition_value: 10 },
    { id: 4, name: 'Rắn siêu tốc', description: 'Đạt 5000 điểm trong Snake', icon: '🐍', game_slug: 'snake', condition_type: 'score', condition_value: 5000 },
    { id: 5, name: 'Trí nhớ siêu phàm', description: 'Hoàn thành Memory trong 60 giây', icon: '🧠', game_slug: 'memory', condition_type: 'speed', condition_value: 60 },
    { id: 6, name: 'Kẹo ngọt', description: 'Đạt 10000 điểm Match-3', icon: '🍬', game_slug: 'match3', condition_type: 'score', condition_value: 10000 },
    { id: 7, name: 'Nghệ sĩ', description: 'Tạo 5 bức vẽ', icon: '🎨', game_slug: 'drawing', condition_type: 'games_played', condition_value: 5 },
    { id: 8, name: 'Xã giao', description: 'Kết bạn với 5 người', icon: '🤝', game_slug: null, condition_type: 'friends', condition_value: 5 },
  ]);

  // Assign some achievements
  await knex('user_achievements').insert([
    { user_id: 2, achievement_id: 1 },
    { user_id: 2, achievement_id: 2 },
    { user_id: 3, achievement_id: 1 },
    { user_id: 3, achievement_id: 2 },
    { user_id: 3, achievement_id: 3 },
    { user_id: 4, achievement_id: 1 },
    { user_id: 4, achievement_id: 4 },
    { user_id: 5, achievement_id: 1 },
    { user_id: 5, achievement_id: 5 },
  ]);

  // Insert friends
  await knex('friends').insert([
    { user_id: 2, friend_id: 3, status: 'accepted' },
    { user_id: 2, friend_id: 4, status: 'accepted' },
    { user_id: 3, friend_id: 5, status: 'accepted' },
    { user_id: 4, friend_id: 6, status: 'pending' },
  ]);

  // Insert messages
  await knex('messages').insert([
    { sender_id: 2, receiver_id: 3, content: 'Chào bạn! Chơi Caro không?', is_read: true },
    { sender_id: 3, receiver_id: 2, content: 'OK, chơi thôi!', is_read: true },
    { sender_id: 4, receiver_id: 2, content: 'Hôm nay mình đạt high score Snake nè!', is_read: false },
    { sender_id: 5, receiver_id: 3, content: 'Bạn dạy mình chơi Memory đi', is_read: false },
  ]);

  // Insert ratings
  await knex('ratings').insert([
    { user_id: 2, game_slug: 'caro5', rating: 5, comment: 'Game cờ caro rất hay, đồ họa đẹp!' },
    { user_id: 3, game_slug: 'caro5', rating: 4, comment: 'Thích lắm, nên thêm nhiều chế độ hơn' },
    { user_id: 4, game_slug: 'snake', rating: 5, comment: 'Rắn săn mồi kinh điển, chơi hoài không chán!' },
    { user_id: 5, game_slug: 'match3', rating: 4, comment: 'Giống Candy Crush, rất gây nghiện' },
    { user_id: 5, game_slug: 'memory', rating: 5, comment: 'Rèn luyện trí nhớ rất tốt' },
  ]);
};
