const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });


// ─── PRODUCTION SAFETY GUARD ──────────────────────────────────────────────────
// force:true drops ALL tables. This must NEVER run in production.
if (process.env.NODE_ENV === "production") {
  console.error("🚨 [SEED BLOCKED]: Seed script cannot run in production! It would DELETE ALL DATA.");
  console.error("    Set NODE_ENV=development in your local .env to run this.");
  process.exit(1);
}

const { sequelize } = require("./db");
const Category = require("../models/Category");
const SubCategory = require("../models/SubCategory");
const Product = require("../models/Product");
const User = require("../models/User");
const Subscriber = require("../models/Subscriber");
const ProductImage = require("../models/ProductImage");
const FlashSale = require("../models/FlashSale");
const FlashSaleProduct = require("../models/FlashSaleProduct");
const Review = require("../models/Review");
const Banner = require("../models/Banner");
const SiteSetting = require("../models/SiteSetting");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");

const SEED_CATEGORIES_TREE = [
  {
    title: "Perfumes & Buhoor",
    image_url: "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=300",
    subcategories: ["Perfumes", "Body Lotion", "Car Fragrance", "Buhoor", "Body Spray"]
  },
  {
    title: "Toys",
    image_url: "https://images.unsplash.com/photo-1537655780520-1e392edd816a?q=80&w=300",
    subcategories: ["Newborn Toys", "Learning Toys", "Islamic Learning Toys", "Remote Control Cars & Toys", "Metal Toys"]
  },
  {
    title: "Baby Products",
    image_url: "https://images.unsplash.com/photo-1515488042361-404e9250afef?q=80&w=300",
    subcategories: ["Baby Clothes Storage", "Baby Bath Accessories", "Baby Play Mats", "Baby Bouncers & Cradles"]
  },
  {
    title: "Gadgets & Electronics",
    image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=300",
    subcategories: ["Power Banks", "Chargers", "Cables", "Earphones", "Speakers", "Audio Cables", "Screen Protectors", "Phone Cases", "Smartwatches", "Fitness Bands", "Drones", "VR Headsets", "Action Cameras", "Laptops"]
  },
  {
    title: "Gaming Accessories",
    image_url: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=300",
    subcategories: ["Mobile Game Controllers", "Triggers", "Gaming Earbuds", "Gaming Headsets", "Phone Coolers", "Gaming Finger Sleeves", "Gaming Grip Stands", "Gaming Consoles"]
  },
  {
    title: "Kitchen Appliances & Essentials",
    image_url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=300",
    subcategories: ["Kitchen Rack", "Shoe Rack", "Washing Machine Rack", "Vegetable Rack", "Electronic Coffee Maker", "Egg Boilers", "Egg Beaters"]
  }
];

const SEED_PRODUCTS = [
  {
    categoryName: "Drones",
    title: "DJI Mini 4 Pro Drone Flight Combo - 4K HDR Camera",
    price: "759.99",
    old_price: "999.99",
    badge: "-24%",
    badge_color: "bg-blue-600",
    button_text: "ADD TO CART",
    brand: "DJI",
    sku: "DJI-MINI4-PRO",
    rating: 5,
    review_count: 341,
    is_featured: true,
    is_best_seller: true,
    is_trending: true,
    discount_percentage: 24,
    description: "The DJI Mini 4 Pro is our most advanced mini-camera drone to date. It integrates powerful imaging capabilities, omnidirectional obstacle sensing, ActiveTrack 360° with the new Trace Mode, and 20km FHD video transmission.",
    stock: 8,
    main_image_url: "https://www.pngmart.com/files/22/Drone-PNG-Image.png",
    gallery_images: ["https://www.pngmart.com/files/22/Drone-PNG-Image.png"],
    specifications: [
      { name: "Takeoff Weight", value: "< 249 g" },
      { name: "Max Flight Time", value: "34 mins (Standard)" },
      { name: "Camera Sensor", value: "1/1.3-inch CMOS, 48MP" },
      { name: "Video Resolution", value: "4K/60fps HDR" },
      { name: "Sensing Type", value: "Omnidirectional Obstacle Sensing" },
      { name: "Transmission Range", value: "20 km (O4)" }
    ],
    variants: [
      { color: "Arctic Gray", size: "64GB" },
      { color: "Arctic Gray", size: "256GB" },
      { color: "Midnight Black", size: "64GB" },
      { color: "Midnight Black", size: "256GB" }
    ]
  },
  {
    categoryName: "VR Headsets",
    title: "Meta Quest 3 128GB VR Headset - Mixed Reality",
    price: "499.00",
    old_price: "599.00",
    badge: "-16%",
    badge_color: "bg-blue-600",
    button_text: "ADD TO CART",
    brand: "Meta",
    sku: "META-QUEST-3",
    rating: 4,
    review_count: 198,
    is_featured: true,
    is_best_seller: true,
    is_trending: true,
    discount_percentage: 16,
    description: "Breakthrough mixed reality. Transform your home into a virtual playground where virtual elements blend into your physical space. Powerful performance with twice the graphics processing power of Quest 2.",
    stock: 12,
    main_image_url: "https://www.pngmart.com/files/22/VR-Headset-PNG-Transparent.png",
    gallery_images: ["https://www.pngmart.com/files/22/VR-Headset-PNG-Transparent.png"],
    specifications: [
      { name: "Display Resolution", value: "2064x2208 pixels per eye" },
      { name: "Refresh Rate", value: "90Hz, 120Hz experimental" },
      { name: "Processor", value: "Snapdragon XR2 Gen 2" },
      { name: "Storage", value: "128GB / 512GB" },
      { name: "Mixed Reality", value: "2 RGB Cameras (Passthrough)" },
      { name: "Audio", value: "Integrated 3D spatial audio" }
    ],
    variants: [
      { color: "Classic White", size: "128GB" },
      { color: "Classic White", size: "512GB" }
    ]
  },
  {
    categoryName: "Smartwatches",
    title: "Apple Watch Ultra 2 GPS + Cellular Titanium",
    price: "799.00",
    old_price: "899.00",
    badge: "-11%",
    badge_color: "bg-blue-600",
    button_text: "ADD TO CART",
    brand: "Apple",
    sku: "APL-WATCH-U2",
    rating: 5,
    review_count: 112,
    is_featured: true,
    is_best_seller: true,
    is_trending: true,
    discount_percentage: 11,
    description: "The ultimate sports and adventure watch. Featuring a lightweight titanium case, extra-long battery life, and the brightest Always-On Retina display ever.",
    stock: 5,
    main_image_url: "/images/iwach.png",
    gallery_images: ["/images/iwach.png"],
    specifications: [
      { name: "Case Size", value: "49mm Grade 5 Titanium" },
      { name: "Water Resistance", value: "100m (WR100)" },
      { name: "Battery Life", value: "Up to 36 hours (Normal Use)" },
      { name: "Display Brightness", value: "3000 nits peak" },
      { name: "Connectivity", value: "GPS + Cellular" }
    ],
    variants: [
      { color: "Natural Titanium", size: "64GB" },
      { color: "Ocean Band Blue", size: "64GB" }
    ]
  },
  {
    categoryName: "Gaming Headsets",
    title: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
    price: "348.00",
    old_price: "399.00",
    badge: "-12%",
    badge_color: "bg-blue-600",
    button_text: "ADD TO CART",
    brand: "Sony",
    sku: "SONY-XM5-W",
    rating: 5,
    review_count: 423,
    is_featured: true,
    is_best_seller: true,
    is_trending: true,
    discount_percentage: 12,
    description: "Sony WH-1000XM5 redefine distraction-free listening. Two processors control 8 microphones for unprecedented noise cancelling quality and exceptional call performance.",
    stock: 15,
    main_image_url: "/images/headphone.png",
    gallery_images: ["/images/headphone.png", "/images/headphonenew.png"],
    specifications: [
      { name: "Driver Unit", value: "30mm Dome Type" },
      { name: "Battery Life", value: "Up to 30 hours (ANC ON)" },
      { name: "Charging Time", value: "3 mins for 3 hours playback" },
      { name: "Bluetooth Version", value: "v5.2" },
      { name: "Codec Supported", value: "SBC, AAC, LDAC" }
    ],
    variants: [
      { color: "Black" },
      { color: "Platinum Silver" }
    ]
  },
  {
    categoryName: "Action Cameras",
    title: "GoPro HERO12 Black Waterproof Action Camera",
    price: "399.00",
    old_price: "449.00",
    badge: "",
    badge_color: "",
    button_text: "SELECT OPTIONS",
    brand: "GoPro",
    sku: "GOPRO-HERO-12",
    rating: 4,
    review_count: 97,
    is_featured: true,
    is_best_seller: false,
    is_trending: true,
    discount_percentage: 11,
    description: "Incredible image quality, even better HyperSmooth video stabilization, and a huge boost in battery performance. Takes best-in-class 5.3K video and HDR photos.",
    stock: 9,
    main_image_url: "https://www.pngmart.com/files/16/GoPro-PNG-Transparent-Image.png",
    gallery_images: ["https://www.pngmart.com/files/16/GoPro-PNG-Transparent-Image.png"],
    specifications: [
      { name: "Video Resolution", value: "5.3K/60fps, 4K/120fps" },
      { name: "Photo Resolution", value: "27MP" },
      { name: "Stabilization", value: "HyperSmooth 6.0" },
      { name: "Waterproof", value: "Up to 33ft (10m) without housing" }
    ],
    variants: [
      { color: "Standard Black", size: "Standard" }
    ]
  },
  {
    categoryName: "Laptops",
    title: "MacBook Air 15-inch M3 Chip 16GB/512GB SSD",
    price: "1499.00",
    old_price: "1699.00",
    badge: "-11%",
    badge_color: "bg-blue-600",
    button_text: "ADD TO CART",
    brand: "Apple",
    sku: "APL-MBAIR-M3",
    rating: 5,
    review_count: 64,
    is_featured: true,
    is_best_seller: true,
    is_trending: true,
    discount_percentage: 11,
    description: "The 15-inch MacBook Air is superlight and fits easily in your bag. Built with the powerhouse M3 chip to handle multitasking and pro workloads easily.",
    stock: 6,
    main_image_url: "/images/macb.png",
    gallery_images: ["/images/macb.png"],
    specifications: [
      { name: "Display", value: "15.3-inch Liquid Retina Display" },
      { name: "Processor", value: "Apple M3 Chip (8-core CPU, 10-core GPU)" },
      { name: "RAM", value: "16GB Unified Memory" },
      { name: "Storage", value: "512GB SSD" }
    ],
    variants: [
      { color: "Space Gray", size: "256GB" },
      { color: "Space Gray", size: "512GB" },
      { color: "Silver", size: "256GB" },
      { color: "Silver", size: "512GB" },
      { color: "Starlight", size: "256GB" },
      { color: "Starlight", size: "512GB" }
    ]
  },
  {
    categoryName: "Speakers",
    title: "Anker Soundcore Motion X600 Portable Hi-Res Speaker",
    price: "199.99",
    old_price: "249.99",
    badge: "-20%",
    badge_color: "",
    button_text: "ADD TO CART",
    brand: "Anker",
    sku: "ANKER-X600-SPK",
    rating: 4,
    review_count: 145,
    is_featured: true,
    is_best_seller: true,
    is_trending: true,
    discount_percentage: 20,
    description: "Inspired by theater acoustics, Motion X600 has 5 drivers and 5 amplifiers that are positioned to deliver sound all around you. Feels like you're in the room with the artist.",
    stock: 14,
    main_image_url: "/images/bspeaker.png",
    gallery_images: ["/images/bspeaker.png"],
    specifications: [
      { name: "Audio Output", value: "50W Spatial Audio" },
      { name: "Frequency Range", value: "40Hz - 40kHz" },
      { name: "Waterproof Rating", value: "IPX7 Waterproof" },
      { name: "Playtime", value: "Up to 12 hours" }
    ],
    variants: [
      { color: "Polar Gray" },
      { color: "Aurora Green" }
    ]
  },
  {
    categoryName: "Gaming Consoles",
    title: "Xbox Series X Console 1TB Solid State Digital Drive",
    price: "499.00",
    old_price: "549.00",
    badge: "-9%",
    badge_color: "bg-blue-600",
    button_text: "ADD TO CART",
    brand: "Xbox",
    sku: "XBOX-SX-1TB",
    rating: 5,
    review_count: 302,
    is_featured: true,
    is_best_seller: true,
    is_trending: true,
    discount_percentage: 9,
    description: "Play thousands of games from four generations of Xbox on the fastest, most powerful Xbox console ever. Experience next-gen speed with the Xbox Velocity Architecture.",
    stock: 4,
    main_image_url: "/images/gamejoysticnew.png",
    gallery_images: ["/images/gamejoysticnew.png", "/images/joystic.png"],
    specifications: [
      { name: "Processor", value: "8x Cores @ 3.8 GHz Custom Zen 2 CPU" },
      { name: "GPU", value: "12 TFLOPS, 52 CUs @ 1.825 GHz Custom RDNA 2" },
      { name: "Memory", value: "16GB GDDR6" },
      { name: "Storage", value: "1TB Custom NVME SSD" }
    ],
    variants: [
      { color: "Matte Black" }
    ]
  },
  {
    categoryName: "Perfumes",
    title: "Oud Royale Premium Concentrated Oud & Amber Perfume Oil",
    price: "89.00",
    old_price: "120.00",
    badge: "Oud",
    badge_color: "bg-amber-600",
    button_text: "ADD TO CART",
    brand: "Griva Oud",
    sku: "GRV-OUD-ROYAL",
    rating: 5,
    review_count: 18,
    is_featured: true,
    is_best_seller: false,
    is_trending: true,
    discount_percentage: 25,
    description: "Deep, rich, and mysterious concentrated perfume oil featuring high-quality Cambodian Agarwood, natural Amber, and Warm Spicy notes. Long-lasting scent projection.",
    stock: 12,
    main_image_url: "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=600",
    gallery_images: ["https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=600"],
    specifications: [
      { name: "Volume", value: "12 ml (1 Tola)" },
      { name: "Origin", value: "Doha, Qatar Central" },
      { name: "Concentration", value: "100% Pure Perfume Oil" }
    ],
    variants: []
  },
  {
    categoryName: "Islamic Learning Toys",
    title: "Interactive Islamic Learning Tablet for Kids",
    price: "49.00",
    old_price: "69.00",
    badge: "-28%",
    badge_color: "bg-red-500",
    button_text: "ADD TO CART",
    brand: "IslamicTech",
    sku: "EDU-TAB-ISL-2",
    rating: 5,
    review_count: 22,
    is_featured: true,
    is_best_seller: true,
    is_trending: false,
    discount_percentage: 28,
    description: "Fun, educational interactive tablet designed for children to learn basic short Surahs, daily Duas, Arabic alphabets, and prayer steps with crystal clear audio playback.",
    stock: 25,
    main_image_url: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?q=80&w=600",
    gallery_images: ["https://images.unsplash.com/photo-1587654780291-39c9404d746b?q=80&w=600"],
    specifications: [
      { name: "Age Group", value: "3+ years" },
      { name: "Language", value: "Arabic & English" },
      { name: "Power", value: "3x AAA Batteries" }
    ],
    variants: []
  },
  {
    categoryName: "Baby Play Mats",
    title: "Extra Thick Non-Toxic Reversible Baby Play Mat",
    price: "99.00",
    old_price: "129.00",
    badge: "Safe",
    badge_color: "bg-teal-500",
    button_text: "ADD TO CART",
    brand: "BabySoft",
    sku: "BABY-MAT-REV",
    rating: 4.8,
    review_count: 31,
    is_featured: true,
    is_best_seller: true,
    is_trending: false,
    discount_percentage: 23,
    description: "Constructed with premium high-density XPE foam material, fully waterproof, slip-resistant, and BPA-free. Soft cushioned structure protects baby during crawling and playing.",
    stock: 10,
    main_image_url: "https://images.unsplash.com/photo-1515488042361-404e9250afef?q=80&w=600",
    gallery_images: ["https://images.unsplash.com/photo-1515488042361-404e9250afef?q=80&w=600"],
    specifications: [
      { name: "Size", value: "200 x 180 x 1.5 cm" },
      { name: "Material", value: "Non-toxic XPE Foam" }
    ],
    variants: []
  },
  {
    categoryName: "Electronic Coffee Maker",
    title: "Smart Professional Espresso & Coffee Maker Machine",
    price: "299.00",
    old_price: "399.00",
    badge: "Smart",
    badge_color: "bg-orange-500",
    button_text: "ADD TO CART",
    brand: "GrivaHome",
    sku: "KIT-ESPRESSO-SMART",
    rating: 4.7,
    review_count: 45,
    is_featured: true,
    is_best_seller: true,
    is_trending: false,
    discount_percentage: 25,
    description: "Fully automated coffee brewer featuring 15 bars of pressure, digital touch control pad, temperature stabilizer, and build-in steam frother for barista-quality coffees.",
    stock: 8,
    main_image_url: "https://images.unsplash.com/photo-1588854337236-6889d631faa8?q=80&w=600",
    gallery_images: ["https://images.unsplash.com/photo-1588854337236-6889d631faa8?q=80&w=600"],
    specifications: [
      { name: "Water Tank", value: "1.8 Liters" },
      { name: "Power", value: "1450 Watts" }
    ],
    variants: []
  }
];

const SEED_SUBSCRIBERS = [
  { email: "jassim.althani@gmail.com", joinedDate: "June 01, 2026", country: "Qatar" },
  { email: "fatima.almansouri@yahoo.com", joinedDate: "May 29, 2026", country: "Qatar" },
  { email: "john.doe@verizon.com", joinedDate: "May 25, 2026", country: "United States" },
  { email: "sara.alkhanji@hotmail.com", joinedDate: "June 03, 2026", country: "Qatar" },
  { email: "ahmed.bukhari@gmail.com", joinedDate: "June 05, 2026", country: "Qatar" },
];

const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};

const seedDatabase = async () => {
  try {
    console.log("🚀 [SEED]: Starting database seeding process...");

    // Force Sync (Drops tables and recreates them clean)
    await sequelize.sync({ force: true });
    console.log("➕ [SEED]: Schemas re-created successfully.");

    // 1. Seed Admin User
    const admin = await User.create({
      name: "Admin",
      email: "admin@griva.qa",
      password: "AdminPassword123!", // Will be hashed automatically by user model hooks
      role: "admin",
    });
    console.log("➕ [SEED]: Default Admin account generated: admin@griva.qa / AdminPassword123!");

    // 2. Seed Customer Users
    const customer1 = await User.create({ name: "Jassim Al-Thani", email: "jassim.althani@gmail.com", password: "Customer123!", role: "customer" });
    const customer2 = await User.create({ name: "Fatima Al-Mansouri", email: "fatima.almansouri@yahoo.com", password: "Customer123!", role: "customer" });
    const customer3 = await User.create({ name: "John Doe", email: "john.doe@verizon.com", password: "Customer123!", role: "customer" });
    const customer4 = await User.create({ name: "Sara Al-Khanji", email: "sara.alkhanji@hotmail.com", password: "Customer123!", role: "customer" });
    console.log("➕ [SEED]: Customer accounts generated.");

    // 3. Seed Site Settings
    await SiteSetting.create({
      announcementBarEnabled: true,
      announcementBarText: "Free shipping across Doha for orders over $150!",
      fridaySaleEnabled: true,
      midnightSaleEnabled: false,
      whatsappNumber: "+97455551234",
      supportEmail: "support@griva.qa",
      shippingFee: 15.00,
    });
    console.log("➕ [SEED]: Site setting configurations seed added.");

    // 4. Seed Categories & Subcategories
    const categoryMap = {};
    for (const mainCat of SEED_CATEGORIES_TREE) {
      const parentSlug = mainCat.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const parentHref = `/category/${parentSlug}`;
      const dbParent = await Category.create({
        title: mainCat.title,
        slug: parentSlug,
        href: parentHref,
        image_url: mainCat.image_url,
        is_active: true,
      });

      for (const subTitle of mainCat.subcategories) {
        const subSlug = subTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const subHref = `${parentHref}?sub=${subSlug}`;
        const dbSub = await SubCategory.create({
          category_id: dbParent.id,
          title: subTitle,
          slug: subSlug,
          href: subHref,
          image_url: mainCat.image_url,
          is_active: true,
        });
        categoryMap[subTitle] = dbSub.id;
      }
    }
    console.log("➕ [SEED]: Product category taxonomy with parent-child subcategories generated.");

    // 5. Seed Products
    const productMap = {};
    for (const prod of SEED_PRODUCTS) {
      const subCatId = categoryMap[prod.categoryName];
      if (subCatId) {
        const dbProd = await Product.create({
          subcategory_id: subCatId,
          title: prod.title,
          slug: slugify(prod.title),
          sku: prod.sku,
          brand: prod.brand,
          rating: prod.rating,
          review_count: prod.review_count,
          badge_color: prod.badge_color,
          button_text: prod.button_text,
          is_featured: prod.is_featured,
          is_best_seller: prod.is_best_seller,
          is_trending: prod.is_trending,
          discount_percentage: prod.discount_percentage,
          price: prod.price,
          old_price: prod.old_price,
          badge: prod.badge,
          description: prod.description,
          stock: prod.stock,
          specifications: prod.specifications || [],
          variants: prod.variants || [],
          gallery_images: prod.gallery_images || [],
          main_image_url: prod.main_image_url,
        });

        // Seed Product Secondary Images
        for (const imgUrl of (prod.gallery_images || [])) {
          await ProductImage.create({
            product_id: dbProd.id,
            image_url: imgUrl,
          });
        }

        productMap[prod.title] = { id: dbProd.id, price: parseFloat(prod.price) };
      }
    }
    console.log("➕ [SEED]: Premium products seed successfully mapped and added.");

    // 6. Seed Flash Sales
    const startTime = new Date();
    const endTime = new Date();
    endTime.setDate(endTime.getDate() + 3); // 3 days campaign
    const flashSale = await FlashSale.create({
      title: "Super Flash Sale June",
      start_time: startTime,
      end_time: endTime,
      is_active: true,
    });

    // Link some products to the flash sale
    const firstProduct = Object.values(productMap)[0];
    const secondProduct = Object.values(productMap)[1];
    if (firstProduct) {
      await FlashSaleProduct.create({
        flash_sale_id: flashSale.id,
        product_id: firstProduct.id,
        flash_price: (firstProduct.price * 0.8).toFixed(2), // 20% off additional
        flash_stock: 5,
      });
    }
    if (secondProduct) {
      await FlashSaleProduct.create({
        flash_sale_id: flashSale.id,
        product_id: secondProduct.id,
        flash_price: (secondProduct.price * 0.85).toFixed(2),
        flash_stock: 10,
      });
    }
    console.log("➕ [SEED]: Flash sale campaigns created.");

    // 7. Seed Reviews
    const dbProducts = await Product.findAll();
    for (const p of dbProducts) {
      await Review.create({
        product_id: p.id,
        user_id: customer1.id,
        rating: 5,
        title: "Incredible quality",
        body: "I am extremely pleased with this purchase. Outstanding service and fast delivery inside Doha!",
        verified: true,
      });
      await Review.create({
        product_id: p.id,
        user_id: customer2.id,
        rating: 4,
        title: "Good value",
        body: "Reliable specs and solid build quality. Highly recommended product.",
        verified: true,
      });
    }
    console.log("➕ [SEED]: Mock product reviews populated.");

    // 8. Seed Banners
    await Banner.create({
      type: "slide",
      badge: "LIMITED DEALS",
      title: "Next-Gen VR Experience",
      subtitle: "Unbelievable Mixed Reality Immersion",
      price: "$499.00",
      image: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?q=80&w=800",
      bg: "bg-gradient-to-r from-orange-600/90 to-amber-500/90",
      href: "/products/meta-quest-3-128gb-vr-headset-mixed-reality",
      isActive: true,
    });
    await Banner.create({
      type: "offer",
      badge: "EXCLUSIVE",
      title: "Audio Perfection",
      subtitle: "Sony Noise Cancelling Series",
      price: "$348.00",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800",
      bg: "bg-blue-600",
      href: "/category/gadgets-electronics?sub=earphones",
      isActive: true,
    });
    console.log("➕ [SEED]: Store Banners and Slides populated.");

    // 9. Seed Subscribers
    await Subscriber.bulkCreate(SEED_SUBSCRIBERS);
    console.log("➕ [SEED]: Newsletter subscriber list populated.");

    // 10. Seed Mock Orders with Customer Info for Analytics
    const productIds = Object.values(productMap);
    const customers = [customer1, customer2, customer3, customer4];
    const statuses = ["completed", "completed", "completed", "shipped", "pending", "cancelled"];
    const addresses = [
      "Al Sadd District, Doha, Qatar",
      "West Bay Tower 12, Doha, Qatar",
      "Al Wakra City Center, Al Wakra, Qatar",
      "The Pearl - Qatar, Porto Arabia, Doha",
    ];

    const mockOrderDefs = [
      { dayOffset: 0, customerId: 0, productIdx: 0, qty: 1, status: "pending" },
      { dayOffset: 1, customerId: 1, productIdx: 1, qty: 1, status: "shipped" },
      { dayOffset: 1, customerId: 2, productIdx: 5, qty: 1, status: "completed" },
      { dayOffset: 2, customerId: 3, productIdx: 3, qty: 2, status: "completed" },
      { dayOffset: 3, customerId: 0, productIdx: 6, qty: 1, status: "completed" },
      { dayOffset: 4, customerId: 1, productIdx: 2, qty: 1, status: "shipped" },
      { dayOffset: 4, customerId: 2, productIdx: 7, qty: 1, status: "completed" },
      { dayOffset: 5, customerId: 3, productIdx: 4, qty: 1, status: "completed" },
      { dayOffset: 6, customerId: 0, productIdx: 1, qty: 1, status: "cancelled" },
      { dayOffset: 6, customerId: 1, productIdx: 5, qty: 2, status: "completed" },
      { dayOffset: 7, customerId: 2, productIdx: 0, qty: 1, status: "completed" },
      { dayOffset: 8, customerId: 3, productIdx: 2, qty: 1, status: "shipped" },
    ];

    for (const def of mockOrderDefs) {
      if (productIds[def.productIdx]) {
        const prod = productIds[def.productIdx];
        const orderTotal = prod.price * def.qty;
        const orderDate = new Date();
        orderDate.setDate(orderDate.getDate() - (10 - def.dayOffset));

        const order = await Order.create({
          user_id: customers[def.customerId].id,
          total_price: orderTotal,
          shipping_address: addresses[def.customerId],
          status: def.status,
          customer_name: `Customer Name ${def.customerId + 1}`,
          customer_phone: `+974777${def.customerId}123`,
          customer_email: customers[def.customerId].email,
          payment_method: "COD",
          payment_status: def.status === "completed" ? "paid" : "unpaid",
          delivery_notes: "Leave package at reception desk.",
          city: "Doha",
          createdAt: orderDate,
          updatedAt: orderDate,
        });

        await OrderItem.create({
          order_id: order.id,
          product_id: prod.id,
          quantity: def.qty,
          price_at_purchase: prod.price,
          selected_color: "Arctic Gray",
          selected_storage: "256GB",
        });
      }
    }
    console.log("➕ [SEED]: Mock order transactions generated for analytics charts.");

    console.log("🟢 [SEED]: Seeding complete! Database is production-ready.");
    process.exit(0);
  } catch (error) {
    console.error("🔴 [SEED]: Seeding failed with error:");
    console.error(error);
    process.exit(1);
  }
};

// Check if run directly
if (require.main === module) {
  seedDatabase();
}
