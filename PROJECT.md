# Happy Family Store

## Overview
This is an e-commerce pharmacy store built with React, Vite, and TypeScript. It uses Supabase as the backend database service.

## Project Structure
- `/components` - React UI components
- `/context` - React context providers
- `/lib` - Utility libraries and Supabase client
- `/public` - Static assets
- `App.tsx` - Main application component
- `index.tsx` - Application entry point
- `constants.ts` - Application constants and configuration
- `types.ts` - TypeScript type definitions

## Tech Stack
- **Frontend**: React 18, TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS (via CDN)
- **Icons**: Lucide React
- **Backend**: Supabase (PostgreSQL database + Auth)
- **QR Code**: qrcode.react for crypto payment QR generation

## Features

### Payment Options
- **Credit Card**: Auto-formatted expiry date (MM/YY with automatic slash insertion)
- **Bitcoin (BTC)**: Live rate conversion with 8 decimal places, QR code with wallet address
- **USDT (Tether)**: Support for USDT payments with QR code generation

### Admin Dashboard
- Manage payment methods and delivery options
- Configure Bitcoin and USDT wallet addresses in Settings
- Wallet addresses persist to Supabase database

### Crypto Payment Flow
- Live exchange rates from CoinGecko API
- QR code generation with embedded wallet address
- Copy-to-clipboard for wallet address and exact crypto amount
- Rate refresh button for up-to-date conversions

## Development
- Run `npm run dev` to start the development server on port 5000
- Run `npm run build` to build for production
- Run `npm run preview` to preview the production build

## Environment Variables
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

## Database Schema
The `store_settings` table includes:
- `bitcoin_wallet_address` - Bitcoin wallet address for crypto payments
- `usdt_wallet_address` - USDT wallet address for crypto payments

## Deployment
This project is configured for static deployment. The build output is in the `dist` directory.
