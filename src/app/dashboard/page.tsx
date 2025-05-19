'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, isAuthenticated, logout } from '@/lib/auth/auth';
import { User } from '@/lib/auth/auth';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    // Get current user data
    const userData = getCurrentUser();
    setUser(userData);
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-groceryease-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-groceryease-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-groceryease-text">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-groceryease-background">
      {/* Header */}
      <header className="bg-groceryease-card shadow-md rounded-lg mx-4 mt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-groceryease-text font-heading">Groceryease</h1>
          <div className="flex items-center space-x-4">
            <span className="text-groceryease-text">Welcome, {user?.name}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-groceryease-button text-white rounded-lg hover:bg-opacity-90 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-groceryease-card shadow-md rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-groceryease-text font-heading">Dashboard</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Order summary card */}
            <div className="bg-peach-100 p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-medium text-groceryease-text mb-2">Your Orders</h3>
              <p className="text-3xl font-bold text-groceryease-accent">0</p>
              <p className="text-sm text-groceryease-textLight mt-2">No orders yet</p>
              <button 
                onClick={() => router.push('/products')}
                className="mt-4 px-4 py-2 bg-groceryease-button text-white rounded-lg hover:bg-opacity-90 transition-colors w-full"
              >
                Start Shopping
              </button>
            </div>
            
            {/* Profile card */}
            <div className="bg-peach-100 p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-medium text-groceryease-text mb-2">Profile</h3>
              <div className="space-y-2">
                <p className="text-groceryease-textLight"><span className="font-medium text-groceryease-text">Name:</span> {user?.name}</p>
                <p className="text-groceryease-textLight"><span className="font-medium text-groceryease-text">Email:</span> {user?.email}</p>
                <p className="text-groceryease-textLight"><span className="font-medium text-groceryease-text">Role:</span> {user?.role}</p>
              </div>
              <button className="mt-4 px-4 py-2 bg-groceryease-accent text-white rounded-lg hover:bg-opacity-90 transition-colors w-full">
                Edit Profile
              </button>
            </div>
            
            {/* Quick actions card */}
            <div className="bg-peach-100 p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-medium text-groceryease-text mb-2">Quick Actions</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => router.push('/products')}
                  className="px-4 py-2 bg-groceryease-button text-white rounded-lg hover:bg-opacity-90 transition-colors w-full"
                >
                  Browse Categories
                </button>
                <button className="px-4 py-2 bg-groceryease-button text-white rounded-lg hover:bg-opacity-90 transition-colors w-full">
                  View Promotions
                </button>
                <button className="px-4 py-2 bg-groceryease-button text-white rounded-lg hover:bg-opacity-90 transition-colors w-full">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
