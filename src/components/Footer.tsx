'use client';

import { Facebook, Instagram, Twitter, Mail, PhoneCall, Heart } from 'lucide-react';
import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className="hidden desktop:block bg-primary text-white mt-12 py-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 desktop:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="col-span-1">
            <h2 className="text-xl font-semibold mb-4">GroceryEase</h2>
            <p className="text-sm text-secondary-light mb-4">
              Your one-stop solution for grocery delivery with individual 
              and group shopping options.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-white hover:text-secondary focus:outline-none focus:ring-2 focus:ring-secondary rounded-full p-1 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="text-white hover:text-secondary focus:outline-none focus:ring-2 focus:ring-secondary rounded-full p-1 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="text-white hover:text-secondary focus:outline-none focus:ring-2 focus:ring-secondary rounded-full p-1 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-secondary-light hover:text-white hover:underline transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-secondary-light hover:text-white hover:underline transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/group-order" className="text-secondary-light hover:text-white hover:underline transition-colors">
                  Group Order
                </Link>
              </li>
              <li>
                <Link href="/club" className="text-secondary-light hover:text-white hover:underline transition-colors">
                  Club Member
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="col-span-1">
            <h3 className="font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products?category=fruits" className="text-secondary-light hover:text-white hover:underline transition-colors">
                  Fruits & Vegetables
                </Link>
              </li>
              <li>
                <Link href="/products?category=dairy" className="text-secondary-light hover:text-white hover:underline transition-colors">
                  Dairy & Eggs
                </Link>
              </li>
              <li>
                <Link href="/products?category=meat" className="text-secondary-light hover:text-white hover:underline transition-colors">
                  Meat & Seafood
                </Link>
              </li>
              <li>
                <Link href="/products?category=pantry" className="text-secondary-light hover:text-white hover:underline transition-colors">
                  Pantry Staples
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-1">
            <h3 className="font-semibold mb-4">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center text-secondary-light">
                <Mail className="w-5 h-5 mr-2" />
                <span>contact@groceryease.com</span>
              </div>
              <div className="flex items-center text-secondary-light">
                <PhoneCall className="w-5 h-5 mr-2" />
                <span>+1 (555) 123-4567</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="border-t border-primary-light mt-8 pt-6 flex flex-col desktop:flex-row justify-between items-center">
          <p className="text-sm text-secondary-light">
            &copy; {new Date().getFullYear()} GroceryEase. All rights reserved.
          </p>
          
        </div>
      </div>
    </footer>
  );
};
