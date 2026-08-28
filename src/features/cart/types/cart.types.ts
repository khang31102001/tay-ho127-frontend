export interface CartProduct {
  id: string;
  name: string;
  price: number;
  image: string;
}

export interface CartItem extends CartProduct {
  quantity: number;
}

export interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  totalPrice: number;
  addToCart: (product: CartProduct) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}
