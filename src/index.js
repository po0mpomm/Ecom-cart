import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { connectDB } from "./db.js";
import Product from "./models/Product.js";
import productRoutes from "./routes/products.js";
import cartRoutes from "./routes/cart.js";


dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Connect MongoDB
connectDB();

// Seed sample products if empty
async function seedData() {
  const count = await Product.countDocuments();
  if (count === 0) {
    const mockProducts = [
      { name: "Vibe Tee", price: 799, image: "https://picsum.photos/seed/tee/400/400", description: "Soft cotton T-shirt with minimal Vibe logo." },
      { name: "Street Hoodie", price: 1999, image: "https://picsum.photos/seed/hoodie/400/400", description: "Cozy fleece hoodie for all seasons." },
      { name: "Skate Sneakers", price: 2499, image: "https://picsum.photos/seed/sneakers/400/400", description: "Durable sneakers with strong grip." }
    ];
    await Product.insertMany(mockProducts);
    console.log("🧩 Mock products inserted!");
  }
}
seedData();

// Routes
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);


app.get("/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
