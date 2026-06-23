// const Banner = require("../models/Banner");

// exports.getActiveBanners = async (req, res, next) => {
//   try {
//     const banners = await Banner.findAll({
//       where: { isActive: true },
//       order: [["id", "ASC"]],
//     });
//     res.status(200).json({ banners });
//   } catch (error) {
//     next(error);
//   }
// };

// exports.getAllBanners = async (req, res, next) => {
//   try {
//     const banners = await Banner.findAll({ order: [["id", "DESC"]] });
//     res.status(200).json({ banners });
//   } catch (error) {
//     next(error);
//   }
// };

// exports.createBanner = async (req, res, next) => {
//   try {
//     const { type, badge, title, subtitle, price, image, bg, href, isActive } = req.body;
//     if (!type || !title || !image) {
//       return res.status(400).json({ error: "Missing required banner fields (type, title, image)." });
//     }

//     const banner = await Banner.create({
//       type,
//       badge,
//       title,
//       subtitle,
//       price,
//       image,
//       bg,
//       href,
//       isActive: isActive !== undefined ? !!isActive : true,
//     });

//     res.status(201).json({
//       message: "Banner created successfully.",
//       banner,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// exports.updateBanner = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const { type, badge, title, subtitle, price, image, bg, href, isActive } = req.body;

//     const banner = await Banner.findByPk(id);
//     if (!banner) {
//       return res.status(404).json({ error: "Banner not found." });
//     }

//     if (type !== undefined) banner.type = type;
//     if (badge !== undefined) banner.badge = badge;
//     if (title !== undefined) banner.title = title;
//     if (subtitle !== undefined) banner.subtitle = subtitle;
//     if (price !== undefined) banner.price = price;
//     if (image !== undefined) banner.image = image;
//     if (bg !== undefined) banner.bg = bg;
//     if (href !== undefined) banner.href = href;
//     if (isActive !== undefined) banner.isActive = isActive;

//     await banner.save();

//     res.status(200).json({
//       message: "Banner updated successfully.",
//       banner,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// exports.deleteBanner = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const banner = await Banner.findByPk(id);
//     if (!banner) {
//       return res.status(404).json({ error: "Banner not found." });
//     }

//     await banner.destroy();
//     res.status(200).json({ message: "Banner deleted successfully." });
//   } catch (error) {
//     next(error);
//   }
// };
