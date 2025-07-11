const User = require("../Model/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

let login = async (req, res) => {
   
    try {
        const { email, password } = req.body;

        if (!email) {
            return res.status(400).send("Email is required");
        }

        if (!password) {
            return res.status(400).send("password is required");
        }

        let exitingUser = await User.findOne({email:email})

        if (exitingUser){
            bcrypt.compare(password, exitingUser.password, function(err, result) {
                if (result){

                    const token = jwt.sign({
                        username: exitingUser.name,
                        userid: exitingUser._id,
                    }, process.env.JWT_SECRET,{
                        expiresIn: "1h"
                    });

                    res.status(200).json({
                        "access_token": token,
                        "message": "Login Successful",
                        //"course": exitingUser.course
                    });

                }else{
                    return res.status(400).send("Invalid credentials");
                }
            });
        } else {
            return res.status(400).send("Invalid credentials");
        }
    } 
    catch (error) {
        res.status(400).status("Invalid credentials");
    }  
}

module.exports = login;