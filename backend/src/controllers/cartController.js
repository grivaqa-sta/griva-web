const Cart = require("../models/Cart");
const CartItem = require("../models/CartItem");
const Product = require("../models/Product");
const SubCategory = require("../models/SubCategory");
const Category = require("../models/Category");

/**
 * Helper to fetch a unified, formatted cart object for the frontend client.
 */
const getFormattedCart = async (userId) => {
  let [cart] = await Cart.findOrCreate({
    where: { user_id: userId },
    defaults: { user_id: userId },
  });

  const items = await CartItem.findAll({
    where: { cart_id: cart.id },
    include: [
      {
        model: Product,
        as: "product",
        include: [
          {
            model: SubCategory,
            as: "subcategory",
            include: [
              {
                model: Category,
                as: "category",
              },
            ],
          },
        ],
      },
      {
        model: require("../models/ProductVariant"),
        as: "variant",
      }
    ],
    order: [["createdAt", "ASC"]],
  });

  const formattedItems = items.map((item) => {
    const p = item.product;
    const v = item.variant;
    
    // Support Variant Price override
    const priceStr = v && v.price ? `QAR ${parseFloat(v.price).toFixed(2)}` : (p ? p.price : "QAR 0.00");
    const priceNumber = parseFloat(priceStr.replace(/([$]|qar|[\s,])/gi, "")) || 0;
    const oldPriceNumber = p && p.old_price ? parseFloat(String(p.old_price).replace(/([$]|qar|[\s,])/gi, "")) : priceNumber;

    // Support Variant Image override
    const image = v && Array.isArray(v.images) && v.images.length > 0 ? v.images[0] : (p ? p.main_image_url : "");

    return {
      id: item.id,
      productId: item.product_id,
      variantId: item.variant_id || undefined,
      title: p ? p.title : "Unknown Product",
      image: image,
      price: priceStr,
      priceNumber: priceNumber,
      oldPriceNumber: oldPriceNumber,
      quantity: item.quantity,
      selectedColor: item.selected_color || (item.selected_attributes ? item.selected_attributes.Color : undefined),
      selectedStorage: item.selected_storage || (item.selected_attributes ? (item.selected_attributes.Storage || item.selected_attributes.Size) : undefined),
      selectedAttributes: item.selected_attributes || {},
      sku: v && v.sku ? v.sku : (p ? p.sku : ""),
      category: p && p.subcategory && p.subcategory.category ? p.subcategory.category.title : "Gadgets",
      slug: p ? p.slug : "",
    };
  });

  const totalItems = formattedItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = formattedItems.reduce((sum, item) => sum + item.priceNumber * item.quantity, 0);

  return {
    id: cart.id,
    user_id: cart.user_id,
    items: formattedItems,
    totalItems,
    totalPrice,
  };
};

/**
 * Get Cart
 * GET /api/cart
 */
exports.getCart = async (req, res) => {
  try {
    const formattedCart = await getFormattedCart(req.user.id);
    res.status(200).json({
      success: true,
      cart: formattedCart,
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Add Item to Cart
 * POST /api/cart/items
 */
exports.addItem = async (req, res) => {
  try {
    const { product_id, variant_id, selected_attributes, selected_color, selected_storage, quantity } = req.body;
    const qty = parseInt(quantity) || 1;

    // MED-1: Limit per-item quantity to 10
    if (!product_id || qty <= 0 || qty > 10) {
      return res.status(400).json({
        success: false,
        message: "Invalid product_id or quantity (must be between 1 and 10).",
      });
    }

    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // HIGH-7: Check product activity
    if (!product.is_active) {
      return res.status(400).json({
        success: false,
        message: "This product is currently inactive and cannot be added to cart.",
      });
    }

    // Resolve variant stock and price override
    let availableStock = product.stock;
    let variantPrice = product.price;
    if (variant_id) {
      const ProductVariant = require("../models/ProductVariant");
      const variant = await ProductVariant.findByPk(variant_id);
      if (!variant) {
        return res.status(404).json({
          success: false,
          message: "Product variant not found.",
        });
      }
      availableStock = variant.stock;
      if (variant.price) {
        variantPrice = `QAR ${parseFloat(variant.price).toFixed(2)}`;
      }
    }

    let [cart] = await Cart.findOrCreate({
      where: { user_id: req.user.id },
      defaults: { user_id: req.user.id },
    });

    // Check if item already exists with matching variants
    let item = await CartItem.findOne({
      where: {
        cart_id: cart.id,
        product_id,
        variant_id: variant_id || null,
        selected_color: selected_color || (selected_attributes ? selected_attributes.Color : null) || null,
        selected_storage: selected_storage || (selected_attributes ? (selected_attributes.Storage || selected_attributes.Size) : null) || null,
      },
    });

    const newQty = item ? item.quantity + qty : qty;

    // MED-1: Enforce maximum cap of 10
    if (newQty > 10) {
      return res.status(400).json({
        success: false,
        message: "Cannot add more items. A maximum of 10 units per product variant is allowed.",
      });
    }

    // Validate inventory stock level
    if (newQty > availableStock) {
      return res.status(400).json({
        success: false,
        message: `Cannot add more items. Only ${availableStock} left in stock.`,
      });
    }

    if (item) {
      item.quantity = newQty;
      await item.save();
    } else {
      await CartItem.create({
        cart_id: cart.id,
        product_id,
        variant_id: variant_id || null,
        selected_attributes: selected_attributes || {},
        selected_color: selected_color || (selected_attributes ? selected_attributes.Color : null) || null,
        selected_storage: selected_storage || (selected_attributes ? (selected_attributes.Storage || selected_attributes.Size) : null) || null,
        quantity: qty,
        price_snapshot: variantPrice,
      });
    }

    const formattedCart = await getFormattedCart(req.user.id);
    res.status(200).json({
      success: true,
      message: "Item added to cart successfully.",
      cart: formattedCart,
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update Cart Item Quantity
 * PATCH /api/cart/items/:id
 */
exports.updateItemQty = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const qty = parseInt(quantity);

    // MED-1: limit updated qty to 10
    if (isNaN(qty) || qty <= 0 || qty > 10) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive integer between 1 and 10.",
      });
    }

    const item = await CartItem.findOne({
      where: { id },
      include: [
        {
          model: Cart,
          as: "cart",
          where: { user_id: req.user.id },
        },
        {
          model: Product,
          as: "product",
        },
        {
          model: require("../models/ProductVariant"),
          as: "variant",
        }
      ],
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found.",
      });
    }

    const availableStock = item.variant ? item.variant.stock : item.product.stock;
    if (qty > availableStock) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity exceeds available stock. Only ${availableStock} available.`,
      });
    }

    item.quantity = qty;
    await item.save();

    const formattedCart = await getFormattedCart(req.user.id);
    res.status(200).json({
      success: true,
      message: "Quantity updated successfully.",
      cart: formattedCart,
    });
  } catch (error) {
    console.error("Error updating cart item quantity:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Remove Cart Item
 * DELETE /api/cart/items/:id
 */
exports.removeItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await CartItem.findOne({
      where: { id },
      include: [
        {
          model: Cart,
          as: "cart",
          where: { user_id: req.user.id },
        },
      ],
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found.",
      });
    }

    await item.destroy();

    const formattedCart = await getFormattedCart(req.user.id);
    res.status(200).json({
      success: true,
      message: "Item removed from cart successfully.",
      cart: formattedCart,
    });
  } catch (error) {
    console.error("Error removing cart item:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Clear User Cart
 * DELETE /api/cart
 */
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ where: { user_id: req.user.id } });
    if (cart) {
      await CartItem.destroy({ where: { cart_id: cart.id } });
    }

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully.",
      cart: {
        items: [],
        totalItems: 0,
        totalPrice: 0,
      },
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Merge Guest Cart with User Cart
 * POST /api/cart/merge
 */
exports.mergeCart = async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: "Items array is required to merge.",
      });
    }

    let [cart] = await Cart.findOrCreate({
      where: { user_id: req.user.id },
      defaults: { user_id: req.user.id },
    });

    for (const guestItem of items) {
      const pId = parseInt(guestItem.productId);
      const vId = guestItem.variantId ? parseInt(guestItem.variantId) : null;
      const qty = parseInt(guestItem.quantity) || 1;
      const attrs = guestItem.selectedAttributes || {};
      const color = guestItem.selectedColor || attrs.Color || null;
      const storage = guestItem.selectedStorage || attrs.Storage || attrs.Size || null;

      if (!pId || qty <= 0) continue;

      const product = await Product.findByPk(pId);
      if (!product) continue;

      let availableStock = product.stock;
      let variantPrice = product.price;
      if (vId) {
        const ProductVariant = require("../models/ProductVariant");
        const variant = await ProductVariant.findByPk(vId);
        if (variant) {
          availableStock = variant.stock;
          if (variant.price) {
            variantPrice = `QAR ${parseFloat(variant.price).toFixed(2)}`;
          }
        }
      }

      let dbItem = await CartItem.findOne({
        where: {
          cart_id: cart.id,
          product_id: pId,
          variant_id: vId || null,
          selected_color: color,
          selected_storage: storage,
        },
      });

      if (dbItem) {
        const mergedQty = Math.max(dbItem.quantity, Math.min(dbItem.quantity + qty, Math.min(availableStock, 10)));
        if (mergedQty !== dbItem.quantity) {
          dbItem.quantity = mergedQty;
          await dbItem.save();
        }
      } else {
        const finalQty = Math.min(qty, Math.min(availableStock, 10));
        if (finalQty > 0) {
          await CartItem.create({
            cart_id: cart.id,
            product_id: pId,
            variant_id: vId || null,
            selected_attributes: attrs,
            selected_color: color,
            selected_storage: storage,
            quantity: finalQty,
            price_snapshot: variantPrice,
          });
        }
      }
    }

    const formattedCart = await getFormattedCart(req.user.id);
    res.status(200).json({
      success: true,
      message: "Cart merged successfully.",
      cart: formattedCart,
    });
  } catch (error) {
    console.error("Error merging cart:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
