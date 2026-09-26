'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Product {
  id: number;
  brandName: string;
  genericName: string;
  companyName: string;
  description: string;
  imageUrl?: string;
  pricePerBox: number;
  pricePerStrip: number;
  stockQuantity: number;
  batchNumber: string;
  expiryDate: string;
  hsnCode?: string;
  gstRate?: number;
  stockStatus?: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}

export interface CartItem {
  product: Product;
  quantity: number;
  unitType: 'BOX' | 'STRIP';
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, unitType?: 'BOX' | 'STRIP') => void;
  updateQuantity: (productId: number, unitTypeOrQuantity: 'BOX' | 'STRIP' | number, maybeQuantity?: number) => void;
  removeFromCart: (productId: number, unitType?: 'BOX' | 'STRIP') => void;
  clearCart: () => void;
  totalAmount: number;
  totalBoxesCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('smm_cart');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading cart from storage', e);
      }
    }
  }, []);

  const saveItems = (newItems: CartItem[]) => {
    setItems(newItems);
    localStorage.setItem('smm_cart', JSON.stringify(newItems));
  };

  const addToCart = (product: Product, quantity = 5, unitType: 'BOX' | 'STRIP' = 'BOX') => {
    const existingIndex = items.findIndex(i => i.product.id === product.id && i.unitType === unitType);
    let newItems = [...items];

    if (existingIndex > -1) {
      newItems[existingIndex].quantity += quantity;
    } else {
      newItems.push({ product, quantity, unitType });
    }

    saveItems(newItems);
  };

  const updateQuantity = (productId: number, unitTypeOrQuantity: 'BOX' | 'STRIP' | number, maybeQuantity?: number) => {
    let unitType: 'BOX' | 'STRIP' | undefined;
    let quantity: number;

    if (typeof unitTypeOrQuantity === 'string') {
      unitType = unitTypeOrQuantity;
      quantity = maybeQuantity !== undefined ? maybeQuantity : 1;
    } else {
      quantity = unitTypeOrQuantity;
    }

    if (quantity <= 0) {
      removeFromCart(productId, unitType);
      return;
    }

    const newItems = items.map(i => {
      if (i.product.id === productId && (!unitType || i.unitType === unitType)) {
        return { ...i, quantity };
      }
      return i;
    });
    saveItems(newItems);
  };

  const removeFromCart = (productId: number, unitType?: 'BOX' | 'STRIP') => {
    const newItems = items.filter(i => {
      if (i.product.id !== productId) return true;
      if (unitType && i.unitType !== unitType) return true;
      return false;
    });
    saveItems(newItems);
  };

  const clearCart = () => {
    saveItems([]);
  };

  const totalAmount = items.reduce((sum, item) => {
    const rate = item.unitType === 'BOX' ? item.product.pricePerBox : item.product.pricePerStrip;
    return sum + (rate * item.quantity);
  }, 0);

  const totalBoxesCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      totalAmount,
      totalBoxesCount
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
