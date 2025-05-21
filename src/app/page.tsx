"use client";

import { useState, useEffect, useCallback } from "react";
import { RecommendationCard } from "@/components/reco";
import { DisplayCard } from "@/components/DisplayCard";
import { LoginModal } from '@/components/LoginModal';
import { Header } from '@/components/Header';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  getProducts,
  getMyCart,
  addItemToCart,
  Product, 
  User, 
  CartItem as ApiCartItem,
  getCurrentUser, 
  isAuthenticated, 
  logout as apiLogout 
} from '@/services/api';
import useEmblaCarousel from 'embla-carousel-react';

// We'll use the API CartItem type directly and extend it with our local properties
interface LocalCartItem extends ApiCartItem {
  isSelected: boolean;
  productDetails?: Product;
}

interface Category {
  id: string;
  name: string;
}

const productCategories: Category[] = [
  { id: 'all', name: 'All Categories' },
  { id: 'fruits', name: 'Fruits & Vegetables' },
  { id: 'meat', name: 'Meat & Seafood' },
  { id: 'dairy', name: 'Dairy & Eggs' },
  { id: 'bakery', name: 'Bakery' },
  { id: 'pantry', name: 'Pantry Staples' },
  { id: 'frozen', name: 'Frozen Foods' },
  { id: 'beverages', name: 'Beverages' },
  { id: 'snacks', name: 'Snacks & Sweets' },
  { id: 'household', name: 'Household' },
];

export default function Home() {
  const [cartItems, setCartItems] = useState<LocalCartItem[]>([]);
  const router = useRouter();
  
  // Filter state
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState('name_asc');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100 });
  const [showFilters, setShowFilters] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errorProducts, setErrorProducts] = useState('');

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    slidesToScroll: 1,
    breakpoints: {
      '(min-width: 640px)': { slidesToScroll: 2 },
      '(min-width: 768px)': { slidesToScroll: 3 },
      '(min-width: 1024px)': { slidesToScroll: 4 },
    }
  });

  const [productsEmblaRef, productsEmblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    slidesToScroll: 1,
    breakpoints: {
      '(min-width: 640px)': { slidesToScroll: 2 },
      '(min-width: 768px)': { slidesToScroll: 3 },
      '(min-width: 1024px)': { slidesToScroll: 4 },
    }
  });

  const [recentlyPurchasedEmblaRef, recentlyPurchasedEmblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    slidesToScroll: 1,
    breakpoints: {
      '(min-width: 640px)': { slidesToScroll: 2 },
      '(min-width: 768px)': { slidesToScroll: 3 },
      '(min-width: 1024px)': { slidesToScroll: 4 },
    }
  });


  // carousel
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  
  const scrollProductsPrev = useCallback(() => productsEmblaApi?.scrollPrev(), [productsEmblaApi]);
  const scrollProductsNext = useCallback(() => productsEmblaApi?.scrollNext(), [productsEmblaApi]);

  const scrollRecentlyPurchasedPrev = useCallback(() => recentlyPurchasedEmblaApi?.scrollPrev(), [recentlyPurchasedEmblaApi]);
  const scrollRecentlyPurchasedNext = useCallback(() => recentlyPurchasedEmblaApi?.scrollNext(), [recentlyPurchasedEmblaApi]);

  // Function to fetch cart data from API
  const fetchCartData = useCallback(async () => {
    if (isAuthenticated()) {
      try {
        const cart = await getMyCart();
        if (cart && cart.items) {
          // Convert API cart items to local CartItem format
          const cartItemsFromApi = cart.items.map(item => ({
            ...item, // Spread all API CartItem properties
            isSelected: false,
            productDetails: {
              id: item.product_id,
              name: item.name,
              price: item.price,
              image_url: item.image_url,
              unit: item.unit
            } as Product
          }));
          setCartItems(cartItemsFromApi);
        }
      } catch (error) {
        console.error('Error fetching cart data:', error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        setErrorProducts('');
        const fetchedProducts = await getProducts();
        setProducts(fetchedProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
        if (err instanceof Error) {
          setErrorProducts(err.message || 'Failed to connect to the server.');
        } else {
          setErrorProducts('An unknown error occurred while fetching products.');
        }
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
    // Also fetch cart data
    fetchCartData();
  }, [fetchCartData]);

  useEffect(() => {
    setIsAuthLoading(true);
    if (isAuthenticated()) {
      const user = getCurrentUser();
      setCurrentUser(user);
    }
    setIsAuthLoading(false);
  }, []);
  
  // Re-fetch cart data when authentication state changes
  useEffect(() => {
    if (currentUser) {
      fetchCartData();
    }
  }, [currentUser, fetchCartData]);

  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  const handleLogoutClick = () => {
    apiLogout();
    setCurrentUser(null);
  };

  const handleLoginSuccess = (loggedInUser: User) => {
    setCurrentUser(loggedInUser);
    setShowLoginModal(false);
  };

  // This function is not currently used by the Header component, but kept for future functionality
  // It's intentionally not removed to maintain code consistency with other components

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity >= 1) {
      // Update local state immediately for better UX
      setCartItems(items =>
        items.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
      
      // After updating the quantity on the backend, refresh cart data
      // This ensures our local state is in sync with the backend
      await fetchCartData();
    }
  };

  const handleAddToCart = async (product: Product, quantity: number) => {
    try {
      // Use the product and quantity parameters to add the item to the cart using the API
      await addItemToCart(product.id, quantity);
      
      // After adding to the cart, refresh cart data from the API
      // This ensures our local state is in sync with the backend
      await fetchCartData();
      
      console.log(`Added product ${product.name} (${quantity} units) to cart`);
    } catch (error) {
      console.error(`Error adding ${product.name} to cart:`, error);
    }
  };

  const handleCheckout = () => {
    if (!currentUser) {
      setShowLoginModal(true);
    } else {
      console.log('Proceeding to checkout with user:', currentUser);
      alert('Proceeding to checkout!');
    }
  };

  if (isAuthLoading) { 
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl">Loading application...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <Header 
        currentUser={currentUser}
        cartItems={cartItems}
        onLoginClick={handleLoginClick}
        onLogoutClick={handleLogoutClick}
        onCheckout={handleCheckout}
        onUpdateQuantity={updateQuantity}
        onApplyFilters={() => {
          // Apply filters logic here
        }}
        onResetFilters={() => {
          setSelectedCategory('all');
          setSelectedSort('name_asc');
          setPriceRange({ min: 0, max: 100 });
        }}
        selectedCategory={selectedCategory}
        selectedSort={selectedSort}
        priceRange={priceRange}
        showFilters={showFilters}
        onShowFiltersChange={setShowFilters}
        onCategoryChange={setSelectedCategory}
        onSortChange={setSelectedSort}
        onPriceRangeChange={setPriceRange}
      />

      {/* MAIN CONTENT */}
      <main className="transition-all duration-300 flex-1 w-full">
        {/* Main Content Container with proper background */}
        <div className="bg-groceryease-bg min-h-screen pb-10">
          {/* Hero Section for Desktop */}
          <div className="hidden desktop:block relative bg-secondary text-gray-800 py-12 mb-8">
            <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl font-bold mb-4">Welcome to GroceryEase</h1>
                <p className="text-xl mb-6">Your one-stop solution for grocery delivery with individual and group shopping options.</p>
                <div className="flex space-x-4">
                  <Link href="/products" className="bg-primary text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:bg-primary-dark hover:text-white hover:shadow-xl transform transition-all duration-300 hover:-translate-y-1">Shop Now</Link>
                  <Link href="/group-order" className="border-2 border-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-white/20 transition-all duration-300">Try Group Order</Link>
                </div>
              </div>
              <div className="relative h-80 rounded-lg overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-secondary-light/30"></div>
                {/* Abstract grocery illustration */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="grid grid-cols-3 gap-4 p-4 w-full h-full">
                    {products.slice(0, 6).map((product, index) => (
                      <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden shadow-lg flex items-center justify-center">
                        {product.image_url && (
                          <Image 
                            src={product.image_url} 
                            alt={product.name}
                            width={80}
                            height={80}
                            className="object-cover"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Seasonal Specials Section - More compact on mobile */}
          {products.length > 0 && (
            <div className="px-6 pt-4 desktop:px-8 desktop:pt-8">
              {/* Mobile version - more compact */}
              <div className="desktop:hidden m-auto bg-gradient-to-r from-secondary/40 to-secondary-light/30 w-auto max-w-full rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-bold text-gray-800">Seasonal Specials</h2>
                  <Link href="/products" className="text-sm text-primary font-medium">View all</Link>
                </div>
                
                <div className="overflow-x-auto pb-2">
                  <div className="flex gap-3 w-max">
                    {products.slice(0, 3).map((product) => (
                      <div key={`special-mobile-${product.id}`} className="w-40 flex-shrink-0">
                        <RecommendationCard 
                          product={product}
                          onAddToCart={(quantity) => handleAddToCart(product, quantity)} 
                          isRecentlyPurchased={product.id === products[0]?.id}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Desktop version - full sized */}
              <div className="hidden desktop:block m-auto bg-gradient-to-r from-secondary to-secondary-light/70 w-auto max-w-full rounded-xl p-8 shadow-sm">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Seasonal Specials</h2>
                <p className="text-gray-600 mb-6 text-lg">Discover our limited-time offers on seasonal products</p>
                
                <div className="grid grid-cols-4 gap-4">
                  {products.slice(0, 4).map((product) => (
                    <RecommendationCard 
                      key={`special-desktop-${product.id}`} 
                      product={product}
                      onAddToCart={(quantity) => handleAddToCart(product, quantity)} 
                      isRecentlyPurchased={product.id === products[0]?.id}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recently Purchased Section */}
          <div className="p-6 pt-8 desktop:px-8 desktop:pt-12">
            {/* Mobile header - more compact */}
            <div className="flex justify-between items-center mb-3 desktop:hidden">
              <h2 className="text-lg font-bold text-gray-800">Recently Purchased</h2>
              <Link href="/products" className="text-sm text-primary font-medium">View all</Link>
            </div>
            
            {/* Desktop header - full size with controls */}
            <div className="hidden desktop:flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">Recently Purchased</h2>
              <div className="flex gap-2">
                <button
                  onClick={scrollRecentlyPurchasedPrev}
                  className="p-2 rounded-full bg-accent-ivory hover:bg-secondary transition-colors"
                  aria-label="Previous items"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={scrollRecentlyPurchasedNext}
                  className="p-2 rounded-full bg-accent-ivory hover:bg-secondary transition-colors"
                  aria-label="Next items"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            
            {loadingProducts ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 desktop:grid-cols-4 gap-4">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="bg-groceryease-surface rounded-xl overflow-hidden shadow-sm h-60 animate-pulse">
                    <div className="bg-gray-200 h-36 w-full"></div>
                    <div className="p-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : errorProducts ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <p className="flex items-center">
                  <span className="mr-2">⚠️</span>
                  <span>Error: {errorProducts}</span>
                </p>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-8 rounded-lg text-center">
                <p>No products found. Check back later for new arrivals!</p>
              </div>
            ) : (
              <>
                {/* Mobile view - simple horizontal scroll */}
                <div className="desktop:hidden overflow-x-auto pb-2">
                  <div className="flex gap-3 w-max">
                    {products.slice(0, 4).map((product) => (
                      <div key={`recent-mobile-${product.id}`} className="w-40 flex-shrink-0">
                        <RecommendationCard 
                          product={product}
                          onAddToCart={(quantity) => handleAddToCart(product, quantity)} 
                          isRecentlyPurchased={true}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Desktop view - embla carousel */}
                <div className="hidden desktop:block overflow-hidden" ref={recentlyPurchasedEmblaRef}>
                  <div className="flex -ml-4">
                    {products.slice(0, 6).map((product) => (
                      <div className="flex-none pl-4 w-full sm:w-1/2 md:w-1/3 desktop:w-1/4 xl:w-1/5" key={`recent-desktop-${product.id}`}>
                        <RecommendationCard 
                          product={product} 
                          onAddToCart={(quantity) => handleAddToCart(product, quantity)}
                          isRecentlyPurchased={true}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Popular Categories Section */}
          {products.length > 0 && (
            <div className="px-6 pt-4 pb-8 desktop:px-8 desktop:pt-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl desktop:text-3xl font-bold text-gray-800">Popular Categories</h2>
                <div className="flex gap-2 desktop:hidden">
                  <button
                    onClick={scrollPrev}
                    className="p-2 rounded-full bg-accent-ivory hover:bg-secondary transition-colors"
                    aria-label="Previous categories"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={scrollNext}
                    className="p-2 rounded-full bg-accent-ivory hover:bg-secondary transition-colors"
                    aria-label="Next categories"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Desktop grid layout for categories */}
              <div className="hidden desktop:grid desktop:grid-cols-6 gap-6 mb-8">
                {productCategories.slice(1, productCategories.length).map((category) => ( 
                  <div key={category.id} className="mx-auto w-full">
                    <div className="bg-groceryease-surface rounded-xl overflow-hidden shadow-sm hover:shadow-card-hover transition-all duration-300 cursor-pointer group h-full transform hover:scale-105">
                      <div className="aspect-square bg-gray-100 relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center bg-accent-green/10 group-hover:bg-accent-green/20 transition-colors">
                          <span className="text-accent-green font-medium text-lg">{category.name.charAt(0)}</span>
                        </div>
                      </div>
                      <div className="p-3 text-center">
                        <h3 className="font-medium text-gray-800">{category.name}</h3>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Mobile carousel for categories */}
              <div className="desktop:hidden overflow-hidden" ref={emblaRef}>
                <div className="flex gap-4">
                  {productCategories.slice(1, productCategories.length).map((category) => ( 
                    <div 
                      key={category.id}
                      className="flex-[0_0_calc(50%-0.5rem)] sm:flex-[0_0_calc(33.333%-0.75rem)] md:flex-[0_0_calc(25%-0.75rem)] lg:flex-[0_0_calc(16.666%-0.75rem)] px-2 mx-auto"
                    >
                      <div className="bg-groceryease-surface rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group h-full">
                        <div className="aspect-square bg-gray-100 relative overflow-hidden">
                          <div className="absolute inset-0 flex items-center justify-center bg-accent-green/10 group-hover:bg-accent-green/20 transition-colors">
                            <span className="text-accent-green font-medium text-lg">{category.name.charAt(0)}</span>
                          </div>
                        </div>
                        <div className="p-3 text-center">
                          <h3 className="font-medium text-gray-800">{category.name}</h3>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>  
            </div>
          )}

          {/* Products Section */}
          <div className="px-6 pt-4 flex flex-col pb-8 desktop:px-8 desktop:pt-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl desktop:text-3xl font-bold text-primary-dark">Featured Products</h2>
              <div className="flex gap-2 desktop:hidden">
                <button
                  onClick={scrollProductsPrev}
                  className="p-2 rounded-full bg-accent-ivory hover:bg-secondary transition-colors"
                  aria-label="Previous products"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={scrollProductsNext}
                  className="p-2 rounded-full bg-accent-ivory hover:bg-secondary transition-colors"
                  aria-label="Next products"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Desktop grid layout for products */}
            <div className="hidden desktop:grid desktop:grid-cols-4 wide:grid-cols-5 gap-6 mb-8">
              {products.slice(0, 8).map((product) => (
                <div key={product.id} className="transform transition-all hover:scale-[1.02]">
                  <DisplayCard 
                    product={product} 
                    onAddToCart={(quantity) => handleAddToCart(product, quantity)} 
                  />
                </div>
              ))}
            </div>
            
            {/* Mobile carousel for products */}
            <div className="desktop:hidden overflow-hidden py-1" ref={productsEmblaRef}>
              <div className="flex gap-4">
                {products.map((product) => (
                  <div 
                    key={product.id}
                    className="pl-2 flex-[0_0_calc(100%-1rem)] sm:flex-[0_0_calc(50%-0.75rem)] md:flex-[0_0_calc(33.333%-1rem)] lg:flex-[0_0_calc(25%-0.75rem)]"
                  >
                    <DisplayCard 
                      product={product} 
                      onAddToCart={(quantity) => handleAddToCart(product, quantity)} 
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-center items-center py-4">
                <button onClick={() => router.push('/products')} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
                    See More
                </button>
            </div>
          </div>
        </div>
      </main>

      {showLoginModal && (
        <LoginModal 
          onLoginSuccess={handleLoginSuccess} 
          onClose={() => setShowLoginModal(false)} 
        />
      )}
    </div>
  );
}
