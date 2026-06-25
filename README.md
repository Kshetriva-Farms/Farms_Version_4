# 🌾 Kshetriva Farms | Fresh From Farm to Your Home

[![Bilingual: English & Telugu](https://img.shields.io/badge/Language-English%20%2F%20%E0%B0%A4%E0%B1%86%E0%B0%B2%E0%B1%81%E0%B0%97%E0%B1%81-green.svg)](#-bilingual-translation-system)
[![Backend: Firebase Live DB](https://img.shields.io/badge/Backend-Firebase%20Live%20DB-FFCA28?logo=firebase&logoColor=white)](#-firebase-real-time-backend-integration)
[![Portal: Admin Dashboard](https://img.shields.io/badge/Portal-Admin%20Dashboard-0070F3.svg)](#-secure-admin-dashboard-portal)
[![Tech Stack: HTML5 / CSS3 / Vanilla JS](https://img.shields.io/badge/Stack-HTML5%20%2F%20CSS3%20%2F%20JS-blue.svg)](#%EF%B8%8F-technology-stack)
[![Responsive: Mobile First](https://img.shields.io/badge/Responsive-Mobile%20%26%20Tablet%20Friendly-orange.svg)](#-responsive-layout)
[![Integration: WhatsApp Checkout](https://img.shields.io/badge/Integration-WhatsApp%20Checkout-25D366.svg)](#-whatsapp-checkout-integration)

Kshetriva Farms is a premium, high-performance single-page web application designed to connect hardworking local farmers from **Maryala, Telangana** directly with urban families. By eliminating middle-men, the platform ensures that families receive fresh, chemical-safe vegetables at fair prices, while local growers earn a sustainable, direct-to-consumer income.

In **Version 4**, the platform has matured into a comprehensive **Business Administration and Customer Portal** adding detailed **Company Statistics & Analytics**, a **Temporal Weekly Product Cost Management** engine, detailed **Ordered Product break-downs** (for packing logistics), and an updated **Logistics Console**.

---

## ✨ Features at a Glance

### 🟢 Direct-to-Consumer Model
- **No Middlemen:** Directly connects Maryala's local growers with end-consumers.
- **Farmer Spotlights:** Interactive bios showcasing stories, locations, and cultivation methods of our farmers (**M. Surendhar Reddy**, **N. Bhaskar Reddy**, and **P. Raju**).
- **Transparency:** Complete tracing from the soil to the kitchen table.

### 🔥 Firebase Real-Time Backend Integration
- **Live Database Syncing:** Built using Firebase Cloud Firestore, featuring active queries with real-time snapshot listeners (`onSnapshot`). Product changes, pricing edits, and stock toggles made in the admin panel propagate instantly to active client pages.
- **Failover Mock Database:** Integrates a robust offline fallback mode. If Firebase keys are unconfigured or connections fail, the app gracefully redirects operations to local browser `localStorage` for catalogs and session management, guaranteeing zero downtime.
- **Automatic Catalog Seeding:** On the very first launch, if the Firestore `products` collection is empty, a cloud batch write automatically seeds the database with 9 premium default agricultural catalog documents.

### 🛡️ Secure Admin Dashboard Portal
- **Hash-URL Router Access**: Secured admin route accessible via `#admin` hash navigation (`/index.html#admin`).
- **Firebase Authentication**: Restricts entry using secure authentication (`signInWithEmailAndPassword`, `signOut`, `onAuthStateChanged`).
- **Offline Authentication Fallback**: Offers offline administrators local sandbox testing using mock credentials:
  - **Email**: `admin@kshetrivafarms.com`
  - **Password**: `admin123`
- **Tabbed Dashboard Interface**: Introduces a three-tab selector toggle to seamlessly switch between **Manage Catalog** (inventory CRUD), **Customer Leads** (contact register), and **Company Statistics** (financial analytics) panels.
- **Company Statistics & Financial Analytics**: Displays week-wise financial breakdowns including Total Sales, Total Expenses, Net Profit/Loss, and a detailed reconciliation system highlighting subtotal sales, expenses, applied coupons/discounts, and delivery fees.
- **Temporal Cost Configuration**: Allows administrators to specify crop cost prices that apply to current and future weeks. Completed past weeks are permanently locked at their snapshot rates.
- **Product Cost Management**: Features an inline save interface with automatic confirmation badges ("Saved ✓") on save, replacing disruptive popups.
- **Packing Logistics Breakdown**: Replaced the top-demand listing with a full inventory breakout listing each crop's physical total weight and unit distribution (e.g. `2 Katta × 5`, `500g × 2`) to streamline farm packing.
- **Dynamic Stats Grid**: Displays running live counters for **Total Products**, **In Stock**, **Out of Stock**, and **Total Leads** registers.
- **Customer Leads Visualizer**: Renders a comprehensive tabular logs list for captured customer contacts. Features:
  - Date and Time formatting (`toLocaleString('en-IN')`).
  - Contact Name & Locality.
  - Direct clickable contact links (`tel:` dial links and custom `wa.me` WhatsApp direct chat links).
  - Lead source badges (green `Order` vs blue `Chat`).
  - Shopping cart details/receipt summary (items count and total value metrics).
  - Quick-action buttons to delete individual leads from the database.
- **Comprehensive CRUD Console**:
  - **Create:** Instantly add new farm produce complete with English/Telugu names, custom categories, unit mappings, pricing metrics, and image sourcing paths.
  - **Read:** A tabular list displaying optimized images, multilingual tags, categories, pricing, stock levels, and quick-action triggers.
  - **Update:** Pre-populates product records into an overlay form for editing.
  - **Delete:** Enables deletion of catalog documents with safety prompt triggers.
  - **Instant Stock Toggle Slider:** Beautifully animated sliding switches inside the table to toggle stock status in real-time.

### 🚫 Interactive Out-of-Stock Engine
- **Live Visual State Overlay:** Out-of-stock items automatically load a dark blurred styling card overlay and display localized stock badges.
- **Prevention Rules:** The main website instantly disables "Add to Basket" buttons and quantity increment counters for out-of-stock items, preventing users from checking out unavailable items.

### 🌐 Bilingual Translation System (English & Telugu)
- Powered by a native, high-performance JS translation dictionary.
- Translates everything including static section titles, nav bars, product cards, dynamic units (e.g., `kg` ➔ `కిలో`, `bunch` ➔ `కట్ట`), customer reviews, dynamic totals (₹), confirm-to-clear modals, and dashboard alerts.
- Features a **segmented language toggle switch** with custom CSS slide transitions.

### 🛒 Advanced Interactive Shopping Cart
- **Dynamic Catalog Filters:** Fast selectors for *Leafy Greens*, *Root Vegetables*, *Seasonal*, *Organic*, and *Fruits*.
- **Quantity Selector:** Increment/decrement triggers synced instantly with the DOM and cart state.
- **Visual Button Feedback:** Add-to-cart buttons change color dynamically and show localized confirmation states (e.g., `✓ Added!` in green, `✓ Reset!` in dark red).
- **Persistent State:** Saves the cart items to `localStorage` to retain the user's shopping basket across page reloads.
- **Right-Side Cart Drawer:** Interactive slide-out cart listing all selected items, prices, dynamic total amounts (in ₹), clear all action, and checkout.
- **Custom Confirmation Modals:** Vanilla CSS/JS custom verification modal for clearing the cart and custom toast notifications for email clipboard actions.

### 📱 Premium Responsive Design & Animations
- **Visual Vibrancy:** Custom CSS custom properties, Outfit & Inter google fonts, and an animated hover effect on the brand logo.
- **Multi-Resolution Video Streams:** Features autoplaying loops with a dark overlay to maintain readability. Includes high-definition loops (`videos/Kshetriva_video.mp4`, `720p.mp4`) and a heavily compressed mobile-optimized version (`videos/bg-video.mp4`) for quick loading times.
- **Sticky Blur Navbar:** Floating header using `backdrop-filter: blur()` to stay floating transparently as users scroll.
- **Responsive Utilities:** Smooth scroll triggers, mobile menu slide-out drawer, and dual floating utility buttons (quick-access cart and instant WhatsApp chat).

### 💬 WhatsApp Checkout & Lead Capture Integration
- **WhatsApp Click Interception**: Intercepts direct WhatsApp redirects from the cart drawer checkout, Hero section chat, and floating utility chat buttons to run a user detail collection workflow.
- **Delivery Details Modal Form**: Intercepts contact requests to display a custom bilingual popup modal asking for customer **Name**, **WhatsApp Phone Number**, and **Area/Locality**.
- **Friction-Free Caching**: Caches user details in browser local storage (`kshetriva_customer_info`) to auto-fill inputs on subsequent checkouts/contacts, removing submission friction.
- **Dynamic Pre-pended Receipts**: Prepends customer Name, Phone, and Area to both WhatsApp invoices and general enquiry chat messages automatically.

---

## 🛠️ Technology Stack

- **Structure:** [HTML5](https://developer.mozilla.org/en-US/docs/Web/HTML) (Semantic and SEO-optimized markup)
- **Styling:** Custom CSS3 (Flexible custom properties, grid and flex layouts, custom keyframe animations, glassmorphism, responsive breakpoints)
- **Database & Auth:** [Firebase v10.8.0](https://firebase.google.com/) (Compat SDKs for App, Auth, and Firestore)
- **Icons & Typography:**
  - [Font Awesome v6.4.0](https://fontawesome.com/) (Scalable vector icons)
  - [Google Fonts](https://fonts.google.com/) (Outfit for headers, Inter for copy text)
- **Logic:** Vanilla ES6+ [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) (Event handling, custom modular translations, state synchronization, storage APIs)

---

## 📁 Directory Structure

```text
Kshetriva_farms/
│
├── index.html        # Main landing page with full semantic layout & admin components
├── styles.css        # Comprehensive styling, variables, modal transitions & responsiveness
├── script.js         # Core application logic, translation dictionaries, Firebase configs & CRUD state
│
├── images/           # Local visual assets (webp format optimized for quick loading)
│   ├── favicon.png
│   ├── logo_nav.webp
│   ├── Kshetriva_Logo.jpg   # Brand logo asset (NEW in Version 2)
│   ├── farmer_surendhar.webp
│   ├── farmer_bhaskar.png
│   ├── farmer_ashok.webp
│   └── ...           # Product pictures, gallery photos, and customer profiles
│
├── videos/           # Interactive background media (NEW in Version 2)
│   ├── bg-video.mp4         # High-performance hero loop background (Compressed loop)
│   ├── Kshetriva_video.mp4  # HD 1080p full background video
│   └── Kshetriva_video_720p.mp4  # Optimized HD 720p video
│
└── README.md         # Detailed Version 4 documentation
```

---

## 🚀 Getting Started & Local Development

This is a pure frontend static project with cloud database attachments. It requires no installation, compilers, or build systems to run.

### Method 1: Lightweight Local Server (Recommended)
To fully enjoy all custom features (like localized media files, video streaming, and robust storage access), run the project through a local development server:

*Using Python:*
```bash
# In the project directory, run:
python -m http.server 8000
```
Then open [http://localhost:8000](http://localhost:8000) in your web browser.

*Using Node.js (`live-server`):*
```bash
npx live-server
```

### Method 2: Accessing the Admin Portal
1. Run your local server.
2. In your browser address bar, append `#admin` to the URL: [http://localhost:8000/#admin](http://localhost:8000/#admin).
3. The custom **Admin Portal** login modal will open on top of the blurred landing page.
4. If Firebase configuration keys are active, enter your authorized Firestore user credentials.
5. If running in the **Local Fallback Database** mode (when Firebase placeholders are unchanged), enter the sandbox credentials:
   - **Username:** `admin@kshetrivafarms.com`
   - **Password:** `admin123`
6. Click **Login to Dashboard** to enter the live dashboard console.

---

## 📐 How the Firebase Real-Time Synchronization Works

When the application boots, `script.js` checks the Firebase Configuration keys. If placeholders are replaced, it initializes the Firebase SDK:

```javascript
if (typeof firebase !== 'undefined' && firebaseConfig.apiKey !== "YOUR_API_KEY") {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    auth = firebase.auth();
    useFirebase = true;
}
```

### 1. Active Listening
If connected successfully, the client registers a real-time Firestore database snapshot listener. Whenever an administrator changes any data, the client grid updates dynamically:

```javascript
db.collection("products").orderBy("id", "asc").onSnapshot((snapshot) => {
    let dbProducts = [];
    snapshot.forEach((doc) => {
        dbProducts.push({ docId: doc.id, ...doc.data() });
    });
    products = dbProducts;
    renderProducts();
    updateCartUI();
});
```

### 2. Auto-Seeding
If the Cloud database collection returns empty, the app compiles the collection using a fast batch execution to populate the initial mock catalog from code structures:

```javascript
const batch = db.batch();
const collectionRef = db.collection("products");
defaultCatalog.forEach((item) => {
    const docRef = collectionRef.doc(`prod_${item.id}`);
    batch.set(docRef, item);
});
batch.commit();
```

---

## ⚙️ How the WhatsApp Ordering Works

When the user clicks the **Send Order on WhatsApp** button in the shopping drawer, `script.js` processes the cart object and compiles the receipt.

The invoice is dynamically constructed in JS (supporting bilingual messages):
```javascript
let message = isTe ? `*కొత్త ఆర్డర్ - క్షేత్రీవ ఫార్మ్స్*\n` : `*New Order - Kshetriva Farms*\n`;
message += `===============================\n`;
// Loop through items in cart ...
message += `${index + 1}. *${product.name}* - ${qty} ${product.unit} (₹${itemTotal})\n`;
message += `===============================\n`;
message += `*Total Amount:* ₹${totalSum}\n\n`;
```

It is then fully encoded using `encodeURIComponent(message)` and bound to the URL:
`https://wa.me/918374276995?text={encoded_message}`

---

## 📐 Responsive Breakpoints

The custom stylesheet features premium responsiveness defined for standard viewports:
- **Desktops (`>= 1024px`):** Full grid layouts, multi-column about & farmer profiles, full desktop nav with sliding toggle switches.
- **Tablets & iPads (`768px - 1023px`):** Scaled typography, responsive grid columns (2-column layouts for farmer cards), accessible navigation.
- **Smartphones (`<= 767px`):** 1-column layouts, hamburger slide-out menu drawer, and visual floating buttons on screen corners for instant WhatsApp and basket access.

---

## 📧 Contact & Support

For queries, orders, or partner programs:
- **Phone:** +91 83742 76995 | +91 90148 33202
- **Email:** [farm@kshetrivafarms.com](mailto:farm@kshetrivafarms.com) (Click the envelope icon in the website footer to copy this address instantly!)
- **Address:** H no. 5-134, Maryala, Bommalaramaram, Telangana - 508116, India
- **Instagram:** [@kshetrivafarms](https://www.instagram.com/kshetrivafarms?igsh=dGV5d3I2d2Rhc2t2)

---

## 📈 Recent Updates & Development Progress Log

### 🗓️ May 25, 2026

#### 1. 👥 Farmer Identity & Bio Alignment
- **Identity Corrections:**
  - Corrected the first farmer's identity from *E. Surendhar Reddy* to **`M. Surendhar Reddy`** across the entire website structure.
  - Corrected the second farmer's identity from *E. Bhaskar Reddy* to **`N. Bhaskar Reddy`**.
- **Bilingual Consistency:**
  - Updated all associated keys inside the language translation dictionary in `script.js` for both **English** (`M. Surendhar Reddy` / `N. Bhaskar Reddy`) and **Telugu** (`ఎమ్. సురేందర్ రెడ్డి` / `ఎన్. భాస్కర్ రెడ్డి`). This ensures translation parity when users toggle language preferences.

#### 2. 📸 High-Quality Portrait Crop & Integration
- **Asset Sourcing:**
  - Replaced the placeholder image (`farmer_ramesh.webp`) with a new, high-quality, professional portrait provided by the team.
- **Image Standardization Process:**
  - Standardized the new portrait to a clean **1:1 square crop** (at `1000 x 1000 px`) to eliminate borders and preserve composition.
  - Resized using the Lanczos interpolation filter to exactly **`1024 x 1024 px`** to match the grid styling of all other farmer profiles.
  - Saved as a compressed **WebP** asset (`images/farmer_surendhar.webp`) for quick loading and responsive rendering.
- **HTML Binding:**
  - Wired `index.html`'s card component to render the updated image asset.

#### 3. 🖥️ Local Verification Server
- Booted a local background HTTP development server at `http://localhost:8000` inside the `Farms_Version_2` directory to test responsive rendering, asset paths, and language-switching toggles locally.

#### 4. 🚀 Code Synchronization & Deployment
- Fetched and cleanly rebased all remote updates from the `main` branch to avoid branch divergence or fast-forward blockages.
- Committed and pushed all optimized assets and source edits to the remote GitHub repository at `https://github.com/Kshetriva-Farms/Farms_Version_2.git`, successfully triggering the automatic hosting pipeline for live deployment.

### 🗓️ May 26, 2026

#### 1. 🔍 Comprehensive SEO & Social Previews
- **Verification & Analytics hooks**: Injected custom placeholder hooks for Google Search Console and Google Analytics (`gtag.js`) inside `<head>`.
- **Search Rankings & Canonicalization**: Standardized canonical URL links to prevent content duplicate penalties across search engines. Added robust keyword arrays.
- **Social Media Previews**: Integrated rich Open Graph and Twitter Card tags to display premium visual preview cards when links are shared on WhatsApp, Facebook, or Twitter.

#### 2. 🗺️ Search Crawler Metadata
- **robots.txt**: Deployed crawler directives to permit complete storefront crawling while strictly blocking indexing on the administrative hash route `/#admin`. Linked the sitemap registry.
- **sitemap.xml**: Created structured XML indices mapping `https://www.kshetrivafarms.com/` with optimal priority and update frequencies to accelerate search crawling.

#### 3. 🏢 LocalBusiness JSON-LD Schema
- Embedded standardized structured semantic JSON-LD schema matching Maryala, Telangana farming coordinates (`17.5186, 78.9324`), hours of operation, phone listings, and postal addresses to boost local organic Google Search map packages.

#### 4. ⚡ Core Web Vitals & PageSpeed Optimizations
- **CLS Shift Prevention**: Injected explicit native width and height aspect-ratio dimensions on all static images (`index.html`) and dynamic product listings (`script.js`), resulting in zero Cumulative Layout Shifts during asset loading.
- **Preconnect Handshakes**: Established preconnect link attributes targeting external font, icon, and analytics hostnames to resolve TCP and SSL connection handshakes early, saving up to 200ms on first render.
- **Below-the-fold Lazy Loading**: Set up native `loading="lazy"` tags on all images below-the-fold, reducing initial bandwidth payload sizes and accelerating speed indexes.

#### 5. 📱 Progressive Web App (PWA) Installability & Offline Caching
- **manifest.json**: Configured the standard web manifest with short names, theme colors (`#2e7d32`), and full orientation presets. Standardized the launch icons mapping standard scopes (`"purpose": "any"`) and adaptive Android icons (`"purpose": "maskable"`).
- **sw.js**: Built a robust pre-cache Service Worker caching static structures (HTML, CSS, JS, and high-res WebP images), yielding instant 0ms loads and complete offline fallback support.
- **High-Resolution Icon Pipelines (Android Fix)**: Converted the master square logo `images/logo.webp` (2048x2048) into Lanczos-filtered high-resolution assets **`images/logo_pwa_192.png`** and **`images/logo_pwa_512.png`** to resolve a subtle gotcha where Android fell back to browser default shortcuts due to the physical `32x32` size of favicon.png.
- **Retina iOS Integration (iOS Safari Fix)**: Re-wired the `<link rel="apple-touch-icon">` tag inside `index.html` to point to the high-resolution `images/logo_pwa_192.png` instead of the small favicon, guaranteeing crisp Retina displays for iOS Home Screen app launcher additions.

#### 6. 📊 Google Analytics 4 Custom Events Telemetry
- Wired custom analytic clicks to GA4: tracks WhatsApp direct checkout order values, category filter selections, and farmer spotlight expansions.

#### 7. 🛒 Local Cart Recovery Engine
- Built a client-side localStorage recovery script. If a buyer builds a cart and exits, the browser caches the draft. Upon return, the site triggers a premium slide-up bilingual (EN/TE) recovery banner to resume checkout.

#### 8. 🚀 Deployment and Remote Sync
- Successfully verified all implementations locally and pushed updates directly to the remote main repository at `https://github.com/Kshetriva-Farms/Farms_Version_2.git`.

### 🗓️ May 27, 2026

#### 1. ⚙️ Phase 1 Service Plans Implementation
- **Dynamic Quantity Options**: Added custom weight dropdowns (`250g`/`500g`/`1kg`), piece counts, and Katta bundle options for leafy greens (Spinach, Coriander) with localized descriptives.
- **Weekly Delivery Ordering Window**: Established an active schedule check (Friday afternoon to Saturday evening) displaying dynamic status indicators and countdown clocks. Checked out orders outside of these windows are blocked in the cart layout.
- **Basket Discount Engine**: Deployed automated Family (5%), Weekly (10%), and Farm Plus (15%) basket tier detection, visual progress indicators, and strikethrough calculations.
- **Telugu Translations**: Fully localized all cart updates, checkout locks, minimum order flags, and custom confirmation dialogs in standard Telugu.
- **Admin Modal Fields**: Enabled the creation, edition, and saving of dynamic badges (`Fresh Harvest`, `Farmer Pick`, `Limited Qty`) and vegetable unit types directly in the admin dashboard.

### 🗓️ May 28, 2026

#### 1. ⚙️ Service Plan Refinements (Version 3)
- **Zero Minimum Order Lock**: Disabled the previous ₹199 minimum order checkout restriction completely, enabling COD checkouts for any cart value.
- **Adjusted Ordering Windows**: Re-aligned the weekly Sunday delivery schedule to run from **Friday 9:00 AM to Saturday 6:00 PM** (updated countdown display timers, banners, and bilingual notifications).
- **Small, Medium, Large Rebranding**: Transitioned basket discounts to clear Small Basket (5%), Medium Basket (10%), and Large Basket (15%) naming.
- **Dynamic Suitability Telemetry**: Injected a clear suitability prompt inside the badge (`Small/Medium/Large Basket is suitable for your {n} items!`) to explain the discount tier matching.
- **Free Delivery Integration**: Deployed a dynamic delivery charge row inside the cart totals breakdown that strikes-off standard charges and showcases `₹0 (Free Delivery)` for all checkout quantities.
- **Coming Soon Category Placeholders**: Created beautifully designed, animated seedling grids that gracefully fallback if a catalog category tab has no items.
- **Ultra-Compact Cart UX**: Companded paddings, font sizes, margins, and heights across all cart headers, scrollables, basket indicators, progress widgets, and checkout buttons to maximize vertical product browsing space.

### 🗓️ June 2, 2026

#### 1. 📅 Temporary Early Schedule Transition (Saturday Delivery)
- **Re-Aligned Ordering Window**: To optimize fresh farm availability and cater to customer demands, shifted the weekly delivery day one day earlier to **Saturday**. 
- **Active Window Adjustment**: Re-configured the ordering schedule constants in `script.js` to open on **Thursday at 1:00 PM** (13:00) and close on **Friday at 3:00 PM** (15:00).
- **Dynamic Harvest Date Calculations**: Replaced hardcoded date strings with a fully dynamic harvest calendar tracking relative to the Thursday opening day, delivering localized date stamps (`en-IN` and `te-IN`).
- **Bilingual Scheduling Alerts**: Updated static fallbacks and bilingual translation arrays in both English and Telugu to display custom ordering deadlines and Saturday delivery banners seamlessly.

#### 2. ⏳ Day:Hour:Minutes Countdown Timer
- **High-Fidelity Timer Engine**: Refactored the storefront countdown calculations to parse remaining time into `{ days, hours, mins }`.
- **Responsive Suffix Display**: Renders the timer as `Xd Yh Zm` for a modern and space-saving aesthetic, dynamically shifting to `Yh Zm` once under the 24-hour mark.

#### 3. 🛒 Updated Smart Minimum Order Rules (Hybrid Checks)
- **Smart Validation Rules**: Re-aligned cart validations to approve orders if they contain **at least 3 unique products** OR if the final cart value **exceeds ₹99** (amount > 99).
- **Double-Lock Guards**: Integrated the validation both on the UI cart drawer and programmatically within the checkout action, blocking checkout and rendering custom helper prompts for incomplete orders.
- **Bilingual Alerts**: Fully localized the warnings for English (`"Minimum order: 3 products or total above ₹99 to checkout."`) and Telugu (`"కనీస ఆర్డర్: 3 ఉత్పత్తులు లేదా మొత్తం ₹99 కంటే ఎక్కువ ఉండాలి."`).

#### 4. ⚙️ Diagnostic Compilation & Cache Invalidation
- **Syntax Diagnostics**: Verified JavaScript code compilation integrity using Node compiler diagnostics (`node -c`), resolving critical duplicate variable declarations.
- **Service Worker Cache-Busting**: Bumped the Service Worker cache version key to `kshetriva-farms-cache-v5` in `sw.js` and updated the script reference standard query parameter to `script.js?v=3.2` inside `index.html`. This invalidates the old cached assets instantly across all user devices, ensuring everyone receives the new scheduling and checkout engine immediately.

### 🗓️ June 10, 2026

#### 1. ⚙️ Sunday Delivery & Friday 1:00 PM Window Re-Alignment
- **Window Schedule Adjustment**: Configured ordering window bounds in `script.js` to open on **Friday 1:00 PM** and close on **Saturday 1:00 PM** with delivery set on **Sunday** (so the countdown timer correctly counts down to Friday 1:00 PM when closed).
- **Bilingual Copy Updates**: Updated harvest banners (setting "Order by Saturday 1 PM" as the main banner title when live, and "Ordering Opens Friday 1 PM" when closed), delivery headers, and checkout summaries to reflect the Sunday delivery schedule in English and Telugu.
- **Farmer Story Refactoring**: Replaced 'organic' with 'safe, chemical-free' and 'natural compost' with 'safe fertilizers' in farmer profile stories in both English and Telugu configurations to align with marketing directives.
- **Service Worker Cache-Busting**: Bumped cache version to `kshetriva-farms-cache-v12` in `sw.js` to clear cached code immediately.

#### 2. 🚛 Fixed Delivery Charge Integration
- **Display and Total Math**: Integrated a fixed delivery charge of **₹49** (with **₹69** shown as striked-off) inside the cart totals grid, WhatsApp invoice text (`~₹69~ ₹49`), and GA4 event parameters.
- **Smart Validations**: Isolated minimum order validations to run based on the products' discounted subtotal before delivery charges are added.

#### 3. 🌿 Linear Leafy Product Multipliers
- **Options Refactoring**: Reconfigured `QTY_TEMPLATES.leafy` to employ linear multipliers (2 Katta = 2x base price, 4 Katta = 4x base price, 8 Katta = 8x base price) to disable dynamic volume discounts on bundles.

#### 4. 👨‍🌾 Farmer Spotlights & Asset Sync
- **Bhaskar's Image Optimization**: Replaced `farmer_bhaskar.png` with the high-resolution portrait `farmer_bhaskar.jpg` under `images/`, and added `object-position: center 15%` style in `index.html` to perfectly focus and zoom-out the subject in the farmer grid.
- **Remote Asset Merging**: Fetched and merged remote commits, successfully retrieving missing leafy crop images (`Thota_kura.webp`, `gongura.webp`, `green_chilli.webp`) from the repository.

### 🗓️ June 12, 2026

#### 1. ⏱️ Ordering Window Adjustment (Friday 12:00 PM Open)
- **Schedule Re-Alignment**: Configured the storefront ordering schedule open-window bounds in `script.js` to open on **Friday at 12:00 PM (Noon)** (openHour: 12) instead of 1:00 PM.
- **Bilingual Banners and Binders**: Updated static closed-window elements in `index.html` and dynamic translation templates in `script.js` (for English and Telugu) to notify buyers that ordering opens at Friday 12 PM.

#### 2. 📝 Integrated Tabbed Multi-Blog Architecture (`blog.html`)
- **Single-Page Unified Blog**: Combined both "Why Farm-Fresh Vegetables Last Longer" and "How Much Pesticide Usage Is Safe in Vegetables?" articles into `blog.html`.
- **Premium Tab Interface**: Introduced two large, responsive selection buttons matching Outfit/Inter typography that dynamically toggle active article visibility.
- **Dynamic Routing and State Synchronization**: Refactored `blog.js` to parse URL hashes (`#freshness` vs `#pesticides`), automatically toggling visibility, updating hero banner text/metadata, and updating document titles smoothly.
- **Routing Redirect Fallback**: Replaced `blog-pesticides.html` with a meta-refresh redirect routing traffic to `blog.html#pesticides` to prevent dead links.

#### 3. 📸 Premium Asset Refinements
- **Wooden Crate Imagery**: Extracted two distinct high-fidelity crops from a user-uploaded mockup:
  - Crate on the doorstep saved as `images/blog_delivery_box.png` (displays under pesticide safety consumer effects).
  - Crate on the truck saved as `images/delivery_box.webp` (displays in the main landing page Farm Gallery "Ready for Delivery").
- **Multi-Version Sync**: Copied the new image assets to all version folders (`Farms_Version_1`, `Farms_Version_2`, and `Farms_Version_4`).

#### 4. ⚡ PWA Service Worker Invalidation
- **Cache-Busting**: Added `blog-pesticides.html` to the cached assets list and bumped the Service Worker version to `kshetriva-farms-cache-v15` in `sw.js` to clear client caches immediately.

#### 5. 🛒 Default Selected Quantity (500g Default for Regular Items)
- **Default Dropdown Selection**: Refactored `script.js` to select the `500g` weight option by default for regular vegetables (if the option is available), falling back to the first available option for other product types.
- **Cache-Busting & PWA Cache**: Bumped script version parameter inside `index.html` to `v=3.5` and incremented Service Worker cache name to `kshetriva-farms-cache-v16` in `sw.js` to force immediate update.

### 🗓️ June 13, 2026

#### 1. ⏱️ Ordering Window Adjustment (Saturday 9:00 PM Close)
- **Schedule Re-Alignment**: Configured the storefront ordering schedule close-window bounds in `script.js` to close on **Saturday at 9:00 PM** (closeHour: 21) instead of 1:00 PM.
- **Bilingual Banners and Binders**: Updated static elements in `index.html` and dynamic translation templates in `script.js` (for English and Telugu) to notify buyers that ordering closes at Saturday 9 PM.
- **Service Worker Cache-Busting**: Bumped script version parameter inside `index.html` to `v=3.7` and incremented Service Worker cache name to `kshetriva-farms-cache-v17` in `sw.js` to force immediate update on client devices.

#### 2. 🎟️ Coupon Code 'Delivery30' Implementation
- **Delivery Discount Engine**: Added a bilingual coupon code system checking for code `Delivery30` inside the shopping basket footer.
- **Dynamic Cost Sync**: Successful coupon application drops standard delivery charges from ₹49 to ₹30, dynamically adjusting checkout totals, totals breakdown labels, and WhatsApp formatted checkout invoices seamlessly.

### 🗓️ June 19, 2026

#### 1. 💬 WhatsApp Leads Capture Modal & secure Admin Dashboard visualizer (Version 3.5)
- **WhatsApp Clicks Interception**: Added javascript hooks to intercept user click events on `#whatsappOrderBtn`, `.hero-btns .btn-whatsapp`, and `.whatsapp-float` buttons.
- **Contact Details Modal**: Deployed an overlay form modal (`#whatsappDetailsModal`) prompting for Name, WhatsApp Phone, and Area/Locality in English and Telugu.
- **Leads Storage Platform**: Developed database handlers to save submitted details to either Firestore collection `leads` (when online) or fallback `localStorage` key `kshetriva_leads`. Limited entries to the **latest 100 details** using automated query batch deletion (for Firestore) and slice routines (for LocalStorage).
- **Auto-Fill Caching**: Saves submitted details under browser cache `kshetriva_customer_info` to pre-populate inputs on subsequent contacts.
- **Pre-pended Details Receipt**: Prepends Name, Phone, and Area to WhatsApp order receipts and chat templates dynamically.
- **Admin Leads Visualization**: Integrated a new tabbed workspace in the `#admin` Dashboard with a complete leads directory table, direct dial/chat links, and deletion triggers.
- **Service Worker Cache-Busting**: Bumped script version parameter inside `index.html` to `v=3.8` and incremented Service Worker cache name to `kshetriva-farms-cache-v18` in `sw.js` to clear client caches immediately.

#### 2. 🔐 Firestore Syncing & Connection Diagnosis Fix (Version 3.5.1)
- **Optimal Firestore Security Rules**: Created [firestore.rules](file:///d:/Kshetriva_farms/Farms_Version_3.5/firestore.rules) to permit unauthenticated write access (`create` only) to the `leads` collection. This allows customers on all devices to successfully write leads to the shared Firestore DB instead of falling back to device-specific `localStorage`.
- **Dynamic Database Sync Status**: Integrated a connection status indicator badge (`#adminSyncBadge`) in the Admin Dashboard header (modified [index.html](file:///d:/Kshetriva_farms/Farms_Version_3.5/index.html) and [script.js](file:///d:/Kshetriva_farms/Farms_Version_3.5/script.js)). Displays real-time database connection statuses (`Live Connected`, `Database Error (Check Rules)`, or `Offline Mode (Local Only)`) to simplify database connectivity troubleshooting.

### 🗓️ June 20, 2026

#### 1. 💬 Safari WhatsApp Redirection Fix (Version 3.5.2)
- **Safari Popup Blocker Bypass**: Resolved an issue where the WhatsApp checkout and chat redirects were blocked by Safari's strict popup blocker. Changed the lead submission event flow to write customer data to the Firestore/Local database asynchronously in the background while opening the WhatsApp window/tab (`window.open`) synchronously in the primary user gesture thread.

### 🗓️ June 25, 2026

#### 1. 📊 Company Statistics & Financial Reconciliation (Version 4.0)
- **Financial Reporting**: Added a secure Company Statistics tab to the Admin Dashboard listing week-by-week total sales, total actual crop expenses, and net profit calculations.
- **Temporal Week boundaries**: Cost price updates apply strictly to the present/future weeks. Historical weeks' cost metrics are frozen upon closing to prevent retrospective alteration of financial records.
- **Inline Cost Save**: Replaced disruptive JS alerts with inline checkmark state changes (`"Saved ✓"` for 1.5 seconds) on product cost settings.

#### 2. 📦 Quantity Scaling & Packing Logistics (Version 4.0)
- **Unit Multipliers**: Added weight/piece/bundle scaling calculations (`getOptionMultiplier`) to resolve product quantity mismatches (such as legacy options and `500g * 2 = 1kg` instead of `2kg`).
- **Ordered Products in Quantity**: Replaced the legacy demand leaderboard with a detailed packing dashboard showing aggregated weights and variant counts (e.g. `2 Katta × 5`, `500g × 2`).
- **Logistics Clean-up**: Removed "Delivery Status" select options, delivery columns, and farmer ownership mappings from the Logistics Table and order catalog modal to satisfy security and privacy constraints.

#### 3. 🔒 Week-Locking, Data Clearing, & Administration Enhancements (Version 4.1)
- **Completed Week-Locking**: Implemented dynamic week status detection (`Present`, `Incomplete`, `Locked`). A previous week is locked if all its orders are marked as `'delivered'`. Deleting leads/orders or clearing directories for locked weeks is blocked.
- **Granular Week-Specific Clearing**: Replaced the global "Empty Order Book" button with a "Clear Current Week" function. Added a week-wise "Clear" trigger under Company Statistics (disabled for completed locked weeks).
- **Custom Order Date & Delivery Fees**: Added date-time and delivery charge override input fields in the Create/Edit Manual Order modal to allow retroactively placing or correcting orders.
- **Scoping Leaderboard**: Scoped the Founder packing breakdown console ("Ordered Products in Quantity") to present week quantities only.
- **Local Sandbox & Mock Logins**: Configured `localhost` environment fallback to protect live production Firestore from manual testing data. Mock admin credentials (`admin@kshetrivafarms.com` / `admin123`) autofill on local launches. Added a quick clear query tool (`?clearLocalLeads=true`) to wipe local storage testing leads.

