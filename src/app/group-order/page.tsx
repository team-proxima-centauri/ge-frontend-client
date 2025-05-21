"use client";

import { useState, useEffect } from "react";
import { LoginModal } from "@/components/LoginModal";
import { useRouter } from "next/navigation"; 
import { 
  getCurrentUser, 
  logout as apiLogout, 
  User, 
  CartItem as ApiCartItem,
  createGroupCart,
  joinGroupCart,
  getGroupCartByCode,
  getMyCart,
  updateCartItemQuantity,
  removeCartItem,
  GroupCartMember,
  leaveGroupCart
} from "@/services/api";
import { Header } from "@/components/Header";

// Extend the API CartItem with additional properties needed for the UI
interface CartItem extends ApiCartItem {
  isSelected: boolean;
  productDetails?: Record<string, unknown>;
}

interface GroupCartState {
  id: string;
  group_code: string;
  members: GroupCartMember[];
  status: string;
  owner_id: string;
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
    const [groupCode, setGroupCode] = useState<string>('');
    const [groupCartState, setGroupCartState] = useState<GroupCartState | null>(null);
    const [isJoiningGroup, setIsJoiningGroup] = useState(false);
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);
    const [loadingCart, setLoadingCart] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    

    // Add to cart functionality will be handled directly in the product pages

    const handleCheckout = () => {
        if (!currentUser) {
            setShowLoginModal(true);
        } else {
            console.log('Proceeding to checkout with user:', currentUser);
            alert('Proceeding to checkout!');
        }
    };

    // Use the API to update cart item quantities
    const updateQuantity = async (itemId: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            // Remove item if quantity is 0
            try {
                const success = await removeCartItem(itemId);
                if (success) {
                    setCartItems(items => items.filter(item => item.id !== itemId));
                }
            } catch (error) {
                console.error('Error removing item from cart:', error);
                setErrorMessage('Failed to remove item from cart');
            }
        } else {
            try {
                const updatedItem = await updateCartItemQuantity(itemId, newQuantity);
                if (updatedItem) {
                    setCartItems(items =>
                        items.map(item =>
                            item.id === itemId ? { ...item, quantity: newQuantity } : item
                        )
                    );
                }
            } catch (error) {
                console.error('Error updating item quantity:', error);
                setErrorMessage('Failed to update item quantity');
            }
        }
    };
    
    // Load user's cart on component mount
    useEffect(() => {
        const loadUserCart = async () => {
            if (currentUser) {
                setLoadingCart(true);
                try {
                    const cart = await getMyCart();
                    if (cart) {
                        setCartItems(cart.items.map(item => ({
                            ...item,
                            isSelected: false
                        })));
                        
                        // Check if user already has a group cart
                        if (cart.is_group && cart.group_code) {
                            setGroupCode(cart.group_code);
                            const groupCart = await getGroupCartByCode(cart.group_code);
                            if (groupCart) {
                                setGroupCartState({
                                    id: groupCart.id,
                                    group_code: groupCart.group_code,
                                    members: groupCart.members,
                                    status: groupCart.status,
                                    owner_id: groupCart.owner_id
                                });
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error loading cart:', error);
                    setErrorMessage('Failed to load your cart');
                } finally {
                    setLoadingCart(false);
                }
            }
        };
        loadUserCart();
    }, [currentUser]);
    
    // Leave a group cart
    const handleLeaveGroupCart = async () => {
        if (!currentUser) {
            setShowLoginModal(true);
            return;
        }

        if (!groupCartState) {
            setErrorMessage('Not in a group cart');
            return;
        }

        try {
            setLoadingCart(true);
            const success = await leaveGroupCart();
            if (success) {
                // Reset the state
                setGroupCartState(null);
                setGroupCode('');
                
                // Reload the user's individual cart
                const myCart = await getMyCart();
                if (myCart) {
                    setCartItems(myCart.items.map(item => ({
                        ...item,
                        isSelected: false
                    })));
                } else {
                    setCartItems([]);
                }
                
                setErrorMessage(null);
            } else {
                setErrorMessage('Failed to leave group cart');
            }
        } catch (error) {
            console.error('Error leaving group cart:', error);
            setErrorMessage('Failed to leave group cart');
        } finally {
            setLoadingCart(false);
        }
    };

    // Create a new group cart using the API
    const handleCreateGroup = async () => {
        if (!currentUser) {
            setShowLoginModal(true);
            return;
        }
        
        setIsCreatingGroup(true);
        setErrorMessage(null);
        
        try {
            const groupCart = await createGroupCart();
            if (groupCart) {
                setGroupCode(groupCart.group_code);
                setGroupCartState({
                    id: groupCart.id,
                    group_code: groupCart.group_code,
                    members: groupCart.members,
                    status: groupCart.status,
                    owner_id: groupCart.owner_id
                });
                setCartItems(groupCart.items.map(item => ({
                    ...item,
                    isSelected: false
                })));
            }
        } catch (error) {
            console.error('Error creating group cart:', error);
            setErrorMessage('Failed to create group cart');
        } finally {
            setIsCreatingGroup(false);
        }
    };
    
    // Join an existing group cart using the API
    const handleJoinGroup = async (code: string) => {
        if (!currentUser) {
            setShowLoginModal(true);
            return;
        }
        
        if (code.length !== 6) {
            setErrorMessage('Invalid group code. Please enter a valid 6-character code.');
            return;
        }
        
        setIsJoiningGroup(true);
        setErrorMessage(null);
        
        try {
            const groupCart = await joinGroupCart(code);
            if (groupCart) {
                setGroupCode(groupCart.group_code);
                setGroupCartState({
                    id: groupCart.id,
                    group_code: groupCart.group_code,
                    members: groupCart.members,
                    status: groupCart.status,
                    owner_id: groupCart.owner_id
                });
                setCartItems(groupCart.items.map(item => ({
                    ...item,
                    isSelected: false
                })));
            }
        } catch (error) {
            console.error('Error joining group cart:', error);
            setErrorMessage('Group code not found or you cannot join this cart');
        } finally {
            setIsJoiningGroup(false);
        }
    };

    return (
        <div className="min-h-screen bg-pink-50/30">
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
            {loadingCart ? (
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 flex justify-center items-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-700">Loading your cart...</p>
                    </div>
                </div>
            ) : (
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left side - Group Information */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-pink-100">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Group Shopping</h1>
                        
                        {groupCode ? (
                            <div className="bg-pink-50 p-3 sm:p-6 rounded-lg mb-4 sm:mb-6 border border-pink-200">
                                <h2 className="text-lg font-semibold text-gray-800 mb-2">Your Group Code</h2>
                                <div className="bg-white w-full p-2 sm:p-4 text-center font-mono text-xl sm:text-2xl font-bold text-pink-800 rounded-md border border-pink-300 mb-2">
                                    {groupCode}
                                </div>
                                <p className="text-sm text-gray-600">
                                    Share this code with friends to let them join your group cart!
                                </p>
                                
                                <div className="mt-4">
                                    <h3 className="text-md font-medium text-gray-700 mb-2">Members ({groupCartState?.members?.length || 0}):</h3>
                                    <ul className="space-y-2">
                                        {groupCartState?.members?.map(member => (
                                            <li key={member.user_id} className="flex items-center">
                                                <div className="w-8 h-8 bg-pink-200 rounded-full flex items-center justify-center text-sm text-pink-800 mr-2">
                                                    {member.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-gray-800">
                                                    {member.name}
                                                    {member.user_id === currentUser?.id && ' (You)'}
                                                    {member.role === 'admin' && ' (Admin)'}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                
                                <div className="mt-6 border-t border-pink-100 pt-4">
                                    <button 
                                        onClick={handleLeaveGroupCart}
                                        className="w-full flex items-center justify-center gap-2 bg-white text-pink-600 p-3 rounded-md border border-pink-500 hover:bg-pink-50 transition-colors"
                                        disabled={loadingCart}
                                    >
                                        {loadingCart ? (
                                            'Processing...'
                                        ) : (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                                                </svg>
                                                {currentUser?.id === groupCartState?.owner_id ? 'Close Group Cart' : 'Leave Group Cart'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="bg-pink-50 p-3 sm:p-6 rounded-lg mb-3 sm:mb-4 border border-pink-200">
                                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Join a Group</h2>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <input 
                                            type="text" 
                                            placeholder="Enter group code" 
                                            className="w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500 mb-2 sm:mb-0"
                                            maxLength={6}
                                            onChange={(e) => setGroupCode(e.target.value.toUpperCase())}
                                            value={groupCode}
                                        />
                                        <button 
                                            onClick={() => handleJoinGroup(groupCode)}
                                            className="bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600 transition-colors w-full sm:w-auto"
                                            disabled={isJoiningGroup || groupCode.length !== 6}
                                        >
                                            {isJoiningGroup ? 'Joining...' : 'Join'}
                                        </button>
                                        {errorMessage && (
                                            <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-2">
                                        Ask your friend for their group code to shop together.
                                    </p>
                                </div>
                                
                                <div className="text-center my-4 text-gray-600 font-medium">Or</div>
                                
                                <div className="bg-pink-50 p-3 sm:p-6 rounded-lg border border-pink-200">
                                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Create a New Group</h2>
                                    <button 
                                        onClick={handleCreateGroup}
                                        className="w-full flex items-center justify-center gap-2 bg-pink-500 text-white p-3 rounded-md hover:bg-pink-600 transition-colors"
                                        disabled={isCreatingGroup}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                        </svg>
                                        {isCreatingGroup ? 'Creating...' : 'Create Group Cart'}
                                    </button>
                                    <p className="text-sm text-gray-600 mt-2">
                                        Start a new group cart and invite friends to join.
                                    </p>
                                </div>
                            </div>
                        )}
                        
                        {groupCode && (
                            <div className="mt-6">
                                <button 
                                    onClick={() => router.push('/products')}
                                    className="w-full bg-pink-500 text-white py-3 px-4 rounded-md font-semibold hover:bg-pink-600 transition-colors"
                                >
                                    Shop Products
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {/* Right side - Cart Preview */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-pink-100">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6">
                            {groupCode ? 'Group Cart' : 'Your Cart'}
                        </h2>
                        
                        {cartItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-pink-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                                    <svg className="h-8 w-8 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <p className="text-gray-700 text-center mb-2">Your cart is empty</p>
                                <p className="text-sm text-pink-600 text-center">
                                    {groupCode ? 'Add products to your group cart!' : 'Join or create a group to start shopping together'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="max-h-96 overflow-y-auto">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between p-3 border-b border-pink-100">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-pink-50 rounded mr-2 sm:mr-3 flex-shrink-0"></div>
                                                <div>
                                                    <p className="font-medium text-gray-800">{item.name}</p>
                                                    <p className="text-sm text-pink-700">${item.price.toFixed(2)}</p>
                                                    {groupCode && item.added_by && (
                                                        <p className="text-xs text-pink-600">
                                                            Added by: {item.added_by === currentUser?.id ? 'You' : 
                                                                groupCartState?.members?.find(m => m.user_id === item.added_by)?.name || 'Unknown'}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <button 
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="px-1 sm:px-2 py-1 border border-pink-200 rounded-l text-xs sm:text-sm text-pink-700 hover:bg-pink-50"
                                                    aria-label="Decrease quantity"
                                                >
                                                    -
                                                </button>
                                                <span className="px-2 sm:px-3 py-1 border-t border-b border-pink-200 text-xs sm:text-sm bg-white">
                                                    {item.quantity}
                                                </span>
                                                <button 
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="px-1 sm:px-2 py-1 border border-pink-200 rounded-r text-xs sm:text-sm text-pink-700 hover:bg-pink-50"
                                                    aria-label="Increase quantity"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="border-t border-pink-100 pt-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="font-medium text-gray-700">Total:</span>
                                        <span className="font-bold text-lg text-pink-700">
                                            ${cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleCheckout}
                                        className="w-full bg-pink-500 text-white py-3 px-4 rounded-md font-semibold hover:bg-pink-600 transition-colors"
                                    >
                                        {groupCode ? 'Checkout as Group' : 'Checkout'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            )}

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

