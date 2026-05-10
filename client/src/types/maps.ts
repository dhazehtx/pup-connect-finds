export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description?: string;
  type: 'listing' | 'user' | 'breeder';
  distance?: number;
}
