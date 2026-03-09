# HAILTH Tactical Belt -- E-Commerce Store

## Vision
Premium, Apple-style dropshipping storefront for the HAILTH Tactical Metal Hook Elastic Belt. Customers will spend money here -- the experience must be smooth, elegant, and trust-building.

## Product
- **Name:** HAILTH Tactical Metal Hook Elastic Belt
- **Price:** $29.99 (standard) / $34.99 (premium colors)
- **Cost:** $4.50-$8.00/unit (AliExpress dropship)
- **Margin:** 55-68%
- **Colors:** Black, Army Green, Khaki, Brown, Navy, Gray, Camo (7+)
- **Sizes:** S (28"-32"), M (32"-36"), L (36"-40"), XL (40"-44"), 2XL (44"-50")
- **Material:** High-density elastic polyester/nylon webbing, zinc/aluminum alloy buckle
- **USPs:** Infinite adjustability (no holes), quick-release metal hook, 150+ lbs tensile strength, ultra-light

## Tech Stack
- **Framework:** Astro 6 (zero JS by default, islands architecture)
- **Styling:** Tailwind CSS (Apple-inspired minimal design)
- **Interactive Components:** React (cart, product selector)
- **Payments:** Stripe Checkout (2.9% + $0.30)
- **Hosting:** Self-hosted on HomeCluster (Proxmox)
- **CDN:** Cloudflare (free tier)
- **Domain:** TBD (.com via Cloudflare Registrar, ~$12/year)

## Architecture
- Static pages (Astro SSG) for marketing, product, about, FAQ
- React islands for: color/size selector, cart, checkout button
- Stripe Checkout for payment (redirect flow, no PCI scope)
- No database needed (dropship model, orders via Stripe dashboard)
- Contact form via email service on agent1

## Design Philosophy
- Apple-style: generous whitespace, large hero imagery, minimal text
- Dark/light mode support
- Mobile-first responsive design
- Smooth scroll animations (CSS only, no JS bloat)
- Trust signals: reviews, guarantees, shipping info
- Single product focus (not a marketplace)

## Target Demographics
- Men 25-55
- EDC/tactical enthusiasts
- Outdoor/hiking community
- Workwear professionals
- Plus-size market (up to 2XL/50")
- Gift buyers (Q4 holiday spike)

## Revenue Projections
- Month 1-2: $1,000-$3,000/mo (testing phase)
- Month 3-4: $3,000-$8,000/mo (growth phase)
- Month 5+: $8,000-$12,000/mo (scale phase)

## Source Files
- Product research: `/mnt/external-hdd/openclaw/dropshipping/HAILTH_Tactical_Belt_Research_Report.pdf`
- Business plan: `/mnt/external-hdd/openclaw/dropshipping/HAILTH_Business_Plan_Spreadsheet.pdf`
- Prior store experience: `/mnt/external-hdd/openclaw/pulserecover/` (PulseRecover dropship store)
