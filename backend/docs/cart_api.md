# GriVA Shopping Cart API Reference

All cart endpoints (except standard guest interactions before login) require **JWT Authentication**. Include the token in the `Authorization` header as `Bearer <token>`.

* **Base URL**: `http://localhost:8080/api`
* **Content-Type**: `application/json`

---

## Endpoint Index

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/cart` | Retrieve user's cart and items | Yes (JWT) |
| `POST` | `/cart/items` | Add product to cart | Yes (JWT) |
| `PATCH` | `/cart/items/:id` | Update item quantity by cart item ID | Yes (JWT) |
| `DELETE` | `/cart/items/:id` | Remove item from cart by cart item ID | Yes (JWT) |
| `DELETE` | `/cart` | Clear all items from cart | Yes (JWT) |
| `POST` | `/cart/merge` | Merge guest items into database cart | Yes (JWT) |

---

## Endpoint Details

### 1. Get Cart
Fetch all items in the user's active cart. If no cart exists, one is automatically initialized.

* **URL**: `/cart`
* **Method**: `GET`
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "cart": {
    "id": 1,
    "user_id": 2,
    "items": [
      {
        "id": 5,
        "productId": 1,
        "title": "Oud Ispahan Premium Perfume 100ml",
        "image": "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800",
        "price": "$185.00",
        "priceNumber": 185.00,
        "quantity": 2,
        "selectedColor": "Gold",
        "selectedStorage": "100ml",
        "category": "Perfumes"
      }
    ],
    "totalItems": 2,
    "totalPrice": 370.00
  }
}
```

* **cURL Example**:
```bash
curl -X GET http://localhost:8080/api/cart \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

---

### 2. Add Item to Cart
Add a product line to the user's cart. If an item with matching variants (`selected_color`, `selected_storage`) already exists, the quantity is incremented.

* **URL**: `/cart/items`
* **Method**: `POST`
* **Request Body**:
```json
{
  "product_id": 1,
  "selected_color": "Gold",
  "selected_storage": "100ml",
  "quantity": 1
}
```
* **Validation**:
  * `product_id` (Required): Must be an integer and exist in the database catalog.
  * `quantity` (Optional, defaults to 1): Must be a positive integer.
  * **Stock Check**: The total requested quantity (`existing + added`) must not exceed the product's available `stock`.
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Item added to cart successfully.",
  "cart": { ... } // Returns complete updated cart object
}
```
* **Error Response (400 Bad Request - Stock Limit)**:
```json
{
  "success": false,
  "message": "Cannot add more items. Only 25 left in stock."
}
```

* **cURL Example**:
```bash
curl -X POST http://localhost:8080/api/cart/items \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"product_id": 1, "selected_color": "Gold", "selected_storage": "100ml", "quantity": 1}'
```

---

### 3. Update Cart Item Quantity
Modify the quantity of a specific cart item directly using its unique database row `id` (obtained from the cart details).

* **URL**: `/cart/items/:id`
* **Method**: `PATCH`
* **Request Body**:
```json
{
  "quantity": 3
}
```
* **Validation**:
  * `quantity` (Required): Must be a positive integer greater than 0.
  * **Stock Check**: Must not exceed the product's available `stock`.
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Quantity updated successfully.",
  "cart": { ... }
}
```

* **cURL Example**:
```bash
curl -X PATCH http://localhost:8080/api/cart/items/5 \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"quantity": 3}'
```

---

### 4. Remove Item from Cart
Delete a specific cart item row from the cart.

* **URL**: `/cart/items/:id`
* **Method**: `DELETE`
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Item removed from cart successfully.",
  "cart": { ... }
}
```

* **cURL Example**:
```bash
curl -X DELETE http://localhost:8080/api/cart/items/5 \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

---

### 5. Clear Cart
Empty the user's cart by deleting all rows from database storage.

* **URL**: `/cart`
* **Method**: `DELETE`
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Cart cleared successfully.",
  "cart": {
    "items": [],
    "totalItems": 0,
    "totalPrice": 0
  }
}
```

* **cURL Example**:
```bash
curl -X DELETE http://localhost:8080/api/cart \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

---

### 6. Merge Guest Cart
Send guest cart items cached in `localStorage` to merge with the authenticated user's cart in the database.

* **URL**: `/cart/merge`
* **Method**: `POST`
* **Request Body**:
```json
{
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "selectedColor": "Gold",
      "selectedStorage": "100ml"
    },
    {
      "productId": 2,
      "quantity": 1,
      "selectedColor": "Black",
      "selectedStorage": "50g"
    }
  ]
}
```
* **Merge Rules**:
  * If the matching product + color + storage variant exists in the user's database cart, sum the quantities (capped at available inventory stock).
  * If it does not exist, insert it.
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Cart merged successfully.",
  "cart": { ... }
}
```

* **cURL Example**:
```bash
curl -X POST http://localhost:8080/api/cart/merge \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"items": [{"productId": 1, "quantity": 2, "selectedColor": "Gold", "selectedStorage": "100ml"}]}'
```
