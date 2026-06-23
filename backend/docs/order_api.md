# GriVA Order Module API & Testing Reference

This document covers backend Order API specifications, raw HTTP/cURL testing commands, and the frontend user testing flow.

* **Base URL**: `http://localhost:8080/api`
* **Content-Type**: `application/json`

---

## Endpoint Index

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/orders` | Place a new order (COD only) | Optional (JWT / Guest checkout) |
| `GET` | `/orders/my-orders` | Fetch personal order receipts | Yes (Customer JWT) |
| `GET` | `/orders` | Fetch all order history (Admin) | Yes (Admin JWT) |
| `GET` | `/orders/analytics` | Fetch sales metrics & charts | Yes (Admin JWT) |
| `PATCH` | `/orders/:id/status` | Update status (`pending`, `shipped`, etc.) | Yes (Admin JWT) |

---

## Part 1: Backend API Details & cURL Commands

### 1. Authenticate / Login to get Token
Before invoking protected customer or admin routes, authenticate to obtain your JWT token.

* **URL**: `/auth/login`
* **Method**: `POST`
* **cURL Command**:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "jassim.althani@gmail.com", "password": "CustomerPassword123!"}'
```
* **Response (Extract `token`)**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1Ni...",
  "user": { "id": 2, "email": "jassim.althani@gmail.com", "role": "customer" }
}
```

---

### 2. Create Order (COD Checkout)
Submit the list of items to buy, along with shipping information. If logged in, the database cart is automatically cleared.

* **URL**: `/orders`
* **Method**: `POST`
* **Headers**: `Authorization: Bearer <JWT_TOKEN>` (Optional)
* **Payload Structure**:
```json
{
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "selected_color": "Gold",
      "selected_storage": "100ml"
    }
  ],
  "shipping_address": "Flat 4B, Pearl Qatar Marina, Doha",
  "city": "Doha",
  "customer_name": "Jassim Al Thani",
  "customer_phone": "+97455667788",
  "customer_email": "jassim.althani@gmail.com",
  "payment_method": "COD",
  "delivery_notes": "Leave at the reception desk."
}
```
* **Success Response (201 Created)**:
```json
{
  "success": true,
  "message": "Order placed successfully.",
  "order": {
    "id": 12,
    "order_number": "GRV-20260618-0001",
    "status": "pending",
    "total_price": 370.00,
    "payment_method": "COD",
    "createdAt": "2026-06-18T10:05:00.000Z"
  }
}
```
* **cURL Command**:
```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"items": [{"product_id": 1, "quantity": 2, "selected_color": "Gold", "selected_storage": "100ml"}], "shipping_address": "Pearl Qatar", "city": "Doha", "customer_name": "Jassim Al Thani", "customer_phone": "+97455667788", "customer_email": "jassim.althani@gmail.com"}'
```

---

### 3. Fetch Customer Order History
Retrieve a list of past orders placed by the currently authenticated user.

* **URL**: `/orders/my-orders`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <JWT_TOKEN>` (Required)
* **cURL Command**:
```bash
curl -X GET http://localhost:8080/api/orders/my-orders \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

---

### 4. Fetch All Orders (Admin)
Fetch every order placed on the platform.

* **URL**: `/orders`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <ADMIN_JWT_TOKEN>` (Required)
* **cURL Command**:
```bash
curl -X GET http://localhost:8080/api/orders \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>"
```

---

### 5. Update Order Status (Admin)
Modify the progress status of a specific order transaction.

* **URL**: `/orders/:id/status`
* **Method**: `PATCH`
* **Headers**: `Authorization: Bearer <ADMIN_JWT_TOKEN>` (Required)
* **Body**:
```json
{
  "status": "shipped"
}
```
* **cURL Command**:
```bash
curl -X PATCH http://localhost:8080/api/orders/12/status \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"status": "shipped"}'
```

---

### 6. Get E-Commerce Analytics (Admin)
Fetch total revenue, sales velocity, average order values, and category metrics.

* **URL**: `/orders/analytics`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <ADMIN_JWT_TOKEN>` (Required)
* **cURL Command**:
```bash
curl -X GET http://localhost:8080/api/orders/analytics \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>"
```

---

## Part 2: Frontend E2E Flow Testing Steps

Follow these steps in your browser to verify the frontend order checkout integrations:

### 1. Clear State & Cart Initialization
1. Open your browser and navigate to `http://localhost:3000`.
2. Inspect the **Cart icon** in the top header. It should read `0` if empty.
3. Browse to a Product Detail page (e.g., *Oud Ispahan Perfume*).
4. Select variants (e.g., Color: `Gold`, Storage: `100ml`), select a quantity of `2`, and click **Add to Cart**.
5. The header cart badge should now display `2`.

### 2. Verify Session Login & Merging
1. Click on the Cart dropdown or navigate to `http://localhost:3000/cart`.
2. Click **Proceed to Checkout**. If you are logged out, you will be redirected to `/login`.
3. Log in using the test customer credentials:
   - **Email**: `customer@griva.qa` (or another seeded account)
   - **Password**: `CustomerPassword123!`
4. Upon successful login, the frontend will automatically merge your guest cart items into the database. Verify that the cart items and total price remain intact.

### 3. Complete Checkout Form
1. Click **Proceed to Checkout** again to enter `http://localhost:3000/checkout`.
2. Observe the Checkout Page:
   - **Order Summary**: Displays your products, selected options, individual pricing, and correct subtotal.
   - **Shipping Form**: Input your Name, Email, Phone Number, City, and Address.
   - **Payment Method**: Automatically fixed to Cash on Delivery (COD).
3. Try clicking **Place Order** with empty shipping fields. The form validations should prevent submission and highlight missing fields.

### 4. Place Order & Success Page Redirect
1. Fill out all shipping fields correctly.
2. Click **Place Order**. A loading spinner or disabled state should display during backend execution.
3. Upon success, you will be automatically redirected to:
   `http://localhost:3000/order-success?orderNumber=GRV-YYYYMMDD-XXXX`
4. Confirm that the success page displays your exact order number (`GRV-YYYYMMDD-XXXX`) and a success confirmation message.

### 5. Verify Database State & Order History
1. Click the profile icon in the header or navigate to `http://localhost:3000/account`.
2. Under the **My Orders** section, you should see your newly placed order at the top.
3. Verify that the order number matches, the payment status is listed as `unpaid` (since COD orders start as unpaid), and the order status is `pending`.
4. Return to `http://localhost:3000/cart`. Verify that the cart is now empty (`0` items) as database records are cleared post-checkout.
