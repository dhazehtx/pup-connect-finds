
import React from 'react';
import Layout from '@/components/Layout';
import { Search, Book, MessageCircle, Phone, Mail, HelpCircle } from 'lucide-react';

const HelpCenter = () => {
  const categories = [
    {
      title: "Getting Started",
      icon: Book,
      articles: [
        "How to create an account",
        "Setting up your profile",
        "Finding the right puppy",
        "Understanding breeder verification"
      ]
    },
    {
      title: "Buying a Puppy",
      icon: HelpCircle,
      articles: [
        "How to contact breeders",
        "Questions to ask breeders",
        "Payment and escrow process",
        "Health guarantees and contracts"
      ]
    },
    {
      title: "For Breeders",
      icon: MessageCircle,
      articles: [
        "How to become a verified breeder",
        "Creating your first listing",
        "Managing your breeding business",
        "Best practices for communication"
      ]
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <HelpCircle className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Help & Support Center</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find answers to common questions and get support when you need it
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search help articles... (e.g., 'puppy verification', 'payment methods')"
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
          </div>

          {/* Support Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm text-center">
              <MessageCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Live Chat</h3>
              <p className="text-gray-600 mb-4">Chat with our support team</p>
              <p className="text-sm text-gray-500 mb-4">Available in-app<br />24/7</p>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Start Chat
              </button>
            </div>

            <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm text-center">
              <Mail className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Email Support</h3>
              <p className="text-gray-600 mb-4">support@mypup.com</p>
              <p className="text-sm text-gray-500 mb-4">Response within 4 hours</p>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Send Email
              </button>
            </div>

            <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm text-center">
              <Phone className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Emergency Line</h3>
              <p className="text-gray-600 mb-4">For urgent animal welfare concerns</p>
              <p className="text-sm text-gray-500 mb-4">(555) 123-HELP<br />24/7</p>
              <button className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors">
                Call Now
              </button>
            </div>
          </div>

          {/* Help Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <Icon className="h-8 w-8 text-blue-600 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{category.title}</h3>
                  <ul className="space-y-2">
                    {category.articles.map((article, articleIndex) => (
                      <li key={articleIndex}>
                        <a href="#" className="text-blue-600 hover:text-blue-800 hover:underline">
                          {article}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* FAQ Section */}
          <div className="bg-gray-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions</h2>
            <p className="text-gray-600 text-center mb-6">
              Browse by topic or use the search bar above to find specific answers
            </p>
            <div className="text-center">
              <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                View All FAQs
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HelpCenter;
