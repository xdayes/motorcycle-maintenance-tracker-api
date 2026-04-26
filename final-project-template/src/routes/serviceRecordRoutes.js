import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { createServiceRecord, deleteServiceRecord, getServiceRecordById, getServiceRecords, updateServiceRecord } from '../controllers/serviceRecordController.js';

const router = express.Router();
router.use(requireAuth);
router.post('/', createServiceRecord);
router.get('/', getServiceRecords);
router.get('/:id', getServiceRecordById);
router.put('/:id', updateServiceRecord);
router.delete('/:id', deleteServiceRecord);

export default router;
