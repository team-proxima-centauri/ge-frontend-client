const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: string;
  image_url: string;
  stock_quantity: number;
  created_at: string;
}

/**
 * Get all products
 */
export const getProducts = async (): Promise<Product[]> => {
  const response = await fetch(`${API_URL}/products`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch products');
  }
  
  const data = await response.json();
  return data.data;
};

/**
 * Get product by ID
 */
export const getProductById = async (id: string): Promise<Product> => {
  const response = await fetch(`${API_URL}/products/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch product');
  }
  
  const data = await response.json();
  return data.data;
};

/**
 * Get products by category
 */
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  const response = await fetch(`${API_URL}/products/category/${category}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch products by category');
  }
  
  const data = await response.json();
  return data.data;
};

/**
 * Search products by name or description
 */
export const searchProducts = async (query: string): Promise<Product[]> => {
  const response = await fetch(`${API_URL}/products/search?q=${encodeURIComponent(query)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to search products');
  }
  
  const data = await response.json();
  return data.data;
};
