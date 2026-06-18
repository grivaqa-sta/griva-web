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
    subcategories: ["Power Banks", "Chargers", "Cables", "Earphones", "Speakers", "Audio Cables", "Screen Protectors", "Phone Cases", "Smartwatches", "Fitness Bands"]
  },
  {
    title: "Gaming Accessories",
    image_url: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=300",
    subcategories: ["Mobile Game Controllers", "Triggers", "Gaming Earbuds", "Gaming Headsets", "Phone Coolers", "Gaming Finger Sleeves", "Gaming Grip Stands"]
  },
  {
    title: "Kitchen Appliances & Essentials",
    image_url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=300",
    subcategories: ["Kitchen Rack", "Shoe Rack", "Washing Machine Rack", "Vegetable Rack", "Electronic Coffee Maker", "Egg Boilers", "Egg Beaters"]
  }
];

const SEED_PRODUCTS = [
  {
    categoryName: "Perfumes",
    title: "Oud Ispahan Premium Perfume 100ml",
    price: "185.00",
    old_price: "245.00",
    badge: "BEST SELLER",
    badge_color: "bg-orange-500",
    button_text: "Buy Now",
    brand: "Griva Oud",
    sku: "GRV-OUD-ISP",
    rating: 4.9,
    review_count: 42,
    is_featured: true,
    is_best_seller: true,
    is_trending: true,
    discount_percentage: 24,
    description: "An elegant, woody interpretation of Eastern notes. Oud Ispahan is an invitation to discover the charm of the Orient with intense rose and precious oud woods.",
    stock: 25,
    main_image_url: "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800",
    gallery_image_urls: ["https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800"],
    specs: [
      { label: "Volume", value: "100ml" },
      { label: "Type", value: "Eau de Parfum" },
      { label: "Fragrance Family", value: "Woody Floral" }
    ],
    colors: [],
    storage_options: []
  },
  {
    categoryName: "Buhoor",
    title: "Premium Arabic Oud Buhoor 50g",
    price: "75.00",
    old_price: "95.00",
    badge: "NEW",
    badge_color: "bg-green-500",
    button_text: "Add to Cart",
    brand: "Griva Oud",
    sku: "GRV-BUH-50",
    rating: 4.8,
    review_count: 15,
    is_featured: true,
    is_best_seller: false,
    is_trending: true,
    discount_percentage: 21,
    description: "Rich, slow-burning premium agarwood chips infused with high-quality amber, musk, and natural essential oils. Fills your home with a welcoming Eastern aroma.",
    stock: 40,
    main_image_url: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=800",
    gallery_image_urls: ["https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=800"],
    specs: [
      { label: "Weight", value: "50g" },
      { label: "Form", value: "Wood Chips / Incense" }
    ],
    colors: [],
    storage_options: []
  },
  {
    categoryName: "Islamic Learning Toys",
    title: "Interactive Islamic Learning Tablet for Kids",
    price: "49.00",
    old_price: "69.00",
    badge: "-28%",
    badge_color: "bg-red-500",
    button_text: "Buy Tablet",
    brand: "IslamicTech",
    sku: "EDU-TAB-ISL",
    rating: 4.7,
    review_count: 18,
    is_featured: true,
    is_best_seller: true,
    is_trending: false,
    discount_percentage: 28,
    description: "An educational tablet with high-quality audio recordings of short Surahs, Duas, Arabic alphabets, and prayers. The perfect interactive way to teach children basic Islamic studies.",
    stock: 15,
    main_image_url: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?q=80&w=800",
    gallery_image_urls: ["https://images.unsplash.com/photo-1587654780291-39c9404d746b?q=80&w=800"],
    specs: [
      { label: "Language", value: "Arabic & English" },
      { label: "Battery", value: "3x AAA (Not included)" },
      { label: "Age Group", value: "3+ years" }
    ],
    colors: [
      { name: "Sky Blue", hex: "#60a5fa" },
      { name: "Soft Pink", hex: "#f472b6" }
    ],
    storage_options: []
  },
  {
    categoryName: "Remote Control Cars & Toys",
    title: "High-Speed 4WD Remote Control Off-Road Crawler",
    price: "120.00",
    old_price: "159.00",
    badge: "15% OFF",
    badge_color: "bg-blue-500",
    button_text: "Buy RC Car",
    brand: "ToyTech",
    sku: "TOY-RC-CAR",
    rating: 4.5,
    review_count: 9,
    is_featured: false,
    is_best_seller: false,
    is_trending: true,
    discount_percentage: 15,
    description: "Conquer any terrain with this 1:16 scale remote control crawler. Features high-torque independent suspension, 2.4GHz anti-interference transmitter, and dual rechargeable batteries.",
    stock: 12,
    main_image_url: "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?q=80&w=800",
    gallery_image_urls: ["https://images.unsplash.com/photo-1594787318286-3d835c1d207f?q=80&w=800"],
    specs: [
      { label: "Scale", value: "1:16" },
      { label: "Max Speed", value: "20 km/h" },
      { label: "Battery Life", value: "25 mins per battery" }
    ],
    colors: [
      { name: "Racing Red", hex: "#dc2626" },
      { name: "Lime Green", hex: "#16a34a" }
    ],
    storage_options: []
  },
  {
    categoryName: "Baby Play Mats",
    title: "Extra Thick Non-Toxic Baby Play Mat (200x180cm)",
    price: "99.00",
    old_price: "129.00",
    badge: "SAFE",
    badge_color: "bg-teal-500",
    button_text: "Buy Mat",
    brand: "BabySoft",
    sku: "BAB-MAT-XG",
    rating: 4.9,
    review_count: 21,
    is_featured: true,
    is_best_seller: true,
    is_trending: false,
    discount_percentage: 23,
    description: "Reversible, water-resistant play mat constructed with high-density XPE foam. Features textured educational designs on both sides to stimulate baby's crawling and sensory skills safely.",
    stock: 10,
    main_image_url: "https://images.unsplash.com/photo-1515488042361-404e9250afef?q=80&w=800",
    gallery_image_urls: ["https://images.unsplash.com/photo-1515488042361-404e9250afef?q=80&w=800"],
    specs: [
      { label: "Dimensions", value: "200 x 180 x 1.5 cm" },
      { label: "Material", value: "Non-toxic XPE Foam" }
    ],
    colors: [],
    storage_options: []
  },
  {
    categoryName: "Power Banks",
    title: "Anker PowerCore 20000mAh Ultra High Capacity Power Bank",
    price: "149.00",
    old_price: "189.00",
    badge: "HOT",
    badge_color: "bg-red-500",
    button_text: "Shop Anker",
    brand: "Anker",
    sku: "ANK-PWR-20K",
    rating: 4.8,
    review_count: 35,
    is_featured: true,
    is_best_seller: true,
    is_trending: true,
    discount_percentage: 21,
    description: "One of the most compact 20,000mAh portable chargers available. High-speed PowerIQ and VoltageBoost technologies combine to deliver the optimal charge for your devices.",
    stock: 30,
    main_image_url: "https://images.unsplash.com/photo-1609592424085-783226db2d71?q=80&w=800",
    gallery_image_urls: ["https://images.unsplash.com/photo-1609592424085-783226db2d71?q=80&w=800"],
    specs: [
      { label: "Capacity", value: "20,000 mAh" },
      { label: "Ports", value: "2x USB-A, 1x USB-C Input/Output" },
      { label: "Max Output", value: "18W Power Delivery" }
    ],
    colors: [
      { name: "Matte Black", hex: "#111827" },
      { name: "Classic White", hex: "#f3f4f6" }
    ],
    storage_options: []
  },
  {
    categoryName: "Smartwatches",
    title: "Apple Watch Ultra 2 GPS + Cellular Titanium 49mm",
    price: "799.00",
    old_price: "899.00",
    badge: "-11%",
    badge_color: "bg-blue-500",
    button_text: "Shop Watch",
    brand: "Apple",
    sku: "APL-WAU2-CELL",
    rating: 4.9,
    review_count: 15,
    is_featured: false,
    is_best_seller: true,
    is_trending: true,
    discount_percentage: 11,
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
    categoryName: "Earphones",
    title: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
    price: "348.00",
    old_price: "399.00",
    badge: "-12%",
    badge_color: "bg-red-500",
    button_text: "Buy Sony",
    brand: "Sony",
    sku: "SONY-XM5-W",
    rating: 4.7,
    review_count: 24,
    is_featured: true,
    is_best_seller: true,
    is_trending: false,
    discount_percentage: 12,
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
    categoryName: "Mobile Game Controllers",
    title: "Mobile Gaming Controller for iPhone & Android",
    price: "45.00",
    old_price: "59.00",
    badge: "PRO-PLAY",
    badge_color: "bg-purple-600",
    button_text: "Buy Controller",
    brand: "GameGrip",
    sku: "GAM-MOB-CTR",
    rating: 4.6,
    review_count: 14,
    is_featured: true,
    is_best_seller: false,
    is_trending: true,
    discount_percentage: 23,
    description: "Ergonomic mobile game controller with direct plug-in connection for latency-free gaming. Fits phones up to 6.7 inches and charges while you play.",
    stock: 20,
    main_image_url: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=800",
    gallery_image_urls: ["https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=800"],
    specs: [
      { label: "Connectivity", value: "USB-C / Lightning" },
      { label: "Compatible Devices", value: "iOS / Android" }
    ],
    colors: [{ name: "Matte Black", hex: "#0f172a" }],
    storage_options: []
  },
  {
    categoryName: "Electronic Coffee Maker",
    title: "Automatic Drip Coffee Maker with In-Built Grinder",
    price: "299.00",
    old_price: "359.00",
    badge: "KITCHEN DELIGHT",
    badge_color: "bg-amber-600",
    button_text: "Shop Coffee Maker",
    brand: "GrivaHome",
    sku: "KIT-CFM-GRD",
    rating: 4.8,
    review_count: 11,
    is_featured: true,
    is_best_seller: true,
    is_trending: false,
    discount_percentage: 16,
    description: "Wake up to fresh coffee beans ground right before brewing. Built-in conical burr grinder, 1.5L glass carafe, and programmable 24-hour timer settings.",
    stock: 8,
    main_image_url: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=800",
    gallery_image_urls: ["https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=800"],
    specs: [
      { label: "Capacity", value: "1.5 Liters (12 Cups)" },
      { label: "Grinder settings", value: "5 grind size levels" },
      { label: "Power", value: "1000 Watts" }
    ],
    colors: [{ name: "Brushed Steel", hex: "#94a3b8" }],
    storage_options: []
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
      const parentHref = `/category/${mainCat.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
      const dbParent = await Category.create({
        title: mainCat.title,
        href: parentHref,
        image_url: mainCat.image_url,
        parent_id: null
      });
      categoryMap[mainCat.title] = dbParent.id;

      for (const subTitle of mainCat.subcategories) {
        const subHref = `${parentHref}?sub=${subTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
        const dbSub = await Category.create({
          title: subTitle,
          href: subHref,
          image_url: mainCat.image_url,
          parent_id: dbParent.id
        });
        categoryMap[subTitle] = dbSub.id;
      }
    }
    console.log("➕ [SEED]: Product category taxonomy with parent-child subcategories generated.");

    // 5. Seed Products
    const productMap = {};
    for (const prod of SEED_PRODUCTS) {
      const catId = categoryMap[prod.categoryName];
      if (catId) {
        const dbProd = await Product.create({
          category_id: catId,
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
          specs: prod.specs,
          colors: prod.colors,
          storage_options: prod.storage_options,
          main_image_url: prod.main_image_url,
          gallery_image_urls: prod.gallery_image_urls,
        });

        // Seed Product Secondary Images
        for (const imgUrl of prod.gallery_image_urls) {
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
