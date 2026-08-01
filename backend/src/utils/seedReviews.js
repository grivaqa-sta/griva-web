/**
 * SEED REVIEWS UTILITY (seedReviews.js)
 * 
 * Automatically generates natural, simple human reviews for products in the database.
 * Uses realistic Kerala & Qatar names, staggered review dates, and short natural feedback.
 */

const Product = require("../models/Product");
const Review = require("../models/Review");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Sample Pool of Realistic Customers (Kerala + Qatar names)
const CUSTOMER_POOL = [
  { name: "Faisal P.K.", email: "faisal.pk.qtr@gmail.com" },
  { name: "Rashid Al-Kuwari", email: "rashid.alkuwari@qatar.qa" },
  { name: "Anjali Nair", email: "anjali.nair.doha@gmail.com" },
  { name: "Hamad Al-Marri", email: "hamad.almarri@outlook.com" },
  { name: "Mohammed Shafi", email: "shafi.m.doha@gmail.com" },
  { name: "Fatima Al-Thani", email: "fatima.althani@qatar.qa" },
  { name: "Haris V.M.", email: "haris.vm.qtr@gmail.com" },
  { name: "Sara Al-Mansoori", email: "sara.almansoori@gmail.com" },
  { name: "Jithin K.P.", email: "jithin.kp.doha@gmail.com" },
  { name: "Nimmy George", email: "nimmy.george.qtr@gmail.com" },
  { name: "Shaji Varghese", email: "shaji.varghese@gmail.com" },
  { name: "Khalid Al-Kaabi", email: "khalid.alkaabi@outlook.com" },
  { name: "Snigdha Thomas", email: "snigdha.t.doha@gmail.com" },
  { name: "Omar Hassan", email: "omar.hassan.qtr@gmail.com" },
  { name: "Rahul Raj", email: "rahul.raj.doha@gmail.com" },
  { name: "Mariam Al-Hajri", email: "mariam.alhajri@qatar.qa" },
  { name: "Vishnu Prasad", email: "vishnu.p.doha@gmail.com" },
  { name: "Noura Al-Sulaiti", email: "noura.alsulaiti@gmail.com" },
  { name: "Mathew Philip", email: "mathew.p.qtr@gmail.com" },
  { name: "Youssef Al-Eida", email: "youssef.aleida@outlook.com" },
  { name: "Riya Joseph", email: "riya.joseph.doha@gmail.com" },
  { name: "Tariq Mahmoud", email: "tariq.mahmoud@gmail.com" },
  { name: "Midhun Mohan", email: "midhun.m.qtr@gmail.com" },
  { name: "Dana Al-Majid", email: "dana.almajid@qatar.qa" }
];

// Simple, Real Human Reviews (Short & Natural)
const SIMPLE_REVIEWS = [
  { rating: 5, title: "Super product", body: "Good product, fast delivery." },
  { rating: 5, title: "100% Original", body: "Original item, box was sealed. Delivered in 2 hours." },
  { rating: 5, title: "Adipoli item!", body: "Adipoli item! Super quality, will buy again." },
  { rating: 4, title: "Good purchase", body: "Value for money. Delivery boy called before coming." },
  { rating: 5, title: "Fast delivery", body: "Ordered yesterday and received today morning. Smooth experience." },
  { rating: 5, title: "Very nice", body: "Nice item, good price compared to market." },
  { rating: 4, title: "Recommended", body: "Good quality and prompt delivery. Recommended!" },
  { rating: 5, title: "Satisfied customer", body: "Proper packing and original item. Thanks GriVA." },
  { rating: 5, title: "Quick service", body: "Fast delivery to West Bay. Item is working perfectly." },
  { rating: 5, title: "Good quality", body: "Super quality item. Packaging was very neat." },
  { rating: 5, title: "Worth it", body: "Totally worth the price. Delivery took less than 3 hours in Lusail." },
  { rating: 4, title: "Good product", body: "Nice product, smooth order process and quick delivery." },
  { rating: 5, title: "Excellent", body: "Exact same item as shown. Very satisfied!" },
  { rating: 5, title: "Original item", body: "Original product with genuine packing. Highly recommended." },
  { rating: 4, title: "Value for money", body: "Good item, affordable price. Delivery was prompt." },
  { rating: 5, title: "Very happy", body: "Second time buying from GriVA, great service as always." }
];

/**
 * Seed realistic reviews for products in the database
 */
async function seedProductionReviews() {
  try {
    console.log("🌱 [SEED REVIEWS]: Checking products for authentic human review population...");

    // 1. Fetch all products
    const products = await Product.findAll();
    if (!products || products.length === 0) {
      console.log("ℹ️ [SEED REVIEWS]: No products found in database.");
      return { success: true, message: "No products found." };
    }

    // 2. Ensure customer user accounts exist in DB
    const dummyPasswordHash = await bcrypt.hash("Customer@GriVA2026", 10);
    const createdUsers = [];

    for (const cust of CUSTOMER_POOL) {
      let [user] = await User.findOrCreate({
        where: { email: cust.email },
        defaults: {
          name: cust.name,
          email: cust.email,
          password: dummyPasswordHash,
          role: "customer",
          status: "ACTIVE"
        }
      });
      createdUsers.push(user);
    }

    let seededCount = 0;

    // 3. Loop over products and seed if review_count < 2
    for (const product of products) {
      const existingReviewsCount = await Review.count({ where: { product_id: product.id } });

      if (existingReviewsCount < 2) {
        // Generate 2 to 4 reviews per product
        const reviewsToCreateCount = Math.floor(Math.random() * 3) + 2; // 2, 3, or 4
        
        // Pick random unique users for this product
        const shuffledUsers = [...createdUsers].sort(() => 0.5 - Math.random());
        const selectedUsers = shuffledUsers.slice(0, reviewsToCreateCount);

        let totalRatingSum = 0;

        for (let i = 0; i < selectedUsers.length; i++) {
          const user = selectedUsers[i];
          const reviewTemplate = SIMPLE_REVIEWS[Math.floor(Math.random() * SIMPLE_REVIEWS.length)];
          
          // Random date over past 45 days
          const daysAgo = Math.floor(Math.random() * 45) + 1;
          const reviewDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

          await Review.create({
            product_id: product.id,
            user_id: user.id,
            rating: reviewTemplate.rating,
            title: reviewTemplate.title,
            body: reviewTemplate.body,
            verified: true,
            createdAt: reviewDate,
            updatedAt: reviewDate
          });

          totalRatingSum += reviewTemplate.rating;
          seededCount++;
        }

        // Recalculate average rating and review_count
        const allProductReviews = await Review.findAll({ where: { product_id: product.id } });
        const avg = (allProductReviews.reduce((sum, r) => sum + r.rating, 0) / allProductReviews.length).toFixed(2);

        product.rating = parseFloat(avg);
        product.review_count = allProductReviews.length;
        await product.save();
      }
    }

    console.log(`🟢 [SEED REVIEWS]: Successfully seeded ${seededCount} simple human reviews across ${products.length} products!`);
    return { success: true, seededCount, totalProducts: products.length };
  } catch (error) {
    console.error("❌ [SEED REVIEWS ERROR]:", error.message);
    return { success: false, error: error.message };
  }
}

module.exports = { seedProductionReviews };
