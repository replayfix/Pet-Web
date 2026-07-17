import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('petweb_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('petweb_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Añadir producto al carrito respetando el stock disponible de Firebase
  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => item.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = Math.min(
          updated[existingIndex].quantity + quantity,
          product.stock
        );
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          stock: product.stock // Sincronizar stock actual
        };
        return updated;
      } else {
        return [...prev, {
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          category: product.category,
          stock: product.stock,
          quantity: Math.min(quantity, product.stock)
        }];
      }
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev => prev.map(item => {
      if (item.id === productId) {
        return {
          ...item,
          quantity: Math.min(newQuantity, item.stock)
        };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      isCartOpen,
      setIsCartOpen,
      totalItems,
      totalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
};
