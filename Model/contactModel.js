const mongoose = require("mongoose");
const { Schema } = mongoose;

const contactSchema = new Schema({
    name: {
        type: String,
        required: [true, "Please add the name"],
    },
    email: {
        type: String,
        required: [true, "Please add the email"],
        lowercase: true,
        trim: true,
        validate: {
            validator: function (v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: "Please enter a valid email address",
        },
    },
    mobile: {
        type: String,
        required: [true, "Please add the mobile number"],
        validate: {
            validator: function (v) {
                return /^\+[1-9]\d{9,14}$/.test(v);
            },
            message: "Mobile number must be in international format (e.g., +8801712345678)",
        },
    },
    message: {
        type: String,
        required: [true, "Please add a message"],
        trim: true,
        minlength: [10, "Message must be at least 10 characters long"],
        maxlength: [1000, "Message cannot be longer than 1000 characters"],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Contact", contactSchema);

