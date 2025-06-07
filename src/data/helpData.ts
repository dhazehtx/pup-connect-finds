
import { Book, MessageCircle, Phone, Mail } from 'lucide-react';

export const helpCategories = [
  {
    title: 'Getting Started',
    icon: Book,
    articles: 15,
    description: 'Learn the basics of using MY PUP',
    path: '/help/getting-started'
  },
  {
    title: 'Buying a Puppy',
    icon: MessageCircle,
    articles: 12,
    description: 'Tips for finding and purchasing your perfect companion',
    path: '/help/buying-guide'
  },
  {
    title: 'Selling & Breeding',
    icon: Phone,
    articles: 18,
    description: 'Guidelines for listing and selling puppies',
    path: '/help/selling-breeding'
  },
  {
    title: 'Safety & Trust',
    icon: Mail,
    articles: 8,
    description: 'Staying safe and building trust on the platform',
    path: '/help/safety-trust'
  }
];

export const faqs = [
  {
    question: 'How do I create an account on MY PUP?',
    answer: 'Creating an account is easy! Click the "Sign Up" button in the top right corner, enter your email and create a password. You can also sign up using your Google or Facebook account for faster registration.'
  },
  {
    question: 'How do I verify my breeder account?',
    answer: 'To become a verified breeder, go to your profile settings and click "Get Verified." You\'ll need to provide documentation including business license, health certificates, and references. Our team reviews all applications within 3-5 business days.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers. All payments are processed securely through our escrow system to protect both buyers and sellers.'
  },
  {
    question: 'How does the escrow system work?',
    answer: 'Our escrow system holds your payment securely until you meet the puppy and confirm the transaction. The seller only receives payment after you\'ve had the chance to verify the puppy\'s health and that everything matches the listing.'
  },
  {
    question: 'What if I have issues with a purchase?',
    answer: 'If you encounter any issues, contact our support team immediately. We offer buyer protection and will work with both parties to resolve disputes. In cases of fraud or misrepresentation, we provide full refunds through our guarantee program.'
  },
  {
    question: 'How do I report a suspicious listing?',
    answer: 'Click the "Report" button on any listing that seems suspicious. Our moderation team reviews all reports within 24 hours. You can also contact us directly if you notice patterns of fraudulent behavior.'
  }
];

export const popularArticles = [
  'How to Choose the Right Puppy Breed for Your Family',
  'Understanding Puppy Health Certificates',
  'First-Time Buyer\'s Guide to Puppy Adoption',
  'Red Flags to Watch Out for When Buying a Puppy',
  'Preparing Your Home for a New Puppy'
];
