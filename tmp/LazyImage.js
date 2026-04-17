// src/components/LazyImage.jsx
import { useState, useRef, useEffect } from "react";
import { jsxDEV } from "react/jsx-dev-runtime";
var LazyImage = ({
  src,
  urls,
  alt = "",
  className = "",
  objectFit = "cover",
  fallback = null,
  padding = false,
  rootMargin = "200px"
}) => {
  const urlList = urls?.length ? urls : src ? [src] : [];
  const containerRef = useRef(null);
  const [isInView, setIsInView] = useState(false);
  const [urlIndex, setUrlIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const currentSrc = urlList[urlIndex];
  const allFailed = urlIndex >= urlList.length;
  const showFallback = urlList.length === 0 || allFailed;
  useEffect(() => {
    const node = containerRef.current;
    if (!node)
      return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        observer.disconnect();
      }
    }, { rootMargin });
    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin]);
  const handleError = () => {
    if (urlIndex + 1 < urlList.length) {
      setUrlIndex((i) => i + 1);
      setLoaded(false);
    } else {
      setUrlIndex(urlList.length);
    }
  };
  return /* @__PURE__ */ jsxDEV("div", {
    ref: containerRef,
    className: "relative w-full h-full overflow-hidden",
    children: [
      !loaded && !showFallback && /* @__PURE__ */ jsxDEV("div", {
        className: "absolute inset-0",
        style: {
          background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s infinite"
        }
      }, undefined, false, undefined, this),
      isInView && !showFallback && /* @__PURE__ */ jsxDEV("img", {
        src: currentSrc,
        alt,
        decoding: "async",
        onLoad: () => setLoaded(true),
        onError: handleError,
        style: { transition: "opacity 0.5s ease" },
        className: [
          "w-full h-full",
          loaded ? "opacity-100" : "opacity-0",
          objectFit === "contain" ? "object-contain" : "object-cover",
          padding ? "p-8" : "",
          className
        ].join(" ")
      }, currentSrc, false, undefined, this),
      showFallback && /* @__PURE__ */ jsxDEV("div", {
        className: "w-full h-full flex items-center justify-center",
        children: fallback
      }, undefined, false, undefined, this)
    ]
  }, undefined, true, undefined, this);
};
var LazyImage_default = LazyImage;
export {
  LazyImage_default as default
};
