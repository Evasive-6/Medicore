import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const tests = await prisma.labTest.findMany({ orderBy: { category: 'asc' } })
    return NextResponse.json(tests)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch lab tests' }, { status: 500 })
  }
}
