// Lần 1: Trả về dữ liệu tĩnh (fake data) để kiểm tra kết nối route
const getAllAchievements = (req, res) => {
  const achievements = [
    { id: 1, title: 'Người mới bắt đầu', description: 'Chơi ván đấu đầu tiên', icon: '🏅', unlocked: true },
    { id: 2, title: 'Chiến thắng đầu tiên', description: 'Thắng 1 ván đấu', icon: '🥇', unlocked: true },
    { id: 3, title: 'Chuỗi chiến thắng', description: 'Thắng 5 ván liên tiếp', icon: '🔥', unlocked: false },
    { id: 4, title: 'Kẻ chinh phục', description: 'Thắng 20 ván đấu', icon: '👑', unlocked: false },
    { id: 5, title: 'Bậc thầy chiến thuật', description: 'Thắng 50 ván đấu', icon: '🏆', unlocked: false },
  ];

  res.json({ success: true, data: achievements });
};

module.exports = { getAllAchievements };
