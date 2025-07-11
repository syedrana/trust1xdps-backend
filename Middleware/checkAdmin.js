const jwt = require("jsonwebtoken");

const adminCheck = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1]; // ✅ শুধু টোকেন পার্স করলাম

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    req.user = decoded;
    next();

  } catch (error) {
    return res.status(400).json({ message: "Invalid or expired token." });
  }
};

module.exports = adminCheck;
