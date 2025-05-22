"use client";

import { useState, useEffect, useCallback } from 'react';
import { Header } from "@/components/Header";
import { getCurrentUser, User, CartItem as ApiCartItem, getMyCart } from "@/services/api";
import { useRouter } from "next/navigation";
import { formatPrice } from '@/utils/priceUtils';
import { ShoppingCart, MapPin, Phone, CreditCard, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  isSelected: boolean;
  productDetails?: {
    id: string;
    name: string;
    price: number;
    image_url?: string;
  };
  cart_id?: string;
  product_id?: string;
  added_by?: string;
  image_url?: string;
  unit?: string;
}

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export default function CheckoutPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(getCurrentUser());
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [address, setAddress] = useState<Address>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchUserCart = useCallback(async () => {
    if (currentUser) {
      try {
        const cart = await getMyCart();
        if (cart && cart.items) {
          const mappedItems = cart.items.map(item => ({
            ...item,
            isSelected: false,
            productDetails: {
              id: item.product_id,
              name: item.name,
              price: item.price,
              image_url: item.image_url
            }
          }));
          setCartItems(mappedItems);
        }
      } catch (cartError) {
        console.error('Error fetching user cart:', cartError);
      } finally {
        setIsLoading(false);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    fetchUserCart();
  }, [fetchUserCart]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement order submission
    console.log('Submitting order with:', { address, phoneNumber, cartItems });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-groceryease-bg flex items-center justify-center">
        <div className="text-xl text-primary">Loading checkout...</div>
      </div>
    );
  }

  if (!currentUser) {
    router.push('/');
    return null;
  }

  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = 5.99;
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-groceryease-bg">
      <Header 
        currentUser={currentUser}
        cartItems={cartItems as unknown as ApiCartItem[]}
        onLoginClick={() => {}}
        onLogoutClick={() => {}}
        onCheckout={() => {}}
        onUpdateQuantity={() => {}}
        onApplyFilters={() => {}}
        onResetFilters={() => {}}
        selectedCategory="all"
        selectedSort="name_asc"
        priceRange={{ min: 0, max: 100 }}
        showFilters={false}
        onShowFiltersChange={() => {}}
        onCategoryChange={() => {}}
        onSortChange={() => {}}
        onPriceRangeChange={() => {}}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <button 
          onClick={() => router.back()}
          className="flex items-center text-primary hover:text-primary-dark mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Shopping
        </button>

        <div className="grid grid-cols-1 desktop:grid-cols-2 gap-8">
          {/* Left Column - Order Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-semibold text-primary mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-accent-ivory rounded-md mr-4">
                        {item.image_url && <Image src={item.image_url} alt={item.name} width={48} height={48} />}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-medium text-primary">${formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t border-gray-100 pt-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>${formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>${formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold text-primary pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>${formatPrice(total)}</span>
              </div>
            </div>
          </div>

          {/* Right Column - Shipping Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-semibold text-primary mb-6">Shipping Information</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                    <input
                      type="text"
                      value={address.zipCode}
                      onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      type="text"
                      value={address.country}
                      onChange={(e) => setAddress({ ...address, country: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Place Order
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

