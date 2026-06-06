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
import gamejoystic from "../../public/images/gamejoystic.png";
import laptop from "../../public/images/laptop.jpeg";
import catespeaker from "../../public/images/catespeaker.png";
import catetv from "../../public/images/catetv.png";
import cateheadphone from "../../public/images/cateheadphone.png";
import nbg from "../../public/images/nbg.png";
import headphoneNew from "../../public/images/headphonenew.png";
import gamejoysticnew from "../../public/images/gamejoysticnew.png";
import airbudsnew from "../../public/images/airbudsnew.png";
import headphone123 from "../../public/images/HeadphoneNew@.png";
import banner1 from "../../public/images/banner1.png";
import banner2 from "../../public/images/banner2.png";
import banner3 from "../../public/images/banner3.png";

// ───────────────────────────────────────────────────────── 
// Products (Gaggets/Wearables/Laptops/etc. No Mobiles!)
// ─────────────────────────────────────────────────────────
const products: Product[] = [
  {
    id: 1,
    category: "Gadgets",
    title: "DJI Mini 4 Pro Drone Flight Combo - 4K HDR Camera",
    image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=800&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=800&auto=format&fit=crop"],
    price: "$759.99",
    oldPrice: "$999.99",
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
    category: "Gadgets",
    title: "Meta Quest 3 128GB VR Headset - Mixed Reality",
    image: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?q=80&w=800&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?q=80&w=800&auto=format&fit=crop"],
    price: "$499.00",
    oldPrice: "$599.00",
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
    category: "Gadgets",
    title: "Apple Watch Ultra 2 GPS + Cellular Titanium",
    image: iwatch,
    images: [iwatch, iwatch],
    price: "$799.00",
    oldPrice: "$899.00",
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
    category: "Headphones",
    title: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
    image: headphone123,
    images: [headphone123, headphoneNew],
    price: "$348.00",
    oldPrice: "$399.00",
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
    category: "Gadgets",
    title: "GoPro HERO12 Black Waterproof Action Camera",
    image: "https://images.unsplash.com/photo-1564466809058-bf4114d55352?q=80&w=800&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1564466809058-bf4114d55352?q=80&w=800&auto=format&fit=crop"],
    price: "$399.00",
    oldPrice: "$449.00",
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
    category: "Laptops",
    title: "MacBook Air 15-inch M3 Chip 16GB/512GB SSD",
    image: macb,
    images: [macb, macb],
    price: "$1,499.00",
    oldPrice: "$1,699.00",
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
    category: "Speakers",
    title: "Anker Soundcore Motion X600 Portable Hi-Res Speaker",
    image: bsspeaker,
    images: [bsspeaker, bsspeaker],
    price: "$199.99",
    oldPrice: "$249.99",
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
    category: "Gaming",
    title: "Xbox Series X Console 1TB Solid State Digital Drive",
    image: gamejoysticnew,
    images: [gamejoysticnew, joystic],
    price: "$499.00",
    oldPrice: "$549.00",
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
    title: 'MONOFILM xT-200\nPhotograph "SMARTER"',
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
    title: "Release Date & Price",
    subtitle: "TODAY'S SUPER OFFER",
    image: macb,
    bgColor: "bg-[#f2dfe3]",
    href: "/category/laptops",
  },
  {
    id: 2,
    badge: "BIG SALE",
    title: "Biggest Discount",
    subtitle: "UP TO 75% OFF",
    image: bsspeaker,
    bgColor: "bg-[#e8edf2]",
    href: "/category/speakers",
  },
  {
    id: 3,
    badge: "WEEKEND DEAL",
    title: "The Great Sale",
    subtitle: "GIFT CARD $150",
    image: iwatch,
    bgColor: "bg-[#efede3]",
    href: "/category/gadgets",
  },
  {
    id: 4,
    badge: "MONTH DEAL",
    title: "Spring Clean Sale",
    subtitle: "UP TO 45% OFF",
    image: headphonepng,
    bgColor: "bg-[#ece8f3]",
    href: "/category/headphones",
  },
];

// ─────────────────────────────────────────────────────────
// Trending Products
// ─────────────────────────────────────────────────────────
const trndingProducts: TrendingProduct[] = [
  {
    id: 1,
    category: "Laptops",
    title: "MacBook Air 15-inch M3 SSD Silver",
    image: macb,
    price: "$1,499.00",
    oldPrice: "$1,699.00",
    rating: 5,
    badge: "-11%",
    hot: true,
    href: "/product/6",
  },
  {
    id: 2,
    category: "Gadgets",
    title: "Apple Watch Ultra 2 Cellular",
    image: iwatch,
    price: "$799.00",
    rating: 5,
    href: "/product/3",
  },
  {
    id: 3,
    category: "Gadgets",
    title: "DJI Mini 4 Pro Drone Combo",
    image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=800&auto=format&fit=crop",
    price: "$759.99",
    oldPrice: "$999.99",
    rating: 5,
    badge: "-24%",
    href: "/product/1",
  },
  {
    id: 4,
    category: "Gaming",
    title: "Xbox Series X Console 1TB SSD",
    image: gamejoysticnew,
    price: "$499.00",
    oldPrice: "$549.00",
    rating: 5,
    badge: "-9%",
    hot: true,
    href: "/product/8",
  },
  {
    id: 5,
    category: "Headphones",
    title: "Sony WH-1000XM5 Wireless ANC",
    image: headphone123,
    price: "$348.00",
    oldPrice: "$399.00",
    rating: 5,
    badge: "-12%",
    href: "/product/4",
  },
  {
    id: 6,
    category: "Speakers",
    title: "Anker Soundcore Motion X600",
    image: bsspeaker,
    price: "$199.99",
    oldPrice: "$249.99",
    rating: 4,
    badge: "-20%",
    href: "/product/7",
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
    category: "Gaming",
    title: "Xbox Series X Console 1TB Solid State Digital Drive",
    price: "$499.00",
    oldPrice: "$549.00",
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
    category: "Laptops",
    title: "MacBook Air 15-inch M3 Chip 16GB/512GB SSD",
    price: "$1,499.00",
    oldPrice: "$1,699.00",
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
    category: "Gadgets",
    title: "DJI Mini 4 Pro Drone Flight Combo - 4K HDR Camera",
    price: "$759.99",
    oldPrice: "$999.99",
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
    question: "How long does shipping take?",
    answer:
      "Standard shipping takes 3–7 business days. Express shipping (1–2 business days) is available at checkout. Free shipping on orders over $50.",
  },
  {
    question: "What is your return policy?",
    answer:
      "We offer a 30-day hassle-free return policy. Items must be in original condition with all packaging. Initiate a return from your account dashboard.",
  },
  {
    question: "Do you offer international shipping?",
    answer:
      "Yes, we ship to 50+ countries worldwide. International shipping times vary from 7–21 business days depending on the destination.",
  },
  {
    question: "Are all products covered by warranty?",
    answer:
      "All electronics come with manufacturer warranty. GriVA also offers an extended warranty program for an additional 1–2 years of coverage.",
  },
  {
    question: "How can I track my order?",
    answer:
      "Once your order ships, you'll receive a tracking number via email. You can also track orders in real-time through your account dashboard.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept Visa, Mastercard, American Express, PayPal, and Bitcoin. All transactions are secured with 256-bit SSL encryption.",
  },
  {
    question: "Can I change or cancel my order?",
    answer:
      "Orders can be modified or cancelled within 1 hour of placement. After that, the order enters processing and cannot be changed.",
  },
  {
    question: "Do you price match?",
    answer:
      "Yes! If you find a lower price on an identical item at an authorized retailer, contact us and we'll match the price within 7 days of purchase.",
  },
];

const categories: CategoryItem[] = [
  {
    title: "Gaming",
    href: "/category/gaming",
    image: gamejoystic,
  },
  {
    title: "Television",
    href: "/category/television",
    image: catetv,
  },
  {
    title: "Speakers",
    href: "/category/speakers",
    image: catespeaker,
  },
  {
    title: "Headphones",
    href: "/category/headphones",
    image: cateheadphone,
  },
  {
    title: "Gadgets",
    href: "/category/gadgets",
    image: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?q=80&w=800&auto=format&fit=crop",
  },
  {
    title: "Laptops",
    href: "/category/laptops",
    image: laptop,
  },
];

const slide: SlideData[] = [
  {
    badge: "WEEKEND DEAL",
    title: "Smart Devices\nFor Modern Life",
    subtitle: "EXPLORE THE BEST TECH GADGETS",
    price: "$499.00",
    image: airbudsnew,
    bg: "#23264a",
  },
  {
    badge: "HOT OFFER",
    title: "Next Level\nGaming Console",
    subtitle: "UNLEASH THE POWER OF XBOX",
    price: "$499.00",
    image: gamejoysticnew,
    bg: "#1a3a2a",
  },
  {
    badge: "FLASH SALE",
    title: "Active Noise\nCancelling",
    subtitle: "PREMIUM SOUND BY SONY",
    price: "$348.00",
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
  return parseFloat(price.replace(/[$,]/g, "")) || 0;
}

export { products, banners, offers, trndingProducts, slides, faqData, categories, slide ,mobilebanners};
