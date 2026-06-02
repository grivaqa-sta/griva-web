import {
  BannerItem,
  Product,
  OfferCard,
  TrendingProduct,
  SlideItem,
  FAQItem,
  CategoryItem,
  SlideData,
} from "../types/types";

import iphone11pro from "../../public/images/11pro.png";
import iphone13pro from "../../public/images/13pro.png";
import iphone11proMax from "../../public/images/11promax.png";
import samsungs23Ultra from "../../public/images/s23ultra.png";
import iphone15pro from "../../public/images/15pro.png";
import joystic from "../../public/images/joystic.png";
import headphonepng from "../../public/images/headphone.png";
import headphone from "../../public/images/headphone.jpg";
import airbuds from "../../public/images/airbuds.jpg";
import iwatch from "../../public/images/iwach.png";
import macb from "../../public/images/macb.png";
import iphone13 from "../../public/images/iphone13.png";
import bsspeaker from "../../public/images/bspeaker.png";
import gamejoystic from "../../public/images/gamejoystic.png";
import laptop from "../../public/images/laptop.jpeg"
import catespeaker from "../../public/images/catespeaker.png";
import catetv from "../../public/images/catetv.png";
import catemobile from "../../public/images/catmobile.jpeg";
import cateheadphone from "../../public/images/cateheadphone.png";
import nbg from "../../public/images/nbg.png";
import headphoneNew from "../../public/images/headphonenew.png";
import gamejoysticnew from "../../public/images/gamejoysticnew.png";
import airbudsnew from "../../public/images/airbudsnew.png";
import headphone123 from "../../public/images/HeadphoneNew@.png";

// ───────────────────────────────────────────────────────── 
// Products
// ─────────────────────────────────────────────────────────
const products: Product[] = [
  {
    id: 1,
    category: "Samsung Galaxy",
    title: "Samsung Galaxy S23 Ultra, Factory Unlocked, 512GB",
    image: samsungs23Ultra,
    images: [samsungs23Ultra, samsungs23Ultra, samsungs23Ultra],
    price: "$699.99",
    oldPrice: "$949.99",
    badge: "-26%",
    badgeColor: "bg-blue-600",
    buttonText: "ADD TO CART",
    rating: 4,
    reviewCount: 284,
    stock: 12,
    description:
      "The Samsung Galaxy S23 Ultra is a powerhouse smartphone featuring a 200MP camera system, the most advanced S Pen experience ever, and the powerful Snapdragon 8 Gen 2 processor. With a 5000mAh battery and 6.8-inch Dynamic AMOLED display, it delivers an unmatched mobile experience.",
    specs: [
      { label: "Display", value: "6.8\" Dynamic AMOLED 2X, 120Hz" },
      { label: "Processor", value: "Snapdragon 8 Gen 2" },
      { label: "RAM", value: "12GB" },
      { label: "Storage", value: "512GB UFS 3.1" },
      { label: "Camera", value: "200MP + 12MP + 10MP + 10MP" },
      { label: "Battery", value: "5000mAh, 45W Fast Charging" },
      { label: "OS", value: "Android 13, One UI 5.1" },
      { label: "5G", value: "Yes" },
    ],
    colors: [
      { name: "Phantom Black", hex: "#1a1a1a" },
      { name: "Cream", hex: "#f5f0e8" },
      { name: "Green", hex: "#4a6741" },
    ],
    storageOptions: [
      { label: "256GB", value: "256gb" },
      { label: "512GB", value: "512gb" },
    ],
    reviews: [
      {
        id: 1,
        author: "Alex M.",
        avatar: "AM",
        rating: 5,
        date: "March 12, 2025",
        title: "Best phone I've ever owned",
        body: "The camera is absolutely incredible. S Pen integration is seamless. Battery lasts all day easily.",
        verified: true,
      },
      {
        id: 2,
        author: "Sarah K.",
        avatar: "SK",
        rating: 4,
        date: "February 28, 2025",
        title: "Great phone, slight heat issue",
        body: "Love the display and camera quality. Runs slightly warm under heavy load but overall fantastic.",
        verified: true,
      },
    ],
  },
  {
    id: 2,
    category: "iPhone",
    title: "Unlocked Apple iPhone 11 Pro, 64GB/256GB, 12MP",
    image: iphone11pro,
    images: [iphone11pro, iphone11pro, iphone11pro],
    price: "$480.99",
    oldPrice: "$599.23",
    badge: "-20%",
    badgeColor: "bg-blue-600",
    buttonText: "ADD TO CART",
    rating: 5,
    reviewCount: 156,
    stock: 8,
    description:
      "The iPhone 11 Pro features a triple-camera system with Ultra Wide, Wide, and Telephoto lenses. The Super Retina XDR display delivers stunning visuals, while the A13 Bionic chip ensures lightning-fast performance.",
    specs: [
      { label: "Display", value: "5.8\" Super Retina XDR OLED" },
      { label: "Processor", value: "Apple A13 Bionic" },
      { label: "Storage", value: "64GB / 256GB" },
      { label: "Camera", value: "12MP Triple Camera" },
      { label: "Battery", value: "3046mAh" },
      { label: "OS", value: "iOS 17" },
    ],
    colors: [
      { name: "Space Gray", hex: "#3a3a3c" },
      { name: "Silver", hex: "#e8e8e8" },
      { name: "Gold", hex: "#f5c785" },
      { name: "Midnight Green", hex: "#2d4a3e" },
    ],
    storageOptions: [
      { label: "64GB", value: "64gb" },
      { label: "256GB", value: "256gb" },
    ],
    reviews: [
      {
        id: 1,
        author: "James T.",
        avatar: "JT",
        rating: 5,
        date: "January 5, 2025",
        title: "Still a top performer",
        body: "Even though this is an older model, the camera quality is still excellent for the price.",
        verified: true,
      },
    ],
  },
  {
    id: 3,
    category: "Prepaid Phones",
    title: "Apple iPhone 14 Pro Max (256 GB) - White Titanium",
    image: iphone13pro,
    images: [iphone13pro, iphone13pro, iphone13pro],
    price: "$519.00",
    oldPrice: "$805.00",
    badge: "-36%",
    badgeColor: "bg-blue-600",
    buttonText: "ADD TO CART",
    rating: 0,
    reviewCount: 42,
    stock: 3,
    description:
      "The iPhone 14 Pro Max with the revolutionary Dynamic Island feature, 48MP main camera, and the powerful A16 Bionic chip. Always-On display keeps your information at a glance.",
    specs: [
      { label: "Display", value: "6.7\" Super Retina XDR, Always-On" },
      { label: "Processor", value: "Apple A16 Bionic" },
      { label: "Storage", value: "256GB" },
      { label: "Camera", value: "48MP + 12MP + 12MP" },
      { label: "Battery", value: "4323mAh, MagSafe" },
      { label: "Feature", value: "Dynamic Island" },
    ],
    colors: [
      { name: "Deep Purple", hex: "#4a3360" },
      { name: "Space Black", hex: "#1a1a1a" },
      { name: "Gold", hex: "#f5c785" },
      { name: "Silver", hex: "#e8e8e8" },
    ],
    storageOptions: [
      { label: "128GB", value: "128gb" },
      { label: "256GB", value: "256gb" },
      { label: "512GB", value: "512gb" },
      { label: "1TB", value: "1tb" },
    ],
    reviews: [],
  },
  {
    id: 4,
    category: "iPhone",
    title: "Apple iPhone 15 Pro Max, 512GB, Unlocked",
    image: iphone15pro,
    images: [iphone15pro, iphone15pro, iphone15pro],
    price: "$1,299.00",
    oldPrice: "$1,399.00",
    badge: "-7%",
    badgeColor: "bg-blue-600",
    buttonText: "ADD TO CART",
    rating: 5,
    reviewCount: 98,
    stock: 5,
    description:
      "The iPhone 15 Pro Max with titanium design and the A17 Pro chip. Features a 5x telephoto camera, USB 3 speeds, and Action Button customization.",
    specs: [
      { label: "Display", value: "6.7\" Super Retina XDR, ProMotion 120Hz" },
      { label: "Processor", value: "Apple A17 Pro" },
      { label: "Storage", value: "512GB" },
      { label: "Camera", value: "48MP + 12MP + 12MP, 5x Telephoto" },
      { label: "Frame", value: "Grade 5 Titanium" },
      { label: "Connector", value: "USB-C (USB 3 speed)" },
    ],
    colors: [
      { name: "Natural Titanium", hex: "#c8b9a3" },
      { name: "Blue Titanium", hex: "#6b8fa8" },
      { name: "White Titanium", hex: "#f0eeea" },
      { name: "Black Titanium", hex: "#2a2a2a" },
    ],
    storageOptions: [
      { label: "256GB", value: "256gb" },
      { label: "512GB", value: "512gb" },
      { label: "1TB", value: "1tb" },
    ],
    reviews: [
      {
        id: 1,
        author: "Emily R.",
        avatar: "ER",
        rating: 5,
        date: "April 2, 2025",
        title: "Absolutely worth it",
        body: "The 5x zoom camera is a game changer for photography. Titanium frame feels premium. Best iPhone yet.",
        verified: true,
      },
    ],
  },
  {
    id: 5,
    category: "iPhone",
    title: "Apple iPhone 11 Pro Max Triple Camera",
    image: iphone11proMax,
    images: [iphone11proMax, iphone11proMax, iphone11proMax],
    price: "$425.00",
    oldPrice: "$599.00",
    buttonText: "SELECT OPTIONS",
    rating: 4,
    reviewCount: 73,
    stock: 15,
    description:
      "The iPhone 11 Pro Max features a triple-camera system and the largest battery in any iPhone. The Super Retina XDR display is the best ever in a smartphone.",
    specs: [
      { label: "Display", value: "6.5\" Super Retina XDR OLED" },
      { label: "Processor", value: "Apple A13 Bionic" },
      { label: "Storage", value: "64GB / 256GB / 512GB" },
      { label: "Camera", value: "12MP Triple Camera" },
      { label: "Battery", value: "3969mAh" },
    ],
    colors: [
      { name: "Space Gray", hex: "#3a3a3c" },
      { name: "Silver", hex: "#e8e8e8" },
      { name: "Gold", hex: "#f5c785" },
    ],
    storageOptions: [
      { label: "64GB", value: "64gb" },
      { label: "256GB", value: "256gb" },
      { label: "512GB", value: "512gb" },
    ],
    reviews: [],
  },
  {
    id: 6,
    category: "Samsung Galaxy",
    title: "Samsung Galaxy S23 Ultra, Factory Unlocked, 512GB",
    image: samsungs23Ultra,
    images: [samsungs23Ultra, samsungs23Ultra],
    price: "$699.99",
    oldPrice: "$949.99",
    badge: "-26%",
    badgeColor: "bg-blue-600",
    buttonText: "ADD TO CART",
    rating: 4,
    reviewCount: 201,
    stock: 7,
    description:
      "The Samsung Galaxy S23 Ultra with integrated S Pen, 200MP camera, and 5000mAh battery.",
    specs: [
      { label: "Display", value: "6.8\" Dynamic AMOLED 2X" },
      { label: "Processor", value: "Snapdragon 8 Gen 2" },
      { label: "Storage", value: "512GB" },
      { label: "S Pen", value: "Built-in" },
    ],
    colors: [
      { name: "Phantom Black", hex: "#1a1a1a" },
      { name: "Cream", hex: "#f5f0e8" },
    ],
    storageOptions: [
      { label: "256GB", value: "256gb" },
      { label: "512GB", value: "512gb" },
    ],
    reviews: [],
  },
  {
    id: 7,
    category: "iPhone",
    title: "Unlocked Apple iPhone 11 Pro, 64GB/256GB, 12MP",
    image: iphone11pro,
    images: [iphone11pro, iphone11pro],
    price: "$480.99",
    oldPrice: "$599.23",
    badge: "-20%",
    badgeColor: "bg-blue-600",
    buttonText: "ADD TO CART",
    rating: 5,
    reviewCount: 89,
    stock: 20,
    description: "Apple iPhone 11 Pro with triple camera system.",
    specs: [
      { label: "Display", value: "5.8\" Super Retina XDR" },
      { label: "Processor", value: "Apple A13 Bionic" },
    ],
    colors: [{ name: "Space Gray", hex: "#3a3a3c" }],
    storageOptions: [
      { label: "64GB", value: "64gb" },
      { label: "256GB", value: "256gb" },
    ],
    reviews: [],
  },
  {
    id: 8,
    category: "Prepaid Phones",
    title: "Apple iPhone 14 Pro Max (256 GB) - White Titanium",
    image: iphone13pro,
    images: [iphone13pro, iphone13pro],
    price: "$519.00",
    oldPrice: "$805.00",
    badge: "-36%",
    badgeColor: "bg-blue-600",
    buttonText: "ADD TO CART",
    rating: 0,
    reviewCount: 17,
    stock: 2,
    description: "Apple iPhone 14 Pro Max with Dynamic Island.",
    specs: [
      { label: "Display", value: "6.7\" Super Retina XDR" },
      { label: "Processor", value: "Apple A16 Bionic" },
    ],
    colors: [{ name: "Deep Purple", hex: "#4a3360" }],
    storageOptions: [{ label: "256GB", value: "256gb" }],
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
    href: "/shop",
  },
  {
    id: 2,
    badge: "BIG SALE",
    title: "Biggest Discount",
    subtitle: "UP TO 75% OFF",
    image: bsspeaker,
    bgColor: "bg-[#e8edf2]",
    href: "/shop",
  },
  {
    id: 3,
    badge: "WEEKEND DEAL",
    title: "The Great Sale",
    subtitle: "GIFT CARD $150",
    image: iwatch,
    bgColor: "bg-[#efede3]",
    href: "/shop",
  },
  {
    id: 4,
    badge: "MONTH DEAL",
    title: "Spring Clean Sale",
    subtitle: "UP TO 45% OFF",
    image: iphone13,
    bgColor: "bg-[#ece8f3]",
    href: "/shop",
  },
];

// ─────────────────────────────────────────────────────────
// Trending Products
// ─────────────────────────────────────────────────────────
const trndingProducts: TrendingProduct[] = [
  {
    id: 1,
    category: "Laptops",
    title: 'MacBook Pro 13.3" 16GB/512GB Silver',
    image: macb,
    price: "$1,527.00",
    oldPrice: "$1,795.00",
    rating: 4,
    badge: "-15%",
    hot: true,
    href: "/product/9",
  },
  {
    id: 2,
    category: "iPhone",
    title: "Apple watch Series 8",
    image: iwatch,
    price: "$425.00 - $609.00",
    rating: 4,
    href: "/product/10",
  },
  {
    id: 3,
    category: "Samsung Galaxy",
    title: "Samsung Galaxy S23 Ultra, Factory Unlocked,...",
    image: samsungs23Ultra,
    price: "$699.99",
    oldPrice: "$949.99",
    rating: 4,
    badge: "-26%",
    href: "/product/1",
  },
  {
    id: 4,
    category: "Xbox Series",
    title: "Xbox Series S -1TB Gaming All-Digital...",
    image: joystic,
    price: "$279.99",
    oldPrice: "$289.99",
    rating: 5,
    badge: "-3%",
    hot: true,
    href: "/product/11",
  },
  {
    id: 5,
    category: "Xbox Series",
    title: "Wired Controller for Xbox Series",
    image: headphonepng,
    price: "$78.89",
    oldPrice: "$109.00",
    rating: 5,
    badge: "-28%",
    href: "/product/12",
  },
  {
    id: 6,
    category: "Bluetooth Speakers",
    title: "Portable Bluetooth Speaker with Voice...",
    image: bsspeaker,
    price: "$65.55",
    oldPrice: "$69.00",
    rating: 4,
    badge: "-5%",
    href: "/product/13",
  },
];

// ─────────────────────────────────────────────────────────
// Deal of the Day Slides
// ─────────────────────────────────────────────────────────
const slides: SlideItem[] = [
  {
    id: 1,
    badge: "-3%",
    hot: true,
    category: "Xbox Series",
    title: "Xbox Series S -1TB Gaming All-Digital Console, 4K Streaming Media",
    price: "$279.99",
    oldPrice: "$289.99",
    description:
      "Package includes Xbox Series S 1TB console, 1 Xbox Wireless Controller, High Speed HDMI cable.",
    rating: 5,
    mainImage: gamejoysticnew,
    thumbs: [gamejoysticnew, macb, gamejoysticnew, gamejoysticnew],
  },
  {
    id: 2,
    badge: "-15%",
    hot: false,
    category: "Laptops",
    title: 'MacBook Pro 13.3" 16GB/512GB Silver',
    price: "$1,527.00",
    oldPrice: "$1,795.00",
    description:
      "Apple M2 chip, 16GB RAM, 512GB SSD, stunning Retina display with True Tone technology.",
    rating: 4,
    mainImage: macb,
    thumbs: [macb, macb, macb, macb],
  },
  {
    id: 3,
    badge: "-26%",
    hot: true,
    category: "Samsung Galaxy",
    title: "Samsung Galaxy S23 Ultra, Factory Unlocked, 512GB",
    price: "$699.99",
    oldPrice: "$949.99",
    description:
      "200MP camera, Snapdragon 8 Gen 2, built-in S Pen, 5000mAh battery.",
    rating: 4,
    mainImage: samsungs23Ultra,
    thumbs: [samsungs23Ultra, samsungs23Ultra, samsungs23Ultra, samsungs23Ultra],
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
    title: "Games",
    href: "/games",
    image: gamejoystic,
  },
  {
    title: "Television",
    href: "/television",
    image: catetv,
  },
  {
    title: "Speakers",
    href: "/speakers",
    image: catespeaker,
  },
  {
    title: "Headphones",
    href: "/headphones",
    image: cateheadphone,
  },
  {
    title: "Smartphone",
    href: "/smartphone",
    image: catemobile,
  },
  {
    title: "Laptops",
    href: "/laptops",
    image: laptop,
  }
];

const slide: SlideData[] = [
  {
    badge: "WEEKEND DEAL",
    title: "All New\nFor A Better You",
    subtitle: "AMAZING DISCOUNTS AND DEALS",
    price: "$399.99",
    image: airbudsnew,
    bg: "#23264a",
  },
  {
    badge: "HOT OFFER",
    title: "Next Level\nGaming Gear",
    subtitle: "UNLEASH YOUR INNER GAMER",
    price: "$299.99",
    image: gamejoysticnew,
    bg: "#1a3a2a",
  },
  {
    badge: "FLASH SALE",
    title: "Sound That\nMoves You",
    subtitle: "PREMIUM AUDIO EXPERIENCE",
    price: "$199.99",
    image: headphoneNew,
    bg: "#3a1a2a",
  },
];

// ─────────────────────────────────────────────────────────
// Price parser utility
// ─────────────────────────────────────────────────────────
export function parsePriceNumber(price: string): number {
  return parseFloat(price.replace(/[$,]/g, "")) || 0;
}

export { products, banners, offers, trndingProducts, slides, faqData, categories, slide };
