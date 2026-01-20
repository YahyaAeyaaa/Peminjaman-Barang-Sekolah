import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { logActivity, getIpAddress, getUserAgent } from '@/lib/activityLogger';

// Helper untuk generate slug dari judul
function generateSlug(judul) {
  return judul
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// GET /api/articles/[id] - Get article by ID or slug
export async function GET(_request, { params }) {
  try {
    const { id } = params;

    const article = await prisma.article.findFirst({
      where: {
        OR: [
          { id: id },
          { slug: id },
        ],
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

    if (!article) {
      return NextResponse.json(
        { success: false, error: 'Artikel tidak ditemukan' },
        { status: 404 }
      );
    }

    // Increment view count (hanya untuk published articles)
    if (article.status === 'PUBLISHED') {
      await prisma.article.update({
        where: { id: article.id },
        data: { view_count: { increment: 1 } },
      });
    }

    return NextResponse.json({
      success: true,
      data: article,
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch article',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// PATCH /api/articles/[id] - Update article (Admin only)
export async function PATCH(request, { params }) {
  try {
    const session = await auth();

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

    const { id } = params;
    const body = await request.json();
    const { judul, konten, excerpt, thumbnail, tags, status } = body;

    // Get existing article
    const existingArticle = await prisma.article.findUnique({
      where: { id },
    });

    if (!existingArticle) {
      return NextResponse.json(
        { success: false, error: 'Artikel tidak ditemukan' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData = {};

    if (judul !== undefined) {
      updateData.judul = judul.trim();
      
      // Generate slug baru jika judul berubah
      if (judul.trim() !== existingArticle.judul) {
        let slug = generateSlug(judul.trim());
        let finalSlug = slug;
        let counter = 1;
        
        // Cek apakah slug sudah ada (selain artikel ini)
        while (
          await prisma.article.findFirst({
            where: {
              slug: finalSlug,
              id: { not: id },
            },
          })
        ) {
          finalSlug = `${slug}-${counter}`;
          counter++;
        }
        updateData.slug = finalSlug;
      }
    }

    if (konten !== undefined) {
      updateData.konten = konten.trim();
    }

    if (excerpt !== undefined) {
      updateData.excerpt = excerpt?.trim() || null;
    }

    if (thumbnail !== undefined) {
      updateData.thumbnail = thumbnail?.trim() || null;
    }

    if (tags !== undefined) {
      updateData.tags = Array.isArray(tags) ? tags : [];
    }

    if (status !== undefined) {
      updateData.status = status;
      
      // Set published_at jika status berubah ke PUBLISHED dan belum ada
      if (status === 'PUBLISHED' && !existingArticle.published_at) {
        updateData.published_at = new Date();
      }
      
      // Set published_at ke null jika status bukan PUBLISHED
      if (status !== 'PUBLISHED' && existingArticle.published_at) {
        updateData.published_at = null;
      }
    }

    // Update article
    const updatedArticle = await prisma.article.update({
      where: { id },
      data: updateData,
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
      action: 'UPDATE',
      tableName: 'articles',
      recordId: updatedArticle.id,
      oldData: {
        judul: existingArticle.judul,
        status: existingArticle.status,
      },
      newData: {
        judul: updatedArticle.judul,
        status: updatedArticle.status,
      },
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      data: updatedArticle,
      message: 'Artikel berhasil diupdate',
    });
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update article',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE /api/articles/[id] - Delete article (Admin only)
export async function DELETE(request, { params }) {
  try {
    const session = await auth();

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

    const { id } = params;

    // Get existing article untuk logging
    const existingArticle = await prisma.article.findUnique({
      where: { id },
    });

    if (!existingArticle) {
      return NextResponse.json(
        { success: false, error: 'Artikel tidak ditemukan' },
        { status: 404 }
      );
    }

    // Delete article
    await prisma.article.delete({
      where: { id },
    });

    // Log activity
    const ipAddress = getIpAddress(request);
    const userAgent = getUserAgent(request);
    await logActivity({
      userId: session.user.id,
      action: 'DELETE',
      tableName: 'articles',
      recordId: id,
      oldData: {
        judul: existingArticle.judul,
        status: existingArticle.status,
      },
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      message: 'Artikel berhasil dihapus',
    });
  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete article',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

