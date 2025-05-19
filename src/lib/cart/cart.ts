import { getToken } from '../auth/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Local storage keys
const CART_STORAGE_KEY = 'groceryease_cart';
const CART_ITEMS_STORAGE_KEY = 'groceryease_cart_items';

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  added_by: string;
  created_at: string;
  name?: string;
  price?: number;
  image_url?: string;
  unit?: string;
}

export interface CartMember {
  cart_id: string;
  user_id: string;
  added_by: string;
  role: string;
  joined_at: string;
  name?: string;
  email?: string;
}

export interface Cart {
  id: string;
  owner_id: string;
  is_group: boolean;
  group_code?: string;
  status: string;
  created_at: string;
  items?: CartItem[];
  total?: number;
  members?: CartMember[];
}

// Helper functions for local storage
const saveCartToLocalStorage = (cart: Cart): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }
};

const getCartFromLocalStorage = (): Cart | null => {
  if (typeof window !== 'undefined') {
    const cartData = localStorage.getItem(CART_STORAGE_KEY);
    return cartData ? JSON.parse(cartData) : null;
  }
  return null;
};

const saveCartItemsToLocalStorage = (items: CartItem[]): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CART_ITEMS_STORAGE_KEY, JSON.stringify(items));
  }
};

const getCartItemsFromLocalStorage = (): CartItem[] => {
  if (typeof window !== 'undefined') {
    const itemsData = localStorage.getItem(CART_ITEMS_STORAGE_KEY);
    return itemsData ? JSON.parse(itemsData) : [];
  }
  return [];
};

/**
 * Get the current user's active cart
 */
export const getCart = async (): Promise<Cart> => {
  const token = getToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  try {
    const response = await fetch(`${API_URL}/carts/my`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch cart');
    }
    
    const data = await response.json();
    const cart = data.data;
    
    // Save cart to local storage
    saveCartToLocalStorage(cart);
    if (cart.items) {
      saveCartItemsToLocalStorage(cart.items);
    }
    
    return cart;
  } catch (error) {
    // Try to get cart from local storage if API call fails
    const localCart = getCartFromLocalStorage();
    if (localCart) {
      // Get cart items from local storage
      const localCartItems = getCartItemsFromLocalStorage();
      localCart.items = localCartItems;
      return localCart;
    }
    throw error;
  }
};

/**
 * Add an item to the cart
 */
export const addToCart = async (productId: string, quantity: number = 1): Promise<CartItem> => {
  const token = getToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const response = await fetch(`${API_URL}/carts/items`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ product_id: productId, quantity }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to add item to cart');
  }
  
  const data = await response.json();
  const newItem = data.data;
  
  // Update local storage
  const localCart = getCartFromLocalStorage();
  if (localCart) {
    if (!localCart.items) {
      localCart.items = [];
    }
    
    // Check if item already exists
    const existingItemIndex = localCart.items.findIndex(item => item.product_id === productId);
    
    if (existingItemIndex >= 0) {
      // Update existing item
      localCart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      localCart.items.push(newItem);
    }
    
    // Recalculate total
    localCart.total = localCart.items.reduce((sum, item) => {
      return sum + (parseFloat(item.price?.toString() || '0') * item.quantity);
    }, 0);
    
    saveCartToLocalStorage(localCart);
    saveCartItemsToLocalStorage(localCart.items);
  }
  
  return newItem;
};

/**
 * Update cart item quantity
 */
export const updateCartItem = async (itemId: string, quantity: number): Promise<CartItem> => {
  const token = getToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const response = await fetch(`${API_URL}/carts/items/${itemId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ quantity }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update cart item');
  }
  
  const data = await response.json();
  const updatedItem = data.data;
  
  // Update local storage
  const localCart = getCartFromLocalStorage();
  if (localCart && localCart.items) {
    const updatedItems = localCart.items.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    );
    
    // Recalculate total
    const newTotal = updatedItems.reduce((sum, item) => {
      return sum + (parseFloat(item.price?.toString() || '0') * item.quantity);
    }, 0);
    
    localCart.items = updatedItems;
    localCart.total = newTotal;
    
    saveCartToLocalStorage(localCart);
    saveCartItemsToLocalStorage(updatedItems);
  }
  
  return updatedItem;
};

/**
 * Remove an item from the cart
 */
export const removeFromCart = async (itemId: string): Promise<void> => {
  const token = getToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const response = await fetch(`${API_URL}/carts/items/${itemId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to remove item from cart');
  }
  
  // Update local storage
  const localCart = getCartFromLocalStorage();
  if (localCart && localCart.items) {
    const updatedItems = localCart.items.filter(item => item.id !== itemId);
    
    // Recalculate total
    const newTotal = updatedItems.reduce((sum, item) => {
      return sum + (parseFloat(item.price?.toString() || '0') * item.quantity);
    }, 0);
    
    localCart.items = updatedItems;
    localCart.total = newTotal;
    
    saveCartToLocalStorage(localCart);
    saveCartItemsToLocalStorage(updatedItems);
  }
};

/**
 * Create a group cart
 */
export const createGroupCart = async (): Promise<Cart> => {
  const token = getToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const response = await fetch(`${API_URL}/carts/group`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create group cart');
  }
  
  const data = await response.json();
  return data.data;
};

/**
 * Join a group cart
 */
export const joinGroupCart = async (groupCode: string): Promise<Cart> => {
  const token = getToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const response = await fetch(`${API_URL}/carts/join/${groupCode}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to join group cart');
  }
  
  const data = await response.json();
  return data.data;
};

/**
 * Get a specific group cart by code
 */
export const getGroupCart = async (groupCode: string): Promise<Cart> => {
  const token = getToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  try {
    // First, find the cart ID by group code
    const findCartResponse = await fetch(`${API_URL}/carts/find/${groupCode}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!findCartResponse.ok) {
      const errorData = await findCartResponse.json();
      throw new Error(errorData.message || 'Failed to find group cart');
    }
    
    const findCartData = await findCartResponse.json();
    const cartId = findCartData.data.id;
    
    // Then get the full cart details using the cart ID
    const cartResponse = await fetch(`${API_URL}/carts/group/${cartId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!cartResponse.ok) {
      const errorData = await cartResponse.json();
      throw new Error(errorData.message || 'Failed to fetch group cart details');
    }
    
    const cartData = await cartResponse.json();
    return cartData.data;
  } catch (err) {
    console.error('Error fetching group cart:', err);
    throw new Error(err instanceof Error ? err.message : 'Failed to fetch group cart');
  }
};

/**
 * Leave a group cart
 */
export const leaveGroupCart = async (groupCode: string): Promise<void> => {
  const token = getToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const response = await fetch(`${API_URL}/carts/group/${groupCode}/leave`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to leave group cart');
  }
};

/**
 * Update cart item quantity
 */
export const updateCartItemQuantity = async (itemId: string, quantity: number): Promise<CartItem> => {
  return updateCartItem(itemId, quantity);
};
