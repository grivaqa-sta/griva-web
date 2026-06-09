/**
 * DATABASE SEEDING UTILITY (seed.js)
 * 
 * Sets up a clean initial database state by force syncing schemas and inserting default seeds.
 */

const { sequelize } = require("./db");
const Category = require("../models/Category");
const Product = require("../models/Product");
const Setting = require("../models/Setting");
const Subscriber = require("../models/Subscriber");
const User = require("../models/User");

const SEED_CATEGORIES = [
  { title: "Laptops" },
  { title: "Television" },
  { title: "Speakers" },
  { title: "Headphones" },
  { title: "Gaming" },
  { title: "Gadgets" },
];

const SEED_PRODUCTS = [
  {
    categoryName: "Gadgets",
    title: "DJI Mini 4 Pro Drone Flight Combo - 4K HDR Camera",
    price: "759.99",
    old_price: "999.99",
    badge: "-24%",
    description: "The DJI Mini 4 Pro is our most advanced mini-camera drone to date. It integrates powerful imaging capabilities, omnidirectional obstacle sensing, ActiveTrack 360° with the new Trace Mode, and 20km FHD video transmission.",
    stock: 8,
    main_image_url: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=800&auto=format&fit=crop",
    gallery_image_urls: ["https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=800&auto=format&fit=crop"],
    specs: [
      { label: "Takeoff Weight", value: "< 249 g" },
      { label: "Max Flight Time", value: "34 mins (Standard)" },
      { label: "Camera Sensor", value: "1/1.3-inch CMOS, 48MP" },
      { label: "Video Resolution", value: "4K/60fps HDR" },
    ],
    colors: [
      { name: "Arctic Gray", hex: "#d1d5db" },
      { name: "Midnight Black", hex: "#111827" },
    ],
    storage_options: [
      { label: "64GB", value: "64gb" },
      { label: "256GB", value: "256gb" },
    ]
  },
  {
    categoryName: "Gadgets",
    title: "Meta Quest 3 128GB VR Headset - Mixed Reality",
    price: "499.00",
    old_price: "599.00",
    badge: "-16%",
    description: "Breakthrough mixed reality. Transform your home into a virtual playground where virtual elements blend into your physical space. Powerful performance with twice the graphics processing power of Quest 2.",
    stock: 12,
    main_image_url: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?q=80&w=800&auto=format&fit=crop",
    gallery_image_urls: ["https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?q=80&w=800&auto=format&fit=crop"],
    specs: [
      { label: "Display Resolution", value: "2064x2208 pixels per eye" },
      { label: "Refresh Rate", value: "90Hz, 120Hz experimental" },
      { label: "Processor", value: "Snapdragon XR2 Gen 2" },
    ],
    colors: [{ name: "Classic White", hex: "#f3f4f6" }],
    storage_options: [
      { label: "128GB", value: "128gb" },
      { label: "512GB", value: "512gb" },
    ]
  },
  {
    categoryName: "Gadgets",
    title: "Apple Watch Ultra 2 GPS + Cellular Titanium",
    price: "799.00",
    old_price: "899.00",
    badge: "-11%",
    description: "The ultimate sports and adventure watch. Featuring a lightweight titanium case, extra-long battery life, and the brightest Always-On Retina display ever.",
    stock: 5,
    main_image_url: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?q=80&w=800&auto=format&fit=crop",
    gallery_image_urls: ["https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?q=80&w=800&auto=format&fit=crop"],
    specs: [
      { label: "Case Size", value: "49mm Grade 5 Titanium" },
      { label: "Water Resistance", value: "100m (WR100)" },
      { label: "Battery Life", value: "Up to 36 hours (Normal Use)" },
    ],
    colors: [
      { name: "Natural Titanium", hex: "#c8b9a3" },
      { name: "Ocean Band Blue", hex: "#1d4ed8" },
    ],
    storage_options: [{ label: "64GB", value: "64gb" }]
  },
  {
    categoryName: "Headphones",
    title: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
    price: "348.00",
    old_price: "399.00",
    badge: "-12%",
    description: "Sony WH-1000XM5 redefine distraction-free listening. Two processors control 8 microphones for unprecedented noise cancelling quality and exceptional call performance.",
    stock: 15,
    main_image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop",
    gallery_image_urls: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop"],
    specs: [
      { label: "Driver Unit", value: "30mm Dome Type" },
      { label: "Battery Life", value: "Up to 30 hours (ANC ON)" },
    ],
    colors: [
      { name: "Black", hex: "#171717" },
      { name: "Platinum Silver", hex: "#e5e5e5" },
    ],
    storage_options: []
  },
  {
    categoryName: "Gadgets",
    title: "GoPro HERO12 Black Waterproof Action Camera",
    price: "399.00",
    old_price: "449.00",
    description: "Incredible image quality, even better HyperSmooth video stabilization, and a huge boost in battery performance. Takes best-in-class 5.3K video and HDR photos.",
    stock: 9,
    main_image_url: "https://images.unsplash.com/photo-1564466809058-bf4114d55352?q=80&w=800&auto=format&fit=crop",
    gallery_image_urls: ["https://images.unsplash.com/photo-1564466809058-bf4114d55352?q=80&w=800&auto=format&fit=crop"],
    specs: [
      { label: "Video Resolution", value: "5.3K/60fps, 4K/120fps" },
      { label: "Photo Resolution", value: "27MP" },
    ],
    colors: [{ name: "Standard Black", hex: "#1e293b" }],
    storage_options: [{ label: "Standard", value: "standard" }]
  },
  {
    categoryName: "Laptops",
    title: "MacBook Air 15-inch M3 Chip 16GB/512GB SSD",
    price: "1499.00",
    old_price: "1699.00",
    badge: "-11%",
    description: "The 15-inch MacBook Air is superlight and fits easily in your bag. Built with the powerhouse M3 chip to handle multitasking and pro workloads easily.",
    stock: 6,
    main_image_url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop",
    gallery_image_urls: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop"],
    specs: [
      { label: "Display", value: "15.3-inch Liquid Retina Display" },
      { label: "Processor", value: "Apple M3 Chip (8-core CPU)" },
    ],
    colors: [
      { name: "Space Gray", hex: "#3a3a3c" },
      { name: "Silver", hex: "#e8e8e8" },
    ],
    storage_options: [
      { label: "256GB", value: "256gb" },
      { label: "512GB", value: "512gb" },
    ]
  },
  {
    categoryName: "Speakers",
    title: "Anker Soundcore Motion X600 Portable Hi-Res Speaker",
    price: "199.99",
    old_price: "249.99",
    badge: "-20%",
    description: "Inspired by theater acoustics, Motion X600 has 5 drivers and 5 amplifiers that are positioned to deliver sound all around you. Feels like you're in the room with the artist.",
    stock: 14,
    main_image_url: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=800&auto=format&fit=crop",
    gallery_image_urls: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=800&auto=format&fit=crop"],
    specs: [
      { label: "Audio Output", value: "50W Spatial Audio" },
      { label: "Playtime", value: "Up to 12 hours" },
    ],
    colors: [
      { name: "Polar Gray", hex: "#4b5563" },
    ],
    storage_options: []
  },
  {
    categoryName: "Gaming",
    title: "Xbox Series X Console 1TB Solid State Digital Drive",
    price: "499.00",
    old_price: "549.00",
    badge: "-9%",
    description: "Play thousands of games from four generations of Xbox on the fastest, most powerful Xbox console ever. Experience next-gen speed with the Xbox Velocity Architecture.",
    stock: 4,
    main_image_url: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=800&auto=format&fit=crop",
    gallery_image_urls: ["https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=800&auto=format&fit=crop"],
    specs: [
      { label: "Storage", value: "1TB Custom NVME SSD" },
      { label: "Resolution", value: "True 4K Gaming" },
    ],
    colors: [{ name: "Matte Black", hex: "#18181b" }],
    storage_options: []
  }
];

const SEED_SUBSCRIBERS = [
  { email: "jassim.althani@gmail.com", joinedDate: "June 01, 2026", country: "Qatar" },
  { email: "fatima.almansouri@yahoo.com", joinedDate: "May 29, 2026", country: "Qatar" },
  { email: "john.doe@verizon.com", joinedDate: "May 25, 2026", country: "United States" },
];

const seedDatabase = async () => {
  try {
    console.log("🚀 [SEED]: Starting database seeding process...");
    
    // 1. Force Sync (Drops tables and recreates them clean)
    await sequelize.sync({ force: true });
    console.log("➕ [SEED]: Schemas re-created successfully.");

    // 2. Seed Admin User
    await User.create({
      email: "admin@griva.qa",
      password: "AdminPassword123!", // Will be hashed automatically by user model hooks
      role: "admin",
    });
    console.log("➕ [SEED]: Default Admin account generated: admin@griva.qa / AdminPassword123!");

    // 3. Seed Settings
    await Setting.create({
      announcementBarEnabled: true,
      fridaySaleEnabled: true,
      midnightSaleEnabled: false,
    });
    console.log("➕ [SEED]: Campaign settings seed added.");

    // 4. Seed Categories
    const categoryMap = {};
    for (const cat of SEED_CATEGORIES) {
      const dbCat = await Category.create(cat);
      categoryMap[dbCat.title] = dbCat.id;
    }
    console.log("➕ [SEED]: Product category taxonomy generated.");

    // 5. Seed Products
    for (const prod of SEED_PRODUCTS) {
      const catId = categoryMap[prod.categoryName];
      if (catId) {
        await Product.create({
          category_id: catId,
          title: prod.title,
          price: prod.price,
          old_price: prod.old_price,
          badge: prod.badge,
          description: prod.description,
          stock: prod.stock,
          specs: prod.specs,
          colors: prod.colors,
          storage_options: prod.storage_options,
          main_image_url: prod.main_image_url,
          gallery_image_urls: prod.gallery_image_urls,
        });
      }
    }
    console.log("➕ [SEED]: Premium products seed successfully mapped and added.");

    // 6. Seed Subscribers
    await Subscriber.bulkCreate(SEED_SUBSCRIBERS);
    console.log("➕ [SEED]: Newsletter subscriber list populated.");

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
