import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/axios';

const useCartStore = create(
  // Optional: Add persistence to save cart between sessions
  // persist(
    (set, get) => ({
      cart: null,
      loading: false,
      error: null, // Add error state

      fetchCart: async () => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.get('/cart');
          set({ cart: data, loading: false });
          return data;
        } catch (error) {
          set({ 
            loading: false, 
            error: error.response?.data?.message || 'Failed to fetch cart' 
          });
          throw error;
        }
      },

      addItem: async (productId, quantity = 1) => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.post('/cart/items', { productId, quantity });
          set({ cart: data, loading: false });
          return data;
        } catch (error) {
          set({ 
            loading: false, 
            error: error.response?.data?.message || 'Failed to add item' 
          });
          throw error;
        }
      },

      updateItem: async (itemId, quantity) => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.put(`/cart/items/${itemId}`, { quantity });
          set({ cart: data, loading: false });
          return data;
        } catch (error) {
          set({ 
            loading: false, 
            error: error.response?.data?.message || 'Failed to update item' 
          });
          throw error;
        }
      },

      removeItem: async (itemId) => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.delete(`/cart/items/${itemId}`);
          set({ cart: data, loading: false });
          return data;
        } catch (error) {
          set({ 
            loading: false, 
            error: error.response?.data?.message || 'Failed to remove item' 
          });
          throw error;
        }
      },

      clearCart: async () => {
        set({ loading: true, error: null });
        try {
          await api.delete('/cart');
          set({ cart: { items: [], total: 0 }, loading: false });
        } catch (error) {
          set({ 
            loading: false, 
            error: error.response?.data?.message || 'Failed to clear cart' 
          });
          throw error;
        }
      },

      getItemCount: () => {
        const cart = get().cart;
        if (!cart?.items) return 0;
        return cart.items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getTotal: () => {
        const cart = get().cart;
        if (!cart?.items) return 0;
        return cart.items.reduce((sum, item) => {
          const discountedPrice = item.product.price * (1 - (item.product.discount || 0) / 100);
          return sum + (discountedPrice * item.quantity);
        }, 0);
      },

      // Helper method to check if cart is empty
      isEmpty: () => {
        const cart = get().cart;
        return !cart?.items || cart.items.length === 0;
      },

      // Get formatted total with currency
      getFormattedTotal: () => {
        const total = get().getTotal();
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(total);
      },

      // Reset error state
      clearError: () => set({ error: null }),
    }),
    // Optional: Persist cart to localStorage
    // {
    //   name: 'cart-storage',
    //   getStorage: () => localStorage,
    //   partialize: (state) => ({ cart: state.cart }), // Only persist cart data
    // }
  // )
);

export default useCartStore;