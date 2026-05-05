import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { categories, products } from "./drizzle/schema.js";

// استخدام متغير البيئة أو قيمة افتراضية
const DATABASE_URL = process.env.DATABASE_URL || "mysql://user:password@localhost/nader_market";

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

async function seed() {
  let connection;
  try {
    connection = await mysql.createConnection(DATABASE_URL);
  } catch (error) {
    console.error("❌ فشل الاتصال بقاعدة البيانات:", error.message);
    console.log("\n💡 تأكد من أن DATABASE_URL صحيح في متغيرات البيئة");
    process.exit(1);
  }
  const db = drizzle(connection);

  console.log("🌱 بدء إضافة البيانات الافتراضية...");

  // إضافة الأقسام
  const categoryData = [
    {
      name: "اللحوم",
      description: "لحوم طازة وعالية الجودة",
    },
    {
      name: "البقوليات",
      description: "عدس وفاصوليا وحمص طازة",
    },
    {
      name: "الألبان",
      description: "جبن وزبادي وألبان طازة",
    },
    {
      name: "الخضروات",
      description: "خضروات طازة يومية",
    },
    {
      name: "الفواكه",
      description: "فواكه طازة وموسمية",
    },
    {
      name: "الحبوب",
      description: "أرز وقمح ودقيق",
    },
    {
      name: "المعلبات",
      description: "معلبات وحفظيات",
    },
    {
      name: "الزيوت والتوابل",
      description: "زيوت وتوابل وبهارات",
    },
  ];

  try {
    for (const cat of categoryData) {
      await db.insert(categories).values(cat);
      console.log(`✅ تم إضافة قسم: ${cat.name}`);
    }
  } catch (error) {
    console.log("ℹ️ الأقسام موجودة بالفعل أو حدث خطأ");
  }

  // الحصول على الأقسام المضافة
  const allCategories = await db.select().from(categories);
  console.log(`\n📊 عدد الأقسام: ${allCategories.length}`);

  // إضافة المنتجات
  const productsData = [
    // اللحوم
    {
      name: "لحم بقري طازة",
      description: "لحم بقري عالي الجودة، طازة يومياً",
      price: 120,
      categoryId: allCategories.find((c) => c.name === "اللحوم")?.id || 1,
      imageUrl: "https://via.placeholder.com/300x300?text=لحم+بقري",
      stock: 50,
    },
    {
      name: "دجاج طازة",
      description: "دجاج طازة، منتقى بعناية",
      price: 45,
      categoryId: allCategories.find((c) => c.name === "اللحوم")?.id || 1,
      imageUrl: "https://via.placeholder.com/300x300?text=دجاج",
      stock: 100,
    },
    {
      name: "لحم ضأن",
      description: "لحم ضأن طازة وطيب",
      price: 150,
      categoryId: allCategories.find((c) => c.name === "اللحوم")?.id || 1,
      imageUrl: "https://via.placeholder.com/300x300?text=لحم+ضأن",
      stock: 30,
    },

    // البقوليات
    {
      name: "عدس أحمر",
      description: "عدس أحمر طازة وصحي",
      price: 25,
      categoryId: allCategories.find((c) => c.name === "البقوليات")?.id || 2,
      imageUrl: "https://via.placeholder.com/300x300?text=عدس",
      stock: 200,
    },
    {
      name: "فاصوليا بيضاء",
      description: "فاصوليا بيضاء مختارة",
      price: 30,
      categoryId: allCategories.find((c) => c.name === "البقوليات")?.id || 2,
      imageUrl: "https://via.placeholder.com/300x300?text=فاصوليا",
      stock: 150,
    },
    {
      name: "حمص",
      description: "حمص طازة وجودة عالية",
      price: 28,
      categoryId: allCategories.find((c) => c.name === "البقوليات")?.id || 2,
      imageUrl: "https://via.placeholder.com/300x300?text=حمص",
      stock: 180,
    },

    // الألبان
    {
      name: "جبن أبيض",
      description: "جبن أبيض طازة",
      price: 60,
      categoryId: allCategories.find((c) => c.name === "الألبان")?.id || 3,
      imageUrl: "https://via.placeholder.com/300x300?text=جبن",
      stock: 80,
    },
    {
      name: "زبادي",
      description: "زبادي طازة وصحي",
      price: 15,
      categoryId: allCategories.find((c) => c.name === "الألبان")?.id || 3,
      imageUrl: "https://via.placeholder.com/300x300?text=زبادي",
      stock: 120,
    },
    {
      name: "حليب طازة",
      description: "حليب طازة يومياً",
      price: 12,
      categoryId: allCategories.find((c) => c.name === "الألبان")?.id || 3,
      imageUrl: "https://via.placeholder.com/300x300?text=حليب",
      stock: 200,
    },

    // الخضروات
    {
      name: "طماطم طازة",
      description: "طماطم حمراء طازة",
      price: 8,
      categoryId: allCategories.find((c) => c.name === "الخضروات")?.id || 4,
      imageUrl: "https://via.placeholder.com/300x300?text=طماطم",
      stock: 300,
    },
    {
      name: "خيار طازة",
      description: "خيار أخضر طازة",
      price: 6,
      categoryId: allCategories.find((c) => c.name === "الخضروات")?.id || 4,
      imageUrl: "https://via.placeholder.com/300x300?text=خيار",
      stock: 250,
    },
    {
      name: "بصل",
      description: "بصل طازة وجودة عالية",
      price: 5,
      categoryId: allCategories.find((c) => c.name === "الخضروات")?.id || 4,
      imageUrl: "https://via.placeholder.com/300x300?text=بصل",
      stock: 400,
    },

    // الفواكه
    {
      name: "برتقال طازة",
      description: "برتقال حلو وطازة",
      price: 15,
      categoryId: allCategories.find((c) => c.name === "الفواكه")?.id || 5,
      imageUrl: "https://via.placeholder.com/300x300?text=برتقال",
      stock: 200,
    },
    {
      name: "موز",
      description: "موز أصفر وناضج",
      price: 10,
      categoryId: allCategories.find((c) => c.name === "الفواكه")?.id || 5,
      imageUrl: "https://via.placeholder.com/300x300?text=موز",
      stock: 180,
    },
    {
      name: "تفاح أحمر",
      description: "تفاح أحمر طازة",
      price: 18,
      categoryId: allCategories.find((c) => c.name === "الفواكه")?.id || 5,
      imageUrl: "https://via.placeholder.com/300x300?text=تفاح",
      stock: 150,
    },

    // الحبوب
    {
      name: "أرز أبيض",
      description: "أرز أبيض فاخر",
      price: 35,
      categoryId: allCategories.find((c) => c.name === "الحبوب")?.id || 6,
      imageUrl: "https://via.placeholder.com/300x300?text=أرز",
      stock: 300,
    },
    {
      name: "دقيق أبيض",
      description: "دقيق أبيض عالي الجودة",
      price: 20,
      categoryId: allCategories.find((c) => c.name === "الحبوب")?.id || 6,
      imageUrl: "https://via.placeholder.com/300x300?text=دقيق",
      stock: 250,
    },

    // الزيوت والتوابل
    {
      name: "زيت زيتون",
      description: "زيت زيتون بكر ممتاز",
      price: 80,
      categoryId: allCategories.find((c) => c.name === "الزيوت والتوابل")?.id || 8,
      imageUrl: "https://via.placeholder.com/300x300?text=زيت+زيتون",
      stock: 100,
    },
    {
      name: "ملح",
      description: "ملح ناعم وجودة عالية",
      price: 5,
      categoryId: allCategories.find((c) => c.name === "الزيوت والتوابل")?.id || 8,
      imageUrl: "https://via.placeholder.com/300x300?text=ملح",
      stock: 500,
    },
  ];

  try {
    for (const prod of productsData) {
      await db.insert(products).values(prod);
      console.log(`✅ تم إضافة منتج: ${prod.name}`);
    }
  } catch (error) {
    console.log("ℹ️ المنتجات موجودة بالفعل أو حدث خطأ");
  }

  const allProducts = await db.select().from(products);
  console.log(`\n📊 عدد المنتجات: ${allProducts.length}`);

  console.log("\n✨ تم إضافة البيانات الافتراضية بنجاح!");

  await connection.end();
}

seed().catch((error) => {
  console.error("❌ خطأ:", error);
  process.exit(1);
});
