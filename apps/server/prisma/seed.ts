import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { RAW_100_HOSPITALS, RAW_DOCTORS, INITIAL_DEMO_PATIENTS, INITIAL_DEMO_ASSESSMENTS } from '../src/data/seedData';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding PostgreSQL database via Prisma...');

  // Admin user
  const adminHash = bcrypt.hashSync('admin123', 10);
  await prisma.adminUser.upsert({
    where: { email: 'admin@medimatch.health' },
    update: { passwordHash: adminHash },
    create: {
      email: 'admin@medimatch.health',
      passwordHash: adminHash
    }
  });
  console.log('Seeded Admin: admin@medimatch.health / admin123');

  // Demo Patient user
  const patientHash = bcrypt.hashSync('patient123', 10);
  await prisma.patient.upsert({
    where: { email: 'rajesh.sharma@example.com' },
    update: { passwordHash: patientHash },
    create: {
      fullName: 'Rajesh Sharma',
      phone: '+91 98201 44521',
      age: 58,
      gender: 'Male',
      city: 'Mumbai',
      email: 'rajesh.sharma@example.com',
      passwordHash: patientHash,
      role: 'PATIENT',
      budgetCap: 350000
    }
  });
  console.log('Seeded Demo Patient: rajesh.sharma@example.com / patient123');

  // Hospitals
  console.log(`Seeding ${RAW_100_HOSPITALS.length} hospitals...`);
  for (const h of RAW_100_HOSPITALS) {
    await prisma.hospital.create({
      data: {
        name: h.name,
        city: h.city,
        accreditation: h.accreditation,
        address: h.address,
        beds: h.beds,
        icuBeds: h.icuBeds,
        imageUrl: h.imageUrl
      }
    });
  }

  // Doctors
  console.log(`Seeding ${RAW_DOCTORS.length} doctors...`);
  for (const d of RAW_DOCTORS) {
    await prisma.doctor.create({
      data: {
        name: d.name,
        specialty: d.specialty,
        credentials: d.credentials,
        yearsExp: d.yearsExp,
        fee: d.fee,
        photoUrl: d.photoUrl
      }
    });
  }

  console.log('Database seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

