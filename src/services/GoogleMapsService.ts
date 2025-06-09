
export class GoogleMapsService {
  private static apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
  private static isLoaded = false;

  static async loadGoogleMaps(): Promise<typeof google> {
    if (this.isLoaded && window.google) {
      return window.google;
    }

    if (!this.apiKey) {
      throw new Error('Google Maps API key is not configured');
    }

    const { Loader } = await import('@googlemaps/js-api-loader');
    
    const loader = new Loader({
      apiKey: this.apiKey,
      version: 'weekly',
      libraries: ['places', 'geometry']
    });

    await loader.load();
    this.isLoaded = true;
    return window.google;
  }

  static async getCurrentLocation(): Promise<{lat: number; lng: number; accuracy: number}> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    });
  }

  static calculateDistance(point1: {lat: number; lng: number}, point2: {lat: number; lng: number}): number {
    const R = 3959; // Earth's radius in miles
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  static async reverseGeocode(lat: number, lng: number): Promise<string> {
    await this.loadGoogleMaps();
    
    return new Promise((resolve, reject) => {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode(
        { location: { lat, lng } },
        (results, status) => {
          if (status === 'OK' && results?.[0]) {
            resolve(results[0].formatted_address);
          } else {
            reject(new Error('Geocoding failed'));
          }
        }
      );
    });
  }

  static async searchPlaces(query: string): Promise<Array<{lat: number; lng: number; address: string}>> {
    await this.loadGoogleMaps();
    
    return new Promise((resolve, reject) => {
      const service = new google.maps.places.PlacesService(document.createElement('div'));
      
      service.textSearch(
        { query },
        (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            const locations = results.map(result => ({
              lat: result.geometry?.location?.lat() || 0,
              lng: result.geometry?.location?.lng() || 0,
              address: result.formatted_address || result.name || ''
            }));
            resolve(locations);
          } else {
            reject(new Error('Places search failed'));
          }
        }
      );
    });
  }
}
