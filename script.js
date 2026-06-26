// Firebase configuration keys (Placeholders until user replaces them in the Firebase console)
const firebaseConfig = {
    apiKey: "AIzaSyC4rquVj5Ug2ZdsDci7zHucEUXXVtaCPcI",
    authDomain: "kshetriva-farms.firebaseapp.com",
    projectId: "kshetriva-farms",
    storageBucket: "kshetriva-farms.firebasestorage.app",
    messagingSenderId: "332889493996",
    appId: "1:332889493996:web:945cbd393438dc3aa9b0c9"
};

// Global Firebase Instance State
let db = null;
let auth = null;
let useFirebase = false;
let activeTrackListener = null;

// GA4 Custom Telemetry Helper
function trackGA4Event(eventName, eventParams = {}) {
    if (typeof gtag === 'function') {
        gtag('event', eventName, eventParams);
        console.log(`📊 GA4 Event Tracked: "${eventName}"`, eventParams);
    }
}

// ===== Phase 1: Quantity Option Templates =====
const QTY_TEMPLATES = {
    regular: [
        { label: '250g', value: '250g', price: null, multiplier: 0.25 },
        { label: '500g', value: '500g', price: null, multiplier: 0.5 },
        { label: '1 kg', value: '1kg', price: null, multiplier: 1 }
    ],
    leafy: [
        { label: '2 Katta', value: '2_katta', price: null, multiplier: 2 },
        { label: '4 Katta', value: '4_katta', price: null, multiplier: 4 },
        { label: '8 Katta', value: '8_katta', price: null, multiplier: 8 }
    ],
    premium: [
        { label: '1 Piece', value: '1_pc', price: null, multiplier: 1 },
        { label: '2 Pieces', value: '2_pc', price: null, multiplier: 2 },
        { label: '3 Pieces', value: '3_pc', price: null, multiplier: 3 }
    ]
};

function getQuantityOptions(product) {
    if (product.quantityOptions && product.quantityOptions.length > 0) {
        return product.quantityOptions;
    }
    const type = product.type || 'regular';
    const base = product.pricePerUnit || parseInt((product.price || '0').replace(/[^\d]/g, ''));
    return (QTY_TEMPLATES[type] || QTY_TEMPLATES.regular).map(opt => ({
        ...opt,
        price: opt.price || Math.round(base * opt.multiplier)
    }));
}

// ===== Phase 1: Basket Tier Configuration =====
const BASKET_TIERS = [
    { id: 'farmplus', name: 'Large Basket', nameTE: 'లార్జ్ బాస్కెట్', minItems: 11, discount: 0.15, icon: '🌾', cssClass: 'tier-farmplus' },
    { id: 'weekly', name: 'Medium Basket', nameTE: 'మీడియం బాస్కెట్', minItems: 8, discount: 0.10, icon: '🧺', cssClass: 'tier-weekly' },
    { id: 'family', name: 'Small Basket', nameTE: 'స్మాల్ బాస్కెట్', minItems: 5, discount: 0.05, icon: '🏠', cssClass: 'tier-family' },
];

// ===== Phase 1: Ordering Window Schedule =====
const ORDERING_SCHEDULE = {
    openDay: 5,      // Friday (0=Sunday)
    openHour: 12,    // 12:00 PM
    closeDay: 6,     // Saturday
    closeHour: 21,   // 9:00 PM
    deliveryDay: 0   // Sunday
};

// Global Ordering Window Override State
let manualWindowState = { overrideActive: false, overrideOpen: false };

// ===== Phase 1: Minimum Order =====
const MINIMUM_ORDER = 0; // Removed/disabled (changed from 199)

// Mock / Initial Products Data (Acts as default catalog and local fallback db)
let products = [
    {
        id: 1,
        name: "Spinach (Palak)",
        name_en: "Spinach (Palak)",
        name_te: "తాజా పాలకూర (పాలక్)",
        category: "leafy",
        type: "leafy",
        price: "₹5",
        pricePerUnit: 5,
        costPrice: 4,
        unit: "bunch",
        image: "images/spinach.webp",
        inStock: true,
        docId: "prod_1",
        farmerId: 2
    },
    {
        id: 2,
        name: "Carrots",
        name_en: "Carrots",
        name_te: "క్యారెట్",
        category: "root",
        type: "regular",
        price: "₹60",
        pricePerUnit: 60,
        costPrice: 54,
        unit: "kg",
        image: "images/carrots.webp",
        inStock: false,
        docId: "prod_2",
        farmerId: 1
    },
    {
        id: 3,
        name: "Red Tomatoes",
        name_en: "Red Tomatoes",
        name_te: "టమాటా",
        category: "vegetables",
        type: "regular",
        price: "₹52",
        pricePerUnit: 52,
        costPrice: 46,
        unit: "kg",
        image: "images/tomatoes.webp",
        inStock: true,
        docId: "prod_3",
        farmerId: 3
    },
    {
        id: 5,
        name: "Cabbage",
        name_en: "Cabbage",
        name_te: "క్యాబేజీ",
        category: "leafy",
        type: "premium",
        price: "₹30",
        pricePerUnit: 30,
        costPrice: 24,
        unit: "pc",
        image: "images/cabbage.webp",
        inStock: false,
        docId: "prod_5",
        farmerId: 2
    },
    {
        id: 6,
        name: "Potatoes (Aloo)",
        name_en: "Potatoes (Aloo)",
        name_te: "బంగాళాదుంప",
        category: "root",
        type: "regular",
        price: "₹35",
        pricePerUnit: 35,
        costPrice: 29,
        unit: "kg",
        image: "images/potatoes.webp",
        inStock: false,
        docId: "prod_6",
        farmerId: 1
    },
    {
        id: 7,
        name: "Coriander (Kothmir)",
        name_en: "Coriander (Kothmir)",
        name_te: "కొత్తిమీర",
        category: "leafy",
        type: "leafy",
        price: "₹15",
        pricePerUnit: 15,
        costPrice: 10,
        unit: "bunch",
        image: "images/coriander.webp",
        inStock: true,
        docId: "prod_7",
        farmerId: 2
    },
    {
        id: 8,
        name: "Lady Finger (Bhindi)",
        name_en: "Lady Finger (Bhindi)",
        name_te: "బెండకాయ",
        category: "vegetables",
        type: "regular",
        price: "₹50",
        pricePerUnit: 50,
        costPrice: 30,
        unit: "kg",
        image: "images/lady_finger.webp",
        inStock: true,
        docId: "prod_8",
        farmerId: 3
    },
    {
        id: 9,
        name: "Bottle Gourd (Lauki)",
        name_en: "Bottle Gourd (Lauki)",
        name_te: "సోరకాయ",
        category: "vegetables",
        type: "premium",
        price: "₹30",
        pricePerUnit: 30,
        costPrice: 24,
        unit: "pc",
        image: "images/bottle_gourd.webp",
        inStock: true,
        docId: "prod_9",
        farmerId: 3
    },
    {
        id: 10,
        name: "Water spinach ",
        name_en: "Water spinach ",
        name_te: "గంగవల్లి కుర",
        category: "leafy",
        type: "leafy",
        price: "₹5",
        pricePerUnit: 5,
        costPrice: 3,
        unit: "bunch",
        image: "images/water_spinach.webp",
        inStock: false,
        docId: "prod_10",
        farmerId: 2
    },
    {
        id: 11,
        name: "Ivy Gourd (DhondaKaya)",
        name_en: "Ivy Gourd (DhondaKaya)",
        name_te: "దొండకాయ",
        category: "vegetables",
        type: "regular",
        price: "₹48",
        pricePerUnit: 48,
        costPrice: 42,
        unit: "kg",
        image: "images/Ivy_gourd.webp",
        inStock: true,
        docId: "prod_11",
        farmerId: 3
    },
    {
        id: 12,
        name: "Brinjal (Egg plant)",
        name_en: "Brinjal (Egg plant)",
        name_te: "వంకాయ",
        category: "vegetables",
        type: "regular",
        price: "₹48",
        pricePerUnit: 48,
        costPrice: 42,
        unit: "kg",
        image: "images/Brinjal.webp",
        inStock: true,
        docId: "prod_12",
        farmerId: 3
    },
    {
        id: 13,
        name: "Cucumber (Yellow)",
        name_en: "Cucumber (Yellow)",
        name_te: "దోసకాయ",
        category: "vegetables",
        type: "regular",
        price: "₹40",
        pricePerUnit: 40,
        costPrice: 34,
        unit: "kg",
        image: "images/Cucumber_(Yellow).webp",
        inStock: true,
        docId: "prod_13",
        farmerId: 3
    },
    {
        id: 14,
        name: "Cucumber (Green)",
        name_en: "Cucumber (Green)",
        name_te: "కీర దోస",
        category: "vegetables",
        type: "regular",
        price: "₹38",
        pricePerUnit: 38,
        costPrice: 32,
        unit: "kg",
        image: "images/Cucumber_(Green).webp",
        inStock: false,
        docId: "prod_14",
        farmerId: 3
    },
    {
        id: 15,
        name: "Bitter gourd",
        name_en: "Bitter gourd",
        name_te: "కాకరకాయ",
        category: "vegetables",
        type: "regular",
        price: "₹54",
        pricePerUnit: 54,
        costPrice: 48,
        unit: "kg",
        image: "images/Bitter_gourd.webp",
        inStock: true,
        docId: "prod_15",
        farmerId: 3
    },
    {
        id: 16,
        name: "Green chilli ",
        name_en: "Green chilli ",
        name_te: "పచ్చిమిర్చి",
        category: "vegetables",
        type: "regular",
        price: "₹55",
        pricePerUnit: 55,
        costPrice: 49,
        unit: "kg",
        image: "images/green_chilli.webp",
        inStock: true,
        docId: "prod_16",
        farmerId: 3
    },
    {
        id: 17,
        name: "Asparagus (ThotaKura)",
        name_en: "Asparagus (ThotaKura)",
        name_te: "తోటకూర",
        category: "leafy",
        type: "leafy",
        price: "₹5",
        pricePerUnit: 5,
        costPrice: 4,
        unit: "bunch",
        image: "images/Thota_kura.webp",
        inStock: false,
        docId: "prod_17",
        farmerId: 2
    },
    {
        id: 18,
        name: "Sorrel (Gongura)",
        name_en: "Sorrel (Gongura)",
        name_te: "గోంగూర/పుంటికూర",
        category: "leafy",
        type: "leafy",
        price: "₹5",
        pricePerUnit: 5,
        costPrice: 4,
        unit: "bunch",
        image: "images/gongura.webp",
        inStock: false,
        docId: "prod_18",
        farmerId: 2
    },
    {
        id: 19,
        name: "Ridge Gourd (Beerakaya)",
        name_en: "Ridge Gourd (Beerakaya)",
        name_te: "బీరకాయ",
        category: "vegetables",
        type: "regular",
        price: "₹58",
        pricePerUnit: 58,
        costPrice: 52,
        unit: "kg",
        image: "https://raw.githubusercontent.com/Kshetriva-Farms/Farms_Version_3.5/main/images/Ridge_Gourd.webp",
        inStock: true,
        docId: "prod_19",
        farmerId: 3
    }
];

// Initialize Firebase dynamically
try {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:';
    if (typeof firebase !== 'undefined' && firebaseConfig.apiKey !== "YOUR_API_KEY" && !isLocalhost) {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        auth = firebase.auth();
        useFirebase = true;
        console.log("🌾 Kshetriva Farms: Live Firebase Backend Connected successfully.");
    } else {
        useFirebase = false;
        if (isLocalhost) {
            console.log("⚠️ Running on localhost. Firestore connections disabled to protect production data. Using offline LocalStorage fallback.");
        } else {
            console.log("🌾 Kshetriva Farms: Running in Local Fallback Database mode. Setup Firebase credentials to sync live online.");
        }
        // Load offline client catalog from LocalStorage if present
        const offlineCatalog = localStorage.getItem('kshetriva_catalog');
        if (offlineCatalog) {
            try {
                products = JSON.parse(offlineCatalog);
                // Migrate legacy 'organic' category to 'vegetables'
                products.forEach(p => {
                    if (p.category === 'organic') p.category = 'vegetables';
                });
            } catch (e) {
                console.error("Failed to parse offline localStorage catalog:", e);
            }
        }
    }
} catch (e) {
    console.error("🌾 Kshetriva Farms: Backend connection exception:", e);
}

// Temporary utility to clear local testing leads via URL parameter
try {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('clearLocalLeads') === 'true') {
        localStorage.removeItem('kshetriva_leads');
        console.log("🧹 Kshetriva Farms: Local testing leads cleared successfully.");
        const newUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, newUrl);
    }
} catch (err) {
    console.error("Failed to clear local leads:", err);
}

const productGrid = document.getElementById('productGrid');

// Language Translation Dictionary
const translations = {
    en: {
        logoText: "Kshetriva Farms",
        navHome: "Home",
        navAbout: "About Us",
        navHow: "How It Works",
        navProducts: "Products",
        navFarmers: "Our Farmers",
        navGallery: "Gallery",
        navReviews: "Reviews",
        heroTitle: "Fresh From Farm to Your Home",
        heroSubtitle: "No Middlemen. Fresh Vegetables. Better Prices for Families and Better Income for Farmers.",
        heroOrderBtn: "Order Now",
        heroContactBtn: "Contact Us",
        heroWhatsappBtn: " Chat on WhatsApp",
        aboutTitle: "About Kshetriva Farms",
        aboutP1Bold: "Direct Farm-to-Home Delivery:",
        aboutP1Text: " We bridge the gap between hardworking farmers and your kitchen table, cutting out the middlemen to ensure you get the freshest produce possible.",
        aboutP2Bold: "Fresh & Chemical-Safe:",
        aboutP2Text: " Our vegetables are grown with care, ensuring they are safe, healthy, and full of natural nutrients for your family.",
        aboutP3Bold: "Supporting Local Farmers:",
        aboutP3Text: " By buying directly through us, you are helping local farmers earn a fair and sustainable income for their hard work.",
        aboutP4Bold: "Transparency in Sourcing:",
        aboutP4Text: " Know exactly where your food comes from. We believe in complete transparency from the soil to your plate.",
        howTitle: "How It Works",
        howSubtitle: "A simple, transparent journey from our farms to your home",
        step1Title: "1. Farmer Harvests",
        step1Text: "Farmers pick fresh produce at peak ripeness.",
        step2Title: "2. Quality Check",
        step2Text: "Our experts ensure every item meets high standards.",
        step3Title: "3. Fresh Packaging",
        step3Text: "Produce is carefully packed to retain freshness.",
        step4Title: "4. Home Delivery",
        step4Text: "Delivered straight to your door, fast and fresh.",
        productsTitle: "🌾 This Week's Harvest",
        productsSubtitle: "Fresh picks available for Sunday delivery",
        filterAll: "All",
        filterLeafy: "Leafy Vegetables",
        filterRoot: "Root Vegetables",
        filterSeasonal: "Seasonal",
        filterOrganic: "Vegetables",
        filterFruits: "Fruits",
        farmersTitle: "Meet Our Farmers",
        farmersSubtitle: "The proud hands that feed our community",
        farmer1Name: "M. Surendhar Reddy",
        farmer1Story: "Surendhar has been cultivating safe, chemical-free root vegetables for over 15 years. His dedication to sustainable farming ensures the best quality carrots and beets.",
        farmer2Name: "N. Bhaskar Reddy",
        farmer2Story: "A pioneer in leafy greens. Bhaskar uses safe fertilizers to grow the freshest spinach and kale. Kshetriva helps him sell directly without relying on wholesale markets.",
        farmer3Name: "P. Raju",
        farmer3Story: "Specializing in seasonal fruits, Raju's farm is a local legend for sweet mangoes and guavas. He loves seeing photos of families enjoying his harvest.",
        galleryTitle: "Farm Gallery",
        gallerySubtitle: "Glimpses of our daily farm life and deliveries",
        galleryItem1: "Lush Fields",
        galleryItem2: "Morning Harvest",
        galleryItem3: "Quality Check",
        galleryItem4: "Ready for Delivery",
        reviewsTitle: "Customer Reviews",
        reviewsSubtitle: "What families say about our farm-fresh produce",
        review1Name: "Ganesh.P",
        review1Text: '"The spinach and tomatoes were incredibly fresh! It feels so good knowing my money goes directly to the farmers. Highly recommended!"',
        review2Name: "Sanjay.T",
        review2Text: '"Ordering through WhatsApp is so easy. The delivery was prompt, and the quality of organic vegetables is unmatched in the local market."',
        review3Name: "Vamshi.A",
        review3Text: '"I loved reading the stories of the farmers on the website. The connection makes the food taste even better. Great initiative!"',
        footerDesc: "From Farm to Home — Directly. Empowering farmers and bringing health to families.",
        footerLinks: "Quick Links",
        footerContact: "Contact Us",
        footerFollow: "Follow Us",
        footerCopyright: "© 2026 Kshetriva Farms. All rights reserved.",
        basketTitle: " Your Basket",
        basketClearBtn: "Clear All",
        basketTotal: "Total:",
        basketOrderBtn: " Send Order on WhatsApp",
        basketEmpty: "Your basket is empty.",
        basketEmptySub: "Add fresh vegetables to get started!",
        confirmModalTitle: "Empty Your Basket?",
        confirmModalDesc: "Are you sure you want to clear all products from your basket?",
        confirmModalCancel: "Cancel",
        confirmModalAccept: "Clear All",
        recoveryTitle: "Resume Your Basket?",
        recoveryDesc: "You have items in your draft basket from your last visit.",
        recoveryBtnClear: "Clear",
        recoveryBtnResume: "Resume Basket",

        spinachName: "Spinach (Palak)",
        carrotsName: "Carrots",
        tomatoesName: "Red Tomatoes",
        mangoesName: "Alphonso Mangoes",
        cabbageName: "Cabbage",
        potatoesName: "Potatoes (Aloo)",
        corianderName: "Coriander (Kothmir)",
        ladyfingerName: "Lady Finger (Bhindi)",
        bottlegourdName: "Bottle Gourd (Lauki)",

        unitBunch: "bunch",
        unitKg: "kg",
        unitPc: "pc",
        unitDozen: "dozen",

        btnAddToBasket: "Add to Basket",
        btnAdded: "✓ Added!",
        btnReset: "✓ Reset!",
        emailCopied: " Email copied to clipboard!",
        outOfStock: "Out of Stock",
        btnOutOfStock: "Out of Stock",

        // Phase 1: Ordering Window
        bannerLiveTitle: "Order by Saturday 9 PM",
        bannerLiveSubtext: "Limited time only! Closes soon, place your order now.",
        bannerClosedTitle: "Ordering Opens Friday 12 PM",
        bannerClosedSubtext: "Browse our catalog and plan your weekly basket",
        bannerClosesIn: "Closes in:",
        bannerOpensIn: "Opens in:",
        harvestUpdated: "Updated:",

        // Phase 1: Basket Tiers
        basketFamilyName: "Small Basket",
        basketWeeklyName: "Medium Basket",
        basketFarmPlusName: "Large Basket",
        basketDiscountApplied: "Discount Applied",
        basketSuitability: "{tier} is suitable for your {n} items!",
        basketProgressNudge: "Add <strong>{n} more item(s)</strong> to unlock {tier}!",
        subtotalLabel: "Subtotal:",
        discountLabel: "Basket Discount ({pct}%):",
        totalLabel: "Total:",

        // Phase 2: Delivery & Empty Category
        deliveryLabel: "Delivery Charges:",
        freeDelivery: "Free Delivery",
        categoryComingSoon: "Coming Soon",
        categoryComingSoonSub: "Sorry, no fresh harvest in this category today. Please check back later!",

        // Phase 1: Min Order
        minOrderText: "Minimum order: 3 products or total above ₹99 to checkout.",

        // Phase 1: Window Closed
        windowClosedText: "Ordering opens Friday 12 PM. You can browse and build your cart now.",

        // Phase 1: Qty Tooltip
        kattaTooltip: "1 katta ≈ fresh bunch bundle",

        // Phase 1: Product Badges
        badgeFreshHarvest: "🌱 Fresh Harvest",
        badgeLimited: "⚡ Limited Qty",
        badgeFarmerPick: "⭐ Farmer's Pick",

        // Phase 1: WhatsApp Message
        waDeliveryDay: "Sunday",
        waPayment: "Cash on Delivery",

        // Phase 3: Coupons
        couponPlaceholder: "Enter coupon code",
        couponApplyBtn: "Apply",
        couponRemoveBtn: "Remove",
        couponInvalid: "Invalid coupon code",
        couponApplied: "Coupon '{code}' applied successfully!",

        // Phase 3.5: WhatsApp leads modal details
        detailsModalTitleOrder: "Confirm Order Details",
        detailsModalTitleChat: "Connect on WhatsApp",
        detailsModalSubtitleOrder: "Please provide your delivery details to complete your order.",
        detailsModalSubtitleChat: "Please enter your details to start chatting with us on WhatsApp.",
        detailsLabelName: "Your Name *",
        detailsLabelPhone: "WhatsApp Number *",
        detailsLabelArea: "Area / Locality *",
        detailsBtnProceed: "Proceed to WhatsApp",
        detailsPlaceholderName: "e.g. Rahul Sharma",
        detailsPlaceholderPhone: "e.g. 9876543210",
        detailsPlaceholderArea: "e.g. Maryala, Telangana"
    },
    te: {
        logoText: "క్షేత్రీవ ఫార్మ్స్",
        navHome: "హోమ్",
        navAbout: "మా గురించి",
        navHow: "ఇది ఎలా పనిచేస్తుంది",
        navProducts: "ఉత్పత్తులు",
        navFarmers: "మా రైతులు",
        navGallery: "గ్యాలరీ",
        navReviews: "సమీక్షలు",
        heroTitle: "పొలం నుండి నేరుగా మీ ఇంటికి తాజా కూరగాయలు",
        heroSubtitle: "మధ్యవర్తులు లేరు. తాజా కూరగాయలు. కుటుంబాలకు మంచి ధరలు మరియు రైతులకు మెరుగైన ఆదాయం.",
        heroOrderBtn: "ఇప్పుడే ఆర్డర్ చేయండి",
        heroContactBtn: "మమ్మల్ని సంప్రదించండి",
        heroWhatsappBtn: " వాట్సాప్‌లో చాట్ చేయండి",
        aboutTitle: "క్షేత్రీవ ఫార్మ్స్ గురించి",
        aboutP1Bold: "నేరుగా పొలం నుండి ఇంటికి డెలివరీ:",
        aboutP1Text: " కష్టపడి పనిచేసే రైతులకు మరియు మీ వంటగదికి మధ్య మేము వారధిగా ఉంటాము, మధ్యవర్తులను తొలగించి మీకు సాధ్యమైనంత తాజా ఉత్పత్తులు అందేలా చూస్తాము.",
        aboutP2Bold: "తాజా & రసాయన రహిత:",
        aboutP2Text: " మా కూరగాయలు ఎంతో శ్రద్ధతో పండిస్తారు, అవి మీ కుటుంబానికి సురక్షితమైనవి, ఆరోగ్యకరమైనవి మరియు సహజమైన పోషకాలతో నిండి ఉండేలా చూస్తాము.",
        aboutP3Bold: "స్థానిక రైతులకు మద్దతు:",
        aboutP3Text: " మా ద్వారా నేరుగా కొనుగోలు చేయడం ద్వారా, స్థానిక రైతులు వారి కష్టానికి తగిన మరియు స్థిరమైన ఆదాయాన్ని పొందడానికి మీరు సహాయం చేస్తున్నారు.",
        aboutP4Bold: "మూలాల్లో పారదర్శకత:",
        aboutP4Text: " మీ ఆహారం ఎక్కడి నుండి వస్తుందో ఖచ్చితంగా తెలుసుకోండి. మట్టి నుండి మీ ప్లేట్ వరకు పూర్తి పారదర్శకతను మేము నమ్ముతాము.",
        howTitle: "ఇది ఎలా పనిచేస్తుంది",
        howSubtitle: "మా పొలాల నుండి మీ ఇంటికి ఒక సరళమైన, పారదర్శక ప్రయాణం",
        step1Title: "1. రైతు కోత కోస్తారు",
        step1Text: "రైతులు పూర్తి పక్వానికి వచ్చిన తాజా ఉత్పత్తులను కోస్తారు.",
        step2Title: "2. నాణ్యత తనిఖీ",
        step2Text: "ప్రతి వస్తువు ఉన్నత ప్రమాణాలకు అనుగుణంగా ఉందని మా నిపుణులు నిర్ధారిస్తారు.",
        step3Title: "3. తాజా ప్యాకేజింగ్",
        step3Text: "తాజాదనాన్ని నిలుపుకోవడానికి ఉత్పత్తులు జాగ్రత్తగా ప్యాక్ చేయబడతాయి.",
        step4Title: "4. ఇంటి వద్దకే డెలివరీ",
        step4Text: "తాజాగా మరియు వేగంగా నేరుగా మీ ఇంటి వద్దకే డెలివరీ చేయబడుతుంది.",
        productsTitle: "🌾 ఈ వారపు పంట",
        productsSubtitle: "ఆదివారం డెలివరీ కోసం తాజా ఎంపికలు",
        filterAll: "అన్నీ",
        filterLeafy: "ఆకుకూరలు",
        filterRoot: "దుంపలు",
        filterSeasonal: "సీజనల్",
        filterOrganic: "కూరగాయలు",
        filterFruits: "పండ్లు",
        farmersTitle: "మా రైతులను కలవండి",
        farmersSubtitle: "మన సమాజానికి ఆహారాన్ని అందించే గర్వించదగిన హస్తాలు",
        farmer1Name: "ఎమ్. సురేందర్ రెడ్డి",
        farmer1Story: "సురేందర్ 15 సంవత్సరాలకు పైగా రసాయన రహిత దుంప కూరగాయలను పండిస్తున్నారు. స్థిరమైన వ్యవసాయం పట్ల ఆయనకున్న అంకితభావం ఉత్తమ నాణ్యమైన క్యారెట్లు మరియు బీట్‌రూట్‌లను నిర్ధారిస్తుంది.",
        farmer2Name: "ఎన్. భాస్కర్ రెడ్డి",
        farmer2Story: "ఆకుకూరల పెంపకంలో మార్గదర్శకుడు. భాస్కర్ అత్యంత తాజా పాలకూర మరియు కేల్‌ను పండించడానికి సురక్షితమైన ఎరువులను ఉపయోగిస్తారు. క్షేత్రీవ హోల్‌సేల్ మార్కెట్లపై ఆధారపడకుండా నేరుగా విక్రయించడానికి ఆయనకు సహాయం చేస్తుంది.",
        farmer3Name: "పి. రాజు",
        farmer3Story: "సీజనల్ పండ్ల పెంపకంలో నైపుణ్యం కలిగిన రాజు తోట తీపి మామిడి మరియు జామకాయలకు స్థానికంగా ఎంతో ప్రసిద్ధి చెందింది. కుటుంబాలు తన పంటను ఆస్వాదిస్తున్న ఫోటోలను చూడటం ఆయనకు చాలా ఇష్టం.",
        galleryTitle: "ఫార్మ్ గ్యాలరీ",
        gallerySubtitle: "మా రోజువారీ వ్యవసాయ జీవితం మరియు డెలివరీల جھలకలు",
        galleryItem1: "పచ్చని పొలాలు",
        galleryItem2: "ఉదయపు కోత",
        galleryItem3: "నాణ్యత తనిఖీ",
        galleryItem4: "డెలివరీకి సిద్ధం",
        reviewsTitle: "వినియోగదారుల సమీక్షలు",
        reviewsSubtitle: "మా పొలం-తాజా ఉత్పత్తుల గురించి కుటుంబాలు ఏమంటున్నాయి",
        review1Name: "గణేష్.పి",
        review1Text: '"పాలకూర మరియు టమోటాలు చాలా తాజాగా ఉన్నాయి! నా డబ్బు నేరుగా రైతులకే వెళుతుందని తెలియడం చాలా సంతోషంగా ఉంది. తప్పకుండా కొనండి!"',
        review2Name: "సంజయ్.టి",
        review2Text: '"వాట్సాప్ ద్వారా ఆర్డర్ చేయడం చాలా సులభం. డెలివరీ చాలా త్వరగా జరిగింది, మరియు సేంద్రీయ కూరగాయల నాణ్యత స్థానిక మార్కెట్లో మరెక్కడా లభించదు."',
        review3Name: "వంశీ.ఎ",
        review3Text: '"వెబ్‌సైట్‌లో రైతుల కథలు చదవడం నాకు చాలా నచ్చింది. ఈ అనుబంధం ఆహారాన్ని మరింత రుచిగా చేస్తుంది. గొప్ప ప్రయత్నం!"',
        footerDesc: "పొలం నుండి నేరుగా ఇంటికి. రైతుల సబలీకరణ మరియు కుటుంబాల ఆరోగ్యం.",
        footerLinks: "త్వరిత లింకులు",
        footerContact: "మమ్మల్ని సంప్రదించండి",
        footerFollow: "మమ్మల్ని అనుసరించండి",
        footerCopyright: "© 2026 క్షేత్రీవ ఫార్మ్స్. అన్ని హక్కులు ప్రత్యేకించబడ్డాయి.",
        basketTitle: " మీ బాస్కెట్",
        basketClearBtn: "అన్నీ తీసివేయి",
        basketTotal: "మొత్తం:",
        basketOrderBtn: " వాట్సాప్‌లో ఆర్డర్ పంపండి",
        basketEmpty: "మీ బాస్కెట్ ఖాళీగా ఉంది.",
        basketEmptySub: "ప్రారంభించడానికి తాజా కూరగాయలను జోడించండి!",
        confirmModalTitle: "మీ బాస్కెట్‌ను ఖాళీ చేయాలా?",
        confirmModalDesc: "మీ బాస్కెట్ నుండి అన్ని ఉత్పత్తులను తొలగించాలనుకుంటున్నారా?",
        confirmModalCancel: "రద్దు చేయి",
        confirmModalAccept: "అన్నీ తీసివేయి",
        recoveryTitle: "మీ బాస్కెట్‌ను పునరుద్ధరించాలా?",
        recoveryDesc: "మీ చివరి సందర్శన నుండి కొన్ని ఉత్పత్తులు బాస్కెట్‌లో ఉన్నాయి.",
        recoveryBtnClear: "తొలగించు",
        recoveryBtnResume: "పునరుద్ధరించు",

        spinachName: "పాలకూర (పాలక్)",
        carrotsName: "క్యారెట్లు",
        tomatoesName: "ఎర్రటి టమోటాలు",
        mangoesName: "అల్ఫోన్సో మామిడి పండ్లు",
        cabbageName: "క్యాబేజీ",
        potatoesName: "బంగాళాదుంపలు (ఆలూ)",
        corianderName: "కొత్తిమీర",
        ladyfingerName: "బెండకాయలు (భిండి)",
        bottlegourdName: "ఆనపకాయ/సొరకాయ (లౌకి)",

        unitBunch: "కట్ట",
        unitKg: "కిలో",
        unitPc: "ముక్క / కాయ",
        unitDozen: "డజను",

        btnAddToBasket: "బాస్కెట్‌కు జోడించు",
        btnAdded: "✓ జోడించబడింది!",
        btnReset: "✓ రీసెట్!",
        emailCopied: " ఈమెయిల్ క్లిప్‌బోర్డ్‌కు కాపీ చేయబడింది!",
        outOfStock: "స్టాక్ లేదు",
        btnOutOfStock: "స్టాక్ లేదు",

        bannerLiveTitle: "శనివారం 9 PM లోపు ఆర్డర్ చేయండి",
        bannerLiveSubtext: "పరిమిత సమయం మాత్రమే! త్వరలో ముగుస్తుంది, ఇప్పుడే ఆర్డర్ చేయండి.",
        bannerClosedTitle: "ఆర్డరింగ్ శుక్రవారం 12 PM న ప్రారంభం",
        bannerClosedSubtext: "మా క్యాటలాగ్ చూసి మీ వారపు బాస్కెట్ ప్లాన్ చేయండి",
        bannerClosesIn: "ముగుస్తుంది:",
        bannerOpensIn: "తెరుచుకుంటుంది:",
        harvestUpdated: "నవీకరించబడింది:",

        basketFamilyName: "స్మాల్ బాస్కెట్",
        basketWeeklyName: "మీడియం బాస్కెట్",
        basketFarmPlusName: "లార్జ్ బాస్కెట్",
        basketDiscountApplied: "తగ్గింపు వర్తించబడింది",
        basketSuitability: "మీరు జోడించిన {n} వస్తువులకు {tier} సరిపోతుంది!",
        basketProgressNudge: "<strong>{n} మరిన్ని వస్తువులు</strong> జోడించి {tier} అన్‌లాక్ చేయండి!",
        subtotalLabel: "ఉప మొత్తం:",
        discountLabel: "బాస్కెట్ తగ్గింపు ({pct}%):",
        totalLabel: "మొత్తం:",

        // Phase 2: Delivery & Empty Category
        deliveryLabel: "డెలివరీ ఛార్జీలు:",
        freeDelivery: "ఉచిత డెలివరీ",
        categoryComingSoon: "త్వరలో రాబోతోంది",
        categoryComingSoonSub: "క్షమించండి, ఈ విభాగంలో ఈరోజు తాజా పంట అందుబాటులో లేదు. దయచేసి తర్వాత సందర్శించండి!",

        minOrderText: "కనీస ఆర్డర్: 3 ఉత్పత్తులు లేదా మొత్తం ₹99 కంటే ఎక్కువ ఉండాలి.",
        windowClosedText: "ఆర్డరింగ్ శుక్రవారం 12 PM న తెరుచుకుంటుంది. మీరు ఇప్పుడు బ్రౌజ్ చేయవచ్చు.",
        kattaTooltip: "1 కట్ట ≈ తాజా కట్ట బండిల్",

        badgeFreshHarvest: "🌱 తాజా పంట",
        badgeLimited: "⚡ పరిమిత సంఖ్య",
        badgeFarmerPick: "⭐ రైతు ఎంపిక",

        waDeliveryDay: "ఆదివారం",
        waPayment: "క్యాష్ ఆన్ డెలివరీ",

        // Phase 3: Coupons
        couponPlaceholder: "కూపన్ కోడ్ నమోదు చేయండి",
        couponApplyBtn: "వర్తింపజేయి",
        couponRemoveBtn: "తొలగించు",
        couponInvalid: "చెల్లని కూపన్ కోడ్",
        couponApplied: "కూపన్ '{code}' విజయవంతంగా వర్తింపజేయబడింది!",

        // Phase 3.5: WhatsApp leads modal details
        detailsModalTitleOrder: "ఆర్డర్ వివరాలను ధృవీకరించండి",
        detailsModalTitleChat: "వాట్సాప్‌లో కనెక్ట్ అవ్వండి",
        detailsModalSubtitleOrder: "మీ ఆర్డర్‌ను పూర్తి చేయడానికి దయచేసి మీ డెలివరీ వివరాలను అందించండి.",
        detailsModalSubtitleChat: "వాట్సాప్‌లో మాతో చాట్ చేయడం ప్రారంభించడానికి దయచేసి మీ వివరాలను నమోదు చేయండి.",
        detailsLabelName: "మీ పేరు *",
        detailsLabelPhone: "వాట్సాప్ మొబైల్ నంబర్ *",
        detailsLabelArea: "ప్రాంతం / నివాస స్థలం *",
        detailsBtnProceed: "వాట్సాప్‌కు వెళ్లండి",
        detailsPlaceholderName: "ఉదా. రాహుల్ శర్మ",
        detailsPlaceholderPhone: "ఉదా. 9876543210",
        detailsPlaceholderArea: "ఉదా. మర్యాల, తెలంగాణ"
    }
};

let currentLang = localStorage.getItem('kshetriva_lang') || 'en';

function applyLanguage() {
    const dict = translations[currentLang];

    // 1. Update Lang Selector sliding toggle states
    const langToggle = document.getElementById('langToggle');
    const langOptEn = document.getElementById('langOptEn');
    const langOptTe = document.getElementById('langOptTe');
    if (langToggle && langOptEn && langOptTe) {
        if (currentLang === 'te') {
            langToggle.classList.add('te-active');
            langOptTe.classList.add('active');
            langOptEn.classList.remove('active');
        } else {
            langToggle.classList.remove('te-active');
            langOptTe.classList.remove('active');
            langOptEn.classList.add('active');
        }
    }

    // Fallback: support older cached HTML button langBtn
    const langText = document.getElementById('langText');
    if (langText) {
        langText.textContent = currentLang === 'en' ? 'TE' : 'EN';
    }

    // 2. Translate Static Elements

    // Logo
    document.querySelectorAll('.logo span').forEach(el => el.textContent = dict.logoText);

    // Nav Links
    const homeLink = document.querySelector('.nav-links a[href="#home"]');
    if (homeLink) homeLink.textContent = dict.navHome;
    const aboutLink = document.querySelector('.nav-links a[href="#about"]');
    if (aboutLink) aboutLink.textContent = dict.navAbout;
    const howLink = document.querySelector('.nav-links a[href="#how-it-works"]');
    if (howLink) howLink.textContent = dict.navHow;
    const productsLink = document.querySelector('.nav-links a[href="#products"]');
    if (productsLink) productsLink.textContent = dict.navProducts;
    const farmersLink = document.querySelector('.nav-links a[href="#farmers"]');
    if (farmersLink) farmersLink.textContent = dict.navFarmers;
    const galleryLink = document.querySelector('.nav-links a[href="#gallery"]');
    if (galleryLink) galleryLink.textContent = dict.navGallery;
    const reviewsLink = document.querySelector('.nav-links a[href="#reviews"]');
    if (reviewsLink) reviewsLink.textContent = dict.navReviews;

    // Hero
    const heroTitle = document.querySelector('.hero-content h1');
    if (heroTitle) heroTitle.textContent = dict.heroTitle;
    const heroSubtitle = document.querySelector('.hero-content p');
    if (heroSubtitle) heroSubtitle.textContent = dict.heroSubtitle;
    const heroOrder = document.querySelector('.hero-btns .btn-primary');
    if (heroOrder) heroOrder.textContent = dict.heroOrderBtn;
    const heroContact = document.querySelector('.hero-btns .btn-secondary');
    if (heroContact) heroContact.textContent = dict.heroContactBtn;
    const heroWhatsapp = document.querySelector('.hero-btns .btn-whatsapp');
    if (heroWhatsapp) {
        heroWhatsapp.innerHTML = `<i class="fa-brands fa-whatsapp"></i> ${dict.heroWhatsappBtn}`;
    }

    // About
    const aboutHeader = document.querySelector('.about-text h3');
    if (aboutHeader) aboutHeader.textContent = dict.aboutTitle;

    const aboutPs = document.querySelectorAll('.about-text p');
    if (aboutPs.length >= 4) {
        aboutPs[0].innerHTML = `<strong>${dict.aboutP1Bold}</strong>${dict.aboutP1Text}`;
        aboutPs[1].innerHTML = `<strong>${dict.aboutP2Bold}</strong>${dict.aboutP2Text}`;
        aboutPs[2].innerHTML = `<strong>${dict.aboutP3Bold}</strong>${dict.aboutP3Text}`;
        aboutPs[3].innerHTML = `<strong>${dict.aboutP4Bold}</strong>${dict.aboutP4Text}`;
    }

    // How It Works
    const howHeader = document.querySelector('.how-it-works .section-title');
    if (howHeader) howHeader.textContent = dict.howTitle;
    const howSubtitle = document.querySelector('.how-it-works .section-subtitle');
    if (howSubtitle) howSubtitle.textContent = dict.howSubtitle;

    const steps = document.querySelectorAll('.step');
    if (steps.length >= 4) {
        steps[0].querySelector('h4').textContent = dict.step1Title;
        steps[0].querySelector('p').textContent = dict.step1Text;
        steps[1].querySelector('h4').textContent = dict.step2Title;
        steps[1].querySelector('p').textContent = dict.step2Text;
        steps[2].querySelector('h4').textContent = dict.step3Title;
        steps[2].querySelector('p').textContent = dict.step3Text;
        steps[3].querySelector('h4').textContent = dict.step4Title;
        steps[3].querySelector('p').textContent = dict.step4Text;
    }

    // Products Titles
    const pTitle = document.getElementById('harvestTitle');
    if (pTitle) pTitle.textContent = dict.productsTitle;
    const pSubtitle = document.getElementById('harvestSubtitle');
    if (pSubtitle) pSubtitle.textContent = dict.productsSubtitle;

    // Category Filters
    const filterBtnsEl = document.querySelectorAll('.category-filter .filter-btn');
    filterBtnsEl.forEach(btn => {
        const filter = btn.getAttribute('data-filter');
        if (filter === 'all') btn.textContent = dict.filterAll;
        else if (filter === 'leafy') btn.textContent = dict.filterLeafy;
        else if (filter === 'root') btn.textContent = dict.filterRoot;
        else if (filter === 'seasonal') btn.textContent = dict.filterSeasonal;
        else if (filter === 'vegetables') btn.textContent = dict.filterOrganic;
        else if (filter === 'fruits') btn.textContent = dict.filterFruits;
    });

    // Farmers Titles
    const fTitle = document.querySelector('.farmers .section-title');
    if (fTitle) fTitle.textContent = dict.farmersTitle;
    const fSubtitle = document.querySelector('.farmers .section-subtitle');
    if (fSubtitle) fSubtitle.textContent = dict.farmersSubtitle;

    // Farmers Cards
    const farmerCards = document.querySelectorAll('.farmer-card');
    if (farmerCards.length >= 3) {
        farmerCards[0].querySelector('h4').textContent = dict.farmer1Name;
        farmerCards[0].querySelector('.farmer-story').textContent = dict.farmer1Story;

        farmerCards[1].querySelector('h4').textContent = dict.farmer2Name;
        farmerCards[1].querySelector('.farmer-story').textContent = dict.farmer2Story;

        farmerCards[2].querySelector('h4').textContent = dict.farmer3Name;
        farmerCards[2].querySelector('.farmer-story').textContent = dict.farmer3Story;
    }

    // Gallery Section
    const gTitle = document.querySelector('.gallery .section-title');
    if (gTitle) gTitle.textContent = dict.galleryTitle;
    const gSubtitle = document.querySelector('.gallery .section-subtitle');
    if (gSubtitle) gSubtitle.textContent = dict.gallerySubtitle;

    const galleryItems = document.querySelectorAll('.gallery-item');
    if (galleryItems.length >= 4) {
        galleryItems[0].querySelector('.gallery-overlay h4').textContent = dict.galleryItem1;
        galleryItems[1].querySelector('.gallery-overlay h4').textContent = dict.galleryItem2;
        galleryItems[2].querySelector('.gallery-overlay h4').textContent = dict.galleryItem3;
        galleryItems[3].querySelector('.gallery-overlay h4').textContent = dict.galleryItem4;
    }

    // Reviews Section
    const rTitle = document.querySelector('.reviews .section-title');
    if (rTitle) rTitle.textContent = dict.reviewsTitle;
    const rSubtitle = document.querySelector('.reviews .section-subtitle');
    if (rSubtitle) rSubtitle.textContent = dict.reviewsSubtitle;

    const reviewCards = document.querySelectorAll('.review-card');
    if (reviewCards.length >= 3) {
        reviewCards[0].querySelector('.review-header-name h4').textContent = dict.review1Name;
        reviewCards[0].querySelector('p').textContent = dict.review1Text;

        reviewCards[1].querySelector('.review-header-name h4').textContent = dict.review2Name;
        reviewCards[1].querySelector('p').textContent = dict.review2Text;

        reviewCards[2].querySelector('.review-header-name h4').textContent = dict.review3Name;
        reviewCards[2].querySelector('p').textContent = dict.review3Text;
    }

    // Footer Section
    const footerDesc = document.querySelector('footer .footer-col:nth-child(1) p');
    if (footerDesc) footerDesc.textContent = dict.footerDesc;

    const footerHeaders = document.querySelectorAll('footer .footer-col h4');
    if (footerHeaders.length >= 3) {
        footerHeaders[0].textContent = dict.footerLinks;
        footerHeaders[1].textContent = dict.footerContact;
        footerHeaders[2].textContent = dict.footerFollow;
    }

    const footerCopyright = document.getElementById('copyrightText');
    if (footerCopyright) footerCopyright.textContent = dict.footerCopyright;

    // Cart Drawer Header & Footer
    const cartHeaderTitle = document.querySelector('.cart-drawer-header h3');
    if (cartHeaderTitle) {
        cartHeaderTitle.innerHTML = `<i class="fa-solid fa-shopping-basket"></i> ${dict.basketTitle}`;
    }

    const clearCartBtn = document.getElementById('clearCartBtn');
    if (clearCartBtn) clearCartBtn.textContent = dict.basketClearBtn;

    const cartTotalLabel = document.querySelector('.cart-total-row span:first-child');
    if (cartTotalLabel) cartTotalLabel.textContent = dict.basketTotal;

    const whatsappOrderBtn = document.getElementById('whatsappOrderBtn');
    if (whatsappOrderBtn) {
        whatsappOrderBtn.innerHTML = `<i class="fa-brands fa-whatsapp"></i> ${dict.basketOrderBtn}`;
    }

    // Confirm Modal
    const modalTitle = document.querySelector('.confirm-modal-content h3');
    if (modalTitle) modalTitle.textContent = dict.confirmModalTitle;

    const modalDesc = document.querySelector('.confirm-modal-content p');
    if (modalDesc) modalDesc.textContent = dict.confirmModalDesc;

    const cancelConfirmBtn = document.getElementById('cancelConfirmBtn');
    if (cancelConfirmBtn) cancelConfirmBtn.textContent = dict.confirmModalCancel;

    const acceptConfirmBtn = document.getElementById('acceptConfirmBtn');
    if (acceptConfirmBtn) acceptConfirmBtn.textContent = dict.confirmModalAccept;

    // Toast Notification text
    const toastNotification = document.getElementById('toastNotification');
    if (toastNotification) {
        toastNotification.innerHTML = `<i class="fa-solid fa-check-circle"></i> ${dict.emailCopied}`;
    }

    // Cart Recovery Translation Binds
    const recTitleEl = document.getElementById('recoveryTitle');
    if (recTitleEl) recTitleEl.textContent = dict.recoveryTitle;
    const recDescEl = document.getElementById('recoveryDesc');
    if (recDescEl) recDescEl.textContent = dict.recoveryDesc;
    const recClearBtn = document.getElementById('recoveryClearBtn');
    if (recClearBtn) recClearBtn.textContent = dict.recoveryBtnClear;
    const recResumeBtn = document.getElementById('recoveryResumeBtn');
    if (recResumeBtn) recResumeBtn.textContent = dict.recoveryBtnResume;

    // Coupon translation binds
    const couponInput = document.getElementById('couponInput');
    if (couponInput) {
        couponInput.placeholder = dict.couponPlaceholder || "Enter coupon code";
    }
    const applyCouponBtn = document.getElementById('applyCouponBtn');
    if (applyCouponBtn) {
        applyCouponBtn.textContent = appliedCoupon ? (dict.couponRemoveBtn || "Remove") : (dict.couponApplyBtn || "Apply");
    }
    const couponMessage = document.getElementById('couponMessage');
    if (couponMessage && appliedCoupon) {
        couponMessage.textContent = (dict.couponApplied || "Coupon '{code}' applied!").replace('{code}', appliedCoupon);
    }

    // Details Modal Labels & Placeholders
    const lblCustName = document.getElementById('lblCustName');
    if (lblCustName) lblCustName.textContent = dict.detailsLabelName;
    const custName = document.getElementById('custName');
    if (custName) custName.placeholder = dict.detailsPlaceholderName;

    const lblCustPhone = document.getElementById('lblCustPhone');
    if (lblCustPhone) lblCustPhone.textContent = dict.detailsLabelPhone;
    const custPhone = document.getElementById('custPhone');
    if (custPhone) custPhone.placeholder = dict.detailsPlaceholderPhone;

    const lblCustArea = document.getElementById('lblCustArea');
    if (lblCustArea) lblCustArea.textContent = dict.detailsLabelArea;
    const custArea = document.getElementById('custArea');
    if (custArea) custArea.placeholder = dict.detailsPlaceholderArea;

    const btnDetailsSubmit = document.getElementById('btnDetailsSubmit');
    if (btnDetailsSubmit) {
        btnDetailsSubmit.innerHTML = `<i class="fa-brands fa-whatsapp"></i> ${dict.detailsBtnProceed}`;
    }
}

// Convert GitHub HTML view/edit image URLs to raw viewable URLs
function cleanGitHubImageUrl(url) {
    if (!url) return '';
    
    // Remove zero-width spaces, invisible characters, and trim
    let cleanUrl = url.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
    
    // Decode first to handle double-encoding issues, then encode spaces and special characters properly
    try {
        cleanUrl = decodeURI(cleanUrl);
    } catch (e) {
        // Ignore decoding errors and proceed with original
    }
    
    // Generalized GitHub file URL matcher (matches blob, raw, edit, blame, etc.)
    const githubRegex = /^https?:\/\/(www\.)?github\.com\/([^\/]+)\/([^\/]+)\/(blob|raw|edit|blame)\/([^\/]+)\/(.+)$/i;
    const match = cleanUrl.match(githubRegex);
    if (match) {
        const username = match[2];
        const repo = match[3];
        const branch = match[5];
        let path = match[6];
        
        // Strip out common query parameters that could interfere with raw loading (like ?raw=true, ?plain=1)
        // while keeping the token if it's there
        const queryIndex = path.indexOf('?');
        let queryString = '';
        if (queryIndex !== -1) {
            const params = new URLSearchParams(path.substring(queryIndex));
            path = path.substring(0, queryIndex);
            
            // Keep token if it exists (for private repos)
            if (params.has('token')) {
                queryString = `?token=${params.get('token')}`;
            }
        }
        
        // Ensure path and branch are properly URI encoded (especially spaces)
        const encodedPath = path.split('/').map(segment => encodeURIComponent(segment)).join('/');
        const encodedBranch = branch.split('/').map(segment => encodeURIComponent(segment)).join('/');
        
        return `https://raw.githubusercontent.com/${username}/${repo}/${encodedBranch}/${encodedPath}${queryString}`;
    }
    
    // Also handle raw.githubusercontent.com URLs directly to ensure they are encoded and cleaned
    const rawContentRegex = /^https?:\/\/raw\.githubusercontent\.com\/([^\/]+)\/([^\/]+)\/([^\/]+)\/(.+)$/i;
    const rawMatch = cleanUrl.match(rawContentRegex);
    if (rawMatch) {
        const username = rawMatch[1];
        const repo = rawMatch[2];
        const branch = rawMatch[3];
        let path = rawMatch[4];
        
        const queryIndex = path.indexOf('?');
        let queryString = '';
        if (queryIndex !== -1) {
            const params = new URLSearchParams(path.substring(queryIndex));
            path = path.substring(0, queryIndex);
            if (params.has('token')) {
                queryString = `?token=${params.get('token')}`;
            }
        }
        
        const encodedPath = path.split('/').map(segment => encodeURIComponent(segment)).join('/');
        const encodedBranch = branch.split('/').map(segment => encodeURIComponent(segment)).join('/');
        
        return `https://raw.githubusercontent.com/${username}/${repo}/${encodedBranch}/${encodedPath}${queryString}`;
    }
    
    // For local paths or other domains, just encode spaces safely
    try {
        return encodeURI(cleanUrl);
    } catch (e) {
        return cleanUrl;
    }
}

function getTranslatedProduct(product) {
    const dict = translations[currentLang];
    let name = product.name;
    let unit = product.unit;

    // Dynamic Firestore Localization
    if (product.name_en && product.name_te) {
        name = currentLang === 'te' ? product.name_te : product.name_en;
    } else {
        // Fallback to static dictionary translating for standard seeds
        if (product.id === 1) { name = dict.spinachName; }
        else if (product.id === 2) { name = dict.carrotsName; }
        else if (product.id === 3) { name = dict.tomatoesName; }
        else if (product.id === 4) { name = dict.mangoesName; }
        else if (product.id === 5) { name = dict.cabbageName; }
        else if (product.id === 6) { name = dict.potatoesName; }
        else if (product.id === 7) { name = dict.corianderName; }
        else if (product.id === 8) { name = dict.ladyfingerName; }
        else if (product.id === 9) { name = dict.bottlegourdName; }
    }

    if (product.unit === 'bunch') { unit = dict.unitBunch; }
    else if (product.unit === 'kg') { unit = dict.unitKg; }
    else if (product.unit === 'pc') { unit = dict.unitPc; }
    else if (product.unit === 'dozen') { unit = dict.unitDozen; }

    const image = cleanGitHubImageUrl(product.image);

    return { ...product, name, unit, image };
}

const filterBtns = document.querySelectorAll('.filter-btn');

// Global Cart State — Phase 1: cart stores { productId: { qty, optionValue, optionLabel, optionPrice } }
let cart = {};

// Get Cart Elements
const cartBtn = document.getElementById('cartBtn');
const cartDrawer = document.getElementById('cartDrawer');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartOverlay = document.getElementById('cartOverlay');
const cartBadge = document.getElementById('cartBadge');
const cartDrawerItems = document.getElementById('cartDrawerItems');
const cartTotalSum = document.getElementById('cartTotalSum');
const whatsappOrderBtn = document.getElementById('whatsappOrderBtn');
const cartFloatBtn = document.getElementById('cartFloatBtn');
const cartBadgeFloat = document.getElementById('cartBadgeFloat');

// Load Cart from LocalStorage with draft recovery prompt
function loadCart() {
    const stored = localStorage.getItem('kshetriva_cart');
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            // Migrate old format { id: qty } → new format { id: { qty, optionValue, ... } }
            let migrated = false;
            const normalized = {};
            for (const [key, val] of Object.entries(parsed)) {
                if (typeof val === 'number') {
                    normalized[key] = { qty: val, optionValue: '', optionLabel: '', optionPrice: 0 };
                    migrated = true;
                } else {
                    normalized[key] = val;
                }
            }
            const totalItems = Object.values(normalized).reduce((sum, item) => sum + (item.qty || 0), 0);
            if (totalItems > 0) {
                localStorage.setItem('kshetriva_cart_draft', JSON.stringify(normalized));
                cart = {};
            }
        } catch (e) {
            cart = {};
        }
    }
}

// Save Cart to LocalStorage
function saveCart() {
    localStorage.setItem('kshetriva_cart', JSON.stringify(cart));
}

// Open/Close Cart Drawer
function openCart() {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('open');
}

function closeCart() {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('open');
}

// Render Products Grid — Phase 1: with dropdown, badges, tooltip
function renderProducts(category = 'all') {
    productGrid.innerHTML = '';

    const filteredProducts = category === 'all'
        ? products
        : products.filter(p => p.category === category);

    const dict = translations[currentLang];

    if (filteredProducts.length === 0) {
        productGrid.innerHTML = `
            <div class="empty-category-state">
                <div class="empty-icon"><i class="fa-solid fa-seedling"></i></div>
                <h4>${dict.categoryComingSoon}</h4>
                <p>${dict.categoryComingSoonSub}</p>
            </div>
        `;
        return;
    }

    filteredProducts.forEach(rawProduct => {
        const product = getTranslatedProduct(rawProduct);
        const cartItem = cart[product.id];
        const currentQty = cartItem ? cartItem.qty : 0;
        const card = document.createElement('div');

        const isOutOfStock = rawProduct.inStock === false;
        card.className = isOutOfStock ? 'product-card out-of-stock' : 'product-card';

        const outOfStockBadge = isOutOfStock
            ? `<div class="out-of-stock-overlay">${dict.outOfStock}</div>`
            : '';

        // Phase 1: Product badge
        let productBadgeHtml = '';
        const badge = rawProduct.badge;
        if (badge && !isOutOfStock) {
            const badgeLabels = { fresh_harvest: dict.badgeFreshHarvest, limited: dict.badgeLimited, farmer_pick: dict.badgeFarmerPick };
            const badgeCss = { fresh_harvest: 'fresh-harvest', limited: 'limited', farmer_pick: 'farmer-pick' };
            if (badgeLabels[badge]) {
                productBadgeHtml = `<div class="product-badge ${badgeCss[badge]}">${badgeLabels[badge]}</div>`;
            }
        }

        // Phase 1: Quantity options dropdown
        const qtyOptions = getQuantityOptions(rawProduct);
        const defaultOpt = qtyOptions.find(o => o.value === '500g')?.value || qtyOptions[0].value;
        const selectedOpt = cartItem ? cartItem.optionValue : defaultOpt;
        const selectedPrice = qtyOptions.find(o => o.value === selectedOpt)?.price || qtyOptions[0].price;

        let optionsHtml = qtyOptions.map(opt => {
            const sel = opt.value === selectedOpt ? 'selected' : '';
            return `<option value="${opt.value}" data-price="${opt.price}" ${sel}>${opt.label} — ₹${opt.price}</option>`;
        }).join('');

        // Tooltip for leafy items
        const vegType = rawProduct.type || 'regular';
        const tooltipHtml = vegType === 'leafy' ? `<div class="qty-tooltip">${dict.kattaTooltip || '1 katta ≈ fresh bunch bundle'}</div>` : '';

        const buttonText = isOutOfStock ? dict.btnOutOfStock : dict.btnAddToBasket;
        const buttonDisabled = isOutOfStock ? 'disabled style="pointer-events: none;"' : '';

        card.innerHTML = `
            ${outOfStockBadge}
            ${productBadgeHtml}
            <img src="${product.image}" alt="${product.name}" class="product-img" width="250" height="200" loading="lazy">
            <div class="product-info">
                <h4 class="product-title">${product.name}</h4>
                <p class="dynamic-price" id="price-${product.id}">₹${selectedPrice}</p>
                <div class="qty-dropdown-wrap">
                    <select class="qty-weight-select" id="opt-${product.id}" onchange="onVariantChange(${product.id})" ${isOutOfStock ? 'disabled' : ''}>
                        ${optionsHtml}
                    </select>
                    ${tooltipHtml}
                    <div class="qty-count-row">
                        <button class="qty-btn minus" onclick="updateQty(this, -1, ${product.id})" ${isOutOfStock ? 'disabled' : ''}>−</button>
                        <span class="qty-val" id="qty-${product.id}">${currentQty}</span>
                        <button class="qty-btn plus" onclick="updateQty(this, 1, ${product.id})" ${isOutOfStock ? 'disabled' : ''}>+</button>
                    </div>
                </div>
                <button class="btn btn-primary btn-add-basket" id="btn-add-${product.id}" onclick="addProductToCart(${product.id})" ${buttonDisabled}>${buttonText}</button>
            </div>
        `;
        productGrid.appendChild(card);
    });
}

// Phase 1: Update price display when variant dropdown changes
function onVariantChange(productId) {
    const select = document.getElementById(`opt-${productId}`);
    if (!select) return;
    const selectedOption = select.options[select.selectedIndex];
    const price = selectedOption.getAttribute('data-price');
    const priceEl = document.getElementById(`price-${productId}`);
    if (priceEl) priceEl.textContent = `₹${price}`;
}

// Update Quantity in Card DOM
function updateQty(btn, change, productId) {
    const qtySpan = btn.parentElement.querySelector('.qty-val');
    let currentQty = parseInt(qtySpan.textContent);
    let newQty = currentQty + change;
    if (newQty < 0) newQty = 0;
    qtySpan.textContent = newQty;
}

// Add Product to Cart from Card Selection — Phase 1: stores variant info
function addProductToCart(productId) {
    // Dismiss and clear any recovery drafts on new additions
    const toast = document.getElementById('cartRecoveryToast');
    if (toast && toast.classList.contains('show')) {
        toast.classList.remove('show');
        localStorage.removeItem('kshetriva_cart_draft');
    }

    const qtySpan = document.getElementById(`qty-${productId}`);
    if (!qtySpan) return;

    let qty = parseInt(qtySpan.textContent);

    // Get selected variant
    const optSelect = document.getElementById(`opt-${productId}`);
    let optionValue = '';
    let optionLabel = '';
    let optionPrice = 0;
    if (optSelect) {
        const selOpt = optSelect.options[optSelect.selectedIndex];
        optionValue = selOpt.value;
        optionLabel = selOpt.textContent.split('—')[0].trim();
        optionPrice = parseInt(selOpt.getAttribute('data-price')) || 0;
    }

    if (qty === 0) {
        if (cart[productId] !== undefined) {
            delete cart[productId];
            saveCart();
            updateCartUI();

            const btn = document.getElementById(`btn-add-${productId}`);
            if (btn) {
                const originalText = btn.textContent;
                btn.textContent = translations[currentLang].btnReset;
                btn.style.backgroundColor = "#d32f2f";
                btn.style.borderColor = "#d32f2f";
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.backgroundColor = "";
                    btn.style.borderColor = "";
                }, 1200);
            }

            triggerCartHighlight();
        }
        return;
    }

    cart[productId] = { qty, optionValue, optionLabel, optionPrice };
    saveCart();
    updateCartUI();

    const btn = document.getElementById(`btn-add-${productId}`);
    if (btn) {
        const originalText = btn.textContent;
        btn.textContent = translations[currentLang].btnAdded;
        btn.style.backgroundColor = "#2e7d32";
        btn.style.borderColor = "#2e7d32";
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.backgroundColor = "";
            btn.style.borderColor = "";
        }, 1200);
    }

    triggerCartHighlight();
}

function triggerCartHighlight() {
    if (cartBtn) {
        cartBtn.classList.remove('highlight');
        void cartBtn.offsetWidth;
        cartBtn.classList.add('highlight');
        setTimeout(() => { cartBtn.classList.remove('highlight'); }, 800);
    }
    if (cartFloatBtn) {
        cartFloatBtn.classList.remove('highlight');
        void cartFloatBtn.offsetWidth;
        cartFloatBtn.classList.add('highlight');
        setTimeout(() => { cartFloatBtn.classList.remove('highlight'); }, 800);
    }
}

// Update Quantity inside the Cart Drawer — Phase 1: handles object format
function updateCartItemQty(productId, change) {
    if (!cart[productId]) return;
    cart[productId].qty += change;

    if (cart[productId].qty <= 0) {
        delete cart[productId];
        const qtySpan = document.getElementById(`qty-${productId}`);
        if (qtySpan) qtySpan.textContent = '0';
    } else {
        const qtySpan = document.getElementById(`qty-${productId}`);
        if (qtySpan) qtySpan.textContent = cart[productId].qty;
    }

    saveCart();
    updateCartUI();
}

// ===== Phase 1: Basket Tier Detection =====
function detectBasketTier(uniqueItemCount) {
    for (const tier of BASKET_TIERS) {
        if (uniqueItemCount >= tier.minItems) return tier;
    }
    return null;
}

function getNextTier(uniqueItemCount) {
    // Get the next tier the user can unlock
    const sortedAsc = [...BASKET_TIERS].reverse(); // family, weekly, farmplus
    for (const tier of sortedAsc) {
        if (uniqueItemCount < tier.minItems) return tier;
    }
    return null;
}

// ===== Phase 1: Ordering Window =====
function isOrderingWindowOpen() {
    if (manualWindowState && manualWindowState.overrideActive) {
        return manualWindowState.overrideOpen;
    }

    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    const { openDay, openHour, closeDay, closeHour } = ORDERING_SCHEDULE;

    if (day === openDay && hour >= openHour) return true;
    if (day === closeDay && hour < closeHour) return true;
    return false;
}

function getWindowCountdown() {
    const isOpen = isOrderingWindowOpen();
    if (manualWindowState && manualWindowState.overrideActive) {
        return { days: 0, hours: 0, mins: 0, isOpen };
    }

    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    const { openDay, openHour, closeDay, closeHour } = ORDERING_SCHEDULE;

    let targetDate = new Date(now);
    if (isOpen) {
        // countdown to close: Saturday closeHour
        let daysUntilClose = (closeDay - day + 7) % 7;
        if (daysUntilClose === 0 && hour >= closeHour) daysUntilClose = 7;
        targetDate.setDate(now.getDate() + daysUntilClose);
        targetDate.setHours(closeHour, 0, 0, 0);
    } else {
        // countdown to open: Friday openHour
        let daysUntilOpen = (openDay - day + 7) % 7;
        if (daysUntilOpen === 0 && hour >= openHour) daysUntilOpen = 7;
        targetDate.setDate(now.getDate() + daysUntilOpen);
        targetDate.setHours(openHour, 0, 0, 0);
    }

    const diff = targetDate - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { days, hours, mins, isOpen };
}

function updateOrderingWindowBanner() {
    const banner = document.getElementById('orderingWindowBanner');
    const titleEl = document.getElementById('bannerTitle');
    const subtextEl = document.getElementById('bannerSubtext');
    const countdownEl = document.getElementById('countdownTimer');
    if (!banner || !titleEl || !subtextEl || !countdownEl) return;

    const dict = translations[currentLang];
    const { days, hours, mins, isOpen } = getWindowCountdown();
    
    if (manualWindowState && manualWindowState.overrideActive) {
        const isTe = currentLang === 'te';
        if (isOpen) {
            banner.classList.remove('closed');
            titleEl.textContent = isTe ? "ఆర్డరింగ్ ఓపెన్ లో ఉంది" : "Ordering is Open";
            subtextEl.textContent = isTe ? "పరిమిత సమయం మాత్రమే! త్వరలో ముగుస్తుంది, ఇప్పుడే ఆర్డర్ చేయండి." : "Limited time only! Closes soon, place your order now.";
            countdownEl.textContent = isTe ? "పరిమిత సమయం మాత్రమే" : "Limited Time Open";
        } else {
            banner.classList.add('closed');
            titleEl.textContent = isTe ? "ఆర్డరింగ్ క్లోజ్ చేయబడింది" : "Ordering is Closed";
            subtextEl.textContent = isTe ? "దయచేసి తర్వాత ప్రయత్నించండి." : "Please check back later.";
            countdownEl.textContent = isTe ? "స్థితి: క్లోజ్డ్" : "Status: Closed";
        }
    } else {
        let timerText = "";
        if (days > 0) {
            timerText = `${days}d ${hours}h ${mins}m`;
        } else {
            timerText = `${hours}h ${mins}m`;
        }

        if (isOpen) {
            banner.classList.remove('closed');
            titleEl.textContent = dict.bannerLiveTitle;
            subtextEl.textContent = dict.bannerLiveSubtext;
            countdownEl.textContent = `${dict.bannerClosesIn} ${timerText}`;
        } else {
            banner.classList.add('closed');
            titleEl.textContent = dict.bannerClosedTitle;
            subtextEl.textContent = dict.bannerClosedSubtext;
            countdownEl.textContent = `${dict.bannerOpensIn} ${timerText}`;
        }
    }

    // Update harvest date
    const harvestDateText = document.getElementById('harvestDateText');
    if (harvestDateText) {
        const now = new Date();
        const harvestDate = new Date(now);
        const { openDay } = ORDERING_SCHEDULE;
        harvestDate.setDate(now.getDate() - ((now.getDay() + 7 - openDay) % 7));
        const dateStr = harvestDate.toLocaleDateString(currentLang === 'te' ? 'te-IN' : 'en-IN', { weekday: 'long', month: 'short', day: 'numeric' });
        harvestDateText.textContent = `${dict.harvestUpdated} ${dateStr}`;
    }
}

// Refresh Cart UI — Phase 1: with basket tier, discount, min order, window status
function updateCartUI() {
    const totalItems = Object.values(cart).reduce((sum, item) => sum + (item.qty || 0), 0);
    cartBadge.textContent = totalItems;
    cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
    if (cartBadgeFloat) {
        cartBadgeFloat.textContent = totalItems;
        cartBadgeFloat.style.display = totalItems > 0 ? 'flex' : 'none';
    }

    const cartKeys = Object.keys(cart);
    const clearBtn = document.getElementById('clearCartBtn');
    if (clearBtn) {
        clearBtn.style.display = cartKeys.length > 0 ? 'inline-block' : 'none';
    }

    // Phase 1 elements
    const basketStatusSection = document.getElementById('basketStatusSection');
    const cartSubtotalRow = document.getElementById('cartSubtotalRow');
    const cartDiscountRow = document.getElementById('cartDiscountRow');
    const minOrderNotice = document.getElementById('minOrderNotice');
    const windowClosedNotice = document.getElementById('windowClosedNotice');

    cartDrawerItems.innerHTML = '';
    let subtotal = 0;
    const dict = translations[currentLang];

    if (cartKeys.length === 0) {
        cartDrawerItems.innerHTML = `
            <div class="cart-empty-state">
                <i class="fa-solid fa-shopping-basket"></i>
                <p>${dict.basketEmpty}</p>
                <p style="font-size: 0.85rem; margin-top: 5px; color: #aaa;">${dict.basketEmptySub}</p>
            </div>
        `;
        cartTotalSum.textContent = '₹0';
        whatsappOrderBtn.disabled = true;
        whatsappOrderBtn.style.opacity = '0.5';
        whatsappOrderBtn.style.cursor = 'not-allowed';
        if (basketStatusSection) basketStatusSection.style.display = 'none';
        if (cartSubtotalRow) cartSubtotalRow.style.display = 'none';
        if (cartDiscountRow) cartDiscountRow.style.display = 'none';
        const cartDeliveryRow = document.getElementById('cartDeliveryRow');
        if (cartDeliveryRow) cartDeliveryRow.style.display = 'none';
        if (minOrderNotice) minOrderNotice.style.display = 'none';
        if (windowClosedNotice) windowClosedNotice.style.display = 'none';
        return;
    }

    // Render cart items
    cartKeys.forEach(idStr => {
        const id = parseInt(idStr);
        const rawProduct = products.find(p => p.id === id);
        if (!rawProduct) return;

        const product = getTranslatedProduct(rawProduct);
        const cartEntry = cart[id];
        const qty = cartEntry.qty || 1;
        const pricePerItem = cartEntry.optionPrice || parseInt((product.price || '0').replace(/[^\d]/g, ''));
        const itemTotal = pricePerItem * qty;
        subtotal += itemTotal;

        const variantLabel = cartEntry.optionLabel || '';

        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item';
        itemEl.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="cart-item-img">
            <div class="cart-item-info">
                <div class="cart-item-title">${product.name}</div>
                <div class="cart-item-price">₹${pricePerItem} × ${qty} = ₹${itemTotal}</div>
                ${variantLabel ? `<div class="cart-item-variant">${variantLabel}</div>` : ''}
            </div>
            <div class="cart-item-actions">
                <button class="cart-item-btn" onclick="updateCartItemQty(${id}, -1)">−</button>
                <span class="cart-item-qty">${qty}</span>
                <button class="cart-item-btn" onclick="updateCartItemQty(${id}, 1)">+</button>
            </div>
        `;
        cartDrawerItems.appendChild(itemEl);
    });

    // Phase 1: Basket Tier Detection
    const uniqueItems = cartKeys.length;
    const currentTier = detectBasketTier(uniqueItems);
    const nextTier = getNextTier(uniqueItems);
    let discountAmt = 0;
    let finalTotal = subtotal;

    if (basketStatusSection) {
        if (currentTier) {
            basketStatusSection.style.display = 'block';
            const badgeEl = document.getElementById('basketBadge');
            const iconEl = document.getElementById('basketBadgeIcon');
            const nameEl = document.getElementById('basketTierName');
            const discEl = document.getElementById('basketTierDiscount');
            const progressEl = document.getElementById('basketProgress');
            const progressTextEl = document.getElementById('basketProgressText');
            const progressFillEl = document.getElementById('basketProgressFill');

            if (badgeEl) {
                badgeEl.className = `basket-badge ${currentTier.cssClass}`;
                badgeEl.style.display = 'flex';
            }
            if (iconEl) iconEl.textContent = currentTier.icon;
            if (nameEl) {
                const tierNames = {
                    family: dict.basketFamilyName || currentTier.name,
                    weekly: dict.basketWeeklyName || currentTier.name,
                    farmplus: dict.basketFarmPlusName || currentTier.name
                };
                const tierName = tierNames[currentTier.id] || currentTier.name;
                nameEl.textContent = tierName;

                const suitabilityEl = document.getElementById('basketTierSuitability');
                if (suitabilityEl) {
                    suitabilityEl.textContent = (dict.basketSuitability || '')
                        .replace('{tier}', tierName)
                        .replace('{n}', uniqueItems);
                }
            }

            discountAmt = Math.round(subtotal * currentTier.discount * 100) / 100;
            finalTotal = Math.round((subtotal - discountAmt) * 100) / 100;

            if (discEl) {
                discEl.textContent = `${Math.round(currentTier.discount * 100)}% ${dict.basketDiscountApplied}`;
            }

            // Progress to next tier
            if (nextTier && progressEl && progressTextEl && progressFillEl) {
                progressEl.style.display = 'block';
                const itemsNeeded = nextTier.minItems - uniqueItems;
                const nextTierNames = {
                    family: dict.basketFamilyName, weekly: dict.basketWeeklyName, farmplus: dict.basketFarmPlusName
                };
                const nextName = nextTierNames[nextTier.id] || nextTier.name;
                progressTextEl.innerHTML = (dict.basketProgressNudge || '')
                    .replace('{n}', itemsNeeded)
                    .replace('{tier}', `${Math.round(nextTier.discount * 100)}% ${nextName}`);
                const pct = Math.min(100, Math.round((uniqueItems / nextTier.minItems) * 100));
                progressFillEl.style.width = `${pct}%`;
            } else if (progressEl) {
                progressEl.style.display = 'none';
            }
        } else {
            // No tier yet — show progress toward Family Basket
            const firstTier = BASKET_TIERS[BASKET_TIERS.length - 1]; // family
            if (uniqueItems > 0 && firstTier) {
                basketStatusSection.style.display = 'block';
                const badgeEl = document.getElementById('basketBadge');
                if (badgeEl) badgeEl.style.display = 'none';
                const progressEl = document.getElementById('basketProgress');
                const progressTextEl = document.getElementById('basketProgressText');
                const progressFillEl = document.getElementById('basketProgressFill');
                if (progressEl && progressTextEl && progressFillEl) {
                    progressEl.style.display = 'block';
                    const itemsNeeded = firstTier.minItems - uniqueItems;
                    const tierName = dict.basketFamilyName || firstTier.name;
                    progressTextEl.innerHTML = (dict.basketProgressNudge || '')
                        .replace('{n}', itemsNeeded)
                        .replace('{tier}', `${Math.round(firstTier.discount * 100)}% ${tierName}`);
                    const pct = Math.min(100, Math.round((uniqueItems / firstTier.minItems) * 100));
                    progressFillEl.style.width = `${pct}%`;
                }
            } else {
                basketStatusSection.style.display = 'none';
            }
        }
    }

    // Phase 1: Update totals breakdown
    if (cartSubtotalRow && cartDiscountRow) {
        if (currentTier && discountAmt > 0) {
            cartSubtotalRow.style.display = 'flex';
            cartDiscountRow.style.display = 'flex';
            document.getElementById('cartSubtotalSum').textContent = `₹${subtotal}`;
            document.getElementById('discountLabel').textContent =
                (dict.discountLabel || 'Basket Discount:').replace('{pct}', Math.round(currentTier.discount * 100));
            document.getElementById('cartDiscountAmt').textContent = `-₹${discountAmt}`;
        } else {
            cartSubtotalRow.style.display = 'none';
            cartDiscountRow.style.display = 'none';
        }
    }

    // Phase 2: Update Delivery Charges (Struck-off ₹69, Fixed ₹49)
    const cartDeliveryRow = document.getElementById('cartDeliveryRow');
    let deliveryCharge = 49;
    if (appliedCoupon === 'Delivery30') {
        deliveryCharge = 30;
    }

    if (cartDeliveryRow) {
        cartDeliveryRow.style.display = 'flex';
        const deliveryLabelEl = document.getElementById('deliveryLabel');
        const cartDeliverySumEl = document.getElementById('cartDeliverySum');
        if (deliveryLabelEl) {
            deliveryLabelEl.textContent = dict.deliveryLabel || 'Delivery Charges:';
        }
        if (cartDeliverySumEl) {
            if (appliedCoupon === 'Delivery30') {
                cartDeliverySumEl.innerHTML = `<del style="color: #888; margin-right: 5px;">₹49</del> <span style="color: #2e7d32; font-weight: 600;">₹30</span> <span style="font-size: 0.75rem; color: #2e7d32; display: block; font-weight: 500; text-align: right;">(Delivery30)</span>`;
            } else {
                cartDeliverySumEl.innerHTML = `<del style="color: #888; margin-right: 5px;">₹69</del> <span style="color: #2e7d32; font-weight: 600;">₹49</span>`;
            }
        }
    }

    const itemsTotal = finalTotal;
    finalTotal = itemsTotal + deliveryCharge;
    cartTotalSum.textContent = `₹${finalTotal}`;

    // Phase 1: Minimum order check - 3 products OR total > 99
    let checkoutBlocked = false;
    if (uniqueItems < 3 && itemsTotal <= 99) {
        if (minOrderNotice) {
            const textSpan = document.getElementById('minOrderText');
            if (textSpan) {
                textSpan.textContent = dict.minOrderText || "Minimum order: 3 products or total above ₹99";
            }
            minOrderNotice.style.display = 'flex';
        }
        checkoutBlocked = true;
    } else {
        if (minOrderNotice) {
            minOrderNotice.style.display = 'none';
        }
    }

    // Phase 1: Window closed check
    const windowOpen = isOrderingWindowOpen();
    if (windowClosedNotice) {
        if (!windowOpen) {
            document.getElementById('windowClosedText').textContent = dict.windowClosedText || '';
            windowClosedNotice.style.display = 'flex';
            checkoutBlocked = true;
        } else {
            windowClosedNotice.style.display = 'none';
        }
    }

    // Enable/disable checkout
    if (checkoutBlocked) {
        whatsappOrderBtn.disabled = true;
        whatsappOrderBtn.style.opacity = '0.5';
        whatsappOrderBtn.style.cursor = 'not-allowed';
    } else {
        whatsappOrderBtn.disabled = false;
        whatsappOrderBtn.style.opacity = '1';
        whatsappOrderBtn.style.cursor = 'pointer';
    }
}

// Custom Confirmation Modal Elements
const confirmModal = document.getElementById('confirmModal');
const cancelConfirmBtn = document.getElementById('cancelConfirmBtn');
const acceptConfirmBtn = document.getElementById('acceptConfirmBtn');

function clearCart() {
    if (confirmModal) {
        confirmModal.classList.add('open');
    }
}

function closeConfirmModal() {
    if (confirmModal) {
        confirmModal.classList.remove('open');
    }
}

if (cancelConfirmBtn && acceptConfirmBtn) {
    cancelConfirmBtn.addEventListener('click', closeConfirmModal);
    acceptConfirmBtn.addEventListener('click', () => {
        cart = {};
        saveCart();
        updateCartUI();
        renderProducts();
        closeConfirmModal();
    });
    confirmModal.addEventListener('click', (e) => {
        if (e.target === confirmModal) {
            closeConfirmModal();
        }
    });
}

// WhatsApp Cart Checkout Order compilation — Phase 1: Enhanced with basket/discount
function sendCartWhatsAppOrder(name, phone, area) {
    const cartKeys = Object.keys(cart);
    if (cartKeys.length === 0) return;

    // Block checkout if minimum order rule is not met (at least 3 products OR final total > 99)
    const uniqueItems = cartKeys.length;
    let tempSubtotal = 0;
    cartKeys.forEach(idStr => {
        const id = parseInt(idStr);
        const rawProduct = products.find(p => p.id === id);
        if (rawProduct) {
            const product = getTranslatedProduct(rawProduct);
            const cartEntry = cart[id];
            const qty = cartEntry.qty || 1;
            const price = cartEntry.optionPrice || parseInt((product.price || '0').replace(/[^\d]/g, ''));
            tempSubtotal += price * qty;
        }
    });
    const currentTier = detectBasketTier(uniqueItems);
    let tempTotal = tempSubtotal;
    if (currentTier) {
        const discountAmt = Math.round(tempSubtotal * currentTier.discount * 100) / 100;
        tempTotal = Math.round((tempSubtotal - discountAmt) * 100) / 100;
    }

    if (uniqueItems < 3 && tempTotal <= 99) return;

    const isTe = currentLang === 'te';
    const dict = translations[currentLang];
    let message = isTe ? `*🌿 కొత్త ఆర్డర్ — క్షేత్రీవ ఫార్మ్స్*\n` : `*🌿 New Order — Kshetriva Farms*\n`;
    message += `================================\n`;
    if (name && phone && area) {
        message += isTe ? `👤 *కస్టమర్ పేరు:* ${name}\n` : `👤 *Customer Name:* ${name}\n`;
        message += isTe ? `📞 *వాట్సాప్ మొబైల్:* ${phone}\n` : `📞 *WhatsApp Phone:* ${phone}\n`;
        message += isTe ? `📍 *ప్రాంతం:* ${area}\n` : `📍 *Area/Locality:* ${area}\n`;
        message += `================================\n`;
    }

    // Basket tier info
    if (currentTier) {
        const tierNames = {
            family: dict.basketFamilyName || currentTier.name,
            weekly: dict.basketWeeklyName || currentTier.name,
            farmplus: dict.basketFarmPlusName || currentTier.name
        };
        const tierName = tierNames[currentTier.id] || currentTier.name;
        const pctLabel = Math.round(currentTier.discount * 100);
        message += `\n📦 *${tierName} ${isTe ? 'వర్తించబడింది' : 'Applied'} — ${pctLabel}% ${isTe ? 'తగ్గింపు' : 'Discount'}!*\n\n`;
    }

    message += isTe ? `*వస్తువులు:*\n` : `*Items:*\n`;

    let subtotal = 0;
    cartKeys.forEach((idStr, index) => {
        const id = parseInt(idStr);
        const rawProduct = products.find(p => p.id === id);
        if (rawProduct) {
            const product = getTranslatedProduct(rawProduct);
            const cartEntry = cart[id];
            const qty = cartEntry.qty || 1;
            const price = cartEntry.optionPrice || parseInt((product.price || '0').replace(/[^\d]/g, ''));
            const variantLabel = cartEntry.optionLabel || '';
            const itemTotal = price * qty;
            subtotal += itemTotal;
            message += `${index + 1}. *${product.name}*${variantLabel ? ' — ' + variantLabel : ''} × ${qty} (₹${itemTotal})\n`;
        }
    });

    message += `================================\n`;

    let deliveryCharge = 49;
    let originalDeliveryDisplay = "~₹69~";
    if (appliedCoupon === 'Delivery30') {
        deliveryCharge = 30;
        originalDeliveryDisplay = "~₹49~";
    }
    let finalTotal = subtotal;

    if (currentTier) {
        const discountAmt = Math.round(subtotal * currentTier.discount * 100) / 100;
        const itemsTotal = Math.round((subtotal - discountAmt) * 100) / 100;
        finalTotal = itemsTotal + deliveryCharge;
        const pctLabel = Math.round(currentTier.discount * 100);
        message += isTe ? `ఉప మొత్తం: ₹${subtotal}\n` : `Subtotal: ₹${subtotal}\n`;
        message += isTe ? `బాస్కెట్ తగ్గింపు (${pctLabel}%): -₹${discountAmt}\n` : `Basket Discount (${pctLabel}%): -₹${discountAmt}\n`;
        message += isTe ? `డెలివరీ ఛార్జీలు: ${originalDeliveryDisplay} ₹${deliveryCharge}${appliedCoupon ? ' (' + appliedCoupon + ')' : ''}\n` : `Delivery Charges: ${originalDeliveryDisplay} ₹${deliveryCharge}${appliedCoupon ? ' (' + appliedCoupon + ')' : ''}\n`;
        message += isTe ? `*మొత్తం: ₹${finalTotal}*\n\n` : `*Total: ₹${finalTotal}*\n\n`;
    } else {
        finalTotal = subtotal + deliveryCharge;
        message += isTe ? `ఉప మొత్తం: ₹${subtotal}\n` : `Subtotal: ₹${subtotal}\n`;
        message += isTe ? `డెలివరీ ఛార్జీలు: ${originalDeliveryDisplay} ₹${deliveryCharge}${appliedCoupon ? ' (' + appliedCoupon + ')' : ''}\n` : `Delivery Charges: ${originalDeliveryDisplay} ₹${deliveryCharge}${appliedCoupon ? ' (' + appliedCoupon + ')' : ''}\n`;
        message += isTe ? `*మొత్తం చెల్లింపు: ₹${finalTotal}*\n\n` : `*Total Amount: ₹${finalTotal}*\n\n`;
    }

    message += `📅 ${isTe ? 'డెలివరీ:' : 'Delivery:'} ${dict.waDeliveryDay}\n`;
    message += `💳 ${isTe ? 'చెల్లింపు:' : 'Payment:'} ${dict.waPayment}\n\n`;
    message += isTe ? `_డెలివరీ చిరునామా వివరాలు ఇక్కడ షేర్ చేయబడతాయి._` : `_Delivery address details will be shared._`;

    trackGA4Event('whatsapp_order_checkout', {
        value: finalTotal,
        currency: 'INR',
        items_count: cartKeys.length,
        basket_tier: currentTier ? currentTier.id : 'none'
    });
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/918374276995?text=${encoded}`, '_blank');
}

// Attach Event Listeners
cartBtn.addEventListener('click', openCart);
if (cartFloatBtn) {
    cartFloatBtn.addEventListener('click', openCart);
}
const langToggle = document.getElementById('langToggle') || document.getElementById('langBtn');
if (langToggle) {
    langToggle.addEventListener('click', () => {
        currentLang = currentLang === 'en' ? 'te' : 'en';
        localStorage.setItem('kshetriva_lang', currentLang);
        applyLanguage();
        renderProducts();
        updateCartUI();
        if (isAdminLoggedIn()) {
            renderAdminProducts();
        }
    });
}
closeCartBtn.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);
whatsappOrderBtn.addEventListener('click', () => openWhatsappDetailsModal('order'));

// Intercept other direct WhatsApp links
const heroWhatsapp = document.querySelector('.hero-btns .btn-whatsapp');
if (heroWhatsapp) {
    heroWhatsapp.removeAttribute('href'); // remove direct wa.me link
    heroWhatsapp.addEventListener('click', (e) => {
        e.preventDefault();
        openWhatsappDetailsModal('chat');
    });
}
const floatWhatsapp = document.querySelector('.whatsapp-float');
if (floatWhatsapp) {
    floatWhatsapp.removeAttribute('href'); // remove direct wa.me link
    floatWhatsapp.addEventListener('click', (e) => {
        e.preventDefault();
        openWhatsappDetailsModal('chat');
    });
}

// Modal event listeners for details modal
const detailsModal = document.getElementById('whatsappDetailsModal');
const closeDetailsModalBtn = document.getElementById('closeDetailsModalBtn');
if (closeDetailsModalBtn && detailsModal) {
    closeDetailsModalBtn.addEventListener('click', () => {
        detailsModal.classList.remove('open');
    });
    detailsModal.addEventListener('click', (e) => {
        if (e.target === detailsModal) {
            detailsModal.classList.remove('open');
        }
    });
}

function getFarmerIdForProduct(productId) {
    if (productId === 2 || productId === 6) return 1; // Surendhar
    if (productId === 1 || productId === 5 || productId === 7) return 2; // Bhaskar
    return 3; // Raju (3, 4, 8, 9)
}

const detailsForm = document.getElementById('whatsappDetailsForm');
if (detailsForm) {
    detailsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('custName').value.trim();
        const phone = document.getElementById('custPhone').value.trim();
        const area = document.getElementById('custArea').value.trim();
        if (!name || !phone || !area) return;
        
        // Cache to localStorage
        localStorage.setItem('kshetriva_customer_info', JSON.stringify({ name, phone, area }));
        
        // Generate lead
        const timestamp = new Date().toISOString();
        const type = whatsappTriggerSource.type; // 'order' or 'chat'
        let cartSummary = "";
        let items = [];
        let totalAmount = 0;
        let discountAmount = 0;
        let deliveryCharge = 0;
        let status = "harvesting";
        let coupon = "";
        
        if (type === 'order') {
            const cartKeys = Object.keys(cart);
            let itemsCount = 0;
            let subtotal = 0;
            cartKeys.forEach((idStr) => {
                const id = parseInt(idStr);
                const rawProduct = products.find(p => p.id === id);
                if (rawProduct) {
                    const product = getTranslatedProduct(rawProduct);
                    const cartEntry = cart[id];
                    const qty = cartEntry.qty || 1;
                    const price = cartEntry.optionPrice || parseInt((product.price || '0').replace(/[^\d]/g, ''));
                    subtotal += price * qty;
                    itemsCount += qty;
                    
                    const basePrice = rawProduct.pricePerUnit || parseInt((rawProduct.price || '0').replace(/[^\d]/g, ''));
                    const itemCostPrice = (rawProduct.costPrice !== undefined) ? rawProduct.costPrice : Math.round(basePrice * 0.6);
                    
                    items.push({
                        id: id,
                        name: product.name,
                        qty: qty,
                        option: cartEntry.optionLabel || cartEntry.optionValue || '',
                        price: price,
                        total: price * qty,
                        costPrice: itemCostPrice,
                        category: rawProduct.category
                    });
                }
            });
            const uniqueItems = cartKeys.length;
            const currentTier = detectBasketTier(uniqueItems);
            deliveryCharge = appliedCoupon === 'Delivery30' ? 30 : 49;
            totalAmount = subtotal;
            if (currentTier) {
                discountAmount = Math.round(subtotal * currentTier.discount * 100) / 100;
                totalAmount = Math.round((subtotal - discountAmount) * 100) / 100;
            }
            totalAmount += deliveryCharge;
            coupon = appliedCoupon || '';
            cartSummary = `${itemsCount} items, Total: ₹${totalAmount}`;
        } else {
            cartSummary = "General Enquiry Chat";
        }
        
        const lead = {
            id: Date.now().toString(),
            name,
            phone,
            area,
            timestamp,
            type,
            cartSummary,
            items,
            totalAmount,
            discountAmount,
            deliveryCharge,
            status,
            coupon
        };
        
        // Save the lead asynchronously in the background so Safari doesn't block the synchronous redirect below
        saveLeadToDatabase(lead);
        if (detailsModal) detailsModal.classList.remove('open');
        if (type === 'order') {
            sendCartWhatsAppOrder(name, phone, area);
        } else {
            sendChatWhatsAppMessage(name, phone, area);
        }
    });
}

// Filtering Logic
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');
        trackGA4Event('category_filter_applied', {
            category: filter,
            language: currentLang
        });
        renderProducts(filter);
    });
});

// Mobile Menu Toggle
const mobileBtn = document.getElementById('mobileBtn');
const navLinks = document.getElementById('navLinks');

mobileBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = "0 4px 10px rgba(0,0,0,0.1)";
    } else {
        navbar.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
    }
});

// Clipboard Copy & Toast Notification for Email Contact
const emailContactBtn = document.getElementById('emailContactBtn');
const toastNotification = document.getElementById('toastNotification');

if (emailContactBtn && toastNotification) {
    emailContactBtn.addEventListener('click', (e) => {
        navigator.clipboard.writeText('farm@kshetrivafarms.com').then(() => {
            toastNotification.classList.add('show');
            setTimeout(() => {
                toastNotification.classList.remove('show');
            }, 3000);
        }).catch(err => {
            console.error('Failed to copy email address: ', err);
        });
    });
}


/* ==========================================================================
   Admin Operations & Database Syncing Logic
   ========================================================================== */

// Seeding Firestore Database on initial load if empty
function seedDatabase() {
    if (!useFirebase || !db) return;
    console.log("Seeding Firestore with default catalog...");
    const batch = db.batch();
    const collectionRef = db.collection("products");

    const defaultCatalog = [
        {
            id: 1,
            name: "Spinach (Palak)",
            category: "leafy",
            type: "leafy",
            price: "₹20",
            pricePerUnit: 20,
            costPrice: 12,
            unit: "bunch",
            image: "images/spinach.webp",
            inStock: true,
            badge: "fresh_harvest",
            farmerId: 2
        },
        {
            id: 2,
            name: "Carrots",
            category: "root",
            type: "regular",
            price: "₹60",
            pricePerUnit: 60,
            costPrice: 36,
            unit: "kg",
            image: "images/carrots.webp",
            inStock: true,
            badge: "",
            farmerId: 1
        },
        {
            id: 3,
            name: "Red Tomatoes",
            category: "vegetables",
            type: "regular",
            price: "₹50",
            pricePerUnit: 50,
            costPrice: 30,
            unit: "kg",
            image: "images/tomatoes.webp",
            inStock: true,
            badge: "fresh_harvest",
            farmerId: 3
        },
        {
            id: 4,
            name: "Alphonso Mangoes",
            category: "fruits",
            type: "premium",
            price: "₹400",
            pricePerUnit: 400,
            costPrice: 240,
            unit: "dozen",
            image: "images/mangoes.webp",
            inStock: true,
            badge: "farmer_pick",
            farmerId: 3
        },
        {
            id: 5,
            name: "Cabbage",
            category: "leafy",
            type: "premium",
            price: "₹30",
            pricePerUnit: 30,
            costPrice: 18,
            unit: "pc",
            image: "images/cabbage.webp",
            inStock: true,
            badge: "",
            farmerId: 2
        },
        {
            id: 6,
            name: "Potatoes (Aloo)",
            category: "root",
            type: "regular",
            price: "₹30",
            pricePerUnit: 30,
            costPrice: 18,
            unit: "kg",
            image: "images/potatoes.webp",
            inStock: true,
            badge: "",
            farmerId: 1
        },
        {
            id: 7,
            name: "Coriander (Kothmir)",
            category: "leafy",
            type: "leafy",
            price: "₹15",
            pricePerUnit: 15,
            costPrice: 9,
            unit: "bunch",
            image: "images/coriander.webp",
            inStock: true,
            badge: "fresh_harvest",
            farmerId: 2
        },
        {
            id: 8,
            name: "Lady Finger (Bhindi)",
            category: "vegetables",
            type: "regular",
            price: "₹60",
            pricePerUnit: 60,
            costPrice: 36,
            unit: "kg",
            image: "images/lady_finger.webp",
            inStock: true,
            badge: "",
            farmerId: 3
        },
        {
            id: 9,
            name: "Bottle Gourd (Lauki)",
            category: "vegetables",
            type: "premium",
            price: "₹40",
            pricePerUnit: 40,
            costPrice: 24,
            unit: "pc",
            image: "images/bottle_gourd.webp",
            inStock: true,
            badge: "limited",
            farmerId: 3
        }
    ];

    defaultCatalog.forEach((item) => {
        const docRef = collectionRef.doc(`prod_${item.id}`);
        batch.set(docRef, item);
    });

    batch.commit().then(() => {
        console.log("Database seeded successfully.");
    }).catch(err => console.error("Database seeding failed:", err));
}

/* ==========================================================================
   Phase 3.5: WhatsApp Lead Capture & Secure Admin View
   ========================================================================== */

let whatsappTriggerSource = { type: 'chat' };

// Dynamic Database Sync Status Indicator
function updateAdminSyncStatus(status, details = "") {
    const badge = document.getElementById('adminSyncBadge');
    if (!badge) return;

    if (status === 'live') {
        badge.textContent = "🟢 Live Database Connected";
        badge.style.background = "#e8f5e9";
        badge.style.color = "#2e7d32";
        badge.style.borderColor = "#c8e6c9";
    } else if (status === 'error') {
        badge.innerHTML = `⚠️ Database Error (Check Rules)`;
        badge.title = details || "Database read/write failed. Check console and security rules.";
        badge.style.background = "#fff3e0";
        badge.style.color = "#e65100";
        badge.style.borderColor = "#ffe0b2";
    } else {
        badge.innerHTML = `⚠️ Offline Mode (Local Only)`;
        badge.title = "No database connection. Data is saved locally in this browser and will not sync with other devices.";
        badge.style.background = "#ffebee";
        badge.style.color = "#c62828";
        badge.style.borderColor = "#ffcdd2";
    }
}

// Open Details Modal and Pre-fill Cached Data
function openWhatsappDetailsModal(type) {
    whatsappTriggerSource.type = type;
    const dict = translations[currentLang];
    
    const detailsModalTitle = document.getElementById('detailsModalTitle');
    const detailsModalSubtitle = document.getElementById('detailsModalSubtitle');
    
    if (type === 'order') {
        if (detailsModalTitle) detailsModalTitle.textContent = dict.detailsModalTitleOrder || "Confirm Order Details";
        if (detailsModalSubtitle) detailsModalSubtitle.textContent = dict.detailsModalSubtitleOrder || "Please provide your delivery details to complete your order.";
    } else {
        if (detailsModalTitle) detailsModalTitle.textContent = dict.detailsModalTitleChat || "Connect on WhatsApp";
        if (detailsModalSubtitle) detailsModalSubtitle.textContent = dict.detailsModalSubtitleChat || "Please enter your details to start chatting with us on WhatsApp.";
    }
    
    // Auto-fill from localStorage if customer info exists
    const cachedInfo = localStorage.getItem('kshetriva_customer_info');
    if (cachedInfo) {
        try {
            const info = JSON.parse(cachedInfo);
            if (info.name) document.getElementById('custName').value = info.name;
            if (info.phone) document.getElementById('custPhone').value = info.phone;
            if (info.area) document.getElementById('custArea').value = info.area;
        } catch (e) {
            console.error("Error parsing cached customer info:", e);
        }
    }
    
    const detailsModal = document.getElementById('whatsappDetailsModal');
    if (detailsModal) {
        detailsModal.classList.add('open');
    }
}

// Format and send general WhatsApp message
function sendChatWhatsAppMessage(name, phone, area) {
    const isTe = currentLang === 'te';
    const msg = isTe 
        ? `నమస్తే క్షేత్రీవ ఫార్మ్స్,\nనా వివరాలు:\n👤 పేరు: ${name}\n📞 మొబైల్: ${phone}\n📍 ప్రాంతం: ${area}\n\nనేను మీతో చాట్ చేయాలనుకుంటున్నాను మరియు ఆర్డర్ చేయాలనుకుంటున్నాను.`
        : `Hello Kshetriva Farms,\nMy Details:\n👤 Name: ${name}\n📞 Phone: ${phone}\n📍 Area/Locality: ${area}\n\nI would like to enquire about ordering fresh vegetables.`;
    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/918374276995?text=${encoded}`, '_blank');
}

// Database Lead Saving Logic
function saveLeadToDatabase(lead, callback) {
    if (useFirebase && db) {
        db.collection("leads").doc(lead.id).set(lead)
            .then(() => {
                console.log("Lead saved successfully to Firestore.");
                cleanupFirestoreLeads(); // Cap Firestore leads at 100
                if (callback) callback();
            })
            .catch((err) => {
                console.error("Failed to save lead to Firestore, falling back to LocalStorage:", err);
                saveLeadToLocalStorage(lead);
                if (callback) callback();
            });
    } else {
        saveLeadToLocalStorage(lead);
        if (callback) callback();
    }
}

function saveLeadToLocalStorage(lead) {
    let leads = [];
    const localLeads = localStorage.getItem('kshetriva_leads');
    if (localLeads) {
        try {
            leads = JSON.parse(localLeads);
        } catch (e) {
            console.error("Error parsing offline leads:", e);
        }
    }
    leads.unshift(lead);
    leads = leads.slice(0, 100); // Cap at latest 100 leads
    localStorage.setItem('kshetriva_leads', JSON.stringify(leads));
}

function cleanupFirestoreLeads() {
    if (!useFirebase || !db) return;
    db.collection("leads").orderBy("timestamp", "desc").get()
        .then((snapshot) => {
            if (snapshot.size > 100) {
                const batch = db.batch();
                for (let i = 100; i < snapshot.size; i++) {
                    batch.delete(snapshot.docs[i].ref);
                }
                batch.commit().then(() => {
                    console.log("Firestore leads batch deleted. Capped at 100.");
                }).catch(err => console.error("Firestore leads batch cleanup failed:", err));
            }
        })
        .catch(err => console.error("Error fetching leads for cleanup:", err));
}

// Admin Tab Switch Logic
function switchAdminTab(tabName) {
    const tabCatalogBtn = document.getElementById('adminTabCatalogBtn');
    const tabLeadsBtn = document.getElementById('adminTabLeadsBtn');
    const tabFounderBtn = document.getElementById('adminTabFounderBtn');
    const tabCompanyStatsBtn = document.getElementById('adminTabCompanyStatsBtn');
    const tabSettingsBtn = document.getElementById('adminTabSettingsBtn');
    
    const catalogSection = document.getElementById('adminCatalogSection');
    const leadsSection = document.getElementById('adminLeadsSection');
    const founderSection = document.getElementById('adminFounderSection');
    const companyStatsSection = document.getElementById('adminCompanyStatsSection');
    const settingsSection = document.getElementById('adminSettingsSection');
    
    const addNewProductBtn = document.querySelector('.admin-header-actions button[onclick="openProductFormModal()"]');
    
    // Reset all tabs active state
    if (tabCatalogBtn) tabCatalogBtn.classList.remove('active');
    if (tabLeadsBtn) tabLeadsBtn.classList.remove('active');
    if (tabFounderBtn) tabFounderBtn.classList.remove('active');
    if (tabCompanyStatsBtn) tabCompanyStatsBtn.classList.remove('active');
    if (tabSettingsBtn) tabSettingsBtn.classList.remove('active');
    
    // Hide all sections
    if (catalogSection) catalogSection.style.display = 'none';
    if (leadsSection) leadsSection.style.display = 'none';
    if (founderSection) founderSection.style.display = 'none';
    if (companyStatsSection) companyStatsSection.style.display = 'none';
    if (settingsSection) settingsSection.style.display = 'none';
    
    if (addNewProductBtn) addNewProductBtn.style.display = 'none';

    if (tabName === 'leads') {
        if (tabLeadsBtn) tabLeadsBtn.classList.add('active');
        if (leadsSection) leadsSection.style.display = 'block';
        renderAdminLeads();
    } else if (tabName === 'founder') {
        if (tabFounderBtn) tabFounderBtn.classList.add('active');
        if (founderSection) founderSection.style.display = 'block';
        renderFounderInsights();
    } else if (tabName === 'companyStats') {
        if (tabCompanyStatsBtn) tabCompanyStatsBtn.classList.add('active');
        if (companyStatsSection) companyStatsSection.style.display = 'block';
        switchStatsSubTab('analytics');
    } else if (tabName === 'settings') {
        if (tabSettingsBtn) tabSettingsBtn.classList.add('active');
        if (settingsSection) settingsSection.style.display = 'block';
        renderAdminSettings();
    } else {
        if (tabCatalogBtn) tabCatalogBtn.classList.add('active');
        if (catalogSection) catalogSection.style.display = 'block';
        if (addNewProductBtn) addNewProductBtn.style.display = 'inline-block';
        renderAdminProducts();
    }
    updateAdminStats();
}

// Render Admin Customer Leads
function renderAdminLeads() {
    const listContainer = document.getElementById('adminLeadsList');
    if (!listContainer) return;
    listContainer.innerHTML = '';
    
    const showLeads = (leadsList) => {
        if (!leadsList || leadsList.length === 0) {
            listContainer.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; color: #888; padding: 30px;">
                        <i class="fa-solid fa-users-slash" style="font-size: 2rem; margin-bottom: 10px; display: block; color: var(--primary-color);"></i>
                        No customer leads registered yet.
                    </td>
                </tr>
            `;
            return;
        }
        
        leadsList.forEach((lead) => {
            const tr = document.createElement('tr');
            
            const dateStr = new Date(lead.timestamp).toLocaleString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const badgeClass = lead.type === 'order' ? 'order' : 'chat';
            const badgeLabel = lead.type === 'order' ? 'Order' : 'Chat';
            
            const isLocked = isLeadLocked(lead, leadsList);
            let actionsHtml = '';
            if (lead.type === 'order') {
                actionsHtml = isLocked
                    ? `<div class="admin-action-btns">
                            <button class="admin-action-btn edit" onclick="openOrderFormModal('${lead.id}')" title="Edit Order Details"><i class="fa-solid fa-pen-to-square"></i></button>
                            <button class="admin-action-btn delete" disabled style="opacity: 0.5; cursor: not-allowed; background-color: #eee; border-color: #ddd; color: #aaa;" title="Locked (Completed Week)"><i class="fa-solid fa-lock"></i></button>
                       </div>`
                    : `<div class="admin-action-btns">
                            <button class="admin-action-btn edit" onclick="openOrderFormModal('${lead.id}')" title="Edit Order Details"><i class="fa-solid fa-pen-to-square"></i></button>
                            <button class="admin-action-btn delete" onclick="deleteLead('${lead.id}')" title="Delete Order"><i class="fa-solid fa-trash-can"></i></button>
                       </div>`;
            } else {
                actionsHtml = isLocked
                    ? `<button class="admin-action-btn delete" disabled style="opacity: 0.5; cursor: not-allowed; background-color: #eee; border-color: #ddd; color: #aaa;" title="Locked (Completed Week)"><i class="fa-solid fa-lock"></i></button>`
                    : `<button class="admin-action-btn delete" onclick="deleteLead('${lead.id}')" title="Delete Lead"><i class="fa-solid fa-trash-can"></i></button>`;
            }
            
            if (isLocked) {
                tr.style.opacity = '0.85';
                tr.style.backgroundColor = '#fafafa';
            }
            
            tr.innerHTML = `
                <td style="font-size: 0.88rem; font-weight: 500; color: #555;">${dateStr}</td>
                <td style="font-weight: 600; color: var(--text-dark);">${lead.name}</td>
                <td>
                    <a href="tel:${lead.phone}" class="lead-phone-link"><i class="fa-solid fa-phone"></i> ${lead.phone}</a>
                    <a href="https://wa.me/91${lead.phone}" target="_blank" class="lead-wa-chat-btn" title="Chat on WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>
                </td>
                <td style="font-weight: 500; color: #555;">${lead.area}</td>
                <td><span class="lead-badge ${badgeClass}">${badgeLabel}</span></td>
                <td>
                    <div class="lead-cart-summary">${lead.cartSummary || '-'}</div>
                </td>
                <td>
                    ${actionsHtml}
                </td>
            `;
            listContainer.appendChild(tr);
        });
    };

    if (useFirebase && db) {
        db.collection("leads").orderBy("timestamp", "desc").limit(100).get()
            .then((snapshot) => {
                const leads = [];
                snapshot.forEach(doc => leads.push(doc.data()));
                showLeads(leads);
                updateAdminSyncStatus('live');
            })
            .catch((err) => {
                console.error("Error loading leads from Firestore:", err);
                updateAdminSyncStatus('error', err.message);
                // Fallback to local storage
                const localLeads = localStorage.getItem('kshetriva_leads');
                showLeads(localLeads ? JSON.parse(localLeads) : []);
            });
    } else {
        updateAdminSyncStatus('offline');
        const localLeads = localStorage.getItem('kshetriva_leads');
        showLeads(localLeads ? JSON.parse(localLeads) : []);
    }
}

// Delete individual lead
function deleteLead(leadId) {
    fetchAllLeads().then((leads) => {
        const lead = leads.find(l => l.id === leadId);
        if (lead && isLeadLocked(lead, leads)) {
            alert("🔒 This week's orders are completed and locked. You cannot delete this lead.");
            return;
        }
        if (confirm("Are you sure you want to delete this customer lead?")) {
            if (useFirebase && db) {
                db.collection("leads").doc(leadId).delete()
                    .then(() => {
                        console.log("Lead deleted from Firestore.");
                        renderAdminLeads();
                        updateAdminStats();
                    })
                    .catch(err => console.error("Error deleting lead from Firestore:", err));
            } else {
                let localLeads = [];
                const storedLeads = localStorage.getItem('kshetriva_leads');
                if (storedLeads) {
                    try {
                        localLeads = JSON.parse(storedLeads);
                    } catch (e) {}
                }
                localLeads = localLeads.filter(l => l.id !== leadId);
                localStorage.setItem('kshetriva_leads', JSON.stringify(localLeads));
                renderAdminLeads();
                updateAdminStats();
            }
        }
    });
}

// ===== System Settings and Manual Ordering Window Overrides =====

function loadManualWindowState() {
    const stored = localStorage.getItem('kshetriva_manual_window');
    if (stored) {
        try {
            manualWindowState = JSON.parse(stored);
        } catch (e) {
            console.error("Error parsing local manual window state:", e);
        }
    }
}

function saveManualWindowState() {
    if (useFirebase && db) {
        db.collection("metadata").doc("orderingWindow").set(manualWindowState)
            .then(() => {
                console.log("Manual window state synced to Firestore.");
            })
            .catch(err => {
                console.warn("Error syncing manual window state to Firestore (falling back to LocalStorage):", err);
                // Fallback to local storage if Firestore write fails (e.g. Permission Denied)
                localStorage.setItem('kshetriva_manual_window', JSON.stringify(manualWindowState));
                updateManualWindowUI();
                updateOrderingWindowBanner();
                updateCartUI();
            });
    } else {
        localStorage.setItem('kshetriva_manual_window', JSON.stringify(manualWindowState));
        updateManualWindowUI();
        updateOrderingWindowBanner();
        updateCartUI();
    }
}

function updateManualWindowUI() {
    const overrideToggle = document.getElementById('settingOverrideToggle');
    const stateToggle = document.getElementById('settingWindowStateToggle');
    const stateRow = document.getElementById('settingWindowStateRow');
    const stateLabel = document.getElementById('settingWindowStateLabel');

    if (overrideToggle) {
        overrideToggle.checked = manualWindowState.overrideActive;
    }
    if (stateToggle) {
        stateToggle.checked = manualWindowState.overrideOpen;
        // Physically disable input element to prevent direct keyboard/script modifications
        stateToggle.disabled = !manualWindowState.overrideActive;
    }
    if (stateRow) {
        if (manualWindowState.overrideActive) {
            stateRow.style.opacity = '1';
            stateRow.style.pointerEvents = 'auto';
        } else {
            stateRow.style.opacity = '0.5';
            stateRow.style.pointerEvents = 'none';
        }
    }
    if (stateLabel) {
        stateLabel.textContent = manualWindowState.overrideOpen ? "Open (Forced)" : "Closed (Forced)";
    }
}

function toggleManualOverride(checked) {
    manualWindowState.overrideActive = checked;
    
    // Log action
    let actionStr = checked 
        ? (manualWindowState.overrideOpen ? "Manual Override Enabled: Forced Open" : "Manual Override Enabled: Forced Closed")
        : "Manual Override Disabled: Auto Schedule Restored";
        
    addWindowLog(actionStr, manualWindowState.overrideOpen);
    saveManualWindowState();
}

function toggleForcedWindowState(checked) {
    // Prevent changing state if manual control override is not active
    if (!manualWindowState.overrideActive) {
        console.warn("Cannot force window state: Manual Window Control is disabled.");
        updateManualWindowUI(); // Sync checkbox state back to model
        return;
    }

    manualWindowState.overrideOpen = checked;
    
    // Log action
    let actionStr = checked 
        ? "Manual State Changed: Forced Open" 
        : "Manual State Changed: Forced Closed";
        
    addWindowLog(actionStr, checked);
    saveManualWindowState();
}

function addWindowLog(action, stateVal) {
    const timestamp = new Date().toISOString();
    
    // Determine user
    let userStr = "Mock Admin";
    if (useFirebase && auth && auth.currentUser) {
        userStr = auth.currentUser.email || auth.currentUser.uid;
    }
    
    const logEntry = {
        id: Date.now().toString(),
        action: action,
        state: stateVal ? "open" : "closed",
        timestamp: timestamp,
        user: userStr
    };
    
    if (useFirebase && db) {
        db.collection("window_logs").doc(logEntry.id).set(logEntry)
            .then(() => {
                console.log("Window state log saved to Firestore.");
                cleanupFirestoreWindowLogs(); // Keep only latest 25 logs
            })
            .catch((err) => {
                console.error("Failed to save log to Firestore, falling back to LocalStorage:", err);
                saveWindowLogToLocalStorage(logEntry);
            });
    } else {
        saveWindowLogToLocalStorage(logEntry);
    }
}

function saveWindowLogToLocalStorage(logEntry) {
    let logs = [];
    const localLogs = localStorage.getItem('kshetriva_window_logs');
    if (localLogs) {
        try {
            logs = JSON.parse(localLogs);
        } catch (e) {
            console.error("Error parsing local logs:", e);
        }
    }
    logs.unshift(logEntry);
    logs = logs.slice(0, 25); // Cap at latest 25 logs
    localStorage.setItem('kshetriva_window_logs', JSON.stringify(logs));
    
    // If settings section is open, reload it
    const settingsSection = document.getElementById('adminSettingsSection');
    if (settingsSection && settingsSection.style.display === 'block') {
        renderAdminWindowLogs();
    }
}

function cleanupFirestoreWindowLogs() {
    if (!useFirebase || !db) return;
    db.collection("window_logs").orderBy("timestamp", "desc").get()
        .then((snapshot) => {
            if (snapshot.size > 25) {
                const batch = db.batch();
                for (let i = 25; i < snapshot.size; i++) {
                    batch.delete(snapshot.docs[i].ref);
                }
                batch.commit().then(() => {
                    console.log("Firestore window logs batch deleted. Capped at 25.");
                    // Render settings logs if settings is active
                    const settingsSection = document.getElementById('adminSettingsSection');
                    if (settingsSection && settingsSection.style.display === 'block') {
                        renderAdminWindowLogs();
                    }
                }).catch(err => console.error("Firestore logs batch cleanup failed:", err));
            } else {
                // Render settings logs if settings is active even if no deletion was needed
                const settingsSection = document.getElementById('adminSettingsSection');
                if (settingsSection && settingsSection.style.display === 'block') {
                    renderAdminWindowLogs();
                }
            }
        })
        .catch(err => console.error("Error fetching logs for cleanup:", err));
}

function renderAdminSettings() {
    updateManualWindowUI();
    renderAdminWindowLogs();
}

function renderAdminWindowLogs() {
    const listContainer = document.getElementById('adminSettingsLogsList');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    const showLogs = (logsList) => {
        if (!logsList || logsList.length === 0) {
            listContainer.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: #888; padding: 20px;">
                        No manual window changes recorded yet.
                    </td>
                </tr>
            `;
            return;
        }

        logsList.forEach((log) => {
            const tr = document.createElement('tr');
            
            const dateStr = new Date(log.timestamp).toLocaleString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });

            // Action Badge
            const isOverrideOn = log.action.includes("Enabled") || log.action.includes("Changed");
            const actionBadgeClass = isOverrideOn ? "override-on" : "override-off";
            const actionLabel = log.action.includes("Disabled") ? "Disable Override" : (log.action.includes("Changed") ? "State Change" : "Enable Override");
            
            // State Badge
            const stateClass = log.state === "open" ? "open" : "closed";
            const stateLabel = log.state === "open" ? "Open" : "Closed";

            tr.innerHTML = `
                <td style="font-size: 0.88rem; font-weight: 500; color: #555;">${dateStr}</td>
                <td>
                    <div style="display: flex; flex-direction: column; gap: 4px;">
                        <span class="log-action-badge ${actionBadgeClass}">${actionLabel}</span>
                        <span style="font-size: 0.78rem; color: #777;">${log.action}</span>
                    </div>
                </td>
                <td><span class="log-state-badge ${stateClass}">${stateLabel}</span></td>
                <td style="font-weight: 500; color: #555;">${log.user}</td>
            `;
            listContainer.appendChild(tr);
        });
    };

    if (useFirebase && db) {
        db.collection("window_logs").orderBy("timestamp", "desc").limit(25).get()
            .then((snapshot) => {
                const logs = [];
                snapshot.forEach(doc => logs.push(doc.data()));
                showLogs(logs);
                updateAdminSyncStatus('live');
            })
            .catch((err) => {
                console.error("Error loading logs from Firestore:", err);
                updateAdminSyncStatus('error', err.message);
                const localLogs = localStorage.getItem('kshetriva_window_logs');
                showLogs(localLogs ? JSON.parse(localLogs) : []);
            });
    } else {
        updateAdminSyncStatus('offline');
        const localLogs = localStorage.getItem('kshetriva_window_logs');
        showLogs(localLogs ? JSON.parse(localLogs) : []);
    }
}

// Router for hidden hash #admin route
window.addEventListener('hashchange', checkHashRoute);
window.addEventListener('load', checkHashRoute);

function checkHashRoute() {
    if (window.location.hash === '#admin') {
        openAdminPortal();
    } else {
        closeAdminPortal();
    }
}

function openAdminPortal() {
    if (isAdminLoggedIn()) {
        openAdminDashboard();
    } else {
        openAdminLogin();
    }
}

function closeAdminPortal() {
    document.getElementById('adminLoginModal').classList.remove('open');
    document.getElementById('adminDashboardOverlay').classList.remove('open');
    if (window.location.hash === '#admin') {
        history.pushState("", document.title, window.location.pathname + window.location.search);
    }
}

function isAdminLoggedIn() {
    if (useFirebase && auth) {
        return auth.currentUser !== null;
    }
    return sessionStorage.getItem('kshetriva_admin_session') === 'active';
}

function openAdminLogin() {
    document.getElementById('adminLoginModal').classList.add('open');
    document.getElementById('adminDashboardOverlay').classList.remove('open');
    
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:';
    if (isLocalhost) {
        const emailEl = document.getElementById('adminEmail');
        const passEl = document.getElementById('adminPassword');
        if (emailEl) emailEl.value = 'admin@kshetrivafarms.com';
        if (passEl) passEl.value = 'admin123';
    }
}

function closeAdminLogin() {
    document.getElementById('adminLoginModal').classList.remove('open');
}

function openAdminDashboard() {
    document.getElementById('adminLoginModal').classList.remove('open');
    document.getElementById('adminDashboardOverlay').classList.add('open');
    if (useFirebase && db) {
        updateAdminSyncStatus('live');
    } else {
        updateAdminSyncStatus('offline');
    }
    switchAdminTab('catalog');
}

function closeAdminDashboard() {
    document.getElementById('adminDashboardOverlay').classList.remove('open');
}

// Login authentication trigger
function handleAdminLogin(e) {
    e.preventDefault();
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    const errorDiv = document.getElementById('adminLoginError');

    errorDiv.style.display = 'none';

    if (useFirebase && auth) {
        auth.signInWithEmailAndPassword(email, password)
            .then(() => {
                closeAdminLogin();
                openAdminDashboard();
            })
            .catch((err) => {
                errorDiv.textContent = "Firebase Error: " + err.message;
                errorDiv.style.display = 'block';
            });
    } else {
        // Fallback offline mock session
        if (email === 'admin@kshetrivafarms.com' && password === 'admin123') {
            sessionStorage.setItem('kshetriva_admin_session', 'active');
            closeAdminLogin();
            openAdminDashboard();
        } else {
            errorDiv.textContent = "Invalid fallback credentials (use admin@kshetrivafarms.com and admin123)";
            errorDiv.style.display = 'block';
        }
    }
}

// Logout authentication trigger
function handleAdminLogout() {
    if (useFirebase && auth) {
        auth.signOut().then(() => {
            closeAdminDashboard();
            closeAdminPortal();
        }).catch(err => console.error("Signout error:", err));
    } else {
        sessionStorage.removeItem('kshetriva_admin_session');
        closeAdminDashboard();
        closeAdminPortal();
    }
}

// Sync fallback mock products database changes locally
function saveProductsLocal() {
    if (!useFirebase) {
        localStorage.setItem('kshetriva_catalog', JSON.stringify(products));
        renderProducts();
        updateCartUI();
        renderAdminProducts();
        updateAdminStats();
    }
}

// Render Dashboard products list
function renderAdminProducts() {
    const listContainer = document.getElementById('adminProductsList');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    products.forEach((rawProduct) => {
        const product = getTranslatedProduct(rawProduct);
        const tr = document.createElement('tr');

        const catLabel = product.category.charAt(0).toUpperCase() + product.category.slice(1);
        const isChecked = product.inStock !== false ? 'checked' : '';

        const stockStatusText = product.inStock !== false
            ? `<span class="admin-stock-indicator in-stock"><i class="fa-solid fa-check-circle"></i> In Stock</span>`
            : `<span class="admin-stock-indicator out-of-stock"><i class="fa-solid fa-circle-xmark"></i> Out of Stock</span>`;

        tr.innerHTML = `
            <td><img src="${product.image}" alt="${product.name}" class="admin-table-img" width="50" height="50" loading="lazy"></td>
            <td>
                <div class="admin-table-title">${product.name_en || product.name}</div>
                <div class="admin-table-subtitle">${product.name_te || ''}</div>
            </td>
            <td><span class="admin-table-badge ${product.category}">${catLabel}</span></td>
            <td><strong>${product.price}</strong> / ${product.unit}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <label class="stock-toggle">
                        <input type="checkbox" onchange="toggleProductStock('${product.docId || ''}', ${product.id}, this.checked)" ${isChecked}>
                        <span class="stock-slider"></span>
                    </label>
                    ${stockStatusText}
                </div>
            </td>
            <td>
                <div class="admin-action-btns">
                    <button class="admin-action-btn edit" onclick="editProductModal('${product.docId || ''}', ${product.id})" title="Edit Product"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="admin-action-btn delete" onclick="deleteProduct('${product.docId || ''}', ${product.id})" title="Delete Product"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            </td>
        `;
        listContainer.appendChild(tr);
    });
}

// Update Dashboard Counter statistics
function updateAdminStats() {
    const totalEl = document.getElementById('statTotalProducts');
    const inStockEl = document.getElementById('statInStock');
    const outStockEl = document.getElementById('statOutOfStock');

    if (totalEl && inStockEl && outStockEl) {
        const total = products.length;
        const inStock = products.filter(p => p.inStock !== false).length;
        const outStock = total - inStock;

        totalEl.textContent = total;
        inStockEl.textContent = inStock;
        outStockEl.textContent = outStock;
    }

    // Update total leads count
    const totalLeadsEl = document.getElementById('statTotalLeads');
    if (totalLeadsEl) {
        if (useFirebase && db) {
            db.collection("leads").get().then((snapshot) => {
                totalLeadsEl.textContent = snapshot.size;
                updateAdminSyncStatus('live');
            }).catch(err => {
                console.warn("Error fetching leads count from Firestore, falling back to LocalStorage:", err);
                updateAdminSyncStatus('error', err.message);
                const localLeads = localStorage.getItem('kshetriva_leads');
                let count = 0;
                if (localLeads) {
                    try {
                        count = JSON.parse(localLeads).length;
                    } catch (e) {}
                }
                totalLeadsEl.textContent = count;
            });
        } else {
            const localLeads = localStorage.getItem('kshetriva_leads');
            let count = 0;
            if (localLeads) {
                try {
                    count = JSON.parse(localLeads).length;
                } catch (e) {}
            }
            totalLeadsEl.textContent = count;
        }
    }
}

// Toggle Stock level dynamically
function toggleProductStock(docId, id, isChecked) {
    if (useFirebase && db && docId) {
        db.collection("products").doc(docId).update({
            inStock: isChecked
        }).then(() => {
            console.log("Live Stock status synced successfully.");
        }).catch(err => console.error("Firestore stock update error:", err));
    } else {
        const product = products.find(p => p.id === id);
        if (product) {
            product.inStock = isChecked;
            saveProductsLocal();
        }
    }
}

// Product CRUD Editor Actions
const productFormModalEl = document.getElementById('productFormModal');

function openProductFormModal() {
    document.getElementById('productFormTitle').textContent = "Add New Product";
    document.getElementById('formProductId').value = '';
    document.getElementById('productEntryForm').reset();
    productFormModalEl.classList.add('open');
}

function closeProductFormModal() {
    productFormModalEl.classList.remove('open');
}

function editProductModal(docId, id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    document.getElementById('productFormTitle').textContent = "Edit Product";
    document.getElementById('formProductId').value = id;

    document.getElementById('prodNameEn').value = product.name_en || product.name;
    document.getElementById('prodNameTe').value = product.name_te || '';
    document.getElementById('prodCategory').value = product.category;
    document.getElementById('prodType').value = product.type || 'regular';
    document.getElementById('prodUnit').value = product.unit;
    document.getElementById('prodBadge').value = product.badge || '';
    document.getElementById('prodFarmer').value = product.farmerId || getFarmerIdForProduct(id);

    const priceNum = parseInt(product.price.replace(/[^\d]/g, ''));
    document.getElementById('prodPrice').value = priceNum;
    
    const costPrice = product.costPrice !== undefined ? product.costPrice : Math.round(priceNum * 0.6);
    document.getElementById('prodCostPrice').value = costPrice;
    
    document.getElementById('prodImageUrl').value = product.image;
    document.getElementById('prodInStock').checked = product.inStock !== false;

    productFormModalEl.classList.add('open');
}

function saveProduct(e) {
    e.preventDefault();
    const idVal = document.getElementById('formProductId').value;
    const nameEn = document.getElementById('prodNameEn').value;
    const nameTe = document.getElementById('prodNameTe').value;
    const category = document.getElementById('prodCategory').value;
    const vegType = document.getElementById('prodType').value;
    const unit = document.getElementById('prodUnit').value;
    const badge = document.getElementById('prodBadge').value;
    const price = parseInt(document.getElementById('prodPrice').value);
    const costPrice = parseInt(document.getElementById('prodCostPrice').value) || Math.round(price * 0.6);
    
    // Clean and validate GitHub image URLs if inputted
    const rawImageUrl = document.getElementById('prodImageUrl').value;
    const imageUrl = cleanGitHubImageUrl(rawImageUrl);
    document.getElementById('prodImageUrl').value = imageUrl;
    
    const inStock = document.getElementById('prodInStock').checked;
    const farmerId = parseInt(document.getElementById('prodFarmer').value) || getFarmerIdForProduct(idVal ? parseInt(idVal) : 1);

    const formattedPrice = `₹${price}`;

    if (useFirebase && db) {
        if (idVal) {
            const id = parseInt(idVal);
            const product = products.find(p => p.id === id);
            if (product && product.docId) {
                db.collection("products").doc(product.docId).update({
                    name_en: nameEn,
                    name_te: nameTe,
                    name: nameEn,
                    category: category,
                    type: vegType,
                    unit: unit,
                    badge: badge,
                    price: formattedPrice,
                    pricePerUnit: price,
                    costPrice: costPrice,
                    image: imageUrl,
                    inStock: inStock,
                    farmerId: farmerId
                }).then(() => {
                    closeProductFormModal();
                }).catch(err => console.error("Firebase dynamic update failed:", err));
            }
        } else {
            const nextId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
            const newDocId = `prod_${nextId}`;

            db.collection("products").doc(newDocId).set({
                id: nextId,
                name_en: nameEn,
                name_te: nameTe,
                name: nameEn,
                category: category,
                type: vegType,
                unit: unit,
                badge: badge,
                price: formattedPrice,
                pricePerUnit: price,
                costPrice: costPrice,
                image: imageUrl,
                inStock: inStock,
                farmerId: farmerId
            }).then(() => {
                closeProductFormModal();
            }).catch(err => console.error("Firebase dynamic creation failed:", err));
        }
    } else {
        // Local Fallback CRUD Updates
        if (idVal) {
            const id = parseInt(idVal);
            const productIndex = products.findIndex(p => p.id === id);
            if (productIndex !== -1) {
                products[productIndex] = {
                    ...products[productIndex],
                    name_en: nameEn,
                    name_te: nameTe,
                    name: nameEn,
                    category: category,
                    type: vegType,
                    unit: unit,
                    badge: badge,
                    price: formattedPrice,
                    pricePerUnit: price,
                    costPrice: costPrice,
                    image: imageUrl,
                    inStock: inStock,
                    farmerId: farmerId
                };
                saveProductsLocal();
                closeProductFormModal();
            }
        } else {
            const nextId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
            products.push({
                id: nextId,
                name_en: nameEn,
                name_te: nameTe,
                name: nameEn,
                category: category,
                type: vegType,
                unit: unit,
                badge: badge,
                price: formattedPrice,
                pricePerUnit: price,
                costPrice: costPrice,
                image: imageUrl,
                inStock: inStock,
                farmerId: farmerId
            });
            saveProductsLocal();
            closeProductFormModal();
        }
    }
}

function deleteProduct(docId, id) {
    if (!confirm("Are you sure you want to delete this product from the dynamic inventory?")) return;

    if (useFirebase && db && docId) {
        db.collection("products").doc(docId).delete()
            .then(() => {
                console.log("Product successfully removed from Live database.");
            })
            .catch(err => console.error("Firestore document deletion failed:", err));
    } else {
        const productIndex = products.findIndex(p => p.id === id);
        if (productIndex !== -1) {
            products.splice(productIndex, 1);
            saveProductsLocal();
        }
    }
}

// Attach Admin Panel Trigger Links
const adminLink = document.getElementById('adminLink');
const closeAdminLoginBtn = document.getElementById('closeAdminLoginBtn');
const closeAdminDashBtn = document.getElementById('closeAdminDashBtn');

if (adminLink) {
    adminLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = 'admin';
    });
}

if (closeAdminLoginBtn) {
    closeAdminLoginBtn.addEventListener('click', closeAdminPortal);
}

if (closeAdminDashBtn) {
    closeAdminDashBtn.addEventListener('click', closeAdminPortal);
}


/* ==========================================================================
   Live Database Handshake Event Listeners
   ========================================================================== */

// Firestore live real-time query listener
if (useFirebase && db) {
    db.collection("products").orderBy("id", "asc").onSnapshot((snapshot) => {
        let dbProducts = [];
        snapshot.forEach((doc) => {
            dbProducts.push({
                docId: doc.id,
                ...doc.data()
            });
        });

        if (dbProducts.length > 0) {
            // Migrate legacy 'organic' category to 'vegetables'
            dbProducts.forEach(p => {
                if (p.category === 'organic') p.category = 'vegetables';
            });
            products = dbProducts;
            renderProducts();
            updateCartUI();
            if (isAdminLoggedIn()) {
                renderAdminProducts();
                updateAdminStats();
            }
        } else {
            // Seed base items to firestore
            seedDatabase();
        }
    }, (error) => {
        console.error("Firestore catalog snap update exception:", error);
    });
}

// Firestore live real-time query listener for manual window override state
if (useFirebase && db) {
    db.collection("metadata").doc("orderingWindow").onSnapshot((doc) => {
        if (doc.exists) {
            manualWindowState = doc.data();
            updateManualWindowUI();
            updateOrderingWindowBanner();
            updateCartUI();
        } else {
            // Fallback to local storage if document does not exist yet
            loadManualWindowState();
            updateManualWindowUI();
            updateOrderingWindowBanner();
            updateCartUI();
        }
    }, (error) => {
        console.warn("Firestore orderingWindow snap update failed (using LocalStorage fallback):", error);
        loadManualWindowState();
        updateManualWindowUI();
        updateOrderingWindowBanner();
        updateCartUI();
    });
}

// Live Auth status state persistence listener
if (useFirebase && auth) {
    auth.onAuthStateChanged((user) => {
        if (user) {
            console.log("Admin status check: Live Auth connected.");
            if (window.location.hash === '#admin') {
                openAdminDashboard();
            }
        } else {
            console.log("Admin status check: Guest status active.");
            if (window.location.hash === '#admin') {
                openAdminLogin();
            }
        }
    });
}


// ===== Phase 3: Coupon Code Option =====
let appliedCoupon = localStorage.getItem('kshetriva_coupon') || '';

function initCouponLogic() {
    const couponInput = document.getElementById('couponInput');
    const applyCouponBtn = document.getElementById('applyCouponBtn');
    const couponMessage = document.getElementById('couponMessage');

    if (!couponInput || !applyCouponBtn || !couponMessage) return;

    // Set initial input state if a coupon was already applied
    if (appliedCoupon) {
        couponInput.value = appliedCoupon;
        couponInput.disabled = true;
        
        const dict = translations[currentLang];
        couponMessage.textContent = (dict.couponApplied || "Coupon '{code}' applied!").replace('{code}', appliedCoupon);
        couponMessage.className = "coupon-msg success";
        applyCouponBtn.textContent = dict.couponRemoveBtn || "Remove";
    }

    applyCouponBtn.addEventListener('click', () => {
        const dict = translations[currentLang];
        if (appliedCoupon) {
            // Remove coupon
            appliedCoupon = '';
            localStorage.removeItem('kshetriva_coupon');
            couponInput.value = '';
            couponInput.disabled = false;
            couponMessage.style.display = 'none';
            couponMessage.className = "coupon-msg";
            applyCouponBtn.textContent = dict.couponApplyBtn || "Apply";
            trackGA4Event('coupon_removed');
            updateCartUI();
        } else {
            // Apply coupon
            const code = couponInput.value.trim();
            if (code === 'Delivery30') {
                appliedCoupon = code;
                localStorage.setItem('kshetriva_coupon', code);
                couponInput.disabled = true;
                couponMessage.textContent = (dict.couponApplied || "Coupon '{code}' applied!").replace('{code}', code);
                couponMessage.className = "coupon-msg success";
                applyCouponBtn.textContent = dict.couponRemoveBtn || "Remove";
                trackGA4Event('coupon_applied', { coupon_code: code });
                updateCartUI();
            } else {
                couponMessage.textContent = dict.couponInvalid || "Invalid coupon code";
                couponMessage.className = "coupon-msg error";
                trackGA4Event('coupon_invalid', { coupon_code: code });
            }
        }
    });

    couponInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            applyCouponBtn.click();
        }
    });
}

/* ==========================================================================
   Producer & Founder Insights Dashboard Controller
   ========================================================================== */

const F_GROWERS = {
    1: { id: 1, name: "M. Surendhar Reddy", cropIds: [2, 6], avatar: "images/farmer_surendhar.webp", specialty: "Root Vegetables" },
    2: { id: 2, name: "N. Bhaskar Reddy", cropIds: [1, 5, 7, 10, 17, 18], avatar: "images/farmer_bhaskar.jpg", specialty: "Leafy Greens" },
    3: { id: 3, name: "P. Raju", cropIds: [3, 4, 8, 9, 11, 12, 13, 14, 15, 16, 19], avatar: "images/farmer_ashok.webp", specialty: "Fruits & Vegetables" }
};
let activeFarmerInsightId = 1;
let platformFeePercent = 8;

function fetchAllLeads() {
    return new Promise((resolve) => {
        if (useFirebase && db) {
            db.collection("leads").orderBy("timestamp", "desc").get()
                .then((snapshot) => {
                    const leads = [];
                    snapshot.forEach(doc => leads.push(doc.data()));
                    resolve(leads);
                })
                .catch(err => {
                    console.error("Error loading leads from Firestore:", err);
                    const localLeads = localStorage.getItem('kshetriva_leads');
                    resolve(localLeads ? JSON.parse(localLeads) : []);
                });
        } else {
            const localLeads = localStorage.getItem('kshetriva_leads');
            resolve(localLeads ? JSON.parse(localLeads) : []);
        }
    });
}



function renderFounderInsights() {
    fetchAllLeads().then((leads) => {
        let grossSales = 0;
        let totalOrders = 0;
        
        const ordersOnly = leads.filter(l => l.type === 'order');
        totalOrders = ordersOnly.length;
        
        ordersOnly.forEach(o => {
            grossSales += o.totalAmount || o.totalSum || 0;
        });
        
        // Update Stats UI
        document.getElementById('founderRevenueVal').textContent = `₹${grossSales}`;
        document.getElementById('founderOrdersVal').textContent = totalOrders;
        
        // Calculate leaderboard for present week only
        const currentWeekStr = getWeekRangeString(new Date().toISOString());
        const presentWeekOrders = ordersOnly.filter(o => getWeekRangeString(o.timestamp) === currentWeekStr);
        renderLeaderboard(presentWeekOrders);
        
        // Render Founder Logistics Console list
        const logContainer = document.getElementById('founderLogisticsList');
        if (!logContainer) return;
        logContainer.innerHTML = '';
        
        if (ordersOnly.length === 0) {
            logContainer.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; color: #888; padding: 30px;">
                        No orders recorded yet.
                    </td>
                </tr>
            `;
            return;
        }
        
        ordersOnly.forEach(o => {
            const tr = document.createElement('tr');
            
            const dateStr = new Date(o.timestamp).toLocaleString('en-IN', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            let itemLines = [];
            if (o.items) {
                o.items.forEach(item => {
                    const optText = item.option ? ` (${item.option})` : '';
                    itemLines.push(`${item.name}${optText} x ${item.qty}`);
                });
            }
            const itemText = itemLines.join(', ') || o.cartSummary || '-';
            
            const isLocked = isLeadLocked(o, leads);
            const actionsHtml = isLocked
                ? `<div class="admin-action-btns">
                        <button class="admin-action-btn edit" onclick="openOrderFormModal('${o.id}')" title="Edit Order Details"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button class="admin-action-btn delete" disabled style="opacity: 0.5; cursor: not-allowed; background-color: #eee; border-color: #ddd; color: #aaa;" title="Locked (Completed Week)"><i class="fa-solid fa-lock"></i></button>
                   </div>`
                : `<div class="admin-action-btns">
                        <button class="admin-action-btn edit" onclick="openOrderFormModal('${o.id}')" title="Edit Order Details"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button class="admin-action-btn delete" onclick="deleteLead('${o.id}')" title="Delete Order"><i class="fa-solid fa-trash-can"></i></button>
                   </div>`;
            
            if (isLocked) {
                tr.style.opacity = '0.85';
                tr.style.backgroundColor = '#fafafa';
            }
            
            tr.innerHTML = `
                <td style="font-size: 0.88rem; font-weight: 500; color: #555;">${dateStr}</td>
                <td>
                    <div style="font-weight: 600; color: var(--text-dark);">${o.name}</div>
                    <div style="font-size: 0.78rem; color: #777;">${o.phone} | ${o.area}</div>
                </td>
                <td style="font-size: 0.82rem; color: #555; max-width: 250px;">${itemText}</td>
                <td style="font-weight: 700; color: var(--primary-color);">₹${o.totalAmount || o.totalSum || 0}</td>
                <td>
                    ${actionsHtml}
                </td>
            `;
            logContainer.appendChild(tr);
        });
    });
}

function renderLeaderboard(ordersOnly) {
    const cropSales = {};
    ordersOnly.forEach(o => {
        if (o.items) {
            o.items.forEach(item => {
                const prod = products.find(p => p.id === item.id);
                const multiplier = prod ? getOptionMultiplier(prod, item.option, item.price) : 1;
                const baseQty = item.qty * multiplier;
                
                if (!cropSales[item.id]) {
                    cropSales[item.id] = {
                        totalQty: 0,
                        variants: {}
                    };
                }
                
                cropSales[item.id].totalQty += baseQty;
                
                // Track variant details
                let optLabel = item.option || '';
                if (prod && item.option) {
                    const opts = getQuantityOptions(prod);
                    const optObj = opts.find(o => o.value === item.option || o.label === item.option);
                    if (optObj) {
                        optLabel = optObj.label;
                    }
                }
                const optName = optLabel || (prod ? prod.unit : 'unit');
                cropSales[item.id].variants[optName] = (cropSales[item.id].variants[optName] || 0) + item.qty;
            });
        }
    });
    
    const sorted = Object.keys(cropSales)
        .map(idStr => {
            const id = parseInt(idStr);
            const p = products.find(prod => prod.id === id);
            return {
                id: id,
                qty: cropSales[idStr].totalQty,
                variants: cropSales[idStr].variants,
                product: p
            };
        })
        .filter(x => x.product !== undefined)
        .sort((a, b) => b.qty - a.qty);
        
    const list = document.getElementById('founderLeaderboardList');
    if (!list) return;
    list.innerHTML = '';
    
    if (sorted.length === 0) {
        list.innerHTML = `<div style="text-align: center; color: #888; font-size: 0.85rem; padding: 15px;">No product sales recorded yet.</div>`;
        return;
    }
    
    sorted.forEach((x, index) => {
        const row = document.createElement('div');
        row.className = 'leaderboard-row';
        
        const barPct = sorted[0].qty > 0 ? Math.round((x.qty / sorted[0].qty) * 100) : 0;
        const fillClass = x.product.category === 'root' ? 'fill-roots' : x.product.category === 'leafy' ? 'fill-leafy' : 'fill-fruits';
        const formattedQty = Math.round(x.qty * 100) / 100;
        
        // Build variant breakdown pills
        const variantParts = [];
        Object.entries(x.variants).forEach(([opt, count]) => {
            variantParts.push(`<span style="background: #f0f4f2; color: #555; padding: 3px 8px; border-radius: 8px; font-size: 0.75rem; font-weight: 500; border: 1px solid #e1e8e4;">${opt} × ${count}</span>`);
        });
        const variantsHtml = variantParts.length > 0 
            ? `<div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; font-size: 0.8rem;">${variantParts.join('')}</div>`
            : '';
            
        row.innerHTML = `
            <span class="leaderboard-rank">#${index + 1}</span>
            <img src="${x.product.image}" alt="${x.product.name}" class="leaderboard-img">
            <div class="leaderboard-info" style="flex: 1;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span class="leaderboard-name" style="font-weight: 600; color: var(--text-dark);">${x.product.name}</span>
                    <span class="leaderboard-metric">${formattedQty} ${x.product.unit}</span>
                </div>
                <div class="progress-bar-track" style="margin-top: 4px;">
                    <div class="progress-bar-fill ${fillClass}" style="width: ${barPct}%"></div>
                </div>
                ${variantsHtml}
            </div>
        `;
        list.appendChild(row);
    });
}



function modifyLeadOrderStatus(leadId, newStatus) {
    if (useFirebase && db) {
        db.collection("leads").doc(leadId).update({
            status: newStatus
        }).then(() => {
            console.log("Order status synced successfully.");
            refreshActiveTab();
        }).catch(err => console.error("Firestore order status update failed:", err));
    } else {
        const localLeads = localStorage.getItem('kshetriva_leads');
        if (localLeads) {
            try {
                const leadsList = JSON.parse(localLeads);
                const leadIndex = leadsList.findIndex(l => l.id === leadId);
                if (leadIndex !== -1) {
                    leadsList[leadIndex].status = newStatus;
                    localStorage.setItem('kshetriva_leads', JSON.stringify(leadsList));
                    refreshActiveTab();
                }
            } catch (e) {
                console.error("Local leads status change parsing exception:", e);
            }
        }
    }
}

function openOrderFormModal(leadId) {
    const titleEl = document.getElementById('orderFormTitle');
    const idField = document.getElementById('formOrderId');
    const form = document.getElementById('orderEntryForm');
    const listCheck = document.getElementById('orderProductsChecklist');
    
    // Track if user manually edits discount percentage
    let isDiscountManuallyEdited = false;
    const discountInput = document.getElementById('ordDiscountPercentage');
    
    const updateDiscountSuggestionVisibility = () => {
        const checkboxes = document.querySelectorAll('.chk-order-prod:checked');
        const uniqueItemCount = checkboxes.length;
        const tier = detectBasketTier(uniqueItemCount);
        const suggestedPct = tier ? Math.round(tier.discount * 100) : 0;
        
        const badge = document.getElementById('ordDiscountSuggestBadge');
        if (badge) {
            if (suggestedPct > 0) {
                badge.textContent = `Suggest: ${suggestedPct}%`;
                badge.style.display = 'inline-block';
                badge.onclick = () => {
                    if (discountInput) {
                        discountInput.value = suggestedPct;
                        isDiscountManuallyEdited = false;
                        updateDiscountSuggestionVisibility();
                    }
                };
            } else {
                badge.style.display = 'none';
            }
        }
        
        // Auto-update if not manually edited by the user
        if (!isDiscountManuallyEdited && discountInput) {
            discountInput.value = suggestedPct;
        }
    };

    if (discountInput) {
        discountInput.value = 0;
        discountInput.oninput = () => {
            isDiscountManuallyEdited = true;
            updateDiscountSuggestionVisibility();
        };
    }
    
    const initializeForm = () => {
        idField.value = leadId || '';
        form.reset();
        listCheck.innerHTML = '';
        
        products.forEach(p => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'order-check-item';
            
            const opts = getQuantityOptions(p);
            let optionsHtml = opts.map(opt => `<option value="${opt.value}" data-price="${opt.price}">${opt.label} (₹${opt.price})</option>`).join('');
            
            itemDiv.innerHTML = `
                <div class="order-check-left">
                    <input type="checkbox" id="chkProd_${p.id}" value="${p.id}" class="chk-order-prod">
                    <label for="chkProd_${p.id}">${p.name}</label>
                </div>
                <div class="order-check-right">
                    <select id="selOptProd_${p.id}" class="order-qty-select" disabled>
                        ${optionsHtml}
                    </select>
                    <input type="number" id="qtyProd_${p.id}" class="order-qty-input" value="1" min="1" disabled style="width: 50px;">
                </div>
            `;
            
            const chk = itemDiv.querySelector('.chk-order-prod');
            const sel = itemDiv.querySelector('.order-qty-select');
            const qty = itemDiv.querySelector('.order-qty-input');
            
            chk.addEventListener('change', (e) => {
                sel.disabled = !e.target.checked;
                qty.disabled = !e.target.checked;
                updateDiscountSuggestionVisibility();
            });
            
            listCheck.appendChild(itemDiv);
        });
        
        if (leadId) {
            titleEl.textContent = "Edit Order Details";
            isDiscountManuallyEdited = true; // don't auto-overwrite loaded values
            
            fetchAllLeads().then((leads) => {
                const o = leads.find(l => l.id === leadId);
                if (o) {
                    document.getElementById('ordName').value = o.name || '';
                    document.getElementById('ordPhone').value = o.phone || '';
                    document.getElementById('ordArea').value = o.area || '';
                    document.getElementById('ordStatus').value = o.status || 'harvesting';
                    document.getElementById('ordDeliveryCharge').value = o.deliveryCharge !== undefined ? o.deliveryCharge : 49;
                    
                    if (o.timestamp) {
                        const orderDate = new Date(o.timestamp);
                        const offset = orderDate.getTimezoneOffset() * 60000;
                        const localISOTime = (new Date(orderDate - offset)).toISOString().slice(0, 16);
                        document.getElementById('ordDate').value = localISOTime;
                    }
                    
                    if (o.items) {
                        o.items.forEach(item => {
                            const chk = document.getElementById(`chkProd_${item.id}`);
                            const sel = document.getElementById(`selOptProd_${item.id}`);
                            const qty = document.getElementById(`qtyProd_${item.id}`);
                            
                            if (chk && sel && qty) {
                                chk.checked = true;
                                sel.disabled = false;
                                qty.disabled = false;
                                
                                sel.value = item.option || sel.options[0]?.value;
                                qty.value = item.qty || 1;
                            }
                        });
                    }

                    // Populate discount percentage
                    let subtotal = 0;
                    if (o.items) {
                        o.items.forEach(item => {
                            subtotal += (item.price || 0) * (item.qty || 0);
                        });
                    }
                    let discPct = 0;
                    if (o.discountPercentage !== undefined) {
                        discPct = o.discountPercentage;
                    } else if (o.discountAmount && subtotal > 0) {
                        discPct = Math.round((o.discountAmount / subtotal) * 100);
                    }
                    if (discountInput) {
                        discountInput.value = discPct;
                    }
                    updateDiscountSuggestionVisibility();
                }
            });
        } else {
            titleEl.textContent = "Create Manual Order";
            const now = new Date();
            const offset = now.getTimezoneOffset() * 60000;
            const localISOTime = (new Date(now - offset)).toISOString().slice(0, 16);
            document.getElementById('ordDate').value = localISOTime;
            
            isDiscountManuallyEdited = false;
            if (discountInput) {
                discountInput.value = 0;
            }
            updateDiscountSuggestionVisibility();
        }
        
        document.getElementById('orderFormModal').classList.add('open');
    };

    initializeForm();
}

function closeOrderFormModal() {
    document.getElementById('orderFormModal').classList.remove('open');
}

function saveManualOrder(e) {
    e.preventDefault();
    const idVal = document.getElementById('formOrderId').value;
    const name = document.getElementById('ordName').value.trim();
    const phone = document.getElementById('ordPhone').value.trim();
    const area = document.getElementById('ordArea').value.trim();
    const status = document.getElementById('ordStatus').value;
    
    if (!name || !phone || !area) return;
    
    const dateInputVal = document.getElementById('ordDate').value;
    const timestamp = dateInputVal ? new Date(dateInputVal).toISOString() : new Date().toISOString();
    
    let items = [];
    let subtotal = 0;
    let itemsCount = 0;
    
    const checkboxes = document.querySelectorAll('.chk-order-prod:checked');
    checkboxes.forEach(chk => {
        const prodId = parseInt(chk.value);
        const rawProduct = products.find(p => p.id === prodId);
        if (rawProduct) {
            const selOpt = document.getElementById(`selOptProd_${prodId}`);
            const qtyInput = document.getElementById(`qtyProd_${prodId}`);
            
            const selectedOption = selOpt.value;
            const qty = parseInt(qtyInput.value) || 1;
            
            const opts = getQuantityOptions(rawProduct);
            const optObj = opts.find(o => o.value === selectedOption) || opts[0];
            const price = optObj ? optObj.price : rawProduct.pricePerUnit;
            
            const basePrice = rawProduct.pricePerUnit || parseInt((rawProduct.price || '0').replace(/[^\d]/g, ''));
            const itemCostPrice = (rawProduct.costPrice !== undefined) ? rawProduct.costPrice : Math.round(basePrice * 0.6);
            
            items.push({
                id: prodId,
                name: rawProduct.name,
                qty: qty,
                option: selectedOption,
                price: price,
                total: price * qty,
                costPrice: itemCostPrice,
                category: rawProduct.category
            });
            
            subtotal += price * qty;
            itemsCount += qty;
        }
    });
    
    const discountPercentage = parseFloat(document.getElementById('ordDiscountPercentage').value) || 0;
    const discountAmount = Math.round(subtotal * (discountPercentage / 100) * 100) / 100;
    const deliveryChargeVal = parseInt(document.getElementById('ordDeliveryCharge').value) || 0;
    const totalAmount = Math.round((subtotal - discountAmount + deliveryChargeVal) * 100) / 100;
    const cartSummary = `${itemsCount} items, Total: ₹${totalAmount}`;
    
    const lead = {
        id: idVal || Date.now().toString(),
        name,
        phone,
        area,
        timestamp,
        type: 'order',
        cartSummary,
        items,
        totalAmount,
        discountAmount,
        discountPercentage,
        deliveryCharge: deliveryChargeVal,
        status,
        coupon: ''
    };
    
    if (useFirebase && db) {
        db.collection("leads").doc(lead.id).set(lead)
            .then(() => {
                console.log("Manual Order saved successfully.");
                cleanupFirestoreLeads();
                closeOrderFormModal();
                refreshActiveTab();
            })
            .catch(err => {
                console.error("Firebase manual order save failed, falling back locally:", err);
                saveLeadToLocalStorage(lead);
                closeOrderFormModal();
                refreshActiveTab();
            });
    } else {
        if (idVal) {
            let localLeads = [];
            const storedLeads = localStorage.getItem('kshetriva_leads');
            if (storedLeads) {
                try {
                    localLeads = JSON.parse(storedLeads);
                } catch (ex) {}
            }
            const idx = localLeads.findIndex(l => l.id === idVal);
            if (idx !== -1) {
                localLeads[idx] = lead;
            } else {
                localLeads.unshift(lead);
            }
            localStorage.setItem('kshetriva_leads', JSON.stringify(localLeads));
        } else {
            saveLeadToLocalStorage(lead);
        }
        closeOrderFormModal();
        refreshActiveTab();
    }
}

function clearWeekOrders(weekStr) {
    if (confirm(`🚨 WARNING: Are you sure you want to clear all leads and orders for week: ${weekStr}? This action is permanent!`)) {
        fetchAllLeads().then((leads) => {
            if (isWeekLocked(weekStr, leads)) {
                alert("🔒 This week's orders are completed and locked. You cannot clear this week.");
                return;
            }
            const leadsToDelete = leads.filter(l => getWeekRangeString(l.timestamp) === weekStr);
            if (leadsToDelete.length === 0) {
                alert("No orders or leads found for this week.");
                return;
            }
            
            if (useFirebase && db) {
                const batch = db.batch();
                leadsToDelete.forEach(l => {
                    batch.delete(db.collection("leads").doc(l.id));
                });
                batch.commit().then(() => {
                    console.log(`Firestore week ${weekStr} completely cleared.`);
                    refreshActiveTab();
                }).catch(err => console.error("Firestore batch delete week failed:", err));
            } else {
                let allLeads = [];
                const localLeads = localStorage.getItem('kshetriva_leads');
                if (localLeads) {
                    try {
                        allLeads = JSON.parse(localLeads);
                    } catch (e) {}
                }
                allLeads = allLeads.filter(l => getWeekRangeString(l.timestamp) !== weekStr);
                localStorage.setItem('kshetriva_leads', JSON.stringify(allLeads));
                refreshActiveTab();
            }
        });
    }
}

function clearCurrentWeek() {
    const currentWeekStr = getWeekRangeString(new Date().toISOString());
    clearWeekOrders(currentWeekStr);
}

function refreshActiveTab() {
    const leadsSec = document.getElementById('adminLeadsSection');
    const founderSec = document.getElementById('adminFounderSection');
    const statsSec = document.getElementById('adminCompanyStatsSection');
    
    if (leadsSec && leadsSec.style.display === 'block') {
        renderAdminLeads();
    } else if (founderSec && founderSec.style.display === 'block') {
        renderFounderInsights();
    } else if (statsSec && statsSec.style.display === 'block') {
        const costSec = document.getElementById('statsCostSubSection');
        if (costSec && costSec.style.display === 'block') {
            renderProductCostManagement();
        } else {
            renderCompanyAnalytics();
        }
    }
    updateAdminStats();
}

function switchStatsSubTab(subTab) {
    const analyticsBtn = document.getElementById('subTabAnalyticsBtn');
    const costBtn = document.getElementById('subTabCostBtn');
    const analyticsSec = document.getElementById('statsAnalyticsSubSection');
    const costSec = document.getElementById('statsCostSubSection');
    
    if (!analyticsBtn || !costBtn || !analyticsSec || !costSec) return;
    
    if (subTab === 'analytics') {
        analyticsBtn.classList.add('active-sub-tab');
        analyticsBtn.style.background = 'var(--primary-color)';
        analyticsBtn.style.color = 'white';
        costBtn.classList.remove('active-sub-tab');
        costBtn.style.background = '#eee';
        costBtn.style.color = '#555';
        
        analyticsSec.style.display = 'block';
        costSec.style.display = 'none';
        renderCompanyAnalytics();
    } else {
        costBtn.classList.add('active-sub-tab');
        costBtn.style.background = 'var(--primary-color)';
        costBtn.style.color = 'white';
        analyticsBtn.classList.remove('active-sub-tab');
        analyticsBtn.style.background = '#eee';
        analyticsBtn.style.color = '#555';
        
        analyticsSec.style.display = 'none';
        costSec.style.display = 'block';
        renderProductCostManagement();
    }
}

function getWeekRangeString(dateString) {
    const d = new Date(dateString);
    const day = d.getDay(); // 0 is Sunday, 1 is Monday...
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    
    const format = (dt) => dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    return `${format(monday)} - ${format(sunday)}`;
}

function isWeekLocked(weekStr, leads) {
    if (!leads) return false;
    const currentWeekStr = getWeekRangeString(new Date().toISOString());
    if (weekStr === currentWeekStr) {
        return false; // Present week is never locked
    }
    const weekOrders = leads.filter(l => l.type === 'order' && getWeekRangeString(l.timestamp) === weekStr);
    if (weekOrders.length === 0) {
        return true; // No orders in previous weeks means it is considered locked/completed
    }
    return weekOrders.every(o => o.status === 'delivered');
}

function isLeadLocked(lead, leads) {
    if (!lead || !leads) return false;
    const weekStr = getWeekRangeString(lead.timestamp);
    return isWeekLocked(weekStr, leads);
}

function getOptionMultiplier(product, optionStr, itemPrice) {
    const opts = getQuantityOptions(product);
    if (optionStr) {
        const match = opts.find(o => 
            o.value === optionStr || 
            o.label === optionStr || 
            o.label.toLowerCase().includes(optionStr.toLowerCase()) || 
            optionStr.toLowerCase().includes(o.label.toLowerCase())
        );
        if (match) return match.multiplier || 1;
    }
    
    // Fallback: If optionStr is empty/missing, check if itemPrice matches any option price
    if (itemPrice) {
        const matchByPrice = opts.find(o => o.price === itemPrice);
        if (matchByPrice) return matchByPrice.multiplier || 1;
        
        // Secondary fallback: approximate multiplier as itemPrice / basePrice
        const basePrice = product.pricePerUnit || parseInt((product.price || '0').replace(/[^\d]/g, ''));
        if (basePrice > 0) {
            return itemPrice / basePrice;
        }
    }
    
    return 1;
}

function renderCompanyAnalytics() {
    fetchAllLeads().then((leads) => {
        const ordersOnly = leads.filter(l => l.type === 'order');
        
        // Group orders by week
        const weeks = {};
        
        ordersOnly.forEach(o => {
            const weekStr = getWeekRangeString(o.timestamp);
            if (!weeks[weekStr]) {
                weeks[weekStr] = {
                    weekStr: weekStr,
                    orders: [],
                    grossSales: 0,
                    expenses: 0,
                    totalDiscount: 0,
                    totalDeliveryCharge: 0,
                    products: {}
                };
            }
            
            weeks[weekStr].orders.push(o);
            weeks[weekStr].grossSales += o.totalAmount || o.totalSum || 0;
            weeks[weekStr].totalDiscount += o.discountAmount || 0;
            weeks[weekStr].totalDeliveryCharge += o.deliveryCharge || 0;
            
            if (o.items) {
                o.items.forEach(item => {
                    const prod = products.find(p => p.id === item.id);
                    let baseCostPrice = 0;
                    let multiplier = 1;
                    let itemExpense = 0;
                    
                    const currentWeekStr = getWeekRangeString(new Date().toISOString());
                    const isPreviousWeek = weekStr !== currentWeekStr;
                    
                    if (prod) {
                        multiplier = getOptionMultiplier(prod, item.option, item.price);
                        if (item.costPrice !== undefined) {
                            baseCostPrice = item.costPrice;
                        } else if (isPreviousWeek) {
                            // Previous weeks are locked; fallback to 60% of base selling price
                            const basePrice = prod.pricePerUnit || parseInt((prod.price || '0').replace(/[^\d]/g, ''));
                            baseCostPrice = Math.round(basePrice * 0.6);
                        } else if (prod.costPrice !== undefined) {
                            // Present week: use catalog costPrice if available
                            baseCostPrice = prod.costPrice;
                        } else {
                            const basePrice = prod.pricePerUnit || parseInt((prod.price || '0').replace(/[^\d]/g, ''));
                            baseCostPrice = Math.round(basePrice * 0.6);
                        }
                        itemExpense = Math.round(baseCostPrice * multiplier * item.qty);
                    } else {
                        if (item.costPrice !== undefined) {
                            baseCostPrice = item.costPrice;
                        } else if (item.price) {
                            baseCostPrice = Math.round(item.price * 0.6);
                        }
                        itemExpense = Math.round(baseCostPrice * item.qty);
                    }
                    
                    weeks[weekStr].expenses += itemExpense;
                    
                    if (!weeks[weekStr].products[item.id]) {
                        weeks[weekStr].products[item.id] = {
                            id: item.id,
                            name: item.name,
                            qty: 0,
                            unit: prod ? prod.unit : 'unit',
                            price: prod ? (prod.pricePerUnit || parseInt((prod.price || '0').replace(/[^\d]/g, ''))) : item.price,
                            costPrice: baseCostPrice,
                            totalSales: 0,
                            totalExpense: 0
                        };
                    }
                    
                    weeks[weekStr].products[item.id].qty += (item.qty * multiplier);
                    weeks[weekStr].products[item.id].totalSales += item.total || (item.price * item.qty);
                    weeks[weekStr].products[item.id].totalExpense += itemExpense;
                });
            }
        });
        
        // Calculate All-Time stats
        let allTimeSales = 0;
        let allTimeExpense = 0;
        
        Object.values(weeks).forEach(w => {
            allTimeSales += w.grossSales;
            allTimeExpense += w.expenses;
        });
        
        const allTimeProfit = allTimeSales - allTimeExpense;
        
        document.getElementById('statsAllTimeSales').textContent = `₹${allTimeSales}`;
        document.getElementById('statsAllTimeExpense').textContent = `₹${allTimeExpense}`;
        
        const profitEl = document.getElementById('statsAllTimeProfit');
        profitEl.textContent = `₹${Math.abs(allTimeProfit)}`;
        if (allTimeProfit >= 0) {
            profitEl.style.color = 'var(--primary-color)';
            profitEl.parentElement.querySelector('.stat-label').textContent = 'All-Time Profit';
        } else {
            profitEl.style.color = '#d32f2f';
            profitEl.parentElement.querySelector('.stat-label').textContent = 'All-Time Loss';
        }
        
        // Render week-wise table
        const tbody = document.getElementById('statsWeekBreakdownList');
        if (!tbody) return;
        tbody.innerHTML = '';
        
        const sortedWeekKeys = Object.keys(weeks).sort((a, b) => {
            const parseDate = (wStr) => {
                const parts = wStr.split(' - ');
                return new Date(parts[0] + `, ${new Date().getFullYear()}`);
            };
            return parseDate(b) - parseDate(a);
        });
        
        if (sortedWeekKeys.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; color: #888; padding: 20px;">
                        No orders recorded yet.
                    </td>
                </tr>
            `;
            return;
        }
        
        window.statsWeeksData = weeks;
        
        sortedWeekKeys.forEach(wKey => {
            const w = weeks[wKey];
            const tr = document.createElement('tr');
            const profit = w.grossSales - w.expenses;
            const profitStyle = profit >= 0 ? 'color: var(--primary-color); font-weight: 700;' : 'color: #d32f2f; font-weight: 700;';
            const profitLabel = profit >= 0 ? `₹${profit}` : `-₹${Math.abs(profit)}`;
            
            const isCurrentWeek = w.weekStr === getWeekRangeString(new Date().toISOString());
            const isCompleted = isWeekLocked(w.weekStr, leads);
            
            let statusBadgeHtml = '';
            if (isCurrentWeek) {
                statusBadgeHtml = `<span style="display: inline-block; background: rgba(46,125,50,0.1); color: var(--primary-color); border: 1px solid rgba(46,125,50,0.2); padding: 2px 6px; border-radius: 8px; font-size: 0.7rem; font-weight: 600; margin-left: 8px;">Present</span>`;
            } else if (isCompleted) {
                statusBadgeHtml = `<span style="display: inline-block; background: #e0e0e0; color: #666; border: 1px solid #ccc; padding: 2px 6px; border-radius: 8px; font-size: 0.7rem; font-weight: 600; margin-left: 8px;"><i class="fa-solid fa-lock" style="font-size: 0.65rem;"></i> Locked</span>`;
            } else {
                statusBadgeHtml = `<span style="display: inline-block; background: rgba(245,124,0,0.1); color: var(--accent-color); border: 1px solid rgba(245,124,0,0.2); padding: 2px 6px; border-radius: 8px; font-size: 0.7rem; font-weight: 600; margin-left: 8px;">Incomplete</span>`;
            }
            
            const clearBtnHtml = isCompleted
                ? `<button class="btn btn-secondary" disabled style="padding: 6px 12px; font-size: 0.8rem; border-radius: 12px; opacity: 0.5; cursor: not-allowed; margin-left: 5px;" title="Completed weeks are locked">
                       <i class="fa-solid fa-lock"></i> Clear
                   </button>`
                : `<button class="btn btn-secondary" onclick="clearWeekOrders('${w.weekStr}')" style="padding: 6px 12px; font-size: 0.8rem; border-radius: 12px; border: 1.5px solid #d32f2f; color: #d32f2f; background: transparent; margin-left: 5px;">
                       <i class="fa-solid fa-trash-can"></i> Clear
                   </button>`;
            
            tr.innerHTML = `
                <td style="font-weight: 600; color: var(--text-dark);">${w.weekStr}${statusBadgeHtml}</td>
                <td>${w.orders.length}</td>
                <td><strong>₹${w.grossSales}</strong></td>
                <td>₹${w.expenses}</td>
                <td style="${profitStyle}">${profitLabel}</td>
                <td>
                    <div style="display: flex; gap: 5px;">
                        <button class="btn btn-secondary" onclick="viewWeekDetails('${wKey}')" style="padding: 6px 12px; font-size: 0.8rem; border-radius: 12px;">
                            <i class="fa-solid fa-magnifying-glass-chart"></i> Details
                        </button>
                        ${clearBtnHtml}
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    });
}

function viewWeekDetails(weekKey) {
    const container = document.getElementById('weekDetailsContainer');
    const title = document.getElementById('weekDetailsTitle');
    const tbody = document.getElementById('weekDetailsProductsList');
    
    if (!container || !title || !tbody || !window.statsWeeksData) return;
    
    const wData = window.statsWeeksData[weekKey];
    if (!wData) return;
    
    title.textContent = `Product Sales & Profits Breakdown: Week of ${weekKey}`;
    tbody.innerHTML = '';
    
    const pKeys = Object.keys(wData.products);
    if (pKeys.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; color: #888; padding: 20px;">
                    No products sold in this week.
                </td>
            </tr>
        `;
        container.style.display = 'block';
        container.scrollIntoView({ behavior: 'smooth' });
        return;
    }
    
    pKeys.forEach(pId => {
        const pObj = wData.products[pId];
        const prod = products.find(p => p.id === parseInt(pId));
        
        let displayName = pObj.name;
        let displayUnit = pObj.unit;
        if (prod) {
            const translatedProd = getTranslatedProduct(prod);
            displayName = translatedProd.name;
            displayUnit = translatedProd.unit;
        }
        
        const tr = document.createElement('tr');
        
        const netProfit = pObj.totalSales - pObj.totalExpense;
        const profitStyle = netProfit >= 0 ? 'color: var(--primary-color); font-weight: 600;' : 'color: #d32f2f; font-weight: 600;';
        const profitLabel = netProfit >= 0 ? `₹${netProfit}` : `-₹${Math.abs(netProfit)}`;
        const formattedQty = Math.round(pObj.qty * 100) / 100;
        
        tr.innerHTML = `
            <td style="font-weight: 600; color: var(--text-dark);">${displayName}</td>
            <td>${formattedQty} ${displayUnit}</td>
            <td>₹${pObj.price}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 5px;">
                    <input type="number" id="inputWeekCost_${weekKey}_${pId}" value="${pObj.costPrice}" min="0" style="width: 60px; padding: 4px; border: 1px solid #ccc; border-radius: 4px;">
                    <button class="btn btn-primary" onclick="saveWeekProductCost('${weekKey}', ${pId}, this)" style="padding: 4px 8px; font-size: 0.75rem; border-radius: 8px;" title="Save for this week only">
                        <i class="fa-solid fa-check"></i>
                    </button>
                </div>
            </td>
            <td><strong>₹${pObj.totalSales}</strong></td>
            <td>₹${pObj.totalExpense}</td>
            <td style="${profitStyle}">${profitLabel}</td>
        `;
        tbody.appendChild(tr);
    });
    
    // Calculate and render weekly summary cards
    let pSales = 0;
    let pExpenses = 0;
    Object.values(wData.products).forEach(prod => {
        pSales += prod.totalSales;
        pExpenses += prod.totalExpense;
    });
    const totalDiscount = wData.totalDiscount || 0;
    const totalDeliveryCharge = wData.totalDeliveryCharge || 0;
    const netProfit = wData.grossSales - wData.expenses;
    
    const summaryContainer = document.getElementById('weekDetailsSummary');
    if (summaryContainer) {
        const netProfitStyle = netProfit >= 0 ? 'color: var(--primary-color); font-weight: 700;' : 'color: #d32f2f; font-weight: 700;';
        const netProfitLabel = netProfit >= 0 ? `₹${netProfit}` : `-₹${Math.abs(netProfit)}`;
        
        summaryContainer.innerHTML = `
            <div style="text-align: center; border-right: 1px solid #eee; padding: 10px;">
                <div style="font-size: 0.75rem; color: #888; text-transform: uppercase; font-weight: 600;">Products Subtotal</div>
                <div style="font-size: 1.1rem; font-weight: 700; color: var(--text-dark); margin-top: 5px;">₹${pSales}</div>
            </div>
            <div style="text-align: center; border-right: 1px solid #eee; padding: 10px;">
                <div style="font-size: 0.75rem; color: #888; text-transform: uppercase; font-weight: 600;">Product Expenses</div>
                <div style="font-size: 1.1rem; font-weight: 700; color: var(--text-dark); margin-top: 5px;">₹${pExpenses}</div>
            </div>
            <div style="text-align: center; border-right: 1px solid #eee; padding: 10px;">
                <div style="font-size: 0.75rem; color: #888; text-transform: uppercase; font-weight: 600;">Total Discounts</div>
                <div style="font-size: 1.1rem; font-weight: 700; color: #d32f2f; margin-top: 5px;">-₹${totalDiscount}</div>
            </div>
            <div style="text-align: center; border-right: 1px solid #eee; padding: 10px;">
                <div style="font-size: 0.75rem; color: #888; text-transform: uppercase; font-weight: 600;">Delivery Charges</div>
                <div style="font-size: 1.1rem; font-weight: 700; color: var(--text-dark); margin-top: 5px;">+₹${totalDeliveryCharge}</div>
            </div>
            <div style="text-align: center; padding: 10px;">
                <div style="font-size: 0.75rem; color: #888; text-transform: uppercase; font-weight: 600;">Weekly Net Profit</div>
                <div style="font-size: 1.15rem; margin-top: 5px; ${netProfitStyle}">${netProfitLabel}</div>
            </div>
        `;
    }
    
    container.style.display = 'block';
    container.scrollIntoView({ behavior: 'smooth' });
}

function saveWeekProductCost(weekKey, productId, btnEl) {
    const input = document.getElementById(`inputWeekCost_${weekKey}_${productId}`);
    if (!input) return;
    const newCost = parseInt(input.value) || 0;
    
    fetchAllLeads().then((leads) => {
        const weekOrders = leads.filter(l => l.type === 'order' && getWeekRangeString(l.timestamp) === weekKey);
        const ordersToUpdate = weekOrders.filter(o => o.items && o.items.some(item => item.id === productId));
        
        if (ordersToUpdate.length === 0) {
            alert("No orders containing this product found in this week.");
            return;
        }
        
        ordersToUpdate.forEach(o => {
            o.items.forEach(item => {
                if (item.id === productId) {
                    item.costPrice = newCost;
                }
            });
        });
        
        if (useFirebase && db) {
            const batch = db.batch();
            ordersToUpdate.forEach(o => {
                batch.set(db.collection("leads").doc(o.id), o);
            });
            batch.commit().then(() => {
                console.log(`Updated week product cost for product ID ${productId} in week ${weekKey}`);
                refreshAfterWeekCostUpdate(weekKey, btnEl);
            }).catch(err => console.error("Firestore batch update week product cost failed:", err));
        } else {
            let allLeads = [];
            const localLeads = localStorage.getItem('kshetriva_leads');
            if (localLeads) {
                try {
                    allLeads = JSON.parse(localLeads);
                } catch (e) {}
            }
            ordersToUpdate.forEach(updatedOrder => {
                const idx = allLeads.findIndex(l => l.id === updatedOrder.id);
                if (idx !== -1) {
                    allLeads[idx] = updatedOrder;
                }
            });
            localStorage.setItem('kshetriva_leads', JSON.stringify(allLeads));
            refreshAfterWeekCostUpdate(weekKey, btnEl);
        }
    });
}

function refreshAfterWeekCostUpdate(weekKey, btnEl) {
    if (btnEl) {
        const originalContent = btnEl.innerHTML;
        btnEl.innerHTML = `<i class="fa-solid fa-circle-check"></i>`;
        btnEl.style.backgroundColor = "#2e7d32";
        btnEl.style.borderColor = "#2e7d32";
        btnEl.disabled = true;
        setTimeout(() => {
            btnEl.innerHTML = originalContent;
            btnEl.style.backgroundColor = "";
            btnEl.style.borderColor = "";
            btnEl.disabled = false;
        }, 1000);
    }
    renderCompanyAnalytics();
    setTimeout(() => {
        viewWeekDetails(weekKey);
    }, 300);
}

function closeWeekDetails() {
    const container = document.getElementById('weekDetailsContainer');
    if (container) container.style.display = 'none';
}

function renderProductCostManagement() {
    const list = document.getElementById('statsCostManagementList');
    if (!list) return;
    list.innerHTML = '';
    
    products.forEach(p => {
        const tr = document.createElement('tr');
        const costPrice = p.costPrice !== undefined ? p.costPrice : Math.round(p.pricePerUnit * 0.6);
        
        tr.innerHTML = `
            <td><img src="${p.image}" alt="${p.name}" class="admin-table-img" width="40" height="40"></td>
            <td>
                <div class="admin-table-title">${p.name}</div>
                <div class="admin-table-subtitle">ID: ${p.id} | ${p.category}</div>
            </td>
            <td>${p.unit}</td>
            <td><strong>${p.price}</strong> (${p.pricePerUnit})</td>
            <td>
                <input type="number" id="inputCost_${p.id}" value="${costPrice}" min="0" class="order-qty-input" style="width: 80px; padding: 6px;">
            </td>
            <td>
                <button class="btn btn-primary" onclick="saveProductCostPrice(this, '${p.docId || ''}', ${p.id})" style="padding: 6px 12px; font-size: 0.8rem; border-radius: 12px; transition: all 0.2s ease;">
                    <i class="fa-solid fa-check"></i> Save
                </button>
            </td>
        `;
        list.appendChild(tr);
    });
}

function saveProductCostPrice(btnEl, docId, id) {
    const input = document.getElementById(`inputCost_${id}`);
    if (!input) return;
    const costVal = parseInt(input.value) || 0;
    
    const showTemporarySuccess = () => {
        if (btnEl) {
            const originalContent = btnEl.innerHTML;
            btnEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> Saved`;
            btnEl.style.backgroundColor = "#2e7d32";
            btnEl.style.borderColor = "#2e7d32";
            btnEl.disabled = true;
            setTimeout(() => {
                btnEl.innerHTML = originalContent;
                btnEl.style.backgroundColor = "";
                btnEl.style.borderColor = "";
                btnEl.disabled = false;
            }, 1500);
        }
    };
    
    if (useFirebase && db && docId) {
        db.collection("products").doc(docId).update({
            costPrice: costVal
        }).then(() => {
            console.log(`Cost price for product ID ${id} saved to Firestore: ₹${costVal}`);
            const product = products.find(p => p.id === id);
            if (product) product.costPrice = costVal;
            showTemporarySuccess();
        }).catch(err => {
            console.error("Firestore product cost update error:", err);
            alert("Failed to save to dynamic database.");
        });
    } else {
        const product = products.find(p => p.id === id);
        if (product) {
            product.costPrice = costVal;
            saveProductsLocal();
            showTemporarySuccess();
        }
    }
}



/* ==========================================================================
   Application Boot Initialization
   ========================================================================== */

loadCart();
loadManualWindowState();
applyLanguage();
initCouponLogic();
updateCartUI();
renderProducts();
checkHashRoute();
updateOrderingWindowBanner();

// Refresh ordering window countdown every 60 seconds
setInterval(() => {
    updateOrderingWindowBanner();
    updateCartUI(); // re-check window status in cart
}, 60000);

// Initialize Cart Recovery Toast event bindings
function initCartRecovery() {
    const draft = localStorage.getItem('kshetriva_cart_draft');
    const toast = document.getElementById('cartRecoveryToast');
    const resumeBtn = document.getElementById('recoveryResumeBtn');
    const clearBtn = document.getElementById('recoveryClearBtn');

    if (draft && toast) {
        // Show the toast visual overlay after a 1.5s delay to let the page settle beautifully
        setTimeout(() => {
            toast.classList.add('show');
            trackGA4Event('cart_recovery_prompt_displayed');
        }, 1500);

        if (resumeBtn) {
            resumeBtn.addEventListener('click', () => {
                try {
                    cart = JSON.parse(draft);
                    saveCart();
                    updateCartUI();
                    renderProducts();
                    localStorage.removeItem('kshetriva_cart_draft');
                    toast.classList.remove('show');
                    trackGA4Event('cart_recovered', { items_count: Object.keys(cart).length });
                } catch (e) {
                    console.error("Cart recovery failed:", e);
                }
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                localStorage.removeItem('kshetriva_cart_draft');
                localStorage.removeItem('kshetriva_cart');
                toast.classList.remove('show');
                trackGA4Event('cart_recovery_cleared');
            });
        }
    }
}

// Force Hero Video to Autoplay overriding aggressive browser autoplay block policies
document.addEventListener('DOMContentLoaded', () => {
    const heroVideo = document.querySelector('.hero-video');
    if (heroVideo) {
        heroVideo.muted = true;
        heroVideo.play().catch(err => {
            console.warn("Browser autoplay restrictions prevented video playback. Retrying...", err);
        });
    }

    // Boot PWA cart recovery logic
    initCartRecovery();

    // Farmer spotlight analytics tracking
    const farmerCards = document.querySelectorAll('.farmer-card');
    farmerCards.forEach(card => {
        card.addEventListener('click', () => {
            const nameEl = card.querySelector('h4');
            const farmerName = nameEl ? nameEl.textContent : 'Unknown Farmer';
            trackGA4Event('farmer_bio_expanded', {
                farmer_name: farmerName,
                language: currentLang
            });
        });
    });
});

// ==========================================================================
// Phase 3: Interactive Order Progress Tracking Portal logic
// ==========================================================================

function openTrackOrderModal(e) {
    if (e) e.preventDefault();
    const modal = document.getElementById('trackOrderModal');
    if (modal) {
        modal.classList.add('open');
        
        // Auto pre-populate with user's most recent order code if exists
        const myOrders = JSON.parse(localStorage.getItem('kshetriva_my_orders') || '[]');
        if (myOrders.length > 0) {
            document.getElementById('trackInput').value = myOrders[myOrders.length - 1];
            trackOrderQuery(); // Auto search
        }
        document.getElementById('trackInput').focus();
    }
}

function closeTrackOrderModal() {
    const modal = document.getElementById('trackOrderModal');
    if (modal) {
        modal.classList.remove('open');
    }
    // Unsubscribe from active real-time queries to save resources
    if (typeof activeTrackListener === 'function') {
        activeTrackListener();
        activeTrackListener = null;
    }
}

function trackOrderQuery() {
    const inputVal = document.getElementById('trackInput').value.trim();
    const errorEl = document.getElementById('trackErrorMsg');
    const containerEl = document.getElementById('trackResultContainer');
    if (!inputVal) return;

    errorEl.style.display = 'none';

    // Unsubscribe previous tracking listener
    if (typeof activeTrackListener === 'function') {
        activeTrackListener();
        activeTrackListener = null;
    }

    if (useFirebase && db) {
        // Query live Firestore document with active snapshot listener
        activeTrackListener = db.collection("orders").doc(inputVal).onSnapshot((doc) => {
            if (doc.exists) {
                renderTimelineProgress(doc.data());
            } else {
                containerEl.style.display = 'none';
                errorEl.style.display = 'block';
            }
        }, (error) => {
            console.error("Firestore tracking listener exception:", error);
            errorEl.style.display = 'block';
        });
    } else {
        // Offline sandbox local storage tracker query
        const queryLocal = () => {
            const localOrders = JSON.parse(localStorage.getItem('kshetriva_mithra_orders') || '[]');
            const order = localOrders.find(o => o.id === inputVal);
            if (order) {
                renderTimelineProgress(order);
            } else {
                containerEl.style.display = 'none';
                errorEl.style.display = 'block';
            }
        };

        queryLocal();

        // Listen for storage updates in local fallback mode
        const onLocalStorageUpdate = (e) => {
            if (e.key === 'kshetriva_mithra_orders_update' || e.key === 'kshetriva_mithra_orders') {
                queryLocal();
            }
        };
        window.addEventListener('storage', onLocalStorageUpdate);

        activeTrackListener = () => {
            window.removeEventListener('storage', onLocalStorageUpdate);
        };
    }
}

function renderTimelineProgress(order) {
    const containerEl = document.getElementById('trackResultContainer');
    const resultIdEl = document.getElementById('trackResultId');
    const resultDateEl = document.getElementById('trackResultDate');
    const resultTotalEl = document.getElementById('trackResultTotal');
    const fillEl = document.getElementById('timelineFill');

    resultIdEl.textContent = order.id;
    resultDateEl.textContent = order.date;
    resultTotalEl.textContent = `₹${order.totalSum}`;

    containerEl.style.display = 'block';

    const steps = ['harvesting', 'packed', 'delivery', 'delivered'];
    const currentStatus = order.status || 'harvesting';
    const activeIndex = steps.indexOf(currentStatus);

    steps.forEach((step, idx) => {
        const stepEl = document.getElementById(`step-${step}`);
        if (stepEl) {
            stepEl.classList.remove('completed', 'active');
            if (idx < activeIndex) {
                stepEl.classList.add('completed');
            } else if (idx === activeIndex) {
                stepEl.classList.add('active');
            }
        }
    });

    // Calculate progress line percentage fill
    let fillPct = 0;
    if (activeIndex > 0) {
        fillPct = (activeIndex / (steps.length - 1)) * 100;
    }

    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
        fillEl.style.width = '4px';
        fillEl.style.height = `${fillPct}%`;
    } else {
        fillEl.style.height = '4px';
        fillEl.style.width = `${fillPct}%`;
    }
}
