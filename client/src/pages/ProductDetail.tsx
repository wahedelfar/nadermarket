import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowRight, Minus, Plus } from "lucide-react";
import { Link, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";

export default function ProductDetail() {
  const [match, params] = useRoute("/product/:id");
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<any>(null);
  const { addToCart } = useCart();

  const { data: productData, isLoading } = trpc.products.getById.useQuery(
    params?.id ? parseInt(params.id) : 0,
    { enabled: !!params?.id }
  );

  useEffect(() => {
    if (productData) {
      setProduct(productData);
    }
  }, [productData]);

  if (!match) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin">جاري التحميل...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <Link href="/products">
              <Button variant="ghost" className="mb-4">
                <ArrowRight className="w-4 h-4 ml-2" />
                العودة
              </Button>
            </Link>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-xl text-gray-600">المنتج غير موجود</p>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    setQuantity(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <h1 className="text-2xl font-bold text-blue-600 cursor-pointer">نادر ماركت</h1>
          </Link>
          <Link href="/cart">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <ShoppingCart className="w-4 h-4 ml-2" />
              السلة
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Link href="/products">
          <Button variant="ghost" className="mb-6">
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة للمنتجات
          </Button>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-lg shadow-md p-8">
          {/* Product Image */}
          <div className="flex items-center justify-center">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">لا توجد صورة</span>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>

            {product.description && (
              <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>
            )}

            <div className="mb-6">
              <span className="text-4xl font-bold text-blue-600">
                {parseFloat(product.price).toFixed(2)}
              </span>
              <span className="text-gray-600 mr-2">ج.م</span>
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {product.stock > 0 ? (
                <span className="text-green-600 font-semibold">
                  متوفر ({product.stock} وحدة)
                </span>
              ) : (
                <span className="text-red-600 font-semibold">غير متوفر</span>
              )}
            </div>

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">الكمية</label>
                <div className="flex items-center gap-4">
                  <Button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    variant="outline"
                    className="p-2"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 text-center border border-gray-300 rounded-lg py-2"
                    min="1"
                    max={product.stock}
                  />
                  <Button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    variant="outline"
                    className="p-2"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            <div className="flex gap-4">
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 text-lg"
              >
                <ShoppingCart className="w-5 h-5 ml-2" />
                أضف للسلة
              </Button>
              <Link href="/cart">
                <Button variant="outline" className="flex-1 py-3 text-lg">
                  اذهب للسلة
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
