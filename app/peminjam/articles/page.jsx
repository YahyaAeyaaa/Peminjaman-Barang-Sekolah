'use client';

import { useState, useEffect } from 'react';
import { FileText, Calendar, Eye, ArrowRight, User } from 'lucide-react';
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

  const getAuthorName = (author) => {
    if (!author) return '';
    const fullName = `${author.first_name || ''} ${author.last_name || ''}`.trim();
    return fullName || author.email || '';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Memuat artikel...</div>
      </div>
    );
  }

  // Separate featured article (newest) and other articles
  const featuredArticle = articles[0];
  const sideArticles = articles.slice(1, 4); // 3 articles for the right side
  const remainingArticles = articles.slice(4); // Rest of the articles

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

        {/* Articles */}
        {articles.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">Belum ada artikel yang dipublikasikan</p>
          </div>
        ) : (
          <>
            {/* Featured Section - Big card left, 3 small cards right */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-12">
              {/* Featured Article - Large Card */}
              {featuredArticle && (
                <Link
                  href={`/peminjam/articles/${featuredArticle.slug || featuredArticle.id}`}
                  className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all group relative"
                >
                  <div className="relative h-64 lg:h-[420px] w-full overflow-hidden">
                    {featuredArticle.thumbnail ? (
                      <img
                        src={featuredArticle.thumbnail || "/placeholder.svg"}
                        alt={featuredArticle.judul}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                        <FileText className="h-24 w-24 text-white/50" />
                      </div>
                    )}
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    
                    {/* Content overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <span className="inline-block px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded mb-3">
                        BERITA TERBARU
                      </span>
                      <h2 className="text-xl lg:text-2xl font-bold mb-3 line-clamp-3 group-hover:text-blue-200 transition-colors">
                        {featuredArticle.judul}
                      </h2>
                      {featuredArticle.excerpt && (
                        <p className="text-sm text-gray-200 mb-4 line-clamp-2 hidden sm:block">
                          {featuredArticle.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-300">
                        {featuredArticle.author && (
                          <div className="flex items-center gap-1">
                            <User size={14} />
                            <span>{getAuthorName(featuredArticle.author)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>{formatDate(featuredArticle.published_at)}</span>
                        </div>
                        {featuredArticle.view_count > 0 && (
                          <div className="flex items-center gap-1">
                            <Eye size={14} />
                            <span>{featuredArticle.view_count}x dilihat</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              )}

              {/* Side Articles - 3 Horizontal Cards */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                {sideArticles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/peminjam/articles/${article.slug || article.id}`}
                    className="flex bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all group h-[130px]"
                  >
                    {/* Thumbnail */}
                    <div className="w-32 sm:w-40 flex-shrink-0 overflow-hidden">
                      {article.thumbnail ? (
                        <img
                          src={article.thumbnail || "/placeholder.svg"}
                          alt={article.judul}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                          <FileText className="h-8 w-8 text-white/70" />
                        </div>
                      )}
                    </div>
                    {/* Content */}
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div>
                        <span className="inline-block px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-semibold rounded mb-2">
                          BERITA
                        </span>
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
                          {article.judul}
                        </h3>
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

            {/* Remaining Articles Section */}
            {remainingArticles.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Berita Lainnya</h2>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                
                <div className="space-y-4">
                  {remainingArticles.map((article) => (
                    <Link
                      key={article.id}
                      href={`/peminjam/articles/${article.slug || article.id}`}
                      className="flex bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all group"
                    >
                      {/* Thumbnail */}
                      <div className="w-40 sm:w-56 md:w-72 h-40 sm:h-44 flex-shrink-0 overflow-hidden">
                        {article.thumbnail ? (
                          <img
                            src={article.thumbnail || "/placeholder.svg"}
                            alt={article.judul}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <FileText className="h-12 w-12 text-white/70" />
                          </div>
                        )}
                      </div>
                      {/* Content */}
                      <div className="flex-1 p-5 flex flex-col justify-between">
                        <div>
                          <span className="inline-block px-2 py-0.5 bg-red-100 text-red-600 text-xs font-semibold rounded mb-2">
                            BERITA
                          </span>
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors mb-2">
                            {article.judul}
                          </h3>
                          {article.excerpt && (
                            <p className="text-sm text-gray-600 line-clamp-2 hidden sm:block">
                              {article.excerpt}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            {article.author && (
                              <div className="flex items-center gap-1">
                                <span className="text-gray-400">Oleh</span>
                                <span className="font-medium text-blue-600">
                                  {getAuthorName(article.author)}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Calendar size={12} />
                              <span>{formatDate(article.published_at)}</span>
                            </div>
                            {article.view_count > 0 && (
                              <div className="flex items-center gap-1">
                                <Eye size={12} />
                                <span>DILIHAT: {article.view_count}x</span>
                              </div>
                            )}
                          </div>
                          <ArrowRight
                            size={18}
                            className="text-blue-600 group-hover:translate-x-1 transition-transform hidden sm:block"
                          />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
