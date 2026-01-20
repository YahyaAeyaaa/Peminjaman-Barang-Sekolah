'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, User, Eye, ArrowLeft } from 'lucide-react';
import { articlesAPI } from '@/lib/api/articles';
import Link from 'next/link';

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const response = await articlesAPI.getById(params.slug);

        if (response.success) {
          // Hanya tampilkan jika published
          if (response.data.status === 'PUBLISHED') {
            setArticle(response.data);
          } else {
            setError('Artikel tidak ditemukan atau belum dipublikasikan');
          }
        } else {
          setError('Artikel tidak ditemukan');
        }
      } catch (err) {
        console.error('Error fetching article:', err);
        setError('Gagal memuat artikel');
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchArticle();
    }
  }, [params.slug]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Memuat artikel...</div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-600 mb-4">{error || 'Artikel tidak ditemukan'}</p>
            <Link
              href="/peminjam/articles"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft size={16} />
              Kembali ke Daftar Artikel
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/peminjam/articles"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Kembali ke Daftar Artikel</span>
        </Link>

        {/* Article Content */}
        <article className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Thumbnail */}
          {article.thumbnail && (
            <div className="w-full h-64 md:h-96 overflow-hidden bg-gray-100">
              <img
                src={article.thumbnail}
                alt={article.judul}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8">
            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {article.judul}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <User size={16} />
                <span>
                  {article.author
                    ? `${article.author.first_name} ${article.author.last_name}`
                    : 'Admin'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>{formatDate(article.published_at)}</span>
              </div>
              {article.view_count > 0 && (
                <div className="flex items-center gap-2">
                  <Eye size={16} />
                  <span>{article.view_count} views</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {article.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs border border-blue-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Content */}
            <div
              className="prose prose-lg max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: article.konten.replace(/\n/g, '<br />') }}
            />

            {/* Excerpt (if different from content) */}
            {article.excerpt && article.excerpt !== article.konten.substring(0, 200) && (
              <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 italic">{article.excerpt}</p>
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}

