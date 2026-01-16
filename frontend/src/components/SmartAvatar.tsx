
import React, { useState, useEffect } from 'react';

interface SmartAvatarProps {
    src?: string | null;
    type?: 'creator' | 'brand' | 'user'; // 'user' as a generic fallback
    name?: string;
    email?: string;
    alt?: string;
    className?: string;
    size?: number; // Optional size for DiceBear/Pravatar url requests if needed
}

const SmartAvatar: React.FC<SmartAvatarProps> = ({
    src,
    type = 'creator',
    name = 'User',
    email = '', // Default to empty string to avoid undefined issues
    alt = 'Avatar',
    className = '',
}) => {
    const [imgSrc, setImgSrc] = useState<string>('');
    const [isLoaded, setIsLoaded] = useState(false);
    const [loadError, setLoadError] = useState(false);

    useEffect(() => {
        // Reset state when props change
        setLoadError(false);
        setIsLoaded(false);

        if (src) {
            setImgSrc(src);
        } else {
            // Generate fallback immediately if no src provided
            setImgSrc(getFallbackUrl());
        }
    }, [src, type, name, email]);

    const getFallbackUrl = () => {
        if (type === 'brand') {
            // UI Avatars for Brands - Black & White, Corporate look
            const encodedName = encodeURIComponent(name);
            return `https://ui-avatars.com/api/?name=${encodedName}&background=000000&color=ffffff&bold=true&uppercase=true&size=128`;
        } else {
            // Pravatar/DiceBear for Creators - Realistic faces
            // Using Pravatar with email hash or unique identifier if possible
            // Since Pravatar uses 'u' param for unique identifier, we can use email or name
            const uniqueId = email || name || 'default';
            return `https://i.pravatar.cc/300?u=${encodeURIComponent(uniqueId)}`;
        }
    };

    const handleError = () => {
        if (!loadError) {
            setLoadError(true);
            setImgSrc(getFallbackUrl());
        }
    };

    const handleLoad = () => {
        setIsLoaded(true);
    };

    return (
        <div className={`relative overflow-hidden rounded-full bg-gray-200 ${className}`}>
            <img
                src={imgSrc}
                alt={alt}
                onError={handleError}
                onLoad={handleLoad}
                loading="lazy"
                className={`h-full w-full object-cover transition-opacity duration-500 ease-in-out ${isLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
            />
            {!isLoaded && (
                // Skeleton / Placeholder while loading
                <div className="absolute inset-0 animate-pulse bg-gray-300" />
            )}
        </div>
    );
};

export default SmartAvatar;
