import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function seed() {
  console.log("🌱 Seeding Mini Shop database...\n");

  // ────────────────────────────────────────────────────────────
  // 1. Create user accounts
  // ────────────────────────────────────────────────────────────
  console.log("👤 Creating user accounts...");

  // Customer
  const { data: customerAuth, error: customerErr } =
    await supabase.auth.admin.createUser({
      email: "customer@test.com",
      password: "password123",
      email_confirm: true,
      user_metadata: { name: "Test Customer" },
    });

  if (customerErr && !customerErr.message.includes("already been registered")) {
    console.error("  ❌ Customer creation failed:", customerErr.message);
  } else if (customerAuth?.user) {
    await supabase.from("profiles").upsert({
      id: customerAuth.user.id,
      name: "Test Customer",
      role: "customer",
    });
    console.log("  ✅ customer@test.com / password123");
  } else {
    console.log("  ⚠️  customer@test.com already exists — skipping");
  }

  // Admin
  const { data: adminAuth, error: adminErr } =
    await supabase.auth.admin.createUser({
      email: "admin@test.com",
      password: "password123",
      email_confirm: true,
      user_metadata: { name: "Test Admin" },
    });

  if (adminErr && !adminErr.message.includes("already been registered")) {
    console.error("  ❌ Admin creation failed:", adminErr.message);
  } else if (adminAuth?.user) {
    await supabase.from("profiles").upsert({
      id: adminAuth.user.id,
      name: "Test Admin",
      role: "admin",
    });
    console.log("  ✅ admin@test.com / password123");
  } else {
    console.log("  ⚠️  admin@test.com already exists — skipping");
  }

  // ────────────────────────────────────────────────────────────
  // 2. Insert categories
  // ────────────────────────────────────────────────────────────
  console.log("\n📁 Creating categories...");

  const categories = [
    { name: "Electronics", slug: "electronics" },
    { name: "Clothing", slug: "clothing" },
    { name: "Food", slug: "food" },
  ];

  const { data: insertedCategories, error: catError } = await supabase
    .from("categories")
    .upsert(categories, { onConflict: "slug" })
    .select();

  if (catError) {
    console.error("  ❌ Category insert failed:", catError.message);
    return;
  }

  const catMap = new Map(insertedCategories!.map((c) => [c.slug, c.id]));
  console.log(`  ✅ Created ${insertedCategories!.length} categories`);

  // ────────────────────────────────────────────────────────────
  // 3. Insert products
  // ────────────────────────────────────────────────────────────
  console.log("\n📦 Creating products...");

  const products = [
    // Electronics (4 products)
    {
      name: "Wireless Bluetooth Headphones",
      description:
        "Premium noise-canceling over-ear headphones with 30-hour battery life and deep bass.",
      price: 79.99,
      image_url: "https://placehold.co/400x400/1a1a2e/e94560.png?text=Headphones",
      category_id: catMap.get("electronics"),
      is_active: true,
    },
    {
      name: "Smart Watch Pro",
      description:
        "Fitness tracker with heart-rate monitor, GPS, and AMOLED display. Water-resistant to 50m.",
      price: 199.99,
      image_url: "https://placehold.co/400x400/16213e/0f3460.png?text=SmartWatch",
      category_id: catMap.get("electronics"),
      is_active: true,
    },
    {
      name: "Portable Power Bank 20000mAh",
      description:
        "Fast-charging portable charger with USB-C and dual USB-A ports. Charges 3 devices simultaneously.",
      price: 34.99,
      image_url: "https://placehold.co/400x400/1b262c/0f4c75.png?text=PowerBank",
      category_id: catMap.get("electronics"),
      is_active: true,
    },
    {
      name: "Mechanical Gaming Keyboard",
      description:
        "RGB backlit mechanical keyboard with Cherry MX switches, programmable macros, and aluminum frame.",
      price: 129.99,
      image_url: "https://placehold.co/400x400/2d4059/ea5455.png?text=Keyboard",
      category_id: catMap.get("electronics"),
      is_active: true,
    },

    // Clothing (4 products)
    {
      name: "Classic Denim Jacket",
      description:
        "Vintage-wash denim jacket with brass buttons. Comfortable fit with inner fleece lining.",
      price: 59.99,
      image_url: "https://placehold.co/400x400/40514e/11999e.png?text=DenimJacket",
      category_id: catMap.get("clothing"),
      is_active: true,
    },
    {
      name: "Organic Cotton T-Shirt",
      description:
        "Sustainably sourced 100% organic cotton crew-neck tee. Available in multiple colors.",
      price: 24.99,
      image_url: "https://placehold.co/400x400/30475e/f05454.png?text=T-Shirt",
      category_id: catMap.get("clothing"),
      is_active: true,
    },
    {
      name: "Running Sneakers Ultra",
      description:
        "Lightweight performance running shoes with responsive foam cushioning and breathable mesh upper.",
      price: 89.99,
      image_url: "https://placehold.co/400x400/222831/00adb5.png?text=Sneakers",
      category_id: catMap.get("clothing"),
      is_active: true,
    },
    {
      name: "Wool Beanie Hat",
      description:
        "Merino wool blend beanie with ribbed knit texture. One size fits all.",
      price: 19.99,
      image_url: "https://placehold.co/400x400/393e46/eeeeee.png?text=Beanie",
      category_id: catMap.get("clothing"),
      is_active: true,
    },

    // Food (4 products)
    {
      name: "Artisan Dark Chocolate Box",
      description:
        "Assortment of 12 handcrafted dark chocolate truffles. 70% cacao from single-origin beans.",
      price: 29.99,
      image_url: "https://placehold.co/400x400/3c1642/f55951.png?text=Chocolate",
      category_id: catMap.get("food"),
      is_active: true,
    },
    {
      name: "Organic Honey Jar (500g)",
      description:
        "Raw, unfiltered wildflower honey from local bee farms. No additives or preservatives.",
      price: 14.99,
      image_url: "https://placehold.co/400x400/f5a623/ffffff.png?text=Honey",
      category_id: catMap.get("food"),
      is_active: true,
    },
    {
      name: "Premium Matcha Green Tea",
      description:
        "Ceremonial-grade matcha powder from Uji, Kyoto. Stone-ground for rich umami flavor.",
      price: 39.99,
      image_url: "https://placehold.co/400x400/2e4600/a8df65.png?text=Matcha",
      category_id: catMap.get("food"),
      is_active: true,
    },
    {
      name: "Mixed Nuts Trail Pack",
      description:
        "Roasted almonds, cashews, walnuts, and dried cranberries. High-protein, no added sugar.",
      price: 12.99,
      image_url: "https://placehold.co/400x400/6b4226/d4a76a.png?text=TrailMix",
      category_id: catMap.get("food"),
      is_active: true,
    },
  ];

  const { error: prodError } = await supabase.from("products").insert(products);
  if (prodError) {
    console.error("  ❌ Product insert failed:", prodError.message);
  } else {
    console.log(`  ✅ Created ${products.length} products`);
  }

  console.log("\n🎉 Seed complete!\n");
  console.log("Test accounts:");
  console.log("  Customer:  customer@test.com / password123");
  console.log("  Admin:     admin@test.com / password123");
}

seed().catch(console.error);
