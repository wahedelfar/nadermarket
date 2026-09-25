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
    throw new Error(data?.error || `Supabase API error (${response.status})`);
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
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    paymentMethod: row.payment_method ?? null,
    vodafoneWalletNumber: row.vodafone_wallet_number ?? null,
    paymentProofUrl: row.payment_proof_url ?? null,
    notes: row.notes ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } : row;
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

export async function createProduct(input: {
  categoryId: number; name: string; description?: string; price: string; image?: string; stock?: number; isActive?: boolean;
}) {
  return productFromDb(await api({ action: "admin.products.create", body: input, admin: true }));
}

export async function updateProduct(input: {
  id: number; categoryId?: number; name?: string; description?: string; price?: string; image?: string; stock?: number; isActive?: boolean;
}) {
  return productFromDb(await api({ action: "admin.products.update", body: input, admin: true }));
}

export async function deleteProduct(id: number) {
  return api({ action: "admin.products.delete", body: { id }, admin: true });
}

export async function getOrders() {
  const rows = await api({ action: "admin.orders.list", admin: true });
  return Array.isArray(rows) ? rows.map(orderFromDb) : [];
}

export async function getOrderById(id: number) {
  return orderFromDb(await api({ action: "admin.orders.get", body: { id }, admin: true }));
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

export async function createOrder(input: {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  totalAmount: string;
  paymentMethod: "cash_on_delivery" | "vodafone_cash";
  vodafoneWalletNumber?: string;
  paymentProofUrl?: string;
  items: Array<{ productId: number; quantity: number; price: string }>;
}) {
  return await api({ action: "order", body: input });
}

export async function updateOrderStatus(id: number, status: string) {
  return api({ action: "admin.orders.updateStatus", body: { id, status }, admin: true });
}

export async function deleteOrder(id: number) {
  return api({ action: "admin.orders.delete", body: { id }, admin: true });
}
