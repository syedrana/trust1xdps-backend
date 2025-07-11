const jwt = require("jsonwebtoken");

let checkLogin = (req, res, next) => {
    const { authorization } = req.headers;
    try {
        const token = authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { username, userid, role } = decoded;
        req.username = username;
        req.userid = userid;
        req.role = role;
        next();
    } catch (err) {
        // console.log(err);
        next("Authorization failure!");
    }
};

module.exports = checkLogin;