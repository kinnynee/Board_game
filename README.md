<<<<<<< HEAD
#  Board Game - Ứng dụng Web Board Game

##  Tổng quan

Ứng dụng web full-stack cho trò chơi bàn cờ (board game) với đầy đủ chức năng theo yêu cầu đồ án:

- **Frontend**: React (Vite) - Single Page Application với routing đầy đủ
- **Backend**: Express.js + Knex.js + Supabase
- **Kiến trúc**: MVC (backend), Component-based (frontend)
- **Authentication**: JWT-based
- **Dark mode**: Có

---

##  Danh sách chức năng

### Board Game (7 trò chơi)

| Game | Mô tả | Kích thước |
|------|--------|------------|
|  Caro 5 | Xếp 5 quân liên tiếp | 15×15 |
|  Caro 4 | Xếp 4 quân liên tiếp | 10×10 |
|  Tic-Tac-Toe | Cờ XO kinh điển | 3×3 |
|  Rắn Săn Mồi | Điều khiển rắn ăn mồi | 20×15 |
|  Ghép Hàng 3 | Match-3 (Candy Crush) | 8×8 |
|  Cờ Trí Nhớ | Lật ghép cặp thẻ | 6×6 |
|  Bảng Vẽ Tự Do | Vẽ tự do trên bàn | 20×15 |

**Tính năng chung:**
-  5 nút điều khiển: Left, Right (Up/Down), ENTER, Back, Hint/Help
-  Chế độ chơi vs Computer (AI random hợp lệ)
-  Hiển thị điểm số
-  Đếm thời gian
-  Save/Load game
-  Hướng dẫn chơi cho mỗi game
-  Đánh giá game (rating + comment)

### Chức năng người dùng
-  Quản lý profile (tên, email, bio)
-  Tìm kiếm người dùng
-  Quản lý kết bạn (gửi/chấp nhận/từ chối/xóa)
-  Quản lý tin nhắn (không real-time)
-  Quản lý thành tựu (tự động mở khóa)
-  Bảng xếp hạng (toàn hệ thống, bạn bè, cá nhân)

### Chức năng quản trị (Admin)
-  Quản lý người dùng (CRUD, phân quyền, khóa/mở tài khoản)
-  Quản lý thống kê (tổng người dùng, lượt chơi, điểm trung bình)
-  Quản lý Game (kích thước bàn, bật/tắt game)

### Hệ thống
-  Authentication (register/login/JWT)
-  2 layout: Client và Admin
-  Dark mode
-  RESTful API
-  Migrations & Data Seeding
-  Kiến trúc MVC

---

##  Hướng dẫn chạy

### Yêu cầu
- **Node.js** >= 16

### Bước 1: Cài đặt Backend

```bash
cd backend
npm install
npx knex migrate:latest
npx knex seed:run
```

### Bước 2: Cài đặt Frontend

```bash
cd frontend
npm install
```

### Bước 3: Chạy ứng dụng

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```
> Server chạy tại: http://localhost:3001

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
> App chạy tại: http://localhost:5173

### Bước 4: Đăng nhập

Mở trình duyệt tại `http://localhost:5173` và đăng nhập:

| Vai trò | Username | Password |
|---------|----------|----------|
| Admin | `admin` | `admin123` |
| User | `player1` - `player5` | `123456` |

---

## Cấu trúc dự án

```

├── backend/                    # Express.js Backend
│   ├── config/db.js           # Kết nối database
│   ├── controllers/           # 9 controllers (MVC)
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── friendController.js
│   │   ├── messageController.js
│   │   ├── gameController.js
│   │   ├── ratingController.js
│   │   ├── rankingController.js
│   │   ├── achievementController.js
│   │   └── adminController.js
│   ├── middleware/auth.js     # JWT & Admin middleware
│   ├── migrations/            # Knex migrations (9 bảng)
│   ├── routes/                # 9 route files
│   ├── seeds/                 # Data seeding
│   ├── knexfile.js           # Cấu hình Knex
│   ├── server.js             # Entry point
│   └── package.json
│
├── frontend/                  # React (Vite) Frontend
│   ├── src/
│   │   ├── contexts/         # Auth & Theme contexts
│   │   ├── pages/            # 12 pages
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── GamePage.jsx       # 7 game engines
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── FriendsPage.jsx
│   │   │   ├── MessagesPage.jsx
│   │   │   ├── RankingsPage.jsx
│   │   │   ├── AchievementsPage.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminUsers.jsx
│   │   │   └── AdminGames.jsx
│   │   ├── api.js            # API helper
│   │   ├── App.jsx           # Main app + routing
│   │   ├── index.css         # Design system
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## Chuyển sang Supabase (PostgreSQL)

Khi muốn deploy hoặc đáp ứng yêu cầu dùng Supabase:

1. Cài `pg` package:
```bash
cd backend
npm install pg
```

2. Sửa `knexfile.js`:
```js
module.exports = {
  development: {
    client: 'pg',
    connection: 'postgresql://USER:PASSWORD@db.YOUR-PROJECT.supabase.co:5432/postgres',
    migrations: { directory: './migrations' },
    seeds: { directory: './seeds' }
  }
};
```

3. Chạy lại migrations:
```bash
npx knex migrate:latest
npx knex seed:run
```

**Không cần sửa bất kỳ code nào khác!**

---

## Database Schema (9 bảng)

- **users** - Tài khoản người dùng
- **games** - Danh sách trò chơi
- **game_saves** - Bản lưu game
- **game_scores** - Điểm số
- **friends** - Quan hệ bạn bè
- **messages** - Tin nhắn
- **achievements** - Thành tựu
- **user_achievements** - Thành tựu đã mở khóa
- **ratings** - Đánh giá game

---

## Giao diện

- **Dark mode** toggle ở sidebar footer
- **Sidebar navigation** cho tất cả trang
- **Responsive** hỗ trợ mobile
- **Gradient** game cards, glassmorphism login
- **Animations**: hover effects, pulse cursor, match pop
=======
# Board_game
Đây là đồ án xây dựng website board game full-stack, cho phép người dùng đăng ký, đăng nhập, chơi nhiều trò chơi, lưu điểm, lưu tiến trình và quản lý trang cá nhân. Hệ thống còn hỗ trợ kết bạn, nhắn tin, bảng xếp hạng, thành tựu và trang quản trị dành cho admin.
>>>>>>> 06170f5a5e6b6979cccd2b4ff1fd1ea4a02eb102
