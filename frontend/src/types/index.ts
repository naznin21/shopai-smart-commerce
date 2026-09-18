export type Role = 'CUSTOMER' | 'STAFF' | 'MANAGER' | 'ADMIN';

export type OrderStatus =
  | 'PLACED'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'PICKED_UP'
  | 'COMPLETED'
  | 'CANCELLED';

export type OrderType = 'STORE_PICKUP' | 'HOME_DELIVERY';

export type PaymentMethod = 'DEMO_ONLINE_PAYMENT' | 'CASH_ON_DELIVERY';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export type ReturnStatus = 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'COMPLETED';

export type RequestType = 'RETURN' | 'EXCHANGE';

export type ReturnReason =
  | 'DAMAGED_PRODUCT'
  | 'EXPIRED_PRODUCT'
  | 'WRONG_ITEM_DELIVERED'
  | 'QUALITY_ISSUE'
  | 'MISSING_ITEM'
  | 'OTHER';

export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  address?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  address?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  active: boolean;
  productCount?: number;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;
  effectivePrice: number;
  discountPercentage?: number;
  category: Category;
  imageUrl?: string;
  stockQuantity: number;
  lowStockThreshold: number;
  unit: string;
  active: boolean;
  stockStatus: StockStatus;
  createdAt?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productUnit: string;
  productImageUrl?: string;
  unitPrice: number;
  originalPrice: number;
  quantity: number;
  availableStock: number;
  itemTotal: number;
  isAvailable: boolean;
}

export interface Cart {
  id: string;
  items: CartItem[];
  totalQuantity: number;
  originalSubtotal: number;
  subtotal: number;
  totalSavings: number;
  standardDeliveryFee: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  freeDeliveryUnlocked: boolean;
  amountNeededForFreeDelivery: number;
  finalTotal: number;
}

export interface OrderItem {
  id: string;
  productId?: string;
  productName: string;
  productUnit: string;
  productImageUrl?: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  returned: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  totalAmount: number;
  orderType: OrderType;
  scheduledDate?: string;
  scheduledTimeSlot?: string;
  deliveryAddress?: string;
  contactPhone?: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  cancelReason?: string;
  deliveredAt?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
  canCancel: boolean;
  returnEligible: boolean;
  returnEligibilityDaysLeft?: number;
}

export interface PickupSlot {
  id?: string;
  slotDate: string;
  timeSlot: string;
  maxCapacity: number;
  bookedCount: number;
  availableSlots?: number;
  availableCapacity?: number;
  isAvailable?: boolean;
  available?: boolean;
  statusText: string;
}

export interface ReturnExchangeRequest {
  id: string;
  requestNumber: string;
  orderId: string;
  orderNumber: string;
  orderItemId: string;
  productId: string;
  productName: string;
  productImageUrl?: string;
  userId: string;
  userName: string;
  userEmail: string;
  requestType: RequestType;
  reason: ReturnReason;
  reasonDetails?: string;
  replacementProductId?: string;
  replacementProductName?: string;
  status: ReturnStatus;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerDashboard {
  greeting: string;
  customerName: string;
  activeOrder?: Order | null;
  recentOrders: Order[];
  totalOrdersCount: number;
  totalSpent: number;
  totalSavings: number;
  buyAgainProducts: Product[];
  favoriteCategoryName?: string;
}

export interface StaffDashboard {
  newOrdersCount: number;
  preparingCount: number;
  readyForPickupCount: number;
  outForDeliveryCount: number;
  pendingReturnsCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  urgentOrders: Order[];
  lowStockProducts: Product[];
}

export interface AuditLog {
  id: string;
  userEmail: string;
  action: string;
  entityType: string;
  entityId?: string;
  description: string;
  ipAddress?: string;
  createdAt: string;
}

export interface ManagerAdminDashboard {
  totalUsersCount: number;
  totalProductsCount: number;
  totalOrdersCount: number;
  todayOrdersCount: number;
  totalRevenue: number;
  todayRevenue: number;
  pendingOrdersCount: number;
  lowStockCount: number;
  pendingReturnsCount: number;
  recentOrders: Order[];
  recentAuditLogs: AuditLog[];
  pendingReturns: ReturnExchangeRequest[];
}

// AI Feature Interfaces
export interface AiChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  suggestedProducts?: Product[];
  latestOrder?: Order;
  quickActions?: string[];
  intent?: string;
  recipeTotalPrice?: number;
  timestamp: string;
}

export interface AiChatRequest {
  message: string;
  userEmail?: string;
  cartProductIds?: string[];
}

export interface AiChatResponse {
  reply: string;
  suggestedProducts?: Product[];
  mode: string;
  latestOrder?: Order;
  quickActions?: string[];
  intent?: string;
  recipeTotalPrice?: number;
}

export interface AiSearchRequest {
  query: string;
}

export interface AiSearchResponse {
  interpretedQuery: string;
  keywords?: string[];
  maxPrice?: number;
  categoryName?: string;
  products: Product[];
}

export interface AiRecommendationResponse {
  title: string;
  subtitle: string;
  products: Product[];
}

export interface AiDescriptionRequest {
  name: string;
  category?: string;
  categoryName?: string;
  price?: number;
  unit?: string;
  existingDescription?: string;
}

export interface AiDescriptionResponse {
  description: string;
  generatedDescription?: string;
  bulletPoints?: string[];
  suggestedTagline?: string;
}
