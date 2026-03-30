require("dotenv").config();

const cors = require("cors");
const express = require("express");
const achievementRoutes = require("./routes/achievementRoutes");
const rankingRoutes = require("./routes/rankingRoutes");

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Board game backend is running",
  });
});

app.use("/api/achievements", achievementRoutes);
app.use("/api/rankings", rankingRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
