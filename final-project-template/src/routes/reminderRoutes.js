import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { createReminder, deleteReminder, getReminderById, getReminders, updateReminder } from '../controllers/reminderController.js';

const router = express.Router();
router.use(requireAuth);
router.post('/', createReminder);
router.get('/', getReminders);
router.get('/:id', getReminderById);
router.put('/:id', updateReminder);
router.delete('/:id', deleteReminder);

export default router;
