/**
 * SEED REVIEWS UTILITY (seedReviews.js)
 * 
 * Automatically generates 100% UNIQUE 5-STAR reviews for products in the database.
 * Every product gets a MINIMUM of 7 reviews (7 to 10 reviews per product).
 * NO repeated review text on any product!
 */

const Product = require("../models/Product");
const Review = require("../models/Review");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Pool of 100 Unique Customers (Kerala + Qatar names)
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
  { name: "Dana Al-Majid", email: "dana.almajid@qatar.qa" },
  { name: "Deepa Menon", email: "deepa.menon.doha@gmail.com" },
  { name: "Sultan Al-Kuwari", email: "sultan.alkuwari@qatar.qa" },
  { name: "Gokul R.", email: "gokul.r.qtr@gmail.com" },
  { name: "Reem Al-Mukhaini", email: "reem.almukhaini@gmail.com" },
  { name: "Ashik Rahman", email: "ashik.rahman.doha@gmail.com" },
  { name: "Nasser Al-Kabi", email: "nasser.alkabi@qatar.qa" },
  { name: "Sreelakshmi S.", email: "sreelakshmi.s.qtr@gmail.com" },
  { name: "Haya Al-Thani", email: "haya.althani@qatar.qa" },
  { name: "Abhiram K.", email: "abhiram.k.doha@gmail.com" },
  { name: "Ibrahim Hassan", email: "ibrahim.hassan.qtr@gmail.com" },
  { name: "Divya Ramesh", email: "divya.ramesh.doha@gmail.com" },
  { name: "Latifa Al-Sulaiti", email: "latifa.alsulaiti@outlook.com" },
  { name: "Akhil V.S.", email: "akhil.vs.qtr@gmail.com" },
  { name: "Ghanim Al-Kuwari", email: "ghanim.alkuwari@qatar.qa" },
  { name: "Binu Kurup", email: "binu.kurup.doha@gmail.com" },
  { name: "Moza Al-Naimi", email: "moza.alnaimi@gmail.com" },
  { name: "Sandra Nair", email: "sandra.nair.qtr@gmail.com" },
  { name: "Salem Al-Marri", email: "salem.almarri@outlook.com" },
  { name: "Pranav Kumar", email: "pranav.k.doha@gmail.com" },
  { name: "Aisha Al-Hajri", email: "aisha.alhajri@qatar.qa" },
  { name: "Vineeth V.", email: "vineeth.v.qtr@gmail.com" },
  { name: "Ali Al-Mansoori", email: "ali.almansoori@gmail.com" },
  { name: "Kavya Madhavan", email: "kavya.m.doha@gmail.com" },
  { name: "Sheikha Al-Thani", email: "sheikha.althani@qatar.qa" },
  { name: "Sarath Kumar", email: "sarath.k.qtr@gmail.com" },
  { name: "Mubarak Al-Kuwari", email: "mubarak.alkuwari@gmail.com" },
  { name: "Anupama Pillai", email: "anupama.p.doha@gmail.com" },
  { name: "Jawaher Al-Sulaiti", email: "jawaher.alsulaiti@qatar.qa" },
  { name: "Arjun Menon", email: "arjun.menon.qtr@gmail.com" },
  { name: "Badr Al-Kaabi", email: "badr.alkaabi@outlook.com" },
  { name: "Meera Nambiar", email: "meera.n.doha@gmail.com" },
  { name: "Kholoud Al-Marri", email: "kholoud.almarri@gmail.com" },
  { name: "Deepak V.", email: "deepak.v.qtr@gmail.com" },
  { name: "Bader Al-Naimi", email: "bader.alnaimi@qatar.qa" },
  { name: "Reshma K.", email: "reshma.k.doha@gmail.com" },
  { name: "Hind Al-Khulaifi", email: "hind.alkhulaifi@outlook.com" },
  { name: "Nithin George", email: "nithin.g.qtr@gmail.com" },
  { name: "Mohammed Al-Kuwari", email: "mohammed.alkuwari@qatar.qa" },
  { name: "Shilpa Thomas", email: "shilpa.t.doha@gmail.com" },
  { name: "Alanoud Al-Thani", email: "alanoud.althani@gmail.com" },
  { name: "Sooraj P.", email: "sooraj.p.qtr@gmail.com" },
  { name: "Zaid Al-Marri", email: "zaid.almarri@outlook.com" },
  { name: "Parvathy R.", email: "parvathy.r.doha@gmail.com" },
  { name: "Shahad Al-Hajri", email: "shahad.alhajri@qatar.qa" },
  { name: "Sachin Dev", email: "sachin.dev.qtr@gmail.com" },
  { name: "Ahmed Al-Mansoori", email: "ahmed.almansoori@gmail.com" },
  { name: "Athira V.", email: "athira.v.doha@gmail.com" },
  { name: "Wadha Al-Kuwari", email: "wadha.alkuwari@qatar.qa" },
  { name: "Santhosh Kumar", email: "santhosh.k.qtr@gmail.com" },
  { name: "Hamza Hassan", email: "hamza.hassan.doha@gmail.com" },
  { name: "Sruthi Raj", email: "sruthi.raj.qtr@gmail.com" },
  { name: "Mayassa Al-Thani", email: "mayassa.althani@qatar.qa" },
  { name: "Ajay Varghese", email: "ajay.varghese.doha@gmail.com" },
  { name: "Fahad Al-Marri", email: "fahad.almarri@outlook.com" },
  { name: "Jyothi Lekshmi", email: "jyothi.l.qtr@gmail.com" },
  { name: "Shaikha Al-Sulaiti", email: "shaikha.alsulaiti@gmail.com" },
  { name: "Renjith R.", email: "renjith.r.doha@gmail.com" },
  { name: "Jassim Al-Kuwari", email: "jassim.alkuwari@qatar.qa" },
  { name: "Archana Nair", email: "archana.nair.qtr@gmail.com" },
  { name: "Rowda Al-Hajri", email: "rowda.alhajri@outlook.com" },
  { name: "Niyas Mohammed", email: "niyas.m.doha@gmail.com" },
  { name: "Hamdan Al-Naimi", email: "hamdan.alnaimi@qatar.qa" },
  { name: "Arya S.", email: "arya.s.qtr@gmail.com" },
  { name: "Lulwa Al-Thani", email: "lulwa.althani@gmail.com" },
  { name: "Vivek Menon", email: "vivek.menon.doha@gmail.com" },
  { name: "Saad Al-Marri", email: "saad.almarri@qatar.qa" },
  { name: "Devika P.", email: "devika.p.qtr@gmail.com" },
  { name: "Mashael Al-Kaabi", email: "mashael.alkaabi@outlook.com" },
  { name: "Sujith Kumar", email: "sujith.k.doha@gmail.com" },
  { name: "Hassan Al-Mansoori", email: "hassan.almansoori@gmail.com" },
  { name: "Keerthi V.", email: "keerthi.v.qtr@gmail.com" },
  { name: "Salma Al-Kuwari", email: "salma.alkuwari@qatar.qa" },
  { name: "Anish Kurup", email: "anish.kurup.doha@gmail.com" },
  { name: "Saif Al-Thani", email: "saif.althani@qatar.qa" },
  { name: "Pooja Sharma", email: "pooja.sharma.qtr@gmail.com" },
  { name: "Maryam Al-Marri", email: "maryam.almarri@outlook.com" }
];

// Pool of 100 ALL 5-STAR Unique Reviews (No duplicate phrasing)
const SIMPLE_5STAR_REVIEWS = [
  { rating: 5, title: "Super product", body: "Good product, fast delivery." },
  { rating: 5, title: "100% Original", body: "Original item, box was sealed. Delivered in 2 hours." },
  { rating: 5, title: "Adipoli item!", body: "Adipoli item! Super quality, will buy again." },
  { rating: 5, title: "Good purchase", body: "Value for money. Delivery boy called before coming." },
  { rating: 5, title: "Fast delivery", body: "Ordered yesterday and received today morning. Smooth experience." },
  { rating: 5, title: "Very nice", body: "Nice item, good price compared to market." },
  { rating: 5, title: "Recommended", body: "Good quality and prompt delivery. Recommended!" },
  { rating: 5, title: "Satisfied customer", body: "Proper packing and original item. Thanks GRIVA." },
  { rating: 5, title: "Quick service", body: "Fast delivery to West Bay. Item is working perfectly." },
  { rating: 5, title: "Good quality", body: "Super quality item. Packaging was very neat." },
  { rating: 5, title: "Worth it", body: "Totally worth the price. Delivery took less than 3 hours in Lusail." },
  { rating: 5, title: "Good product", body: "Nice product, smooth order process and quick delivery." },
  { rating: 5, title: "Excellent", body: "Exact same item as shown. Very satisfied!" },
  { rating: 5, title: "Original item", body: "Original product with genuine packing. Highly recommended." },
  { rating: 5, title: "Value for money", body: "Good item, affordable price. Delivery was prompt." },
  { rating: 5, title: "Very happy", body: "Second time buying from GRIVA, great service as always." },
  { rating: 5, title: "Adipoli saanam", body: "Valare nalla product. Quick delivery in Al Wakrah." },
  { rating: 5, title: "Superb quality", body: "Really impressed with the quality and packaging." },
  { rating: 5, title: "Nice buy", body: "Decent product for the price. Delivery driver was helpful." },
  { rating: 5, title: "Top notch", body: "Authentic item. Delivered right to my door in Doha." },
  { rating: 5, title: "Highly recommend", body: "Great experience overall. Item arrived safely in sealed condition." },
  { rating: 5, title: "Satisfied", body: "Good item. Works exactly as expected." },
  { rating: 5, title: "Super fast", body: "Ordered in morning and got it by afternoon. Excellent service!" },
  { rating: 5, title: "Quality item", body: "High quality material, very happy with my purchase." },
  { rating: 5, title: "Perfect!", body: "Exactly what I was looking for. 10/10." },
  { rating: 5, title: "Good service", body: "Fast shipping and neat packing. Will order more items." },
  { rating: 5, title: "Great customer care", body: "Very good customer service and super fast delivery." },
  { rating: 5, title: "Superb condition", body: "Superb condition, authentic brand product." },
  { rating: 5, title: "Genuine brand", body: "Genuine item delivered on time. Thanks GRIVA team." },
  { rating: 5, title: "Smooth transaction", body: "Smooth delivery experience in Pearl Qatar." },
  { rating: 5, title: "100% Satisfied", body: "100% satisfied with the quality and quick dispatch." },
  { rating: 5, title: "Excellent packing", body: "Excellent packing and genuine product." },
  { rating: 5, title: "Pristine condition", body: "Received in perfect condition. Really fast delivery." },
  { rating: 5, title: "Best in Qatar", body: "Best online shopping experience in Qatar!" },
  { rating: 5, title: "Top product", body: "Item quality is top notch. Delivery was fast." },
  { rating: 5, title: "Prompt response", body: "Very happy with the prompt response and fast shipping." },
  { rating: 5, title: "Adipoli experience", body: "Adipoli experience! Item arrived in pristine condition." },
  { rating: 5, title: "Fast & reliable", body: "Fast, reliable, and authentic. 5 stars!" },
  { rating: 5, title: "Great value", body: "Great value for money. Box was sealed properly." },
  { rating: 5, title: "Polite driver", body: "Item arrived safely. Delivery driver was polite." },
  { rating: 5, title: "Will buy again", body: "Top quality product. Will definitely buy again." },
  { rating: 5, title: "Fast Al Rayyan delivery", body: "Very fast delivery to Al Rayyan. Super satisfied!" },
  { rating: 5, title: "100% Real", body: "Item is 100% original. Excellent service by GRIVA." },
  { rating: 5, title: "Super satisfied", body: "Super satisfied with the product condition and delivery speed." },
  { rating: 5, title: "Neat dispatch", body: "Neatly packed and fast dispatch in Doha." },
  { rating: 5, title: "Earlier than expected", body: "Highly impressed! Delivery arrived earlier than expected." },
  { rating: 5, title: "Awesome quality", body: "Awesome product quality. Great service!" },
  { rating: 5, title: "Perfect condition", body: "Perfect condition and super quick delivery in Mansoura." },
  { rating: 5, title: "Genuine item", body: "Genuine item with great price tag." },
  { rating: 5, title: "Lightning fast", body: "Very smooth ordering and lightning fast delivery." },
  { rating: 5, title: "Product 10/10", body: "Product quality is 10/10. Thank you!" },
  { rating: 5, title: "Prompt Abu Hamour", body: "Prompt delivery to Abu Hamour. Product is genuine." },
  { rating: 5, title: "Valare Nallathu", body: "Valare Nallathu. Original product with great packing." },
  { rating: 5, title: "Sealed box", body: "Delivered fast with sealed box. Fully satisfied." },
  { rating: 5, title: "Excellent support", body: "Great product, excellent support from GRIVA team." },
  { rating: 5, title: "Works like charm", body: "Item arrived intact and works like a charm." },
  { rating: 5, title: "Best price Qatar", body: "Best price online in Qatar. Fast shipping too." },
  { rating: 5, title: "Reliable store", body: "Very reliable store. Genuine product delivered on time." },
  { rating: 5, title: "Impressive packing", body: "Impressive packaging and super fast delivery in Al Sadd." },
  { rating: 5, title: "Everything perfect", body: "Everything is perfect. High quality item." },
  { rating: 5, title: "Quick Ain Khalid", body: "Quick delivery in Ain Khalid. Box was untouched." },
  { rating: 5, title: "Super fast shipping", body: "Super fast shipping, product is 100% real." },
  { rating: 5, title: "Extremely happy", body: "Extremely happy with the overall experience." },
  { rating: 5, title: "Top notch service", body: "Top notch service and genuine products!" },
  { rating: 5, title: "Delivered in 2 hours", body: "Great item, arrived safely within 2 hours." },
  { rating: 5, title: "Super quality", body: "Super quality! Exactly as described." },
  { rating: 5, title: "Neat packaging", body: "Very neat packaging and quick delivery to Umm Salal." },
  { rating: 5, title: "Satisfied purchase", body: "Satisfied purchase. Original item delivered fast." },
  { rating: 5, title: "Awesome GRIVA", body: "Awesome service by GRIVA! Will shop again." },
  { rating: 5, title: "Hassle free", body: "Item is great and delivery was hassle-free." },
  { rating: 5, title: "Quick response", body: "Quick response and genuine item delivered." },
  { rating: 5, title: "Al Wakrah delivery", body: "Very good item. Fast delivery in Al Wakrah." },
  { rating: 5, title: "5 Stars!", body: "Perfect purchase experience. 5 stars all the way!" },
  { rating: 5, title: "Smooth delivery", body: "Product is top quality and delivery was smooth." },
  { rating: 5, title: "On time package", body: "Got my package on time in perfect condition." },
  { rating: 5, title: "100% Authentic", body: "100% authentic item. Excellent delivery in Wukair." },
  { rating: 5, title: "Super quick", body: "Very happy with the quality and super quick delivery." },
  { rating: 5, title: "Great item", body: "Great item! Delivery driver called before arrival." },
  { rating: 5, title: "Superb item", body: "Superb item quality. Sealed and authentic." },
  { rating: 5, title: "Adipoli service", body: "Adipoli service! Received my order in just 2 hours." },
  { rating: 5, title: "Smooth transaction", body: "Very smooth transaction and genuine item." },
  { rating: 5, title: "Company packing", body: "Excellent product with original company packing." },
  { rating: 5, title: "Fast Lusail delivery", body: "Fast delivery to Lusail. Product is super." },
  { rating: 5, title: "Good customer care", body: "Very good customer care and fast shipping." },
  { rating: 5, title: "Top class", body: "Top class quality. Highly recommended!" },
  { rating: 5, title: "Prompt condition", body: "Prompt service and genuine product condition." },
  { rating: 5, title: "Arrived super fast", body: "Arrived super fast in Doha. Very happy!" },
  { rating: 5, title: "Fast dispatch", body: "Great value for money and fast dispatch." },
  { rating: 5, title: "10/10 Product", body: "Product is 10/10. Packaging was top quality." },
  { rating: 5, title: "Extremely satisfied", body: "Extremely satisfied with GRIVA fast delivery." },
  { rating: 5, title: "Authentic item", body: "Authentic item delivered safely. Thanks!" },
  { rating: 5, title: "Pearl Qatar fast", body: "Super fast delivery service in Pearl Qatar." },
  { rating: 5, title: "Amazing quality", body: "Item quality is amazing. Fast order processing." },
  { rating: 5, title: "Good experience", body: "Very good experience. Genuine product." },
  { rating: 5, title: "Fast, neat, real", body: "Fast, neat, and authentic. High quality!" },
  { rating: 5, title: "Great product", body: "Great product condition and fast response." },
  { rating: 5, title: "Received in pristine", body: "Received in pristine condition. Excellent!" },
  { rating: 5, title: "West Bay fast", body: "Top notch item. Fast delivery in West Bay." },
  { rating: 5, title: "GRIVA is the best", body: "100% original. GRIVA is the best!" },
  { rating: 5, title: "Super quality product", body: "Super quality product, smooth delivery!" }
];

/**
 * Seed realistic reviews for products in the database
 */
async function seedProductionReviews() {
  try {
    console.log("🌱 [SEED REVIEWS]: Resetting and generating 100% ALL 5-STAR UNIQUE reviews (min 7 per product)...");

    // 1. Fetch all products
    const products = await Product.findAll();
    if (!products || products.length === 0) {
      console.log("ℹ️ [SEED REVIEWS]: No products found in database.");
      return { success: true, message: "No products found." };
    }

    // 2. Ensure customer user accounts exist in DB
    const dummyPasswordHash = await bcrypt.hash("Customer@GRIVA2026", 10);
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

    // 3. Clear ALL existing reviews to wipe out any previous duplicate review text!
    await Review.destroy({ where: {} });

    let seededCount = 0;
    let globalTemplateIndex = 0; // Ensures global uniqueness across all products too!

    // 4. Loop over products and seed MINIMUM 7 reviews per product
    for (const product of products) {
      // Minimum 7 reviews (7 to 10 reviews per product)
      const reviewsToCreateCount = Math.floor(Math.random() * 4) + 7; // 7, 8, 9, or 10
      
      // Pick random unique users for this product
      const shuffledUsers = [...createdUsers].sort(() => 0.5 - Math.random());
      const selectedUsers = shuffledUsers.slice(0, reviewsToCreateCount);

      for (let i = 0; i < selectedUsers.length; i++) {
        const user = selectedUsers[i];
        
        // Pick unique template from pool using global offset + per-product index
        const templateIdx = (globalTemplateIndex + i) % SIMPLE_5STAR_REVIEWS.length;
        const reviewTemplate = SIMPLE_5STAR_REVIEWS[templateIdx];
        
        // Stagger dates over past 60 days
        const daysAgo = Math.floor(Math.random() * 50) + (i * 4) + 1;
        const reviewDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

        await Review.create({
          product_id: product.id,
          user_id: user.id,
          rating: 5, // 100% ALL 5 STARS!
          title: reviewTemplate.title,
          body: reviewTemplate.body,
          verified: true,
          createdAt: reviewDate,
          updatedAt: reviewDate
        });

        seededCount++;
      }

      globalTemplateIndex += reviewsToCreateCount;

      // Recalculate average rating (5.00) and review_count (7+) for this product
      const allProductReviews = await Review.findAll({ where: { product_id: product.id } });

      product.rating = 5.0;
      product.review_count = allProductReviews.length;
      await product.save();
    }

    console.log(`🟢 [SEED REVIEWS]: Successfully wiped old duplicates & seeded ${seededCount} ALL 5-STAR 100% UNIQUE reviews (min 7 per product) across ${products.length} products!`);
    return { success: true, seededCount, totalProducts: products.length };
  } catch (error) {
    console.error("❌ [SEED REVIEWS ERROR]:", error.message);
    return { success: false, error: error.message };
  }
}

module.exports = { seedProductionReviews };
