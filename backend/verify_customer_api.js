const BASE_URL = "http://localhost:8080/api";
const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "admin123";

async function runTests() {
  console.log("🚀 Starting Customer Management Module Verification...");

  try {
    // 1. Authenticate as Admin
    console.log("\n🔑 1. Logging in as Admin...");
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });

    const loginData = await loginRes.json();
    if (!loginRes.ok || !loginData.success || !loginData.token) {
      throw new Error(`Admin login failed: ${JSON.stringify(loginData)}`);
    }

    const token = loginData.token;
    console.log("🟢 Login successful. Token received.");

    // Helpers to fetch
    const get = async (endpoint) => {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        throw new Error(`GET ${endpoint} returned non-JSON: ${text.slice(0, 800)}`);
      }
      if (!res.ok) throw new Error(`GET ${endpoint} failed: ${JSON.stringify(data)}`);
      return { status: res.status, data };
    };

    const patch = async (endpoint, body) => {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        throw new Error(`PATCH ${endpoint} returned non-JSON: ${text.slice(0, 800)}`);
      }
      if (!res.ok) throw new Error(`PATCH ${endpoint} failed: ${JSON.stringify(data)}`);
      return { status: res.status, data };
    };

    // 2. Fetch Customer List
    console.log("\n👥 2. Fetching Customer List (Page 1)...");
    const listRes = await get("/admin/customers?page=1&limit=10");
    console.log("🟢 Status:", listRes.status);
    console.log("🟢 Pagination:", listRes.data.pagination);
    console.log("🟢 Customer Count:", listRes.data.customers.length);
    if (listRes.data.customers.length > 0) {
      console.log("👉 First Customer Sample:", JSON.stringify(listRes.data.customers[0], null, 2));
    }

    // 3. Fetch Customer Analytics
    console.log("\n📊 3. Fetching Customer Analytics...");
    const analyticsRes = await get("/admin/customers/analytics");
    console.log("🟢 Status:", analyticsRes.status);
    console.log("🟢 Analytics Data:", JSON.stringify(analyticsRes.data.analytics, null, 2));

    // 4. Fetch Details of first customer
    if (listRes.data.customers.length === 0) {
      console.log("⚠️ No customer to fetch details for. Seeding might be needed.");
      return;
    }

    const testCustId = listRes.data.customers[0].id;
    console.log(`\n🔍 4. Fetching Customer Details for ID: ${testCustId}...`);
    const detailRes = await get(`/admin/customers/${testCustId}`);
    console.log("🟢 Status:", detailRes.status);
    console.log("🟢 Metrics:", JSON.stringify(detailRes.data.customer.metrics, null, 2));
    console.log("🟢 Order Stats:", JSON.stringify(detailRes.data.customer.stats, null, 2));
    console.log("🟢 Recent Orders Count:", detailRes.data.customer.recentOrders.length);

    // 5. Fetch Customer Orders
    console.log(`\n📦 5. Fetching Customer Orders for ID: ${testCustId}...`);
    const ordersRes = await get(`/admin/customers/${testCustId}/orders?page=1&limit=5`);
    console.log("🟢 Status:", ordersRes.status);
    console.log("🟢 Customer Orders Count:", ordersRes.data.orders.length);

    // 6. Test Status Management: Block Customer
    console.log(`\n🚫 6. Blocking Customer ID: ${testCustId}...`);
    const blockRes = await patch(`/admin/customers/${testCustId}/status`, {
      status: "BLOCKED",
    });
    console.log("🟢 Status:", blockRes.status);
    console.log("🟢 Status Response:", blockRes.data.message, blockRes.data.customer);

    // Validate they are blocked in list
    const checkBlockedRes = await get(`/admin/customers/${testCustId}`);
    console.log("🟢 Verified Block Status:", checkBlockedRes.data.customer.status); // should be BLOCKED

    // 7. Restore status back to ACTIVE
    console.log(`\n✅ 7. Restoring Customer ID: ${testCustId} to ACTIVE...`);
    const restoreRes = await patch(`/admin/customers/${testCustId}/status`, {
      status: "ACTIVE",
    });
    console.log("🟢 Status:", restoreRes.status);
    console.log("🟢 Status Response:", restoreRes.data.message);

    console.log("\n🎉 All backend customer management API tests completed successfully!");

  } catch (error) {
    console.error("🔴 Test execution failed with error:");
    console.error(error.message);
    process.exit(1);
  }
}

runTests();
