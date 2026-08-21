import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const prescriptions = await prisma.prescription.findMany({
      include: {
        patient: true,
        doctor: { include: { user: true } },
        items: { include: { medicine: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(prescriptions)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch prescriptions' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const items = Array.isArray(body.items) ? body.items : []
    if (items.length === 0) {
      return NextResponse.json({ error: 'At least one medicine is required' }, { status: 400 })
    }
    const prescription = await prisma.prescription.create({
      data: {
        patientId: body.patientId,
        doctorId: body.doctorId,
        diagnosis: body.diagnosis || null,
        notes: body.notes || null,
        items: {
          create: items.map((item: { medicineId: string; dosage: string; frequency: string; duration?: string }) => ({
            medicineId: item.medicineId,
            dosage: item.dosage,
            frequency: item.frequency,
            duration: item.duration || null,
          })),
        },
      },
      include: {
        patient: true,
        doctor: { include: { user: true } },
        items: { include: { medicine: true } },
      },
    })
    return NextResponse.json(prescription, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create prescription' }, { status: 400 })
  }
}
