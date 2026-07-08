const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const ReturnRequest = sequelize.define(
  "ReturnRequest",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Orders",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    order_item_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "OrderItems",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    type: {
      type: DataTypes.ENUM("replacement", "refund"),
      allowNull: false,
    },
    reason: {
      type: DataTypes.ENUM("damaged", "defective", "wrong_item", "changed_mind", "other"),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    images: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "pending",
    },
    delivery_boy_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Users",
        key: "id",
      },
      onDelete: "SET NULL",
    },
    admin_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    resolved_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);

ReturnRequest.associate = (models) => {
  ReturnRequest.belongsTo(models.Order, { foreignKey: "order_id", as: "order" });
  ReturnRequest.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
  ReturnRequest.belongsTo(models.OrderItem, { foreignKey: "order_item_id", as: "orderItem" });
  ReturnRequest.belongsTo(models.User, { foreignKey: "delivery_boy_id", as: "deliveryBoy" });
};

module.exports = ReturnRequest;
