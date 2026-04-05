import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

/**
 * DEV ONLY: Seeds a test user for UI verification.
 * Usage: POST /api/dev/seed
 */
export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
  }

  const VSCHOOL_TENANT_ID = '10000000-0000-0000-0000-000000000001';

  try {
    // 1. Ensure Tenant exists
    await prisma.tenant.upsert({
      where: { id: VSCHOOL_TENANT_ID },
      update: {},
      create: {
        id: VSCHOOL_TENANT_ID,
        tenantSlug: 'vschool',
        tenantName: 'V School',
        plan: 'PRO',
        isActive: true
      }
    });

    // 2. Create/Update Test User
    const email = 'tester@vschool.io';
    const password = 'Password123!';
    const passwordHash = await bcrypt.hash(password, 10);

    const employee = await prisma.employee.upsert({
      where: { email },
      update: {
        roles: ['OWNER', 'MANAGER', 'SALES', 'DEV'],
        role: 'OWNER'
      },
      create: {
        employeeId: 'EMP-TEST-001',
        tenantId: VSCHOOL_TENANT_ID,
        firstName: 'Zuri',
        lastName: 'Tester',
        email,
        passwordHash,
        role: 'OWNER',
        roles: ['OWNER', 'MANAGER', 'SALES', 'DEV'],
        status: 'ACTIVE'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Test user created/updated successfully',
      credentials: { email, password }
    });
  } catch (error) {
    console.error('[DevSeed]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
