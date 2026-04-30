import { useState, useRef, useEffect, useMemo } from 'react';

/**
 * LazyImage - Optimized image component with:
 * - Smart Auto-Healing: Caches successful URLs to avoid re-testing broken links
 * - IntersectionObserver-based lazy loading
 * - Multiple URL fallbacks
 * - Skeleton shimmer while loading
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
    priority = false, // If true, load instantly and set high priority
    asBackground = false, // If true, render as a background image on a div
}) => {
    const containerRef = useRef(null);
    
    // Normalize into a list of URLs to try
    const baseUrls = urls?.length ? urls : (src ? [src] : []);
    const primaryKey = baseUrls[0] || 'empty';
    
    // Auto-healing cache: get a known-working URL if we successfully loaded this image before
    const urlsToTry = useMemo(() => {
        if (!baseUrls.length) return [];
        try {
            const cachedWorkingUrl = localStorage.getItem(`WorkingImg_${primaryKey}`);
            if (cachedWorkingUrl) {
                // If we have a cached working URL, put it first, then list the rest (removing duplicates)
                return [cachedWorkingUrl, ...baseUrls.filter(u => u !== cachedWorkingUrl)];
            }
        } catch (e) { /* ignore localStorage errors */ }
        
        return baseUrls;
    }, [baseUrls, primaryKey]);

    const [isInView, setIsInView] = useState(priority);
    const [urlIndex, setUrlIndex] = useState(0);
    const [loaded, setLoaded] = useState(false);
    const [prevUrls, setPrevUrls] = useState(urlsToTry);

    // Reset state if underlying URLs change
    if (prevUrls !== urlsToTry) {
        setPrevUrls(urlsToTry);
        setUrlIndex(0);
        setLoaded(false);
    }

    const currentSrc = urlsToTry[urlIndex];
    const allFailed = urlIndex >= urlsToTry.length;
    const showFallback = urlsToTry.length === 0 || allFailed;

    // IntersectionObserver — start loading when card is near viewport
    useEffect(() => {
        // If priority is true, we don't need the observer
        if (priority) return;

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
    }, [rootMargin, priority]);

    const handleError = () => {
        // Only log warning for the first failure, then just log fallbacks to avoid console spam
        if (urlIndex === 0) {
            console.warn(`❌ Image Load Failed [${alt || 'Unknown'}]:`, currentSrc);
        }
        
        // If this URL was previously cached as "working", evict it from cache because it's now failing
        try {
            const cachedUrl = localStorage.getItem(`WorkingImg_${primaryKey}`);
            if (cachedUrl === currentSrc) {
                console.log(`🧹 Evicting stale URL from cache for [${alt || 'Unknown'}]`);
                localStorage.removeItem(`WorkingImg_${primaryKey}`);
            }
        } catch (_e) { /* ignore localStorage errors */ }

        if (urlIndex + 1 < urlsToTry.length) {
            // Log fallback attempt
            console.log(`🔄 [${alt || 'Unknown'}] Trying Fallback #${urlIndex + 2}/${urlsToTry.length}`);
            setUrlIndex(i => i + 1);
            setLoaded(false);
        } else {
            console.error(`🚨 ALL ${urlsToTry.length} image fallbacks failed for [${alt || 'Unknown'}]`);
            setUrlIndex(urlsToTry.length); // triggers allFailed
        }
    };
    
    const handleSuccess = () => {
        setLoaded(true);
        // Save to cache so we don't have to fallback sequentially next time!
        try {
            localStorage.setItem(`WorkingImg_${primaryKey}`, currentSrc);
            if (urlIndex > 0) {
               console.log(`✅ Image Auto-Healed [${alt || 'Unknown'}]! Successfully loaded on fallback #${urlIndex + 1}:`, currentSrc);
            }
        } catch (_e) { /* ignore localStorage errors */ }
    };

    return (
        <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
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
                <>
                    {asBackground ? (
                        <div
                            key={currentSrc}
                            style={{ 
                                backgroundImage: `url("${currentSrc}")`,
                                backgroundSize: objectFit === 'contain' ? 'contain' : 'cover',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat',
                                transition: 'opacity 0.2s ease',
                            }}
                            className={`w-full h-full ${loaded ? 'opacity-100' : 'opacity-0'}`}
                        >
                            {/* Hidden image to trigger load/error events for background mode */}
                            <img
                                src={currentSrc}
                                alt=""
                                className="hidden"
                                onLoad={handleSuccess}
                                onError={handleError}
                            />
                        </div>
                    ) : (
                        <img
                            key={currentSrc}        /* remount on URL change */
                            src={currentSrc}
                            alt={alt}
                            decoding="async"
                            fetchPriority={priority ? "high" : "auto"}
                            onLoad={handleSuccess}
                            onError={handleError}
                            style={{ transition: 'opacity 0.2s ease' }} // Faster fade-in for less layout shift delay
                            className={[
                                'w-full h-full',
                                loaded ? 'opacity-100' : 'opacity-0',
                                objectFit === 'contain' ? 'object-contain' : 'object-cover',
                                padding ? 'p-8' : '',
                            ].join(' ')}
                        />
                    )}
                </>
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
