const express = require("express");
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.use(authMiddleware);
router.get("/me", userController.getOwnProfile);
router.patch("/me", userController.updateOwnProfile);
router.get("/me/scores", userController.getMyScores);

module.exports = router;
