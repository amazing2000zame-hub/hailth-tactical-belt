# QA Checklist - HAILTH Tactical Belt Store

## Pre-Test Summary

- **Framework:** Astro 5 (SSG) + React islands + Tailwind CSS v4
- **Pages (8):** index, product, about, cart, contact, faq, privacy, shipping
- **React Components:** ProductSelector (color/size/qty picker)
- **Backend:** Express + SQLite (Task #1, in progress)
- **Build Status:** PASSES (8 pages, ~1s)

---

## 1. Build & Static Output

- [x] `npx astro build` completes without errors
- [x] All 8 pages generate HTML in `dist/`
- [ ] `npx astro preview` serves correctly (test after backend ready)
- [ ] No console warnings during build

---

## 2. Page Availability (HTTP 200)

Test each route returns valid HTML:

| Route | Status | Notes |
|-------|--------|-------|
| `/` (index) | PENDING | Homepage with Hero, TrustBadges, Features, ProductSection, Comparison, Reviews, FAQ, Newsletter |
| `/product` | PENDING | Product detail with selector, reviews, FAQ |
| `/about` | PENDING | Brand story page |
| `/cart` | PENDING | Cart page (JS-driven items) |
| `/contact` | PENDING | Contact form page |
| `/faq` | PENDING | FAQ page |
| `/privacy` | PENDING | Privacy policy |
| `/shipping` | PENDING | Shipping & returns policy |
| `/terms` | **BUG FOUND** | Footer links to `/terms` but NO `terms.astro` page exists - will 404! |

---

## 3. Navigation & Links

### Header Links (Desktop)
- [ ] Logo -> `/` (Home)
- [ ] Home -> `/`
- [ ] Product -> `/product`
- [ ] About -> `/about`
- [ ] FAQ -> `/faq`
- [ ] Cart icon -> `/cart`

### Header Links (Mobile Overlay)
- [ ] Home -> `/`
- [ ] Product -> `/product`
- [ ] About -> `/about`
- [ ] FAQ -> `/faq`
- [ ] Cart -> `/cart`
- [ ] Hamburger toggle opens/closes overlay

### Footer Links
- [ ] HAILTH logo -> `/`
- [ ] Tactical Belt -> `/product`
- [ ] Features -> `/product#features`
- [ ] Specifications -> `/product#specs`
- [ ] About -> `/about`
- [ ] FAQ -> `/faq`
- [ ] Contact -> `/contact`
- [ ] Privacy Policy -> `/privacy`
- [x] **BUG: Terms of Service -> `/terms` (404 - page missing)**
- [ ] Shipping & Returns -> `/shipping`

### In-Page Links
- [ ] Cart empty state "Shop Now" -> `/product`
- [ ] About page "Shop Now" -> `/` (should this be `/product`?)
- [x] **BUG: Newsletter "Privacy Policy" link -> `#` (should be `/privacy`)**

---

## 4. SEO & Meta Tags

- [x] `<meta name="viewport" content="width=device-width, initial-scale=1.0">` present
- [x] `<title>` tag on all pages
- [x] `<meta name="description">` on all pages
- [x] Open Graph tags (og:type, og:url, og:title, og:description, og:image)
- [x] Twitter card tags
- [x] Canonical URL
- [x] `lang="en"` on `<html>`
- [ ] Favicon files exist (`/favicon.svg`, `/favicon.ico`, `/apple-touch-icon.png`)

---

## 5. Product Selector (React Island)

- [ ] All 7 colors render and are selectable (Black, Army Green, Khaki, Brown, Navy, Gray, Camo)
- [ ] All 5 sizes render and are selectable (S, M, L, XL, 2XL)
- [ ] Size guide toggle opens/closes
- [ ] Quantity +/- works (min: 1, max: 10)
- [ ] Price updates with quantity ($29.99 * qty)
- [ ] "Add to Cart" button present (currently no backend handler)
- [ ] Aria labels present on interactive elements

---

## 6. Cart Page

- [ ] Empty state displays when no items
- [ ] "Shop Now" button links to `/product`
- [ ] Trust badges render (Secure Checkout, 30-Day Returns, Free Shipping)
- [ ] Cart items display when populated (JS-driven, `#cart-items`)
- [ ] Cart count badge in header updates

---

## 7. Contact Form

- [ ] All fields render: Name, Email, Subject (select), Message (textarea)
- [ ] Required validation on Name, Email, Message
- [ ] Email field validates email format
- [ ] Subject dropdown has all options
- [ ] Form `action="#"` - needs backend endpoint (Task #1/#3)
- [ ] Submit button present

---

## 8. Newsletter Signup

- [ ] Email input renders
- [ ] Required validation
- [ ] Subscribe button present
- [ ] Form `action="#"` - needs backend endpoint (Task #1/#3)
- [ ] Privacy note links to privacy policy

---

## 9. Backend API (Blocked - Task #1)

Test when backend is ready:

- [ ] API server starts on port 4322
- [ ] `GET /api/products` returns product data
- [ ] `GET /api/products/:id` returns single product
- [ ] `POST /api/cart` adds item to cart
- [ ] `PUT /api/cart/:id` updates cart item
- [ ] `DELETE /api/cart/:id` removes cart item
- [ ] `POST /api/contact` submits contact form
- [ ] `POST /api/newsletter` subscribes email
- [ ] Stripe checkout session creation
- [ ] Error responses have proper status codes

---

## 10. Frontend-Backend Integration (Blocked - Task #3)

- [ ] Product page loads real data from API
- [ ] "Add to Cart" sends POST to API
- [ ] Cart page fetches and displays cart items
- [ ] Cart update/remove works
- [ ] Contact form submits to API
- [ ] Newsletter form submits to API
- [ ] Checkout redirects to Stripe

---

## 11. Responsive / Mobile

- [ ] Header collapses to hamburger on mobile (<768px)
- [ ] All pages readable on 375px viewport
- [ ] Footer stacks properly on mobile
- [ ] Product selector usable on mobile
- [ ] Cart trust badges stack vertically on mobile (<640px)
- [ ] Contact form full-width on mobile
- [ ] Newsletter form stacks on mobile (<480px)

---

## 12. Accessibility

- [x] All interactive elements have aria-labels
- [x] Form inputs have associated labels
- [x] Screen reader-only text for newsletter label (`.sr-only`)
- [ ] Keyboard navigation works through all interactive elements
- [ ] Focus states visible on all buttons/links
- [ ] Color contrast meets WCAG AA

---

## Bugs Found (Pre-Integration)

| # | Severity | Description | Location |
|---|----------|-------------|----------|
| 1 | HIGH | `/terms` page missing - Footer links to non-existent page (404) | `Footer.astro:49` |
| 2 | MEDIUM | Newsletter privacy link points to `#` instead of `/privacy` | `Newsletter.astro:45` |
| 3 | LOW | About page "Shop Now" links to `/` instead of `/product` | `about.astro:109` |
| 4 | INFO | Contact form action is `#` (needs backend) | `contact.astro:70` |
| 5 | INFO | Newsletter form action is `#` (needs backend) | `Newsletter.astro:27` |
| 6 | INFO | Cart functionality has no JS implementation yet | `cart.astro:43` |

---

## Test Status

- **Last Build:** 2026-03-09 - PASS (8 pages, 1.04s)
- **Blocking Dependencies:** Task #1 (Backend API), Task #3 (Frontend integration)
- **Next Steps:** Report bugs #1-3 to frontend-engineer, re-test after integration
