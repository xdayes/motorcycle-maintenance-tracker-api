import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.maintenanceReminder.deleteMany();
  await prisma.serviceRecord.deleteMany();
  await prisma.motorcycle.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password123!', 10);

  const owner = await prisma.user.create({
    data: {
      fullName: 'Owner User',
      email: 'owner@example.com',
      passwordHash,
      role: 'USER'
    }
  });

  const notOwner = await prisma.user.create({
    data: {
      fullName: 'Not Owner User',
      email: 'not-owner@example.com',
      passwordHash,
      role: 'USER'
    }
  });

  const admin = await prisma.user.create({
    data: {
      fullName: 'Admin User',
      email: 'admin@example.com',
      passwordHash,
      role: 'ADMIN'
    }
  });

  const hornet = await prisma.motorcycle.create({
    data: {
      ownerId: owner.id,
      nickname: 'Hornet',
      make: 'Honda',
      model: 'CB600F',
      year: 2008,
      vin: 'OWNER-HORNET-001',
      currentMileage: 18250
    }
  });

  const ninja = await prisma.motorcycle.create({
    data: {
      ownerId: notOwner.id,
      nickname: 'Ninja',
      make: 'Kawasaki',
      model: 'Ninja 400',
      year: 2020,
      vin: 'NOTOWNER-NINJA-001',
      currentMileage: 9200
    }
  });

  await prisma.serviceRecord.createMany({
    data: [
      {
        motorcycleId: hornet.id,
        title: 'Oil Change',
        serviceDate: new Date('2026-04-01T12:00:00.000Z'),
        mileage: 18250,
        cost: 65.5,
        notes: 'Changed oil and filter.'
      },
      {
        motorcycleId: ninja.id,
        title: 'Brake Inspection',
        serviceDate: new Date('2026-04-05T12:00:00.000Z'),
        mileage: 9200,
        cost: 40,
        notes: 'Checked front and rear brakes.'
      }
    ]
  });

  await prisma.maintenanceReminder.createMany({
    data: [
      {
        motorcycleId: hornet.id,
        taskName: 'Chain Service',
        intervalMiles: 500,
        intervalMonths: 1,
        dueMileage: 19000,
        dueDate: new Date('2026-05-01T12:00:00.000Z'),
        status: 'ACTIVE'
      },
      {
        motorcycleId: ninja.id,
        taskName: 'Coolant Flush',
        intervalMiles: 12000,
        intervalMonths: 24,
        dueMileage: 12000,
        dueDate: new Date('2026-07-01T12:00:00.000Z'),
        status: 'ACTIVE'
      }
    ]
  });

  console.log('Database seeded successfully.');
  console.log('owner@example.com / Password123!');
  console.log('not-owner@example.com / Password123!');
  console.log('admin@example.com / Password123!');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
