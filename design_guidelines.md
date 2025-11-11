# MY PUP Pet Marketplace Design Guidelines

## Design Approach
**E-commerce Reference Hybrid**: Drawing from Shopify's clean product presentation and Etsy's warm, friendly marketplace feel, adapted with the specified modern, vibrant aesthetic. Focus on trust-building, easy browsing, and subscription conversion.

## Typography Hierarchy
**Primary Font**: Nunito (Google Fonts CDN)
- Headlines (H1): 700 weight, 3xl-5xl responsive scaling
- Subheadings (H2-H3): 600 weight, 2xl-3xl
- Body text: 400 weight, base-lg sizing
- Descriptions: 400 weight, sm-base, #555555 color
- CTAs/Buttons: 600 weight, uppercase tracking-wide for primary actions

## Layout System
**Spacing Primitives**: Use Tailwind units of 3, 4, 6, 8, 12, 16, 20, 24
- Component padding: p-6 to p-8
- Section spacing: py-16 to py-24
- Card gaps: gap-6 to gap-8
- Container max-width: max-w-7xl with px-4 gutters

## Component Library

### Hero Section (Store & Pup Box Tabs)
- **Store Hero**: Full-width gradient background (blue #0074d4 to violet #7c3aed), 70vh height, split layout with hero image (happy dogs/owners with products) on right 50%, headline/CTA left 50%
- **Pup Box Hero**: Similar gradient treatment, feature subscription box product imagery with unboxing scene
- Hero CTAs: Large buttons (px-8 py-4) with backdrop-blur-md background, white text, no borders
- Supporting text below CTAs showing key value props (e.g., "Free shipping over $50" with small icons)

### Navigation
Top nav with logo left, centered main links (Store, Pup Box, About, Contact), search bar integrated, cart icon right. Sticky on scroll with subtle shadow. White background, #0074d4 accent on active/hover states.

### Product Cards (Store Tab)
- White background, rounded-2xl corners, 6px border in light gray (#e5e7eb)
- Product image fills top portion (4:3 ratio), hover: lift with shadow-xl and scale-[1.02]
- Title: 600 weight, base size
- Price: 700 weight, lg size, #0074d4 color
- Description snippet: #555555, sm size, 2-line clamp
- "Add to Cart" button at bottom: gradient background (blue-to-violet), white text, full-width
- 3-column grid on desktop (lg:grid-cols-3), 2-column tablet (md:grid-cols-2), single mobile

### Subscription Cards (Pup Box Tab)
- Larger cards than products, rounded-3xl, gradient border accent
- Card header with box size/tier name
- Pricing display with monthly cost prominent, savings indicator
- Bulleted feature list with checkmark icons (Heroicons)
- Product preview thumbnails (3-4 items included)
- "Subscribe Now" gradient CTA button
- 2-column desktop (lg:grid-cols-2), single mobile, centered max-w-5xl

### Filter Drawer (Store)
- Slide-in from left, white background, shadow-2xl
- Category checkboxes with custom styled boxes (rounded-md, #0074d4 checked state)
- Price range slider with gradient track
- "Apply Filters" button at bottom (gradient), "Clear All" link above
- Close icon (X) top-right corner

### Footer
- Two-row layout: Top row (#f9f7f3 background) with 4-column grid (Company, Products, Support, Newsletter), bottom row (white) with social icons left, copyright center, payment badges right
- Newsletter input: rounded-full with integrated gradient button
- Social icons: circular backgrounds with #0074d4 hover state
- Links: #555555 default, #0074d4 hover with 150ms transition

### Micro-interactions
- All transitions: 150-200ms ease-in-out
- Card hovers: translate-y-[-4px] + shadow-xl
- Button hovers: scale-[1.05] + shadow-lg with gradient glow
- Image loads: fade-in animation
- Filter selections: scale pulse effect
- Add to cart: brief scale-[1.1] success pulse

## Images

**Required Images**:
1. **Store Hero**: Lifestyle shot of happy dog with owner, products visible in scene (leashes, toys), warm home environment - positioned right 50% of hero, person/dog occupying frame naturally
2. **Pup Box Hero**: Subscription box opened with colorful toys/treats spilling out, hands holding box, shot from above - right 50% of hero
3. **Product Images**: Clean white background shots of individual items (toys, bowls, leashes, treats), square format, consistent lighting
4. **Subscription Box Preview**: Individual product thumbnails for each box tier showcase
5. **Trust Badges**: Small icons for "Free Shipping", "Vet Approved", "Money-Back Guarantee" scattered in relevant sections

**Large Hero Image**: Yes, both Store and Pup Box tabs feature prominent hero images at 70vh occupying 50% width in split layout design.