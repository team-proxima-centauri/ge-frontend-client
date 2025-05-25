'use client';

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

const AboutPage = () => {
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
                
            <h1 className="text-3xl font-bold text-primary text-center mb-8">About GroceryEase</h1>
        
                <div className="space-y-8 text-left text-justify desktop:w-1/2">
                    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                        <p className="text-gray-700 leading-relaxed">
                        GroceryEase is a mobile and web application developed as part of our thesis project to improve the online supermarket shopping experience. Created in collaboration with Choco Mart, a Korean grocery store known for offering authentic Korean products, our platform introduces smart features such as intelligent shopping lists, real-time order tracking, and group ordering options. These tools are designed to make grocery shopping more efficient, convenient, and user-friendly.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                        <h2 className="text-xl font-semibold text-primary mb-4">Our Team</h2>
                        <p className="text-gray-700 leading-relaxed">
                        Our team is composed of four dedicated IT students who brought this project to life: Shannaiah Gabuan as the Project Manager, Deo Mariano as the System Analyst, Marvin Gonzales as the Programmer, and Neil Rifarial as the Documenter. Together, we aim to modernize the way people shop for groceries by providing a seamless, innovative, and collaborative shopping experience through GroceryEase.
                        </p>
                    </div>
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

export default AboutPage;

