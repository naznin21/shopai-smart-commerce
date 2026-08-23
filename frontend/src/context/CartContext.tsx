import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Cart } from '../types';
import { cartService } from '../services/cartService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface CartContextType {
  cart: Cart | null;
  itemCount: number;
  isCartOpen: boolean;
  isLoading: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  refreshCart: () => Promise<void>;
  clearCartLocal: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { isAuthenticated, isCustomer } = useAuth();
  const { showToast } = useToast();

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated || !isCustomer) {
      setCart(null);
      return;
    }
    try {
      setIsLoading(true);
      const data = await cartService.getCart();
      setCart(data);
    } catch {
      // Ignore initial cart errors
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, isCustomer]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addToCart = async (productId: number, quantity: number = 1) => {
    if (!isAuthenticated) {
      showToast('Please sign in to add items to your cart', 'warning');
      return;
    }
    try {
      setIsLoading(true);
      const updatedCart = await cartService.addToCart(productId, quantity);
      setCart(updatedCart);
      showToast('Added to cart successfully!', 'success');
      setIsCartOpen(true);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Could not add item to cart';
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    try {
      setIsLoading(true);
      const updatedCart = await cartService.updateItemQuantity(itemId, quantity);
      setCart(updatedCart);
      if (quantity === 0) {
        showToast('Item removed from cart', 'info');
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Could not update quantity';
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (itemId: number) => {
    await updateQuantity(itemId, 0);
  };

  const clearCartLocal = () => {
    setCart(null);
  };

  const itemCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        isCartOpen,
        isLoading,
        openCart,
        closeCart,
        addToCart,
        updateQuantity,
        removeItem,
        refreshCart,
        clearCartLocal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
