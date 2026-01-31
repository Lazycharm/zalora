# ZALORA Fashion — User Manual

This manual describes how to use the ZALORA Fashion online shop as a **shopper**, **seller**, and **account holder**. It covers browsing, cart, checkout, account management, wallet, and selling.

---

## Table of Contents

1. [Introduction & Getting Started](#1-introduction--getting-started)
2. [Country & Language](#2-country--language)
3. [Browsing & Shopping](#3-browsing--shopping)
4. [Cart & Checkout](#4-cart--checkout)
5. [Your Account](#5-your-account)
6. [Becoming a Seller](#6-becoming-a-seller)
7. [Visiting Shops](#7-visiting-shops)
8. [Support & Legal](#8-support--legal)
9. [Troubleshooting & FAQ](#9-troubleshooting--faq)

---

## 1. Introduction & Getting Started

### What is ZALORA Fashion?

ZALORA Fashion is an e‑commerce platform where you can:

- **Shop** — Browse categories, search products, add to cart, and pay (including with cryptocurrency or account balance).
- **Manage your account** — Profile, orders, addresses, favorites, wallet, notifications, and settings.
- **Sell** — Open a shop, list products, manage orders, and handle shop wallet (top-up, withdraw, records).

### First-time visit

1. Open the ZALORA Fashion website.
2. If prompted, **select your country/region** on the country selection page. This helps set your language and experience.
3. You can browse without logging in. To place orders, save favorites, or use the wallet, you must **register** and **log in**.

### Registering and logging in

- **Register:** Use the **Sign up** / **Join us** link (e.g. from the header, footer, or `/auth/register`). Fill in email, password, and any required fields, then submit.
- **Log in:** Go to **Log In** (e.g. header or `/auth/login`). Enter email and password. You can use **Forgot password?** at `/auth/forgot-password` if needed.
- After login, you are redirected to the homepage (or to the page you had in the `?redirect=...` URL, if safe).

---

## 2. Country & Language

### Country selection

- On first visit you may see a **country/region selection** page (`/select-country`).
- Choose your country from the list (e.g. USA, UK, Germany, France, Japan, China, and many others).
- Your choice is stored so you are not asked again on the same device.
- Country can influence the **default language** (see below).

### Language

- The site supports **multiple languages** (e.g. English, 简体中文, 繁體中文, Deutsch, Français, 日本語, español, and others).
- **Changing language:**
  - **Desktop:** Use the **language selector** in the header (globe or language label). Pick a language from the dropdown; the interface updates and your choice is saved.
  - **Mobile:** Use the language control on the homepage/header (e.g. globe icon) and select your language.
- **Default language** can be set by:
  1. Your **saved preferred language** (from the language selector).
  2. Your **selected country** (e.g. Germany → German).
  3. Your **browser language** if it matches a supported language.
  4. **English** as final fallback.

---

## 3. Browsing & Shopping

### Homepage

- **Hero slider** — Promotional banners; click to go to linked pages or campaigns.
- **Categories** — Shortcuts to main categories (e.g. Women, Men, Kids, Accessories). Click to open that category.
- **Featured / new products** — Product carousels (e.g. “Best Deals”, “New Arrivals”). Use **View All** to see the full list.
- **Search** — Use the search bar (or “Search Products” / “Search Store” buttons) to open the **search modal**.

### Search

- Click the **search field** or **Search** button in the header to open the search overlay.
- Type your query. Results update as you type (products by name, etc.).
- **Recent searches** may be shown; click one to run it again.
- **Popular categories** may appear when the search is empty; click to browse.
- Click a **product** in the results to go to its product page.

### Categories

- **Sidebar (desktop):** Left sidebar lists categories. Click a category to go to `/categories?slug=...` or the category page.
- **Categories page** — Grid or list of categories; click one to see **products in that category**.
- **Category product page** (`/categories/[slug]`):
  - **Sort:** e.g. by price (low/high), popularity, rating.
  - **Pagination:** Navigate through pages of products.
  - Click a product card to open the **product detail** page.

### Products listing

- **Products page** (`/products`) — Browse all (or filtered) products.
- Each **product card** usually shows: image, name, price, compare price (if any), rating, and optional “Add to cart” or “View”.
- Click the card to open the **product detail** page.

### Product detail page

- **Images** — Main image and often a gallery; you can change the selected image.
- **Name, price, compare price** — A discount percentage may be shown if there is a compare price.
- **Quantity** — Select quantity (e.g. 1–stock).
- **Add to cart** — Adds the chosen quantity to your cart; you can continue shopping.
- **Buy now** — Adds to cart and takes you to the **cart** page.
- **Add to collection (favorites)** — Saves the product to your favorites (requires login). If not logged in, you are sent to login with a return URL to this product.
- **Description / specifications / reviews** — Tabs or sections below for full details.
- **Related products** — Links to similar items at the bottom.

### Deals

- **Deals** page (`/deals`) — Lists current deals or promotions. Use it like the products listing to find and open product pages.

### Favorites (My Collection / Shop Collection)

- **Favorites** are managed from **Account → Shop Collection** (or “My Collection” in the account stats).
- From a product page, use the heart/collection button to add or remove.
- Favorites are tied to your account and visible across devices when logged in.

---

## 4. Cart & Checkout

### Cart

- **Opening the cart:** Click the **cart icon** in the header or go to `/cart`.
- **Contents:** List of items with image, name, price, quantity, and optional remove button.
- **Quantity:** Increase/decrease per item; changes update the total.
- **Select items:** You can select which items to checkout (e.g. checkboxes or “Select all”). Only selected items are included in the checkout total.
- **Subtotal** is shown for selected items.
- **Empty cart:** If the cart is empty, you see a message and a link to **Start shopping** or **Products**.

### Checkout (place order)

- From the cart, go to **Checkout** (e.g. “Proceed to checkout” or similar).
- Checkout has two main steps: **Address** and **Payment**.

#### Step 1: Address

- If you have **saved addresses**, they are loaded. You can **choose one** (e.g. default or any other).
- You can **edit** the form: full name, email, phone, address, city, state, zip, country, notes.
- All required fields must be filled. Optionally **save** this address for future orders (if the site supports it in this step).

#### Step 2: Payment

- **Payment methods** typically include:
  - **Account balance** — Use your ZALORA wallet balance (user balance and, if you are a seller, optionally shop balance).
  - **Cryptocurrency** — Choose a crypto type (e.g. USDT) and use the displayed wallet address and amount. You send the exact amount to that address; the order is recorded when payment is confirmed.
  - **Card** — If shown, fields for card number, name, expiry, CVV may appear (implementation may vary; card might be disabled in some setups).
- **Totals:** Subtotal, shipping (e.g. free), tax (e.g. 10%), and **total** are displayed.
- If using **balance**, ensure your balance is at least the total.
- **Place order** — Click to submit. You may be redirected to an order confirmation or order history.

### After placing an order

- You can see the order in **Account → My Orders**.
- Click the order to open **order details** (order number, status, items, total, address, payment info).
- Order statuses (e.g. Payment pending, Waiting for delivery, Waiting for receipt, Completed, Refund/After-sales) are shown in account and in order detail.

---

## 5. Your Account

Access **Account** from the header (your name or “Account”) or by going to `/account`. You must be logged in.

### Account overview

- **Profile block:** Avatar, name, masked email, short ID. Link to **Edit profile**.
- **Stats row:** My Collection (favorites count), Shop Collection, My Browse, **Account balance** (wallet).
- **My Orders** strip: Shortcuts to order statuses (Payment pending, Waiting for delivery, etc.) and link to full **My Orders**.
- **Menu list** — Links to all account sections (see below). Some items appear only if you are a seller or have a shop.

### Profile

- **Account → Profile** (or “Edit profile” from the overview).
- **Editable:** Full name, email, phone number. **Photo:** Upload a new avatar (rules: image file, often max 3 MB).
- **Save** to apply. Success or error messages appear after submit.

### My Orders

- **Account → My Orders** (`/account/orders`).
- List of orders with: order number, date, status, payment status, total, and link to **details**.
- **Order details** (`/account/orders/[id]`): Full address, items, quantities, prices, total, and status. Use this to **track** your order.

### Delivery addresses

- **Account → Delivery address** (`/account/addresses`).
- **List** of saved addresses. **Add** new or **Edit** / **Delete** existing.
- **Fields:** Name, phone, country, state, city, address, postal code, and “Default address” checkbox.
- Default address is pre-selected at checkout when you load saved addresses.

### Favorites (Shop Collection / My Collection)

- **Account → Shop Collection** (`/account/favorites`).
- List of products you added from product pages. Open product or remove from favorites.

### Wallet

- **Account → Wallet management** (`/account/wallet`).
- **Balance** — Your current account balance (used for checkout when you choose “balance”).
- **Top up** — Add funds:
  - **Top up** entry → choose method (e.g. USDT ERC-20, USDT TRC-20, ETH, BTC, Bank). You are shown the platform’s payment details; after you send the amount, the balance updates when the deposit is confirmed (may require admin approval).
  - **Recharge record** — List of deposits (amount, currency, status, date).
- **Withdraw** — Take funds out:
  - **Withdraw** → choose method (e.g. USDT, ETH, BTC, Bank). Enter amount and withdrawal address (or bank details). Submit; withdrawals often need **admin approval** before the amount is sent.
  - **Withdrawal record** — List of withdrawals (amount, status, date).
- **Transaction history** on the wallet page combines recent deposits and withdrawals.

### Notifications

- **Account → Service Center** or **Notifications** (`/account/notifications`).
- **Filters:** All, Unread, Orders, Payments, Promotions, System, Support.
- **Actions:** Open a notification, **Mark as read**, **Mark all read**, or delete.
- Notifications can also appear in the **header dropdown** (bell icon); click to see recent and a link to “View all”.

### Billing records

- **Account → Billing records** (`/account/billing`).
- View billing or invoice history related to your account (exact content depends on implementation).

### Login & payment password

- **Account → Login password** or **Payment password** — Usually link to **Account → Password** (`/account/password`).
- Change **login password** or set/change **payment password** (if the site uses it for sensitive actions).

### Settings

- **Account → Set up** (`/account/settings`).
- **Account settings:** Notifications (e.g. email/push toggles), privacy options, and other preferences. Save after changes.

### Service Center (Support)

- **Account → Service Center** (`/account/support`).
- Open **support tickets** or contact support (see [Support & Legal](#8-support--legal)).

### Wholesale (sellers)

- **Account → Wholesale management** (`/account/wholesale`).
- Shown if your account has **seller** rights. Use for wholesale-related actions (content depends on configuration).

### Download the app

- **Account → Download the app** — Link or instructions to download the ZALORA app (if available).

---

## 6. Becoming a Seller

To sell on ZALORA you need to **open a shop** and complete **KYC (identity verification)**. Until your shop is approved, some seller areas are locked or show “Approve shop to access”.

### Apply for a shop

- **Account → Apply for shop** or go to **Seller → Create shop** (`/seller/create-shop`).
- **Form:** Shop name, slug (URL-friendly name), description, logo, banner.
- **KYC:** Contact name, ID number, invite code (if required), **ID card front**, **ID card back**, main business, detailed address.
- **Uploads:** Logo and banner (e.g. images, max 5 MB). ID card images as required.
- Submit the form. The shop is created in **pending** state; verification is reviewed by admin.

### KYC verification status

- **Seller → Verification status** (`/seller/verification-status`).
- Shows: **No application yet** — Create a shop first.
- If you applied: **Pending** — Under review. **Approved** — You can access the seller dashboard and manage shop. **Rejected** — Message and reason; you can correct and reapply if allowed.

### Seller dashboard

- **Seller → Seller Dashboard** (`/seller/dashboard`) — Available when your shop is **active** and KYC **approved**.
- **Summary cards:** Total products, Active products, Total orders, Pending orders, Total revenue, Shop balance.
- **Recent orders** — List with link to “View all” orders.
- **Quick actions:** “Add new product”, “Manage shop”.
- If you have **no shop yet**, the dashboard shows a prompt to **Create your shop**.

### Shop details (manage shop)

- **Seller → Shop details** (`/seller/shop`).
- **Edit:** Name, slug, description, logo, banner, contact info. **Stats:** Followers, total sales, level (e.g. BRONZE, SILVER, GOLD, PLATINUM).
- **Shop wallet** (if available from this page): Balance, top-up, withdraw, recharge record, withdrawal record — same idea as account wallet but for **shop** funds.

### Product management

- **Seller → Product management** (`/seller/products`).
- **List** of your products. **Add new product** or **Edit** existing.
- **Add from catalog** (if available) — Add products from a shared catalog to your shop.
- **Product form:** Name, slug, description, price, compare price, cost price, category, images, stock, status (e.g. Draft, Published). Save to create or update.

### Store orders (seller)

- **Seller → Store orders** (`/seller/orders`).
- Orders that contain **your shop’s** products. List with status, customer, total, date.
- **Order details** (`/seller/orders/[id]`): Full order info, shipping address, items (yours and possibly others), and status. Update status (e.g. shipped) if the flow allows.

### Shop wallet (seller)

- **Seller → Shop** → **Wallet** (or Shop details → Wallet).
- **Balance** — Shop earnings.
- **Top up** — Add funds to the shop wallet (e.g. for refunds or fees).
- **Withdraw** — Request withdrawal to your chosen method (e.g. USDT, bank). Often requires **admin approval**.
- **Recharge record** / **Withdrawal record** — History of shop top-ups and withdrawals.

---

## 7. Visiting Shops

- **Shops** — You can browse **shops** by name or link (e.g. `/shops/[slug]`).
- **Shop page:** Shop name, logo, banner, description, and **products** from that shop. Click a product to go to the product detail page.
- From a **product** that belongs to a shop, you can often click the shop name to go to that shop’s page.

---

## 8. Support & Legal

### Contact

- **Contact us** (`/contact`) — Form or instructions to send a message to support. Use for general questions, technical issues, or order help.

### About

- **About us** (`/about`) — Company or platform information.

### Merchant agreement

- **Merchant agreement** (`/merchant-agreement`) — Terms and conditions for sellers. Read before opening a shop.

### Other links

- **Join us** — Registration.
- **Footer / sidebar** — Links to About, Contact, Merchant agreement, and possibly legal pages (e.g. Privacy, Terms). Check the footer on each page.

---

## 9. Troubleshooting & FAQ

### I can’t log in

- Check email and password. Use **Forgot password?** if needed.
- Ensure your account is **active** (not suspended). Contact support if access was working before and nothing changed on your side.

### Cart is empty after adding products

- Cart is stored in your browser (and possibly account when logged in). Clearing cookies or using another device/browser can show an empty cart until you add items again.
- If you were not logged in and then logged in, some implementations merge cart; others do not. Try adding the product again.

### I don’t see my order

- Go to **Account → My Orders**. If it’s not there, the order may not have been placed (e.g. payment failed). Check your email for confirmation.
- **Payment pending:** Complete payment (e.g. send crypto to the given address, or pay with balance/card). Until payment is confirmed, the order may stay in “Payment pending”.

### How do I change my address for an order?

- After placement, the shipping address usually cannot be edited. Cancel and reorder with the correct address if the order is still in an early status, or contact support.

### Wallet: top-up not showing

- Deposits (especially crypto) can take time to confirm. Check **Recharge record** for status (e.g. Pending, Completed).
- If you used the wrong amount or address, contact support with transaction details.

### Wallet: withdrawal not received

- Withdrawals often require **admin approval**. Check **Withdrawal record** for status (e.g. Pending, Approved, Completed). If it is completed and you did not receive the funds, contact support with the withdrawal ID and method.

### I applied for a shop but don’t see the seller dashboard

- Ensure **KYC** is **Approved** and shop status is **Active**. Check **Seller → Verification status**.
- If status is Pending, wait for review. If Rejected, follow the instructions to correct and reapply.

### Language or country is wrong

- Use the **language selector** in the header to set language; it is saved for next visits.
- Country is set on the country selection page; clearing site data or using the selection again (if the site allows) can reset it.

### Site is in maintenance

- If you see a **maintenance** page, the platform is temporarily unavailable. Try again later.

### Chat / assistant

- A **chat or assistant** widget may appear (e.g. bottom-right). Use it for quick questions (e.g. “Track my order”, “Payment help”, “Refund policy”, “Shipping info”) or to contact support.

---

## Quick reference — Main URLs

| Section            | Typical URL                    |
|--------------------|---------------------------------|
| Home               | `/`                             |
| Categories         | `/categories`, `/categories/[slug]` |
| Products           | `/products`, `/products/[slug]` |
| Cart               | `/cart`                         |
| Checkout           | `/checkout`                     |
| Deals              | `/deals`                        |
| Login              | `/auth/login`                   |
| Register           | `/auth/register`                |
| Forgot password    | `/auth/forgot-password`         |
| Country selection  | `/select-country`               |
| Account            | `/account`                      |
| Profile            | `/account/profile`              |
| Orders             | `/account/orders`               |
| Addresses          | `/account/addresses`            |
| Favorites          | `/account/favorites`            |
| Wallet             | `/account/wallet`               |
| Notifications      | `/account/notifications`        |
| Settings           | `/account/settings`             |
| Support            | `/account/support`              |
| Create shop        | `/seller/create-shop`           |
| Verification       | `/seller/verification-status`   |
| Seller dashboard   | `/seller/dashboard`             |
| Shop details       | `/seller/shop`                  |
| Seller products    | `/seller/products`              |
| Seller orders      | `/seller/orders`                |
| Shops              | `/shops/[slug]`                 |
| Contact            | `/contact`                      |
| About              | `/about`                        |
| Merchant agreement | `/merchant-agreement`           |

---

*This manual reflects the ZALORA Fashion platform as of the last update. Some options (e.g. payment methods, KYC steps) may vary by region or configuration. For the latest terms and features, check the site and legal pages.*
