const mongoose = require("mongoose");
  const { Schema } = mongoose;
  const bcrypt = require("bcryptjs");

  const registrationSchema = new Schema({
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minLength: [2, "First name must be at least 2 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minLength: [2, "Last name must be at least 2 characters"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      minLength: [10, "Address must be at least 10 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Please provide a valid email"],
    },
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      match: [/^\+8801[3-9]\d{8}$/, "Mobile number must be in +880 format (e.g., +88017xxxxxxx)"],
    },
    nid: {
      type: String,
      required: [true, "NID number is required"],
      match: [/^\d{10,17}$/, "NID must be 10 to 17 digits"],
    },
    image: {
      type: String,
      required: [true, "Image URL is required"],
      match: [/^https?:\/\/.+\.(jpg|jpeg|png|webp|svg)$/, "Image must be a valid image URL"],
    },
    reference: {
      type: String,
      trim: true,
      default: "",
    },
    nomineeName: {
      type: String,
      required: [true, "Nominee name is required"],
      trim: true,
    },
    nomineeRelation: {
      type: String,
      required: [true, "Nominee relation is required"],
      trim: true,
    },
    nomineeMobile: {
      type: String,
      required: [true, "Nominee mobile is required"],
      match: [/^\+8801[3-9]\d{8}$/, "Nominee mobile must be in +880 format (e.g., +88017xxxxxxx)"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [6, "Password must be at least 6 characters"],
      match: [
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
        "Password must have at least one uppercase letter, one lowercase letter, one number, and one special character",
      ],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  }, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  });

  // ✅ Virtual confirmPassword (not stored in DB)
  registrationSchema.virtual("confirmPassword")
    .get(function () {
      return this._confirmPassword;
    })
    .set(function (value) {
      this._confirmPassword = value;
    });

  // ✅ Hash password & check confirm password before save
  registrationSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
      if (this.password !== this._confirmPassword) {
        this.invalidate("confirmPassword", "Passwords do not match");
      }

      try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
      } catch (err) {
        return next(err);
      }
    }
    next();
  });

  module.exports = mongoose.model("User", registrationSchema);
