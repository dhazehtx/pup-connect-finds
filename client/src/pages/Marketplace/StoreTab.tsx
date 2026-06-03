import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronLeft, ChevronRight, ShoppingCart, PawPrint, X } from 'lucide-react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import FilterBar, { type StoreSortType } from '@/components/FilterBar';
import { useCart } from '@/hooks/use-cart';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import ProductTags from '@/components/ProductTags';
import StripeCheckoutDemo from '@/components/StripeCheckoutDemo';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Link } from 'react-router-dom';
import {
  truncateProductDescription,
  PRODUCT_DESCRIPTION_PREVIEW_LENGTH,
} from '@/lib/productDescription';
import { STORE_TAG_FILTERS_ENABLED } from '@/components/store/storeUiFlags';

interface Product {
  id: string;
  name: string;
  description?: string | null;
  unit_price: string;
  image_url?: string | null;
  is_subscription: boolean;
  is_active: boolean;
  is_featured?: boolean;
  tags?: string[] | null;
  metadata?: { gallery?: string[] } | null;
  inventory_qty: number;
  category?: string;
  rating?: number;
  reviews_count?: number;
  is_discounted?: boolean;
  original_price?: string;
  sales_count?: number;
}

function getProductImageSlides(product: Product): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const push = (u: string | null | undefined) => {
    if (!u || typeof u !== 'string') return;
    const t = u.trim();
    if (!t || seen.has(t)) return;
    seen.add(t);
    out.push(t);
  };
  push(product.image_url);
  const gallery = product.metadata?.gallery;
  if (Array.isArray(gallery)) {
    for (const item of gallery) {
      push(typeof item === 'string' ? item : undefined);
    }
  }
  return out;
}

function StoreProductImage({
  name,
  src,
}: {
  name: string;
  src: string | null | undefined;
}) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <ShoppingCart className="w-12 h-12 text-gray-300" aria-hidden />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={name}
      loading="lazy"
      decoding="async"
      onError={() => setBroken(true)}
    />
  );
}

function ProductImageLightbox({
  product,
  open,
  onOpenChange,
}: {
  product: Product | null;
  open: boolean;
  onOpenChange: (next: boolean) => void;
}) {
  const slides = useMemo(() => (product ? getProductImageSlides(product) : []), [product]);
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    if (open) setSlideIndex(0);
  }, [open, product?.id]);

  useEffect(() => {
    if (!open || slides.length <= 1) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setSlideIndex((i) => (i - 1 + slides.length) % slides.length);
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setSlideIndex((i) => (i + 1) % slides.length);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, slides.length]);

  if (!product || slides.length === 0) {
    return null;
  }

  const activeSrc = slides[slideIndex] ?? slides[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[92dvh] w-[min(96vw,920px)] max-w-[min(96vw,920px)] flex-col gap-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl focus:outline-none focus-visible:ring-0 sm:rounded-2xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogClose asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-3 top-3 z-[110] h-9 w-9 rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
            aria-label="Close gallery"
          >
            <X className="h-5 w-5" />
          </Button>
        </DialogClose>

        <div className="border-b border-slate-100 px-5 pb-4 pt-5 pr-14 text-left">
          <DialogTitle className="text-lg font-semibold leading-snug text-slate-900 sm:text-xl">
            {product.name}
          </DialogTitle>
          <p className="mt-1 text-base font-semibold text-[#0074d4]">
            ${parseFloat(product.unit_price).toFixed(2)}
          </p>
          {slides.length > 1 && (
            <p className="mt-1.5 text-xs text-slate-500" aria-live="polite">
              Image {slideIndex + 1} of {slides.length} — use arrows or keyboard
            </p>
          )}
        </div>

        <div className="relative px-3 pb-5 pt-3 sm:px-6 sm:pb-7 sm:pt-5">
          <div className="relative flex min-h-[min(56dvh,520px)] items-center justify-center rounded-xl bg-slate-100 sm:min-h-[min(68dvh,640px)]">
            <img
              key={activeSrc}
              src={activeSrc}
              alt={`${product.name} — ${slideIndex + 1}`}
              className="max-h-[min(52dvh,560px)] w-full max-w-full object-contain p-3 sm:max-h-[min(62dvh,680px)] sm:p-6"
              loading="eager"
              decoding="async"
            />

            {slides.length > 1 && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="absolute left-2 top-1/2 z-[110] h-10 w-10 -translate-y-1/2 rounded-full border-slate-200 bg-white text-slate-800 shadow-md hover:bg-slate-50 sm:left-3"
                  aria-label="Previous image"
                  onClick={() =>
                    setSlideIndex((i) => (i - 1 + slides.length) % slides.length)
                  }
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="absolute right-2 top-1/2 z-[110] h-10 w-10 -translate-y-1/2 rounded-full border-slate-200 bg-white text-slate-800 shadow-md hover:bg-slate-50 sm:right-3"
                  aria-label="Next image"
                  onClick={() => setSlideIndex((i) => (i + 1) % slides.length)}
                >
                  <ChevronRight className="h-5 w-5" aria-hidden />
                </Button>

                <div
                  className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-white/95 px-2 py-1 shadow-sm ring-1 ring-slate-200/80"
                  aria-hidden
                >
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`h-2 w-2 rounded-full transition-colors ${
                        i === slideIndex ? 'bg-[#0074d4]' : 'bg-slate-300 hover:bg-slate-400'
                      }`}
                      aria-label={`Go to image ${i + 1}`}
                      aria-current={i === slideIndex}
                      onClick={() => setSlideIndex(i)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {product.description ? (
            <div className="mt-4 max-h-[28dvh] overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-left sm:mx-6 sm:mb-2">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Description</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// SOL:STORE:START
const StoreTab = () => {
  const { addToCart, isInCart, getItemCount } = useCart();
  const { toast } = useToast();
  const { requireAuth } = useRequireAuth();
  const navigate = useNavigate();
  const [addingItems, setAddingItems] = useState<Set<string>>(new Set());
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
  const [buyingItems, setBuyingItems] = useState<Set<string>>(new Set());
  const [sortType, setSortType] = useState<StoreSortType>('price-low-high');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [lightboxProduct, setLightboxProduct] = useState<Product | null>(null);

  // Fetch products from API with enhanced error handling
  const { data: productsResponse, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['/api/products', { tag: selectedTag }],
    queryFn: async () => {
      try {
        const url = selectedTag ? `/api/products?tag=${encodeURIComponent(selectedTag)}` : '/api/products';
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 10000);
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
          signal: controller.signal,
        });
        window.clearTimeout(timeout);
        
        if (!response.ok) {
          console.error('Products fetch failed:', response.status, response.statusText);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Products loaded successfully:', data);
        return data;
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          throw new Error('Request timed out while loading products.');
        }
        console.error('Products API error:', err);
        throw err;
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const products = (productsResponse?.data || []) as Product[];
  const showInitialLoading = (isLoading || isFetching) && products.length === 0;

  const applySort = (list: Product[], sort: StoreSortType): Product[] => {
    const sorted = [...list].filter((product) => product && product.name && product.unit_price && product.is_active);

    switch (sort) {
      case 'price-low-high':
        return sorted.sort((a, b) => parseFloat(a.unit_price) - parseFloat(b.unit_price));
      case 'price-high-low':
        return sorted.sort((a, b) => parseFloat(b.unit_price) - parseFloat(a.unit_price));
      case 'sale':
        return sorted.sort((a, b) => {
          if (a.is_discounted && !b.is_discounted) return -1;
          if (!a.is_discounted && b.is_discounted) return 1;
          if (a.is_discounted && b.is_discounted && a.original_price && b.original_price) {
            const aDiscount = parseFloat(a.original_price) - parseFloat(a.unit_price);
            const bDiscount = parseFloat(b.original_price) - parseFloat(b.unit_price);
            return bDiscount - aDiscount;
          }
          return a.name.localeCompare(b.name);
        });
      case 'best-selling':
        return sorted.sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0));
    }
  };

  const sortedProducts = useMemo(
    () => applySort(products, sortType),
    [products, sortType],
  );

  const handleAddToCart = (product: Product) => {
    setAddingItems(prev => new Set(prev).add(product.id));

    addToCart({
      id: product.id,
      name: product.name,
      unit_price: product.unit_price,
      image_url: product.image_url || null,
      is_subscription: product.is_subscription
    });

    const count = getItemCount() + 1;
    toast({
      title: "Added to cart",
      description: `Added to cart (${count} ${count === 1 ? 'item' : 'items'})`,
      action: (
        <ToastAction altText="View cart" onClick={() => navigate('/cart')}>
          View cart
        </ToastAction>
      ),
    });

    setTimeout(() => {
      setAddingItems(prev => {
        const s = new Set(prev);
        s.delete(product.id);
        return s;
      });
      setAddedItems(prev => new Set(prev).add(product.id));
    }, 400);

    setTimeout(() => {
      setAddedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(product.id);
        return newSet;
      });
    }, 1900);
  };

  const handleBuyNow = async (product: Product) => {
    setBuyingItems(prev => new Set(prev).add(product.id));

    try {
      const response = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          cartItems: [{ id: product.id, quantity: 1 }],
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        console.error('Buy Now API error:', data);
        throw new Error(data.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error: any) {
      console.error('Buy Now error:', error);
      toast({
        title: 'Checkout Error',
        description: error.message || 'Unable to start checkout. Please try again.',
        variant: 'destructive',
      });
      setBuyingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(product.id);
        return newSet;
      });
    }
  };

  const tagFiltersProducts = selectedTag !== null;

  return (
    <div className="store-tab bg-white min-h-screen pb-24">
      {/* Subtle blue accent divider */}
      <div className="h-2 w-full bg-blue-100 rounded-b-3xl"></div>
      
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* Stripe Checkout Demo - Hidden in production, only show in dev mode */}
        {process.env.NODE_ENV === 'development' && false && (
          <div className="flex justify-center">
            <StripeCheckoutDemo />
          </div>
        )}

        {/* Filter and Sort Section + Cart Icon */}
        <div className="pt-0 flex items-center gap-3">
          <div className="flex-1">
            <FilterBar sortType={sortType} onSortChange={setSortType} />
          </div>
          <button
            type="button"
            onClick={() => navigate('/cart')}
            className="relative p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
            aria-label="View cart"
          >
            <ShoppingCart className="h-5 w-5 text-gray-700" />
            {getItemCount() > 0 && (
              <Badge className="absolute -top-1.5 -right-1.5 h-5 min-w-[20px] flex items-center justify-center p-0 text-xs font-bold bg-[#0074d4] text-white border-2 border-white">
                {getItemCount()}
              </Badge>
            )}
          </button>
        </div>

        {/* Loading state */}
        {showInitialLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading products...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50/90 p-5 shadow-sm">
            <div className="font-semibold text-red-900">Unable to load products</div>
            <p className="mt-1 text-sm text-red-800/90">
              {error.message || 'Please try again in a moment.'}
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-4 border-red-200 bg-white text-red-800 hover:bg-red-100"
              onClick={() => void refetch()}
            >
              Retry
            </Button>
          </div>
        )}

        {/* Empty catalog (API returned no products) */}
        {!isLoading && !error && products.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
              <PawPrint className="h-7 w-7 text-blue-500" aria-hidden />
            </div>
            <div className="text-base font-semibold text-slate-900">Store catalog is empty</div>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              Products appear here when they are published in admin. Check back after launch inventory is loaded.
            </p>
            <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
              <Button type="button" variant="outline" onClick={() => void refetch()}>
                Refresh
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/contact" className="text-blue-600">
                  Contact support
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Products grid */}
        {!isLoading && !error && sortedProducts.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-5">
            {sortedProducts.map((product) => {
              const desc = truncateProductDescription(
                product.description,
                PRODUCT_DESCRIPTION_PREVIEW_LENGTH,
              );
              const showViewDetails = desc.isTruncated || getProductImageSlides(product).length > 0;

              return (
              <div key={product.id} className="product-card" data-product-id={product.id}>
                <div className="product-card__image">
                  {getProductImageSlides(product).length > 0 ? (
                    <button
                      type="button"
                      className="block h-full w-full cursor-zoom-in border-0 bg-transparent p-0 text-left outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-0"
                      onClick={() => setLightboxProduct(product)}
                      aria-label={`View images: ${product.name}`}
                    >
                      <StoreProductImage name={product.name} src={product.image_url} />
                    </button>
                  ) : (
                    <StoreProductImage name={product.name} src={product.image_url} />
                  )}
                </div>

                <div className="product-card__body">
                  <h3 className="product-card__title">{product.name}</h3>

                  <div className="product-card__price">
                    ${parseFloat(product.unit_price).toFixed(2)}
                  </div>

                  {desc.preview ? (
                    <p className="product-card__description">{desc.preview}</p>
                  ) : null}

                  {showViewDetails ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mb-1 h-8 w-full text-xs font-medium text-[#0074d4] hover:bg-blue-50 hover:text-[#005fa8]"
                      onClick={() => setLightboxProduct(product)}
                    >
                      View details
                    </Button>
                  ) : null}

                  <div className="product-card__actions flex-col gap-2">
                    <Button
                      onClick={() => requireAuth(() => handleBuyNow(product))}
                      disabled={buyingItems.has(product.id)}
                      className="w-full text-xs sm:text-sm"
                      data-testid={`button-buy-now-${product.id}`}
                    >
                      {buyingItems.has(product.id) ? (
                        <>
                          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white mr-2" />
                          Loading…
                        </>
                      ) : (
                        'Buy Now'
                      )}
                    </Button>

                    <Button
                      onClick={() => requireAuth(() => handleAddToCart(product))}
                      disabled={addingItems.has(product.id) || addedItems.has(product.id)}
                      variant="outline"
                      className="w-full border-slate-200 text-xs sm:text-sm"
                      data-testid={`button-add-cart-${product.id}`}
                    >
                      {addingItems.has(product.id) ? (
                        <>
                          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white mr-1" />
                          Adding…
                        </>
                      ) : addedItems.has(product.id) ? (
                        <>
                          <Check className="w-4 h-4 shrink-0 mr-1" />
                          Added
                        </>
                      ) : isInCart(product.id) ? (
                        <>
                          <ShoppingCart className="w-3.5 h-3.5 shrink-0 mr-1" />
                          In Cart
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-3.5 h-3.5 shrink-0 mr-1" />
                          Add to Cart
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        )}

        {/* No matches when tag filter hides everything */}
        {!isLoading &&
          !error &&
          products.length > 0 &&
          sortedProducts.length === 0 &&
          tagFiltersProducts && (
          <div className="py-8 text-center">
            <p className="text-gray-600">No products found with this tag.</p>
            <Button type="button" variant="outline" onClick={() => setSelectedTag(null)} className="mt-4">
              Clear tag
            </Button>
          </div>
        )}

        {/* Tag filters — hidden until catalog grows (STORE_TAG_FILTERS_ENABLED) */}
        {STORE_TAG_FILTERS_ENABLED && !isLoading && !error && (
          <div className="mt-8" data-store-section="tag-filters">
            <ProductTags
              selectedTag={selectedTag || undefined}
              onTagSelect={setSelectedTag}
            />
          </div>
        )}
      </div>

      <ProductImageLightbox
        product={lightboxProduct}
        open={lightboxProduct !== null}
        onOpenChange={(next) => {
          if (!next) setLightboxProduct(null);
        }}
      />
    </div>
  );
};
// SOL:STORE:END

export default StoreTab;
