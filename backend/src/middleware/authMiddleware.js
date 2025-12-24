// const jwt = require("jsonwebtoken");
// const dotenv = require("dotenv");

// dotenv.config();

// const authenticateToken = (req, res, next) => {
//   const authHeader = req.headers["authorization"];
//   if (!authHeader) return res.sendStatus(401);

//   const token = authHeader.split(" ")[1];
//   if (!token) return res.sendStatus(401);

//   console.log("Token:", token);

//   jwt.verify(token, process.env.SESSION_SECRET, (err, user) => {
//     if (err) {
//       console.error("JWT Verification Error:", err.message);
//     }
//     req.user = user;
//     next();
//   });
// };

// module.exports = authenticateToken;
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.sendStatus(401);

  const token = authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.SESSION_SECRET, (err, user) => {
    if (err) {
      console.error("JWT Verification Error:", err.message);
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
