const { sequelize } = require('./src/config/db');
const Product = require('./src/models/Product');

async function checkProduct() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB.');
    const prod = await Product.findOne({
      where: {
        slug: 'thunder-x-pro-rc-racing-truck-4wd-off-road-monster-car'
      }
    });

    if (!prod) {
      console.log('Product not found by slug, trying title search...');
      const prodByTitle = await Product.findOne({
        where: {
          title: 'Thunder X Pro RC Racing Truck – 4WD Off-Road Monster Car'
        }
      });
      if (prodByTitle) {
        console.log('Found by Title:', {
          id: prodByTitle.id,
          title: prodByTitle.title,
          slug: prodByTitle.slug,
          main_image_url: prodByTitle.main_image_url,
          gallery_images: prodByTitle.gallery_images
        });
      } else {
        console.log('Product not found at all.');
        const allProds = await Product.findAll({ limit: 5 });
        console.log('Sample products:');
        allProds.forEach(p => console.log(p.id, p.title, p.main_image_url));
      }
    } else {
      console.log('Found by Slug:', {
        id: prod.id,
        title: prod.title,
        slug: prod.slug,
        main_image_url: prod.main_image_url,
        gallery_images: prod.gallery_images
      });
    }
  } catch (err) {
    console.error('Error querying:', err);
  } finally {
    await sequelize.close();
  }
}

checkProduct();
