import { useState, useRef, useEffect } from 'react';

/**
 * LazyImage - Optimized image component with:
 * - IntersectionObserver-based lazy loading (no browser intervention)
 * - Multiple URL fallbacks (tries each in order)
 * - Skeleton shimmer while loading
 * - Smooth fade-in on load
 * - Error fallback JSX slot
 * - decoding="async" for performance
 *
 * Props:
 *   src       {string}   - Single URL (standard use)
 *   urls      {string[]} - Array of URLs to try in order (for Drive fallback)
 *   alt       {string}
 *   objectFit {'cover'|'contain'}
 *   padding   {boolean}  - Add inner padding (useful for logos)
 *   className {string}   - Extra classes for the <img>
 *   fallback  {JSX}      - Shown when no src/urls or all fail
 *   rootMargin {string}  - IntersectionObserver rootMargin (default: '200px')
 */
const LazyImage = ({
    src,
    urls,
    alt = '',
    className = '',
    objectFit = 'cover',
    fallback = null,
    padding = false,
    rootMargin = '200px',
}) => {
    // Normalize into a list of URLs to try
    const urlList = urls?.length ? urls : (src ? [src] : []);

    const containerRef = useRef(null);
    const [isInView, setIsInView] = useState(false);
    const [urlIndex, setUrlIndex] = useState(0);
    const [loaded, setLoaded] = useState(false);

    const currentSrc = urlList[urlIndex];
    const allFailed = urlIndex >= urlList.length;
    const showFallback = urlList.length === 0 || allFailed;

    // IntersectionObserver — start loading when card is near viewport
    useEffect(() => {
        const node = containerRef.current;
        if (!node) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect(); // only need to trigger once
                }
            },
            { rootMargin }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [rootMargin]);

    const handleError = () => {
        // Try next URL in the list
        if (urlIndex + 1 < urlList.length) {
            setUrlIndex(i => i + 1);
            setLoaded(false);
        } else {
            setUrlIndex(urlList.length); // triggers allFailed
        }
    };

    return (
        <div ref={containerRef} className="relative w-full h-full overflow-hidden">
            {/* Skeleton shimmer — visible while image hasn't loaded */}
            {!loaded && !showFallback && (
                <div
                    className="absolute inset-0"
                    style={{
                        background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 1.5s infinite',
                    }}
                />
            )}

            {/* Image — only mount once in viewport, no loading="lazy" to avoid browser intervention */}
            {isInView && !showFallback && (
                <img
                    key={currentSrc}        /* remount on URL change */
                    src={currentSrc}
                    alt={alt}
                    decoding="async"
                    onLoad={() => setLoaded(true)}
                    onError={handleError}
                    style={{ transition: 'opacity 0.5s ease' }}
                    className={[
                        'w-full h-full',
                        loaded ? 'opacity-100' : 'opacity-0',
                        objectFit === 'contain' ? 'object-contain' : 'object-cover',
                        padding ? 'p-8' : '',
                        className,
                    ].join(' ')}
                />
            )}

            {/* Fallback slot */}
            {showFallback && (
                <div className="w-full h-full flex items-center justify-center">
                    {fallback}
                </div>
            )}
        </div>
    );
};

export default LazyImage;
