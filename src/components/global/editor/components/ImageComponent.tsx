import Image from "next/image";
import React, { useState, useEffect } from "react";
import UploadImage from "./UploadImage";
import { processImageUrl, getFallbackImageUrl, isExpiredImageUrl } from "@/lib/utils";
import { Upload, X, CheckCircle, AlertCircle } from "lucide-react";

type Props = {
  src: string;
  alt: string;
  className?: string;
  isPreview?: boolean;
  contentId: string;
  onContentChange: (
    contentId: string,
    newContent: string | string[] | string[][]
  ) => void;
  isEditable?: boolean;
};

const CustomImage = ({
  src,
  alt,
  className,
  isPreview = false,
  contentId,
  onContentChange,
  isEditable = true,
}: Props) => {
  const [imageSrc, setImageSrc] = useState(() => {
    // Check if the original URL is expired and replace it immediately
    if (isExpiredImageUrl(src)) {
      console.log('🔄 Auto-replacing expired image URL with fallback');
      return getFallbackImageUrl(src);
    }
    return processImageUrl(src);
  });
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Upload state management
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Update imageSrc when src prop changes
  useEffect(() => {
    if (isExpiredImageUrl(src)) {
      console.log('🔄 Auto-replacing expired image URL with fallback');
      setImageSrc(getFallbackImageUrl(src));
    } else {
      setImageSrc(processImageUrl(src));
    }
    setImageError(false);
    setIsLoading(true);
  }, [src]);

  const handleImageError = () => {
    if (!imageError) {
      console.warn('Image failed to load, trying fallback URL:', src);
      setImageError(true);
      const fallbackUrl = getFallbackImageUrl(src);
      setImageSrc(fallbackUrl);
    } else {
      console.error('Both original and fallback image URLs failed:', src);
      setIsLoading(false);
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  // Upload handler functions
  const handleUploadStart = () => {
    console.log('🚀 Starting upload...');
    setIsUploading(true);
    setShowUploadDialog(true);
    setUploadError(null);
    setUploadProgress(0);
    setUploadSuccess(false);

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 85) {
          clearInterval(progressInterval);
          return 85;
        }
        return prev + Math.random() * 10;
      });
    }, 300);
  };

  const handleUploadComplete = (newImageUrl: string) => {
    console.log('✅ Upload completed');
    setUploadProgress(100);
    setUploadSuccess(true);

    setTimeout(() => {
      setIsUploading(false);
      setShowUploadDialog(false);
      setUploadSuccess(false);
      setUploadProgress(0);
      
      // Update the image source to show the new uploaded image
      const processedUrl = processImageUrl(newImageUrl);
      setImageSrc(processedUrl);
      setImageError(false);
      setIsLoading(true);
      
      // Also update the slide content
      onContentChange(contentId, newImageUrl);
    }, 2000);
  };

  // Real Uploadcare upload function
  const uploadToUploadcare = async (file: File) => {
    const uploadcareKey = process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY || process.env.UPLOADCARE_PUBLIC_KEY;
    
    if (!uploadcareKey) {
      handleUploadError('Uploadcare configuration error');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('UPLOADCARE_PUB_KEY', uploadcareKey);
      
      const response = await fetch('https://upload.uploadcare.com/base/', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        const cdnUrl = `https://ucarecdn.com/${data.file}/`;
        console.log('🖼️ Uploadcare upload successful:', cdnUrl);
        handleUploadComplete(cdnUrl);
      } else {
        const errorText = await response.text();
        console.error('Uploadcare API error:', errorText);
        throw new Error(`Upload failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      handleUploadError('Failed to upload image. Please try again.');
    }
  };

  const handleUploadError = (error: string) => {
    console.error('❌ Upload error:', error);
    setUploadError(error);
    setIsUploading(false);
    setShowUploadDialog(false);
    setUploadProgress(0);
  };

  return (
    <div className="relative group w-full h-full rounded-lg">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
          <div className="text-gray-500 text-sm">Loading image...</div>
        </div>
      )}
      
      <Image
        src={imageSrc}
        width={isPreview ? 48 : 800}
        height={isPreview ? 48 : 800}
        alt={alt}
        className={`object-cover w-full h-full rounded-lg ${className} ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        unoptimized={imageSrc.includes('uploadcare') || imageSrc.includes('ucarecdn.com')} // Disable Next.js optimization for Uploadcare URLs
      />
      
      {imageError && !isLoading && (
        <div className="absolute inset-0 bg-red-50 border border-red-200 rounded-lg flex flex-col items-center justify-center">
          <div className="text-red-500 text-sm text-center p-4">
            {isExpiredImageUrl(src) ? (
              <div>
                <div className="font-semibold mb-2">Image Expired</div>
                <div className="text-xs mb-3">This AI-generated image has expired. Please upload a new one.</div>
              </div>
            ) : (
              <div>
                <div className="font-semibold mb-2">Image Failed to Load</div>
                <div className="text-xs mb-3">Please upload a new image to replace this one.</div>
              </div>
            )}
            {isEditable && (
              <div className="mt-4">
                <div
                  onClick={() => {
                    const fileInput = document.createElement('input');
                    fileInput.type = 'file';
                    fileInput.accept = 'image/*';
                    fileInput.style.display = 'none';
                    
                    fileInput.onchange = (e) => {
                      const target = e.target as HTMLInputElement;
                      if (target.files && target.files[0]) {
                        handleUploadStart();
                        // Upload to Uploadcare
                        uploadToUploadcare(target.files[0]);
                      }
                    };
                    
                    document.body.appendChild(fileInput);
                    fileInput.click();
                    document.body.removeChild(fileInput);
                  }}
                  className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 flex flex-col items-center justify-center cursor-pointer group"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-200">
                    <Upload className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-xs text-gray-600 font-medium">
                    Drop your image here, or <span className="text-blue-500 hover:text-blue-600">browse</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {!isPreview && isEditable && !imageError && (
        <div className="absolute inset-0 hidden group-hover:flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-lg">
          <button
            onClick={() => {
              const fileInput = document.createElement('input');
              fileInput.type = 'file';
              fileInput.accept = 'image/*';
              fileInput.style.display = 'none';
              
              fileInput.onchange = (e) => {
                const target = e.target as HTMLInputElement;
                if (target.files && target.files[0]) {
                  handleUploadStart();
                  // Upload to Uploadcare
                  uploadToUploadcare(target.files[0]);
                }
              };
              
              document.body.appendChild(fileInput);
              fileInput.click();
              document.body.removeChild(fileInput);
            }}
            className="w-12 h-12 bg-gradient-to-r from-[#F55C7A] to-[#F6BC66] backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border border-white/50 hover:scale-110 transition-all duration-200"
          >
            <Upload className="h-6 w-6 text-white" />
          </button>
        </div>
      )}

      {/* Compact Upload Progress Dialog */}
      {showUploadDialog && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20 rounded-lg">
          <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 max-w-xs w-full mx-4 shadow-xl border border-gray-100">
            <div className="text-center space-y-4">
              {/* Large Visible Spinning Circle */}
              <div className="w-16 h-16 mx-auto rounded-full animate-spin bg-white" style={{
                background: 'linear-gradient(white, white) padding-box, linear-gradient(to right, #F55C7A, #F6BC66) border-box',
                border: '4px solid transparent'
              }}></div>
              
              {/* Compact Title */}
              <div>
                <h3 className="text-sm font-medium bg-gradient-to-r from-[#F55C7A] to-[#F6BC66] bg-clip-text text-transparent">
                  {uploadSuccess ? 'Done!' : 'Uploading...'}
                </h3>
              </div>
              
              {/* Status Icon */}
              <div className="flex items-center justify-center">
                {uploadSuccess ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : uploadError ? (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                ) : (
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{
                    background: 'linear-gradient(180deg, #F55C7A 0%, #F6BC66 100%)'
                  }}></div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomImage;