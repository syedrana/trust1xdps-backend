const Contact = require("../Model/contactModel");


const submitContactForm = async (req, res) => {
    try {
        const { name, email, mobile, message } = req.body;

        // Check if all fields are present
        if (!name || !email || !mobile || !message) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Create new contact message
        const contact = await Contact.create({
            name: name,
            email: email,
            mobile: mobile,
            message: message,
        });

        res.status(201).json({
            success: true,
            message: "Contact message submitted successfully",
            data: contact,
        });
    } catch (error) {
        console.error("Contact form error:", error);

        // Mongoose validation errors
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(", ") });
        }

        // Duplicate email error
        // if (error.code === 11000 && error.keyPattern.email) {
        //     return res.status(400).json({ success: false, message: "Email already exists" });
        // }

        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

module.exports = {
    submitContactForm,
};

