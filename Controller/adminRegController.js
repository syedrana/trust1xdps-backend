const bcrypt = require("bcrypt");
const User = require("../Model/adminModel");

let adminRegistration = async (req, res) => {

    const { name, email, password } = req.body;


    bcrypt.hash(password, 10, async function (err, hash) {
        let user = new User({
            name: name,
            email: email,
            password: hash,
        })
        user.save();
        
    });
};

module.exports = adminRegistration;