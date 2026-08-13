import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@medicore.dev' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@medicore.dev',
      passwordHash,
      role: 'ADMIN',
    },
  })

  const doctorUsers = [
    { name: 'Dr. Sarah Johnson', email: 'sarah@medicore.dev', specialization: 'Cardiology', phone: '555-0101', experienceYears: 12, fee: 150 },
    { name: 'Dr. Michael Chen', email: 'michael@medicore.dev', specialization: 'Neurology', phone: '555-0102', experienceYears: 9, fee: 130 },
    { name: 'Dr. Priya Patel', email: 'priya@medicore.dev', specialization: 'Pediatrics', phone: '555-0103', experienceYears: 7, fee: 100 },
    { name: 'Dr. James Rodriguez', email: 'james@medicore.dev', specialization: 'Orthopedics', phone: '555-0104', experienceYears: 15, fee: 160 },
    { name: 'Dr. Emily Davis', email: 'emily@medicore.dev', specialization: 'Dermatology', phone: '555-0105', experienceYears: 5, fee: 90 },
  ]

  const doctors: string[] = []
  for (const d of doctorUsers) {
    const user = await prisma.user.upsert({
      where: { email: d.email },
      update: {},
      create: {
        name: d.name,
        email: d.email,
        passwordHash,
        role: 'DOCTOR',
        doctor: {
          create: {
            specialization: d.specialization,
            phone: d.phone,
            experienceYears: d.experienceYears,
            fee: d.fee,
          },
        },
      },
      include: { doctor: true },
    })
    if (user.doctor) doctors.push(user.doctor.id)
  }

  const patientsData = [
    { name: 'John Smith', email: 'john.smith@example.com', phone: '555-0201', gender: 'MALE', dateOfBirth: new Date('1985-04-12'), bloodGroup: 'O_POSITIVE', address: '123 Maple St, Springfield', insurance: 'Aetna #A-4471', emergencyPhone: '555-0301' },
    { name: 'Maria Garcia', email: 'maria.garcia@example.com', phone: '555-0202', gender: 'FEMALE', dateOfBirth: new Date('1992-11-03'), bloodGroup: 'A_POSITIVE', address: '456 Oak Ave, Riverton', insurance: 'BlueCross #BC-8820', emergencyPhone: '555-0302' },
    { name: 'David Kim', email: 'david.kim@example.com', phone: '555-0203', gender: 'MALE', dateOfBirth: new Date('1978-07-25'), bloodGroup: 'B_NEGATIVE', address: '789 Pine Rd, Lakeside', insurance: 'UnitedHealth #UH-1155', emergencyPhone: '555-0303' },
    { name: 'Aisha Rahman', email: 'aisha.rahman@example.com', phone: '555-0204', gender: 'FEMALE', dateOfBirth: new Date('2001-02-18'), bloodGroup: 'O_NEGATIVE', address: '321 Cedar Ln, Brookfield', insurance: 'Cigna #CG-3309', emergencyPhone: '555-0304' },
    { name: 'Robert Brown', email: 'robert.brown@example.com', phone: '555-0205', gender: 'MALE', dateOfBirth: new Date('1965-09-30'), bloodGroup: 'AB_POSITIVE', address: '654 Birch Blvd, Milltown', insurance: 'Medicare #M-9022', emergencyPhone: '555-0305' },
    { name: 'Linda Nguyen', email: 'linda.nguyen@example.com', phone: '555-0206', gender: 'FEMALE', dateOfBirth: new Date('1998-05-14'), bloodGroup: 'A_NEGATIVE', address: '987 Elm Ct, Fairview', insurance: 'Humana #H-7712', emergencyPhone: '555-0306' },
    { name: 'Carlos Mendes', email: 'carlos.mendes@example.com', phone: '555-0207', gender: 'MALE', dateOfBirth: new Date('1990-12-08'), bloodGroup: 'B_POSITIVE', address: '147 Walnut Way, Greenfield', insurance: 'Aetna #A-5593', emergencyPhone: '555-0307' },
  ]

  const patientIds: string[] = []
  for (const p of patientsData) {
    const patient = await prisma.patient.create({ data: p })
    patientIds.push(patient.id)
  }

  const medicines = [
    { name: 'Paracetamol 500mg', category: 'Analgesic', manufacturer: 'MedPharm', price: 2.5, stock: 500, unit: 'strip', expiryDate: new Date('2027-01-01') },
    { name: 'Amoxicillin 250mg', category: 'Antibiotic', manufacturer: 'CureLabs', price: 6.75, stock: 300, unit: 'strip', expiryDate: new Date('2026-06-01') },
    { name: 'Metformin 500mg', category: 'Antidiabetic', manufacturer: 'GlucoCare', price: 4.2, stock: 250, unit: 'bottle', expiryDate: new Date('2027-03-01') },
    { name: 'Amlodipine 5mg', category: 'Antihypertensive', manufacturer: 'HeartWell', price: 5.0, stock: 180, unit: 'strip', expiryDate: new Date('2026-12-01') },
    { name: 'Omeprazole 20mg', category: 'Antacid', manufacturer: 'DigestPlus', price: 3.9, stock: 400, unit: 'strip', expiryDate: new Date('2027-05-01') },
    { name: 'Ibuprofen 400mg', category: 'Anti-inflammatory', manufacturer: 'ReliefRx', price: 3.2, stock: 60, unit: 'strip', expiryDate: new Date('2026-09-01') },
    { name: 'Cetirizine 10mg', category: 'Antihistamine', manufacturer: 'AllerEase', price: 2.1, stock: 350, unit: 'strip', expiryDate: new Date('2027-02-01') },
    { name: 'Insulin Glargine 100IU', category: 'Antidiabetic', manufacturer: 'GlucoCare', price: 45.0, stock: 40, unit: 'vial', expiryDate: new Date('2026-10-01') },
    { name: 'Salbutamol Inhaler', category: 'Bronchodilator', manufacturer: 'BreathEasy', price: 12.5, stock: 90, unit: 'inhaler', expiryDate: new Date('2027-04-01') },
    { name: 'Atorvastatin 20mg', category: 'Lipid-lowering', manufacturer: 'HeartWell', price: 7.4, stock: 220, unit: 'strip', expiryDate: new Date('2026-11-01') },
  ]

  for (const m of medicines) {
    await prisma.medicine.upsert({
      where: { id: m.name },
      update: {},
      create: m,
    })
  }

  const labTests = [
    { name: 'Complete Blood Count (CBC)', category: 'Hematology', price: 25, description: 'Full blood panel including WBC, RBC, platelets and hemoglobin.' },
    { name: 'Lipid Profile', category: 'Biochemistry', price: 35, description: 'Cholesterol, HDL, LDL and triglycerides measurement.' },
    { name: 'Blood Glucose Test', category: 'Biochemistry', price: 15, description: 'Fasting blood sugar and HbA1c measurement.' },
    { name: 'Urinalysis', category: 'Microbiology', price: 20, description: 'Physical, chemical and microscopic urine examination.' },
    { name: 'Liver Function Test', category: 'Biochemistry', price: 40, description: 'ALT, AST, ALP, bilirubin and albumin levels.' },
    { name: 'Kidney Function Test', category: 'Biochemistry', price: 35, description: 'Creatinine, urea, and electrolyte panel.' },
    { name: 'Chest X-Ray', category: 'Radiology', price: 60, description: 'Chest radiography for thoracic assessment.' },
    { name: 'ECG / EKG', category: 'Cardiology', price: 30, description: 'Electrocardiogram recording of heart activity.' },
  ]

  for (const t of labTests) {
    await prisma.labTest.upsert({
      where: { id: t.name },
      update: {},
      create: t,
    })
  }

  const today = new Date().toISOString().slice(0, 10)
  const appointments = [
    { patientIndex: 0, doctorIndex: 0, date: today, time: '09:00', status: 'CONFIRMED', reason: 'Chest pain follow-up' },
    { patientIndex: 1, doctorIndex: 1, date: today, time: '10:30', status: 'SCHEDULED', reason: 'Migraine consultation' },
    { patientIndex: 2, doctorIndex: 3, date: today, time: '11:00', status: 'CONFIRMED', reason: 'Knee pain evaluation' },
    { patientIndex: 3, doctorIndex: 2, date: today, time: '14:00', status: 'COMPLETED', reason: 'Child wellness check' },
    { patientIndex: 4, doctorIndex: 0, date: today, time: '15:30', status: 'SCHEDULED', reason: 'Blood pressure review' },
    { patientIndex: 5, doctorIndex: 4, date: today, time: '09:30', status: 'COMPLETED', reason: 'Skin rash assessment' },
    { patientIndex: 6, doctorIndex: 2, date: today, time: '16:00', status: 'SCHEDULED', reason: 'Fever and cough' },
  ]

  for (const a of appointments) {
    await prisma.appointment.create({
      data: {
        patientId: patientIds[a.patientIndex],
        doctorId: doctors[a.doctorIndex],
        date: a.date,
        time: a.time,
        status: a.status,
        reason: a.reason,
      },
    })
  }

  const meds = await prisma.medicine.findMany()

  const prescription = await prisma.prescription.create({
    data: {
      patientId: patientIds[3],
      doctorId: doctors[2],
      diagnosis: 'Seasonal allergies with mild viral infection',
      notes: 'Rest and hydrate. Follow up in one week if symptoms persist.',
      items: {
        create: [
          { medicineId: meds[6].id, dosage: '10mg', frequency: 'Once daily', duration: '7 days' },
          { medicineId: meds[0].id, dosage: '500mg', frequency: 'Twice daily', duration: '5 days' },
        ],
      },
    },
  })

  const invoices = [
    { patientIndex: 3, appointmentIndex: 3, amount: 100, status: 'PAID', items: 'Pediatric consultation' },
    { patientIndex: 5, appointmentIndex: 5, amount: 90, status: 'PAID', items: 'Dermatology consultation' },
    { patientIndex: 0, appointmentIndex: 0, amount: 175, status: 'PENDING', items: 'Cardiology consultation + ECG' },
  ]

  const appts = await prisma.appointment.findMany({ orderBy: { createdAt: 'asc' } })

  for (const inv of invoices) {
    await prisma.invoice.create({
      data: {
        patientId: patientIds[inv.patientIndex],
        appointmentId: appts[inv.appointmentIndex]?.id,
        amount: inv.amount,
        status: inv.status,
        items: inv.items,
      },
    })
  }

  const labOrders = [
    { patientIndex: 0, doctorIndex: 0, testIndex: 7, status: 'IN_PROGRESS', notes: 'Pre-surgery cardiac check' },
    { patientIndex: 2, doctorIndex: 3, testIndex: 1, status: 'PENDING', notes: 'Fasting required' },
    { patientIndex: 3, doctorIndex: 2, testIndex: 2, status: 'COMPLETED', result: 'Fasting glucose 92 mg/dL — normal.', notes: 'Routine checkup' },
  ]

  for (const o of labOrders) {
    await prisma.labOrder.create({
      data: {
        patientId: patientIds[o.patientIndex],
        doctorId: doctors[o.doctorIndex],
        testId: (await prisma.labTest.findMany())[o.testIndex].id,
        status: o.status,
        result: o.result,
        notes: o.notes,
      },
    })
  }

  console.log('Seed complete.')
  console.log('  Admin login : admin@medicore.dev / admin123')
  console.log('  Doctor login: sarah@medicore.dev / admin123')
  console.log(`  ${patientIds.length} patients, ${doctors.length} doctors, ${medicines.length} medicines`)
  console.log(`  ${labTests.length} lab tests, ${appointments.length} appointments, ${prescription.id} prescription`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
