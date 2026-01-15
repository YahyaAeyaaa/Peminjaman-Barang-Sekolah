import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET /api/activity-logs - Get activity logs (ADMIN only)
export async function GET(request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action'); // CREATE, UPDATE, DELETE, LOGIN, dll
    const table_name = searchParams.get('table_name'); // users, equipment, loans, dll
    const user_id = searchParams.get('user_id'); // Filter by user
    const date_from = searchParams.get('date_from'); // YYYY-MM-DD
    const date_to = searchParams.get('date_to'); // YYYY-MM-DD
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};

    if (action) {
      where.action = action;
    }

    if (table_name) {
      where.table_name = table_name;
    }

    if (user_id) {
      where.user_id = user_id;
    }

    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) {
        where.created_at.gte = new Date(date_from + 'T00:00:00.000Z');
      }
      if (date_to) {
        where.created_at.lte = new Date(date_to + 'T23:59:59.999Z');
      }
    }

    // Get logs with user info
    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              first_name: true,
              last_name: true,
              role: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.activityLog.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil log aktivitas', message: error.message },
      { status: 500 }
    );
  }
}


