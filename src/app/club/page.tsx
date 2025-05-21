"use client";

import { Header } from "@/components/Header";
import { getCurrentUser, logout as apiLogout, User, CartItem as ApiCartItem } from "@/services/api";
import { useState } from "react";
import { LoginModal } from "@/components/LoginModal";

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

const ClubPage = () => {
    // No router needed for now
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

    

    const handleCheckout = () => {
        if (!currentUser) {
            setShowLoginModal(true);
        } else {
            console.log('Proceeding to checkout with user:', currentUser);
            alert('Proceeding to checkout!');
        }
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
        <div className="min-h-screen bg-groceryease-bg">
            <Header 
                currentUser={currentUser}
                cartItems={cartItems as unknown as ApiCartItem[]}
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
            <div className="absolute w-[100vw] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center px-6 py-10 text-center">
                {/* Tailwind Card Component for React + TypeScript */}
                <div
                className="w-[90vw] md:w-[430px] rounded-[20px] bg-gradient-to-tr from-primary-dark from-30% via-primary via-50% to-primary-dark to-70% p-[5px] overflow-hidden shadow-xl transition-transform duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]"
                >
                {/* Top Section */}
                <div className="relative h-[150px] md:h-[200px] rounded-[15px] bg-gradient-to-r from-secondary to-accent-ivory flex items-start justify-between px-4 pt-2">
                    <h1 className="m-auto">Barcode here</h1>
                </div>

                {/* Bottom Section */}
                <div className="mt-4 px-2 pb-4 text-center">
                    <div className="text-white text-[17px] font-bold tracking-wider">VIP Club Member Card</div>
                    
                    <div className="mt-5 flex justify-between text-[rgba(170,222,243,0.721)] text-xs">
                    <div className="flex-1 text-center">
                        <div className="text-[13px] font-semibold">123/333</div>
                        <div className="text-[10px]">Metric 1</div>
                    </div>
                    <div className="flex-1 border-l border-r border-[rgba(255,255,255,0.15)] text-center">
                        <div className="text-[13px] font-semibold">456/666</div>
                        <div className="text-[10px]">Metric 2</div>
                    </div>
                    <div className="flex-1 text-center">
                        <div className="text-[13px] font-semibold">789/999</div>
                        <div className="text-[10px]">Metric 3</div>
                    </div>
                    </div>
                </div>
                </div>


                <div className="w-1/2 text-balance mt-4 px-2 py-8 text-center">
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                </div>

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

export default ClubPage;

