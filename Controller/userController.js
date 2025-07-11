    // const User = require("../Model/userModel");

    // let registration = async (req, res) => {

    //     try {
    //         const { firstName, lastName, address, email, mobile, nid, reference, nomineeName, nomineeRelation, nomineeMobile, password, confirmPassword } = req.body;
            
    //         const image = req.file ? `http://localhost:7000/uploads/${req.file.filename}` : "";

    //         // Required field validation
    //         if (!firstName || !lastName || !address || !email || !mobile || !nid || !nomineeName || !nomineeRelation || !nomineeMobile || !password || !confirmPassword) {
    //         return res.status(400).send("All fields are required");
    //         }

    //         // Email format check
    //         const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    //         if (!pattern.test(email)) {
    //         return res.status(400).send("Invalid email");
    //         }

    //         // Password match check
    //         if (password !== confirmPassword) {
    //         return res.status(400).send("Password do not match");
    //         }

    //         // Password strength check
    //         const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,16}$/;
    //         if (!strongPassword.test(password)) {
    //         return res.status(400).send("Password must be 8-16 characters with uppercase, lowercase, number, and symbol");
    //         }

    //         // Check if user already exists
    //         const existingUser = await User.findOne({ email });
    //         if (existingUser) {
    //         return res.status(400).send("User Already Exists");
    //         }
                


    //         // bcrypt.hash(password, 10, async function (err, hash) {});

    //         let user = new User({
    //             firstName: firstName,
    //             lastName: lastName,
    //             address: address,
    //             email: email,
    //             mobile: mobile,
    //             nid: nid,
    //             image: image,
    //             reference: reference,
    //             nomineeName: nomineeName,
    //             nomineeRelation: nomineeRelation,
    //             nomineeMobile: nomineeMobile,
    //             password: password,
    //             isVerified: false,
    //             isApproved: false
    //         })

    //         await user.save();
            
    //         res.send({
    //             message: "User Registration Successful",
    //             id: user._id,
    //             firstName: user.firstName,
    //             lastName: user.lastName,
    //             address: user.address,
    //             email: user.email,
    //             mobile: user.mobile,
    //             nid: user.nid,
    //             reference: user.reference,
    //             image: user.image,
    //             nomineeName: user.nomineeName,
    //             nomineeRelation: user.nomineeRelation,
    //             nomineeMobile: user.nomineeMobile,
    //         });
    //     } catch {
    //         console.error("Contact form error:", error);

    //         // Mongoose validation errors
    //         if (error.name === "ValidationError") {
    //             const messages = Object.values(error.errors).map(val => val.message);
    //             return res.status(400).json({ success: false, message: messages.join(", ") });
    //         }

    //         // Duplicate email error
    //         if (error.code === 11000 && error.keyPattern.email) {
    //             return res.status(400).json({ success: false, message: "Email already exists" });
    //         }

    //         res.status(500).json({
    //             success: false,
    //             message: "Server Error",
    //         });
    //     }
    // };

    // module.exports = registration;




    // const transporter = nodemailer.createTransport({
            //     service: "gmail",
            //     auth: {
            //         User: "7syedrana@gmail.com",
            //         pass: " ",
            //     },
            // });

            // const info = await transporter.sendMail({
            //     from: 'Todolist',
            //     To: " ",
            //     subject: " ",
            //     html: "",
            // })










const User = require("../Model/userModel");

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

    const image = req.file ? `http://localhost:7000/uploads/${req.file.filename}` : "";

    // Required field validation
    if (
      !firstName ||
      !lastName ||
      !address ||
      !email ||
      !mobile ||
      !nid ||
      !nomineeName ||
      !nomineeRelation ||
      !nomineeMobile ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).send("All fields are required");
    }

    // Email format check
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!pattern.test(email)) {
      return res.status(400).send("Invalid email");
    }

    // Password match check
    if (password !== confirmPassword) {
      return res.status(400).send("Passwords do not match");
    }

    // Password strength check
    const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,16}$/;
    if (!strongPassword.test(password)) {
      return res
        .status(400)
        .send("Password must be 8-16 characters with uppercase, lowercase, number, and symbol");
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send("User Already Exists");
    }

    // Create new user
    let user = new User({
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
      confirmPassword, // ✅ virtual field required for pre-save hook
    });

    await user.save();

    res.send({
      message: "User Registration Successful",
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

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = registration;
