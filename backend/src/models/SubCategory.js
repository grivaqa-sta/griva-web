const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const SubCategory = sequelize.define(
  "SubCategory",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    href: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    image_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "sub_categories",
    timestamps: true,
  }
);

SubCategory.associate = (models) => {
  SubCategory.belongsTo(models.Category, {
    foreignKey: "category_id",
    as: "category",
  });

  SubCategory.hasMany(models.Product, {
    foreignKey: "subcategory_id",
    as: "products",
  });
};

module.exports = SubCategory;