import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to process image URLs
export function processImageUrl(url: string): string {
  if (!url) return url;
  
  try {
    // Check if it's an expired OpenAI/DALL-E URL
    if (url.includes('oaidalleapiprodscus.blob.core.windows.net')) {
      console.log('🔄 Detected expired OpenAI/DALL-E URL, using professional fallback');
      return PROFESSIONAL_FALLBACK_IMAGES[Math.floor(Math.random() * PROFESSIONAL_FALLBACK_IMAGES.length)];
    }
    
    // Check if it's a valid Uploadcare URL (not a mock URL)
    if ((url.includes('ucarecdn.com') || url.includes('uploadcare')) && !url.includes('mock-')) {
      // Remove any query parameters that might cause 403 errors
      let cleanUrl = url.split('?')[0];
      
      // If it's already a processed Uploadcare URL, return as is
      if (cleanUrl.includes('-/preview/')) {
        return cleanUrl;
      }
      
      // Add image optimization parameters to prevent 403 errors
      return `${cleanUrl}-/preview/-/quality/lightest/-/format/webp/`;
    }
    
    // For other URLs (like Unsplash), return as is without modifications
    return url;
  } catch (error) {
    console.error('Error processing image URL:', error);
    return url;
  }
}

// Function to validate if an image URL is accessible
export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Image URL validation failed:', error);
    return false;
  }
}

// Professional fallback images for when other images fail
const PROFESSIONAL_FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=2074&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=2126&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
];

// Function to get a fallback image URL if the original fails
export function getFallbackImageUrl(originalUrl: string): string {
  // Check if it's an expired OpenAI/DALL-E URL
  if (originalUrl.includes('oaidalleapiprodscus.blob.core.windows.net')) {
    console.log('🔄 Detected expired OpenAI/DALL-E URL, using professional fallback');
    return PROFESSIONAL_FALLBACK_IMAGES[Math.floor(Math.random() * PROFESSIONAL_FALLBACK_IMAGES.length)];
  }
  
  // For mock Uploadcare URLs, use a real fallback image
  if (originalUrl.includes('mock-')) {
    console.log('🔄 Detected mock URL, using professional fallback');
    return PROFESSIONAL_FALLBACK_IMAGES[Math.floor(Math.random() * PROFESSIONAL_FALLBACK_IMAGES.length)];
  }
  
  // For Uploadcare URLs, try different optimization parameters
  if (originalUrl.includes('ucarecdn.com') || originalUrl.includes('uploadcare')) {
    const cleanUrl = originalUrl.split('?')[0];
    return `${cleanUrl}-/preview/`;
  }
  
  // For other URLs, return as is
  return originalUrl;
}

// Function to check if an image URL is expired or invalid
export function isExpiredImageUrl(url: string): boolean {
  return url.includes('oaidalleapiprodscus.blob.core.windows.net') || url.includes('mock-');
}

export const timeAgo = (timestamp: string) => {
  const now = new Date();
  const diffInSeconds = Math.floor(
    (now.getTime() - new Date(timestamp).getTime()) / 1000
  );

  const intervals = [
    { label: "year", value: 60 * 60 * 24 * 365 },
    { label: "month", value: 60 * 60 * 24 * 30 },
    { label: "days", value: 60 * 60 * 24 },
    { label: "hours", value: 60 * 60 },
    { label: "mins", value: 60 },
    { label: "sec", value: 1 },
  ];

  for (let i = 0; i < intervals.length; i++) {
    const interval = intervals[i];
    const count = Math.floor(diffInSeconds / interval.value);
    if (count >= 1) {
      return `${count} ${interval.label} ago`;
    }
  }
  return 'just Now'
};