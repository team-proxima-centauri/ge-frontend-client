'use client';

import { useState } from 'react';
import { Sidebar } from "@/components/Sidebar";
import { HomeIcon, PackageIcon, ShoppingCart, Award, Info, Filter, PanelLeft, LogIn, LogOut, ArrowUpDown } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { Divider } from "@/components/Divider";
import { usePathname } from 'next/navigation';
import { User, isAuthenticated, getCurrentUser, logout as apiLogout } from '@/services/api';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  isSelected: boolean;
  productDetails?: any;
}

interface HeaderProps {
  currentUser: User | null;
  cartItems: CartItem[];
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onAddToCart: (product: any, quantity: number) => void;
  onCheckout: () => void;
  onToggleItemSelection: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
  selectedCategory: string;
  selectedSort: string;
  priceRange: { min: number; max: number };
  showFilters: boolean;
  onShowFiltersChange: (show: boolean) => void;
  onCategoryChange: (category: string) => void;
  onSortChange: (sort: string) => void;
  onPriceRangeChange: (range: { min: number; max: number }) => void;
}

const NavMenu = [
  { id: 1, name: "Dashboard", href: "/", icon: HomeIcon },
  { id: 2, name: "Products", href: "/products", icon: PackageIcon },
  { id: 3, name: "Group Order", href: "/group-order", icon: ShoppingCart },
  { id: 4, name: "Club Member", href: "#", icon: Award },
  { id: 5, name: "About", href: "#", icon: Info },
];

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

const sortOptions = [
  { id: 'name_asc', name: 'Name: A to Z' },
  { id: 'name_desc', name: 'Name: Z to A' },
  { id: 'price_asc', name: 'Price: Low to High' },
  { id: 'price_desc', name: 'Price: High to Low' },
  { id: 'newest', name: 'Newest First' },
];

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  cartItems,
  onLoginClick,
  onLogoutClick,
  onAddToCart,
  onCheckout,
  onToggleItemSelection,
  onUpdateQuantity,
  onApplyFilters,
  onResetFilters,
  selectedCategory,
  selectedSort,
  priceRange,
  showFilters,
  onShowFiltersChange,
  onCategoryChange,
  onSortChange,
  onPriceRangeChange,
}) => {
  const pathname = usePathname();   
  const [leftOpen, setLeftOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      {/* Navigation Sidebar; LEFT SIDEBAR */}
      <Sidebar 
        isOpen={leftOpen} 
        toggleSidebar={() => setLeftOpen(!leftOpen)}
      >
        <div className="flex justify-between items-center p-4">
          <h1 className="text-xl font-semibold">GroceryEase</h1>
          <button
            onClick={() => setLeftOpen(!leftOpen)}
            className="p-2 text-black rounded-full transition-all duration-300"
            aria-label="Toggle Navigation Sidebar"
          >
            <PanelLeft className="h-6 w-6" />
          </button>
        </div>
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
                className={`flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-white/70 hover:text-choco-greenbtn transition-all group ${pathname === item.href ? 'bg-choco-selected text-primary' : ''}`}
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
                onClick={onLogoutClick} 
                className="flex w-full items-center justify-center gap-2 px-4 py-2.5 bg-white text-choco-redbtn border border-choco-redbtn rounded-lg hover:bg-choco-redbtn hover:text-white transition-colors font-medium"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button 
                onClick={onLoginClick} 
                className="flex w-full items-center justify-center gap-2 px-4 py-2.5 bg-choco-greenbtn text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <LogIn className="h-5 w-5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </Sidebar>

      {/* Filter Sidebar */}
      <Sidebar 
        side="right" 
        isOpen={filterOpen} 
        toggleSidebar={() => setFilterOpen(!filterOpen)}
      >
        <div className="flex justify-between items-center p-4">
          <h1 className="text-xl font-semibold">Filter & Sort</h1>
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="p-2 text-black rounded-full transition-all duration-300"
            aria-label="Toggle Filter Sidebar"
          >
            <Filter className="h-6 w-6" />
          </button>
        </div>
        {/* Categories Section */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-700">Categories</h3>
            <button 
              onClick={() => onShowFiltersChange(!showFilters)}
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
                  onChange={() => onCategoryChange(category.id)}
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
                  onChange={() => onSortChange(option.id)}
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
                onChange={(e) => onPriceRangeChange({...priceRange, min: parseInt(e.target.value) || 0})}
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
                onChange={(e) => onPriceRangeChange({...priceRange, max: parseInt(e.target.value) || 0})}
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
              onApplyFilters();
              setFilterOpen(false);
            }}
            className="w-full bg-choco-greenbtn text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-choco-greenbtn"
          >
            Apply Filters
          </button>
          
          <button
            onClick={onResetFilters}
            className="w-full mt-2 bg-white text-gray-700 py-2 px-4 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Reset Filters
          </button>
        </div>
      </Sidebar>

      {/* Cart Sidebar */}
      <Sidebar side="right" isOpen={cartOpen} toggleSidebar={() => setCartOpen(!cartOpen)}>
        <div className="flex justify-between items-center p-4">
          <h1 className="text-xl font-semibold">My Cart</h1>
          <button
            onClick={() => setCartOpen(!cartOpen)}
            className="p-2 text-black rounded-full transition-all duration-300"
            aria-label="Toggle Cart Sidebar"
          >
            <ShoppingCart className="h-6 w-6" />
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
                      onChange={() => onToggleItemSelection(item.id)} 
                      className="mr-2 h-4 w-4 accent-indigo-600"
                    />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="px-2 py-1 border rounded-l">-</button>
                    <span className="px-3 py-1 border-t border-b">{item.quantity}</span>
                    <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 border rounded-r">+</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {cartItems.length > 0 && (
          <div className="p-4 border-t">
            <button 
              onClick={onCheckout}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </Sidebar>

      {/* Main Header */}
      <div className="sticky top-0 z-40 flex justify-between items-center p-4 bg-white shadow-md">
        <button
          onClick={() => setLeftOpen(!leftOpen)}
          className="p-2 text-black rounded-full transition-all duration-300"
          aria-label="Toggle Navigation Sidebar"
        >
          <PanelLeft className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Chocomart</h1>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setFilterOpen(!filterOpen)}
            className={`p-2 text-black rounded-full transition-all duration-300 relative ${pathname === "/products" ? "" : "hidden"}`}
            aria-label="Toggle Filter Sidebar"
          >
            <Filter className="h-6 w-6" />
          </button>
          <button 
            onClick={() => setCartOpen(!cartOpen)} 
            className={`p-2 text-black rounded-full transition-all duration-300 relative ${pathname === "/group-order" ? "hidden" : ""}`}
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
    </>
  );
}; 