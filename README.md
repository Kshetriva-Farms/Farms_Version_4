# 🌾 Kshetriva Farms | Fresh From Farm to Your Home

[![Bilingual: English & Telugu](https://img.shields.io/badge/Language-English%20%2F%20%E0%B0%A4%E0%B1%86%E0%B0%B2%E0%B1%81%E0%B0%97%E0%B1%81-green.svg)](#-bilingual-translation-system)
[![Backend: Firebase Live DB](https://img.shields.io/badge/Backend-Firebase%20Live%20DB-FFCA28?logo=firebase&logoColor=white)](#-firebase-real-time-backend-integration)
[![Portal: Admin Dashboard](https://img.shields.io/badge/Portal-Admin%20Dashboard-0070F3.svg)](#-secure-admin-dashboard-portal)
[![Tech Stack: HTML5 / CSS3 / Vanilla JS](https://img.shields.io/badge/Stack-HTML5%20%2F%20CSS3%20%2F%20JS-blue.svg)](#%EF%B8%8F-technology-stack)
[![Responsive: Mobile First](https://img.shields.io/badge/Responsive-Mobile%20%26%20Tablet%20Friendly-orange.svg)](#-responsive-layout)
[![Integration: WhatsApp Checkout](https://img.shields.io/badge/Integration-WhatsApp%20Checkout-25D366.svg)](#-whatsapp-checkout-integration)

Kshetriva Farms is a premium, high-performance single-page web application designed to connect hardworking local farmers from **Maryala, Telangana** directly with urban families. By eliminating middle-men, the platform ensures that families receive fresh, chemical-safe vegetables at fair prices, while local growers earn a sustainable, direct-to-consumer income.

In **Version 2**, the platform has transitioned from a static client-side application into a **live, data-driven dynamic platform** powered by a real-time **Firebase Cloud Backend** and an advanced **Secure Admin Dashboard Portal**. This allows administrators to manage inventories, toggle stock levels, edit product metadata, and sync updates in real-time across all user screens without requiring page reloads.

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
- **Hash-URL Router Access:** Secured admin route accessible via `#admin` hash navigation (`/index.html#admin`).
- **Firebase Authentication:** Restricts entry using secure authentication (`signInWithEmailAndPassword`, `signOut`, `onAuthStateChanged`).
- **Offline Authentication Fallback:** Offers offline administrators local sandbox testing using mock credentials:
  - **Email:** `admin@kshetrivafarms.com`
  - **Password:** `admin123`
- **Dynamic Stats Grid:** A visual overview banner showing running counters for **Total Products**, **In Stock**, and **Out of Stock** items.
- **Comprehensive CRUD Console:**
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

### 💬 WhatsApp Checkout Integration
- Formulates a premium, formatted checkout invoice directly in English or Telugu based on user selection.
- Calculates sub-totals, items, and quantities, formats them cleanly into markdown, and launches an encoded direct link to the business WhatsApp channel.

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
└── README.md         # Detailed Version 2 documentation
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


