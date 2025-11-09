import { useEffect, useMemo, useState } from "react";
import "./App.css";
import {
  addToCart as addToCartApi,
  fetchCart,
  fetchProducts,
  removeFromCart,
} from "./api/shop.js";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const emptyCart = { items: [], total: 0 };

function normalizeCart(data) {
  if (!data) return emptyCart;
  const items = data.items ?? [];
  const total =
    typeof data.total === "number"
      ? data.total
      : items.reduce(
          (sum, item) => sum + (item?.product?.price ?? 0) * (item?.qty ?? 0),
          0
        );

  return {
    ...data,
    items,
    total,
  };
}

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(emptyCart);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCart, setLoadingCart] = useState(true);
  const [pendingCartAction, setPendingCartAction] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedProductId, setHighlightedProductId] = useState(null);
  const [cardStyles, setCardStyles] = useState({});
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    loadProductsAndCart();
    const timer = setTimeout(() => setIsReady(true), 120);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!notification) return undefined;
    const timer = setTimeout(() => setNotification(null), 3500);
    return () => clearTimeout(timer);
  }, [notification]);

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    const term = searchTerm.trim().toLowerCase();
    return products.filter((product) => {
      const haystack = `${product.name} ${product.description ?? ""}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [products, searchTerm]);

  async function loadProductsAndCart() {
    setLoadingProducts(true);
    setLoadingCart(true);
    setError(null);

    const [productsResult, cartResult] = await Promise.allSettled([
      fetchProducts(),
      fetchCart(),
    ]);

    if (productsResult.status === "fulfilled") {
      setProducts(productsResult.value);
    } else {
      setError(productsResult.reason?.message ?? "Unable to load products.");
    }

    if (cartResult.status === "fulfilled") {
      setCart(normalizeCart(cartResult.value));
    } else {
      setNotification({
        type: "warning",
        message: cartResult.reason?.message ?? "Unable to load your cart.",
      });
    }

    setLoadingProducts(false);
    setLoadingCart(false);
  }

  async function handleAddToCart(product) {
    setPendingCartAction(true);
    try {
      const updated = await addToCartApi(product._id, 1);
      setCart(normalizeCart(updated));
      setHighlightedProductId(product._id);
      setNotification({
        type: "success",
        message: `${product.name} added to cart.`,
      });
    } catch (err) {
      setNotification({
        type: "error",
        message: err.message ?? "Unable to add to cart.",
      });
    } finally {
      setPendingCartAction(false);
    }
  }

  async function handleRemoveFromCart(product) {
    setPendingCartAction(true);
    try {
      const updated = await removeFromCart(product._id);
      setCart(normalizeCart(updated));
      setHighlightedProductId(product._id);
      setNotification({
        type: "info",
        message: `${product.name} removed from cart.`,
      });
    } catch (err) {
      setNotification({
        type: "error",
        message: err.message ?? "Unable to update cart.",
      });
    } finally {
      setPendingCartAction(false);
    }
  }

  function handleCardMouseMove(event, productId) {
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateX = ((rect.height / 2 - y) / rect.height) * 10;
    const rotateY = ((x - rect.width / 2) / rect.width) * 10;
    const spotlightX = (x / rect.width) * 100;
    const spotlightY = (y / rect.height) * 100;

    setCardStyles((prev) => ({
      ...prev,
      [productId]: {
        "--rx": `${rotateX}deg`,
        "--ry": `${rotateY}deg`,
        "--px": `${spotlightX}%`,
        "--py": `${spotlightY}%`,
      },
    }));
  }

  function handleCardMouseLeave(productId) {
    setCardStyles((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  }

  const cartItems = cart?.items ?? [];
  const cartIsEmpty = !loadingCart && cartItems.length === 0;

  return (
    <div className={`app-shell ${isReady ? "is-ready" : ""}`}>
      <div className="ambient-lights">
        <span />
        <span />
        <span />
      </div>
      <header className="app-header">
        <div>
          <h1 className="brand">Vibe Supply</h1>
          <p className="tagline">Streetwear essentials delivered fast.</p>
        </div>
        <div className="search">
          <label className="sr-only" htmlFor="search">
            Search products
          </label>
          <input
            id="search"
            type="search"
            placeholder="Search for tee, hoodie, sneakers..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      </header>

      {error && <div className="app-error">{error}</div>}
      {notification && (
        <div className={`app-toast ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <main className="app-main">
        <section className="catalogue-section">
          <div className="section-header">
            <h2>Catalogue</h2>
            {!loadingProducts && (
              <span>{filteredProducts.length} products</span>
            )}
          </div>

          {loadingProducts ? (
            <div className="loading-block">Loading products…</div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state">
              <h3>No products found</h3>
              <p>Try a different search term or clear the filter.</p>
              <button
                type="button"
                className="secondary"
                onClick={() => setSearchTerm("")}
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <article
                  key={product._id}
                  className={`product-card ${
                    highlightedProductId === product._id ? "is-highlighted" : ""
                  }`}
                  onMouseMove={(event) => handleCardMouseMove(event, product._id)}
                  onMouseLeave={() => handleCardMouseLeave(product._id)}
                  style={cardStyles[product._id]}
                >
                  <div className="product-image">
                    <img src={product.image} alt={product.name} loading="lazy" />
                  </div>
                  <div className="product-body">
                    <div>
                      <h3>{product.name}</h3>
                      <p className="price">
                        {currencyFormatter.format(product.price)}
                      </p>
                    </div>
                    {product.description && (
                      <p className="description">{product.description}</p>
                    )}
                    <button
                      type="button"
                      onClick={() => handleAddToCart(product)}
                      disabled={pendingCartAction}
                    >
                      {pendingCartAction ? "Adding…" : "Add to cart"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="cart-section">
          <div className="section-header">
            <h2>Cart</h2>
            {!loadingCart && (
              <span>
                {cartItems.reduce((count, item) => count + item.qty, 0)} items
              </span>
            )}
          </div>

          {loadingCart ? (
            <div className="loading-block">Loading cart…</div>
          ) : cartIsEmpty ? (
            <div className="empty-cart">
              <h3>Your cart is empty</h3>
              <p>Add some pieces to see them here.</p>
            </div>
          ) : (
            <>
              <ul className="cart-list">
                {cartItems.map((item) => (
                  <li key={item.product._id} className="cart-item">
                    <div>
                      <h4>{item.product.name}</h4>
                      <p>
                        {item.qty} ×{" "}
                        {currencyFormatter.format(item.product.price)}
                      </p>
                    </div>
                    <div className="cart-item-actions">
                      <span className="item-total">
                        {currencyFormatter.format(
                          item.product.price * item.qty
                        )}
                      </span>
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => handleRemoveFromCart(item.product)}
                        disabled={pendingCartAction}
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <footer className="cart-footer">
                <div>
                  <span>Total</span>
                  <strong>{currencyFormatter.format(cart.total ?? 0)}</strong>
                </div>
                <button type="button" disabled>
                  Checkout (coming soon)
                </button>
              </footer>
            </>
          )}
        </aside>
      </main>
    </div>
  );
}

export default App;
