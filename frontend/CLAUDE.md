@AGENTS.md
```markdown
# GriVA — Claude AI Project Guide

## What is GriVA
GriVA is a Qatar-based direct e-commerce store selling electronics and tech
products. Customers browse, order online, and store's own delivery drivers
deliver directly to their door. No courier partners. No third party logistics.
Store owner manages everything through admin panel.

## Business Flow — Understand This First

### Customer Journey
Customer visits site → browses products by category → views product detail →
adds to cart → goes to checkout → fills Qatar address → chooses payment
(COD or card) → places order → receives WhatsApp/notification → delivery
boy arrives → customer pays if COD → order complete

### Admin Journey
Admin logs in → sees dashboard with real sales numbers → manages products
(add, edit, delete, upload images) → sees incoming orders → assigns each
order to a delivery boy → monitors order status → manages homepage banners
and offer cards → sees subscriber list → controls announcement bar and
sale campaigns

### Delivery Boy Journey
Admin assigns order to delivery boy → delivery boy gets notified → delivery
boy opens his mobile dashboard → sees his assigned orders for today → taps
Open Maps to navigate → calls customer if needed → collects cash if COD →
marks order as delivered → done

### Order Status Flow
Customer places order → PENDING
Admin confirms → PROCESSING
Admin assigns driver → ASSIGNED
Driver picks up → OUT FOR DELIVERY
Driver delivers → DELIVERED
Problem occurs → CANCELLED (only from pending or processing)

## Repository Structure
griva-web/ is a monorepo with two parts:
frontend/ contains Next.js 16 application
backend/ contains Node.js Express API server

## Tech Stack — Never Suggest Changing These

### Frontend Stack
Framework is Next.js 16.2.6 using App Router pattern
Language is TypeScript 5 with strict mode always
Styling is Tailwind CSS 4 only — no inline styles, no CSS modules, no styled components
Animations use Framer Motion 12 sparingly
Icons use Lucide React only — no other icon libraries ever
HTTP calls use Axios through frontend/app/lib/axios.ts only — never use fetch() directly
State management is React Context only — no Redux, no Zustand, no Jotai, no MobX
Forms use useState only — no React Hook Form, no Formik

### Backend Stack
Runtime is Node.js 22
Framework is Express.js 4.19
Database ORM is Sequelize 6.37 with PostgreSQL dialect
Database is PostgreSQL 16
Authentication uses JWT via jsonwebtoken library
Tokens stored in localStorage with key griva_token
Passwords hashed with bcryptjs
File uploads use Multer then Sharp for processing
Image storage is Cloudinary in production, local filesystem in development
Input validation uses express-validator

### Database
Local development uses NeonDB PostgreSQL
Production uses Azure Database for PostgreSQL in Qatar Central region
Column names always snake_case
Model names always PascalCase
All monetary values stored as DECIMAL(10,2)
All prices stored and displayed in QAR

## User Roles — Three Types Only
customer is the default role for shoppers
admin has full access to manage everything
delivery is for delivery drivers who see only their assigned orders

## Qatar Market Rules — Always Follow Without Exception

### Currency
Always use QAR (Qatari Riyal)
Never use USD, $, INR, or any other currency in UI
Format whole numbers as QAR 299 not QAR 299.00
Arabic format is ر.ق 299

### Phone Numbers
Qatar country code is +974
Mobile numbers start with 3, 5, 6, or 7
Landline numbers start with 4
All phone numbers are 8 digits after country code
Always show as +974 XXXX XXXX format
Validation pattern is /^[3456784]\d{7}$/

### Delivery Addresses
Qatar does not use zip codes — never add a zip code field
Address fields are: Area, Street, Building, Floor (optional), Apartment (optional)
Qatar areas include: Doha, Al Rayyan, Al Wakrah, Al Khor, Al Daayen,
Umm Salal, Lusail, West Bay, Al Sadd, The Pearl, Madinat Khalifa,
Al Gharrafa, Al Waab, Ain Khaled, Industrial Area

### Payment Methods
COD (Cash on Delivery) is most common — always support this
Card payments use Tap Payments gateway (Qatar standard)
Apple Pay supported through Tap Payments
Never suggest Stripe or PayPal — not commonly used in Qatar

### Language
All UI supports English and Arabic
English labels shown first
Arabic translation shown second
RTL layout when Arabic is selected
Minimum font size 16px on mobile to prevent iOS auto zoom

## Folder Structure

### Frontend
frontend/app/admin/ contains admin panel accessible only to admin role
frontend/app/delivery/ contains delivery dashboard accessible only to delivery role
frontend/app/auth/ contains login, register, forgot password pages
frontend/app/components/ contains all shared UI components
frontend/app/context/ contains all React Context providers
frontend/app/hooks/ contains custom React hooks
frontend/app/lib/ contains axios.ts instance and core utilities
frontend/app/services/ contains api.ts with all API call functions
frontend/app/types/ contains all TypeScript interfaces
frontend/app/utils/ contains helper functions

### Backend
backend/src/controllers/ contains all business logic functions
backend/src/middleware/ contains auth.js, adminAuth.js, deliveryAuth.js
backend/src/models/ contains all Sequelize model definitions
backend/src/routes/ contains all Express route definitions
backend/src/config/ contains db.js connection and seed.js data seeder

## API Standards

### All success responses must follow this format
{ "success": true, "data": {}, "message": "optional" }

### All error responses must follow this format
{ "success": false, "error": "human readable message" }

### All paginated responses must include
{ "success": true, "data": [], "pagination": { "total": 0, "page": 1,
"limit": 20, "totalPages": 1, "hasNext": false, "hasPrev": false } }

### Backend controller pattern to always follow
Every controller function wraps logic in try/catch
Success returns res.json with success true and data
Errors log to console.error then return res.status(500).json with error message

### Frontend API call pattern to always follow
Every data fetch uses useState for data, loading, and error
useEffect calls async function on mount
Loading state shows skeleton or spinner
Error state shows friendly message
Finally block always sets loading to false

## Coding Rules

### TypeScript Rules
Always use proper interfaces — never use any type
All interfaces defined in frontend/app/types/types.ts
Always type API response data properly

### Component Rules
Add 'use client' directive when component uses hooks or browser APIs
Use server components for pages that only fetch data
Component file names use PascalCase
Utility file names use camelCase

### Styling Rules
Tailwind CSS classes only — no exceptions
Mobile first approach — write mobile styles first then add md: and lg: breakpoints
Minimum button height 48px for touch targets on mobile
Maximum content width for delivery pages is 480px centered
Never hardcode hex colors — use Tailwind config colors only

### Error Message Rules
Network failure shows: Check your internet connection
401 unauthorized redirects to login page
500 server error shows: Something went wrong, please try again
Validation errors show below the specific input field

## Environment Variables

### Backend needs these in .env
PORT=8080
NODE_ENV=development or production
DATABASE_URL=postgresql connection string
JWT_SECRET=secret key
JWT_EXPIRES_IN=7d
FRONTEND_URL=frontend origin for CORS
CLOUDINARY_CLOUD_NAME=cloudinary name
CLOUDINARY_API_KEY=cloudinary key
CLOUDINARY_API_SECRET=cloudinary secret

### Frontend needs these in .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080

## Protected Files — Never Modify These

frontend/app/lib/axios.ts
frontend/app/context/UserContext.tsx
frontend/app/context/CartContext.tsx
frontend/app/context/WishlistContext.tsx
frontend/app/context/AdminContext.tsx
frontend/app/context/Providers.tsx
frontend/app/services/auth.service.ts
frontend/app/layout.tsx
frontend/package.json
frontend/.env.local
backend/src/config/db.js
backend/src/config/seed.js
backend/src/middleware/auth.js
backend/src/server.js
backend/package.json
backend/.env

## What Never To Do

Never install new npm packages without asking first
Never change existing database column names
Never use localStorage to store data that belongs in database
Only token string goes in localStorage under key griva_token
Never hardcode product data — always fetch from API
Never hardcode category lists — always fetch from API
Never skip error handling on any async operation
Never skip loading state on any data fetch
Never add zip code field to any Qatar address form
Never use Stripe or PayPal
Never suggest GPS tracking for delivery — not in scope
Never remove existing functionality when adding new features
Never rewrite entire existing file to make a small change
Never use console.log in production code
Never commit .env files to git

## When Asked to Add a New Feature

Step one: identify which files need to be created as new files
Step two: identify which existing files need small additions only
Step three: list all protected files and confirm none are being rewritten
Step four: generate backend files first in order: models, middleware, controllers, routes, app.js addition
Step five: generate frontend files second in order: layout, pages, then existing file modifications last
Step six: add this comment header to every new file created:
// FEATURE: [Feature Name]
// File: [file path]
// Do not modify without checking project docs

## When Finished With Any Task

Always provide:
Complete list of every new file created with full path
Complete list of every existing file modified with exactly what changed
Confirmation that every protected file was not touched
Step by step instructions to test the feature
Any new environment variables needed
Any database changes made (columns or tables added)
How to create test data for the feature
```