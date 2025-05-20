"use client";

import { Sidebar } from "@/components/Sidebar";
import { useState, useEffect } from "react";
import { HomeIcon, PackageIcon, ShoppingCart, Award, Info, Filter, PanelLeft, LogIn, LogOut, ArrowUpDown } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { Divider } from "@/components/Divider";
import { RecommendationCard } from "@/components/reco";
import { ProductCard } from "@/components/Product";
import { LoginModal } from '@/components/LoginModal';
import {
  getProducts,
  Product, 
  User, 
  getCurrentUser, 
  isAuthenticated, 
  logout as apiLogout 
} from '@/services/api';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  isSelected: boolean;
  productDetails?: Product; 
}

export default function Home() {
  const [leftOpen, setLeftOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  
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

  const NavMenu = [
    { id: 1, name: "Dashboard", href: "#", icon: HomeIcon },
    { id: 2, name: "Products", href: "#", icon: PackageIcon },
    { id: 3, name: "Group Order", href: "#", icon: ShoppingCart },
    { id: 4, name: "Club Member", href: "#", icon: Award },
    { id: 5, name: "About", href: "#", icon: Info },
  ];

  // Product categories based on database schema
  const productCategories = [
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
  
  // Sorting options
  const sortOptions = [
    { id: 'name_asc', name: 'Name: A to Z' },
    { id: 'name_desc', name: 'Name: Z to A' },
    { id: 'price_asc', name: 'Price: Low to High' },
    { id: 'price_desc', name: 'Price: High to Low' },
    { id: 'newest', name: 'Newest First' },
  ];

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
  }, []);

  useEffect(() => {
    setIsAuthLoading(true);
    if (isAuthenticated()) {
      const user = getCurrentUser();
      setCurrentUser(user);
    }
    setIsAuthLoading(false);
  }, []);

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

  const toggleItemSelection = (itemId: string) => {
    setCartItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, isSelected: !item.isSelected } : item
      )
    );
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity >= 1) {
      setCartItems(items =>
        items.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const handleAddToCart = (product: Product, quantity: number) => {
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.id === product.id);
      if (existingItemIndex >= 0) {
        return prevItems.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevItems, {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity,
          isSelected: false,
          productDetails: product
        }];
      }
    });
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
      {/* Navigation Sidebar; LEFT SIDEBAR */}
      <Sidebar 
        isOpen={leftOpen} 
        toggleSidebar={() => setLeftOpen(!leftOpen)}
        title="GroceryEase"
      >
        {/* User Profile Section */}
        <div className="mb-6 mt-2">
          <div className="flex items-center p-4 bg-white/50 rounded-lg shadow-sm">
            <Avatar 
              size="lg" 
              name={currentUser ? currentUser.name : 'Guest'} 
            />
            <div className="ml-4 flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-gray-800 capitalize truncate">
                {currentUser ? currentUser.name : 'Guest User'}
              </h2>
              <p className="text-sm text-gray-500 truncate">
                {currentUser ? currentUser.email : 'Sign in to your account'}
              </p>
            </div>
          </div>
        </div>
        
        <Divider />
        
        {/* Navigation Menu */}
        <div className="mb-6">
          <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Main Menu</h3>
          <nav className="space-y-1">
            {NavMenu.map((item) => (
              <a 
                key={item.id} 
                href={item.href} 
                className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-white/70 hover:text-choco-greenbtn transition-all group"
              >
                <item.icon className="h-5 w-5 mr-3 text-gray-500 group-hover:text-choco-greenbtn transition-colors" />
                <span className="text-base font-medium">{item.name}</span>
              </a>
            ))}
          </nav>
        </div>
        
        {/* Account Actions */}
        <div className="mt-auto pt-6 pb-4 px-4">
          <Divider />
          <div className="mt-4">
            {currentUser ? (
              <button 
                onClick={handleLogoutClick} 
                className="flex w-full items-center justify-center gap-2 px-4 py-2.5 bg-white text-choco-redbtn border border-choco-redbtn rounded-lg hover:bg-choco-redbtn hover:text-white transition-colors font-medium"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button 
                onClick={handleLoginClick} 
                className="flex w-full items-center justify-center gap-2 px-4 py-2.5 bg-choco-greenbtn text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <LogIn className="h-5 w-5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </Sidebar>

      {/* Navigation Sidebar; Filter SIDEBAR */}
      <Sidebar 
        side="right" 
        isOpen={filterOpen} 
        toggleSidebar={() => setFilterOpen(!filterOpen)}
        title="Filter & Sort"
      >
        {/* Categories Section */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-700">Categories</h3>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="text-sm text-choco-greenbtn hover:underline"
            >
              {showFilters ? 'Hide' : 'Show All'}
            </button>
          </div>
          
          <div className="space-y-2 mt-3">
            {productCategories.slice(0, showFilters ? productCategories.length : 5).map((category) => (
              <div key={category.id} className="flex items-center">
                <input
                  type="radio"
                  id={`category-${category.id}`}
                  name="category"
                  value={category.id}
                  checked={selectedCategory === category.id}
                  onChange={() => setSelectedCategory(category.id)}
                  className="h-4 w-4 text-choco-greenbtn focus:ring-choco-greenbtn border-gray-300"
                />
                <label htmlFor={`category-${category.id}`} className="ml-2 text-sm text-gray-700">
                  {category.name}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Sort Section */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-medium text-gray-700 mb-2 flex items-center">
            <ArrowUpDown className="h-4 w-4 mr-1" />
            Sort By
          </h3>
          
          <div className="space-y-2 mt-3">
            {sortOptions.map((option) => (
              <div key={option.id} className="flex items-center">
                <input
                  type="radio"
                  id={`sort-${option.id}`}
                  name="sort"
                  value={option.id}
                  checked={selectedSort === option.id}
                  onChange={() => setSelectedSort(option.id)}
                  className="h-4 w-4 text-choco-greenbtn focus:ring-choco-greenbtn border-gray-300"
                />
                <label htmlFor={`sort-${option.id}`} className="ml-2 text-sm text-gray-700">
                  {option.name}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Price Range Section */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-medium text-gray-700 mb-3">Price Range</h3>
          
          <div className="flex items-center space-x-2">
            <div className="relative rounded-md shadow-sm flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                min="0"
                value={priceRange.min}
                onChange={(e) => setPriceRange({...priceRange, min: parseInt(e.target.value) || 0})}
                className="focus:ring-choco-greenbtn focus:border-choco-greenbtn block w-full pl-7 pr-3 py-2 sm:text-sm border-gray-300 rounded-md"
                placeholder="Min"
              />
            </div>
            
            <span className="text-gray-500">-</span>
            
            <div className="relative rounded-md shadow-sm flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                min="0"
                value={priceRange.max}
                onChange={(e) => setPriceRange({...priceRange, max: parseInt(e.target.value) || 0})}
                className="focus:ring-choco-greenbtn focus:border-choco-greenbtn block w-full pl-7 pr-3 py-2 sm:text-sm border-gray-300 rounded-md"
                placeholder="Max"
              />
            </div>
          </div>
        </div>
        
        {/* Apply Filters Button */}
        <div className="p-4">
          <button
            onClick={() => {
              // Apply filters logic here
              setFilterOpen(false);
            }}
            className="w-full bg-choco-greenbtn text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-choco-greenbtn"
          >
            Apply Filters
          </button>
          
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedSort('name_asc');
              setPriceRange({ min: 0, max: 100 });
            }}
            className="w-full mt-2 bg-white text-gray-700 py-2 px-4 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Reset Filters
          </button>
        </div>
      </Sidebar>

      {/* Cart Sidebar; RIGHT SIDEBAR */}
      <Sidebar side="right" isOpen={cartOpen} toggleSidebar={() => setCartOpen(!cartOpen)}>
        <div className="flex justify-between items-center p-4">
          <h1 className="text-xl font-semibold">My Cart</h1>
          <button
            onClick={() => setCartOpen(!cartOpen)}
            className="p-2 text-black rounded-full transition-all duration-300"
            aria-label="Toggle Cart Sidebar"
          >
            <PanelLeft className="h-6 w-6" />
          </button>
        </div>
        <Divider />
        <div className="p-4 flex flex-col h-[calc(100%-140px)]"> 
          {cartItems.length === 0 ? (
            <p className="text-gray-500 text-center mt-10">Your cart is empty.</p>
          ) : (
            <ul className="space-y-2 overflow-y-auto flex-grow">
              {cartItems.map((item) => (
                <li key={item.id} className="flex items-center justify-between p-2 border-b">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={item.isSelected} 
                      onChange={() => toggleItemSelection(item.id)} 
                      className="mr-2 h-4 w-4 accent-indigo-600"
                    />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-1 border rounded-l">-</button>
                    <span className="px-3 py-1 border-t border-b">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 border rounded-r">+</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {cartItems.length > 0 && (
          <div className="p-4 border-t">
            <button 
              onClick={handleCheckout}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </Sidebar>

      {/* MAIN CONTENT */}
      <main className="transition-all duration-300 flex-1 w-full">
        {/* Header */} 
        <div className="flex justify-between items-center p-4 bg-white shadow-md">
          <button
            onClick={() => setLeftOpen(!leftOpen)}
            className="p-2 text-black rounded-full transition-all duration-300"
            aria-label="Toggle Navigation Sidebar"
          >
            <PanelLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">GroceryEase</h1>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setFilterOpen(!filterOpen)}
              className="p-2 text-black rounded-full transition-all duration-300 relative"
              aria-label="Toggle Filter Sidebar"
            >
              <Filter className="h-6 w-6" />
            </button>
            <button 
              onClick={() => setCartOpen(!cartOpen)} 
              className="p-2 text-black rounded-full transition-all duration-300 relative"
              aria-label="Toggle Cart Sidebar"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartItems.reduce((acc, item) => acc + item.quantity, 0) > 0 && (
                <span className="absolute top-0 right-0 block h-4 w-4 rounded-full ring-2 ring-white bg-red-500 text-xs text-white text-center">
                  {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Main Content Container with proper background */}
        <div className="bg-choco-bg min-h-screen pb-10">
          {/* Recently Purchased Section */}
          <div className="p-6 pt-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Recently Purchased</h2>
              <button className="text-choco-greenbtn hover:underline font-medium flex items-center">
                View All
                <ArrowUpDown className="ml-1 h-4 w-4" />
              </button>
            </div>
            
            {loadingProducts ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="bg-white rounded-xl overflow-hidden shadow-sm h-64 animate-pulse">
                    <div className="bg-gray-200 h-40 w-full"></div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.slice(0, 8).map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onAddToCart={(quantity) => handleAddToCart(product, quantity)} 
                  />
                ))}
              </div>
            )}
          </div>

          {/* Popular Categories Section */}
          {products.length > 0 && (
            <div className="px-6 pt-4 pb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Popular Categories</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {productCategories.slice(1, 7).map((category) => (
                  <div 
                    key={category.id}
                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
                  >
                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                      {/* We would ideally have category images here */}
                      <div className="absolute inset-0 flex items-center justify-center bg-choco-greenbtn/10 group-hover:bg-choco-greenbtn/20 transition-colors">
                        <span className="text-choco-greenbtn font-medium text-lg">{category.name.charAt(0)}</span>
                      </div>
                    </div>
                    <div className="p-3 text-center">
                      <h3 className="font-medium text-gray-800">{category.name}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Seasonal Specials Section */}
          {products.length > 0 && (
            <div className="px-6 pt-4">
              <div className="bg-gradient-to-r from-choco-card to-choco-sidebar rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Seasonal Specials</h2>
                <p className="text-gray-600 mb-6">Discover our limited-time offers on seasonal products</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {products.slice(0, 4).map((product) => (
                    <RecommendationCard 
                      key={`special-${product.id}`} 
                      product={product}
                      onAddToCart={(quantity) => handleAddToCart(product, quantity)} 
                      isRecentlyPurchased={product.id === products[0]?.id}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
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
