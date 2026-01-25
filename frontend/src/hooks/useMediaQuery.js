import { useState, useEffect } from 'react';

/**
 * Custom hook to detect if screen matches a media query
 * @param {string} query - Media query string (e.g., '(max-width: 768px)')
 * @returns {boolean} - Whether the media query matches
 */
export const useMediaQuery = (query) => {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const media = window.matchMedia(query);

        // Set initial value
        setMatches(media.matches);

        // Create listener
        const listener = (e) => setMatches(e.matches);

        // Modern API
        if (media.addEventListener) {
            media.addEventListener('change', listener);
            return () => media.removeEventListener('change', listener);
        } else {
            // Fallback for older browsers
            media.addListener(listener);
            return () => media.removeListener(listener);
        }
    }, [query]);

    return matches;
};

/**
 * Hook to detect mobile devices (< 768px)
 */
export const useIsMobile = () => {
    return useMediaQuery('(max-width: 768px)');
};

/**
 * Hook to detect tablet devices (768px - 1024px)
 */
export const useIsTablet = () => {
    return useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
};

export default useMediaQuery;
