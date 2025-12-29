const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");
const { type } = require("node:os");
const Review = require("./review.js");

const registerSchema = new Schema({
  FirstName: {
    type: String,
    required: true,
    trim: true,
  },

  LastName: {
    type: String,
    required: true,
    trim: true,
  },

  // Canonical, indexed email used to satisfy the existing unique index (email_1)
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  // Canonical username used to satisfy the existing unique index (username_1)
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  // Kept for compatibility with the rest of the codebase (views/controllers use `Email`)
  Email: {
    type: String,
    required: true,
    trim: true,
  },

  Mobile: {
    type: Number,
    required: true,
    unique: true,
  },

  Password: {
    type: String,
    required: true,
  },
});

// Ensure canonical fields used by unique indexes are always populated
registerSchema.pre("validate", function () {
  if (this.Email) {
    this.email = this.Email.toLowerCase();
  }

  // Use email as username fallback to satisfy legacy username_1 index
  if (!this.username && this.Email) {
    this.username = this.Email.toLowerCase();
  }

  // As a last resort, fall back to mobile as username to avoid null unique collisions
  if (!this.username && this.Mobile) {
    this.username = String(this.Mobile);
  }
});

registerSchema.pre("save", async function () {
  if (!this.isModified("Password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.Password = await bcrypt.hash(this.Password, salt);
});

const User = mongoose.model("User", registerSchema);

module.exports = User;