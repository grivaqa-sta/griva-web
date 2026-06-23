const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const bcrypt = require("bcryptjs");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      set(value) {
        if (value) {
          this.setDataValue("email", value.toLowerCase().trim());
        }
      },
      validate: {
        isEmail: true,
        notEmpty: true,
      },
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6, 255],
      },
    },

    role: {
      type: DataTypes.ENUM("customer", "admin", "delivery", "staff"),
      allowNull: false,
      defaultValue: "customer",
    },
    status: {
      type: DataTypes.ENUM("ACTIVE", "BLOCKED"),
      allowNull: false,
      defaultValue: "ACTIVE",
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    resetPasswordExpire: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: true,

    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },

      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },

    defaultScope: {
      attributes: {
        exclude: ["password"],
      },
    },

    scopes: {
      withPassword: {
        attributes: {
          include: ["password"],
        },
      },
    },
  },
);

/**
 * Compare entered password with hashed password
 */
User.prototype.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

User.associate = (models) => {
  User.hasMany(models.Address, {
    foreignKey: "userId",
    as: "addresses",
  });
  User.hasMany(models.Notification, {
    foreignKey: "userId",
    as: "notifications",
  });
};

module.exports = User;
