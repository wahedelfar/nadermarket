import { ENV } from "./_core/env";

const API_URL = `${ENV.supabaseUrl}/functions/v1/nader-api`;

type ApiOptions = {
  action: string;
  body?: Record<string, unknown>;
  admin?: boolean;
};

async function api({ action, body = {}, admin = false }: ApiOptions) {
  const payload = admin
    ? {
        username: ENV.adminLoginUsername,
        password: ENV.adminLoginPassword,
        payload: body,
      }
    : body;

  const response = await fetch(`${API_URL}?action=${encodeURIComponent(action)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const apiError = data?.error;
    const message =
      typeof apiError === "string"
        ? apiError
        : apiError?.message || apiError?.details || apiError?.hint ||`Supabase API error (${response.status})`;
    throw new Error(String(message));
  }
  return data;
}

function categoryFromDb(row: any) {
  return row ? {
    id: Number(row.id),
    name: row.name,
    description: row.description ?? null,
    image: row.image ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } : row;
}

function productFromDb(row: any) {
  return row ? {
    id: Number(row.id),
    categoryId: Number(row.category_id),
    name: row.name,
    description: row.description ?? null,
    price: String(row.price),
    image: row.image ?? null,
    stock: Number(row.stock ?? 0),
    isActive: Boolean(row.is_active),
    dailyOfferEnabled: Boolean(row.daily_offer_enabled),
    discountPercent: String(row.discount_percent ?? "0"),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } : row;
}

function orderFromDb(row: any) {
  return row ? {
    id: Number(row.id),
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerAddress: row.customer_address,
    totalAmount: String(row.total_amount),
    status: row.status,
    paymentStatus: row.payment_status,
    paymentMethod: row.payment_method ?? null,
    vodafoneWalletNumber: row.vodafone_wallet_number ?? null,
    paymentProofUrl: row.payment_proof_url ?? null,
    shippingAmount: String(row.shipping_amount ?? "0"),
    notes: row.notes ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } : row;
}

export async function getStoreSettings() {
  const rows = await api({ action: "store.settings" });
  const row = Array.isArray(rows) ? rows[0] : rows;
  return { storeName: row?.store_name ?? "الوحيد ماركت", vodafoneCashNumber: row?.vodafone_cash_number ?? "01063537686" };
}

export async function updateStoreSettings(input: { vodafoneCashNumber: string }) {
  const row = await api({ action: "admin.store-settings.update", body: input, admin: true });
  return { storeName: row?.store_name ?? "الوحيد ماركت", vodafoneCashNumber: row?.vodafone_cash_number ?? input.vodafoneCashNumber };
}

export async function getCategories() {
  const rows = await api({ action: "categories" });
  return Array.isArray(rows) ? rows.map(categoryFromDb) : [];
}

export async function getCategoryById(id: number) {
  const rows = (await getCategories()).filter((row) => row.id === id);
  return rows[0];
}

export async function createCategory(input: { name: string; description?: string; image?: string }) {
  return categoryFromDb(await api({ action: "admin.categories.create", body: input, admin: true }));
}

export async function updateCategory(input: { id: number; name?: string; description?: string; image?: string }) {
  return categoryFromDb(await api({ action: "admin.categories.update", body: input, admin: true }));
}

export async function deleteCategory(id: number) {
  return api({ action: "admin.categories.delete", body: { id }, admin: true });
}

export async function getProducts(categoryId?: number, includeInactive = false) {
  const rows = await api({ action: includeInactive ? "admin.products.list" : "products", admin: includeInactive });
  const mapped = Array.isArray(rows) ? rows.map(productFromDb) : [];
  return categoryId ? mapped.filter((row) => row.categoryId === categoryId) : mapped;
}

export async function getProductById(id: number) {
  const rows = await getProducts();
  return rows.find((row) => row.id === id);
}

export async function uploadProductImage(input: { base64: string; contentType: string }) {
  return await api({ action: "admin.product-images.upload", body: input, admin: true });
}
export async function uploadPaymentProof(input: { base64: string; contentType: string }) {
  return await api({ action: "payment-proof.upload", body: input });
}


export async function createProduct(input: {
  categoryId: number; name: string; description?: string; price: string; image?: string; stock?: number; isActive?: boolean; dailyOfferEnabled?: boolean; discountPercent?: string;
}) {
  return productFromDb(await api({ action: "admin.products.create", body: input, admin: true }));
}

export async function updateProduct(input: {
  id: number; categoryId?: number; name?: string; description?: string; price?: string; image?: string; stock?: number; isActive?: boolean; dailyOfferEnabled?: boolean; discountPercent?: string;
}) {
  return productFromDb(await api({ action: "admin.products.update", body: input, admin: true }));
}

export async function deleteProduct(id: number) {
  try {
    return await api({ action: "admin.products.delete", body: { id }, admin: true });
  } catch (error: any) {
    if (error?.message === "[object Object]") {
      throw new Error("لا يمكن حذف المنتج لأنه مرتبط بطلبات سابقة. يمكنك إيقاف ظهوره من المتجر بدلًا من حذفه.");
    }
    throw error;
  }
}

export async function getOrders() {
  const rows = await api({ action: "admin.orders.list", admin: true });
  return Array.isArray(rows) ? rows.map(orderFromDb) : [];
}

export async function getOrderById(id: number) {
  return orderFromDb(await api({ action: "admin.orders.get", body: { id }, admin: true }));
}

export async function getPublicOrderStatus(id: number) {
  const row = await api({ action: "admin.orders.get", body: { id }, admin: true });
  return { id: Number(row.id), status: row.status };
}

export async function getOrderItems(orderId: number) {
  const rows = await api({ action: "admin.orders.items", body: { orderId }, admin: true });
  return Array.isArray(rows) ? rows.map((row) => ({
    id: Number(row.id),
    orderId: Number(row.order_id),
    productId: Number(row.product_id),
    quantity: Number(row.quantity),
    price: String(row.price),
    createdAt: row.created_at,
  })) : [];
}

async function saveOrderNotes(orderId: number, notes: string) {
  const response = await fetch(`${ENV.supabaseUrl}/functions/v1/nader-order-notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: ENV.adminLoginUsername,
      password: ENV.adminLoginPassword,
      orderId,
      notes,
    }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error || `تعذر حفظ ملاحظات الطلب (${response.status})`);
  }
}

export async function createOrder(input: {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  totalAmount: string;
  paymentMethod: "cash_on_delivery" | "vodafone_cash";
  vodafoneWalletNumber?: string;
  paymentProofUrl?: string;
  notes?: string;
  items: Array<{ productId: number; quantity: number; price: string }>;
}) {
  const order = await api({ action: "order", body: input });
  if (input.notes) {
    try {
      await saveOrderNotes(Number(order.id), input.notes);
    } catch (error) {
      console.error("Failed to persist assistant custom requests", error);
    }
  }
  return order;
}

export async function updateOrderStatus(id: number, status: string) {
  return api({ action: "admin.orders.updateStatus", body: { id, status }, admin: true });
}

export async function deleteOrder(id: number) {
  return api({ action: "admin.orders.delete", body: { id }, admin: true });
}
