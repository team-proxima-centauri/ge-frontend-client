'use client';

import React from 'react';
import Image from 'next/image';

interface CategoryIconProps {
  category: string;
  className?: string;
}

// Map of category IDs to their Cloudinary image URLs
const CATEGORY_IMAGES: Record<string, string> = {
  'biscuits_cookies': 'https://res.cloudinary.com/dpkfvbpet/image/upload/v1748076279/ChatGPT_Image_May_24_2025_04_41_58_PM_c4nna6.png',
  'condiments_spreads': 'https://res.cloudinary.com/dpkfvbpet/image/upload/v1748076280/ChatGPT_Image_May_24_2025_04_43_01_PM_gv0abz.png',
  'chocolate_candy': 'https://res.cloudinary.com/dpkfvbpet/image/upload/v1748076279/ChatGPT_Image_May_24_2025_04_42_56_PM_xvenay.png',
  'chips_crisps': 'https://res.cloudinary.com/dpkfvbpet/image/upload/v1748076279/ChatGPT_Image_May_24_2025_04_42_48_PM_mqt5yq.png',
  'instant_noodles': 'https://res.cloudinary.com/dpkfvbpet/image/upload/v1748076276/ChatGPT_Image_May_24_2025_04_43_05_PM_wg6qxt.png',
  'milk_dairy_alternatives': 'https://res.cloudinary.com/dpkfvbpet/image/upload/v1748076276/ChatGPT_Image_May_24_2025_04_43_13_PM_miypyd.png',
  'rtd_coffee': 'https://res.cloudinary.com/dpkfvbpet/image/upload/v1748076275/ChatGPT_Image_May_24_2025_04_43_17_PM_zral5u.png',
  'specialty_snacks': 'https://res.cloudinary.com/dpkfvbpet/image/upload/v1748076275/ChatGPT_Image_May_24_2025_04_43_24_PM_pu67b6.png',
  'soda_sparkling': 'https://res.cloudinary.com/dpkfvbpet/image/upload/v1748076275/ChatGPT_Image_May_24_2025_04_43_20_PM_zhkuqd.png',
  'kids_drinks': 'https://res.cloudinary.com/dpkfvbpet/image/upload/v1748076275/ChatGPT_Image_May_24_2025_04_43_09_PM_o0uaey.png'
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({ category, className = 'w-12 h-12' }) => {
  // Get the image URL for the category
  const imageUrl = CATEGORY_IMAGES[category] || '';
  
  if (!imageUrl) {
    // Fallback for categories without images
    return (
      <div className={`${className} bg-accent-green/10 flex items-center justify-center rounded-full`}>
        <span className="text-accent-green font-medium text-lg">
          {category.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  }
  
  // Check if this is a full-width/height display (w-full h-full in className)
  const isFullSize = className.includes('w-full') && className.includes('h-full');
  
  return (
    <div className={`${className} relative`}>
      <Image 
        src={imageUrl}
        alt={`${category.replace('_', ' ')} category`}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className={isFullSize ? 'object-cover' : 'object-contain'}
      />
    </div>
  );
};
