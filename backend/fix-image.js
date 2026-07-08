const { sequelize } = require('./src/config/db');
const Product = require('./src/models/Product');

async function fixProduct() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB.');
    const prod = await Product.findOne({
      where: {
        id: 12
      }
    });

    if (prod) {
      console.log('Original Product:', {
        title: prod.title,
        main_image_url: prod.main_image_url,
        gallery_images: prod.gallery_images
      });

      // Update main_image_url to the working gallery image
      const workingUrl = prod.gallery_images[0];
      if (workingUrl) {
        prod.main_image_url = workingUrl;
        await prod.save();
        console.log('Successfully updated main_image_url to:', workingUrl);
      } else {
        console.log('No working gallery image found to use as fallback.');
      }
    } else {
      console.log('Product 12 not found.');
    }
  } catch (err) {
    console.error('Error updating:', err);
  } finally {
    await sequelize.close();
  }
}

fixProduct();
