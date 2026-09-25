import { createCategory, createProduct, getCategories, getProducts } from "./db";

export async function seedDatabase() {
  const existingCategories = await getCategories();
  const categoryData = [
    ["اللحوم", "لحوم طازة وعالية الجودة"],
    ["البقوليات", "عدس وفاصوليا وحمص طازة"],
    ["الألبان", "جبن وزبادي وألبان طازة"],
    ["الخضروات", "خضروات طازة يومية"],
    ["الفواكه", "فواكه طازة وموسمية"],
    ["الحبوب", "أرز وقمح ودقيق"],
    ["المعلبات", "معلبات وحفظيات"],
    ["الزيوت والتوابل", "زيوت وتوابل وبهارات"],
  ] as const;

  const categories = [...existingCategories];
  for (const [name, description] of categoryData) {
    if (!categories.some((c) => c.name === name)) {
      categories.push(await createCategory({ name, description }));
    }
  }

  const categoryId = (name: string) => categories.find((c) => c.name === name)?.id;
  const existingProducts = await getProducts(undefined, true);

  const products = [
    ["اللحوم","لحم بقري طازة","لحم بقري عالي الجودة، طازة يومياً","120.00",50],
    ["اللحوم","دجاج طازة","دجاج طازة، منتقى بعناية","45.00",100],
    ["اللحوم","لحم ضأن","لحم ضأن طازة وطيب","150.00",30],
    ["البقوليات","عدس أحمر","عدس أحمر طازة وصحي","25.00",200],
    ["البقوليات","فاصوليا بيضاء","فاصوليا بيضاء مختارة","30.00",150],
    ["البقوليات","حمص","حمص طازة وجودة عالية","28.00",180],
    ["الألبان","جبن أبيض","جبن أبيض طازة","60.00",80],
    ["الألبان","زبادي","زبادي طازة وصحي","15.00",120],
    ["الألبان","حليب طازة","حليب طازة يومياً","12.00",200],
    ["الخضروات","طماطم طازة","طماطم حمراء طازة","8.00",300],
    ["الخضروات","خيار طازة","خيار أخضر طازة","6.00",250],
    ["الخضروات","بصل","بصل طازة وجودة عالية","5.00",400],
    ["الفواكه","برتقال طازة","برتقال حلو وطازة","15.00",200],
    ["الفواكه","موز","موز أصفر وناضج","10.00",180],
    ["الفواكه","تفاح أحمر","تفاح أحمر طازة","18.00",150],
    ["الحبوب","أرز أبيض","أرز أبيض فاخر","35.00",300],
    ["الحبوب","دقيق أبيض","دقيق أبيض عالي الجودة","20.00",250],
    ["الزيوت والتوابل","زيت زيتون","زيت زيتون بكر ممتاز","80.00",100],
    ["الزيوت والتوابل","ملح","ملح ناعم وجودة عالية","5.00",500],
  ] as const;

  for (const [cat, name, description, price, stock] of products) {
    if (!existingProducts.some((p) => p.name === name)) {
      const id = categoryId(cat);
      if (!id) throw new Error(`القسم غير موجود: ${cat}`);
      await createProduct({ categoryId: id, name, description, price, stock, isActive: true });
    }
  }

  return { categories: await getCategories(), products: await getProducts() };
}
