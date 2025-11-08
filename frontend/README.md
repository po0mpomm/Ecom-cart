# Vibe Supply – Frontend

A React frontend for the mock e-commerce cart backend in the repo root. It fetches products, lets you add/remove items from the cart, and keeps totals in sync with the Express + MongoDB API.

## Features
- Product catalogue with search + responsive grid layout
- Live cart summary with totals and item breakdown
- API integration with loading/empty states and user notifications
- Axios-based client with configurable backend base URL

## Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the backend (from the repository root) so the API is available on `http://localhost:5000`:
   ```bash
   npm run dev
   ```
3. In this `frontend` folder, run the Vite dev server:
   ```bash
   npm run dev
   ```
4. Open the provided local URL (default `http://localhost:5173`). The app connects to the backend automatically when both are running.

## Configuration
- `VITE_API_BASE_URL` (optional): set this if the backend runs on a different host/port. Example:
  ```bash
  VITE_API_BASE_URL=http://localhost:5000
  ```
  Without this variable the app assumes:
  - `http://localhost:5000` during `npm run dev`
  - the same origin when built for production

## Testing the Flow
1. Load the app to see the seeded products from the backend.
2. Use “Add to cart” to push items to the server-side cart.
3. Remove items from the cart panel and observe totals updating immediately.

---
Tailor the styling and interactions under `src/App.css` and `src/api` as needed to match your branding or extend business logic.*** End Patch
