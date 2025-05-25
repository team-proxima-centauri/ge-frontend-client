const API_BASE_URL = 'http://192.168.1.9:5000/api'; // Ensure this matches your backend port

// Utility function to ensure price values are always properly processed as numbers
// This handles the conversion from database values (including string representations) to proper JS numbers
export const ensurePrice = (price: unknown): number => {
  // Handle null or undefined
  if (price === null || price === undefined) return 0;
  
  // If already a number, return it
  if (typeof price === 'number') return price;
  
  // Convert string to number
  const parsed = parseFloat(String(price).replace(/[^0-9.-]+/g, ''));
  
  // Return 0 if NaN, otherwise the parsed number
  return isNaN(parsed) ? 0 : parsed;
};

// --- safeLocalStorage Utility --- 
// Helper to safely access localStorage, avoiding errors during SSR or if localStorage is unavailable.
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  },
  removeItem: (key: string): void => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  },
};

// --- Product Interfaces & API --- 

// Interface for the raw product data as it might come from the API
interface RawProductFromAPI {
  id: string;
  name: string;
  description: string;
  price: string | number; // Price might be a string from the API
  unit: string;
  category: string;
  stock_quantity: string | number; // Stock quantity might be a string
  image_url: string;
  created_at: string;
  discount?: number; // Optional discount field
}

// Stricter Product interface for use within the frontend application
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // Ensured to be a number after parsing
  unit: string;
  category: string;
  stock_quantity: number; // Ensured to be a number after parsing
  image_url: string;
  created_at: string;
  discount?: number;
}

export const getProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Error response from server:', errorData);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const apiResponse: { success: boolean; data?: RawProductFromAPI[]; message?: string } = await response.json();
    
    if (apiResponse.success && Array.isArray(apiResponse.data)) {
      return apiResponse.data.map((rawProduct: RawProductFromAPI): Product => {
        const priceAsNumber = typeof rawProduct.price === 'string' ? parseFloat(rawProduct.price) : rawProduct.price;
        const stockQuantityAsNumber = typeof rawProduct.stock_quantity === 'string' ? parseInt(rawProduct.stock_quantity, 10) : rawProduct.stock_quantity;

        return {
          ...rawProduct,
          price: isNaN(priceAsNumber) ? 0 : priceAsNumber, // Default to 0 if parsing fails
          stock_quantity: isNaN(stockQuantityAsNumber) ? 0 : stockQuantityAsNumber, // Default to 0 if parsing fails
        };
      });
    }
    throw new Error(apiResponse.message || 'Failed to fetch products from API or data format is incorrect');
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error; 
  }
};

// --- Authentication Interfaces & API --- 

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string; // Assuming role might be optional or not always present
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: User;
  };
  error?: string; // For capturing specific error messages from backend
}

export const register = async (userData: Omit<User, 'id' | 'role'> & { password: string }): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    const data: AuthResponse = await response.json();
    if (data.success && data.data) {
      safeLocalStorage.setItem('token', data.data.token);
      safeLocalStorage.setItem('user', JSON.stringify(data.data.user));
    }
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: 'Registration request failed. Please try again.' };
  }
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    const data: AuthResponse = await response.json();
    if (data.success && data.data) {
      safeLocalStorage.setItem('token', data.data.token);
      safeLocalStorage.setItem('user', JSON.stringify(data.data.user));
    }
    return data;
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Login request failed. Please try again.' };
  }
};

export const logout = (): void => {
  safeLocalStorage.removeItem('token');
  safeLocalStorage.removeItem('user');
  // Potentially notify backend about logout if needed, e.g., to invalidate session/token server-side
};

export const getCurrentUser = (): User | null => {
  const userStr = safeLocalStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr) as User;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      safeLocalStorage.removeItem('user'); // Clear invalid user data
      return null;
    }
  }
  return null;
};

export const getToken = (): string | null => {
  return safeLocalStorage.getItem('token');
};

export const isAuthenticated = (): boolean => {
  const token = getToken();
  // Basic check, real validation might involve checking token expiry or with backend
  return !!token;
};

// --- Cart Interfaces & API ---

// We define a type for raw cart data that might come from the API
type RawCartData = {
  id: string;
  owner_id: string;
  is_group: boolean;
  group_code?: string;
  status: string;
  items: Array<{
    id: string;
    cart_id: string;
    product_id: string;
    quantity: number | string;
    added_by: string;
    name: string;
    price: number | string;
    image_url: string;
    unit: string;
  }>;
  total: number | string;
};

// Processed cart item interface for use in the frontend
export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  added_by: string;
  name: string;
  price: number; // Ensured to be a number after processing
  image_url: string;
  unit: string;
}

export interface Cart {
  id: string;
  owner_id: string;
  is_group: boolean;
  group_code?: string;
  status: string;
  items: CartItem[];
  total: number;
}

// Helper to build auth headers
const authHeaders = (): Record<string, string> => {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

export const getMyCart = async (): Promise<Cart | null> => {
  try {
    // Check if user is authenticated
    const token = getToken();
    if (!token) {
      console.error('No authentication token found');
      return null;
    }

    const response = await fetch(`${API_BASE_URL}/carts/my?nocreate=true`, {
      headers: {
        ...authHeaders(),
      },
      credentials: 'include',
    });

    // If we get a 404, it means the user doesn't have a cart yet, which is fine
    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      console.error(`Failed to fetch cart. Status ${response.status}`);
      return null;
    }

    const data = await response.json();
    if (data.success && data.data) {
      // Process the raw cart data to ensure price values are numbers
      const rawCart = data.data as { id: string; owner_id: string; is_group: boolean; group_code?: string; status: string; items: Array<RawCartData['items'][0]>; total: number | string };
      
      // Create a properly processed cart with all prices as numbers
      const processedCart: Cart = {
        ...rawCart,
        total: ensurePrice(rawCart.total || 0),
        items: Array.isArray(rawCart.items) ? rawCart.items.map(item => ({
          ...item,
          price: ensurePrice(item.price),
          quantity: typeof item.quantity === 'string' ? parseInt(item.quantity, 10) : item.quantity
        })) : []
      };
      
      return processedCart;
    }
    return null;
  } catch (error) {
    console.error('Error fetching cart:', error);
    return null;
  }
};

export const addItemToCart = async (
  productId: string,
  quantity = 1
): Promise<CartItem | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/carts/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      credentials: 'include',
      body: JSON.stringify({
        product_id: productId,
        quantity,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to add item to cart. Status ${response.status}`);
    }

    const data = await response.json();
    if (data.success) {
      // Process the raw item to ensure price is a number
      const rawItem = data.data as { id: string; cart_id: string; product_id: string; price: number | string; quantity: number | string; added_by: string; name: string; image_url: string; unit: string; [key: string]: unknown };
      
      const processedItem: CartItem = {
        ...rawItem,
        price: ensurePrice(rawItem.price),
        quantity: typeof rawItem.quantity === 'string' ? parseInt(rawItem.quantity, 10) : rawItem.quantity
      } as CartItem;
      
      return processedItem;
    }
    return null;
  } catch (error) {
    console.error('Error adding item to cart:', error);
    return null;
  }
};

export const updateCartItemQuantity = async (
  itemId: string,
  quantity: number
): Promise<CartItem | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/carts/items/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      credentials: 'include',
      body: JSON.stringify({
        quantity,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update cart item. Status ${response.status}`);
    }

    const data = await response.json();
    if (data.success) {
      // Process the raw item to ensure price is a number
      const rawItem = data.data as { id: string; cart_id: string; product_id: string; price: number | string; quantity: number | string; added_by: string; name: string; image_url: string; unit: string; [key: string]: unknown };
      
      const processedItem: CartItem = {
        ...rawItem,
        price: ensurePrice(rawItem.price),
        quantity: typeof rawItem.quantity === 'string' ? parseInt(rawItem.quantity, 10) : rawItem.quantity
      } as CartItem;
      
      return processedItem;
    }
    return null;
  } catch (error) {
    console.error('Error updating cart item:', error);
    return null;
  }
};

export const removeCartItem = async (itemId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/carts/items/${itemId}`, {
      method: 'DELETE',
      headers: authHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to remove item. Status ${response.status}`);
    }
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error removing cart item:', error);
    return false;
  }
};

// --- Group Cart API ---

export interface GroupCartMember {
  user_id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  joined_at: string;
  added_by: string;
}

export interface GroupCart extends Cart {
  group_code: string;
  members: GroupCartMember[];
}

// Create a new group cart
export const createGroupCart = async (): Promise<GroupCart | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/carts/group`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to create group cart. Status ${response.status}`);
    }
    const data = await response.json();
    if (data.success) {
      return data.data as GroupCart;
    }
    return null;
  } catch (error) {
    console.error('Error creating group cart:', error);
    return null;
  }
};

// Join an existing group cart with a code
export const joinGroupCart = async (groupCode: string): Promise<GroupCart | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/carts/group/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      body: JSON.stringify({ group_code: groupCode }),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to join group cart. Status ${response.status}`);
    }
    const data = await response.json();
    if (data.success) {
      return data.data as GroupCart;
    }
    return null;
  } catch (error) {
    console.error('Error joining group cart:', error);
    return null;
  }
};

// Get group cart details by id
export const getGroupCart = async (cartId: string): Promise<GroupCart | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/carts/group/${cartId}`, {
      headers: authHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch group cart. Status ${response.status}`);
    }
    const data = await response.json();
    if (data.success) {
      return data.data as GroupCart;
    }
    return null;
  } catch (error) {
    console.error('Error fetching group cart:', error);
    return null;
  }
};

// Get group cart by code
export const getGroupCartByCode = async (groupCode: string): Promise<GroupCart | null> => {
  try {
    if (!groupCode || groupCode.trim() === '') {
      console.error('Invalid group code provided');
      return null;
    }

    // Make sure we have authentication
    const token = getToken();
    if (!token) {
      console.error('No authentication token found');
      return null;
    }

    // Ensure proper headers and credentials
    const response = await fetch(`${API_BASE_URL}/carts/group/code/${groupCode.trim()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders()
      },
      credentials: 'include',
    });

    // Handle non-200 responses
    if (!response.ok) {
      console.error(`Failed to fetch group cart by code. Status ${response.status}`);
      return null; // Return null instead of throwing to prevent unhandled promise rejection
    }
    
    const data = await response.json();
    if (data.success && data.data) {
      // Process the raw cart data to ensure prices are numbers
      const rawCart = data.data as RawCartData;
      
      // Process the items to ensure price values are numbers
      const processedCart = {
        ...rawCart,
        total: ensurePrice(rawCart.total || 0),
        items: Array.isArray(rawCart.items) ? rawCart.items.map(item => ({
          ...item,
          price: ensurePrice(item.price),
          quantity: typeof item.quantity === 'string' ? parseInt(item.quantity, 10) : item.quantity
        })) : []
      };
      
      return processedCart as unknown as GroupCart;
    }
    return null;
  } catch (error) {
    console.error('Error fetching group cart by code:', error);
    return null;
  }
};

// Leave a group cart (members) or close it (owner)
export const leaveGroupCart = async (): Promise<boolean> => {
  try {
    const token = getToken();
    if (!token) {
      console.error('No token found');
      return false;
    }

    const response = await fetch(`${API_BASE_URL}/carts/group/leave`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to leave group cart. Status ${response.status}`);
    }
    
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error leaving group cart:', error);
    return false;
  }
};