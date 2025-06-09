
declare global {
  interface Window {
    google: typeof google;
  }
}

declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: Element | null, opts?: MapOptions);
      setCenter(latlng: LatLng | LatLngLiteral): void;
      setZoom(zoom: number): void;
      addListener(eventName: string, handler: Function): MapsEventListener;
    }

    class Marker {
      constructor(opts?: MarkerOptions);
      setMap(map: Map | null): void;
      addListener(eventName: string, handler: Function): MapsEventListener;
    }

    class Geocoder {
      constructor();
      geocode(request: GeocoderRequest, callback: (results: GeocoderResult[], status: GeocoderStatus) => void): void;
    }

    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      mapTypeId?: MapTypeId;
      styles?: MapTypeStyle[];
    }

    interface MarkerOptions {
      position?: LatLng | LatLngLiteral;
      map?: Map | null;
      title?: string;
      animation?: Animation;
      icon?: string | Icon | Symbol;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    interface LatLng {
      lat(): number;
      lng(): number;
    }

    interface GeocoderRequest {
      location?: LatLng | LatLngLiteral;
    }

    interface GeocoderResult {
      formatted_address: string;
    }

    interface MapsEventListener {}

    enum MapTypeId {
      ROADMAP = 'roadmap'
    }

    enum Animation {
      DROP = 1
    }

    type GeocoderStatus = string;

    interface MapTypeStyle {
      featureType?: string;
      elementType?: string;
      stylers?: Array<{ [key: string]: any }>;
    }

    interface Icon {
      url: string;
      scaledSize?: Size;
    }

    interface Symbol {}

    class Size {
      constructor(width: number, height: number);
    }

    namespace places {
      class PlacesService {
        constructor(attrContainer: HTMLDivElement);
        textSearch(request: TextSearchRequest, callback: (results: PlaceResult[], status: PlacesServiceStatus) => void): void;
      }

      interface TextSearchRequest {
        query: string;
      }

      interface PlaceResult {
        geometry?: {
          location?: LatLng;
        };
        formatted_address?: string;
        name?: string;
      }

      enum PlacesServiceStatus {
        OK = 'OK'
      }
    }
  }
}

export {};
