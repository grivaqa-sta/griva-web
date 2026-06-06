/**
 * USER MODEL (User.js)
 * 
 * ─── JAVA COMPARISON ──────────────────────────────────────────────────────────
 * In Spring Boot, this is equivalent to your @Entity class (e.g. User.java).
 * Fields are mapped using class variables and annotations (@Id, @Column, @Enumerated).
 * Lifecycle hooks like @PrePersist/@PreUpdate map directly to Sequelize "hooks".
 * 
 * ─── SUPABASE COMPARISON ──────────────────────────────────────────────────────
 * In Supabase, you do not write model code; you create tables via SQL in the 
 * dashboard (auth.users schema). Here, we explicitly declare the model 
 * so our JavaScript codebase knows exactly what table attributes exist.
 * 
 * ─── REAL-WORLD USE CASE ──────────────────────────────────────────────────────
 * Authentication tables must never store raw passwords. We use hooks to run 
 * bcrypt hashing before saving user records to database columns.
 * 
 * ─── WITHOUT THIS ─────────────────────────────────────────────────────────────
 * Without a defined Sequelize model, JavaScript has no programmatic schema awareness, 
 * meaning you'd have to write raw, manual SQL queries for every auth transaction.
 * 
 * ─── UNIQUE SENIOR TIPS ───────────────────────────────────────────────────────
 * Always select a specific set of attributes in queries (e.g., exclude password hashes 
 * by default using defaultScopes) to protect user passwords from leaking in API responses.
 */

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const bcrypt = require("bcryptjs"); // Used to hash user passwords safely

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true, // JPA @Id equivalent
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true, // Auto-validates email format before saving (like Hibernate Validation)
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: "customer", // Roles: "customer" or "admin"
      validate: {
        isIn: [["customer", "admin"]], // Prevents invalid role entries (like Java Enums)
      },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt columns
    hooks: {
      // JPA Lifecycle @PrePersist / @PreUpdate equivalent: hashes password before database write
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
      // Excludes sensitive password from default query queries
      attributes: { exclude: ["password"] },
    },
    scopes: {
      // Scope to include password when executing authentication / logins
      withPassword: {
        attributes: {},
      },
    },
  }
);

// Prototype helper method (like standard helper methods on a Java class instance)
User.prototype.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;
