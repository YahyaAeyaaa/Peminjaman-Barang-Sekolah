import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { logActivity, getIpAddress, getUserAgent } from '@/lib/activityLogger';

// Helper untuk generate slug dari judul
function generateSlug(judul) {
  return judul
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Hapus karakter khusus
    .replace(/[\s_-]+/g, '-') // Ganti spasi dengan dash
    .replace(/^-+|-+$/g, ''); // Hapus dash di awal/akhir
}

// GET /api/articles - List semua articles
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const published = searchParams.get('published'); // 'true' untuk hanya published
    const limit = parseInt(searchParams.get('limit')) || undefined;
    const offset = parseInt(searchParams.get('offset')) || 0;

    // Build where clause
    let whereClause = {};

    // Search filter
    if (search && search.trim() !== '') {
      whereClause.OR = [
        { judul: { contains: search, mode: 'insensitive' } },
        { konten: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Status filter
    if (status && ['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(status)) {
      whereClause.status = status;
    }

    // Published filter (untuk public, hanya tampilkan PUBLISHED)
    if (published === 'true') {
      whereClause.status = 'PUBLISHED';
      whereClause.published_at = { not: null };
    }

    const articles = await prisma.article.findMany({
      where: whereClause,
      include: {
        author: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
      orderBy: {
        published_at: 'desc',
      },
      take: limit,
      skip: offset,
    });

    // Get total count for pagination
    const total = await prisma.article.count({ where: whereClause });

    return NextResponse.json({
      success: true,
      data: articles,
      total,
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch articles',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// POST /api/articles - Create article baru (Admin only)
export async function POST(request) {
  try {
    const session = await auth();

    // Cek authentication
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Cek role admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin only' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { judul, konten, excerpt, thumbnail, tags, status } = body;

    // Validasi
    if (!judul || judul.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Judul artikel wajib diisi' },
        { status: 400 }
      );
    }

    if (!konten || konten.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Konten artikel wajib diisi' },
        { status: 400 }
      );
    }

    // Generate slug
    let slug = generateSlug(judul);
    
    // Cek apakah slug sudah ada, jika ya tambahkan angka
    let finalSlug = slug;
    let counter = 1;
    while (await prisma.article.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    // Set published_at jika status PUBLISHED
    const publishedAt = status === 'PUBLISHED' ? new Date() : null;

    // Create article
    const article = await prisma.article.create({
      data: {
        judul: judul.trim(),
        slug: finalSlug,
        konten: konten.trim(),
        excerpt: excerpt?.trim() || null,
        thumbnail: thumbnail?.trim() || null,
        tags: tags && Array.isArray(tags) ? tags : [],
        status: status || 'DRAFT',
        author_id: session.user.id,
        published_at: publishedAt,
      },
      include: {
        author: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
    });

    // Log activity
    const ipAddress = getIpAddress(request);
    const userAgent = getUserAgent(request);
    await logActivity({
      userId: session.user.id,
      action: 'CREATE',
      tableName: 'articles',
      recordId: article.id,
      newData: {
        judul: article.judul,
        slug: article.slug,
        status: article.status,
      },
      ipAddress,
      userAgent,
    });

    return NextResponse.json(
      {
        success: true,
        data: article,
        message: 'Artikel berhasil dibuat',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create article',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

