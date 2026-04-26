import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { createMotorcycle, deleteMotorcycle, getMotorcycleById, getMotorcycles, updateMotorcycle } from '../controllers/motorcycleController.js';

const router = express.Router();
router.use(requireAuth);
router.post('/', createMotorcycle);
router.get('/', getMotorcycles);
router.get('/:id', getMotorcycleById);
router.put('/:id', updateMotorcycle);
router.delete('/:id', deleteMotorcycle);

export default router;
