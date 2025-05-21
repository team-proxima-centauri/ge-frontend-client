'use client';

import { useState, useEffect, useRef } from 'react';
import { Sidebar } from "@/components/Sidebar";
import { HomeIcon, PackageIcon, ShoppingCart, Award, Info, Filter, PanelLeft, LogIn, LogOut, ArrowUpDown, User as UserIcon, ChevronRight } from "lucide-react";
import { Divider } from "@/components/Divider";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { User, CartItem } from '@/services/api';
import { formatPrice } from '@/utils/priceUtils';

interface HeaderProps {
  currentUser: User | null;
  cartItems: CartItem[];
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onCheckout: () => void;
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
  { id: 4, name: "Club Member", href: "/club", icon: Award },
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
  // Define all props here to avoid hydration mismatches
  currentUser,
  cartItems,
  onLoginClick,
  onLogoutClick,
  onCheckout,
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
  // Client-side state that won't affect server rendering
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  // Cart is now handled by the Cart component
  
  // State to track if we're on client-side to avoid hydration issues
  const [isClient, setIsClient] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  
  // Set isClient to true after component mounts
  useEffect(() => {
    setIsClient(true);
    
    // Add event listener for Escape key to close sidebars
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (leftOpen) setLeftOpen(false);
        if (rightOpen) setRightOpen(false);
        if (filterOpen) setFilterOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [leftOpen, rightOpen, filterOpen]);

  // Function to handle cart toggle in both mobile and desktop views
  const handleCartToggle = () => {
    setRightOpen(!rightOpen);
  };

  return (
    <>
      {/* Skip to main content link for keyboard users */}
      <a href="#main-content" className="skip-link">Skip to main content</a>
      
      {/* Desktop Header - Only visible on desktop screens (≥1024px) */}
      <header className="hidden desktop:flex items-center justify-between px-8 py-4 bg-primary text-white shadow-md sticky top-0 z-30">
        {/* Logo & Brand */}
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-semibold">GroceryEase</h1>
        </div>
        
        {/* Main Navigation */}
        <nav className="flex items-center space-x-6">
          {NavMenu.map((item) => (
            <Link 
              key={item.id} 
              href={item.href}
              className={`
                flex items-center px-3 py-2 rounded-lg 
                transition-colors duration-200
                hover:text-secondary focus:outline-none focus:ring-2 focus:ring-secondary
                ${pathname === item.href ? 'bg-primary-dark text-secondary' : 'text-white'}
              `}
              aria-current={pathname === item.href ? 'page' : undefined}
            >
              <item.icon className="w-5 h-5 mr-2" aria-hidden="true" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
        
        {/* Cart & Profile */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button 
              onClick={handleCartToggle}
              className="relative p-2 rounded-full hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-secondary"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-status-error text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </button>
          </div>
          
          <div className="relative">
            {isClient && currentUser ? (
              <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-primary-dark">
                <div className="h-8 w-8 rounded-full bg-secondary-light flex items-center justify-center text-primary">
                  <UserIcon className="w-5 h-5" />
                </div>
                <span className="hidden desktop:block">{currentUser.name}</span>
                <button 
                  onClick={onLogoutClick}
                  className="ml-2 text-sm underline hover:text-secondary focus:outline-none focus:ring-2 focus:ring-secondary rounded"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button 
                onClick={onLoginClick}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <span>Sign In</span>
                <LogIn className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </header>
      
      {/* Single Mobile header - Only visible on mobile/tablet devices (<1024px) */}
      <header className="block desktop:hidden sticky top-0 z-30 bg-primary text-white shadow-md">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setLeftOpen(!leftOpen)}
            className="p-2 rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-secondary"
            aria-label="Open menu"
          >
            <PanelLeft className="h-6 w-6" />
          </button>
          
          <h1 className="text-xl font-semibold">GroceryEase</h1>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setFilterOpen(!filterOpen)}
              className={`p-2 rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-secondary ${pathname === "/products" ? "" : "hidden"}`}
              aria-label="Filter products"
            >
              <Filter className="h-6 w-6" />
            </button>
            <button
              onClick={handleCartToggle}
              className="relative p-2 rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-secondary"
              aria-label="Cart"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-status-error text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
      
      {/* RIGHT SIDEBAR for Cart */}
      <Sidebar 
        isOpen={rightOpen} 
        toggleSidebar={() => setRightOpen(!rightOpen)}
        side="right"
        aria-label="Shopping Cart"
      >
        <div className="flex justify-between items-center p-4 border-b border-groceryease-border bg-groceryease-bg">
          <h2 className="text-xl font-semibold text-primary">{pathname === "/group-order" ? 'Group Cart' : 'Your Cart'}</h2>
          <button
            onClick={() => setRightOpen(false)}
            className="p-2 text-gray-700 rounded-full hover:bg-accent-ivory transition-all duration-300 focus-ring"
            aria-label="Close cart"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-auto">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-accent-ivory rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="h-8 w-8 text-primary" />
              </div>
              <p className="text-gray-700">Your cart is empty</p>
              <p className="text-sm text-gray-500 mt-2">Add items to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-groceryease-border">
              {cartItems.map(item => (
                <div key={item.id} className="p-4 flex justify-between items-center">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-accent-ivory rounded flex-shrink-0 mr-3"></div>
                    <div>
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-sm text-primary-dark">${formatPrice(item.price)}</p>
                      {pathname === "/group-order" && item.added_by && (
                        <p className="text-xs text-primary">Added by: {item.added_by === currentUser?.id ? 'You' : item.added_by}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <button 
                      onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="w-6 h-6 flex items-center justify-center border border-groceryease-border rounded-l"
                    >
                      -
                    </button>
                    <span className="w-8 h-6 flex items-center justify-center border-t border-b border-groceryease-border">
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 flex items-center justify-center border border-groceryease-border rounded-r"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {cartItems.length > 0 && (
          <div className="p-4 border-t border-groceryease-border bg-accent-ivory/50">
            <div className="flex justify-between mb-4">
              <span className="font-medium">Total:</span>
              <span className="font-bold text-primary">${formatPrice(cartItems.reduce((total, item) => total + (item.price * item.quantity), 0))}</span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full bg-primary text-white py-2 px-4 rounded-md font-medium hover:bg-primary-dark transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </Sidebar>

      {/* Navigation Sidebar; LEFT SIDEBAR */}
      <Sidebar 
        isOpen={leftOpen} 
        toggleSidebar={() => setLeftOpen(!leftOpen)}
        aria-label="Main navigation"
      >
        <div className="flex justify-between items-center p-4">
          <h1 className="text-xl font-semibold">GroceryEase</h1>
          <button
            onClick={() => setLeftOpen(!leftOpen)}
            className="p-2 text-black rounded-full transition-all duration-300 focus-ring"
            aria-label="Close navigation menu"
          >
          </button>
        </div>
        {/* User Profile Section */}
        <div className="mb-6 mt-2">
          <div className="flex items-center p-4 bg-white/50 rounded-lg shadow-sm animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white" aria-hidden="true">
              <UserIcon className="icon-lg" />
            </div>
            
            <div className="ml-4 flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-gray-800 capitalize truncate">
                {isClient ? (currentUser ? currentUser.name : 'Guest User') : 'Guest User'}
              </h2>
              <p className="text-sm text-gray-500 truncate">
                {isClient ? (currentUser ? currentUser.email : 'Sign in to your account') : 'Sign in to your account'}
              </p>
            </div>
          </div>
        </div>
        
        <Divider />
        
        {/* Navigation Menu */}
        <div className="mb-6">
          <h3 id="main-nav-heading" className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Main Menu</h3>
          <nav className="space-y-1" aria-labelledby="main-nav-heading" ref={navRef}>
            {NavMenu.map((item) => (
              <Link 
                key={item.id} 
                href={item.href} 
                className={`
                  flex items-center px-4 py-3 text-gray-700 rounded-lg 
                  hover:bg-accent-ivory hover:text-primary 
                  focus:outline-none focus:ring-2 focus:ring-primary focus:bg-accent-ivory
                  transition-all group 
                  ${pathname === item.href ? 'bg-secondary text-primary-dark' : ''}
                `}
                aria-current={pathname === item.href ? 'page' : undefined}
              >
                <item.icon className="icon-sm mr-3 text-gray-500 group-hover:text-primary transition-colors" aria-hidden="true" />
                <span className="text-base font-medium">{item.name}</span>
                {pathname === item.href && (
                  <ChevronRight className="icon-sm ml-auto" aria-hidden="true" />
                )}
              </Link>
            ))}
          </nav>
        </div>
        
        {/* Account Actions */}
        <div className="mt-auto pt-6 pb-4 px-4">
          <Divider />
          <div className="mt-4">
            {/* Always render both buttons but conditionally show/hide them based on client-side authentication */}
            <button 
              onClick={onLogoutClick} 
              className={`
                flex w-full items-center justify-center gap-2 px-4 py-2.5 
                bg-accent-ivory text-primary border border-primary rounded-lg 
                hover:bg-primary hover:text-white 
                focus:outline-none focus:ring-2 focus:ring-primary
                transition-all duration-300 font-medium 
                ${isClient && currentUser ? 'block animate-fade-in' : 'hidden'}
              `}
              aria-label="Sign out of your account"
            >
              <LogOut className="icon-sm" aria-hidden="true" />
              <span>{isClient ? 'Sign Out' : 'Loading...'}</span>
            </button>
            
            <button 
              onClick={onLoginClick} 
              className={`
                flex w-full items-center justify-center gap-2 px-4 py-2.5 
                bg-primary text-white rounded-lg 
                hover:bg-primary-dark 
                focus:outline-none focus:ring-2 focus:ring-white
                transition-all duration-300 font-medium 
                ${isClient && !currentUser ? 'block animate-fade-in' : 'hidden'}
              `}
              aria-label="Sign in to your account"
            >
              <LogIn className="icon-sm" aria-hidden="true" />
              <span>{isClient ? 'Sign In' : 'Loading...'}</span>
            </button>
            
            {/* This placeholder button will only show during server-side rendering */}
            <button 
              className={`
                flex w-full items-center justify-center gap-2 px-4 py-2.5 
                bg-primary text-white rounded-lg 
                transition-colors font-medium 
                ${isClient ? 'hidden' : 'block'}
              `}
              disabled
              aria-hidden="true"
            >
              <span>Loading...</span>
            </button>
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
              className="text-sm text-primary-dark hover:underline"
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
            className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Apply Filters
          </button>
          
          <button
            onClick={onResetFilters}
            className="w-full mt-2 bg-accent-ivory text-gray-700 py-2 px-4 rounded-md border border-groceryease-border hover:bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light"
          >
            Reset Filters
          </button>
        </div>
      </Sidebar>

      {/* Cart is now a standalone component */}

      {/* No second mobile header needed */}
    </>
  );
}; 