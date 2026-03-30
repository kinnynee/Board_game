require("dotenv").config();

const cors = require("cors");
const express = require("express");

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Board game backend is running",
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
