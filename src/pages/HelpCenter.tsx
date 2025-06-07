
import React, { useState } from 'react';
import HelpHeader from '@/components/help/HelpHeader';
import HelpCategoryCard from '@/components/help/HelpCategoryCard';
import FAQSection from '@/components/help/FAQSection';
import HelpSidebar from '@/components/help/HelpSidebar';
import { helpCategories, faqs, popularArticles } from '@/data/helpData';

const HelpCenter = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen bg-cloud-white">
      <HelpHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Help Categories */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-deep-navy mb-8 text-center">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {helpCategories.map((category, index) => (
              <HelpCategoryCard
                key={index}
                title={category.title}
                icon={<category.icon className="h-6 w-6" />}
                articles={category.articles}
                description={category.description}
                path={category.path}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <FAQSection faqs={faqs} />
          <HelpSidebar popularArticles={popularArticles} />
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
