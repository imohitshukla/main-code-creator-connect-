import React, { useState, useEffect } from 'react';

interface SmartAvatarProps {
    src?: string | null;
    type?: 'creator' | 'brand' | 'user';
    name?: string;
    email?: string;
    alt?: string;
    className?: string;
    size?: number;
}

/**
 * Deterministic color from a string — same name always gets same color.
 * Returns a HSL color so it's always readable and vibrant.
 */
function getColorFromString(str: string): { bg: string; text: string } {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return {
        bg: `hsl(${hue}, 55%, 88%)`,
        text: `hsl(${hue}, 45%, 30%)`,
    };
}

/**
 * Extract up to 2 initials from a name or email.
 */
function getInitials(name: string, email: string): string {
    const source = name && name !== 'User' ? name : email.split('@')[0];
    const parts = source.trim().split(/[\s._-]+/).filter(Boolean);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return source.slice(0, 2).toUpperCase();
}

/**
 * SmartAvatar — shows the real uploaded photo if available,
 * otherwise shows a clean initials-based placeholder.
 * NO external fallback services (no pravatar, no UI-avatars).
 */
const SmartAvatar: React.FC<SmartAvatarProps> = ({
    src,
    type = 'creator',
    name = 'User',
    email = '',
    alt = 'Avatar',
    className = '',
}) => {
    const [imgError, setImgError] = useState(false);

    // Reset error state when src changes
    useEffect(() => {
        setImgError(false);
    }, [src]);

    const hasRealImage = src && src.trim() !== '' && !imgError;

    if (hasRealImage) {
        return (
            <div className={`relative overflow-hidden rounded-full bg-gray-200 ${className}`}>
                <img
                    src={src!}
                    alt={alt}
                    onError={() => setImgError(true)}
                    loading="lazy"
                    className="h-full w-full object-cover"
                />
            </div>
        );
    }

    // No real photo — show clean initials placeholder
    const initials = getInitials(name, email);
    const { bg, text } = getColorFromString(name !== 'User' ? name : email);

    return (
        <div
            className={`relative overflow-hidden rounded-full flex items-center justify-center font-semibold select-none ${className}`}
            style={{ backgroundColor: bg, color: text }}
            aria-label={alt}
        >
            <span className="text-[40%] leading-none tracking-wide" style={{ fontSize: 'clamp(10px, 35%, 22px)' }}>
                {initials}
            </span>
        </div>
    );
};

export default SmartAvatar;
