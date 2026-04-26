import prisma from '../config/prisma.js';
import { badRequest, forbidden, notFound, parsePositiveId, serverError } from '../utils/response.js';
import { isAdmin } from '../middleware/authMiddleware.js';

async function checkMotorcycleAccess(req, motorcycleId) {
  const motorcycle = await prisma.motorcycle.findUnique({ where: { id: motorcycleId } });
  if (!motorcycle) return { error: 'notFound' };
  if (!isAdmin(req.user) && motorcycle.ownerId !== req.user.id) return { error: 'forbidden' };
  return { motorcycle };
}

async function getReminderWithMotorcycle(id) {
  return prisma.maintenanceReminder.findUnique({ where: { id }, include: { motorcycle: true } });
}

function canAccess(req, reminder) {
  return isAdmin(req.user) || reminder.motorcycle.ownerId === req.user.id;
}

function validateNumbers({ intervalMiles, intervalMonths, dueMileage }) {
  for (const [key, value] of Object.entries({ intervalMiles, intervalMonths, dueMileage })) {
    if (value !== undefined && value !== null && (!Number.isInteger(Number(value)) || Number(value) < 0)) {
      return `${key} must be 0 or greater`;
    }
  }
  return null;
}

export async function createReminder(req, res) {
  try {
    const { motorcycleId, taskName, intervalMiles, intervalMonths, dueMileage, dueDate, status } = req.body;
    if (!motorcycleId || !taskName) return badRequest(res, 'motorcycleId and taskName are required');
    const parsedMotorcycleId = parsePositiveId(motorcycleId);
    if (!parsedMotorcycleId) return badRequest(res, 'motorcycleId must be a positive integer');
    const numberError = validateNumbers({ intervalMiles, intervalMonths, dueMileage });
    if (numberError) return badRequest(res, numberError);

    const access = await checkMotorcycleAccess(req, parsedMotorcycleId);
    if (access.error === 'notFound') return notFound(res, 'Parent motorcycle not found');
    if (access.error === 'forbidden') return forbidden(res, 'You do not own the parent motorcycle');

    const reminder = await prisma.maintenanceReminder.create({
      data: {
        motorcycleId: parsedMotorcycleId,
        taskName,
        intervalMiles: intervalMiles === undefined || intervalMiles === null ? null : Number(intervalMiles),
        intervalMonths: intervalMonths === undefined || intervalMonths === null ? null : Number(intervalMonths),
        dueMileage: dueMileage === undefined || dueMileage === null ? null : Number(dueMileage),
        dueDate: dueDate ? new Date(dueDate) : null,
        status: status || 'ACTIVE'
      }
    });
    return res.status(201).json(reminder);
  } catch (error) {
    return serverError(res, error.message);
  }
}

export async function getReminders(req, res) {
  const where = isAdmin(req.user) ? {} : { motorcycle: { ownerId: req.user.id } };
  const reminders = await prisma.maintenanceReminder.findMany({ where, include: { motorcycle: true }, orderBy: { id: 'asc' } });
  return res.status(200).json(reminders);
}

export async function getReminderById(req, res) {
  const id = parsePositiveId(req.params.id);
  if (!id) return badRequest(res, 'ID must be a positive integer');
  const reminder = await getReminderWithMotorcycle(id);
  if (!reminder) return notFound(res, 'Maintenance reminder not found');
  if (!canAccess(req, reminder)) return forbidden(res, 'You do not own this maintenance reminder');
  return res.status(200).json(reminder);
}

export async function updateReminder(req, res) {
  try {
    const id = parsePositiveId(req.params.id);
    if (!id) return badRequest(res, 'ID must be a positive integer');
    const existing = await getReminderWithMotorcycle(id);
    if (!existing) return notFound(res, 'Maintenance reminder not found');
    if (!canAccess(req, existing)) return forbidden(res, 'You do not own this maintenance reminder');

    const { motorcycleId, taskName, intervalMiles, intervalMonths, dueMileage, dueDate, status } = req.body;
    if (!motorcycleId || !taskName) return badRequest(res, 'motorcycleId and taskName are required');
    const parsedMotorcycleId = parsePositiveId(motorcycleId);
    if (!parsedMotorcycleId) return badRequest(res, 'motorcycleId must be a positive integer');
    const numberError = validateNumbers({ intervalMiles, intervalMonths, dueMileage });
    if (numberError) return badRequest(res, numberError);

    const access = await checkMotorcycleAccess(req, parsedMotorcycleId);
    if (access.error === 'notFound') return notFound(res, 'Parent motorcycle not found');
    if (access.error === 'forbidden') return forbidden(res, 'You do not own the parent motorcycle');

    const updated = await prisma.maintenanceReminder.update({
      where: { id },
      data: {
        motorcycleId: parsedMotorcycleId,
        taskName,
        intervalMiles: intervalMiles === undefined || intervalMiles === null ? null : Number(intervalMiles),
        intervalMonths: intervalMonths === undefined || intervalMonths === null ? null : Number(intervalMonths),
        dueMileage: dueMileage === undefined || dueMileage === null ? null : Number(dueMileage),
        dueDate: dueDate ? new Date(dueDate) : null,
        status: status || existing.status
      }
    });
    return res.status(200).json(updated);
  } catch (error) {
    return serverError(res, error.message);
  }
}

export async function deleteReminder(req, res) {
  const id = parsePositiveId(req.params.id);
  if (!id) return badRequest(res, 'ID must be a positive integer');
  const reminder = await getReminderWithMotorcycle(id);
  if (!reminder) return notFound(res, 'Maintenance reminder not found');
  if (!canAccess(req, reminder)) return forbidden(res, 'You do not own this maintenance reminder');
  await prisma.maintenanceReminder.delete({ where: { id } });
  return res.status(204).send();
}
