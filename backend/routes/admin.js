const router = require('express').Router();
const adminController = require('../controllers/adminController');
const { adminAuth } = require('../middleware/auth');

// All admin routes require admin auth
router.get('/users', adminAuth, adminController.listUsers);
router.put('/users/:id', adminAuth, adminController.updateUser);
router.delete('/users/:id', adminAuth, adminController.deleteUser);
router.post('/users/:id/reset-password', adminAuth, adminController.resetPassword);
router.get('/statistics', adminAuth, adminController.getStatistics);
router.get('/games', adminAuth, adminController.listAllGames);
router.put('/games/:id', adminAuth, adminController.updateGame);

module.exports = router;
