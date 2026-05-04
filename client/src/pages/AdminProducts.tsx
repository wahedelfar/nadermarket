import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Edit2, Trash2, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    categoryId: 0,
    name: "",
    description: "",
    price: "",
    image: "",
    stock: 0,
  });

  const { data: productsData } = trpc.products.list.useQuery(undefined);
  const { data: categoriesData } = trpc.categories.list.useQuery();
  const createMutation = trpc.products.create.useMutation();
  const updateMutation = trpc.products.update.useMutation();
  const deleteMutation = trpc.products.delete.useMutation();

  useEffect(() => {
    if (productsData) setProducts(productsData);
  }, [productsData]);

  useEffect(() => {
    if (categoriesData) setCategories(categoriesData);
  }, [categoriesData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "stock" || name === "categoryId" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, ...formData });
        toast.success("تم تحديث المنتج بنجاح");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("تم إضافة المنتج بنجاح");
      }
      resetForm();
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("تم حذف المنتج بنجاح");
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ");
    }
  };

  const resetForm = () => {
    setFormData({
      categoryId: 0,
      name: "",
      description: "",
      price: "",
      image: "",
      stock: 0,
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">إدارة المنتجات</h1>
          <Link href="/admin">
            <Button variant="outline">
              <ArrowRight className="w-4 h-4 ml-2" />
              العودة
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 ml-2" />
            إضافة منتج جديد
          </Button>
        </div>

        {showForm && (
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-bold mb-6 text-gray-800">
              {editingId ? "تعديل المنتج" : "إضافة منتج جديد"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    القسم
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  >
                    <option value="0">اختر القسم</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    اسم المنتج
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="اسم المنتج"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    السعر
                  </label>
                  <Input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="السعر"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    المتوفر
                  </label>
                  <Input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="الكمية"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  الوصف
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="وصف المنتج"
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  رابط الصورة
                </label>
                <Input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="رابط الصورة"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700"
                >
                  {editingId ? "تحديث" : "إضافة"}
                </Button>
                <Button
                  type="button"
                  onClick={resetForm}
                  variant="outline"
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </Card>
        )}

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-right font-semibold text-gray-800">المنتج</th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-800">القسم</th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-800">السعر</th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-800">المتوفر</th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-800">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const category = categories.find((c) => c.id === product.categoryId);
                  return (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-800">{product.name}</p>
                          {product.description && (
                            <p className="text-sm text-gray-600 line-clamp-1">
                              {product.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{category?.name}</td>
                      <td className="px-6 py-4 font-semibold text-blue-600">
                        {parseFloat(product.price).toFixed(2)} ج.م
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            product.stock > 0
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              setFormData(product);
                              setEditingId(product.id);
                              setShowForm(true);
                            }}
                            variant="outline"
                            size="sm"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(product.id)}
                            variant="destructive"
                            size="sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
