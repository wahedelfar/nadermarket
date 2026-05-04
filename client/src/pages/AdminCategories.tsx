import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Edit2, Trash2, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const { data: categoriesData } = trpc.categories.list.useQuery();
  const createMutation = trpc.categories.create.useMutation();
  const updateMutation = trpc.categories.update.useMutation();
  const deleteMutation = trpc.categories.delete.useMutation();

  useEffect(() => {
    if (categoriesData) setCategories(categoriesData);
  }, [categoriesData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, ...formData });
        toast.success("تم تحديث القسم بنجاح");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("تم إضافة القسم بنجاح");
      }
      resetForm();
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا القسم؟")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("تم حذف القسم بنجاح");
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "" });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">إدارة الأقسام</h1>
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
            إضافة قسم جديد
          </Button>
        </div>

        {showForm && (
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-bold mb-6 text-gray-800">
              {editingId ? "تعديل القسم" : "إضافة قسم جديد"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  اسم القسم
                </label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="اسم القسم"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  الوصف
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="وصف القسم"
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
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
                  <th className="px-6 py-3 text-right font-semibold text-gray-800">اسم القسم</th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-800">الوصف</th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-800">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-800">{category.name}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {category.description || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setFormData(category);
                            setEditingId(category.id);
                            setShowForm(true);
                          }}
                          variant="outline"
                          size="sm"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(category.id)}
                          variant="destructive"
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
