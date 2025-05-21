/**
 * Utility functions for handling price values consistently across the application
 * These functions ensure proper conversion between different price formats
 */

/**
 * Ensures a price value is always returned as a number
 * Handles various input formats including strings and null values
 * 
 * @param price - The price value to convert (can be string, number, or undefined/null)
 * @returns A properly formatted number
 */
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

/**
 * Formats a price value for display with proper decimal places
 * 
 * @param price - The price value to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted price string with specified decimal places
 */
export const formatPrice = (price: unknown, decimals = 2): string => {
  const numPrice = ensurePrice(price);
  return numPrice.toFixed(decimals);
};

/**
 * Calculates the total price of cart items
 * 
 * @param items - Array of cart items with price and quantity properties
 * @returns The total price as a number
 */
export const calculateTotal = (items: Array<{ price: unknown; quantity: unknown }>): number => {
  return items.reduce((sum, item) => {
    const price = ensurePrice(item.price);
    const quantity = typeof item.quantity === 'number' 
      ? item.quantity 
      : parseInt(String(item.quantity), 10) || 1;
    
    return sum + (price * quantity);
  }, 0);
};
