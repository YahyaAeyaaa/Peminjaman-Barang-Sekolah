'use client';

import Image from 'next/image';
import { articles } from '@/data/article';

export default function ArticleSection() {
  return (
    <div className="flex flex-row gap-8 items-start justify-center px-8 py-8 max-w-7xl mx-auto">
      {/* TOP ARTICLE - Left Section */}
      <div className="flex-1 max-w-2xl">
        <div className="relative bg-white rounded-xl overflow-hidden mb-4 p-4">
          {/* Image Container */}
          <div className="relative rounded-xl overflow-hidden mb-4">
            <img 
              src="/image/w.jpg" 
              alt="Top Article" 
              className="w-full h-full object-cover"
            />
            {/* TOP ARTICLE Badge */}
            <div className="absolute bottom-4 left-4 bg-black text-white px-3 py-1.5 rounded-md flex items-center gap-2 text-sm font-medium">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              TOP ARTICLE
            </div>
          </div>
          
          {/* Category */}
          <p className="text-gray-400 text-sm mb-2">CAT BASICS</p>
          
          {/* Title */}
          <h2 className="text-3xl font-bold text-black mb-4">
            10 Simple Ways To Keep the Litter Box Area Clean
          </h2>
          
          {/* Description */}
          <p className="text-gray-700 mb-6 leading-relaxed">
            With such rigorous bathing schedules, cats are known to be very tidy creatures. But they are downright useless with a litter scoop and broom. I used to find myself in...
          </p>
          
          {/* Author */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden">
              <img 
                src="image/profile.jpg" 
                alt="Author" 
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-gray-600 text-sm">by Liz Coleman</span>
          </div>
        </div>
      </div>

      {/* RECENT ARTICLES - Right Section */}
      <div className="flex-1 max-w-md">
        <h3 className="text-2xl font-bold text-black mb-6">RECENT ARTICLES</h3>
        
        <div className="space-y-6">
          {articles.slice(0, 3).map((article) => (
            <div 
              key={article.id}
              className="bg-white rounded-xl p-6 flex gap-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                <img 
                  src={article.image} 
                  alt={article.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="text-gray-400 text-xs mb-1">{article.category}</p>
                <h4 className="text-base font-bold text-black mb-2 line-clamp-2">
                  {article.title}
                </h4>
                <div className="flex items-center gap-2 mt-3">
                  <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden">
                    <img 
                      src={article.authorImage} 
                      alt={article.author} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-gray-600 text-xs">by {article.author}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

