require("dotenv").config();

const cors = require("cors");
const express = require("express");
<<<<<<< HEAD
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
=======
>>>>>>> 06170f5a5e6b6979cccd2b4ff1fd1ea4a02eb102

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Board game backend is running",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
    },
  });
});

<<<<<<< HEAD
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
=======
app.use("/api/achievements", achievementRoutes);
app.use("/api/rankings", rankingRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
>>>>>>> 06170f5a5e6b6979cccd2b4ff1fd1ea4a02eb102
