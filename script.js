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
    closeHour: 13,   // 1:00 PM
    deliveryDay: 0   // Sunday
};

// ===== Phase 1: Minimum Order =====
const MINIMUM_ORDER = 0; // Removed/disabled (changed from 199)

// Mock / Initial Products Data (Acts as default catalog and local fallback db)
let products = [
    {
        id: 1,
        name: "Spinach (Palak)",
        category: "leafy",
        type: "leafy",
        price: "₹20",
        pricePerUnit: 20,
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
        unit: "kg",
        image: "images/tomatoes.webp",
        inStock: true,
        badge: "fresh_harvest"
    },
    {
        id: 4,
        name: "Alphonso Mangoes",
        category: "fruits",
        type: "premium",
        price: "₹400",
        pricePerUnit: 400,
        unit: "dozen",
        image: "images/mangoes.webp",
        inStock: true,
        badge: "farmer_pick"
    },
    {
        id: 5,
        name: "Cabbage",
        category: "leafy",
        type: "premium",
        price: "₹30",
        pricePerUnit: 30,
        unit: "pc",
        image: "images/cabbage.webp",
        inStock: true,
        badge: ""
    },
    {
        id: 6,
        name: "Potatoes (Aloo)",
        category: "root",
        type: "regular",
        price: "₹30",
        pricePerUnit: 30,
        unit: "kg",
        image: "images/potatoes.webp",
        inStock: true,
        badge: ""
    },
    {
        id: 7,
        name: "Coriander (Kothmir)",
        category: "leafy",
        type: "leafy",
        price: "₹15",
        pricePerUnit: 15,
        unit: "bunch",
        image: "images/coriander.webp",
        inStock: true,
        badge: "fresh_harvest"
    },
    {
        id: 8,
        name: "Lady Finger (Bhindi)",
        category: "vegetables",
        type: "regular",
        price: "₹60",
        pricePerUnit: 60,
        unit: "kg",
        image: "images/lady_finger.webp",
        inStock: true,
        badge: ""
    },
    {
        id: 9,
        name: "Bottle Gourd (Lauki)",
        category: "vegetables",
        type: "premium",
        price: "₹40",
        pricePerUnit: 40,
        unit: "pc",
        image: "images/bottle_gourd.webp",
        inStock: true,
        badge: "limited"
    }
];

// Initialize Firebase dynamically
try {
    if (typeof firebase !== 'undefined' && firebaseConfig.apiKey !== "YOUR_API_KEY") {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        auth = firebase.auth();
        useFirebase = true;
        console.log("🌾 Kshetriva Farms: Live Firebase Backend Connected successfully.");
    } else {
        console.log("🌾 Kshetriva Farms: Running in Local Fallback Database mode. Setup Firebase credentials to sync live online.");
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
        bannerLiveTitle: "Order by Saturday 1 PM",
        bannerLiveSubtext: "For Sunday delivery (Fresh from farm directly to your home)",
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
        waPayment: "Cash on Delivery"
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

        bannerLiveTitle: "శనివారం 1 PM లోపు ఆర్డర్ చేయండి",
        bannerLiveSubtext: "ఆదివారం డెలివరీ కోసం (పొలం నుండి నేరుగా మీ ఇంటికి)",
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
        waPayment: "క్యాష్ ఆన్ డెలివరీ"
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
        const selectedOpt = cartItem ? cartItem.optionValue : qtyOptions[0].value;
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
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    const { openDay, openHour, closeDay, closeHour } = ORDERING_SCHEDULE;

    if (day === openDay && hour >= openHour) return true;
    if (day === closeDay && hour < closeHour) return true;
    return false;
}

function getWindowCountdown() {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    const { openDay, openHour, closeDay, closeHour } = ORDERING_SCHEDULE;
    const isOpen = isOrderingWindowOpen();

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
    if (cartDeliveryRow) {
        cartDeliveryRow.style.display = 'flex';
        const deliveryLabelEl = document.getElementById('deliveryLabel');
        const cartDeliverySumEl = document.getElementById('cartDeliverySum');
        if (deliveryLabelEl) {
            deliveryLabelEl.textContent = dict.deliveryLabel || 'Delivery Charges:';
        }
        if (cartDeliverySumEl) {
            cartDeliverySumEl.innerHTML = `<del style="color: #888; margin-right: 5px;">₹69</del> <span style="color: #2e7d32; font-weight: 600;">₹49</span>`;
        }
    }

    const itemsTotal = finalTotal;
    finalTotal = itemsTotal + 49;
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
function sendCartWhatsAppOrder() {
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

    const deliveryCharge = 49;
    let finalTotal = subtotal;

    if (currentTier) {
        const discountAmt = Math.round(subtotal * currentTier.discount * 100) / 100;
        const itemsTotal = Math.round((subtotal - discountAmt) * 100) / 100;
        finalTotal = itemsTotal + deliveryCharge;
        const pctLabel = Math.round(currentTier.discount * 100);
        message += isTe ? `ఉప మొత్తం: ₹${subtotal}\n` : `Subtotal: ₹${subtotal}\n`;
        message += isTe ? `బాస్కెట్ తగ్గింపు (${pctLabel}%): -₹${discountAmt}\n` : `Basket Discount (${pctLabel}%): -₹${discountAmt}\n`;
        message += isTe ? `డెలివరీ ఛార్జీలు: ~₹69~ ₹${deliveryCharge}\n` : `Delivery Charges: ~₹69~ ₹${deliveryCharge}\n`;
        message += isTe ? `*మొత్తం: ₹${finalTotal}*\n\n` : `*Total: ₹${finalTotal}*\n\n`;
    } else {
        finalTotal = subtotal + deliveryCharge;
        message += isTe ? `ఉప మొత్తం: ₹${subtotal}\n` : `Subtotal: ₹${subtotal}\n`;
        message += isTe ? `డెలివరీ ఛార్జీలు: ~₹69~ ₹${deliveryCharge}\n` : `Delivery Charges: ~₹69~ ₹${deliveryCharge}\n`;
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
whatsappOrderBtn.addEventListener('click', sendCartWhatsAppOrder);

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
            unit: "bunch",
            image: "images/spinach.webp",
            inStock: true,
            badge: "fresh_harvest"
        },
        {
            id: 2,
            name: "Carrots",
            category: "root",
            type: "regular",
            price: "₹60",
            pricePerUnit: 60,
            unit: "kg",
            image: "images/carrots.webp",
            inStock: true,
            badge: ""
        },
        {
            id: 3,
            name: "Red Tomatoes",
            category: "vegetables",
            type: "regular",
            price: "₹50",
            pricePerUnit: 50,
            unit: "kg",
            image: "images/tomatoes.webp",
            inStock: true,
            badge: "fresh_harvest"
        },
        {
            id: 4,
            name: "Alphonso Mangoes",
            category: "fruits",
            type: "premium",
            price: "₹400",
            pricePerUnit: 400,
            unit: "dozen",
            image: "images/mangoes.webp",
            inStock: true,
            badge: "farmer_pick"
        },
        {
            id: 5,
            name: "Cabbage",
            category: "leafy",
            type: "premium",
            price: "₹30",
            pricePerUnit: 30,
            unit: "pc",
            image: "images/cabbage.webp",
            inStock: true,
            badge: ""
        },
        {
            id: 6,
            name: "Potatoes (Aloo)",
            category: "root",
            type: "regular",
            price: "₹30",
            pricePerUnit: 30,
            unit: "kg",
            image: "images/potatoes.webp",
            inStock: true,
            badge: ""
        },
        {
            id: 7,
            name: "Coriander (Kothmir)",
            category: "leafy",
            type: "leafy",
            price: "₹15",
            pricePerUnit: 15,
            unit: "bunch",
            image: "images/coriander.webp",
            inStock: true,
            badge: "fresh_harvest"
        },
        {
            id: 8,
            name: "Lady Finger (Bhindi)",
            category: "vegetables",
            type: "regular",
            price: "₹60",
            pricePerUnit: 60,
            unit: "kg",
            image: "images/lady_finger.webp",
            inStock: true,
            badge: ""
        },
        {
            id: 9,
            name: "Bottle Gourd (Lauki)",
            category: "vegetables",
            type: "premium",
            price: "₹40",
            pricePerUnit: 40,
            unit: "pc",
            image: "images/bottle_gourd.webp",
            inStock: true,
            badge: "limited"
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
}

function closeAdminLogin() {
    document.getElementById('adminLoginModal').classList.remove('open');
}

function openAdminDashboard() {
    document.getElementById('adminLoginModal').classList.remove('open');
    document.getElementById('adminDashboardOverlay').classList.add('open');
    renderAdminProducts();
    updateAdminStats();
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

    if (!totalEl || !inStockEl || !outStockEl) return;

    const total = products.length;
    const inStock = products.filter(p => p.inStock !== false).length;
    const outStock = total - inStock;

    totalEl.textContent = total;
    inStockEl.textContent = inStock;
    outStockEl.textContent = outStock;
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

    const priceNum = parseInt(product.price.replace(/[^\d]/g, ''));
    document.getElementById('prodPrice').value = priceNum;
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
    
    // Clean and validate GitHub image URLs if inputted
    const rawImageUrl = document.getElementById('prodImageUrl').value;
    const imageUrl = cleanGitHubImageUrl(rawImageUrl);
    document.getElementById('prodImageUrl').value = imageUrl;
    
    const inStock = document.getElementById('prodInStock').checked;

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
                    image: imageUrl,
                    inStock: inStock
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
                image: imageUrl,
                inStock: inStock
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
                    image: imageUrl,
                    inStock: inStock
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
                image: imageUrl,
                inStock: inStock
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


/* ==========================================================================
   Application Boot Initialization
   ========================================================================== */

loadCart();
applyLanguage();
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
