import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const medicines = await prisma.medicine.findMany({ orderBy: { name: 'asc' } })
    return NextResponse.json(medicines)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch medicines' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const medicine = await prisma.medicine.create({
      data: {
        name: body.name,
        category: body.category,
        manufacturer: body.manufacturer || null,
        price: Number(body.price) || 0,
        stock: Number(body.stock) || 0,
        unit: body.unit || 'strip',
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
      },
    })
    return NextResponse.json(medicine, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to add medicine' }, { status: 400 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const medicine = await prisma.medicine.update({
      where: { id: body.id },
      data: { stock: body.stock },
    })
    return NextResponse.json(medicine)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to update medicine' }, { status: 400 })
  }
}
