import express from "express";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

const router = express.Router();

// helper to get or create a cart for a mock user
async function getOrCreateCart(userId = "demo-user") {
  let cart = await Cart.findOne({ userId }).populate("items.product");
  if (!cart) cart = await Cart.create({ userId, items: [] });
  return cart;
}

// GET /api/cart  → view cart + total
router.get("/", async (req, res) => {
  try {
    const cart = await getOrCreateCart();
    const total = cart.items.reduce((sum, i) => sum + i.product.price * i.qty, 0);
    res.json({ items: cart.items, total });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/cart  → add {productId, qty}
router.post("/", async (req, res) => {
  try {
    const { productId, qty } = req.body;
    if (!productId || qty <= 0) return res.status(400).json({ error: "Invalid data" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const cart = await getOrCreateCart();
    const existing = cart.items.find((i) => i.product._id.equals(productId));

    if (existing) existing.qty += qty;
    else cart.items.push({ product: productId, qty });

    await cart.save();
    const updated = await getOrCreateCart();
    res.status(201).json(updated);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/cart/:id  → remove item by product id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const cart = await getOrCreateCart();
    cart.items = cart.items.filter((i) => !i.product._id.equals(id));
    await cart.save();
    res.json(await getOrCreateCart());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
