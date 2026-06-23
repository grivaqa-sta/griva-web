# GriVA Customer Management API Reference

All customer directory endpoints require **JWT Authentication** and **Admin Role status**. Include the token in the `Authorization` header as `Bearer <token>`.

* **Base URL**: `http://localhost:8080/api`
* **Content-Type**: `application/json`

---

## Endpoint Index

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/admin/customers` | Fetch paginated, searchable, sorted, and filtered customer list | Yes (Admin) |
| `GET` | `/admin/customers/analytics` | Fetch customer directory analytics summary | Yes (Admin) |
| `GET` | `/admin/customers/:id` | Fetch detailed customer profile (stats, address, orders) | Yes (Admin) |
| `GET` | `/admin/customers/:id/orders` | Fetch customer's orders history | Yes (Admin) |
| `PATCH` | `/admin/customers/:id/status` | Update customer ACTIVE/BLOCKED status | Yes (Admin) |

---

## Endpoint Details

### 1. Customer List
Retrieve a paginated list of all customers, with options to search, filter by segment/risk/status, and sort by order stats.

* **URL**: `/admin/customers`
* **Method**: `GET`
* **Query Parameters**:
  * `page` (Optional, default: `1`): Current page index.
  * `limit` (Optional, default: `10`): Number of customers per page.
  * `search` (Optional): Query matching Name, Email, or Phone.
  * `filter` (Optional):
    * `ACTIVE` - Active accounts
    * `BLOCKED` - Blocked accounts
    * `VIP` - Customers with total spend >= QAR 5000
    * `HIGH_RISK` - Customers with order success rate < 50%
    * `NEW` - Customers with <= 1 order
    * `REPEAT` - Customers with >= 2 orders
  * `sort` (Optional, default: `newest`):
    * `newest` - Registration date descending
    * `most_orders` - Order count descending
    * `highest_spending` - Total spent descending
    * `highest_success_rate` - Successful delivered order rate descending
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "customers": [
      {
        "id": 2,
        "name": "Jassim Al-Thani",
        "email": "jassim.althani@gmail.com",
        "phone": "+9747770123",
        "status": "ACTIVE",
        "totalOrders": 15,
        "deliveredOrders": 12,
        "cancelledOrders": 2,
        "returnedOrders": 1,
        "successRate": 80,
        "totalSpent": 4500.00,
        "lastOrderDate": "2026-06-19T14:56:02.000Z",
        "riskLevel": "LOW",
        "registrationDate": "2026-06-01T08:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 1,
      "totalPages": 1
    }
  }
  ```
* **cURL Example**:
  ```bash
  curl -X GET "http://localhost:8080/api/admin/customers?page=1&limit=10&filter=VIP" \
    -H "Authorization: Bearer <ADMIN_JWT_TOKEN>"
  ```

---

### 2. Customer Detail
Fetch comprehensive metrics, address configurations, and the latest 10 orders for a single customer.

* **URL**: `/admin/customers/:id`
* **Method**: `GET`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "customer": {
      "id": 2,
      "name": "Jassim Al-Thani",
      "email": "jassim.althani@gmail.com",
      "phone": "+9747770123",
      "registrationDate": "2026-06-01T08:00:00.000Z",
      "status": "ACTIVE",
      "addresses": {
        "home": {
          "id": 1,
          "userId": 2,
          "label": "home",
          "fullName": "Jassim Al-Thani",
          "mobile": "+9747770123",
          "area": "Al Sadd",
          "street": "Al Mirqab Al Jadeed",
          "building_number": "12",
          "city": "Doha",
          "country": "Qatar",
          "isDefault": true
        },
        "office": null
      },
      "stats": {
        "totalOrders": 15,
        "deliveredOrders": 12,
        "cancelledOrders": 2,
        "returnedOrders": 1,
        "totalSpent": 4500.00,
        "averageOrderValue": 300.00,
        "lastOrderDate": "2026-06-19T14:56:02.000Z"
      },
      "metrics": {
        "successRate": 80,
        "riskLevel": "LOW",
        "customerSegment": "VIP Customer"
      },
      "recentOrders": [
        {
          "id": 42,
          "orderNumber": "GRV-20260619-0001",
          "date": "2026-06-19T14:56:02.000Z",
          "amount": "QAR 350.00",
          "status": "completed"
        }
      ]
    }
  }
  ```
* **cURL Example**:
  ```bash
  curl -X GET http://localhost:8080/api/admin/customers/2 \
    -H "Authorization: Bearer <ADMIN_JWT_TOKEN>"
  ```

---

### 3. Customer Orders
Retrieve a paginated, status-filtered history of all orders placed by the specified customer.

* **URL**: `/admin/customers/:id/orders`
* **Method**: `GET`
* **Query Parameters**:
  * `page` (Optional, default: `1`)
  * `limit` (Optional, default: `10`)
  * `status` (Optional): Filter by orders status (`pending`, `shipped`, `completed`, `cancelled`, etc.)
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "orders": [
      {
        "id": 42,
        "orderNumber": "GRV-20260619-0001",
        "date": "2026-06-19T14:56:02.000Z",
        "amount": "QAR 350.00",
        "status": "completed"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 1,
      "totalPages": 1
    }
  }
  ```
* **cURL Example**:
  ```bash
  curl -X GET "http://localhost:8080/api/admin/customers/2/orders?status=completed" \
    -H "Authorization: Bearer <ADMIN_JWT_TOKEN>"
  ```

---

### 4. Customer Directory Analytics
Retrieve cumulative directory insights summarizing total users, segments, risk distributions, and average customer value.

* **URL**: `/admin/customers/analytics`
* **Method**: `GET`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "analytics": {
      "totalCustomers": 18,
      "activeCustomers": 17,
      "blockedCustomers": 1,
      "newCustomersThisMonth": 4,
      "repeatCustomers": 12,
      "vipCustomers": 3,
      "highRiskCustomers": 2,
      "averageCustomerValue": 842.50
    }
  }
  ```
* **cURL Example**:
  ```bash
  curl -X GET http://localhost:8080/api/admin/customers/analytics \
    -H "Authorization: Bearer <ADMIN_JWT_TOKEN>"
  ```

---

### 5. Update Customer Status
Alter a customer account state to block or unblock the user. Blocked accounts will be rejected during login requests.

* **URL**: `/admin/customers/:id/status`
* **Method**: `PATCH`
* **Request Body**:
  ```json
  {
    "status": "BLOCKED"
  }
  ```
* **Validation**:
  * `status` (Required): Must be either `"ACTIVE"` or `"BLOCKED"`.
  * **Self-modification Block**: Admins cannot block or unblock themselves.
  * **Admin Account Guard**: This endpoint rejects modification attempts on any account with role `"admin"`.
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Customer status updated to BLOCKED successfully.",
    "customer": {
      "id": 2,
      "name": "Jassim Al-Thani",
      "email": "jassim.althani@gmail.com",
      "status": "BLOCKED"
    }
  }
  ```
* **cURL Example**:
  ```bash
  curl -X PATCH http://localhost:8080/api/admin/customers/2/status \
    -H "Authorization: Bearer <ADMIN_JWT_TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{"status": "BLOCKED"}'
  ```
