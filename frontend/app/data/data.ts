import {
  BannerItem,
  Product,
  OfferCard,
  TrendingProduct,
  SlideItem,
  FAQItem,
  CategoryItem,
  SlideData,
  mobileBannerImage,
} from "../types/types";

import joystic from "../../public/images/joystic.png";
import headphonepng from "../../public/images/headphone.png";
import headphone from "../../public/images/headphone.jpg";
import airbuds from "../../public/images/airbuds.jpg";
import iwatch from "../../public/images/iwach.png";
import macb from "../../public/images/macb.png";
import iphone13 from "../../public/images/iphone13.png"; // Kept for image references if needed
import bsspeaker from "../../public/images/bspeaker.png";

import nbg from "../../public/images/nbg.png";
import headphoneNew from "../../public/images/headphonenew.png";
import gamejoysticnew from "../../public/images/gamejoysticnew.png";
import airbudsnew from "../../public/images/airbudsnew.png";
import headphone123 from "../../public/images/HeadphoneNew@.png";
import banner1 from "../../public/images/banner1.png";
import banner2 from "../../public/images/banner2.png";
import banner3 from "../../public/images/banner3.png";

import baby from "../../public/images/category/babby.png"
import gadget from "../../public/images/category/gadgets.png"
import gaming from "../../public/images/category/gamming-accessories.png"
import kitchen from "../../public/images/category/home-applience.png"
import perfume from "../../public/images/category/perfum.png"
import toy from "../../public/images/category/toys.png"

// ───────────────────────────────────────────────────────── 
// Products (Gaggets/Wearables/Laptops/etc. No Mobiles!)
// ─────────────────────────────────────────────────────────
const products: Product[] = [
  {
    id: 1,
    category: "gadgets-electronics",
    title: "DJI Mini 4 Pro Drone Flight Combo - 4K HDR Camera",
    image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=800&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=800&auto=format&fit=crop"],
    price: "QAR 759.99",
    oldPrice: "QAR 999.99",
    badge: "-24%",
    badgeColor: "bg-blue-600",
    buttonText: "ADD TO CART",
    rating: 5,
    reviewCount: 341,
    stock: 8,
    description:
      "The DJI Mini 4 Pro is our most advanced mini-camera drone to date. It integrates powerful imaging capabilities, omnidirectional obstacle sensing, ActiveTrack 360° with the new Trace Mode, and 20km FHD video transmission.",
    specs: [
      { label: "Takeoff Weight", value: "< 249 g" },
      { label: "Max Flight Time", value: "34 mins (Standard)" },
      { label: "Camera Sensor", value: "1/1.3-inch CMOS, 48MP" },
      { label: "Video Resolution", value: "4K/60fps HDR" },
      { label: "Sensing Type", value: "Omnidirectional Obstacle Sensing" },
      { label: "Transmission Range", value: "20 km (O4)" },
    ],
    colors: [
      { name: "Arctic Gray", hex: "#d1d5db" },
      { name: "Midnight Black", hex: "#111827" },
    ],
    storageOptions: [
      { label: "64GB", value: "64gb" },
      { label: "256GB", value: "256gb" },
    ],
    reviews: [
      {
        id: 1,
        author: "Saeed Al-Kuwari",
        avatar: "SA",
        rating: 5,
        date: "May 15, 2026",
        title: "Incredible flight stability",
        body: "Absolute beast of a mini drone. Wind resistance is amazing and the camera output is gorgeous.",
        verified: true,
      },
    ],
  },
  {
    id: 2,
    category: "gadgets-electronics",
    title: "Meta Quest 3 128GB VR Headset - Mixed Reality",
    image: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?q=80&w=800&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?q=80&w=800&auto=format&fit=crop"],
    price: "QAR 499.00",
    oldPrice: "QAR 599.00",
    badge: "-16%",
    badgeColor: "bg-blue-600",
    buttonText: "ADD TO CART",
    rating: 4,
    reviewCount: 198,
    stock: 12,
    description:
      "Breakthrough mixed reality. Transform your home into a virtual playground where virtual elements blend into your physical space. Powerful performance with twice the graphics processing power of Quest 2.",
    specs: [
      { label: "Display Resolution", value: "2064x2208 pixels per eye" },
      { label: "Refresh Rate", value: "90Hz, 120Hz experimental" },
      { label: "Processor", value: "Snapdragon XR2 Gen 2" },
      { label: "Storage", value: "128GB / 512GB" },
      { label: "Mixed Reality", value: "2 RGB Cameras (Passthrough)" },
      { label: "Audio", value: "Integrated 3D spatial audio" },
    ],
    colors: [{ name: "Classic White", hex: "#f3f4f6" }],
    storageOptions: [
      { label: "128GB", value: "128gb" },
      { label: "512GB", value: "512gb" },
    ],
    reviews: [],
  },
  {
    id: 3,
    category: "gadgets-electronics",
    title: "Apple Watch Ultra 2 GPS + Cellular Titanium",
    image: iwatch,
    images: [iwatch, iwatch],
    price: "QAR 799.00",
    oldPrice: "QAR 899.00",
    badge: "-11%",
    badgeColor: "bg-blue-600",
    buttonText: "ADD TO CART",
    rating: 5,
    reviewCount: 112,
    stock: 5,
    description:
      "The ultimate sports and adventure watch. Featuring a lightweight titanium case, extra-long battery life, and the brightest Always-On Retina display ever.",
    specs: [
      { label: "Case Size", value: "49mm Grade 5 Titanium" },
      { label: "Water Resistance", value: "100m (WR100)" },
      { label: "Battery Life", value: "Up to 36 hours (Normal Use)" },
      { label: "Display Brightness", value: "3000 nits peak" },
      { label: "Connectivity", value: "GPS + Cellular" },
    ],
    colors: [
      { name: "Natural Titanium", hex: "#c8b9a3" },
      { name: "Ocean Band Blue", hex: "#1d4ed8" },
    ],
    storageOptions: [{ label: "64GB", value: "64gb" }],
    reviews: [],
  },
  {
    id: 4,
    category: "gaming-accessories",
    title: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
    image: headphone123,
    images: [headphone123, headphoneNew],
    price: "QAR 348.00",
    oldPrice: "QAR 399.00",
    badge: "-12%",
    badgeColor: "bg-blue-600",
    buttonText: "ADD TO CART",
    rating: 5,
    reviewCount: 423,
    stock: 15,
    description:
      "Sony WH-1000XM5 redefine distraction-free listening. Two processors control 8 microphones for unprecedented noise cancelling quality and exceptional call performance.",
    specs: [
      { label: "Driver Unit", value: "30mm Dome Type" },
      { label: "Battery Life", value: "Up to 30 hours (ANC ON)" },
      { label: "Charging Time", value: "3 mins for 3 hours playback" },
      { label: "Bluetooth Version", value: "v5.2" },
      { label: "Codec Supported", value: "SBC, AAC, LDAC" },
    ],
    colors: [
      { name: "Black", hex: "#171717" },
      { name: "Platinum Silver", hex: "#e5e5e5" },
    ],
    storageOptions: [],
    reviews: [],
  },
  {
    id: 5,
    category: "gadgets-electronics",
    title: "GoPro HERO12 Black Waterproof Action Camera",
    image: "https://images.unsplash.com/photo-1564466809058-bf4114d55352?q=80&w=800&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1564466809058-bf4114d55352?q=80&w=800&auto=format&fit=crop"],
    price: "QAR 399.00",
    oldPrice: "QAR 449.00",
    buttonText: "SELECT OPTIONS",
    rating: 4,
    reviewCount: 97,
    stock: 9,
    description:
      "Incredible image quality, even better HyperSmooth video stabilization, and a huge boost in battery performance. Takes best-in-class 5.3K video and HDR photos.",
    specs: [
      { label: "Video Resolution", value: "5.3K/60fps, 4K/120fps" },
      { label: "Photo Resolution", value: "27MP" },
      { label: "Stabilization", value: "HyperSmooth 6.0" },
      { label: "Waterproof", value: "Up to 33ft (10m) without housing" },
    ],
    colors: [{ name: "Standard Black", hex: "#1e293b" }],
    storageOptions: [{ label: "Standard", value: "standard" }],
    reviews: [],
  },
  {
    id: 6,
    category: "gadgets-electronics",
    title: "MacBook Air 15-inch M3 Chip 16GB/512GB SSD",
    image: macb,
    images: [macb, macb],
    price: "QAR 1,499.00",
    oldPrice: "QAR 1,699.00",
    badge: "-11%",
    badgeColor: "bg-blue-600",
    buttonText: "ADD TO CART",
    rating: 5,
    reviewCount: 64,
    stock: 6,
    description:
      "The 15-inch MacBook Air is superlight and fits easily in your bag. Built with the powerhouse M3 chip to handle multitasking and pro workloads easily.",
    specs: [
      { label: "Display", value: "15.3-inch Liquid Retina Display" },
      { label: "Processor", value: "Apple M3 Chip (8-core CPU, 10-core GPU)" },
      { label: "RAM", value: "16GB Unified Memory" },
      { label: "Storage", value: "512GB SSD" },
    ],
    colors: [
      { name: "Space Gray", hex: "#3a3a3c" },
      { name: "Silver", hex: "#e8e8e8" },
      { name: "Starlight", hex: "#f5e8d3" },
    ],
    storageOptions: [
      { label: "256GB", value: "256gb" },
      { label: "512GB", value: "512gb" },
    ],
    reviews: [],
  },
  {
    id: 7,
    category: "gadgets-electronics",
    title: "Anker Soundcore Motion X600 Portable Hi-Res Speaker",
    image: bsspeaker,
    images: [bsspeaker, bsspeaker],
    price: "QAR 199.99",
    oldPrice: "QAR 249.99",
    badge: "-20%",
    buttonText: "ADD TO CART",
    rating: 4,
    reviewCount: 145,
    stock: 14,
    description:
      "Inspired by theater acoustics, Motion X600 has 5 drivers and 5 amplifiers that are positioned to deliver sound all around you. Feels like you're in the room with the artist.",
    specs: [
      { label: "Audio Output", value: "50W Spatial Audio" },
      { label: "Frequency Range", value: "40Hz - 40kHz" },
      { label: "Waterproof Rating", value: "IPX7 Waterproof" },
      { label: "Playtime", value: "Up to 12 hours" },
    ],
    colors: [
      { name: "Polar Gray", hex: "#4b5563" },
      { name: "Aurora Green", hex: "#065f46" },
    ],
    storageOptions: [],
    reviews: [],
  },
  {
    id: 8,
    category: "gaming-accessories",
    title: "Xbox Series X Console 1TB Solid State Digital Drive",
    image: gamejoysticnew,
    images: [gamejoysticnew, joystic],
    price: "QAR 499.00",
    oldPrice: "QAR 549.00",
    badge: "-9%",
    badgeColor: "bg-blue-600",
    buttonText: "ADD TO CART",
    rating: 5,
    reviewCount: 302,
    stock: 4,
    description:
      "Play thousands of games from four generations of Xbox on the fastest, most powerful Xbox console ever. Experience next-gen speed with the Xbox Velocity Architecture.",
    specs: [
      { label: "Processor", value: "8x Cores @ 3.8 GHz Custom Zen 2 CPU" },
      { label: "GPU", value: "12 TFLOPS, 52 CUs @ 1.825 GHz Custom RDNA 2" },
      { label: "Memory", value: "16GB GDDR6" },
      { label: "Storage", value: "1TB Custom NVME SSD" },
    ],
    colors: [{ name: "Matte Black", hex: "#18181b" }],
    storageOptions: [],
    reviews: [],
  },
  {
    id: 9,
    category: "perfumes-buhoor",
    title: "Oud Royale Premium Concentrated Oud & Amber Perfume Oil",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=600",
    images: ["https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=600"],
    price: "QAR 89.00",
    oldPrice: "QAR 120.00",
    badge: "Oud",
    badgeColor: "bg-amber-600",
    buttonText: "ADD TO CART",
    rating: 5,
    reviewCount: 18,
    stock: 12,
    description: "Deep, rich, and mysterious concentrated perfume oil featuring high-quality Cambodian Agarwood, natural Amber, and Warm Spicy notes. Long-lasting scent projection.",
    specs: [
      { label: "Volume", value: "12 ml (1 Tola)" },
      { label: "Origin", value: "Doha, Qatar Central" },
      { label: "Concentration", value: "100% Pure Perfume Oil" }
    ],
    colors: [],
    storageOptions: []
  },
  {
    id: 10,
    category: "toys",
    title: "Interactive Islamic Learning Tablet for Kids",
    image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?q=80&w=600",
    images: ["https://images.unsplash.com/photo-1587654780291-39c9404d746b?q=80&w=600"],
    price: "QAR 49.00",
    oldPrice: "QAR 69.00",
    badge: "-28%",
    badgeColor: "bg-red-500",
    buttonText: "ADD TO CART",
    rating: 5,
    reviewCount: 22,
    stock: 25,
    description: "Fun, educational interactive tablet designed for children to learn basic short Surahs, daily Duas, Arabic alphabets, and prayer steps with crystal clear audio playback.",
    specs: [
      { label: "Age Group", value: "3+ years" },
      { label: "Language", value: "Arabic & English" },
      { label: "Power", value: "3x AAA Batteries" }
    ],
    colors: [],
    storageOptions: []
  },
  {
    id: 11,
    category: "baby-products",
    title: "Extra Thick Non-Toxic Reversible Baby Play Mat",
    image: "https://images.unsplash.com/photo-1515488042361-404e9250afef?q=80&w=600",
    images: ["https://images.unsplash.com/photo-1515488042361-404e9250afef?q=80&w=600"],
    price: "QAR 99.00",
    oldPrice: "QAR 129.00",
    badge: "Safe",
    badgeColor: "bg-teal-500",
    buttonText: "ADD TO CART",
    rating: 4.8,
    reviewCount: 31,
    stock: 10,
    description: "Constructed with premium high-density XPE foam material, fully waterproof, slip-resistant, and BPA-free. Soft cushioned structure protects baby during crawling and playing.",
    specs: [
      { label: "Size", value: "200 x 180 x 1.5 cm" },
      { label: "Material", value: "Non-toxic XPE Foam" }
    ],
    colors: [],
    storageOptions: []
  },
  {
    id: 12,
    category: "kitchen-appliances-essentials",
    title: "Smart Professional Espresso & Coffee Maker Machine",
    image: "https://images.unsplash.com/photo-1588854337236-6889d631faa8?q=80&w=600",
    images: ["https://images.unsplash.com/photo-1588854337236-6889d631faa8?q=80&w=600"],
    price: "QAR 299.00",
    oldPrice: "QAR 399.00",
    badge: "Smart",
    badgeColor: "bg-orange-500",
    buttonText: "ADD TO CART",
    rating: 4.7,
    reviewCount: 45,
    stock: 8,
    description: "Fully automated coffee brewer featuring 15 bars of pressure, digital touch control pad, temperature stabilizer, and build-in steam frother for barista-quality coffees.",
    specs: [
      { label: "Water Tank", value: "1.8 Liters" },
      { label: "Power", value: "1450 Watts" }
    ],
    colors: [],
    storageOptions: []
  }
];

// ─────────────────────────────────────────────────────────
// Promo Banners
// ─────────────────────────────────────────────────────────
const banners: BannerItem[] = [
  {
    id: 1,
    category: "Headphones H4",
    title: "Superb sound.\nExpressive style.",
    image: headphone,
    buttonText: "To Shop",
    href: "/shop",
  },
  {
    id: 2,
    category: "Smart Airbuds",
    title: 'MONOFILM xT-200 Camera\n',
    image: airbuds,
    buttonText: "To Shop",
    href: "/shop",
  },
];

// ─────────────────────────────────────────────────────────
// Offer Cards
// ─────────────────────────────────────────────────────────
const offers: OfferCard[] = [
  {
    id: 1,
    badge: "NEW PRODUCT",
    title: "Premium French Perfumes",
    subtitle: "TODAY'S SUPER OFFER",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=600",
    bgColor: "bg-[#f2dfe3]",
    href: "/category/perfumes-buhoor",
  },
  {
    id: 2,
    badge: "BIG SALE",
    title: "Islamic Learning Toys",
    subtitle: "UP TO 75% OFF",
    image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?q=80&w=600",
    bgColor: "bg-[#e8edf2]",
    href: "/category/toys",
  },
  {
    id: 3,
    badge: "WEEKEND DEAL",
    title: "Premium Gear & Gadgets",
    subtitle: "GIFT CARD QAR 150",
    image: iwatch,
    bgColor: "bg-[#efede3]",
    href: "/category/gadgets-electronics",
  },
  {
    id: 4,
    badge: "MONTH DEAL",
    title: "Smart Kitchen Appliances",
    subtitle: "UP TO 45% OFF",
    image: "https://images.unsplash.com/photo-1588854337236-6889d631faa8?q=80&w=600",
    bgColor: "bg-[#ece8f3]",
    href: "/category/kitchen-appliances-essentials",
  },
];

// ─────────────────────────────────────────────────────────
// Trending Products
// ─────────────────────────────────────────────────────────
const trndingProducts: TrendingProduct[] = [
  {
    id: 1,
    category: "Gadgets & Electronics",
    title: "MacBook Air 15-inch M3 SSD Silver",
    image: macb,
    price: "QAR 1,499.00",
    oldPrice: "QAR 1,699.00",
    rating: 5,
    badge: "-11%",
    hot: true,
    href: "/product/6",
  },
  {
    id: 2,
    category: "Gadgets & Electronics",
    title: "Apple Watch Ultra 2 Cellular",
    image: iwatch,
    price: "QAR 799.00",
    rating: 5,
    href: "/product/3",
  },
  {
    id: 3,
    category: "Gadgets & Electronics",
    title: "DJI Mini 4 Pro Drone Combo",
    image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=800&auto=format&fit=crop",
    price: "QAR 759.99",
    oldPrice: "QAR 999.99",
    rating: 5,
    badge: "-24%",
    href: "/product/1",
  },
  {
    id: 4,
    category: "Gaming Accessories",
    title: "Xbox Series X Console 1TB SSD",
    image: gamejoysticnew,
    price: "QAR 499.00",
    oldPrice: "QAR 549.00",
    rating: 5,
    badge: "-9%",
    hot: true,
    href: "/product/8",
  },
  {
    id: 9,
    category: "Perfumes & Buhoor",
    title: "Oud Royale Concentrated Oil",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=600",
    price: "QAR 89.00",
    oldPrice: "QAR 120.00",
    rating: 5,
    badge: "Oud",
    href: "/product/9",
  },
  {
    id: 12,
    category: "Kitchen Appliances & Essentials",
    title: "Smart Espresso Maker Machine",
    image: "https://images.unsplash.com/photo-1588854337236-6889d631faa8?q=80&w=600",
    price: "QAR 299.00",
    oldPrice: "QAR 399.00",
    rating: 4.7,
    badge: "Smart",
    href: "/product/12",
  },
];

// ─────────────────────────────────────────────────────────
// Deal of the Day Slides
// ─────────────────────────────────────────────────────────
const slides: SlideItem[] = [
  {
    id: 8,
    badge: "-9%",
    hot: true,
    category: "Gaming Accessories",
    title: "Xbox Series X Console 1TB Solid State Digital Drive",
    price: "QAR 499.00",
    oldPrice: "QAR 549.00",
    description:
      "Play thousands of games from four generations of Xbox. Custom NVME SSD delivers near-instant loading.",
    rating: 5,
    mainImage: gamejoysticnew,
    thumbs: [gamejoysticnew, gamejoysticnew],
  },
  {
    id: 6,
    badge: "-11%",
    hot: false,
    category: "Gadgets & Electronics",
    title: "MacBook Air 15-inch M3 Chip 16GB/512GB SSD",
    price: "QAR 1,499.00",
    oldPrice: "QAR 1,699.00",
    description:
      "Superlight and under half an inch thin. Apple M3 chip handles work, play, and everything in between.",
    rating: 5,
    mainImage: macb,
    thumbs: [macb, macb],
  },
  {
    id: 1,
    badge: "-24%",
    hot: true,
    category: "Gadgets & Electronics",
    title: "DJI Mini 4 Pro Drone Flight Combo - 4K HDR Camera",
    price: "QAR 759.99",
    oldPrice: "QAR 999.99",
    description:
      "4K/60fps HDR True Vertical Shooting, Omnidirectional obstacle sensing, and extended battery combo package.",
    rating: 5,
    mainImage: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=800&auto=format&fit=crop",
    thumbs: ["https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=800&auto=format&fit=crop"],
  },
];

// ─────────────────────────────────────────────────────────
// FAQ Data
// ─────────────────────────────────────────────────────────
const faqData: FAQItem[] = [
  {
    question: "What payment methods do you accept?",
    answer:
      "We currently accept Cash on Delivery (COD) only for all orders. We do not support credit cards or online payment options at this time.",
  },
  {
    question: "What is your return policy?",
    answer:
      "We offer a 7-day return policy from the date of delivery. If you return a product within these 7 days, the refund amount will be credited to your GriVA wallet as store credit. You can use this wallet credit for future purchases on our store. Please note that we do not offer cash refunds.",
  },
  {
    question: "What should I do if my product is damaged or defective?",
    answer:
      "If you receive a damaged, defective, or incorrect product, you are eligible for an immediate exchange. We will arrange a courier to collect the damaged item and deliver a brand-new replacement of the same product at no extra cost to you. Please report any damaged items to our customer support within 24 hours of delivery.",
  },
  {
    question: "How long does shipping take and what are the rates?",
    answer:
      "We deliver all across Qatar. Standard delivery takes 1–2 business days. Delivery is completely free for orders over QAR 50. For orders below QAR 50, a standard delivery fee of QAR 15 applies.",
  },
  {
    question: "How can I track my order?",
    answer:
      "Once your order is processed, you will receive order status notifications via SMS or WhatsApp. You can also view live delivery tracking details directly from your GriVA account dashboard.",
  },
  {
    question: "Can I modify or cancel my order?",
    answer:
      "You can cancel or modify your order by contacting our support team via WhatsApp within 1 hour of placing it. Once an order is handed over to our dispatch/delivery team, it cannot be modified or cancelled.",
  },
];

const categories: CategoryItem[] = [
  {
    title: "Perfumes & Buhoor",
    href: "/category/perfumes-buhoor",
    image: perfume,
  },
  {
    title: "Toys",
    href: "/category/toys",
    image: toy,
  },
  {
    title: "Baby Products",
    href: "/category/baby-products",
    image: baby,
  },
  {
    title: "Gadgets & Electronics",
    href: "/category/gadgets-electronics",
    image: gadget,
  },
  {
    title: "Gaming Accessories",
    href: "/category/gaming-accessories",
    image: gaming,
  },
  {
    title: "Kitchen Appliances & Essentials",
    href: "/category/kitchen-appliances-essentials",
    image: kitchen,
  },
];

const categoriesTree = [
  {
    title: "Perfumes & Buhoor" ,
    href: "/category/perfumes-buhoor",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=600",
    subcategories: [
      { label: "Perfumes", href: "/category/perfumes-buhoor?sub=perfumes" },
      { label: "Body Lotion", href: "/category/perfumes-buhoor?sub=body-lotion" },
      { label: "Car Fragrance", href: "/category/perfumes-buhoor?sub=car-fragrance" },
      { label: "Buhoor", href: "/category/perfumes-buhoor?sub=buhoor" },
      { label: "Body Spray", href: "/category/perfumes-buhoor?sub=body-spray" },
    ],
  },
  {
    title: "Toys",
    href: "/category/toys",
    image: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?q=80&w=600",
    subcategories: [
      { label: "Newborn Toys", href: "/category/toys?sub=newborn-toys" },
      { label: "Learning Toys", href: "/category/toys?sub=learning-toys" },
      { label: "Islamic Learning Toys", href: "/category/toys?sub=islamic-learning-toys" },
      { label: "Remote Control Cars & Toys", href: "/category/toys?sub=remote-control-cars-toys" },
      { label: "Metal Toys", href: "/category/toys?sub=metal-toys" },
    ],
  },
  {
    title: "Baby Products",
    href: "/category/baby-products",
    image: "https://images.unsplash.com/photo-1515488042361-404e9250afef?q=80&w=600",
    subcategories: [
      { label: "Baby Clothes Storage", href: "/category/baby-products?sub=baby-clothes-storage" },
      { label: "Baby Bath Accessories", href: "/category/baby-products?sub=baby-bath-accessories" },
      { label: "Baby Play Mats", href: "/category/baby-products?sub=baby-play-mats" },
      { label: "Baby Bouncers & Cradles", href: "/category/baby-products?sub=baby-bouncers-cradles" },
    ],
  },
  {
    title: "Gadgets & Electronics",
    href: "/category/gadgets-electronics",
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=600",
    subcategories: [
      { label: "Power Banks", href: "/category/gadgets-electronics?sub=power-banks" },
      { label: "Chargers", href: "/category/gadgets-electronics?sub=chargers" },
      { label: "Cables", href: "/category/gadgets-electronics?sub=cables" },
      { label: "Earphones", href: "/category/gadgets-electronics?sub=earphones" },
      { label: "Speakers", href: "/category/gadgets-electronics?sub=speakers" },
      { label: "Audio Cables", href: "/category/gadgets-electronics?sub=audio-cables" },
      { label: "Screen Protectors", href: "/category/gadgets-electronics?sub=screen-protectors" },
      { label: "Phone Cases", href: "/category/gadgets-electronics?sub=phone-cases" },
      { label: "Smartwatches", href: "/category/gadgets-electronics?sub=smartwatches" },
      { label: "Fitness Bands", href: "/category/gadgets-electronics?sub=fitness-bands" },
    ],
  },
  {
    title: "Gaming Accessories",
    href: "/category/gaming-accessories",
    image: "https://images.unsplash.com/photo-1600861195091-690c92f1d2cc?q=80&w=600",
    subcategories: [
      { label: "Mobile Game Controllers", href: "/category/gaming-accessories?sub=mobile-game-controllers" },
      { label: "Triggers", href: "/category/gaming-accessories?sub=triggers" },
      { label: "Gaming Earbuds", href: "/category/gaming-accessories?sub=gaming-earbuds" },
      { label: "Gaming Headsets", href: "/category/gaming-accessories?sub=gaming-headsets" },
      { label: "Phone Coolers", href: "/category/gaming-accessories?sub=phone-coolers" },
      { label: "Gaming Finger Sleeves", href: "/category/gaming-accessories?sub=gaming-finger-sleeves" },
      { label: "Gaming Grip Stands", href: "/category/gaming-accessories?sub=gaming-grip-stands" },
    ],
  },
  {
    title: "Kitchen Appliances & Essentials",
    href: "/category/kitchen-appliances-essentials",
    image: "https://images.unsplash.com/photo-1588854337236-6889d631faa8?q=80&w=600",
    subcategories: [
      { label: "Kitchen Rack", href: "/category/kitchen-appliances-essentials?sub=kitchen-rack" },
      { label: "Shoe Rack", href: "/category/kitchen-appliances-essentials?sub=shoe-rack" },
      { label: "Washing Machine Rack", href: "/category/kitchen-appliances-essentials?sub=washing-machine-rack" },
      { label: "Vegetable Rack", href: "/category/kitchen-appliances-essentials?sub=vegetable-rack" },
      { label: "Electronic Coffee Maker", href: "/category/kitchen-appliances-essentials?sub=electronic-coffee-maker" },
      { label: "Egg Boilers", href: "/category/kitchen-appliances-essentials?sub=egg-boilers" },
      { label: "Egg Beaters", href: "/category/kitchen-appliances-essentials?sub=egg-beaters" },
    ],
  },
];

const slide: SlideData[] = [
  {
    badge: "WEEKEND DEAL",
    title: "Smart Devices\nFor Modern Life",
    subtitle: "EXPLORE THE BEST TECH GADGETS",
    price: "QAR 499.00",
    image: airbudsnew,
    bg: "#23264a",
  },
  {
    badge: "HOT OFFER",
    title: "Next Level\nGaming Console",
    subtitle: "UNLEASH THE POWER OF XBOX",
    price: "QAR 499.00",
    image: gamejoysticnew,
    bg: "#1a3a2a",
  },
  {
    badge: "FLASH SALE",
    title: "Active Noise\nCancelling",
    subtitle: "PREMIUM SOUND BY SONY",
    price: "QAR 348.00",
    image: headphoneNew,
    bg: "#3a1a2a",
  },
];

const mobilebanners: mobileBannerImage[] = [
  { src: banner1, href: "/shop", alt: "Banner 1" },
  { src: banner2, href: "/shop", alt: "Banner 2" },
  { src: banner3, href: "/shop", alt: "Banner 3" },
];

export function parsePriceNumber(price: string): number {
  return parseFloat(price.replace(/([$]|qar|[\s,])/gi, "")) || 0;
}

export { products, banners, offers, trndingProducts, slides, faqData, categories, categoriesTree, slide ,mobilebanners};
