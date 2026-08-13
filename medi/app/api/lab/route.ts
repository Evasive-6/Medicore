import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const orders = await prisma.labOrder.findMany({
      include: { patient: true, doctor: { include: { user: true } }, test: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(orders)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch lab orders' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const order = await prisma.labOrder.create({
      data: {
        patientId: body.patientId,
        doctorId: body.doctorId || null,
        testId: body.testId,
        status: body.status || 'PENDING',
        notes: body.notes || null,
      },
    })
    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create lab order' }, { status: 400 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const order = await prisma.labOrder.update({
      where: { id: body.id },
      data: {
        status: body.status ?? undefined,
        result: body.result ?? undefined,
      },
    })
    return NextResponse.json(order)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to update lab order' }, { status: 400 })
  }
}
