# Happy Family Store

## Overview

This is an e-commerce pharmacy storefront built with React, TypeScript, and Vite. The application provides a complete online shopping experience with product browsing, cart management, checkout with multiple payment options (credit cards, Bitcoin, USDT), and a full admin dashboard for managing products, orders, and settings. The backend uses Supabase for data persistence and authentication.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Framework
- **React 18** with TypeScript for type-safe component development
- **Vite 5** as the build tool for fast development and optimized production builds
- **Tailwind CSS** loaded via CDN for utility-first styling
- **Lucide React** for consistent iconography throughout the UI

### State Management
- **React Context API** (`StoreContext`) serves as the central state management solution
- Single provider wraps the entire application, managing:
  - Products, categories, and cart state
  - User authentication (admin and customer)
  - UI state (current view, mobile detection, modals)
  - Admin settings and payment configurations

### Data Layer
- **Supabase** provides PostgreSQL database and authentication
- Client initialized conditionally based on environment variables
- Graceful fallback to demo data when Supabase credentials are unavailable
- Data fetching uses `Promise.allSettled` for resilient loading

### Key UI Components
- **Responsive Layout**: Separate mobile and desktop header/navigation components
- **Product System**: Grid display with filtering, search, and pagination
- **Cart/Checkout**: Multi-step checkout with delivery options and payment processing
- **Admin Dashboard**: Full CRUD for products, categories, orders, and store settings

### Payment Integration
- Credit card processing with auto-formatted input fields
- Cryptocurrency payments (Bitcoin, USDT) with:
  - Live exchange rates from CoinGecko API
  - QR code generation using `qrcode.react`
  - Configurable wallet addresses stored in Supabase

### Notification System
- Telegram bot integration for order notifications
- Email notification support (simulated)
- Retry logic for failed notification delivery

## External Dependencies

### Database & Authentication
- **Supabase**: PostgreSQL database, user authentication, and file storage
- Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

### Third-Party APIs
- **CoinGecko API**: Real-time cryptocurrency exchange rates for BTC/USDT pricing
- **Telegram Bot API**: Order notifications sent to admin via bot token and chat ID
- **ipwho.is**: IP geolocation for auto-detecting user country in callback modal

### NPM Packages
- `@supabase/supabase-js`: Supabase client library
- `qrcode.react`: QR code generation for crypto payment addresses
- `lucide-react`: Icon library
- `react` / `react-dom`: UI framework

### External Assets
- **Tailwind CSS**: Loaded via CDN (`cdn.tailwindcss.com`)
- **Google Fonts**: Inter font family
- **Flag CDN**: Country flag images (`flagcdn.com`)
- **Supabase Storage**: Product images and site assets hosted on Supabase storage buckets