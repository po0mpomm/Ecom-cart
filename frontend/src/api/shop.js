import { request } from "./client.js";

export function fetchProducts() {
  return request("/api/products");
}

export function fetchCart() {
  return request("/api/cart");
}

export function addToCart(productId, qty = 1) {
  return request("/api/cart", {
    method: "POST",
    data: { productId, qty },
  });
}

export function removeFromCart(productId) {
  return request(`/api/cart/${productId}`, {
    method: "DELETE",
  });
}


