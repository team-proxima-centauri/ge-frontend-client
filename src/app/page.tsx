'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth/auth';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // Check if user is authenticated and redirect to dashboard if they are
    if (isAuthenticated()) {
      router.push('/dashboard');
    }
  }, [router]);
  return (
    <div className='min-h-screen flex flex-col'>
      {/* Header */}
      <header className='bg-groceryease-card shadow-md rounded-lg mx-4 mt-4'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center'>
          <div className='flex items-center'>
            <h1 className='text-2xl font-bold text-groceryease-text font-heading'>Groceryease</h1>
            <p className='ml-2 text-groceryease-textLight'>Fresh Delivery</p>
          </div>
          <nav className='flex space-x-4'>
            <Link 
              href='/login' 
              className='px-4 py-2 bg-groceryease-button text-white rounded-lg hover:bg-opacity-90 transition-colors'
            >
              Sign In
            </Link>
            <Link 
              href='/register' 
              className='px-4 py-2 border border-groceryease-accent text-groceryease-accent rounded-lg hover:bg-peach-100 transition-colors'
            >
              Register
            </Link>
          </nav>
        </div>
      </header>

      {/* Featured Products */}
      <section className='py-8'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-2xl font-bold text-groceryease-text font-heading'>Featured Products</h2>
            <Link href='/products' className='text-groceryease-accent hover:underline'>
              View All
            </Link>
          </div>
          
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            {/* Product Card 1 */}
            <div className='bg-groceryease-card rounded-xl shadow-md overflow-hidden'>
              <div className='relative h-40 bg-white'>
                <Image
                  src='/images/product-1.svg'
                  alt='Nescafe Gold'
                  fill
                  style={{ objectFit: 'contain' }}
                  className='p-2'
                />
              </div>
              <div className='p-4'>
                <h3 className='font-medium text-groceryease-text'>Nescafe Gold</h3>
                <p className='text-sm text-groceryease-textLight'>Premium instant coffee</p>
                <div className='mt-2 flex justify-between items-center'>
                  <span className='font-bold text-groceryease-text'>₱129.00</span>
                  <button className='bg-groceryease-button text-white px-3 py-1 rounded-lg text-sm'>
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Product Card 2 */}
            <div className='bg-groceryease-card rounded-xl shadow-md overflow-hidden'>
              <div className='relative h-40 bg-white'>
                <Image
                  src='/images/product-2.svg'
                  alt='Cheddar Cheese'
                  fill
                  style={{ objectFit: 'contain' }}
                  className='p-2'
                />
              </div>
              <div className='p-4'>
                <h3 className='font-medium text-groceryease-text'>Cheddar Cheese</h3>
                <p className='text-sm text-groceryease-textLight'>250g block</p>
                <div className='mt-2 flex justify-between items-center'>
                  <span className='font-bold text-groceryease-text'>₱95.00</span>
                  <button className='bg-groceryease-button text-white px-3 py-1 rounded-lg text-sm'>
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Product Card 3 */}
            <div className='bg-groceryease-card rounded-xl shadow-md overflow-hidden'>
              <div className='relative h-40 bg-white'>
                <Image
                  src='/images/product-3.svg'
                  alt='Pringles Original'
                  fill
                  style={{ objectFit: 'contain' }}
                  className='p-2'
                />
              </div>
              <div className='p-4'>
                <h3 className='font-medium text-groceryease-text'>Pringles Original</h3>
                <p className='text-sm text-groceryease-textLight'>110g can</p>
                <div className='mt-2 flex justify-between items-center'>
                  <span className='font-bold text-groceryease-text'>₱75.00</span>
                  <button className='bg-groceryease-button text-white px-3 py-1 rounded-lg text-sm'>
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Product Card 4 */}
            <div className='bg-groceryease-card rounded-xl shadow-md overflow-hidden'>
              <div className='relative h-40 bg-white'>
                <Image
                  src='/images/product-4.svg'
                  alt='Munchitos Chips'
                  fill
                  style={{ objectFit: 'contain' }}
                  className='p-2'
                />
              </div>
              <div className='p-4'>
                <h3 className='font-medium text-groceryease-text'>Munchitos Chips</h3>
                <p className='text-sm text-groceryease-textLight'>85g pack</p>
                <div className='mt-2 flex justify-between items-center'>
                  <span className='font-bold text-groceryease-text'>₱45.00</span>
                  <button className='bg-groceryease-button text-white px-3 py-1 rounded-lg text-sm'>
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className='py-8'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <h2 className='text-2xl font-bold text-center text-groceryease-text font-heading mb-8'>Why Choose Groceryease?</h2>
          
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {/* Feature 1 */}
            <div className='bg-groceryease-card p-6 rounded-xl shadow-md'>
              <div className='w-12 h-12 bg-peach-200 rounded-full flex items-center justify-center mb-4'>
                <svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6 text-groceryease-accent' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
              </div>
              <h3 className='text-lg font-medium text-groceryease-text mb-2'>Fast Delivery</h3>
              <p className='text-groceryease-textLight'>Get your groceries delivered within hours of placing your order.</p>
            </div>
            
            {/* Feature 2 */}
            <div className='bg-groceryease-card p-6 rounded-xl shadow-md'>
              <div className='w-12 h-12 bg-peach-200 rounded-full flex items-center justify-center mb-4'>
                <svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6 text-groceryease-accent' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
                </svg>
              </div>
              <h3 className='text-lg font-medium text-groceryease-text mb-2'>Group Orders</h3>
              <p className='text-groceryease-textLight'>Create group orders with friends and family to save on delivery fees.</p>
            </div>
            
            {/* Feature 3 */}
            <div className='bg-groceryease-card p-6 rounded-xl shadow-md'>
              <div className='w-12 h-12 bg-peach-200 rounded-full flex items-center justify-center mb-4'>
                <svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6 text-groceryease-accent' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' />
                </svg>
              </div>
              <h3 className='text-lg font-medium text-groceryease-text mb-2'>Club Membership</h3>
              <p className='text-groceryease-textLight'>Join our club for exclusive discounts and priority delivery slots.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className='py-8 my-4'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='bg-peach-200 rounded-xl shadow-md p-8 text-center'>
            <h2 className='text-2xl font-bold mb-4 text-groceryease-text font-heading'>Ready to shop smarter?</h2>
            <p className='text-groceryease-textLight mb-6 max-w-2xl mx-auto'>Join thousands of satisfied customers who enjoy fresh groceries delivered to their door.</p>
            <Link 
              href='/register' 
              className='px-6 py-3 bg-groceryease-button text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium inline-block'
            >
              Create an Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-groceryease-card mt-auto rounded-t-xl shadow-md'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
            <div>
              <h3 className='text-xl font-bold mb-4 text-groceryease-text font-heading'>Groceryease</h3>
              <p className='text-groceryease-textLight'>Fresh groceries delivered to your doorstep.</p>
            </div>
            <div>
              <h4 className='text-lg font-medium mb-4 text-groceryease-text'>Quick Links</h4>
              <ul className='space-y-2'>
                <li><Link href='/' className='text-groceryease-textLight hover:text-groceryease-accent transition-colors'>Home</Link></li>
                <li><Link href='/login' className='text-groceryease-textLight hover:text-groceryease-accent transition-colors'>Sign In</Link></li>
                <li><Link href='/register' className='text-groceryease-textLight hover:text-groceryease-accent transition-colors'>Register</Link></li>
              </ul>
            </div>
            <div>
              <h4 className='text-lg font-medium mb-4 text-groceryease-text'>Categories</h4>
              <ul className='space-y-2'>
                <li><Link href='#' className='text-groceryease-textLight hover:text-groceryease-accent transition-colors'>Fresh Produce</Link></li>
                <li><Link href='#' className='text-groceryease-textLight hover:text-groceryease-accent transition-colors'>Dairy & Eggs</Link></li>
                <li><Link href='#' className='text-groceryease-textLight hover:text-groceryease-accent transition-colors'>Meat & Seafood</Link></li>
                <li><Link href='#' className='text-groceryease-textLight hover:text-groceryease-accent transition-colors'>Pantry Essentials</Link></li>
              </ul>
            </div>
            <div>
              <h4 className='text-lg font-medium mb-4 text-groceryease-text'>Contact Us</h4>
              <p className='text-groceryease-textLight mb-2'>Email: info@groceryease.com</p>
              <p className='text-groceryease-textLight mb-2'>Phone: (123) 456-7890</p>
              <p className='text-groceryease-textLight'>Address: 123 Grocery St, Food City</p>
            </div>
          </div>
          <div className='border-t border-peach-200 mt-8 pt-8 text-center text-groceryease-textLight'>
            <p>&copy; {new Date().getFullYear()} Groceryease. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
