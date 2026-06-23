const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db"); // updated: now uses categoryId

const DiscoverMore = sequelize.define(
  "DiscoverMore",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "categories",
        key: "id",
      },
    },

    subtitle: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    image_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    href: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "discover_more",
    timestamps: true,
  }
);

DiscoverMore.associate = (models) => {
  DiscoverMore.belongsTo(models.Category, {
    foreignKey: "categoryId",
    as: "category",
  });
};

module.exports = DiscoverMore;