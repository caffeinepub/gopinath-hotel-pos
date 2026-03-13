import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface MenuItem {
    id: bigint;
    name: string;
    createdAt: bigint;
    available: boolean;
    imageUrl: string;
    category: string;
    price: bigint;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface Analytics {
    totalOrders: bigint;
    todaySales: bigint;
    topItem?: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Order {
    id: bigint;
    total: bigint;
    paymentStatus: string;
    createdAt: bigint;
    paymentMode: string;
    items: string;
}
export interface http_header {
    value: string;
    name: string;
}
export interface PaymentStatusResponse {
    status: string;
    message: string;
}
export interface backendInterface {
    addMenuItem(name: string, price: bigint, category: string, imageUrl: string): Promise<MenuItem>;
    checkPaymentStatus(transactionId: string, expectedAmount: bigint, upiId: string): Promise<PaymentStatusResponse>;
    confirmPayment(orderId: bigint): Promise<void>;
    createOrder(itemsJson: string, total: bigint, paymentMode: string): Promise<bigint>;
    deleteMenuItem(id: bigint): Promise<void>;
    generateTransactionId(): Promise<string>;
    getAnalytics(): Promise<Analytics>;
    getMenu(): Promise<Array<MenuItem>>;
    getOrder(id: bigint): Promise<Order>;
    getOrders(): Promise<Array<Order>>;
    getPaymentStatus(orderId: bigint): Promise<string>;
    login(pin: string): Promise<[string, string]>;
    setPaymentStatusUrl(url: string | null): Promise<void>;
    startPayment(orderId: bigint, amount: bigint, upiId: string): Promise<string>;
    toggleAvailability(id: bigint): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateMenuItem(id: bigint, name: string, price: bigint, category: string, imageUrl: string): Promise<MenuItem>;
}
