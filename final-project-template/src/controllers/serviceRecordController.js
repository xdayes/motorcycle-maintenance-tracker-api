import prisma from '../config/prisma.js';
import { badRequest, forbidden, notFound, parsePositiveId, serverError } from '../utils/response.js';
import { isAdmin } from '../middleware/authMiddleware.js';

async function checkMotorcycleAccess(req, motorcycleId) {
  const motorcycle = await prisma.motorcycle.findUnique({ where: { id: motorcycleId } });
  if (!motorcycle) return { error: 'notFound' };
  if (!isAdmin(req.user) && motorcycle.ownerId !== req.user.id) return { error: 'forbidden' };
  return { motorcycle };
}

async function getRecordWithMotorcycle(id) {
  return prisma.serviceRecord.findUnique({ where: { id }, include: { motorcycle: true } });
}

function canAccess(req, record) {
  return isAdmin(req.user) || record.motorcycle.ownerId === req.user.id;
}

export async function createServiceRecord(req, res) {
  try {
    const { motorcycleId, title, serviceDate, mileage, cost, notes } = req.body;
    if (!motorcycleId || !title || !serviceDate || mileage === undefined) return badRequest(res, 'motorcycleId, title, serviceDate, and mileage are required');
    const parsedMotorcycleId = parsePositiveId(motorcycleId);
    if (!parsedMotorcycleId) return badRequest(res, 'motorcycleId must be a positive integer');
    if (!Number.isInteger(Number(mileage)) || Number(mileage) < 0) return badRequest(res, 'mileage must be 0 or greater');

    const access = await checkMotorcycleAccess(req, parsedMotorcycleId);
    if (access.error === 'notFound') return notFound(res, 'Parent motorcycle not found');
    if (access.error === 'forbidden') return forbidden(res, 'You do not own the parent motorcycle');

    const record = await prisma.serviceRecord.create({
      data: {
        motorcycleId: parsedMotorcycleId,
        title,
        serviceDate: new Date(serviceDate),
        mileage: Number(mileage),
        cost: cost === undefined || cost === null ? null : Number(cost),
        notes: notes || null
      }
    });
    return res.status(201).json(record);
  } catch (error) {
    return serverError(res, error.message);
  }
}

export async function getServiceRecords(req, res) {
  const where = isAdmin(req.user) ? {} : { motorcycle: { ownerId: req.user.id } };
  const records = await prisma.serviceRecord.findMany({ where, include: { motorcycle: true }, orderBy: { id: 'asc' } });
  return res.status(200).json(records);
}

export async function getServiceRecordById(req, res) {
  const id = parsePositiveId(req.params.id);
  if (!id) return badRequest(res, 'ID must be a positive integer');
  const record = await getRecordWithMotorcycle(id);
  if (!record) return notFound(res, 'Service record not found');
  if (!canAccess(req, record)) return forbidden(res, 'You do not own this service record');
  return res.status(200).json(record);
}

export async function updateServiceRecord(req, res) {
  try {
    const id = parsePositiveId(req.params.id);
    if (!id) return badRequest(res, 'ID must be a positive integer');
    const existing = await getRecordWithMotorcycle(id);
    if (!existing) return notFound(res, 'Service record not found');
    if (!canAccess(req, existing)) return forbidden(res, 'You do not own this service record');

    const { motorcycleId, title, serviceDate, mileage, cost, notes } = req.body;
    if (!motorcycleId || !title || !serviceDate || mileage === undefined) return badRequest(res, 'motorcycleId, title, serviceDate, and mileage are required');
    const parsedMotorcycleId = parsePositiveId(motorcycleId);
    if (!parsedMotorcycleId) return badRequest(res, 'motorcycleId must be a positive integer');
    if (!Number.isInteger(Number(mileage)) || Number(mileage) < 0) return badRequest(res, 'mileage must be 0 or greater');

    const access = await checkMotorcycleAccess(req, parsedMotorcycleId);
    if (access.error === 'notFound') return notFound(res, 'Parent motorcycle not found');
    if (access.error === 'forbidden') return forbidden(res, 'You do not own the parent motorcycle');

    const updated = await prisma.serviceRecord.update({
      where: { id },
      data: {
        motorcycleId: parsedMotorcycleId,
        title,
        serviceDate: new Date(serviceDate),
        mileage: Number(mileage),
        cost: cost === undefined || cost === null ? null : Number(cost),
        notes: notes || null
      }
    });
    return res.status(200).json(updated);
  } catch (error) {
    return serverError(res, error.message);
  }
}

export async function deleteServiceRecord(req, res) {
  const id = parsePositiveId(req.params.id);
  if (!id) return badRequest(res, 'ID must be a positive integer');
  const record = await getRecordWithMotorcycle(id);
  if (!record) return notFound(res, 'Service record not found');
  if (!canAccess(req, record)) return forbidden(res, 'You do not own this service record');
  await prisma.serviceRecord.delete({ where: { id } });
  return res.status(204).send();
}
