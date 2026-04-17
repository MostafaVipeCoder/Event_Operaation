import React, { useState, useEffect, useRef } from 'react';

/**
 * ExpandableText Component
 * Handles multi-line text truncation with a Read More/Less toggle.
 */
const ExpandableText = ({ 
    text, 
    lines = 4, 
    lang = 'en', 
    color = '#1a27c9', 
    className = "", 
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const textRef = useRef(null);

    const labels = {
        en: { more: 'Read More', less: 'Read Less' },
        ar: { more: 'اقرأ المزيد', less: 'عرض أقل' }
    };

    const isRtl = lang === 'ar';
    const t = labels[lang] || labels.en;

    // Calculate max-height based on line-height and number of lines
    // leading-relaxed = 1.625, base font-size ≈ 1rem = 16px
    const lineHeightEm = 1.625;
    const collapsedMaxHeight = `${lines * lineHeightEm}em`;

    useEffect(() => {
        const checkTruncation = () => {
            if (textRef.current) {
                const truncated = textRef.current.scrollHeight > textRef.current.clientHeight + 2;
                setHasMore(truncated);
            }
        };

        // Small delay to ensure layout is complete
        const timer = setTimeout(checkTruncation, 50);
        window.addEventListener('resize', checkTruncation);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', checkTruncation);
        };
    }, [text, lines, isExpanded]);

    if (!text) return null;

    return (
        <div className={`flex flex-col items-start ${className}`} dir={isRtl ? 'rtl' : 'ltr'}>
            <p
                ref={textRef}
                className="transition-all duration-500 overflow-hidden leading-relaxed w-full"
                style={{
                    maxHeight: isExpanded ? '1000px' : collapsedMaxHeight,
                    WebkitLineClamp: isExpanded ? 'unset' : lines,
                    display: '-webkit-box',
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                }}
            >
                {text}
            </p>
            
            {(hasMore || isExpanded) && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(!isExpanded);
                    }}
                    className="mt-1 text-[10px] font-black uppercase tracking-widest hover:opacity-70 transition-all z-20 relative"
                    style={{ color: color }}
                >
                    {isExpanded ? t.less : t.more}
                </button>
            )}
        </div>
    );
};

export default ExpandableText;
