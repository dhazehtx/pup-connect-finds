
// Backend data models and types

export interface User {
  id: string;
  email: string;
  fullName: string;
  username?: string;
  userType: 'buyer' | 'breeder' | 'shelter' | 'admin';
  phone?: string;
  location?: string;
  bio?: string;
  avatarUrl?: string;
  websiteUrl?: string;
  yearsExperience: number;
  rating: number;
  totalReviews: number;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DogListing {
  id: string;
  dogName: string;
  breed: string;
  age: number; // in months
  price: number;
  imageUrl?: string;
  description?: string;
  healthRecords?: string[];
  vaccinations?: string[];
  temperament?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'sold' | 'pending' | 'inactive';
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  reviewerId: string;
  revieweeId: string;
  listingId?: string;
  createdAt: Date;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  listingId?: string;
  content: string;
  messageType: 'text' | 'image' | 'offer';
  readAt?: Date;
  createdAt: Date;
}

export interface Favorite {
  id: string;
  userId: string;
  listingId: string;
  createdAt: Date;
}

export interface Report {
  id: string;
  reporterId: string;
  reportedUserId?: string;
  reportedListingId?: string;
  reason: string;
  description: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: Date;
}
