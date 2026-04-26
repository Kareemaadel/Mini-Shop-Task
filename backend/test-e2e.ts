import "dotenv/config";
import assert from "node:assert";

const API_URL = "http://localhost:3000";

async function request(path: string, options: RequestInit = {}) {
  const isJsonBody = options.body && typeof options.body === "string";
  const headers = {
    ...(isJsonBody ? { "Content-Type": "application/json" } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  // If no content
  if (res.status === 204) return null;

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  if (!res.ok) {
    throw new Error(`API Error [${res.status}]: ${JSON.stringify(data)}`);
  }

  return data;
}

async function runTests() {
  console.log("Starting E2E Tests...\n");

  const testUser = {
    name: "E2E Test User",
    email: `test-${Date.now()}@test.com`,
    password: "password123",
  };

  let customerToken = "";
  let adminToken = "";
  let productId = "";
  let orderId = "";

  try {
    // ── 1. Register a new customer ─────────────────────────────────────────
    console.log("1. Testing Auth Module - Registering new customer...");
    const regResult = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify(testUser),
    });
    assert(regResult.email === testUser.email, "Registration failed");
    console.log("   ✅ Customer registered successfully");

    // ── 2. Login as new customer ───────────────────────────────────────────
    console.log("2. Testing Auth Module - Logging in as customer...");
    const loginResult = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: testUser.email, password: testUser.password }),
    });
    customerToken = loginResult.access_token;
    assert(customerToken, "Login failed, no token returned");
    console.log("   ✅ Customer logged in successfully");

    // ── 3. Login as Admin ──────────────────────────────────────────────────
    console.log("3. Testing Auth Module - Logging in as admin...");
    // Assuming admin@test.com exists from the seed script
    const adminLoginResult = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "admin@test.com", password: "password123" }),
    });
    adminToken = adminLoginResult.access_token;
    assert(adminToken, "Admin login failed, no token returned");
    console.log("   ✅ Admin logged in successfully");

    // ── 4. Admin creates a product ─────────────────────────────────────────
    console.log("4. Testing Products Module - Admin creates a product...");

    // First need a valid category ID, let's fetch products to get one or hardcode it via DB query...
    // Actually we can just create a product by passing the required fields. We need a multipart/form-data request.
    const formData = new FormData();
    formData.append("name", "E2E Test Product");
    formData.append("description", "A product created during E2E testing");
    formData.append("price", "99.99");
    // We will cheat a bit and find a category first if we can, or we can just update the product creation logic if we don't know a category.
    // Let's fetch all products to grab an existing category ID.
    const existingProducts = await request("/products");
    const categoryId = existingProducts[0]?.category_id;
    assert(categoryId, "No categories found to attach product to");

    formData.append("category_id", categoryId);

    // Using node-fetch with FormData is tricky in native fetch sometimes, let's just make a POST with native fetch FormData
    const createProductRes = await fetch(`${API_URL}/products`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
      body: formData,
    });

    const createdProduct = await createProductRes.json();
    if (!createProductRes.ok) throw new Error(JSON.stringify(createdProduct));

    productId = createdProduct.id;
    assert(productId, "Product creation failed");
    console.log("   ✅ Admin created product successfully");

    // ── 5. Public fetches products ─────────────────────────────────────────
    console.log("5. Testing Products Module - Public fetches products...");
    const productsList = await request("/products");
    assert(productsList.length > 0, "No products found");
    const foundProduct = productsList.find((p: any) => p.id === productId);
    assert(foundProduct, "Newly created product not found in list");
    console.log("   ✅ Public fetched products successfully");

    // ── 6. Customer places an order ────────────────────────────────────────
    console.log("6. Testing Orders Module - Customer places an order...");
    const orderResult = await request("/orders", {
      method: "POST",
      headers: { Authorization: `Bearer ${customerToken}` },
      body: JSON.stringify({
        items: [{ product_id: productId, quantity: 2 }],
      }),
    });
    orderId = orderResult.id;
    assert(orderId, "Order creation failed");
    assert(orderResult.total_amount === 199.98, "Order total calculated incorrectly");
    console.log("   ✅ Customer placed order successfully");

    // ── 7. Customer views their orders ─────────────────────────────────────
    console.log("7. Testing Orders Module - Customer views their orders...");
    const myOrders = await request("/orders/my", {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert(myOrders.length > 0, "Customer has no orders");
    assert(myOrders[0].id === orderId, "Order ID mismatch in history");
    console.log("   ✅ Customer viewed orders successfully");

    // ── 8. Admin updates order status ──────────────────────────────────────
    console.log("8. Testing Orders Module - Admin updates order status...");
    const updateResult = await request(`/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status: "shipped" }),
    });
    assert(updateResult.status === "shipped", "Order status update failed");
    console.log("   ✅ Admin updated order status successfully");

    // ── 9. Admin soft-deletes the product ──────────────────────────────────
    console.log("9. Testing Products Module - Admin deletes product...");
    const deleteResult = await request(`/products/${productId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(deleteResult.is_active === false, "Product soft-delete failed");
    console.log("   ✅ Admin deleted product successfully");

    console.log("\n All E2E tests passed successfully!");
  } catch (error: any) {
    console.error("\n Test Failed:");
    console.error(error.message || error);
    process.exit(1);
  }
}

runTests();
