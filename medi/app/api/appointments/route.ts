import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      include: { patient: true, doctor: { include: { user: true } } },
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
    })
    return NextResponse.json(appointments)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const appointment = await prisma.appointment.create({
      data: {
        patientId: body.patientId,
        doctorId: body.doctorId,
        date: body.date,
        time: body.time,
        status: body.status || 'SCHEDULED',
        reason: body.reason || null,
      },
    })
    return NextResponse.json(appointment, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to schedule appointment' }, { status: 400 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const appointment = await prisma.appointment.update({
      where: { id: body.id },
      data: { status: body.status },
    })
    return NextResponse.json(appointment)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 400 })
  }
}
