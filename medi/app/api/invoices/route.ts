import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      include: { patient: true, appointment: { include: { doctor: { include: { user: true } } } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(invoices)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const invoice = await prisma.invoice.create({
      data: {
        patientId: body.patientId,
        appointmentId: body.appointmentId || null,
        amount: Number(body.amount) || 0,
        status: body.status || 'PENDING',
        items: body.items || 'General services',
      },
    })
    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 400 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const invoice = await prisma.invoice.update({
      where: { id: body.id },
      data: { status: body.status },
    })
    return NextResponse.json(invoice)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 400 })
  }
}
