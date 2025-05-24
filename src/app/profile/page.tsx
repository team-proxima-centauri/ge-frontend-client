'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { User, getCurrentUser, isAuthenticated, logout as apiLogout, CartItem, getMyCart } from '@/services/api';
import { useRouter } from 'next/navigation';
import { UserIcon, ChevronRight, ShoppingCart, X } from 'lucide-react';
import { Divider } from '@/components/Divider';

const Profile = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [emailData, setEmailData] = useState({
    newEmail: '',
    password: '',
  });
  const [error, setError] = useState<string>('');

  useEffect(() => {
    setIsClient(true);

    // Add event listener for Escape key to close sidebars
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (leftOpen) setLeftOpen(false);
        if (rightOpen) setRightOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [leftOpen, rightOpen]);

  useEffect(() => {
    const initUserAndCart = async () => {
      if (isAuthenticated()) {
        const user = getCurrentUser();
        setCurrentUser(user);
        try {
          const cart = await getMyCart();
          if (cart && cart.items) {
            setCartItems(cart.items);
          }
        } catch (error) {
          console.error('Error fetching cart:', error);
        }
      } else {
        router.push('/');
      }
    };
    initUserAndCart();
  }, [router]);

  const handleLoginClick = () => {
    router.push('/');
  };

  const handleLogoutClick = () => {
    apiLogout();
    setCurrentUser(null);
    setCartItems([]);
    router.push('/');
  };

  const handleCheckout = () => {
    if (!currentUser) {
      // Handle unauthenticated checkout
    } else {
      console.log('Proceeding to checkout with user:', currentUser);
      router.push('/checkout');
    }
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity >= 1) {
      setCartItems((items) =>
        items.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      // TODO: Implement password update API call
      // await updatePassword(passwordData.currentPassword, passwordData.newPassword);
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_err) {
      setError('Failed to update password. Please try again.');
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // TODO: Implement email update API call
      // await updateEmail(emailData.newEmail, emailData.password);
      setShowEmailModal(false);
      setEmailData({
        newEmail: '',
        password: '',
      });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_err) {
      setError('Failed to update email. Please try again.');
    }
  };

  // Modal Components
  const PasswordModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-primary">Change Password</h2>
          <button
            onClick={() => setShowPasswordModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, currentPassword: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, newPassword: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, confirmPassword: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
              required
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setShowPasswordModal(false)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const EmailModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-primary">Update Email</h2>
          <button
            onClick={() => setShowEmailModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Email Address
            </label>
            <input
              type="email"
              value={emailData.newEmail}
              onChange={(e) =>
                setEmailData({ ...emailData, newEmail: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={emailData.password}
              onChange={(e) =>
                setEmailData({ ...emailData, password: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
              required
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setShowEmailModal(false)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
            >
              Update Email
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-groceryease-bg">
      <Header
        currentUser={currentUser}
        cartItems={cartItems}
        onLoginClick={handleLoginClick}
        onLogoutClick={handleLogoutClick}
        onCheckout={handleCheckout}
        onUpdateQuantity={updateQuantity}
        onApplyFilters={() => {}}
        onResetFilters={() => {}}
        selectedCategory='all'
        selectedSort='name_asc'
        priceRange={{ min: 0, max: 100 }}
        showFilters={false}
        onShowFiltersChange={() => {}}
        onCategoryChange={() => {}}
        onSortChange={() => {}}
        onPriceRangeChange={() => {}}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-card p-6">
            <h1 className="text-2xl font-bold text-primary mb-6">Profile Settings</h1>

            {/* Profile Information */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center">
                  <UserIcon className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-primary">
                    {currentUser?.name}
                  </h2>
                  <p className="text-groceryease-textSecondary">
                    {currentUser?.email}
                  </p>
                </div>
              </div>

              <Divider />

              {/* Account Settings */}
              <div>
                <h3 className="text-lg font-semibold text-primary mb-4">
                  Account Settings
                </h3>
                <div className="space-y-4">
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="w-full text-left px-4 py-3 rounded-lg hover:bg-accent-ivory transition-colors"
                  >
                    Change Password
                  </button>
                  <button
                    onClick={() => setShowEmailModal(true)}
                    className="w-full text-left px-4 py-3 rounded-lg hover:bg-accent-ivory transition-colors"
                  >
                    Update Email
                  </button>
                </div>
              </div>

              <Divider />

              {/* Order History */}
              <div>
                <h3 className="text-lg font-semibold text-primary mb-4">
                  Order History
                </h3>
                <div className="bg-accent-ivory/50 rounded-lg p-4 text-center">
                  <p className="text-groceryease-textSecondary">
                    No orders found
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Cart Sidebar */}
      <Sidebar
        isOpen={rightOpen}
        toggleSidebar={() => setRightOpen(!rightOpen)}
        side="right"
        aria-label="Shopping Cart"
      >
        <div className="flex justify-between items-center p-4 border-b border-groceryease-border bg-groceryease-bg">
          <h2 className="text-xl font-semibold text-primary">Your Cart</h2>
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
              <p className="text-sm text-gray-500 mt-2">
                Add items to get started
              </p>
            </div>
          ) : (
            <div className="divide-y divide-groceryease-border">
              {cartItems.map((item) => (
                <div key={item.id} className="p-4 flex justify-between items-center">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-accent-ivory rounded flex-shrink-0 mr-3"></div>
                    <div>
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-sm text-primary-dark">
                        ${item.price}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() =>
                        updateQuantity(item.id, Math.max(1, item.quantity - 1))
                      }
                      className="w-6 h-6 flex items-center justify-center border border-groceryease-border rounded-l"
                    >
                      -
                    </button>
                    <span className="w-8 h-6 flex items-center justify-center border-t border-b border-groceryease-border">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1)
                      }
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
              <span className="font-bold text-primary">
                ₱
                {cartItems.reduce(
                  (total, item) => total + item.price * item.quantity,
                  0
                ).toFixed(2)}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-primary text-white py-2 px-4 rounded-md font-medium hover:bg-primary-dark transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </Sidebar>

      {/* Modals */}
      {showPasswordModal && <PasswordModal />}
      {showEmailModal && <EmailModal />}
    </div>
  );
};

export default Profile;