import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const doctors = await prisma.doctor.findMany({
      include: { user: true },
      orderBy: { user: { name: 'asc' } },
    })
    return NextResponse.json(doctors)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch doctors' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const existing = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } })
    if (existing) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(body.password || 'doctor123', 10)

    const doctor = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email.toLowerCase(),
        passwordHash,
        role: 'DOCTOR',
        doctor: {
          create: {
            specialization: body.specialization,
            phone: body.phone,
            experienceYears: Number(body.experienceYears) || 0,
            fee: Number(body.fee) || 0,
            available: body.available !== 'false',
          },
        },
      },
      include: { doctor: true },
    })

    return NextResponse.json(doctor, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create doctor' }, { status: 400 })
  }
}
