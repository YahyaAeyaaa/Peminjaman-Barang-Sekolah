'use client';

import { useState, useEffect } from 'react';
import { FileText, Calendar, User, Eye, ArrowRight } from 'lucide-react';
import { articlesAPI } from '@/lib/api/articles';
import Link from 'next/link';

export default function ArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await articlesAPI.getAll({
          published: true,
          limit: 20,
        });

        if (response.success) {
          setArticles(response.data);
        }
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Memuat artikel...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Pengumuman & Berita
          </h1>
          <p className="text-gray-600">
            Informasi terbaru dan pengumuman penting untuk peminjam
          </p>
        </div>

        {/* Articles Grid */}
        {articles.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">Belum ada artikel yang dipublikasikan</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/peminjam/articles/${article.slug || article.id}`}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
              >
                {article.thumbnail ? (
                  <div className="h-48 w-full overflow-hidden bg-gray-100">
                    <img
                      src={article.thumbnail}
                      alt={article.judul}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="h-48 w-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                    <FileText className="h-16 w-16 text-blue-400" />
                  </div>
                )}

                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {article.judul}
                  </h3>

                  {article.excerpt && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {article.excerpt}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{formatDate(article.published_at)}</span>
                      </div>
                      {article.view_count > 0 && (
                        <div className="flex items-center gap-1">
                          <Eye size={14} />
                          <span>{article.view_count}</span>
                        </div>
                      )}
                    </div>
                    <ArrowRight
                      size={16}
                      className="text-blue-600 group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

