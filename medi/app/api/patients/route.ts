import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const patients = await prisma.patient.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json(patients)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const patient = await prisma.patient.create({
      data: {
        name: body.name,
        email: body.email || null,
        phone: body.phone,
        gender: body.gender || 'OTHER',
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        bloodGroup: body.bloodGroup || null,
        address: body.address || null,
        insurance: body.insurance || null,
        emergencyPhone: body.emergencyPhone || null,
        notes: body.notes || null,
      },
    })
    return NextResponse.json(patient, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create patient' }, { status: 400 })
  }
}
