// src/components/ExpandableText.jsx
import React, { useState, useEffect, useRef } from "react";
import { jsxDEV } from "react/jsx-dev-runtime";
var ExpandableText = ({
  text,
  lines = 4,
  lang = "en",
  color = "#1a27c9",
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const textRef = useRef(null);
  const labels = {
    en: { more: "Read More", less: "Read Less" },
    ar: { more: "اقرأ المزيد", less: "عرض أقل" }
  };
  const isRtl = lang === "ar";
  const t = labels[lang] || labels.en;
  const lineHeightEm = 1.625;
  const collapsedMaxHeight = `${lines * lineHeightEm}em`;
  useEffect(() => {
    const checkTruncation = () => {
      if (textRef.current) {
        const truncated = textRef.current.scrollHeight > textRef.current.clientHeight + 2;
        setHasMore(truncated);
      }
    };
    const timer = setTimeout(checkTruncation, 50);
    window.addEventListener("resize", checkTruncation);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", checkTruncation);
    };
  }, [text, lines, isExpanded]);
  if (!text)
    return null;
  return /* @__PURE__ */ jsxDEV("div", {
    className: `flex flex-col items-start ${className}`,
    dir: isRtl ? "rtl" : "ltr",
    children: [
      /* @__PURE__ */ jsxDEV("p", {
        ref: textRef,
        className: "transition-all duration-500 overflow-hidden leading-relaxed w-full",
        style: {
          maxHeight: isExpanded ? "1000px" : collapsedMaxHeight,
          WebkitLineClamp: isExpanded ? "unset" : lines,
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          overflow: "hidden"
        },
        children: text
      }, undefined, false, undefined, this),
      (hasMore || isExpanded) && /* @__PURE__ */ jsxDEV("button", {
        onClick: (e) => {
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        },
        className: "mt-1 text-[10px] font-black uppercase tracking-widest hover:opacity-70 transition-all z-20 relative",
        style: { color },
        children: isExpanded ? t.less : t.more
      }, undefined, false, undefined, this)
    ]
  }, undefined, true, undefined, this);
};
var ExpandableText_default = ExpandableText;
export {
  ExpandableText_default as default
};
