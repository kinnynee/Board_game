require("dotenv").config();

const cors = require("cors");
const express = require("express");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const achievementRoutes = require("./routes/achievementRoutes");
const rankingRoutes = require("./routes/rankingRoutes");
const gameRoutes = require("./routes/gameRoutes");
const ratingRoutes = require("./routes/ratingRoutes");

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/games", gameRoutes);
app.use("/api", ratingRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Board game backend is running",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      games: "/api/games",
      ratings: "/api/ratings",
      achievements: "/api/achievements",
      rankings: "/api/rankings",
    },
  });
});

app.use("/api/achievements", achievementRoutes);
app.use("/api/rankings", rankingRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
