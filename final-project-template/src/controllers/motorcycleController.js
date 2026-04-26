import prisma from '../config/prisma.js';
import { badRequest, conflict, forbidden, notFound, parsePositiveId, serverError } from '../utils/response.js';
import { isAdmin } from '../middleware/authMiddleware.js';

const includeChildren = { serviceRecords: true, maintenanceReminders: true };

function ownsOrAdmin(req, motorcycle) {
  return isAdmin(req.user) || motorcycle.ownerId === req.user.id;
}

export async function createMotorcycle(req, res) {
  try {
    const { nickname, make, model, year, vin, currentMileage } = req.body;
    if (!nickname || !make || !model) return badRequest(res, 'nickname, make, and model are required');
    if (year && (!Number.isInteger(Number(year)) || Number(year) < 1900)) return badRequest(res, 'year must be valid');
    if (currentMileage !== undefined && (!Number.isInteger(Number(currentMileage)) || Number(currentMileage) < 0)) return badRequest(res, 'currentMileage must be 0 or greater');

    const motorcycle = await prisma.motorcycle.create({
      data: {
        ownerId: req.user.id,
        nickname,
        make,
        model,
        year: year ? Number(year) : null,
        vin: vin || null,
        currentMileage: currentMileage === undefined ? 0 : Number(currentMileage)
      }
    });
    return res.status(201).json(motorcycle);
  } catch (error) {
    if (error.code === 'P2002') return conflict(res, 'VIN already exists');
    return serverError(res, error.message);
  }
}

export async function getMotorcycles(req, res) {
  const where = isAdmin(req.user) ? {} : { ownerId: req.user.id };
  const motorcycles = await prisma.motorcycle.findMany({ where, include: includeChildren, orderBy: { id: 'asc' } });
  return res.status(200).json(motorcycles);
}

export async function getMotorcycleById(req, res) {
  const id = parsePositiveId(req.params.id);
  if (!id) return badRequest(res, 'ID must be a positive integer');

  const motorcycle = await prisma.motorcycle.findUnique({ where: { id }, include: includeChildren });
  if (!motorcycle) return notFound(res, 'Motorcycle not found');
  if (!ownsOrAdmin(req, motorcycle)) return forbidden(res, 'You do not own this motorcycle');

  return res.status(200).json(motorcycle);
}

export async function updateMotorcycle(req, res) {
  try {
    const id = parsePositiveId(req.params.id);
    if (!id) return badRequest(res, 'ID must be a positive integer');

    const motorcycle = await prisma.motorcycle.findUnique({ where: { id } });
    if (!motorcycle) return notFound(res, 'Motorcycle not found');
    if (!ownsOrAdmin(req, motorcycle)) return forbidden(res, 'You do not own this motorcycle');

    const { nickname, make, model, year, vin, currentMileage } = req.body;
    if (!nickname || !make || !model) return badRequest(res, 'nickname, make, and model are required');
    if (year && (!Number.isInteger(Number(year)) || Number(year) < 1900)) return badRequest(res, 'year must be valid');
    if (currentMileage !== undefined && (!Number.isInteger(Number(currentMileage)) || Number(currentMileage) < 0)) return badRequest(res, 'currentMileage must be 0 or greater');

    const updated = await prisma.motorcycle.update({
      where: { id },
      data: { nickname, make, model, year: year ? Number(year) : null, vin: vin || null, currentMileage: Number(currentMileage ?? motorcycle.currentMileage) }
    });
    return res.status(200).json(updated);
  } catch (error) {
    if (error.code === 'P2002') return conflict(res, 'VIN already exists');
    return serverError(res, error.message);
  }
}

export async function deleteMotorcycle(req, res) {
  const id = parsePositiveId(req.params.id);
  if (!id) return badRequest(res, 'ID must be a positive integer');

  const motorcycle = await prisma.motorcycle.findUnique({ where: { id } });
  if (!motorcycle) return notFound(res, 'Motorcycle not found');
  if (!ownsOrAdmin(req, motorcycle)) return forbidden(res, 'You do not own this motorcycle');

  await prisma.motorcycle.delete({ where: { id } });
  return res.status(204).send();
}
