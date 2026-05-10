export interface MarketplaceListing {
  id: string;
  dog_name: string;
  breed: string;
  price: number;
  age: number;
  location: string;
  image_url?: string;
  description?: string;
  user_id: string;
  created_at: string;
  coordinates?: { lat: number; lng: number };
}
