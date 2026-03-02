import { create } from 'zustand';

export interface CartItem {
  id: number;
  product_id: number;
  product_name: string;
  price: string;
  quantity: number;
  store_id: number;
  store_name: string;
  aisle_id: number;
  aisle_name: string;
  aisle_number: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: number, storeId: number) => void;
  updateQuantity: (productId: number, storeId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (item) => {
    set((state) => {
      const existing = state.items.find(
        (i) => i.product_id === item.product_id && i.store_id === item.store_id
      );
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.product_id === item.product_id && i.store_id === item.store_id
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          ),
        };
      }
      return { items: [...state.items, item] };
    });
  },

  removeItem: (productId, storeId) => {
    set((state) => ({
      items: state.items.filter(
        (i) => !(i.product_id === productId && i.store_id === storeId)
      ),
    }));
  },

  updateQuantity: (productId, storeId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId, storeId);
      return;
    }
    set((state) => ({
      items: state.items.map((i) =>
        i.product_id === productId && i.store_id === storeId
          ? { ...i, quantity }
          : i
      ),
    }));
  },

  clearCart: () => set({ items: [] }),

  getTotalPrice: () => {
    const items = get().items;
    return items.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
  },

  getTotalItems: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));
