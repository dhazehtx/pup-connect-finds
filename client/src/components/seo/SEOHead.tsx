
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
}

const SITE_BRAND = 'Pet Adoption Web Services';
const DEFAULT_PAGE_TITLE = 'Pet Adoption Web Services | petadoptionwebservices.com';
const DEFAULT_DESCRIPTION =
  'petadoptionwebservices.com — Connect with verified breeders, shelters, and trusted pet service providers on PAWS. Discover puppies, pet products, and services in one secure platform.';

const SEOHead = ({
  title = DEFAULT_PAGE_TITLE,
  description = DEFAULT_DESCRIPTION,
  keywords =
    'petadoptionwebservices.com, Pet Adoption Web Services, PAWS, pet adoption, puppies, breeders, shelters, pet services',
  image = '/logo/paws-logo.png',
  url = 'https://petadoptionwebservices.com/',
  type = 'website',
}: SEOHeadProps) => {
  const fullTitle =
    title.includes('petadoptionwebservices') ||
    title.includes('Pet Adoption Web Services') ||
    title.includes('PAWS')
      ? title
      : `${title} | petadoptionwebservices.com`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="tagline" content="Find Your Perfect Puppy Companion" />
      <meta name="keywords" content={keywords} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_BRAND} />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* PWA Meta Tags */}
      <meta name="theme-color" content="#2563eb" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={SITE_BRAND} />
      
      {/* Performance & Security */}
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta httpEquiv="X-Frame-Options" content="DENY" />
      <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
      
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": SITE_BRAND,
          "description": description,
          "url": url,
          "applicationCategory": "LifestyleApplication",
          "operatingSystem": "Web Browser"
        })}
      </script>
    </Helmet>
  );
};

export default SEOHead;
