"use client";

import { Header } from "@/components/Header";
import { getCurrentUser, isAuthenticated, logout as apiLogout, User } from "@/services/api";
import { useEffect, useState } from "react";
import { LoginModal } from "@/components/LoginModal";
import { useRouter } from "next/navigation"; 

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  isSelected: boolean;
  productDetails?: any;
}

const GroupOrderPage = () => {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState<User | null>(getCurrentUser());
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedSort, setSelectedSort] = useState('name_asc');
    const [priceRange, setPriceRange] = useState({ min: 0, max: 100 });
    const [showLoginModal, setShowLoginModal] = useState(false);

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

    const handleAddToCart = (product: any, quantity: number) => {
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

    return (
        <div>
            <Header 
                currentUser={currentUser}
                cartItems={cartItems}
                onLoginClick={handleLoginClick}
                onLogoutClick={handleLogoutClick}
                onAddToCart={handleAddToCart}
                onCheckout={handleCheckout}
                onToggleItemSelection={toggleItemSelection}
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
            <div className="absolute w-[100vw] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center px-6 py-10 text-center">
            <h1 className="text-xl font-bold mb-6">Enter Group Order Code</h1>

            {/* Input/Display Box for Entering Group Code */}
            <input type="text" className="bg-gray-300 w-1/2 text-black text-center font-bold font-mono py-2 px-4 rounded-full mb-4" placeholder="1234QWER" />

            <p className="text-sm text-black max-w-xs mb-10">
                Ask your friend for the group code and enter it above to join!
            </p>

            <hr className="border-t border-gray-400 w-3/4 my-6" />

            <p className="text-sm text-black max-w-xs mb-4">
                Want your friends to join your Group Order?
            </p>

            {/* Code to share with friends */}
            <div className="bg-choco-chocobtn w-1/2 text-white font-bold font-mono py-2 px-4 rounded-full mb-4">
                QWER1234
            </div>

            <p className="text-sm text-black max-w-xs">
                Send them this code to let them join your Group Order Cart
            </p>

            <p className="text-sm text-black max-w-xs mt-12 mb-8">
                Done sharing your code? Click the button below to add products to your cart!
            </p>

            <button onClick={() => router.push('/products')} className="bg-choco-greenbtn w-1/2 text-white font-bold font-mono py-2 px-4 rounded-full mb-4">
                Add Products
            </button>
            </div>

            {showLoginModal && (
                <LoginModal 
                    onLoginSuccess={handleLoginSuccess} 
                    onClose={() => setShowLoginModal(false)} 
                />
            )}
        </div>
    );
};

export default GroupOrderPage;

