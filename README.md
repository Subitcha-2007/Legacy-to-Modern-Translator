# Sakthimurugan Medical Agencies ("SMM") - Unified Full-Stack B2B Platform
> **Erode District Wholesale Pharmaceutical Supplier & Stockist**  
> Serving 500+ Licensed Retail Pharmacies across Erode, Perundurai, Bhavani, Gobichettipalayam, and Sathyamangalam.

---

## 1. Single Unified Architecture (Port 3000)

The entire application runs as a **single, unified Next.js 14 full-stack process on http://localhost:3000** with an embedded local SQLite database managed by Prisma ORM.

```
       +--------------------------------------------------------------------------+
       |               SAKTHIMURUGAN MEDICAL AGENCIES ("SMM")                     |
       |             Single Unified Full-Stack Host (http://localhost:3000)       |
       +--------------------------------------------------------------------------+
                                            |
                    +-----------------------+-----------------------+
                    |                                               |
                    v                                               v
   +------------------------------------+          +------------------------------------+
   |         NEXT.JS 14 APP PAGES       |          |     APP ROUTER API ROUTE HANDLERS  |
   | - Tablet Catalog (Amazon/Flipkart) |          | - /api/auth (Login, Register, Me)  |
   | - Dual Box & Strip Pricing         |  Direct  | - /api/products (Search & CRUD)    |
   | - Bulk Cart & Logistics Checkout   |<-------->| - /api/orders (Credit Validation)  |
   | - Retailer Invoices & Statements   | Relative | - /api/orders/:id/invoice (Tax PDF)|
   | - Admin Dispatch Route Planning    |  Fetch   | - /api/ledger (Aging & Payments)   |
   | - Wholesale Payment Details Ledger |          | - /api/admin (KYC Verification)    |
   +------------------------------------+          +------------------------------------+
                    |                                               |
                    +-----------------------+-----------------------+
                                            |
                                            v
                           +---------------------------------+
                           |   PRISMA ORM (SQLITE EMBEDDED)  |
                           |       file:./prisma/dev.db      |
                           |  - Users (DL 20B/21B, GST, Bank)|
                           |  - Products (Batch, Exp, Stock) |
                           |  - Orders & Line Items          |
                           |  - Payment Details Transactions |
                           +---------------------------------+
```

---

## 2. Brand & Visual Identity
- **Website Name / Title**: Sakthimurugan Medical Agencies
- **Logo Text & Badge**: **"SMM"** with custom medical cross / distributor shield emblem.
- **Color Palette**:
  - Deep Medical Blue: `#0F4C81`
  - Mint Green: `#10B981`
  - Light Slate: `#F8FAFC`
- **Official Copyright**:  
  `© Sakthimurugan Medical Agencies, Erode. All Rights Reserved.`

---

## 3. Quick Demo Accounts

Use the **"Demo Switcher"** in the top navigation bar or log in with:

| Persona | Email | Password | Details |
|---|---|---|---|
| **Wholesale Admin** | `admin@sakthimurugan.com` | `Admin@123` | Managing Director / Dispatch Supervisor |
| **Approved Retailer** | `erode_pharmacy@gmail.com` | `Retailer@123` | Erode City Medicals (Limit: ₹1,50,000, Outstanding: ₹34,500) |
| **Pending Retailer** | `bhavani_medicals@gmail.com` | `Retailer@123` | Bhavani Sri Krishna Medicals (Pending KYC Approval) |

---

## 4. Single-Command Setup & Execution

### Prerequisites
- Node.js v18+ (tested on v24.19.0)
- npm v9+

### Launching the Application
No external database installation (PostgreSQL / Docker) is required. The embedded SQLite database (`file:./prisma/dev.db`) is automatically initialized, schema pushed, and seeded on startup.

1. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

2. Start the unified development server:
   ```bash
   npm run dev
   ```
   *Or for production mode:*
   ```bash
   npm run build
   npm start
   ```

3. Open **[http://localhost:3000](http://localhost:3000)** in your web browser.

---

## 5. REST API Endpoints (All Hosted on Port 3000)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | System and database status |
| `POST` | `/api/auth/register` | Public | Retailer onboarding with DL & Bank proof |
| `POST` | `/api/auth/login` | Public | Role-based JWT authentication |
| `GET` | `/api/auth/me` | Authenticated | Current user profile with live balance & limit |
| `GET` | `/api/products` | Public | Search and filter catalog with stock badges |
| `POST` | `/api/products` | Admin | Add new formulation with batch/expiry |
| `PUT` | `/api/products/:id` | Admin | Update medicine stock & pricing |
| `DELETE`| `/api/products/:id` | Admin | Remove medicine from catalog |
| `POST` | `/api/orders` | Retailer | Bulk checkout with credit limit verification |
| `GET` | `/api/retailer/orders`| Retailer | Retailer order history |
| `GET` | `/api/orders/:id/invoice`| Auth | Full wholesale tax invoice data |
| `GET` | `/api/orders/admin/all` | Admin | All orders for fleet dispatch |
| `PATCH`| `/api/orders/admin/:id/status`| Admin | Update dispatch status & assign route |
| `GET` | `/api/admin/pending-retailers`| Admin | Unapproved KYC applications |
| `PATCH`| `/api/admin/approve-retailer/:id`| Admin | Approve retailer & assign credit limit |
| `GET` | `/api/ledger/my-ledger`| Retailer | Personal Payment Details & ledger passbook |
| `GET` | `/api/ledger/admin/all` | Admin | All client ledgers with 15/30-day aging |
| `POST` | `/api/ledger/admin/record-payment`| Admin | Record manual cash/cheque payment |
| `GET` | `/api/admin/dashboard-stats` | Admin | Total revenue, dispatch queue, debt |
