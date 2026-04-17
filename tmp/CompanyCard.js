// src/components/CompanyCard.jsx
import { MapPin, Users, Plus, Banknote, Briefcase, Pencil, Trash2, ExternalLink, Globe, Linkedin, Facebook, Twitter, Instagram, Youtube, Github, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useSearchParams } from "react-router-dom";
import { getGoogleDriveFallbackUrls } from "../lib/utils";
import LazyImage from "./LazyImage";
import ExpandableText from "./ExpandableText";
import { jsxDEV, Fragment } from "react/jsx-dev-runtime";
var LinkIcon = ({ type, ...props }) => {
  switch (type) {
    case "linkedin":
      return /* @__PURE__ */ jsxDEV(Linkedin, {
        ...props
      }, undefined, false, undefined, this);
    case "facebook":
      return /* @__PURE__ */ jsxDEV(Facebook, {
        ...props
      }, undefined, false, undefined, this);
    case "twitter":
      return /* @__PURE__ */ jsxDEV(Twitter, {
        ...props
      }, undefined, false, undefined, this);
    case "instagram":
      return /* @__PURE__ */ jsxDEV(Instagram, {
        ...props
      }, undefined, false, undefined, this);
    case "youtube":
      return /* @__PURE__ */ jsxDEV(Youtube, {
        ...props
      }, undefined, false, undefined, this);
    case "github":
      return /* @__PURE__ */ jsxDEV(Github, {
        ...props
      }, undefined, false, undefined, this);
    case "globe":
      return /* @__PURE__ */ jsxDEV(Globe, {
        ...props
      }, undefined, false, undefined, this);
    default:
      return /* @__PURE__ */ jsxDEV(ExternalLink, {
        ...props
      }, undefined, false, undefined, this);
  }
};
var CompanyCard = ({ company, config, customColor = "#1a27c9", viewMode = "grid", onEdit, onDelete, previewMode = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: company.company_id || company.id,
    disabled: previewMode
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.5 : 1
  };
  const getLightColor = (hex, opacity = "1a") => `${hex}${opacity}`;
  const [searchParams] = useSearchParams();
  const lang = searchParams.get("lang") === "ar" ? "ar" : "en";
  const isRtl = lang === "ar";
  const translations = {
    en: {
      sector: "Sector",
      location: "Location",
      identity: "Identity",
      stage: "Stage",
      Links: "Links",
      growth: "Growth",
      strategic: "Strategic Builder",
      link: "Link",
      notSpecified: "Not Specified"
    },
    ar: {
      sector: "القطاع",
      location: "الموقع",
      identity: "الهوية",
      stage: "المرحلة",
      Links: "روابط",
      growth: "نمو",
      strategic: "بناء استراتيجي",
      link: "رابط",
      notSpecified: "غير محدد"
    }
  };
  const t = translations[lang];
  const name = company.startup_name || company.name || "Unknown Builder";
  const logo = company.logo_url || company.logoUrl;
  const industry = company.industry || company.sector || "Ecosystem";
  const location = company.location || company.governorate || "Global";
  const governorate = company.governorate || company.location || "";
  const founder = company.founder || "";
  const role = company.role || "";
  const description = company.description || company.bio || "";
  const stage = company.stage ? company.stage.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "";
  const links = (() => {
    let parsedLinks = company.links;
    if (typeof parsedLinks === "string") {
      try {
        parsedLinks = JSON.parse(parsedLinks);
      } catch (e) {
        parsedLinks = [];
      }
    }
    if (Array.isArray(parsedLinks) && parsedLinks.length > 0)
      return parsedLinks;
    if (company.website_url)
      return [{ label: "Website", url: company.website_url, icon: "globe" }];
    return [];
  })();
  const displayConfig = (() => {
    if (config && Array.isArray(config)) {
      return {
        show_logo: config.find((f) => f.field_name === "logo_url")?.show_in_card !== false,
        show_name: config.find((f) => f.field_name === "startup_name")?.show_in_card !== false,
        show_industry: config.find((f) => f.field_name === "industry")?.show_in_card !== false,
        show_location: config.find((f) => f.field_name === "location")?.show_in_card !== false,
        show_description: config.find((f) => f.field_name === "description")?.show_in_card !== false,
        show_founder: config.find((f) => f.field_name === "founder_name")?.show_in_card !== false,
        show_role: config.find((f) => f.field_name === "founder_role")?.show_in_card !== false,
        show_stage: config.find((f) => f.field_name === "startup_stage")?.show_in_card !== false,
        show_links: config.find((f) => f.field_name === "website_url")?.show_in_card !== false
      };
    }
    let legacyConfig = company.display_config;
    if (typeof legacyConfig === "string") {
      try {
        legacyConfig = JSON.parse(legacyConfig);
      } catch (e) {
        legacyConfig = {};
      }
    }
    return {
      show_logo: legacyConfig?.show_photo !== false,
      show_name: true,
      show_founder: legacyConfig?.show_founder !== false,
      show_role: legacyConfig?.show_role !== false,
      show_stage: legacyConfig?.show_stage !== false,
      show_governorate: legacyConfig?.show_governorate !== false,
      show_industry: legacyConfig?.show_industry !== false,
      show_description: legacyConfig?.show_description !== false,
      show_links: legacyConfig?.show_links !== false
    };
  })();
  const showLocation = displayConfig.show_location || displayConfig.show_governorate;
  if (viewMode === "list") {
    return /* @__PURE__ */ jsxDEV("div", {
      ref: setNodeRef,
      style,
      className: `group relative w-full bg-slate-50 rounded-[4rem] border border-slate-100 p-12 md:p-16 shadow-sm hover:shadow-2xl transition-all duration-700 flex flex-col md:flex-row gap-12 md:gap-20 overflow-hidden ring-1 ring-slate-100/50 items-center md:items-start text-center md:text-start ${isRtl ? "font-arabic" : "font-manrope"}`,
      dir: isRtl ? "rtl" : "ltr",
      children: [
        !previewMode && /* @__PURE__ */ jsxDEV("div", {
          ...attributes,
          ...listeners,
          className: "absolute top-8 left-8 cursor-grab active:cursor-grabbing p-2 text-slate-300 hover:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity z-30",
          children: /* @__PURE__ */ jsxDEV(GripVertical, {
            size: 24
          }, undefined, false, undefined, this)
        }, undefined, false, undefined, this),
        /* @__PURE__ */ jsxDEV("div", {
          className: "absolute top-0 end-0 w-[500px] h-[500px] rounded-full opacity-[0.04] blur-[100px] -me-32 -mt-32 pointer-events-none transition-transform duration-1000 group-hover:scale-110",
          style: { backgroundColor: customColor }
        }, undefined, false, undefined, this),
        /* @__PURE__ */ jsxDEV("div", {
          className: "relative shrink-0",
          children: [
            /* @__PURE__ */ jsxDEV("div", {
              className: "absolute inset-2 rounded-[2rem] blur-xl opacity-30 transition-opacity group-hover:opacity-50",
              style: { backgroundColor: customColor }
            }, undefined, false, undefined, this),
            /* @__PURE__ */ jsxDEV("div", {
              className: "relative w-[124px] h-[124px] rounded-[2rem] overflow-hidden border-4 border-white shadow-xl bg-white flex items-center justify-center transition-all duration-700 group-hover:scale-105",
              children: displayConfig.show_logo ? /* @__PURE__ */ jsxDEV(LazyImage, {
                src: logo ? getGoogleDriveFallbackUrls(logo)[0] : null,
                urls: logo ? getGoogleDriveFallbackUrls(logo) : [],
                alt: name,
                objectFit: "contain",
                padding: true,
                className: "grayscale-[0.2] group-hover:grayscale-0 transition-all",
                fallback: /* @__PURE__ */ jsxDEV("span", {
                  className: "text-8xl font-black opacity-20",
                  style: { color: customColor },
                  children: name.charAt(0)
                }, undefined, false, undefined, this)
              }, undefined, false, undefined, this) : /* @__PURE__ */ jsxDEV("span", {
                className: "text-8xl font-black opacity-20",
                style: { color: customColor },
                children: name.charAt(0)
              }, undefined, false, undefined, this)
            }, undefined, false, undefined, this)
          ]
        }, undefined, true, undefined, this),
        /* @__PURE__ */ jsxDEV("div", {
          className: "flex-1 z-10 py-4",
          children: [
            /* @__PURE__ */ jsxDEV("div", {
              className: "flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8",
              children: /* @__PURE__ */ jsxDEV("div", {
                children: [
                  /* @__PURE__ */ jsxDEV("h3", {
                    className: "text-6xl md:text-8xl font-black text-[#0d0e0e] tracking-tighter mb-4 leading-[0.85] group-hover:text-[#1a27c9] transition-colors duration-500 uppercase",
                    children: name
                  }, undefined, false, undefined, this),
                  /* @__PURE__ */ jsxDEV("div", {
                    className: "flex flex-wrap gap-4 items-center justify-center md:justify-start",
                    children: [
                      displayConfig.show_founder && founder && /* @__PURE__ */ jsxDEV("div", {
                        className: "flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-50 border border-slate-100/50",
                        children: [
                          /* @__PURE__ */ jsxDEV(Users, {
                            size: 12,
                            className: "text-slate-400"
                          }, undefined, false, undefined, this),
                          /* @__PURE__ */ jsxDEV("span", {
                            className: "text-[10px] font-black uppercase tracking-widest text-slate-600",
                            children: founder
                          }, undefined, false, undefined, this),
                          displayConfig.show_role && role && /* @__PURE__ */ jsxDEV("span", {
                            className: "text-[10px] font-medium text-slate-400 border-l border-slate-200 ps-2 ms-1",
                            children: role
                          }, undefined, false, undefined, this)
                        ]
                      }, undefined, true, undefined, this),
                      displayConfig.show_stage && stage && /* @__PURE__ */ jsxDEV("span", {
                        className: "px-5 py-2.5 rounded-2xl bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest border border-slate-100/50",
                        children: stage
                      }, undefined, false, undefined, this),
                      displayConfig.show_governorate && governorate && /* @__PURE__ */ jsxDEV("span", {
                        className: "flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest border border-slate-100/50",
                        children: [
                          /* @__PURE__ */ jsxDEV(MapPin, {
                            size: 12
                          }, undefined, false, undefined, this),
                          " ",
                          governorate
                        ]
                      }, undefined, true, undefined, this)
                    ]
                  }, undefined, true, undefined, this)
                ]
              }, undefined, true, undefined, this)
            }, undefined, false, undefined, this),
            /* @__PURE__ */ jsxDEV("div", {
              className: "h-px w-20 bg-slate-100 mb-10 mx-auto md:mx-0"
            }, undefined, false, undefined, this),
            displayConfig.show_industry && /* @__PURE__ */ jsxDEV(Fragment, {
              children: [
                /* @__PURE__ */ jsxDEV("div", {
                  className: `flex items-center gap-4 text-slate-400 mb-4 justify-center md:justify-start ${isRtl ? "flex-row-reverse" : ""}`,
                  children: [
                    /* @__PURE__ */ jsxDEV(Briefcase, {
                      size: 24
                    }, undefined, false, undefined, this),
                    /* @__PURE__ */ jsxDEV("span", {
                      className: "text-[10px] font-black uppercase tracking-[0.4em]",
                      children: t.sector
                    }, undefined, false, undefined, this)
                  ]
                }, undefined, true, undefined, this),
                /* @__PURE__ */ jsxDEV("p", {
                  className: "text-2xl md:text-3xl font-black text-slate-800 leading-tight uppercase tracking-tight mb-8",
                  children: industry
                }, undefined, false, undefined, this)
              ]
            }, undefined, true, undefined, this),
            displayConfig.show_description && description && /* @__PURE__ */ jsxDEV(ExpandableText, {
              text: description,
              lines: 4,
              lang,
              color: customColor,
              className: "text-lg md:text-xl font-medium text-slate-500 max-w-2xl mt-6"
            }, undefined, false, undefined, this),
            displayConfig.show_links && links.length > 0 && /* @__PURE__ */ jsxDEV("div", {
              className: "flex flex-wrap gap-3 mt-6 justify-center md:justify-start",
              children: links.filter((l) => l.url).map((link, i) => /* @__PURE__ */ jsxDEV("a", {
                href: link.url,
                target: "_blank",
                rel: "noopener noreferrer",
                className: "inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white border border-slate-100 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-[#1a27c9] hover:border-[#1a27c9] transition-all shadow-sm hover:shadow-md",
                children: [
                  /* @__PURE__ */ jsxDEV(LinkIcon, {
                    type: link.icon,
                    size: 14
                  }, undefined, false, undefined, this),
                  link.label || t.link
                ]
              }, i, true, undefined, this))
            }, undefined, false, undefined, this)
          ]
        }, undefined, true, undefined, this),
        /* @__PURE__ */ jsxDEV("div", {
          className: "absolute bottom-0 left-0 w-2 h-0 group-hover:h-full transition-all duration-1000 opacity-60",
          style: { backgroundColor: customColor }
        }, undefined, false, undefined, this),
        /* @__PURE__ */ jsxDEV("div", {
          className: "absolute top-8 right-8 flex gap-2 z-20",
          children: [
            onEdit && /* @__PURE__ */ jsxDEV("button", {
              onClick: (e) => {
                e.stopPropagation();
                onEdit(company);
              },
              className: "w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-[#1a27c9] hover:border-[#1a27c9] hover:shadow-xl transition-all group/edit",
              children: /* @__PURE__ */ jsxDEV(Pencil, {
                size: 18,
                className: "group-hover/edit:rotate-12 transition-transform"
              }, undefined, false, undefined, this)
            }, undefined, false, undefined, this),
            onDelete && /* @__PURE__ */ jsxDEV("button", {
              onClick: (e) => {
                e.stopPropagation();
                if (window.confirm("Are you sure you want to remove this company?")) {
                  onDelete(company.company_id || company.id);
                }
              },
              className: "w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:shadow-xl transition-all group/delete",
              children: /* @__PURE__ */ jsxDEV(Trash2, {
                size: 18,
                className: "group-hover/delete:scale-110 transition-transform"
              }, undefined, false, undefined, this)
            }, undefined, false, undefined, this)
          ]
        }, undefined, true, undefined, this)
      ]
    }, undefined, true, undefined, this);
  }
  return /* @__PURE__ */ jsxDEV("div", {
    ref: setNodeRef,
    style,
    className: "group relative w-full bg-white rounded-[4rem] border border-slate-100 p-6 md:p-8 hover:shadow-2xl transition-all duration-700 flex flex-col overflow-hidden ring-1 ring-slate-100/50 items-center text-center",
    dir: isRtl ? "rtl" : "ltr",
    children: [
      !previewMode && /* @__PURE__ */ jsxDEV("div", {
        ...attributes,
        ...listeners,
        className: "absolute top-6 left-6 cursor-grab active:cursor-grabbing p-2 text-slate-300 hover:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity z-30",
        children: /* @__PURE__ */ jsxDEV(GripVertical, {
          size: 20
        }, undefined, false, undefined, this)
      }, undefined, false, undefined, this),
      /* @__PURE__ */ jsxDEV("div", {
        className: "absolute top-0 right-0 w-[400px] h-[400px] rounded-full opacity-[0.05] blur-[80px] -mr-32 -mt-32 pointer-events-none transition-transform duration-1000 group-hover:scale-110",
        style: { backgroundColor: customColor }
      }, undefined, false, undefined, this),
      /* @__PURE__ */ jsxDEV("div", {
        className: "absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full opacity-[0.03] blur-[60px] -ml-20 -mb-20 pointer-events-none transition-transform duration-1000 group-hover:scale-110",
        style: { backgroundColor: customColor }
      }, undefined, false, undefined, this),
      /* @__PURE__ */ jsxDEV("div", {
        className: "flex flex-col items-center justify-center w-full mb-2 z-10 gap-2",
        children: [
          company.status && /* @__PURE__ */ jsxDEV("div", {
            className: `text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border ${company.status === "Profitable" ? "text-emerald-600 bg-emerald-50 border-emerald-100" : "text-amber-600 bg-amber-50 border-amber-100"}`,
            children: company.status
          }, undefined, false, undefined, this),
          displayConfig.show_stage && /* @__PURE__ */ jsxDEV("span", {
            className: "text-[10px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-2xl bg-white border border-slate-100 shadow-sm text-slate-500 max-w-full truncate",
            children: [
              t.stage,
              ": ",
              stage || t.growth
            ]
          }, undefined, true, undefined, this)
        ]
      }, undefined, true, undefined, this),
      /* @__PURE__ */ jsxDEV("div", {
        className: `absolute top-6 ${isRtl ? "left-6" : "right-6"} z-20 flex flex-col gap-2`,
        children: [
          onEdit && /* @__PURE__ */ jsxDEV("button", {
            onClick: (e) => {
              e.stopPropagation();
              onEdit(company);
            },
            className: "w-10 h-10 bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-[#1a27c9] hover:border-[#1a27c9] hover:shadow-xl transition-all group/edit",
            children: /* @__PURE__ */ jsxDEV(Pencil, {
              size: 16,
              className: "group-hover/edit:rotate-12 transition-transform"
            }, undefined, false, undefined, this)
          }, undefined, false, undefined, this),
          onDelete && /* @__PURE__ */ jsxDEV("button", {
            onClick: (e) => {
              e.stopPropagation();
              if (window.confirm("Are you sure you want to remove this company?")) {
                onDelete(company.company_id || company.id);
              }
            },
            className: "w-10 h-10 bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:shadow-xl transition-all group/delete",
            children: /* @__PURE__ */ jsxDEV(Trash2, {
              size: 16,
              className: "group-hover/delete:scale-110 transition-transform"
            }, undefined, false, undefined, this)
          }, undefined, false, undefined, this)
        ]
      }, undefined, true, undefined, this),
      /* @__PURE__ */ jsxDEV("div", {
        className: "flex flex-col items-center mb-2 z-10 w-full",
        children: [
          /* @__PURE__ */ jsxDEV("div", {
            className: "relative w-[124px] h-[124px] mb-4",
            children: [
              /* @__PURE__ */ jsxDEV("div", {
                className: "absolute inset-2 rounded-[2rem] blur-xl opacity-20 transition-opacity group-hover:opacity-40",
                style: { backgroundColor: customColor }
              }, undefined, false, undefined, this),
              /* @__PURE__ */ jsxDEV("div", {
                className: "relative w-full h-full rounded-[2rem] overflow-hidden border-4 border-white shadow-xl bg-white flex items-center justify-center transition-transform duration-1000 group-hover:scale-[1.05]",
                children: displayConfig.show_logo ? /* @__PURE__ */ jsxDEV(LazyImage, {
                  src: logo ? getGoogleDriveFallbackUrls(logo)[0] : null,
                  urls: logo ? getGoogleDriveFallbackUrls(logo) : [],
                  alt: name,
                  objectFit: "contain",
                  padding: true,
                  className: "grayscale-[0.2] group-hover:grayscale-0 transition-all duration-1000",
                  fallback: /* @__PURE__ */ jsxDEV("div", {
                    className: "w-full h-full flex items-center justify-center text-6xl font-black",
                    style: { backgroundColor: getLightColor(customColor, "10"), color: customColor },
                    children: name.charAt(0)
                  }, undefined, false, undefined, this)
                }, undefined, false, undefined, this) : /* @__PURE__ */ jsxDEV("div", {
                  className: "w-full h-full flex items-center justify-center text-6xl font-black",
                  style: { backgroundColor: getLightColor(customColor, "10"), color: customColor },
                  children: name.charAt(0)
                }, undefined, false, undefined, this)
              }, undefined, false, undefined, this)
            ]
          }, undefined, true, undefined, this),
          /* @__PURE__ */ jsxDEV("div", {
            className: "px-4 w-full",
            children: [
              /* @__PURE__ */ jsxDEV("h3", {
                className: "text-3xl font-black text-[#0d0e0e] tracking-tight mb-2 leading-none group-hover:text-[#1a27c9] transition-colors duration-500 uppercase",
                children: name
              }, undefined, false, undefined, this),
              displayConfig.show_founder && founder && /* @__PURE__ */ jsxDEV("div", {
                className: "flex items-center justify-center gap-2 mb-2",
                children: [
                  /* @__PURE__ */ jsxDEV("span", {
                    className: "text-xs font-black text-slate-600 uppercase tracking-tighter",
                    children: founder
                  }, undefined, false, undefined, this),
                  displayConfig.show_role && role && /* @__PURE__ */ jsxDEV(Fragment, {
                    children: [
                      /* @__PURE__ */ jsxDEV("span", {
                        className: "w-1 h-1 bg-slate-200 rounded-full"
                      }, undefined, false, undefined, this),
                      /* @__PURE__ */ jsxDEV("span", {
                        className: "text-[10px] font-medium text-slate-400 uppercase",
                        children: role
                      }, undefined, false, undefined, this)
                    ]
                  }, undefined, true, undefined, this)
                ]
              }, undefined, true, undefined, this)
            ]
          }, undefined, true, undefined, this)
        ]
      }, undefined, true, undefined, this),
      /* @__PURE__ */ jsxDEV("div", {
        className: "flex-1 px-4 z-10 w-full flex flex-col justify-between",
        children: [
          displayConfig.show_description && description && /* @__PURE__ */ jsxDEV(ExpandableText, {
            text: description,
            lines: 4,
            lang,
            color: customColor,
            className: "text-slate-500 text-base font-medium mb-4 italic"
          }, undefined, false, undefined, this),
          /* @__PURE__ */ jsxDEV("div", {
            className: `grid gap-3 transition-all duration-500 ${showLocation && displayConfig.show_industry ? "grid-cols-2 w-full" : "grid-cols-1 w-full max-w-[240px] mx-auto"}`,
            children: [
              showLocation && /* @__PURE__ */ jsxDEV("div", {
                className: "bg-slate-50 p-4 rounded-3xl border border-slate-100 transition-all group-hover:bg-white group-hover:border-slate-200",
                children: [
                  /* @__PURE__ */ jsxDEV("div", {
                    className: "flex items-center justify-center gap-2 text-slate-400 mb-1",
                    children: [
                      /* @__PURE__ */ jsxDEV(MapPin, {
                        size: 14
                      }, undefined, false, undefined, this),
                      /* @__PURE__ */ jsxDEV("span", {
                        className: "text-[8px] font-black uppercase tracking-widest text-slate-400",
                        children: t.location
                      }, undefined, false, undefined, this)
                    ]
                  }, undefined, true, undefined, this),
                  /* @__PURE__ */ jsxDEV("p", {
                    className: "text-[10px] font-black text-[#0d0e0e] uppercase truncate",
                    children: governorate || location || t.notSpecified
                  }, undefined, false, undefined, this)
                ]
              }, undefined, true, undefined, this),
              displayConfig.show_industry && /* @__PURE__ */ jsxDEV("div", {
                className: "bg-slate-50 p-4 rounded-3xl border border-slate-100 transition-all group-hover:bg-white group-hover:border-slate-200",
                children: [
                  /* @__PURE__ */ jsxDEV("div", {
                    className: "flex items-center justify-center gap-2 text-slate-400 mb-1",
                    children: [
                      /* @__PURE__ */ jsxDEV(Briefcase, {
                        size: 14
                      }, undefined, false, undefined, this),
                      /* @__PURE__ */ jsxDEV("span", {
                        className: "text-[8px] font-black uppercase tracking-widest text-slate-400",
                        children: t.sector
                      }, undefined, false, undefined, this)
                    ]
                  }, undefined, true, undefined, this),
                  /* @__PURE__ */ jsxDEV("p", {
                    className: "text-[10px] font-black text-[#0d0e0e] uppercase truncate",
                    children: industry || t.notSpecified
                  }, undefined, false, undefined, this)
                ]
              }, undefined, true, undefined, this)
            ]
          }, undefined, true, undefined, this),
          displayConfig.show_links && links.length > 0 && /* @__PURE__ */ jsxDEV("div", {
            className: "mt-4 border-t border-slate-50 pt-4 w-full",
            children: [
              /* @__PURE__ */ jsxDEV("div", {
                className: "flex items-center justify-center gap-2 text-slate-400 mb-2 opacity-60",
                children: [
                  /* @__PURE__ */ jsxDEV("span", {
                    className: "h-px w-8 bg-slate-200"
                  }, undefined, false, undefined, this),
                  /* @__PURE__ */ jsxDEV("span", {
                    className: "text-[9px] font-black uppercase tracking-[0.3em]",
                    children: t.Links
                  }, undefined, false, undefined, this),
                  /* @__PURE__ */ jsxDEV("span", {
                    className: "h-px w-8 bg-slate-200"
                  }, undefined, false, undefined, this)
                ]
              }, undefined, true, undefined, this),
              /* @__PURE__ */ jsxDEV("div", {
                className: "flex flex-wrap justify-center gap-3",
                children: links.filter((l) => l.url).slice(0, 3).map((link, i) => /* @__PURE__ */ jsxDEV("a", {
                  href: link.url,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "px-4 py-2 bg-white border border-slate-100 rounded-xl flex items-center gap-2 text-slate-400 hover:text-[#1a27c9] hover:border-[#1a27c9] hover:shadow-lg transition-all group/link",
                  title: link.label,
                  children: [
                    /* @__PURE__ */ jsxDEV(LinkIcon, {
                      type: link.icon,
                      size: 14,
                      className: "group-hover/link:scale-110 transition-transform"
                    }, undefined, false, undefined, this),
                    /* @__PURE__ */ jsxDEV("span", {
                      className: "text-[10px] font-black uppercase tracking-widest whitespace-nowrap",
                      children: link.label || t.link
                    }, undefined, false, undefined, this)
                  ]
                }, i, true, undefined, this))
              }, undefined, false, undefined, this)
            ]
          }, undefined, true, undefined, this)
        ]
      }, undefined, true, undefined, this),
      /* @__PURE__ */ jsxDEV("div", {
        className: "absolute bottom-0 left-0 h-1.5 w-0 group-hover:w-full transition-all duration-1000 opacity-60",
        style: { backgroundColor: customColor }
      }, undefined, false, undefined, this)
    ]
  }, undefined, true, undefined, this);
};
var CompanyCard_default = CompanyCard;
export {
  CompanyCard_default as default
};
