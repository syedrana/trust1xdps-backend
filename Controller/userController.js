// const User = require("../Model/userModel");
// const nodemailer = require("nodemailer");
// const jwt = require("jsonwebtoken");

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.GMAIL_USER, // ✅ Your Gmail
//     pass: process.env.GMAIL_PASS, // ✅ App Password
//   },
// });

// const registration = async (req, res) => {
//   try {
//     const {
//       firstName,
//       lastName,
//       address,
//       email,
//       mobile,
//       nid,
//       reference,
//       nomineeName,
//       nomineeRelation,
//       nomineeMobile,
//       password,
//       confirmPassword,
//     } = req.body;

//     // ✅ Cloudinary image URL
//     const image = req.file ? req.file.path : "";

//     // ✅ Required field validation
//     if (
//       !firstName || !lastName || !address || !email || !mobile ||
//       !nid || !nomineeName || !nomineeRelation || !nomineeMobile ||
//       !password || !confirmPassword
//     ) {
//       return res.status(400).send("All fields are required");
//     }

//     // ✅ Email format check
//     const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!pattern.test(email)) {
//       return res.status(400).send("Invalid email format");
//     }

//     // ✅ Mobile number check (+880 format)
//     const mobilePattern = /^\+8801[3-9]\d{8}$/;
//     if (!mobilePattern.test(mobile)) {
//       return res.status(400).send("Mobile number must be in +880 format");
//     }

//     // ✅ NID number check
//     const nidPattern = /^\d{10,17}$/;
//     if (!nidPattern.test(nid)) {
//       return res.status(400).send("NID must be between 10 to 17 digits");
//     }

//     // ✅ Nominee mobile check
//     if (!mobilePattern.test(nomineeMobile)) {
//       return res.status(400).send("Nominee mobile must be in +880 format");
//     }

//     // ✅ Password strength check
//     const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,16}$/;
//     if (!strongPassword.test(password)) {
//       return res.status(400).send("Password must be 8-16 chars with uppercase, lowercase, number & symbol");
//     }

//     // ✅ Password match check
//     if (password !== confirmPassword) {
//       return res.status(400).send("Passwords do not match");
//     }

//     // ✅ Check if user already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).send("User Already Exists");
//     }

//     // ✅ Create new user
//     const user = new User({
//       firstName,
//       lastName,
//       address,
//       email,
//       mobile,
//       nid,
//       image, // ✅ Cloudinary image URL
//       reference,
//       nomineeName,
//       nomineeRelation,
//       nomineeMobile,
//       password,
//       confirmPassword, // Needed for pre-save validation hooks
//       isVerified: false,
//     });

//     await user.save();

//     // ✅ Send Verification Email
//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
//     const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;

//     const mailOptions = {
//       from: process.env.GMAIL_USER,
//       to: email,
//       subject: "Verify Your Email - Trust1xDPS",
//       html: `
//         <h2>Hello ${firstName},</h2>
//         <p>Thank you for registering. Please verify your email by clicking the link below:</p>
//         <a href="${verificationUrl}" target="_blank">Verify Email</a>
//         <p>This link will expire in 24 hours.</p>
//       `,
//     };

//     transporter.sendMail(mailOptions, (err, info) => {
//       if (err) {
//         console.error("Email send error:", err);
//       } else {
//         console.log("Verification email sent:", info.response);
//       }
//     });

//     // ✅ Success response
//     res.status(201).json({
//       success: true,
//       message: "User Registration Successful",
//       user: {
//         id: user._id,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         address: user.address,
//         email: user.email,
//         mobile: user.mobile,
//         nid: user.nid,
//         reference: user.reference,
//         image: user.image,
//         nomineeName: user.nomineeName,
//         nomineeRelation: user.nomineeRelation,
//         nomineeMobile: user.nomineeMobile,
//       },
//     });
//   } catch (error) {
//     console.error("Registration error:", error);

//     if (error.name === "ValidationError") {
//       const messages = Object.values(error.errors).map((val) => val.message);
//       return res.status(400).json({ success: false, message: messages.join(", ") });
//     }

//     if (error.code === 11000 && error.keyPattern?.email) {
//       return res.status(400).json({ success: false, message: "Email already exists" });
//     }

//     res.status(500).json({
//       success: false,
//       message: "Server Error. Please try again later.",
//     });
//   }
// };

// // ✅ Email Verification Controller
// const verifyEmail = async (req, res) => {
//   try {
//     const { token } = req.params;
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.id);

//     if (!user) return res.status(400).send("Invalid verification link");

//     if (user.isVerified) {
//       return res.send("Your email is already verified.");
//     }

//     user.isVerified = true;
//     await user.save();

//     res.send("Your email has been successfully verified! You can now log in.");
//   } catch (err) {
//     console.error("Verification Error:", err);
//     res.status(400).send("Verification link expired or invalid.");
//   }
// };

// module.exports = {
//   registration,
//   verifyEmail,
// };







const User = require("../Model/userModel");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

// ✅ Nodemailer Gmail Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER, // e.g., trust1xdps@gmail.com
    pass: process.env.GMAIL_PASS, // App Password, not Gmail password
  },
});

// ✅ Registration Controller
const registration = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      address,
      email,
      mobile,
      nid,
      reference,
      nomineeName,
      nomineeRelation,
      nomineeMobile,
      password,
      confirmPassword,
    } = req.body;

    const image = req.file ? req.file.path : "";

    // ✅ Validation
    if (
      !firstName || !lastName || !address || !email || !mobile ||
      !nid || !nomineeName || !nomineeRelation || !nomineeMobile ||
      !password || !confirmPassword
    ) {
      return res.status(400).send("All fields are required");
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return res.status(400).send("Invalid email format");
    }

    const mobilePattern = /^\+8801[3-9]\d{8}$/;
    if (!mobilePattern.test(mobile)) {
      return res.status(400).send("Mobile must be in +880 format");
    }

    const nidPattern = /^\d{10,17}$/;
    if (!nidPattern.test(nid)) {
      return res.status(400).send("NID must be 10-17 digits");
    }

    if (!mobilePattern.test(nomineeMobile)) {
      return res.status(400).send("Nominee mobile must be in +880 format");
    }

    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,16}$/;
    if (!passwordPattern.test(password)) {
      return res.status(400).send("Password must be 8-16 chars, include upper, lower, number & symbol");
    }

    if (password !== confirmPassword) {
      return res.status(400).send("Passwords do not match");
    }

    // ✅ Check if User Already Exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send("User already exists with this email");
    }

    // ✅ Create New User
    const user = new User({
      firstName,
      lastName,
      address,
      email,
      mobile,
      nid,
      image,
      reference,
      nomineeName,
      nomineeRelation,
      nomineeMobile,
      password,
      confirmPassword,
      isVerified: false,
    });

    await user.save();

    // ✅ Generate Email Verification Token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;

    // ✅ Email Content
    const mailOptions = {
      from: `"Trust1xDPS" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Verify Your Email - Trust1xDPS",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Hello ${firstName},</h2>
          <p>Thanks for registering at <b>Trust1xDPS</b>.</p>
          <p>Please click the button below to verify your email address:</p>
          <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
          <p>This link will expire in 24 hours.</p>
        </div>
      `,
    };

    // ✅ Send Email
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Email send error:", err);
        return res.status(500).send("Failed to send verification email");
      } else {
        console.log("Verification email sent:", info.response);
      }
    });

    // ✅ Success Response
    res.status(201).json({
      success: true,
      message: "Registration successful! Please check your email to verify your account.",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        address: user.address,
        email: user.email,
        mobile: user.mobile,
        nid: user.nid,
        reference: user.reference,
        image: user.image,
        nomineeName: user.nomineeName,
        nomineeRelation: user.nomineeRelation,
        nomineeMobile: user.nomineeMobile,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }

    if (error.code === 11000 && error.keyPattern?.email) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Email Verification Controller
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) return res.status(400).send("Invalid or expired verification link");

    if (user.isVerified) {
      return res.send("Your email is already verified.");
    }

    user.isVerified = true;
    await user.save();

    res.send("Your email has been successfully verified! You can now log in.");
  } catch (err) {
    console.error("Verification error:", err);
    res.status(400).send("Verification link expired or invalid.");
  }
};

module.exports = { registration, verifyEmail };
