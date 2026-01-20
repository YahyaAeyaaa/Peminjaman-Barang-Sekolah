'use client';

import { useState, useEffect } from 'react';
import { FileText, Calendar, Eye, ArrowRight } from 'lucide-react';
import { articlesAPI } from '@/lib/api/articles';
import Link from 'next/link';

export function NewsSection() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await articlesAPI.getAll({
          published: true,
          limit: 3,
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
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Berita Terkini</p>
            <h2 className="mt-1 text-2xl font-semibold text-gray-900">Pengumuman & Informasi</h2>
          </div>
        </div>
        <div className="flex h-48 items-center justify-center text-gray-400">
          Memuat berita...
        </div>
      </section>
    );
  }

  if (articles.length === 0) {
    return null;
  }

  const featuredArticle = articles[0];
  const sideArticles = articles.slice(1, 3);

  return (
    <section className="rounded-3xl bg-white p-8 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Berita Terkini</p>
          <h2 className="mt-1 text-2xl font-semibold text-gray-900">Pengumuman & Informasi</h2>
        </div>
        <Link
          href="/peminjam/articles"
          className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          Lihat semua
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Featured Article - Large Card */}
        <Link
          href={`/peminjam/articles/${featuredArticle.slug || featuredArticle.id}`}
          className="lg:col-span-3 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 group relative"
        >
          <div className="relative h-56 lg:h-72 w-full overflow-hidden">
            {featuredArticle.thumbnail ? (
              <img
                src={featuredArticle.thumbnail || "/placeholder.svg"}
                alt={featuredArticle.judul}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                <FileText className="h-16 w-16 text-white/50" />
              </div>
            )}
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            {/* Content overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
              <span className="inline-block px-2.5 py-1 bg-red-600 text-white text-[10px] font-semibold rounded mb-2">
                TERBARU
              </span>
              <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-blue-200 transition-colors">
                {featuredArticle.judul}
              </h3>
              <div className="flex items-center gap-3 text-xs text-gray-300">
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  <span>{formatDate(featuredArticle.published_at)}</span>
                </div>
                {featuredArticle.view_count > 0 && (
                  <div className="flex items-center gap-1">
                    <Eye size={12} />
                    <span>{featuredArticle.view_count}x</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Link>

        {/* Side Articles - 2 Horizontal Cards */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {sideArticles.map((article) => (
            <Link
              key={article.id}
              href={`/peminjam/articles/${article.slug || article.id}`}
              className="flex overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 group h-[136px]"
            >
              {/* Thumbnail */}
              <div className="w-28 sm:w-32 flex-shrink-0 overflow-hidden">
                {article.thumbnail ? (
                  <img
                    src={article.thumbnail || "/placeholder.svg"}
                    alt={article.judul}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-white/70" />
                  </div>
                )}
              </div>
              {/* Content */}
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                  <span className="inline-block px-2 py-0.5 bg-gray-200 text-gray-600 text-[10px] font-semibold rounded mb-2">
                    BERITA
                  </span>
                  <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
                    {article.judul}
                  </h4>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar size={10} />
                    <span>{formatDate(article.published_at)}</span>
                  </div>
                  {article.view_count > 0 && (
                    <div className="flex items-center gap-1">
                      <Eye size={10} />
                      <span>{article.view_count}</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
