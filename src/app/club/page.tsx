"use client";

import { Header } from "@/components/Header";
import { getCurrentUser, logout as apiLogout, User, CartItem as ApiCartItem, getMyCart } from "@/services/api";
import { useState, useEffect, useCallback } from "react";
import { LoginModal } from "@/components/LoginModal";
import { useRouter } from "next/navigation";

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
    const [currentUser, setCurrentUser] = useState<User | null>(getCurrentUser());
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedSort, setSelectedSort] = useState('name_asc');
    const [priceRange, setPriceRange] = useState({ min: 0, max: 100 });
    const [showLoginModal, setShowLoginModal] = useState(false);
    const router = useRouter();

    // Add fetchUserCart function
    const fetchUserCart = useCallback(async () => {
        if (currentUser) {
            try {
                const cart = await getMyCart();
                if (cart && cart.items) {
                    // Map API cart items to local CartItem type
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
            }
        }
    }, [currentUser]);

    // Add useEffect to fetch cart when user changes
    useEffect(() => {
        fetchUserCart();
    }, [fetchUserCart]);

    const handleLoginClick = () => {
        setShowLoginModal(true);
    };

    const handleLogoutClick = () => {
        apiLogout();
        setCurrentUser(null);
        setCartItems([]); // Clear cart items on logout
    };

    const handleLoginSuccess = (loggedInUser: User) => {
        setCurrentUser(loggedInUser);
        setShowLoginModal(false);
        fetchUserCart(); // Fetch cart after successful login
    };

    const handleCheckout = () => {
        if (!currentUser) {
            setShowLoginModal(true);
        } else {
            console.log('Proceeding to checkout with user:', currentUser);
            alert('Proceeding to checkout!');
      router.push('/checkout');

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
            <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
                {/* Tailwind Card Component for React + TypeScript */}
                <div
                className="w-[90vw] max-w-[430px] rounded-[20px] bg-gradient-to-tr from-primary-dark from-30% via-primary via-50% to-primary-dark to-70% p-[5px] overflow-hidden shadow-xl transition-transform duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]"
                >
                {/* Top Section */}
                <div className="relative w-full aspect-video rounded-[15px] bg-gradient-to-r from-secondary to-accent-ivory flex items-start justify-between px-4 pt-2">
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

                {/* For non members */}
                <div className="w-full flex flex-col items-center justify-center desktop:w-1/2 text-left text-justify mt-4 px-2 py-8">
                    <p>You’re one step closer to your reward!
                    Keep shopping, scanning, and saving — your activity unlocks exclusive perks. 
                    <br /> <br /> 
                    Hit your metrics to activate your discount voucher and enjoy premium benefits as a valued VIP member.
                    <br /> <br /> 
                    The more you engage, the more you earn. Let’s get that voucher! 🎉</p>

                    <button onClick={() => router.push('/products')} className="bg-primary text-white px-4 py-2 rounded-md my-12">View Products!</button>
                </div>

                {/* For members */}
                {/* <div className="w-full flex flex-col items-center justify-center desktop:w-1/2 text-left text-justify mt-4 px-2 py-8">
                    <p>You’ve earned it — now enjoy it! 🎁
                    Your exclusive voucher is ready to use.</p>
                    <br />

                    <div className="flex flex-col gap-2 text-left">
                        <p>How to redeem:</p>
                        <p>• Shop your favorites online or in-store</p>
                        <p>• Present your barcode at checkout</p>
                        <p>• Your discount will be applied instantly!</p>
                    </div>
                    <br />


                    <p>Thank you for being a valued VIP — we’re glad to have you with us. More perks await every time you shop!</p>

                    <button onClick={() => router.push('/products')} className="bg-primary text-white px-4 py-2 rounded-md my-12">Use Voucher!</button>
                </div> */}

                

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

