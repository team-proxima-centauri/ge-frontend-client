import LoginForm from '@/components/auth/LoginForm';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Login form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-block">
              <h1 className="text-3xl font-bold text-groceryease-text font-heading">Groceryease</h1>
              <p className="text-gray-600 mt-1">Grocery Delivery</p>
            </Link>
          </div>
          
          <LoginForm />
        </div>
      </div>
      
      {/* Right side - Image/Illustration */}
      <div className="hidden md:flex md:w-1/2 bg-blue-600 items-center justify-center p-8">
        <div className="max-w-md text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Fresh groceries delivered to your doorstep
          </h2>
          <div className="relative w-full h-64 md:h-80">
            <Image
              src="/grocery-illustration.svg" 
              alt="Grocery Delivery Illustration"
              fill
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
          <p className="text-blue-100 mt-6">
            Shop from a wide selection of fresh produce, pantry essentials, and household items.
          </p>
        </div>
      </div>
    </div>
  );
}
