// src/components/StartupManager.jsx
import React, { useState, useEffect } from "react";
import { X as CloseIcon, ArrowLeft, Plus, Search, Trash2, Edit2, Layout, Database, AlertCircle, ExternalLink, Users, Inbox, Clock, Eye, CheckCircle, XCircle, Loader2, Pencil, Upload, Check } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import CompanyCard from "./CompanyCard";
import SyncButton from "./SyncButton";
import LazyImage from "./LazyImage";
import { getGoogleDriveFallbackUrls } from "../lib/utils";
import { getCompanies, createCompany, updateCompany, deleteCompany, uploadImage, getSubmissions, approveSubmission, rejectSubmission, bulkUpdateCompanies, getFormConfig, saveFormConfig } from "../lib/api";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy
} from "@dnd-kit/sortable";
import { restrictToFirstScrollableAncestor } from "@dnd-kit/modifiers";
import { jsxDEV, Fragment } from "react/jsx-dev-runtime";
var StartupManager = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [activeTab, setActiveTab] = useState("curated");
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [formConfig, setFormConfig] = useState([]);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8
    }
  }), useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates
  }));
  const [formData, setFormData] = useState({
    name: "",
    founder: "",
    role: "",
    industry: "",
    stage: "",
    governorate: "",
    description: "",
    links: [],
    logo_url: "",
    display_config: {
      show_founder: true,
      show_role: true,
      show_stage: true,
      show_governorate: true,
      show_industry: true,
      show_description: true,
      show_links: true
    }
  });
  const loadData = async () => {
    try {
      setLoading(true);
      const [companiesData, configData] = await Promise.all([
        activeTab === "curated" ? getCompanies(eventId) : getSubmissions(eventId, "company", "pending"),
        getFormConfig(eventId, "company")
      ]);
      if (activeTab === "curated") {
        setCompanies(companiesData || []);
      } else {
        setSubmissions(companiesData || []);
      }
      setFormConfig(configData || []);
      setError(null);
    } catch (err) {
      console.error("Error loading data:", err);
      setError(`Failed to fetch ${activeTab === "curated" ? "Company Grid" : "Review Pulse"}.`);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadData();
  }, [eventId, activeTab]);
  const handleEdit = (company) => {
    setEditingCompany(company);
    let links = [];
    let parsedLinks = company.links;
    if (typeof parsedLinks === "string") {
      try {
        parsedLinks = JSON.parse(parsedLinks);
      } catch (e) {
        parsedLinks = [];
      }
    }
    if (Array.isArray(parsedLinks) && parsedLinks.length > 0) {
      links = parsedLinks.map((l) => ({ ...l, icon: l.icon || "globe" }));
    } else if (company.website_url) {
      links = [{ label: "Website", url: company.website_url, icon: "globe" }];
    }
    setFormData({
      name: company.name || "",
      founder: company.founder || "",
      role: company.role || "",
      industry: company.industry || "",
      stage: company.stage || "",
      governorate: company.governorate || "",
      description: company.description || "",
      links,
      logo_url: company.logo_url || "",
      display_config: company.display_config || {
        show_founder: true,
        show_role: true,
        show_stage: true,
        show_governorate: true,
        show_industry: true,
        show_description: true,
        show_links: true
      }
    });
    setShowAddModal(true);
  };
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file)
      return;
    try {
      setIsUploading(true);
      const url = await uploadImage(file, "startup-logos");
      setFormData((prev) => ({ ...prev, logo_url: url }));
    } catch (err) {
      console.error("Error uploading logo:", err);
      alert("Failed to upload logo.");
    } finally {
      setIsUploading(false);
    }
  };
  const isFieldRequired = (fieldName) => {
    return formConfig.find((f) => f.field_name === fieldName)?.is_required;
  };
  const handleApproveCompany = async (submission) => {
    try {
      setActionLoading(submission.submission_id);
      await approveSubmission(submission.submission_id, "company");
      setSubmissions((prev) => prev.filter((s) => s.submission_id !== submission.submission_id));
      loadData();
      alert("Company approved and added to ecosystem! ✅");
    } catch (error2) {
      console.error("Error approving company:", error2);
      alert("Failed to approve registration pulse.");
    } finally {
      setActionLoading(null);
    }
  };
  const handleRejectCompany = async (submission) => {
    const reason = prompt("Reason for rejection? (Optional)");
    if (reason === null)
      return;
    try {
      setActionLoading(submission.submission_id);
      await rejectSubmission(submission.submission_id, "company", reason || "Not specified");
      setSubmissions((prev) => prev.filter((s) => s.submission_id !== submission.submission_id));
      alert("Registration request rejected.");
    } catch (error2) {
      console.error("Error rejecting company:", error2);
      alert("Failed to block registration signal.");
    } finally {
      setActionLoading(null);
    }
  };
  const handleDeleteCompany = async (companyId) => {
    try {
      await deleteCompany(companyId);
      loadData();
    } catch (err) {
      console.error("Error deleting company:", err);
      alert("Failed to delete venture from the grid.");
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (editingCompany) {
        await updateCompany(editingCompany.company_id || editingCompany.id, {
          ...formData,
          event_id: eventId
        });
      } else {
        await createCompany({
          ...formData,
          event_id: eventId,
          sort_order: companies.length + 1
        });
      }
      setShowAddModal(false);
      setEditingCompany(null);
      setFormData({
        name: "",
        founder: "",
        role: "",
        industry: "",
        stage: "",
        governorate: "",
        description: "",
        links: [],
        logo_url: "",
        display_config: {
          show_founder: true,
          show_role: true,
          show_stage: true,
          show_governorate: true,
          show_industry: true,
          show_description: true,
          show_links: true
        }
      });
      loadData();
    } catch (err) {
      console.error("Error saving startup:", err);
      alert("Failed to save venture.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (active.id !== over?.id) {
      const oldIndex = companies.findIndex((c) => (c.company_id || c.id) === active.id);
      const newIndex = companies.findIndex((c) => (c.company_id || c.id) === over.id);
      const newCompanies = arrayMove(companies, oldIndex, newIndex);
      setCompanies(newCompanies);
      try {
        const updates = newCompanies.map((c, index) => ({
          ...c,
          sort_order: index + 1
        }));
        await bulkUpdateCompanies(updates);
      } catch (err) {
        console.error("Error updating company order:", err);
        loadData();
      }
    }
  };
  const filteredCompanies = companies.filter((company) => company.name?.toLowerCase().includes(searchTerm.toLowerCase()) || company.industry?.toLowerCase().includes(searchTerm.toLowerCase()));
  return /* @__PURE__ */ jsxDEV("div", {
    className: "min-h-screen bg-gray-100 font-manrope selection:bg-[#059669]/10 selection:text-[#059669]",
    children: [
      /* @__PURE__ */ jsxDEV("div", {
        className: "bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm",
        children: /* @__PURE__ */ jsxDEV("div", {
          className: "max-w-[1600px] mx-auto px-6 py-6",
          children: /* @__PURE__ */ jsxDEV("div", {
            className: "flex flex-col md:flex-row md:items-center justify-between gap-6",
            children: [
              /* @__PURE__ */ jsxDEV("div", {
                className: "flex items-center gap-6",
                children: [
                  /* @__PURE__ */ jsxDEV("button", {
                    onClick: () => navigate(`/event/${eventId}`),
                    className: "w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#059669] hover:border-[#059669] hover:bg-white transition-premium group",
                    children: /* @__PURE__ */ jsxDEV(ArrowLeft, {
                      size: 20,
                      className: "group-hover:-translate-x-1 transition-transform"
                    }, undefined, false, undefined, this)
                  }, undefined, false, undefined, this),
                  /* @__PURE__ */ jsxDEV("div", {
                    children: [
                      /* @__PURE__ */ jsxDEV("h1", {
                        className: "text-3xl font-black text-[#0d0e0e] tracking-tight",
                        children: "Company Grid"
                      }, undefined, false, undefined, this),
                      /* @__PURE__ */ jsxDEV("p", {
                        className: "text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1",
                        children: "Populate your events ecosystem"
                      }, undefined, false, undefined, this)
                    ]
                  }, undefined, true, undefined, this)
                ]
              }, undefined, true, undefined, this),
              /* @__PURE__ */ jsxDEV("div", {
                className: "flex p-1 bg-slate-100 rounded-2xl w-fit",
                children: [
                  /* @__PURE__ */ jsxDEV("button", {
                    onClick: () => setActiveTab("curated"),
                    className: `px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === "curated" ? "bg-white text-[#059669] shadow-sm" : "text-slate-400 hover:text-slate-600"}`,
                    children: [
                      /* @__PURE__ */ jsxDEV(Layout, {
                        size: 16
                      }, undefined, false, undefined, this),
                      "Company Grid"
                    ]
                  }, undefined, true, undefined, this),
                  /* @__PURE__ */ jsxDEV("button", {
                    onClick: () => setActiveTab("review"),
                    className: `px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === "review" ? "bg-white text-[#059669] shadow-sm" : "text-slate-400 hover:text-slate-600"}`,
                    children: [
                      /* @__PURE__ */ jsxDEV(Inbox, {
                        size: 16
                      }, undefined, false, undefined, this),
                      "Review Desk",
                      submissions.filter((s) => s.status === "pending").length > 0 && /* @__PURE__ */ jsxDEV("span", {
                        className: "flex h-2 w-2 rounded-full bg-rose-500 animate-pulse"
                      }, undefined, false, undefined, this)
                    ]
                  }, undefined, true, undefined, this)
                ]
              }, undefined, true, undefined, this),
              /* @__PURE__ */ jsxDEV("div", {
                className: "flex items-center gap-3",
                children: [
                  /* @__PURE__ */ jsxDEV("div", {
                    className: "relative group",
                    children: [
                      /* @__PURE__ */ jsxDEV(Search, {
                        className: "absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#059669] transition-colors",
                        size: 18
                      }, undefined, false, undefined, this),
                      /* @__PURE__ */ jsxDEV("input", {
                        type: "text",
                        placeholder: "Find ventures...",
                        value: searchTerm,
                        onChange: (e) => setSearchTerm(e.target.value),
                        className: "pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#059669]/5 focus:border-[#059669] transition-premium w-full md:w-64"
                      }, undefined, false, undefined, this)
                    ]
                  }, undefined, true, undefined, this),
                  /* @__PURE__ */ jsxDEV(SyncButton, {
                    eventId,
                    onSyncComplete: loadData,
                    className: "md:w-auto h-[54px]"
                  }, undefined, false, undefined, this),
                  /* @__PURE__ */ jsxDEV("button", {
                    onClick: () => setShowAddModal(true),
                    className: "flex items-center gap-3 bg-[#059669] text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-[#0d0e0e] hover:shadow-2xl hover:shadow-emerald-200 transition-premium group active:scale-95",
                    children: [
                      /* @__PURE__ */ jsxDEV(Plus, {
                        size: 18,
                        className: "group-hover:rotate-90 transition-transform duration-500"
                      }, undefined, false, undefined, this),
                      /* @__PURE__ */ jsxDEV("span", {
                        children: "Add Company"
                      }, undefined, false, undefined, this)
                    ]
                  }, undefined, true, undefined, this),
                  /* @__PURE__ */ jsxDEV("button", {
                    onClick: () => setShowSettingsModal(true),
                    className: "w-[54px] h-[54px] bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-[#059669] hover:border-[#059669] hover:bg-slate-50 transition-premium shadow-sm",
                    title: "Card Settings",
                    children: /* @__PURE__ */ jsxDEV(Layout, {
                      size: 20
                    }, undefined, false, undefined, this)
                  }, undefined, false, undefined, this)
                ]
              }, undefined, true, undefined, this)
            ]
          }, undefined, true, undefined, this)
        }, undefined, false, undefined, this)
      }, undefined, false, undefined, this),
      showSettingsModal && /* @__PURE__ */ jsxDEV("div", {
        className: "fixed inset-0 z-[100] flex items-center justify-center p-4",
        children: [
          /* @__PURE__ */ jsxDEV("div", {
            className: "absolute inset-0 bg-[#0d0e0e]/60 backdrop-blur-sm",
            onClick: () => setShowSettingsModal(false)
          }, undefined, false, undefined, this),
          /* @__PURE__ */ jsxDEV("div", {
            className: "relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300",
            children: [
              /* @__PURE__ */ jsxDEV("div", {
                className: "p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50",
                children: [
                  /* @__PURE__ */ jsxDEV("div", {
                    children: [
                      /* @__PURE__ */ jsxDEV("h2", {
                        className: "text-2xl font-black text-[#0d0e0e] tracking-tight",
                        children: "Company Card Settings"
                      }, undefined, false, undefined, this),
                      /* @__PURE__ */ jsxDEV("p", {
                        className: "text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1",
                        children: "Configure visibility & constraints"
                      }, undefined, false, undefined, this)
                    ]
                  }, undefined, true, undefined, this),
                  /* @__PURE__ */ jsxDEV("button", {
                    onClick: () => setShowSettingsModal(false),
                    className: "w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-all",
                    children: /* @__PURE__ */ jsxDEV(CloseIcon, {
                      size: 20
                    }, undefined, false, undefined, this)
                  }, undefined, false, undefined, this)
                ]
              }, undefined, true, undefined, this),
              /* @__PURE__ */ jsxDEV("div", {
                className: "p-8 max-h-[60vh] overflow-y-auto",
                children: /* @__PURE__ */ jsxDEV("div", {
                  className: "space-y-4",
                  children: formConfig.map((field, idx) => /* @__PURE__ */ jsxDEV("div", {
                    className: "flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-[#059669]/30 transition-all",
                    children: [
                      /* @__PURE__ */ jsxDEV("div", {
                        className: "flex items-center gap-4",
                        children: [
                          /* @__PURE__ */ jsxDEV("div", {
                            className: "w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-[#059669] transition-colors",
                            children: /* @__PURE__ */ jsxDEV(Database, {
                              size: 20
                            }, undefined, false, undefined, this)
                          }, undefined, false, undefined, this),
                          /* @__PURE__ */ jsxDEV("div", {
                            children: [
                              /* @__PURE__ */ jsxDEV("h4", {
                                className: "font-bold text-[#0d0e0e]",
                                children: field.field_label
                              }, undefined, false, undefined, this),
                              /* @__PURE__ */ jsxDEV("p", {
                                className: "text-[10px] font-black uppercase tracking-widest text-slate-400",
                                children: field.field_name
                              }, undefined, false, undefined, this)
                            ]
                          }, undefined, true, undefined, this)
                        ]
                      }, undefined, true, undefined, this),
                      /* @__PURE__ */ jsxDEV("div", {
                        className: "flex items-center gap-8",
                        children: [
                          /* @__PURE__ */ jsxDEV("div", {
                            className: "flex flex-col items-center gap-2",
                            children: [
                              /* @__PURE__ */ jsxDEV("span", {
                                className: "text-[8px] font-black uppercase tracking-widest text-slate-400",
                                children: "Card View"
                              }, undefined, false, undefined, this),
                              /* @__PURE__ */ jsxDEV("button", {
                                onClick: () => {
                                  const newConfig = [...formConfig];
                                  newConfig[idx].show_in_card = !newConfig[idx].show_in_card;
                                  setFormConfig(newConfig);
                                },
                                className: `w-12 h-6 rounded-full transition-all relative ${field.show_in_card ? "bg-[#059669]" : "bg-slate-200"}`,
                                children: /* @__PURE__ */ jsxDEV("div", {
                                  className: `absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${field.show_in_card ? "right-1" : "left-1"}`
                                }, undefined, false, undefined, this)
                              }, undefined, false, undefined, this)
                            ]
                          }, undefined, true, undefined, this),
                          /* @__PURE__ */ jsxDEV("div", {
                            className: "flex flex-col items-center gap-2",
                            children: [
                              /* @__PURE__ */ jsxDEV("span", {
                                className: "text-[8px] font-black uppercase tracking-widest text-slate-400",
                                children: "Required"
                              }, undefined, false, undefined, this),
                              /* @__PURE__ */ jsxDEV("button", {
                                onClick: () => {
                                  const newConfig = [...formConfig];
                                  newConfig[idx].is_required = !newConfig[idx].is_required;
                                  setFormConfig(newConfig);
                                },
                                className: `w-12 h-6 rounded-full transition-all relative ${field.is_required ? "bg-[#059669]" : "bg-slate-200"}`,
                                children: /* @__PURE__ */ jsxDEV("div", {
                                  className: `absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${field.is_required ? "right-1" : "left-1"}`
                                }, undefined, false, undefined, this)
                              }, undefined, false, undefined, this)
                            ]
                          }, undefined, true, undefined, this)
                        ]
                      }, undefined, true, undefined, this)
                    ]
                  }, field.field_name, true, undefined, this))
                }, undefined, false, undefined, this)
              }, undefined, false, undefined, this),
              /* @__PURE__ */ jsxDEV("div", {
                className: "p-8 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-4",
                children: [
                  /* @__PURE__ */ jsxDEV("button", {
                    onClick: () => setShowSettingsModal(false),
                    className: "px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all font-manrope",
                    children: "Discard"
                  }, undefined, false, undefined, this),
                  /* @__PURE__ */ jsxDEV("button", {
                    onClick: async () => {
                      try {
                        setSettingsSaving(true);
                        await saveFormConfig(eventId, "company", formConfig);
                        alert("Card settings synchronized! \uD83D\uDE80");
                        setShowSettingsModal(false);
                      } catch (err) {
                        console.error("Error saving config:", err);
                        alert("Failed to sync settings.");
                      } finally {
                        setSettingsSaving(false);
                      }
                    },
                    disabled: settingsSaving,
                    className: "px-8 py-3 bg-[#0d0e0e] text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-black transition-all shadow-xl disabled:opacity-50 flex items-center gap-2",
                    children: [
                      settingsSaving && /* @__PURE__ */ jsxDEV(Loader2, {
                        size: 14,
                        className: "animate-spin"
                      }, undefined, false, undefined, this),
                      "Sync Settings"
                    ]
                  }, undefined, true, undefined, this)
                ]
              }, undefined, true, undefined, this)
            ]
          }, undefined, true, undefined, this)
        ]
      }, undefined, true, undefined, this),
      /* @__PURE__ */ jsxDEV("div", {
        className: "max-w-7xl mx-auto px-6 py-12",
        children: loading ? /* @__PURE__ */ jsxDEV("div", {
          className: "flex flex-col items-center justify-center py-32 text-center animate-in fade-in duration-700",
          children: [
            /* @__PURE__ */ jsxDEV("div", {
              className: "w-20 h-20 border-4 border-slate-100 border-t-[#059669] rounded-full animate-spin mb-8"
            }, undefined, false, undefined, this),
            /* @__PURE__ */ jsxDEV("p", {
              className: "text-slate-400 text-sm font-bold uppercase tracking-widest animate-pulse",
              children: "Scanning Ecosystem..."
            }, undefined, false, undefined, this)
          ]
        }, undefined, true, undefined, this) : error ? /* @__PURE__ */ jsxDEV("div", {
          className: "flex flex-col items-center justify-center py-32 text-center animate-in zoom-in duration-500",
          children: [
            /* @__PURE__ */ jsxDEV("div", {
              className: "w-24 h-24 bg-rose-50 rounded-[2rem] flex items-center justify-center text-rose-500 mb-8 border border-rose-100 shadow-xl shadow-rose-100/20",
              children: /* @__PURE__ */ jsxDEV(AlertCircle, {
                size: 40
              }, undefined, false, undefined, this)
            }, undefined, false, undefined, this),
            /* @__PURE__ */ jsxDEV("h2", {
              className: "text-2xl font-black text-[#0d0e0e] tracking-tight mb-2 uppercase",
              children: "Sync Interrupt"
            }, undefined, false, undefined, this),
            /* @__PURE__ */ jsxDEV("p", {
              className: "text-slate-400 text-sm font-bold uppercase tracking-widest",
              children: error
            }, undefined, false, undefined, this),
            /* @__PURE__ */ jsxDEV("button", {
              onClick: () => window.location.reload(),
              className: "mt-8 px-6 py-3 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-premium",
              children: "Retry Initialization"
            }, undefined, false, undefined, this)
          ]
        }, undefined, true, undefined, this) : activeTab === "curated" ? filteredCompanies.length > 0 ? /* @__PURE__ */ jsxDEV(DndContext, {
          sensors,
          collisionDetection: closestCenter,
          onDragStart: handleDragStart,
          onDragEnd: handleDragEnd,
          modifiers: [restrictToFirstScrollableAncestor],
          children: [
            /* @__PURE__ */ jsxDEV(SortableContext, {
              items: filteredCompanies.map((c) => c.company_id || c.id),
              strategy: rectSortingStrategy,
              disabled: searchTerm.length > 0,
              children: /* @__PURE__ */ jsxDEV("div", {
                className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8",
                children: filteredCompanies.map((company) => /* @__PURE__ */ jsxDEV(CompanyCard, {
                  company,
                  config: formConfig,
                  onEdit: handleEdit,
                  onDelete: handleDeleteCompany
                }, company.company_id || company.id, false, undefined, this))
              }, undefined, false, undefined, this)
            }, undefined, false, undefined, this),
            /* @__PURE__ */ jsxDEV(DragOverlay, {
              dropAnimation: {
                sideEffects: defaultDropAnimationSideEffects({
                  styles: {
                    active: {
                      opacity: "0.5"
                    }
                  }
                })
              },
              children: activeId ? /* @__PURE__ */ jsxDEV("div", {
                className: "w-full max-w-sm opacity-80 pointer-events-none scale-105 transition-transform duration-300",
                children: /* @__PURE__ */ jsxDEV(CompanyCard, {
                  company: companies.find((c) => (c.company_id || c.id) === activeId),
                  config: formConfig,
                  previewMode: true
                }, undefined, false, undefined, this)
              }, undefined, false, undefined, this) : null
            }, undefined, false, undefined, this)
          ]
        }, undefined, true, undefined, this) : /* @__PURE__ */ jsxDEV("div", {
          className: "flex flex-col items-center justify-center py-32 text-center",
          children: [
            /* @__PURE__ */ jsxDEV("div", {
              className: "w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300 mb-6 border border-slate-100",
              children: /* @__PURE__ */ jsxDEV(Database, {
                size: 32
              }, undefined, false, undefined, this)
            }, undefined, false, undefined, this),
            /* @__PURE__ */ jsxDEV("h3", {
              className: "text-xl font-black text-[#0d0e0e] tracking-tight mb-2 uppercase",
              children: "Zero Signal"
            }, undefined, false, undefined, this),
            /* @__PURE__ */ jsxDEV("p", {
              className: "text-slate-400 text-sm font-bold uppercase tracking-widest",
              children: "No ventures detected in this quadrant."
            }, undefined, false, undefined, this)
          ]
        }, undefined, true, undefined, this) : /* @__PURE__ */ jsxDEV("div", {
          className: "space-y-6",
          children: submissions.length > 0 ? /* @__PURE__ */ jsxDEV("div", {
            className: "grid grid-cols-1 gap-4",
            children: submissions.map((submission) => /* @__PURE__ */ jsxDEV("div", {
              className: "bg-white rounded-[2rem] border border-slate-100 p-8 hover:shadow-xl transition-premium group relative overflow-hidden",
              children: [
                /* @__PURE__ */ jsxDEV("div", {
                  className: "absolute top-0 left-0 w-1.5 h-full bg-[#059669] opacity-0 group-hover:opacity-100 transition-opacity"
                }, undefined, false, undefined, this),
                /* @__PURE__ */ jsxDEV("div", {
                  className: "flex flex-col lg:flex-row lg:items-center justify-between gap-8",
                  children: [
                    /* @__PURE__ */ jsxDEV("div", {
                      className: "flex items-center gap-6 flex-1",
                      children: [
                        /* @__PURE__ */ jsxDEV("div", {
                          className: "relative w-[124px] h-[124px] rounded-[1.5rem] overflow-hidden bg-slate-50 border border-slate-100 group-hover:scale-105 transition-transform flex-shrink-0",
                          children: /* @__PURE__ */ jsxDEV(LazyImage, {
                            src: submission.logo_url ? getGoogleDriveFallbackUrls(submission.logo_url)[0] : null,
                            urls: submission.logo_url ? getGoogleDriveFallbackUrls(submission.logo_url) : [],
                            alt: submission.startup_name || "",
                            objectFit: "contain",
                            padding: true,
                            fallback: /* @__PURE__ */ jsxDEV(Database, {
                              size: 40,
                              className: "text-slate-200"
                            }, undefined, false, undefined, this)
                          }, undefined, false, undefined, this)
                        }, undefined, false, undefined, this),
                        /* @__PURE__ */ jsxDEV("div", {
                          children: [
                            /* @__PURE__ */ jsxDEV("div", {
                              className: "flex flex-wrap items-center gap-3 mb-2",
                              children: [
                                /* @__PURE__ */ jsxDEV("h3", {
                                  className: "text-2xl font-black text-[#0d0e0e] tracking-tight",
                                  children: submission.startup_name
                                }, undefined, false, undefined, this),
                                /* @__PURE__ */ jsxDEV("span", {
                                  className: "px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100 flex items-center gap-1.5",
                                  children: [
                                    /* @__PURE__ */ jsxDEV(Clock, {
                                      size: 12
                                    }, undefined, false, undefined, this),
                                    "Pending Pulse"
                                  ]
                                }, undefined, true, undefined, this)
                              ]
                            }, undefined, true, undefined, this),
                            /* @__PURE__ */ jsxDEV("div", {
                              className: "flex flex-wrap items-center gap-4 text-sm font-bold text-slate-400 uppercase tracking-widest",
                              children: [
                                /* @__PURE__ */ jsxDEV("span", {
                                  children: submission.industry || "Tech"
                                }, undefined, false, undefined, this),
                                /* @__PURE__ */ jsxDEV("span", {
                                  className: "w-1.5 h-1.5 rounded-full bg-slate-200"
                                }, undefined, false, undefined, this),
                                /* @__PURE__ */ jsxDEV("span", {
                                  children: submission.location || "Remote"
                                }, undefined, false, undefined, this),
                                /* @__PURE__ */ jsxDEV("span", {
                                  className: "w-1.5 h-1.5 rounded-full bg-slate-200"
                                }, undefined, false, undefined, this),
                                /* @__PURE__ */ jsxDEV("span", {
                                  className: "text-[#059669]",
                                  children: new Date(submission.submitted_at).toLocaleDateString()
                                }, undefined, false, undefined, this)
                              ]
                            }, undefined, true, undefined, this)
                          ]
                        }, undefined, true, undefined, this)
                      ]
                    }, undefined, true, undefined, this),
                    /* @__PURE__ */ jsxDEV("div", {
                      className: "flex flex-wrap items-center gap-3",
                      children: [
                        /* @__PURE__ */ jsxDEV("button", {
                          onClick: () => {
                            setSelectedSubmission(submission);
                            setShowPreview(true);
                          },
                          className: "px-6 py-4 bg-slate-50 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-premium flex items-center gap-2 border border-transparent hover:border-slate-200",
                          children: [
                            /* @__PURE__ */ jsxDEV(Eye, {
                              size: 16
                            }, undefined, false, undefined, this),
                            "Inspect"
                          ]
                        }, undefined, true, undefined, this),
                        /* @__PURE__ */ jsxDEV("button", {
                          onClick: () => handleApproveCompany(submission),
                          disabled: actionLoading === submission.submission_id,
                          className: "px-6 py-4 bg-[#059669] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#0d0e0e] hover:shadow-lg hover:shadow-emerald-200 transition-premium flex items-center gap-2 disabled:opacity-50",
                          children: [
                            actionLoading === submission.submission_id ? /* @__PURE__ */ jsxDEV("div", {
                              className: "w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                            }, undefined, false, undefined, this) : /* @__PURE__ */ jsxDEV(CheckCircle, {
                              size: 16
                            }, undefined, false, undefined, this),
                            "Approve"
                          ]
                        }, undefined, true, undefined, this),
                        /* @__PURE__ */ jsxDEV("button", {
                          onClick: () => handleRejectCompany(submission),
                          disabled: actionLoading === submission.submission_id,
                          className: "px-6 py-4 bg-white text-rose-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 border border-slate-100 hover:border-rose-100 transition-premium flex items-center gap-2 disabled:opacity-50",
                          children: [
                            /* @__PURE__ */ jsxDEV(XCircle, {
                              size: 16
                            }, undefined, false, undefined, this),
                            "Reject"
                          ]
                        }, undefined, true, undefined, this)
                      ]
                    }, undefined, true, undefined, this)
                  ]
                }, undefined, true, undefined, this)
              ]
            }, submission.submission_id, true, undefined, this))
          }, undefined, false, undefined, this) : /* @__PURE__ */ jsxDEV("div", {
            className: "flex flex-col items-center justify-center py-32 text-center bg-white rounded-[3rem] border border-slate-100 border-dashed",
            children: [
              /* @__PURE__ */ jsxDEV("div", {
                className: "w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 mb-6",
                children: /* @__PURE__ */ jsxDEV(Inbox, {
                  size: 32
                }, undefined, false, undefined, this)
              }, undefined, false, undefined, this),
              /* @__PURE__ */ jsxDEV("h3", {
                className: "text-xl font-black text-[#0d0e0e] tracking-tight mb-2 uppercase",
                children: "Inbox Balanced"
              }, undefined, false, undefined, this),
              /* @__PURE__ */ jsxDEV("p", {
                className: "text-slate-400 text-sm font-bold uppercase tracking-widest",
                children: "No pending ventures awaiting your signal."
              }, undefined, false, undefined, this)
            ]
          }, undefined, true, undefined, this)
        }, undefined, false, undefined, this)
      }, undefined, false, undefined, this),
      showAddModal && /* @__PURE__ */ jsxDEV("div", {
        className: "fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4",
        children: /* @__PURE__ */ jsxDEV("div", {
          className: "bg-white rounded-[2.5rem] w-full max-w-2xl p-8 lg:p-12 shadow-2xl relative overflow-hidden",
          children: [
            /* @__PURE__ */ jsxDEV("button", {
              onClick: () => {
                setShowAddModal(false);
                setEditingCompany(null);
                setFormData({
                  name: "",
                  founder: "",
                  role: "",
                  industry: "",
                  stage: "",
                  governorate: "",
                  description: "",
                  links: [],
                  logo_url: "",
                  display_config: {
                    show_founder: true,
                    show_role: true,
                    show_stage: true,
                    show_governorate: true,
                    show_industry: true,
                    show_description: true,
                    show_links: true
                  }
                });
              },
              className: "absolute top-8 right-8 text-slate-400 hover:text-rose-500 transition-colors",
              children: /* @__PURE__ */ jsxDEV(CloseIcon, {
                size: 24
              }, undefined, false, undefined, this)
            }, undefined, false, undefined, this),
            /* @__PURE__ */ jsxDEV("div", {
              className: "mb-10",
              children: [
                /* @__PURE__ */ jsxDEV("div", {
                  className: "flex items-center gap-3 mb-2",
                  children: [
                    editingCompany ? /* @__PURE__ */ jsxDEV(Pencil, {
                      size: 16,
                      className: "text-[#059669]"
                    }, undefined, false, undefined, this) : /* @__PURE__ */ jsxDEV(Plus, {
                      size: 16,
                      className: "text-[#059669]"
                    }, undefined, false, undefined, this),
                    /* @__PURE__ */ jsxDEV("span", {
                      className: "text-[10px] font-black uppercase tracking-[0.3em] text-slate-400",
                      children: editingCompany ? "Venture Modification" : "Venture Deployment"
                    }, undefined, false, undefined, this)
                  ]
                }, undefined, true, undefined, this),
                /* @__PURE__ */ jsxDEV("h2", {
                  className: "text-4xl font-black text-[#0d0e0e] tracking-tight leading-none",
                  children: [
                    editingCompany ? "Edit" : "Deploy",
                    " ",
                    /* @__PURE__ */ jsxDEV("span", {
                      className: "text-[#059669]",
                      children: "Startup"
                    }, undefined, false, undefined, this)
                  ]
                }, undefined, true, undefined, this)
              ]
            }, undefined, true, undefined, this),
            /* @__PURE__ */ jsxDEV("form", {
              onSubmit: handleSubmit,
              className: "space-y-6",
              children: [
                /* @__PURE__ */ jsxDEV("div", {
                  className: "grid grid-cols-1 md:grid-cols-2 gap-6",
                  children: [
                    /* @__PURE__ */ jsxDEV("div", {
                      className: "space-y-2",
                      children: [
                        /* @__PURE__ */ jsxDEV("label", {
                          className: "text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1",
                          children: [
                            "Startup Name ",
                            isFieldRequired("name") && "*"
                          ]
                        }, undefined, true, undefined, this),
                        /* @__PURE__ */ jsxDEV("input", {
                          required: isFieldRequired("name"),
                          type: "text",
                          placeholder: "Name of venture",
                          className: "w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#059669]/5 focus:border-[#059669] transition-premium",
                          value: formData.name,
                          onChange: (e) => setFormData({ ...formData, name: e.target.value })
                        }, undefined, false, undefined, this)
                      ]
                    }, undefined, true, undefined, this),
                    /* @__PURE__ */ jsxDEV("div", {
                      className: "space-y-4",
                      children: [
                        /* @__PURE__ */ jsxDEV("div", {
                          className: "space-y-2",
                          children: [
                            /* @__PURE__ */ jsxDEV("label", {
                              className: "text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1",
                              children: [
                                "Industry / Sector ",
                                isFieldRequired("industry") && "*"
                              ]
                            }, undefined, true, undefined, this),
                            /* @__PURE__ */ jsxDEV("input", {
                              required: isFieldRequired("industry"),
                              type: "text",
                              placeholder: "e.g. Fintech, AI",
                              className: "w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#059669]/5 focus:border-[#059669] transition-premium",
                              value: formData.industry,
                              onChange: (e) => setFormData({ ...formData, industry: e.target.value })
                            }, undefined, false, undefined, this)
                          ]
                        }, undefined, true, undefined, this),
                        /* @__PURE__ */ jsxDEV("label", {
                          className: "flex items-center gap-3 px-2 cursor-pointer group/toggle",
                          children: [
                            /* @__PURE__ */ jsxDEV("div", {
                              className: "relative",
                              children: [
                                /* @__PURE__ */ jsxDEV("input", {
                                  type: "checkbox",
                                  className: "sr-only peer",
                                  checked: formData.display_config?.show_industry !== false,
                                  onChange: (e) => setFormData({
                                    ...formData,
                                    display_config: { ...formData.display_config, show_industry: e.target.checked }
                                  })
                                }, undefined, false, undefined, this),
                                /* @__PURE__ */ jsxDEV("div", {
                                  className: "w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-[#059669] transition-all duration-300"
                                }, undefined, false, undefined, this),
                                /* @__PURE__ */ jsxDEV("div", {
                                  className: "absolute left-1 top-1 w-3 h-3 bg-white rounded-full peer-checked:translate-x-5 transition-transform duration-300"
                                }, undefined, false, undefined, this)
                              ]
                            }, undefined, true, undefined, this),
                            /* @__PURE__ */ jsxDEV("span", {
                              className: "text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover/toggle:text-[#059669] transition-colors",
                              children: "Show on Card / عرض على الكارت"
                            }, undefined, false, undefined, this)
                          ]
                        }, undefined, true, undefined, this)
                      ]
                    }, undefined, true, undefined, this)
                  ]
                }, undefined, true, undefined, this),
                /* @__PURE__ */ jsxDEV("div", {
                  className: "grid grid-cols-1 md:grid-cols-2 gap-6",
                  children: [
                    /* @__PURE__ */ jsxDEV("div", {
                      className: "space-y-4",
                      children: [
                        /* @__PURE__ */ jsxDEV("div", {
                          className: "space-y-2",
                          children: [
                            /* @__PURE__ */ jsxDEV("label", {
                              className: "text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1",
                              children: [
                                "Founder Name ",
                                isFieldRequired("founder") && "*"
                              ]
                            }, undefined, true, undefined, this),
                            /* @__PURE__ */ jsxDEV("input", {
                              required: isFieldRequired("founder"),
                              type: "text",
                              placeholder: "Founder Full Name",
                              className: "w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#059669]/5 focus:border-[#059669] transition-premium",
                              value: formData.founder,
                              onChange: (e) => setFormData({ ...formData, founder: e.target.value })
                            }, undefined, false, undefined, this)
                          ]
                        }, undefined, true, undefined, this),
                        /* @__PURE__ */ jsxDEV("label", {
                          className: "flex items-center gap-3 px-2 cursor-pointer group/toggle",
                          children: [
                            /* @__PURE__ */ jsxDEV("div", {
                              className: "relative",
                              children: [
                                /* @__PURE__ */ jsxDEV("input", {
                                  type: "checkbox",
                                  className: "sr-only peer",
                                  checked: formData.display_config?.show_founder !== false,
                                  onChange: (e) => setFormData({
                                    ...formData,
                                    display_config: { ...formData.display_config, show_founder: e.target.checked }
                                  })
                                }, undefined, false, undefined, this),
                                /* @__PURE__ */ jsxDEV("div", {
                                  className: "w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-[#059669] transition-all duration-300"
                                }, undefined, false, undefined, this),
                                /* @__PURE__ */ jsxDEV("div", {
                                  className: "absolute left-1 top-1 w-3 h-3 bg-white rounded-full peer-checked:translate-x-5 transition-transform duration-300"
                                }, undefined, false, undefined, this)
                              ]
                            }, undefined, true, undefined, this),
                            /* @__PURE__ */ jsxDEV("span", {
                              className: "text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover/toggle:text-[#059669] transition-colors",
                              children: "Show on Card / عرض على الكارت"
                            }, undefined, false, undefined, this)
                          ]
                        }, undefined, true, undefined, this)
                      ]
                    }, undefined, true, undefined, this),
                    /* @__PURE__ */ jsxDEV("div", {
                      className: "space-y-4",
                      children: [
                        /* @__PURE__ */ jsxDEV("div", {
                          className: "space-y-2",
                          children: [
                            /* @__PURE__ */ jsxDEV("label", {
                              className: "text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1",
                              children: [
                                "Role in Startup ",
                                isFieldRequired("role") && "*"
                              ]
                            }, undefined, true, undefined, this),
                            /* @__PURE__ */ jsxDEV("input", {
                              required: isFieldRequired("role"),
                              type: "text",
                              placeholder: "e.g. CEO, Founder",
                              className: "w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#059669]/5 focus:border-[#059669] transition-premium",
                              value: formData.role,
                              onChange: (e) => setFormData({ ...formData, role: e.target.value })
                            }, undefined, false, undefined, this)
                          ]
                        }, undefined, true, undefined, this),
                        /* @__PURE__ */ jsxDEV("label", {
                          className: "flex items-center gap-3 px-2 cursor-pointer group/toggle",
                          children: [
                            /* @__PURE__ */ jsxDEV("div", {
                              className: "relative",
                              children: [
                                /* @__PURE__ */ jsxDEV("input", {
                                  type: "checkbox",
                                  className: "sr-only peer",
                                  checked: formData.display_config?.show_role !== false,
                                  onChange: (e) => setFormData({
                                    ...formData,
                                    display_config: { ...formData.display_config, show_role: e.target.checked }
                                  })
                                }, undefined, false, undefined, this),
                                /* @__PURE__ */ jsxDEV("div", {
                                  className: "w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-[#059669] transition-all duration-300"
                                }, undefined, false, undefined, this),
                                /* @__PURE__ */ jsxDEV("div", {
                                  className: "absolute left-1 top-1 w-3 h-3 bg-white rounded-full peer-checked:translate-x-5 transition-transform duration-300"
                                }, undefined, false, undefined, this)
                              ]
                            }, undefined, true, undefined, this),
                            /* @__PURE__ */ jsxDEV("span", {
                              className: "text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover/toggle:text-[#059669] transition-colors",
                              children: "Show on Card / عرض على الكارت"
                            }, undefined, false, undefined, this)
                          ]
                        }, undefined, true, undefined, this)
                      ]
                    }, undefined, true, undefined, this)
                  ]
                }, undefined, true, undefined, this),
                /* @__PURE__ */ jsxDEV("div", {
                  className: "grid grid-cols-1 md:grid-cols-2 gap-6",
                  children: [
                    /* @__PURE__ */ jsxDEV("div", {
                      className: "space-y-4",
                      children: [
                        /* @__PURE__ */ jsxDEV("div", {
                          className: "space-y-2",
                          children: [
                            /* @__PURE__ */ jsxDEV("label", {
                              className: "text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1",
                              children: [
                                "مرحلة النمو (Stage) ",
                                isFieldRequired("stage") && "*"
                              ]
                            }, undefined, true, undefined, this),
                            /* @__PURE__ */ jsxDEV("select", {
                              required: isFieldRequired("stage"),
                              className: "w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#059669]/5 focus:border-[#059669] transition-premium",
                              value: formData.stage,
                              onChange: (e) => setFormData({ ...formData, stage: e.target.value }),
                              children: [
                                /* @__PURE__ */ jsxDEV("option", {
                                  value: "",
                                  children: "Select Stage..."
                                }, undefined, false, undefined, this),
                                /* @__PURE__ */ jsxDEV("option", {
                                  value: "ideation",
                                  children: "Ideation / Discovery (فكرة)"
                                }, undefined, false, undefined, this),
                                /* @__PURE__ */ jsxDEV("option", {
                                  value: "mvp",
                                  children: "Validation / MVP (النموذج الأولي)"
                                }, undefined, false, undefined, this),
                                /* @__PURE__ */ jsxDEV("option", {
                                  value: "early_traction",
                                  children: "Early Traction (بداية الانطلاق)"
                                }, undefined, false, undefined, this),
                                /* @__PURE__ */ jsxDEV("option", {
                                  value: "scaling",
                                  children: "Scaling / Growth (النمو والتوسع)"
                                }, undefined, false, undefined, this),
                                /* @__PURE__ */ jsxDEV("option", {
                                  value: "mature",
                                  children: "Mature / Established (مستقر)"
                                }, undefined, false, undefined, this),
                                /* @__PURE__ */ jsxDEV("option", {
                                  value: "other",
                                  children: "Other / غير ذلك"
                                }, undefined, false, undefined, this)
                              ]
                            }, undefined, true, undefined, this)
                          ]
                        }, undefined, true, undefined, this),
                        /* @__PURE__ */ jsxDEV("label", {
                          className: "flex items-center gap-3 px-2 cursor-pointer group/toggle",
                          children: [
                            /* @__PURE__ */ jsxDEV("div", {
                              className: "relative",
                              children: [
                                /* @__PURE__ */ jsxDEV("input", {
                                  type: "checkbox",
                                  className: "sr-only peer",
                                  checked: formData.display_config?.show_stage !== false,
                                  onChange: (e) => setFormData({
                                    ...formData,
                                    display_config: { ...formData.display_config, show_stage: e.target.checked }
                                  })
                                }, undefined, false, undefined, this),
                                /* @__PURE__ */ jsxDEV("div", {
                                  className: "w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-[#059669] transition-all duration-300"
                                }, undefined, false, undefined, this),
                                /* @__PURE__ */ jsxDEV("div", {
                                  className: "absolute left-1 top-1 w-3 h-3 bg-white rounded-full peer-checked:translate-x-5 transition-transform duration-300"
                                }, undefined, false, undefined, this)
                              ]
                            }, undefined, true, undefined, this),
                            /* @__PURE__ */ jsxDEV("span", {
                              className: "text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover/toggle:text-[#059669] transition-colors",
                              children: "Show on Card / عرض على الكارت"
                            }, undefined, false, undefined, this)
                          ]
                        }, undefined, true, undefined, this)
                      ]
                    }, undefined, true, undefined, this),
                    /* @__PURE__ */ jsxDEV("div", {
                      className: "space-y-4",
                      children: [
                        /* @__PURE__ */ jsxDEV("div", {
                          className: "space-y-2",
                          children: [
                            /* @__PURE__ */ jsxDEV("label", {
                              className: "text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1",
                              children: [
                                "المحافظة (Governorate) ",
                                isFieldRequired("governorate") && "*"
                              ]
                            }, undefined, true, undefined, this),
                            /* @__PURE__ */ jsxDEV("select", {
                              required: isFieldRequired("governorate"),
                              className: "w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#059669]/5 focus:border-[#059669] transition-premium appearance-none",
                              value: formData.governorate,
                              onChange: (e) => setFormData({ ...formData, governorate: e.target.value }),
                              children: [
                                /* @__PURE__ */ jsxDEV("option", {
                                  value: "",
                                  children: "اختر المحافظة..."
                                }, undefined, false, undefined, this),
                                /* @__PURE__ */ jsxDEV("option", {
                                  value: "القاهرة",
                                  children: "القاهرة"
                                }, undefined, false, undefined, this),
                                /* @__PURE__ */ jsxDEV("option", {
                                  value: "الجيزة",
                                  children: "الجيزة"
                                }, undefined, false, undefined, this),
                                /* @__PURE__ */ jsxDEV("option", {
                                  value: "الإسكندرية",
                                  children: "الإسكندرية"
                                }, undefined, false, undefined, this),
                                /* @__PURE__ */ jsxDEV("option", {
                                  value: "المنوفية",
                                  children: "المنوفية"
                                }, undefined, false, undefined, this),
                                /* @__PURE__ */ jsxDEV("option", {
                                  value: "الشرقية",
                                  children: "الشرقية"
                                }, undefined, false, undefined, this),
                                /* @__PURE__ */ jsxDEV("option", {
                                  value: "القليوبية",
                                  children: "القليوبية"
                                }, undefined, false, undefined, this),
                                /* @__PURE__ */ jsxDEV("option", {
                                  value: "الغربية",
                                  children: "الغربية"
                                }, undefined, false, undefined, this),
                                /* @__PURE__ */ jsxDEV("option", {
                                  value: "كفر الشيخ",
                                  children: "كفر الشيخ"
                                }, undefined, false, undefined, this),
                                /* @__PURE__ */ jsxDEV("option", {
                                  value: "الدقهلية",
                                  children: "الدقهلية"
                                }, undefined, false, undefined, this),
                                /* @__PURE__ */ jsxDEV("option", {
                                  value: "البحيرة",
                                  children: "البحيرة"
                                }, undefined, false, undefined, this),
                                /* @__PURE__ */ jsxDEV("option", {
                                  value: "دمياط",
                                  children: "دمياط"
                                }, undefined, false, undefined, this),
                                /* @__PURE__ */ jsxDEV("option", {
                                  value: "بورسعيد",
                                  children: "بورسعيد"
                                }, undefined, false, undefined, this),
                                /* @__PURE__ */ jsxDEV("option", {
                                  value: "الإسماعيلية",
                                  children: "الإسماعيلية"
                                }, undefined, false, undefined, this),
                                /* @__PURE__ */ jsxDEV("option", {
                                  value: "السويس",
                                  children: "السويس"
                                }, undefined, false, undefined, this),
                                /* @__PURE__ */ jsxDEV("option", {
                                  value: "الفيوم",
                                  children: "الفيوم"
                                }, undefined, false, undefined, this),
                                /* @__PURE__ */ jsxDEV("option", {
                                  value: "بني سويف",
                                  children: "بني سويف"
                                }, undefined, false, undefined, this),
                                /* @__PURE__ */ jsxDEV("option", {
                                  value: "المنيا",
                                  children: "المنيا"
                                }, undefined, false, undefined, this),
                                /* @__PURE__ */ jsxDEV("option", {
                                  value: "أسيوط",
                                  children: "أسيوط"
                                }, undefined, false, undefined, this),
                                /* @__PURE__ */ jsxDEV("option", {
                                  value: "سوهاج",
                                  children: "سوهاج"
                                }, undefined, false, undefined, this),
                                /* @__PURE__ */ jsxDEV("option", {
                                  value: "قنا",
                                  children: "قنا"
                                }, undefined, false, undefined, this),
                                /* @__PURE__ */ jsxDEV("option", {
                                  value: "الأقصر",
                                  children: "الأقصر"
                                }, undefined, false, undefined, this),
                                /* @__PURE__ */ jsxDEV("option", {
                                  value: "أسوان",
                                  children: "أسوان"
                                }, undefined, false, undefined, this),
                                /* @__PURE__ */ jsxDEV("option", {
                                  value: "البحر الأحمر",
                                  children: "البحر الأحمر"
                                }, undefined, false, undefined, this),
                                /* @__PURE__ */ jsxDEV("option", {
                                  value: "الوادي الجديد",
                                  children: "الوادي الجديد"
                                }, undefined, false, undefined, this),
                                /* @__PURE__ */ jsxDEV("option", {
                                  value: "مطروح",
                                  children: "مطروح"
                                }, undefined, false, undefined, this),
                                /* @__PURE__ */ jsxDEV("option", {
                                  value: "شمال سيناء",
                                  children: "شمال سيناء"
                                }, undefined, false, undefined, this),
                                /* @__PURE__ */ jsxDEV("option", {
                                  value: "جنوب سيناء",
                                  children: "جنوب سيناء"
                                }, undefined, false, undefined, this)
                              ]
                            }, undefined, true, undefined, this)
                          ]
                        }, undefined, true, undefined, this),
                        /* @__PURE__ */ jsxDEV("label", {
                          className: "flex items-center gap-3 px-2 cursor-pointer group/toggle",
                          children: [
                            /* @__PURE__ */ jsxDEV("div", {
                              className: "relative",
                              children: [
                                /* @__PURE__ */ jsxDEV("input", {
                                  type: "checkbox",
                                  className: "sr-only peer",
                                  checked: formData.display_config?.show_governorate !== false,
                                  onChange: (e) => setFormData({
                                    ...formData,
                                    display_config: { ...formData.display_config, show_governorate: e.target.checked }
                                  })
                                }, undefined, false, undefined, this),
                                /* @__PURE__ */ jsxDEV("div", {
                                  className: "w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-[#059669] transition-all duration-300"
                                }, undefined, false, undefined, this),
                                /* @__PURE__ */ jsxDEV("div", {
                                  className: "absolute left-1 top-1 w-3 h-3 bg-white rounded-full peer-checked:translate-x-5 transition-transform duration-300"
                                }, undefined, false, undefined, this)
                              ]
                            }, undefined, true, undefined, this),
                            /* @__PURE__ */ jsxDEV("span", {
                              className: "text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover/toggle:text-[#059669] transition-colors",
                              children: "Show on Card / عرض على الكارت"
                            }, undefined, false, undefined, this)
                          ]
                        }, undefined, true, undefined, this)
                      ]
                    }, undefined, true, undefined, this)
                  ]
                }, undefined, true, undefined, this),
                /* @__PURE__ */ jsxDEV("div", {
                  className: "space-y-4",
                  children: [
                    /* @__PURE__ */ jsxDEV("div", {
                      className: "space-y-2",
                      children: [
                        /* @__PURE__ */ jsxDEV("label", {
                          className: "text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1",
                          children: [
                            "Description / Bio ",
                            isFieldRequired("description") && "*"
                          ]
                        }, undefined, true, undefined, this),
                        /* @__PURE__ */ jsxDEV("textarea", {
                          required: isFieldRequired("description"),
                          className: "w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#059669]/5 focus:border-[#059669] transition-premium min-h-[120px]",
                          placeholder: "Describe the disruptive potential...",
                          value: formData.description,
                          onChange: (e) => setFormData({ ...formData, description: e.target.value })
                        }, undefined, false, undefined, this)
                      ]
                    }, undefined, true, undefined, this),
                    /* @__PURE__ */ jsxDEV("label", {
                      className: "flex items-center gap-3 px-2 cursor-pointer group/toggle",
                      children: [
                        /* @__PURE__ */ jsxDEV("div", {
                          className: "relative",
                          children: [
                            /* @__PURE__ */ jsxDEV("input", {
                              type: "checkbox",
                              className: "sr-only peer",
                              checked: formData.display_config?.show_description !== false,
                              onChange: (e) => setFormData({
                                ...formData,
                                display_config: { ...formData.display_config, show_description: e.target.checked }
                              })
                            }, undefined, false, undefined, this),
                            /* @__PURE__ */ jsxDEV("div", {
                              className: "w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-[#059669] transition-all duration-300"
                            }, undefined, false, undefined, this),
                            /* @__PURE__ */ jsxDEV("div", {
                              className: "absolute left-1 top-1 w-3 h-3 bg-white rounded-full peer-checked:translate-x-5 transition-transform duration-300"
                            }, undefined, false, undefined, this)
                          ]
                        }, undefined, true, undefined, this),
                        /* @__PURE__ */ jsxDEV("span", {
                          className: "text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover/toggle:text-[#059669] transition-colors",
                          children: "Show on Card / عرض على الكارت"
                        }, undefined, false, undefined, this)
                      ]
                    }, undefined, true, undefined, this)
                  ]
                }, undefined, true, undefined, this),
                /* @__PURE__ */ jsxDEV("div", {
                  className: "space-y-3",
                  children: [
                    /* @__PURE__ */ jsxDEV("div", {
                      className: "flex items-center justify-between",
                      children: [
                        /* @__PURE__ */ jsxDEV("div", {
                          className: "flex items-center gap-4",
                          children: [
                            /* @__PURE__ */ jsxDEV("label", {
                              className: "text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1",
                              children: "Links / روابط"
                            }, undefined, false, undefined, this),
                            /* @__PURE__ */ jsxDEV("label", {
                              className: "flex items-center gap-2 cursor-pointer group/toggle opacity-60 hover:opacity-100 transition-opacity",
                              children: [
                                /* @__PURE__ */ jsxDEV("div", {
                                  className: "relative scale-75 origin-left",
                                  children: [
                                    /* @__PURE__ */ jsxDEV("input", {
                                      type: "checkbox",
                                      className: "sr-only peer",
                                      checked: formData.display_config?.show_links !== false,
                                      onChange: (e) => setFormData({
                                        ...formData,
                                        display_config: { ...formData.display_config, show_links: e.target.checked }
                                      })
                                    }, undefined, false, undefined, this),
                                    /* @__PURE__ */ jsxDEV("div", {
                                      className: "w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-[#059669] transition-all duration-300"
                                    }, undefined, false, undefined, this),
                                    /* @__PURE__ */ jsxDEV("div", {
                                      className: "absolute left-1 top-1 w-3 h-3 bg-white rounded-full peer-checked:translate-x-5 transition-transform duration-300"
                                    }, undefined, false, undefined, this)
                                  ]
                                }, undefined, true, undefined, this),
                                /* @__PURE__ */ jsxDEV("span", {
                                  className: "text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover/toggle:text-[#059669] transition-colors",
                                  children: "Visible"
                                }, undefined, false, undefined, this)
                              ]
                            }, undefined, true, undefined, this)
                          ]
                        }, undefined, true, undefined, this),
                        /* @__PURE__ */ jsxDEV("button", {
                          type: "button",
                          onClick: () => setFormData((prev) => ({ ...prev, links: [...prev.links || [], { label: "", url: "", icon: "globe" }] })),
                          className: "text-[10px] font-black uppercase tracking-widest text-[#059669] hover:text-[#0d0e0e] transition-colors flex items-center gap-1",
                          children: [
                            /* @__PURE__ */ jsxDEV("span", {
                              className: "text-lg leading-none",
                              children: "+"
                            }, undefined, false, undefined, this),
                            " Add Link"
                          ]
                        }, undefined, true, undefined, this)
                      ]
                    }, undefined, true, undefined, this),
                    (formData.links || []).map((link, idx) => /* @__PURE__ */ jsxDEV("div", {
                      className: "flex gap-2 items-center flex-wrap md:flex-nowrap",
                      children: [
                        /* @__PURE__ */ jsxDEV("select", {
                          className: "w-12 md:w-auto px-2 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#059669]/5 focus:border-[#059669] transition-premium shrink-0",
                          value: link.icon || "globe",
                          onChange: (e) => {
                            const updated = [...formData.links];
                            updated[idx] = { ...updated[idx], icon: e.target.value };
                            setFormData((prev) => ({ ...prev, links: updated }));
                          },
                          children: [
                            /* @__PURE__ */ jsxDEV("option", {
                              value: "globe",
                              children: "\uD83C\uDF10"
                            }, undefined, false, undefined, this),
                            /* @__PURE__ */ jsxDEV("option", {
                              value: "facebook",
                              children: "\uD83D\uDCD8"
                            }, undefined, false, undefined, this),
                            /* @__PURE__ */ jsxDEV("option", {
                              value: "linkedin",
                              children: "\uD83D\uDCBC"
                            }, undefined, false, undefined, this),
                            /* @__PURE__ */ jsxDEV("option", {
                              value: "twitter",
                              children: "\uD83D\uDC26"
                            }, undefined, false, undefined, this),
                            /* @__PURE__ */ jsxDEV("option", {
                              value: "instagram",
                              children: "\uD83D\uDCF8"
                            }, undefined, false, undefined, this),
                            /* @__PURE__ */ jsxDEV("option", {
                              value: "youtube",
                              children: "\uD83D\uDCFA"
                            }, undefined, false, undefined, this),
                            /* @__PURE__ */ jsxDEV("option", {
                              value: "github",
                              children: "\uD83D\uDCBB"
                            }, undefined, false, undefined, this)
                          ]
                        }, undefined, true, undefined, this),
                        /* @__PURE__ */ jsxDEV("input", {
                          type: "text",
                          placeholder: "Label (e.g. Website, Pitch Deck)",
                          className: "w-28 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#059669]/5 focus:border-[#059669] transition-premium shrink-0",
                          value: link.label,
                          onChange: (e) => {
                            const updated = [...formData.links];
                            updated[idx] = { ...updated[idx], label: e.target.value };
                            setFormData((prev) => ({ ...prev, links: updated }));
                          }
                        }, undefined, false, undefined, this),
                        /* @__PURE__ */ jsxDEV("input", {
                          type: "url",
                          placeholder: "https://...",
                          className: "flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#059669]/5 focus:border-[#059669] transition-premium min-w-[200px]",
                          value: link.url,
                          onChange: (e) => {
                            const updated = [...formData.links];
                            updated[idx] = { ...updated[idx], url: e.target.value };
                            setFormData((prev) => ({ ...prev, links: updated }));
                          }
                        }, undefined, false, undefined, this),
                        /* @__PURE__ */ jsxDEV("button", {
                          type: "button",
                          onClick: () => setFormData((prev) => ({ ...prev, links: prev.links.filter((_, i) => i !== idx) })),
                          className: "w-10 h-10 rounded-xl border border-slate-100 text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-all flex items-center justify-center shrink-0",
                          children: "×"
                        }, undefined, false, undefined, this)
                      ]
                    }, idx, true, undefined, this)),
                    (!formData.links || formData.links.length === 0) && /* @__PURE__ */ jsxDEV("p", {
                      className: "text-xs text-slate-400 italic px-2",
                      children: 'لا يوجد روابط بعد — اضغط "Add Link" لإضافة رابط'
                    }, undefined, false, undefined, this)
                  ]
                }, undefined, true, undefined, this),
                /* @__PURE__ */ jsxDEV("div", {
                  className: "space-y-2",
                  children: [
                    /* @__PURE__ */ jsxDEV("label", {
                      className: "text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1",
                      children: [
                        "Company Logo ",
                        isFieldRequired("logo_url") && "*"
                      ]
                    }, undefined, true, undefined, this),
                    /* @__PURE__ */ jsxDEV("div", {
                      className: "flex gap-3",
                      children: [
                        /* @__PURE__ */ jsxDEV("div", {
                          className: "relative flex-1",
                          children: [
                            /* @__PURE__ */ jsxDEV("input", {
                              required: isFieldRequired("logo_url"),
                              type: "text",
                              placeholder: "Upload logo or paste URL",
                              className: "w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#059669]/5 focus:border-[#059669] transition-premium pr-12",
                              value: formData.logo_url,
                              onChange: (e) => setFormData({ ...formData, logo_url: e.target.value })
                            }, undefined, false, undefined, this),
                            formData.logo_url && /* @__PURE__ */ jsxDEV("div", {
                              className: "absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white",
                              children: /* @__PURE__ */ jsxDEV(Check, {
                                size: 12
                              }, undefined, false, undefined, this)
                            }, undefined, false, undefined, this)
                          ]
                        }, undefined, true, undefined, this),
                        /* @__PURE__ */ jsxDEV("label", {
                          className: "shrink-0 flex items-center justify-center w-14 h-14 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-[#059669] hover:border-[#059669] cursor-pointer transition-premium",
                          children: [
                            /* @__PURE__ */ jsxDEV("input", {
                              type: "file",
                              className: "hidden",
                              accept: "image/*",
                              onChange: handleFileChange,
                              disabled: isUploading
                            }, undefined, false, undefined, this),
                            isUploading ? /* @__PURE__ */ jsxDEV(Loader2, {
                              size: 18,
                              className: "animate-spin"
                            }, undefined, false, undefined, this) : /* @__PURE__ */ jsxDEV(Upload, {
                              size: 18
                            }, undefined, false, undefined, this)
                          ]
                        }, undefined, true, undefined, this)
                      ]
                    }, undefined, true, undefined, this)
                  ]
                }, undefined, true, undefined, this),
                /* @__PURE__ */ jsxDEV("div", {
                  className: "pt-6 flex gap-4",
                  children: [
                    /* @__PURE__ */ jsxDEV("button", {
                      type: "button",
                      onClick: () => setShowAddModal(false),
                      className: "flex-1 px-8 py-5 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-premium",
                      children: "Cancel"
                    }, undefined, false, undefined, this),
                    /* @__PURE__ */ jsxDEV("button", {
                      disabled: isSubmitting,
                      type: "submit",
                      className: "flex-[2] px-8 py-5 bg-[#059669] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#0d0e0e] shadow-2xl shadow-emerald-100 transition-premium flex items-center justify-center gap-3 active:scale-95",
                      children: isSubmitting ? /* @__PURE__ */ jsxDEV(Fragment, {
                        children: [
                          /* @__PURE__ */ jsxDEV(Loader2, {
                            size: 16,
                            className: "animate-spin"
                          }, undefined, false, undefined, this),
                          /* @__PURE__ */ jsxDEV("span", {
                            children: editingCompany ? "Synchronizing..." : "Deploying Venture..."
                          }, undefined, false, undefined, this)
                        ]
                      }, undefined, true, undefined, this) : /* @__PURE__ */ jsxDEV("span", {
                        children: editingCompany ? "Update Startup" : "Deploy to Ecosystem"
                      }, undefined, false, undefined, this)
                    }, undefined, false, undefined, this)
                  ]
                }, undefined, true, undefined, this)
              ]
            }, undefined, true, undefined, this)
          ]
        }, undefined, true, undefined, this)
      }, undefined, false, undefined, this),
      showPreview && selectedSubmission && /* @__PURE__ */ jsxDEV("div", {
        className: "fixed inset-0 z-[100] flex items-center justify-center p-4",
        children: [
          /* @__PURE__ */ jsxDEV("div", {
            className: "absolute inset-0 bg-[#0d0e0e]/40 backdrop-blur-md",
            onClick: () => setShowPreview(false)
          }, undefined, false, undefined, this),
          /* @__PURE__ */ jsxDEV("div", {
            className: "bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative overflow-hidden animate-in zoom-in duration-300",
            children: [
              /* @__PURE__ */ jsxDEV("div", {
                className: "h-24 bg-gradient-to-r from-[#059669] to-[#10b981]"
              }, undefined, false, undefined, this),
              /* @__PURE__ */ jsxDEV("div", {
                className: "p-12 -mt-12",
                children: [
                  /* @__PURE__ */ jsxDEV("div", {
                    className: "flex justify-between items-start mb-10",
                    children: [
                      /* @__PURE__ */ jsxDEV("div", {
                        className: "p-2 bg-white rounded-[2rem] shadow-xl",
                        children: /* @__PURE__ */ jsxDEV("div", {
                          className: "w-[124px] h-[124px] rounded-[1.5rem] bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100",
                          children: /* @__PURE__ */ jsxDEV(LazyImage, {
                            src: selectedSubmission.logo_url ? getGoogleDriveFallbackUrls(selectedSubmission.logo_url)[0] : null,
                            urls: selectedSubmission.logo_url ? getGoogleDriveFallbackUrls(selectedSubmission.logo_url) : [],
                            alt: selectedSubmission.startup_name || "",
                            objectFit: "contain",
                            padding: true,
                            fallback: /* @__PURE__ */ jsxDEV(Database, {
                              size: 40,
                              className: "text-slate-200"
                            }, undefined, false, undefined, this)
                          }, undefined, false, undefined, this)
                        }, undefined, false, undefined, this)
                      }, undefined, false, undefined, this),
                      /* @__PURE__ */ jsxDEV("button", {
                        onClick: () => setShowPreview(false),
                        className: "p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-400 transition-premium",
                        children: /* @__PURE__ */ jsxDEV(XCircle, {
                          size: 20
                        }, undefined, false, undefined, this)
                      }, undefined, false, undefined, this)
                    ]
                  }, undefined, true, undefined, this),
                  /* @__PURE__ */ jsxDEV("div", {
                    className: "mb-8",
                    children: [
                      /* @__PURE__ */ jsxDEV("h2", {
                        className: "text-3xl font-black text-[#0d0e0e] tracking-tight mb-2",
                        children: selectedSubmission.startup_name
                      }, undefined, false, undefined, this),
                      /* @__PURE__ */ jsxDEV("p", {
                        className: "text-slate-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2",
                        children: [
                          /* @__PURE__ */ jsxDEV(Clock, {
                            size: 14
                          }, undefined, false, undefined, this),
                          " Submitting Pulse from Form Link"
                        ]
                      }, undefined, true, undefined, this)
                    ]
                  }, undefined, true, undefined, this),
                  /* @__PURE__ */ jsxDEV("div", {
                    className: "space-y-6 max-h-[40vh] overflow-y-auto pr-4 custom-scrollbar mb-10",
                    children: [
                      /* @__PURE__ */ jsxDEV("div", {
                        className: "grid grid-cols-2 gap-4",
                        children: [
                          /* @__PURE__ */ jsxDEV("div", {
                            className: "p-6 bg-slate-50 rounded-2xl col-span-2",
                            children: [
                              /* @__PURE__ */ jsxDEV("p", {
                                className: "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1",
                                children: "Company Persona / Description"
                              }, undefined, false, undefined, this),
                              /* @__PURE__ */ jsxDEV("p", {
                                className: "font-bold text-[#0d0e0e] leading-relaxed italic",
                                children: selectedSubmission.description || selectedSubmission.additional_data?.description || selectedSubmission.additional_data?.bio || "No description provided."
                              }, undefined, false, undefined, this)
                            ]
                          }, undefined, true, undefined, this),
                          /* @__PURE__ */ jsxDEV("div", {
                            className: "p-6 bg-slate-50 rounded-2xl",
                            children: [
                              /* @__PURE__ */ jsxDEV("p", {
                                className: "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1",
                                children: "Industry"
                              }, undefined, false, undefined, this),
                              /* @__PURE__ */ jsxDEV("p", {
                                className: "font-bold text-[#0d0e0e]",
                                children: selectedSubmission.industry || "Not Specified"
                              }, undefined, false, undefined, this)
                            ]
                          }, undefined, true, undefined, this),
                          /* @__PURE__ */ jsxDEV("div", {
                            className: "p-6 bg-slate-50 rounded-2xl",
                            children: [
                              /* @__PURE__ */ jsxDEV("p", {
                                className: "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1",
                                children: "Location"
                              }, undefined, false, undefined, this),
                              /* @__PURE__ */ jsxDEV("p", {
                                className: "font-bold text-[#0d0e0e]",
                                children: selectedSubmission.location || "Not Specified"
                              }, undefined, false, undefined, this)
                            ]
                          }, undefined, true, undefined, this)
                        ]
                      }, undefined, true, undefined, this),
                      selectedSubmission.additional_data && /* @__PURE__ */ jsxDEV("div", {
                        className: "space-y-4",
                        children: [
                          /* @__PURE__ */ jsxDEV("p", {
                            className: "text-[10px] font-black text-[#059669] uppercase tracking-[0.2em]",
                            children: "Transmission Payload"
                          }, undefined, false, undefined, this),
                          /* @__PURE__ */ jsxDEV("div", {
                            className: "grid grid-cols-1 gap-3",
                            children: Object.entries(selectedSubmission.additional_data).map(([key, value]) => {
                              if (key === "_column_order" || key === "description" || key === "bio" || typeof value === "object")
                                return null;
                              return /* @__PURE__ */ jsxDEV("div", {
                                className: "p-5 bg-slate-50 border border-slate-100 rounded-2xl",
                                children: [
                                  /* @__PURE__ */ jsxDEV("p", {
                                    className: "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1",
                                    children: key.replace(/_/g, " ")
                                  }, undefined, false, undefined, this),
                                  /* @__PURE__ */ jsxDEV("p", {
                                    className: "font-bold text-[#0d0e0e] break-words",
                                    children: String(value)
                                  }, undefined, false, undefined, this)
                                ]
                              }, key, true, undefined, this);
                            })
                          }, undefined, false, undefined, this)
                        ]
                      }, undefined, true, undefined, this)
                    ]
                  }, undefined, true, undefined, this),
                  /* @__PURE__ */ jsxDEV("div", {
                    className: "flex items-center gap-4",
                    children: [
                      /* @__PURE__ */ jsxDEV("button", {
                        onClick: () => {
                          handleApproveCompany(selectedSubmission);
                          setShowPreview(false);
                        },
                        className: "flex-1 py-5 bg-[#059669] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-[#0d0e0e] transition-premium shadow-xl shadow-emerald-200/50",
                        children: "Authorize Entry"
                      }, undefined, false, undefined, this),
                      /* @__PURE__ */ jsxDEV("button", {
                        onClick: () => {
                          handleRejectCompany(selectedSubmission);
                          setShowPreview(false);
                        },
                        className: "px-10 py-5 bg-white text-rose-500 border border-slate-100 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-rose-50 transition-premium",
                        children: "Block"
                      }, undefined, false, undefined, this)
                    ]
                  }, undefined, true, undefined, this)
                ]
              }, undefined, true, undefined, this)
            ]
          }, undefined, true, undefined, this)
        ]
      }, undefined, true, undefined, this)
    ]
  }, undefined, true, undefined, this);
};
var StartupManager_default = StartupManager;
export {
  StartupManager_default as default
};
