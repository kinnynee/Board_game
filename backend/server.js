require("dotenv").config();

const cors = require("cors");
const express = require("express");

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

app.use("/api/achievements", achievementRoutes);
app.use("/api/rankings", rankingRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
