const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const User = require("./User");
const Product = require("./Product");

const Wishlist = sequelize.define(
  "Wishlist",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Product,
        key: "id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "wishlists",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["user_id", "product_id"],
        name: "wishlist_user_product_unique",
      },
    ],
  }
);

Wishlist.associate = (models) => {
  Wishlist.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
  Wishlist.belongsTo(models.Product, { foreignKey: "product_id", as: "product" });
  
  models.User.hasMany(Wishlist, { foreignKey: "user_id", as: "wishlistItems", onDelete: "CASCADE" });
  models.Product.hasMany(Wishlist, { foreignKey: "product_id", as: "wishlistItems", onDelete: "CASCADE" });
};

module.exports = Wishlist;
