require("dotenv").config({ path: "../.env" });
const express = require("express");
const cors = require("cors");
const connectToDatabase = require("./src/dbconfig/dbConfig");
const userRoutes = require("./src/routes/userRoutes");
const produstsRoutes = require("./src/routes/produstsRoutes");
const cartRoutes = require("./src/routes/cartRoutes");
const wishlistRoutes = require("./src/routes/wishlistRoutes");
const orderRoutes = require("./src/routes/orderRoutes");
const authenticateToken = require("./src/middleware/authMiddleware");
const app = express();

const corsOptions = {
  origin: ["https://the-store-cl7n.vercel.app", "http://localhost:3000"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend deployed on Vercel 🚀");
});
app.use("/users", userRoutes);
app.use("/product", produstsRoutes);
app.use("/cart", authenticateToken, cartRoutes);
app.use("/wishlist", authenticateToken, wishlistRoutes);
app.use("/orders", authenticateToken, orderRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectToDatabase();
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error starting the server:", error.message);
    process.exit(1);
  }
};

startServer();
