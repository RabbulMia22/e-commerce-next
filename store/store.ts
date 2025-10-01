import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

// Add the missing Product interface
export interface Product {
    _id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    brand: string;
    images: string[];
    stock: number;
    rating: number;
    createdAt: string;
    updatedAt: string;
}

export interface BasketItem {
    product: Product;
    quantity: number;
    selectedSize: string;
}

export interface Order {
    id: string;
    orderNumber: string;
    items: BasketItem[];
    total: number;
    status: 'processing' | 'shipped' | 'delivered';
    orderDate: string;
    sessionId: string;
}

interface BasketState {
    basket: BasketItem[];
    orders: Order[];
    addToBasket: (product: Product, selectedSize: string) => void;
    removeFromBasket: (productId: string, selectedSize: string) => void;
    removeItemCompletely: (productId: string, selectedSize: string) => void;
    clearBasket: () => void;
    getTotalPrice: () => number;
    getItemCount: (productId: string, selectedSize: string) => number;
    getItems: () => BasketItem[];
    addOrder: (order: Order) => void;
    getOrders: () => Order[];
    cleanupDuplicateOrders: () => void;
    clearAllOrders: () => void;
}

const useBasketStore = create<BasketState>()(
    devtools(
        persist(
            (set, get) => ({
                basket: [],
                orders: [],
                addToBasket: (product: Product, selectedSize: string) => {
                    const existingIndex = get().basket.findIndex(item => 
                        item.product._id === product._id && item.selectedSize === selectedSize
                    );
                    if (existingIndex >= 0) {
                        const updatedBasket = [...get().basket];
                        updatedBasket[existingIndex].quantity += 1;
                        set({ basket: updatedBasket });
                    } else {
                        set({ basket: [...get().basket, { product, quantity: 1, selectedSize }] });
                    }
                },
                removeFromBasket: (productId: string, selectedSize: string) => {
                    const existingIndex = get().basket.findIndex(item => 
                        item.product._id === productId && item.selectedSize === selectedSize
                    );
                    if (existingIndex >= 0) {
                        const updatedBasket = [...get().basket];
                        if (updatedBasket[existingIndex].quantity > 1) {
                            updatedBasket[existingIndex].quantity -= 1;
                        } else {
                            updatedBasket.splice(existingIndex, 1);
                        }
                        set({ basket: updatedBasket });
                    }
                },
                removeItemCompletely: (productId: string, selectedSize: string) => {
                    const updatedBasket = get().basket.filter(item => 
                        !(item.product._id === productId && item.selectedSize === selectedSize)
                    );
                    set({ basket: updatedBasket });
                },
                clearBasket: () => set({ basket: [] }),
                getTotalPrice: () =>
                    get().basket.reduce((total, item) => total + (item.product.price || 0) * item.quantity, 0),
                getItemCount: (productId: string, selectedSize: string) => {
                    const item = get().basket.find(item => 
                        item.product._id === productId && item.selectedSize === selectedSize
                    );
                    return item ? item.quantity : 0;
                },
                getItems: () => get().basket,
                addOrder: (order: Order) => {
                    const existingOrders = get().orders;
                    
                    // Check for duplicates by both ID and sessionId
                    const duplicateBySessionId = existingOrders.some(
                        existingOrder => existingOrder.sessionId === order.sessionId
                    );
                    const duplicateById = existingOrders.some(
                        existingOrder => existingOrder.id === order.id
                    );
                    
                    if (!duplicateBySessionId && !duplicateById) {
                        set({ orders: [order, ...existingOrders] });
                        console.log('Order added successfully:', order.id);
                    } else {
                        console.log('Duplicate order prevented:', {
                            orderId: order.id,
                            sessionId: order.sessionId,
                            duplicateBySessionId,
                            duplicateById
                        });
                    }
                },
                getOrders: () => get().orders,
                cleanupDuplicateOrders: () => {
                    const orders = get().orders;
                    const uniqueOrders = orders.filter((order, index, self) => {
                        // Keep the first occurrence of each unique sessionId
                        return index === self.findIndex(o => o.sessionId === order.sessionId);
                    });
                    
                    if (uniqueOrders.length !== orders.length) {
                        console.log(`Cleaned up ${orders.length - uniqueOrders.length} duplicate orders`);
                        set({ orders: uniqueOrders });
                    }
                },
                clearAllOrders: () => {
                    console.log('Clearing all orders from storage');
                    set({ orders: [] });
                },
            }),
            { 
                name: "basket-orders-storage",
                // Add this to prevent hydration issues
                skipHydration: false,
            }
        ),
        {
            name: "basket-store" 
        }
    )
);

export default useBasketStore;