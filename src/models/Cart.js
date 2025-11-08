import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  qty: { type: Number, required: true, default: 1 }
});

const cartSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // we’ll use a mock user id
  items: [cartItemSchema],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Cart", cartSchema);
