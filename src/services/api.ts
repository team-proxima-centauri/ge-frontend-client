const API_BASE_URL = 'http://192.168.254.104:5000/api'; // Ensure this matches your backend port

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