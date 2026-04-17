import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Upload, Calendar, Clock, User, Save, ExternalLink, Edit2, UserCheck, UserX, Copy, Check, FileSpreadsheet, Download, UploadCloud, Loader2, AlertTriangle, AlertCircle, X, List, GripVertical, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    getEventDays,
    getAgendaSlots,
    createDay,
    createSlot,
    updateSlot,
    updateDay,
    deleteDay,
    deleteSlot,
    updateEvent,
    getEvent,
    uploadImage,
    importAgendaData,
    syncEventFromCloud
} from '../lib/api';
import { formatDate, formatTime, getGoogleDriveDirectLink } from '../lib/utils';
import { generateAgendaTemplate, parseAgendaExcel, fetchAndParseGoogleSheet } from '../lib/excel';
import { updateSlotsOrder } from '../lib/api';

// DnD Kit Imports
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Slot Component
function SortableSlot({ slot, onEdit, onDelete, onTogglePresenter, isInvalid }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: slot.slot_id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.5 : 1
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group/slot flex flex-col md:flex-row md:items-center justify-between p-5 bg-white border rounded-2xl gap-6 hover:border-[#1a27c9] transition-premium shadow-sm hover:shadow-lg hover:shadow-indigo-50/50 
                ${isDragging ? 'shadow-2xl border-[#1a27c9] scale-[1.02]' : ''}
                ${isInvalid ? 'border-red-500 shadow-lg shadow-red-50 ring-1 ring-red-500/20 bg-red-50/5' : 'border-slate-100'}
            `}
        >
            <div className="flex-1 flex flex-col md:flex-row md:items-center gap-6 w-full">
                {/* Drag Handle */}
                <div 
                    {...attributes} 
                    {...listeners} 
                    className="cursor-grab active:cursor-grabbing p-2 -ml-2 text-slate-300 hover:text-slate-500 transition-colors shrink-0"
                >
                    <GripVertical size={20} />
                </div>

                {/* Time Indicator */}
                <div className="flex items-center gap-3 text-[#1a27c9] min-w-[160px] bg-indigo-50/50 px-4 py-2.5 rounded-xl font-black text-sm">
                    <Clock size={16} />
                    <span className="whitespace-nowrap">
                        {formatTime(slot.start_time)} — {formatTime(slot.end_time)}
                    </span>
                </div>

                {/* Slot Content */}
                <div className="flex-1 min-w-[200px]">
                    <p className="text-lg font-extrabold text-[#0d0e0e] leading-tight mb-1">{slot.slot_title}</p>
                    {slot.bullet_points?.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-1">
                            <List size={12} className="text-indigo-400" />
                            <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest">{slot.bullet_points.length} نقطة</span>
                        </div>
                    )}
                    {slot.presenter_name && (
                        <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">
                            <User size={14} className="text-[#1a27c9]" />
                            <span>{slot.presenter_name}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end opacity-60 group-hover/slot:opacity-100 transition-opacity">
                {slot.presenter_name && (
                    <button
                        onClick={() => onTogglePresenter(slot)}
                        className={`p-2.5 rounded-xl transition-premium border active:scale-95 ${slot.show_presenter
                            ? 'text-emerald-600 bg-emerald-50 border-emerald-100 hover:bg-emerald-100'
                            : 'text-slate-400 bg-slate-50 border-slate-100 hover:bg-slate-100'
                            }`}
                        title={slot.show_presenter ? 'Hide Speaker' : 'Show Speaker'}
                    >
                        {slot.show_presenter ? <UserCheck size={20} /> : <UserX size={20} />}
                    </button>
                )}
                <button
                    onClick={() => onEdit(slot)}
                    className="p-2.5 text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-xl hover:bg-indigo-100 transition-premium active:scale-95"
                    title="Edit Details"
                >
                    <Edit2 size={20} />
                </button>
                <button
                    onClick={() => onDelete(slot.slot_id)}
                    className="p-2.5 text-red-500 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-premium active:scale-95"
                    title="Remove Slot"
                >
                    <Trash2 size={20} />
                </button>
            </div>
        </div>
    );
}

export default function EventBuilder({ event, onBack }) {
    const navigate = useNavigate();
    const [days, setDays] = useState([]);
    const [slots, setSlots] = useState({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('days');
    const [isSubmittingDay, setIsSubmittingDay] = useState(false);

    const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
        const hours = Math.floor(i / 2).toString().padStart(2, '0');
        const minutes = (i % 2 === 0 ? '00' : '30');
        return `${hours}:${minutes}`;
    });

    // Form states
    const [newDayName, setNewDayName] = useState('');
    const [newDayDate, setNewDayDate] = useState('');
    const [selectedDay, setSelectedDay] = useState(null);
    const [dayError, setDayError] = useState(false);

    const [slotModal, setSlotModal] = useState({
        show: false,
        isEditing: false,
        slotId: null,
        dayId: null,
        startTime: '09:00',
        endTime: '10:00',
        title: '',
        presenter: '',
        bulletPoints: [],
        saving: false
    });
    const [eventDetails, setEventDetails] = useState(event);


    // Day Editing State
    const [editingDayId, setEditingDayId] = useState(null);
    const [editDayName, setEditDayName] = useState('');
    const [editDayDate, setEditDayDate] = useState('');

    const [isUploading, setIsUploading] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [gsheetsUrl, setGsheetsUrl] = useState('');
    const [lastSyncTime, setLastSyncTime] = useState(null);
    const [syncReport, setSyncReport] = useState(null);
    const [syncError, setSyncError] = useState(null);
    const [showDayNames, setShowDayNames] = useState(event?.show_day_names !== false);

    // Staging and Validation States
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [pendingDeletions, setPendingDeletions] = useState([]);
    const [pendingDayDeletions, setPendingDayDeletions] = useState([]);
    const [invalidSlotIds, setInvalidSlotIds] = useState(new Set());

    // Custom UI Dialogs State
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [confirmState, setConfirmState] = useState({ show: false, message: '', onConfirm: null });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
    };

    const askConfirm = (message, onConfirm) => {
        setConfirmState({ show: true, message, onConfirm });
    };


    const handleImportExcel = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const data = await parseAgendaExcel(file);
            await importAgendaData(event.event_id, data);
            showToast('تم استيراد البيانات بنجاح! 🚀');
            loadEventData(); // Refresh UI
        } catch (error) {
            console.error('Import failed:', error);
            showToast(`فشل الاستيراد: ${error.message}`, 'error');
        } finally {
            setIsUploading(false);
        }
    };

    const handleGoogleSheetSync = async () => {
        if (!eventDetails?.gsheets_url) {
            setSyncError({ message: 'يرجى ضبط رابط Google Sheet من لوحة التحكم (Event Dashboard) أولاً.' });
            return;
        }

        try {
            setIsSyncing(true);
            setSyncReport(null);
            setSyncError(null);

            const data = await fetchAndParseGoogleSheet(eventDetails.gsheets_url);
            const result = await importAgendaData(event.event_id, data);

            setSyncReport(result.stats);
            setLastSyncTime(new Date().toLocaleTimeString());
            loadEventData();
        } catch (error) {
            console.error('GSheets Sync failed:', error);
            setSyncError(error);
        } finally {
            setIsSyncing(false);
        }
    };

    useEffect(() => {
        loadEventData();

        // Load persisted URL from event details
        if (eventDetails?.gsheets_url) {
            setGsheetsUrl(eventDetails.gsheets_url);
        }
    }, [event.event_id, eventDetails?.gsheets_url]);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges]);

    const loadEventData = async (silent = false) => {
        try {
            if (!silent) setLoading(true);

            // If we don't have full event details, fetch them
            if (!eventDetails.event_name) {
                const fullEvent = await getEvent(event.event_id);
                if (fullEvent) {
                    setEventDetails(fullEvent);
                    setShowDayNames(fullEvent.show_day_names !== false);
                }
            } else {
                setShowDayNames(eventDetails.show_day_names !== false);
            }

            const daysData = await getEventDays(event.event_id);
            setDays(Array.isArray(daysData) ? daysData : []);

            // Load slots for all days in parallel
            if (daysData && daysData.length > 0) {
                const slotsPromises = daysData.map(day => getAgendaSlots(day.day_id));
                const allSlots = await Promise.all(slotsPromises);

                const slotsData = {};
                daysData.forEach((day, index) => {
                    slotsData[day.day_id] = allSlots[index] || [];
                });
                setSlots(slotsData);
            }
        } catch (error) {
            console.error('Error loading event data:', error);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const handleAddDay = () => {
        if (!newDayName.trim()) {
            setDayError(true);
            setTimeout(() => setDayError(false), 3000);
            return;
        }

        const tempId = `day-temp-${Date.now()}`;
        const newDay = {
            day_id: tempId,
            day_name: newDayName,
            day_date: newDayDate || new Date().toISOString().split('T')[0],
            day_number: days.length + 1,
            event_id: event.event_id,
            isOptimistic: true // Mark as new for handleFinalSave
        };

        setDays(prev => [...prev, newDay]);
        setSlots(prev => ({ ...prev, [tempId]: [] }));
        
        // Clear inputs immediately
        setNewDayName('');
        setNewDayDate(new Date().toISOString().split('T')[0]);
        setDayError(false);
        setHasUnsavedChanges(true);
        showToast('تم إضافة اليوم إلى المسودة');
    };

    const handleOpenSlotModal = (dayId) => {
        setSlotModal({
            show: true,
            isEditing: false,
            slotId: null,
            dayId,
            startTime: '09:00',
            endTime: '10:00',
            title: '',
            presenter: '',
            saving: false
        });
    };

    const handleEditSlot = (slot) => {
        setSlotModal({
            show: true,
            isEditing: true,
            slotId: slot.slot_id,
            dayId: slot.day_id,
            startTime: slot.start_time,
            endTime: slot.end_time,
            title: slot.slot_title,
            presenter: slot.presenter_name || '',
            bulletPoints: slot.bullet_points || [],
            saving: false
        });
    };

    const handleSaveSlot = async () => {
        const { dayId, startTime, endTime, title, presenter, bulletPoints, isEditing, slotId } = slotModal;
        if (!startTime || !endTime || !title) return;
        // Filter out empty bullet points before saving
        const cleanBullets = (bulletPoints || []).filter(b => b.trim() !== '');

        try {
            // Store previous state for rollback
            const previousSlots = { ...slots };

            // Optimistic UI Update
            if (isEditing) {
                setSlots(prev => ({
                    ...prev,
                    [dayId]: prev[dayId].map(s => s.slot_id === slotId ? {
                        ...s,
                        start_time: startTime,
                        end_time: endTime,
                        slot_title: title,
                        presenter_name: presenter,
                        bullet_points: cleanBullets
                    } : s)
                }));
            } else {
                const tempId = `temp-${Date.now()}`;
                const newSlot = {
                    slot_id: tempId,
                    day_id: dayId,
                    start_time: startTime,
                    end_time: endTime,
                    slot_title: title,
                    presenter_name: presenter,
                    show_presenter: !!presenter,
                    bullet_points: cleanBullets,
                    isOptimistic: true
                };
                setSlots(prev => ({
                    ...prev,
                    [dayId]: [...(prev[dayId] || []), newSlot].sort((a, b) => a.start_time.localeCompare(b.start_time))
                }));
            }

            // Close modal immediately
            setSlotModal(prev => ({ ...prev, show: false, saving: false }));

            // Process API in background
            // DISABLED FOR STAGING - Now only updating local state
            /*
            if (isEditing) {
                await updateSlot(slotId, {
                    start_time: startTime,
                    end_time: endTime,
                    slot_title: title,
                    presenter_name: presenter,
                    bullet_points: cleanBullets
                });
            } else {
                await createSlot({
                    day_id: dayId,
                    start_time: startTime,
                    end_time: endTime,
                    slot_title: title,
                    presenter_name: presenter,
                    bullet_points: cleanBullets,
                    sort_order: (slots[dayId]?.length || 0) + 1
                });
            }
            loadEventData(true);
            */

            setHasUnsavedChanges(true);
            validateAgendaOrder(dayId);
        } catch (error) {
            console.error('Error saving slot:', error);
            // Rollback on failure
            setSlots(previousSlots);
            showToast('حدث خطأ أثناء حفظ الفقرة. يرجى المحاولة مرة أخرى.', 'error');
        }
    };

    const handleDeleteDay = (dayId) => {
        askConfirm('متأكد إنك عايز تمسح اليوم ده؟ كل الفقرات اللي جواه هتتمسح.', async () => {
            // Track deletion if it's a real day (not temp)
            const dayToDelete = days.find(d => d.day_id === dayId);
            if (dayToDelete && !dayToDelete.isOptimistic) {
                setPendingDayDeletions(prev => [...prev, dayId]);
            }

            setDays(prev => prev.filter(day => day.day_id !== dayId));
            setSlots(prev => {
                const newSlots = { ...prev };
                delete newSlots[dayId];
                return newSlots;
            });

            setHasUnsavedChanges(true);
            showToast('تم حذف اليوم من المسودة (اضغط حفظ للتأكيد النهائي)');
        });
    };

    const handleDeleteSlot = (slotId) => {
        askConfirm('متأكد إنك عايز تمسح الفقرة دي؟', async () => {
            // Find slot to track deletion
            let deletedSlot = null;
            Object.values(slots).forEach(daySlots => {
                const found = daySlots.find(s => s.slot_id === slotId);
                if (found) deletedSlot = found;
            });

            if (deletedSlot && !deletedSlot.isOptimistic) {
                setPendingDeletions(prev => [...prev, slotId]);
            }

            setSlots(prev => {
                const newSlots = { ...prev };
                Object.keys(newSlots).forEach(dayId => {
                    newSlots[dayId] = newSlots[dayId].filter(slot => slot.slot_id !== slotId);
                });
                return newSlots;
            });

            setHasUnsavedChanges(true);
            showToast('تم حذف الفقرة من المسودة (اضغط حفظ للتأكيد النهائي)');
        });
    };


    const handleStartEditDay = (day) => {
        setEditingDayId(day.day_id);
        setEditDayName(day.day_name);
        setEditDayDate(day.day_date);
    };

    const handleUpdateDay = () => {
        if (!editDayName.trim()) return;

        setDays(prev => prev.map(d => 
            d.day_id === editingDayId 
                ? { ...d, day_name: editDayName, day_date: editDayDate } 
                : d
        ));

        setHasUnsavedChanges(true);
        showToast('تم تحديث بيانات اليوم في المسودة');
    };

    const handleTogglePresenter = (slot) => {
        const newStatus = !slot.show_presenter;
        setSlots(prev => ({
            ...prev,
            [slot.day_id]: prev[slot.day_id].map(s => 
                s.slot_id === slot.slot_id ? { ...s, show_presenter: newStatus } : s
            )
        }));
        
        setHasUnsavedChanges(true);
    };

    const handleToggleDayNames = async () => {
        const newValue = !showDayNames;
        setShowDayNames(newValue);
        setEventDetails(prev => ({ ...prev, show_day_names: newValue }));
        setHasUnsavedChanges(true);
    };

    const agendaUrl = `${window.location.href.split('#')[0].replace(/\/$/, '')}/#/agenda/${event.event_id}`;

    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(agendaUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Validation Helper
    const validateAgendaOrder = (dayId, updatedSlots = null) => {
        const currentSlots = updatedSlots || slots[dayId] || [];
        const newInvalidIds = new Set(invalidSlotIds);
        
        // Clear previous invalid IDs for this day
        if (slots[dayId]) {
            slots[dayId].forEach(s => newInvalidIds.delete(s.slot_id));
        }

        let isLogical = true;
        for (let i = 0; i < currentSlots.length - 1; i++) {
            const current = currentSlots[i];
            const next = currentSlots[i + 1];
            
            // Compare times (HH:MM)
            if (current.start_time > next.start_time) {
                isLogical = false;
                newInvalidIds.add(current.slot_id);
                newInvalidIds.add(next.slot_id);
            }
        }

        setInvalidSlotIds(newInvalidIds);
        return isLogical;
    };

    // DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        if (!active || !over || active.id === over.id) return;

        // Find which day this slot belongs to
        let targetDayId = null;
        Object.keys(slots).forEach(dayId => {
            if (slots[dayId].some(s => s.slot_id === active.id)) {
                targetDayId = dayId;
            }
        });

        if (!targetDayId) return;

        const daySlots = [...slots[targetDayId]];
        const oldIndex = daySlots.findIndex(s => s.slot_id === active.id);
        const newIndex = daySlots.findIndex(s => s.slot_id === over.id);

        const newDaySlots = arrayMove(daySlots, oldIndex, newIndex);

        // Update local state first
        setSlots(prev => ({
            ...prev,
            [targetDayId]: newDaySlots
        }));

        setHasUnsavedChanges(true);

        // Chronological Validation
        const isLogical = validateAgendaOrder(targetDayId, newDaySlots);

        if (!isLogical) {
            showToast('⚠️ الترتيب غير منطقي زمنياً! يرجى مراجعة الفقرات المحددة بالأحمر.', 'warning');
        }

        /* 
        // DISABLED PERSISTENCE FOR STAGING
        try {
            const updates = newDaySlots.map((slot, index) => ({
                ...slot,
                sort_order: index + 1
            }));
            await updateSlotsOrder(updates);
        } catch (error) {
            console.error('Error updating slots order:', error);
            showToast('فشل حفظ الترتيب الجديد', 'error');
            loadEventData(true);
        }
        */
    };

    const [isSavingChanges, setIsSavingChanges] = useState(false);

    const handleFinalSave = async () => {
        try {
            setIsSavingChanges(true);
            
            // 1. Handle Day Deletions
            if (pendingDayDeletions.length > 0) {
                console.log(`[Staging] Deleting ${pendingDayDeletions.length} days`);
                for (const id of pendingDayDeletions) {
                    await deleteDay(id);
                }
            }

            // 2. Handle Slot Deletions
            if (pendingDeletions.length > 0) {
                console.log(`[Staging] Deleting ${pendingDeletions.length} slots`);
                for (const id of pendingDeletions) {
                    await deleteSlot(id);
                }
            }

            // 3. Process Days and Slots
            // We need to create days first to get real IDs for their slots
            for (const day of days) {
                let currentDayId = day.day_id;
                
                if (day.isOptimistic) {
                    console.log(`[Staging] Creating new day: ${day.day_name}`);
                    const newDay = await createDay({
                        event_id: day.event_id,
                        day_name: day.day_name,
                        day_date: day.day_date,
                        day_number: day.day_number
                    });
                    currentDayId = newDay.day_id;
                } else if (hasUnsavedChanges) {
                    // Update existing day if needed (currently we don't track day edits specifically, so we'll just skip or update all)
                    await updateDay(day.day_id, {
                        day_name: day.day_name,
                        day_date: day.day_date,
                        day_number: day.day_number
                    });
                }

                // Prepare slots for this day
                const daySlots = slots[day.day_id] || [];
                const slotsToUpsert = daySlots.map((slot, index) => {
                    const slotData = { 
                        ...slot, 
                        day_id: currentDayId, // Ensure it uses the real ID (new or existing)
                        sort_order: index + 1 
                    };
                    
                    // Proactive cleanup: remove slot_id if it's optimistic or null
                    if (slot.isOptimistic || !slot.slot_id) {
                        delete slotData.slot_id;
                    }
                    
                    delete slotData.isOptimistic; // Always cleanup UI metadata
                    return slotData;
                });

                if (slotsToUpsert.length > 0) {
                    await updateSlotsOrder(slotsToUpsert);
                }
            }

            // 4. Update Event Settings (show_day_names)
            await updateEvent(event.event_id, {
                show_day_names: showDayNames
            });

            setHasUnsavedChanges(false);
            setPendingDeletions([]);
            setPendingDayDeletions([]);
            showToast('تم حفظ جميع التعديلات بنجاح! 🎉');
            loadEventData(true);
        } catch (error) {
            console.error('Final save failed:', error);
            showToast('فشل حفظ التعديلات النهائية.', 'error');
        } finally {
            setIsSavingChanges(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-manrope">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a27c9]"></div>
                <p className="mt-4 text-slate-500 font-medium tracking-tight">Syncing Event Data...</p>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-gray-200 font-manrope antialiased">
                {/* Premium Header */}
                <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                    <div className="max-w-[1600] mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <button
                                    onClick={onBack}
                                    className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-500 transition-premium active:scale-95"
                                >
                                    <ArrowLeft size={24} />
                                </button>
                                <div className="min-w-0">
                                    <h1 className="text-xl md:text-2xl font-extrabold text-[#0d0e0e] tracking-tight truncate">
                                        {eventDetails.event_name || '...'}
                                    </h1>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">Event Orchestrator</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <button
                                    onClick={handleCopy}
                                    className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-premium border ${copied
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    {copied ? <Check size={18} /> : <Copy size={18} />}
                                    <span>{copied ? 'Link Copied' : 'Copy Link'}</span>
                                </button>
                                <a
                                    href={agendaUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0d0e0e] text-white rounded-xl font-bold hover:bg-slate-800 transition-premium shadow-md active:scale-95"
                                >
                                    <ExternalLink size={18} />
                                    <span>Preview</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-7xl mx-auto px-4 py-8 pb-32">
                    {activeTab === 'days' && (
                        <div className="space-y-6">
                            {/* Save Changes Floating Bar */}
                            {hasUnsavedChanges && (
                                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 duration-500">
                                    <div className="bg-[#0d0e0e] text-white px-8 py-5 rounded-[2.5rem] shadow-2xl shadow-indigo-200/50 flex items-center gap-8 border border-white/10 backdrop-blur-xl">
                                        <div className="flex items-center gap-3 pr-8 border-r border-white/10">
                                            <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
                                            <span className="font-bold text-sm tracking-tight whitespace-nowrap">عناصر غير محفوظة بالمسودة</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => loadEventData(false)}
                                                disabled={isSavingChanges}
                                                className="px-6 py-2.5 hover:bg-white/10 rounded-2xl font-bold text-sm transition-premium disabled:opacity-30"
                                            >
                                                تجاهل التغييرات
                                            </button>
                                            <button
                                                onClick={handleFinalSave}
                                                disabled={isSavingChanges || invalidSlotIds.size > 0}
                                                className="flex items-center gap-2 px-8 py-3 bg-[#1a27c9] hover:bg-[#151e9c] text-white rounded-2xl font-black text-sm transition-premium shadow-xl shadow-indigo-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isSavingChanges ? (
                                                    <Loader2 size={20} className="animate-spin" />
                                                ) : (
                                                    <Save size={20} />
                                                )}
                                                <span>حفظ التعديلات النهائية</span>
                                            </button>
                                        </div>
                                        {invalidSlotIds.size > 0 && (
                                            <div className="pl-4 flex items-center gap-2 text-red-400">
                                                <AlertCircle size={18} />
                                                <span className="text-xs font-bold">صلح الأخطاء الزمنية أولاً</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Sync Error Display */}
                            {syncError && (
                                <div className="bg-amber-50 border border-amber-100 rounded-[2rem] p-8 shadow-sm mb-6 animate-in zoom-in-95 duration-300">
                                    <div className="flex items-start gap-5">
                                        <div className="bg-amber-500/10 p-3 rounded-2xl shrink-0">
                                            <AlertTriangle className="text-amber-600" size={28} />
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="text-lg font-black text-[#0d0e0e] tracking-tight mb-1">تنبيه المزامنة</h4>
                                                <p className="text-sm font-bold text-amber-800/80 leading-relaxed">
                                                    {syncError.type === 'MISSING_COLUMNS'
                                                        ? `هناك أعمدة مفقودة في شيت "${syncError.sheetName}". يرجى التأكد من وجود الأعمدة التالية:`
                                                        : syncError.message.includes('fetch')
                                                            ? 'فشل الاتصال بالشيت. تأكد أن الرابط صحيح وأن الشيت متاح "للمشاهدة العامة" (Anyone with the link can view).'
                                                            : syncError.message}
                                                </p>
                                            </div>

                                            {syncError.type === 'MISSING_COLUMNS' && (
                                                <div className="flex flex-wrap gap-2">
                                                    {syncError.missing.map(col => (
                                                        <span key={col} className="px-4 py-1.5 bg-white border border-amber-200 rounded-xl text-[11px] font-black text-amber-700 uppercase tracking-wider shadow-sm">
                                                            {col === 'Day Name' ? 'اسم اليوم (Day Name)' :
                                                                col === 'Date' ? 'التاريخ (Date)' :
                                                                    col === 'Slot Title' ? 'عنوان الفقرة (Slot Title)' :
                                                                        col === 'Start Time' ? 'وقت البدء (Start Time)' :
                                                                            col === 'End Time' ? 'وقت الانتهاء (End Time)' :
                                                                                col === 'Company Name' ? 'اسم الشركة (Company Name)' : col}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="pt-2">
                                                <button
                                                    onClick={() => setSyncError(null)}
                                                    className="text-[10px] font-black uppercase tracking-widest text-[#1a27c9] hover:underline"
                                                >
                                                    تجاهل التنبيه
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Sync Status & Report */}
                            {(lastSyncTime || syncReport) && (
                                <div className="flex flex-wrap items-center gap-6 px-6 py-3 bg-white border border-slate-100 rounded-3xl shadow-sm mb-6 animate-in fade-in slide-in-from-top-2 duration-500">
                                    {lastSyncTime && (
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Sync:</span>
                                            <span className="text-[11px] font-bold text-slate-600">{lastSyncTime}</span>
                                        </div>
                                    )}
                                    {syncReport && (
                                        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 border-l border-slate-100 pl-6">
                                            {[
                                                { label: 'الاياّم', key: 'days' },
                                                { label: 'الجلسات', key: 'slots' },
                                                { label: 'الخبراء', key: 'experts' },
                                                { label: 'الشركات', key: 'companies' }
                                            ].map(category => (
                                                <div key={category.key} className="flex flex-col gap-1">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{category.label}</span>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center gap-1" title="New">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                            <span className="text-[11px] font-black text-emerald-600">+{syncReport[category.key].added}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1" title="Updated">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                            <span className="text-[11px] font-black text-blue-600">~{syncReport[category.key].updated}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1" title="Skipped">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                                            <span className="text-[11px] font-black text-slate-400">{syncReport[category.key].skipped}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Agenda Display Settings Card */}
                            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm mb-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-indigo-50 p-3 rounded-2xl text-[#1a27c9]">
                                            <Settings size={22} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-[#0d0e0e]">إعدادات عرض الأجندة</h3>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Agenda Display Options</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 min-w-[300px]">
                                        <div className="flex-1">
                                            <p className="font-bold text-sm text-[#0d0e0e]">إظهار أسماء الأيام</p>
                                            <p className="text-[10px] text-slate-400 font-medium leading-none mt-1">Show custom day names</p>
                                        </div>
                                        <button
                                            onClick={handleToggleDayNames}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${showDayNames ? 'bg-[#1a27c9]' : 'bg-slate-300'}`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showDayNames ? 'translate-x-6' : 'translate-x-1'}`}
                                            />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Add Day Card - Optimized Form */}
                            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="bg-indigo-50 p-2 rounded-xl">
                                        <Calendar className="text-[#1a27c9]" size={20} />
                                    </div>
                                    <h3 className="text-xl font-extrabold text-[#0d0e0e]">Add New Agenda Day</h3>
                                </div>

                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={newDayName}
                                            onChange={(e) => {
                                                setNewDayName(e.target.value);
                                                if (e.target.value.trim()) setDayError(false);
                                            }}
                                            placeholder="Day Label (e.g. Day 1: Vision)"
                                            className={`w-full px-5 py-3.5 bg-slate-50 border rounded-2xl font-medium placeholder-slate-400 focus:outline-none focus:ring-2 transition-premium ${dayError ? 'border-red-500 focus:ring-red-100' : 'border-slate-100 focus:ring-[#1a27c9] focus:bg-white'
                                                }`}
                                        />
                                        {dayError && (
                                            <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider mt-1.5 ml-2">Label is required</p>
                                        )}
                                    </div>
                                    <div className="md:w-64">
                                        <input
                                            type="date"
                                            value={newDayDate}
                                            onChange={(e) => setNewDayDate(e.target.value)}
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-medium focus:outline-none focus:ring-2 focus:ring-[#1a27c9] focus:bg-white transition-premium"
                                        />
                                    </div>
                                    <button
                                        onClick={handleAddDay}
                                        disabled={isSubmittingDay}
                                        className="px-8 py-3.5 bg-[#1a27c9] text-white rounded-2xl font-extrabold hover:bg-[#1a27c9]/90 shadow-lg shadow-indigo-100 transition-premium flex items-center justify-center gap-2 group disabled:opacity-50 active:scale-95"
                                    >
                                        {isSubmittingDay ? (
                                            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                                        ) : (
                                            <>
                                                <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                                                <span>Add Day</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Days List */}
                            {days.map((day) => (
                                <div key={day.day_id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-premium">
                                    <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/50">
                                        {editingDayId === day.day_id ? (
                                            <div className="flex flex-col md:flex-row flex-1 gap-3 md:items-center">
                                                <input
                                                    type="text"
                                                    value={editDayName}
                                                    onChange={(e) => setEditDayName(e.target.value)}
                                                    className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-lg font-bold focus:ring-[#1a27c9] outline-none"
                                                    autoFocus
                                                />
                                                <input
                                                    type="date"
                                                    value={editDayDate.split('T')[0]}
                                                    onChange={(e) => setEditDayDate(e.target.value)}
                                                    className="bg-white border border-slate-200 rounded-xl px-4 py-2 outline-none"
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={handleUpdateDay}
                                                        className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors"
                                                    >
                                                        <Save size={20} />
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingDayId(null)}
                                                        className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-4">
                                                <div className="bg-[#1a27c9] text-white h-12 w-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-100">
                                                    {day.day_number || '?'}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-2xl font-black text-[#0d0e0e]">{day.day_name}</h3>
                                                        <button
                                                            onClick={() => handleStartEditDay(day)}
                                                            className="text-slate-300 hover:text-[#1a27c9] transition-premium"
                                                            title="Rename Day"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                    </div>
                                                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">{formatDate(day.day_date)}</p>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex gap-2 w-full md:w-auto">
                                            <button
                                                onClick={() => handleOpenSlotModal(day.day_id)}
                                                className="grow md:grow-0 px-6 py-3 bg-[#0d0e0e] text-white rounded-xl font-bold hover:bg-slate-800 transition-premium flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-slate-200"
                                            >
                                                <Plus size={18} />
                                                <span>Add Slot</span>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteDay(day.day_id)}
                                                className="px-4 py-3 bg-red-50 text-red-500 border border-red-100 rounded-xl hover:bg-red-100 transition-premium"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Slots List */}
                                    <div className="p-4">
                                        {slots[day.day_id]?.length > 0 ? (
                                            <DndContext
                                                sensors={sensors}
                                                collisionDetection={closestCenter}
                                                onDragEnd={handleDragEnd}
                                            >
                                                <SortableContext
                                                    items={slots[day.day_id].map(s => s.slot_id)}
                                                    strategy={verticalListSortingStrategy}
                                                >
                                                    <div className="space-y-3">
                                                        {slots[day.day_id].map((slot) => (
                                                            <SortableSlot
                                                                key={slot.slot_id}
                                                                slot={slot}
                                                                isInvalid={invalidSlotIds.has(slot.slot_id)}
                                                                onEdit={handleEditSlot}
                                                                onDelete={handleDeleteSlot}
                                                                onTogglePresenter={handleTogglePresenter}
                                                            />
                                                        ))}
                                                    </div>
                                                </SortableContext>
                                            </DndContext>
                                        ) : (
                                            <div className="py-12 flex flex-col items-center justify-center text-slate-300">
                                                <Clock size={40} className="mb-3 opacity-20" />
                                                <p className="text-sm font-bold uppercase tracking-widest">No slots scheduled yet</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {days.length === 0 && (
                                <div className="text-center py-16 text-gray-400">
                                    <Calendar size={64} className="mx-auto mb-4 opacity-30" />
                                    <p>Start by adding event days</p>
                                </div>
                            )}
                        </div>
                    )}


                    {activeTab === 'settings' && (
                        <div className="space-y-8 pb-20">
                            {/* Global Styles Header */}
                            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-2xl font-black text-[#0d0e0e]">Visual identity</h3>
                                        <p className="text-slate-500 font-medium">Configure your agenda branding and theme settings.</p>
                                    </div>
                                    <button
                                        onClick={handleSaveImages}
                                        className="flex items-center gap-2 px-8 py-3.5 bg-[#1a27c9] text-white rounded-2xl font-extrabold hover:bg-[#1a27c9]/90 shadow-xl shadow-indigo-100 transition-premium active:scale-95"
                                    >
                                        <Save size={20} />
                                        <span>Save Changes</span>
                                    </button>
                                </div>

                                {/* Header Configuration Segment */}
                                <div className="space-y-8">
                                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100">
                                                    <Edit2 size={18} className="text-[#1a27c9]" />
                                                </div>
                                                <h4 className="text-lg font-black text-[#0d0e0e]">Hero Section (Header)</h4>
                                            </div>
                                            <button
                                                onClick={() => setHeaderSettings(prev => ({ ...prev, visible: !prev.visible }))}
                                                className={`w-14 h-7 rounded-full transition-premium relative ${headerSettings.visible ? 'bg-[#1a27c9]' : 'bg-slate-300'}`}
                                            >
                                                <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${headerSettings.visible ? 'left-8' : 'left-1'} shadow-sm`} />
                                            </button>
                                        </div>

                                        {headerSettings.visible && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn">
                                                <div className="space-y-6">
                                                    <div>
                                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Cover Type</label>
                                                        <div className="flex gap-4 p-1.5 bg-white rounded-xl border border-slate-200">
                                                            <button
                                                                onClick={() => setHeaderSettings(prev => ({ ...prev, type: 'image' }))}
                                                                className={`flex-1 py-2 px-4 rounded-lg font-bold transition-premium ${headerSettings.type === 'image' ? 'bg-[#1a27c9] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                                                            >
                                                                Image
                                                            </button>
                                                            <button
                                                                onClick={() => setHeaderSettings(prev => ({ ...prev, type: 'color' }))}
                                                                className={`flex-1 py-2 px-4 rounded-lg font-bold transition-premium ${headerSettings.type === 'color' ? 'bg-[#1a27c9] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                                                            >
                                                                Solid Color
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {headerSettings.type === 'image' ? (
                                                        <div className="space-y-3">
                                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Cover Image Source</label>
                                                            <div className="flex flex-col sm:flex-row gap-4">
                                                                <div className="flex-1 relative">
                                                                    <input
                                                                        type="url"
                                                                        value={imageUrls.header}
                                                                        onChange={(e) => setImageUrls({ ...imageUrls, header: e.target.value })}
                                                                        placeholder="Paste Image URL"
                                                                        className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl font-medium focus:outline-none focus:ring-2 focus:ring-[#1a27c9] transition-premium"
                                                                    />
                                                                </div>
                                                                <div className="shrink-0">
                                                                    <label className="cursor-pointer flex items-center justify-center gap-2 px-6 py-3.5 bg-white border-2 border-dashed border-slate-200 rounded-2xl font-bold text-slate-500 hover:border-[#1a27c9] hover:text-[#1a27c9] transition-premium group h-full">
                                                                        <input
                                                                            type="file"
                                                                            className="hidden"
                                                                            accept="image/*"
                                                                            onChange={(e) => handleImageUpload(e, 'header')}
                                                                            disabled={isUploading}
                                                                        />
                                                                        {isUploading ? (
                                                                            <div className="animate-spin h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full" />
                                                                        ) : (
                                                                            <>
                                                                                <Upload size={18} className="group-hover:scale-110 transition-transform" />
                                                                                <span>Upload Cover</span>
                                                                            </>
                                                                        )}
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Pick Color</label>
                                                            <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-200">
                                                                <input
                                                                    type="color"
                                                                    value={headerSettings.color}
                                                                    onChange={(e) => setHeaderSettings(prev => ({ ...prev, color: e.target.value }))}
                                                                    className="h-10 w-20 rounded-xl cursor-pointer border-0 p-0"
                                                                />
                                                                <span className="font-bold text-slate-600 uppercase tracking-wider">{headerSettings.color}</span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div>
                                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Section Height</label>
                                                        <input
                                                            type="text"
                                                            value={imageUrls.height}
                                                            onChange={(e) => setImageUrls({ ...imageUrls, height: e.target.value })}
                                                            placeholder="e.g. 400px"
                                                            className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl font-medium focus:outline-none focus:ring-2 focus:ring-[#1a27c9] transition-premium"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-6">
                                                    {/* Text Overlay Segment */}
                                                    <div className="bg-white p-6 rounded-2xl border border-slate-200">
                                                        <div className="flex items-center justify-between mb-6">
                                                            <label className="text-sm font-black text-[#0d0e0e] uppercase tracking-wider">Overlay Title</label>
                                                            <button
                                                                onClick={() => setHeaderSettings(prev => ({ ...prev, showTitle: !prev.showTitle }))}
                                                                className={`w-12 h-6 rounded-full transition-premium relative ${headerSettings.showTitle ? 'bg-[#1a27c9]' : 'bg-slate-200'}`}
                                                            >
                                                                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${headerSettings.showTitle ? 'left-7' : 'left-1'} shadow-sm`} />
                                                            </button>
                                                        </div>

                                                        {headerSettings.showTitle && (
                                                            <div className="space-y-4 animate-fadeIn">
                                                                <input
                                                                    type="text"
                                                                    value={headerSettings.titleDescription}
                                                                    onChange={(e) => setHeaderSettings(prev => ({ ...prev, titleDescription: e.target.value }))}
                                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#1a27c9]/10 focus:bg-white transition-premium"
                                                                    placeholder="Subtitle or brief description..."
                                                                />
                                                                <div className="flex items-center gap-4">
                                                                    <input
                                                                        type="color"
                                                                        value={headerSettings.titleColor}
                                                                        onChange={(e) => setHeaderSettings(prev => ({ ...prev, titleColor: e.target.value }))}
                                                                        className="h-10 w-16 rounded-xl cursor-pointer border-0 p-0"
                                                                    />
                                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Title Color</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {headerSettings.type === 'image' && (
                                                        <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
                                                            <label className="block text-xs font-black text-[#1a27c9] uppercase tracking-[0.2em] mb-4">Background Dimming</label>
                                                            <div className="flex items-center gap-6">
                                                                <input
                                                                    type="range"
                                                                    min="0"
                                                                    max="0.9"
                                                                    step="0.1"
                                                                    value={headerSettings.overlayOpacity}
                                                                    onChange={(e) => setHeaderSettings(prev => ({ ...prev, overlayOpacity: e.target.value }))}
                                                                    className="flex-1 accent-[#1a27c9]"
                                                                />
                                                                <div className="bg-white p-2 rounded-lg border border-indigo-100 min-w-[3rem] text-center font-black text-indigo-600 text-xs">
                                                                    {Math.round(headerSettings.overlayOpacity * 100)}%
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Event Branding Name</label>
                                            <input
                                                type="text"
                                                value={eventDetails.event_name}
                                                onChange={(e) => setEventDetails({ ...eventDetails, event_name: e.target.value })}
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-extrabold text-xl text-[#0d0e0e] focus:outline-none focus:ring-2 focus:ring-[#1a27c9] focus:bg-white transition-premium"
                                                placeholder="Brand Name"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Typography & Tone</label>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                                                {[
                                                    { id: 'font-manrope', name: 'Manrope', class: 'font-manrope' },
                                                    { id: 'font-hepta', name: 'Hepta Slab', class: 'font-hepta' },
                                                    { id: 'font-jomhuria', name: 'Jomhuria', class: 'font-jomhuria text-xl' },
                                                ].map(f => (
                                                    <button
                                                        key={f.id}
                                                        onClick={() => setHeaderSettings(prev => ({ ...prev, fontFamily: f.id }))}
                                                        className={`p-4 border-2 rounded-2xl transition-premium text-center flex flex-col items-center justify-center gap-1 ${headerSettings.fontFamily === f.id
                                                            ? 'border-[#1a27c9] bg-indigo-50/50 text-[#1a27c9] shadow-inner'
                                                            : 'border-slate-100 hover:border-slate-300 text-slate-400 hover:text-slate-600 bg-white'}`}
                                                    >
                                                        <span className={`${f.class} text-lg font-bold`}>Aa</span>
                                                        <span className="text-[10px] font-black uppercase tracking-wider">{f.name}</span>
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Typography Details */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
                                                <div className="p-6 bg-white rounded-2xl border border-slate-200">
                                                    <h5 className="text-sm font-black text-[#0d0e0e] uppercase tracking-wider mb-4">Header Title Style</h5>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Size</label>
                                                            <input
                                                                type="text"
                                                                value={headerSettings.titleSize}
                                                                onChange={(e) => setHeaderSettings(prev => ({ ...prev, titleSize: e.target.value }))}
                                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#1a27c9]/10 focus:bg-white transition-premium outline-none"
                                                                placeholder="e.g. 3rem"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Weight</label>
                                                            <select
                                                                value={headerSettings.titleWeight}
                                                                onChange={(e) => setHeaderSettings(prev => ({ ...prev, titleWeight: e.target.value }))}
                                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#1a27c9]/10 focus:bg-white transition-premium outline-none appearance-none"
                                                            >
                                                                <option value="100">Thin (100)</option>
                                                                <option value="200">Extra Light (200)</option>
                                                                <option value="300">Light (300)</option>
                                                                <option value="400">Regular (400)</option>
                                                                <option value="500">Medium (500)</option>
                                                                <option value="600">Semi Bold (600)</option>
                                                                <option value="700">Bold (700)</option>
                                                                <option value="800">Extra Bold (800)</option>
                                                                <option value="900">Black (900)</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-6 bg-white rounded-2xl border border-slate-200">
                                                    <h5 className="text-sm font-black text-[#0d0e0e] uppercase tracking-wider mb-4">Content Typography</h5>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Size</label>
                                                            <input
                                                                type="text"
                                                                value={headerSettings.contentSize}
                                                                onChange={(e) => setHeaderSettings(prev => ({ ...prev, contentSize: e.target.value }))}
                                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#1a27c9]/10 focus:bg-white transition-premium outline-none"
                                                                placeholder="e.g. 1rem"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Weight</label>
                                                            <select
                                                                value={headerSettings.contentWeight}
                                                                onChange={(e) => setHeaderSettings(prev => ({ ...prev, contentWeight: e.target.value }))}
                                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#1a27c9]/10 focus:bg-white transition-premium outline-none appearance-none"
                                                            >
                                                                <option value="100">Thin (100)</option>
                                                                <option value="200">Extra Light (200)</option>
                                                                <option value="300">Light (300)</option>
                                                                <option value="400">Regular (400)</option>
                                                                <option value="500">Medium (500)</option>
                                                                <option value="600">Semi Bold (600)</option>
                                                                <option value="700">Bold (700)</option>
                                                                <option value="800">Extra Bold (800)</option>
                                                                <option value="900">Black (900)</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Slot Addition/Edit Modal */}
                {slotModal.show && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-manrope">
                        <div className="bg-white rounded-[2.5rem] w-full max-w-xl p-6 md:p-10 shadow-2xl scale-in-center border border-slate-100 max-h-[90vh] overflow-y-auto flex flex-col">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="bg-indigo-50 p-3 rounded-2xl">
                                    <Plus size={24} className="text-[#1a27c9]" />
                                </div>
                                <h3 className="text-3xl font-black text-[#0d0e0e] tracking-tight">
                                    {slotModal.isEditing ? 'Pulse Edit Slot' : 'Create New Pulse'}
                                </h3>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Start Time</label>
                                        <select
                                            value={slotModal.startTime}
                                            onChange={(e) => setSlotModal({ ...slotModal, startTime: e.target.value })}
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1a27c9] transition-premium font-bold text-slate-700 appearance-none cursor-pointer"
                                        >
                                            {TIME_OPTIONS.map(time => (
                                                <option key={time} value={time}>{time}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">End Time</label>
                                        <select
                                            value={slotModal.endTime}
                                            onChange={(e) => setSlotModal({ ...slotModal, endTime: e.target.value })}
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1a27c9] transition-premium font-bold text-slate-700 appearance-none cursor-pointer"
                                        >
                                            {TIME_OPTIONS.map(time => (
                                                <option key={time} value={time}>{time}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Session Title</label>
                                    <input
                                        type="text"
                                        value={slotModal.title}
                                        onChange={(e) => setSlotModal({ ...slotModal, title: e.target.value })}
                                        placeholder="Headline of this slot..."
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1a27c9] focus:bg-white transition-premium font-bold text-lg text-[#0d0e0e]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Narrator / Lead</label>
                                    <input
                                        type="text"
                                        value={slotModal.presenter}
                                        onChange={(e) => setSlotModal({ ...slotModal, presenter: e.target.value })}
                                        placeholder="Full name or team..."
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1a27c9] focus:bg-white transition-premium font-bold text-slate-600"
                                    />
                                </div>

                                {/* Bullet Points Section */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Sub-Topics / Bullet Points</label>
                                        <button
                                            type="button"
                                            onClick={() => setSlotModal(prev => ({ ...prev, bulletPoints: [...(prev.bulletPoints || []), ''] }))}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-[#1a27c9] rounded-xl text-xs font-black hover:bg-indigo-100 transition-colors"
                                        >
                                            <Plus size={14} />
                                            Add Point
                                        </button>
                                    </div>

                                    {slotModal.bulletPoints?.length > 0 ? (
                                        <div className="space-y-2">
                                            {slotModal.bulletPoints.map((point, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-indigo-300 shrink-0" />
                                                    <input
                                                        type="text"
                                                        value={point}
                                                        onChange={(e) => {
                                                            const updated = [...slotModal.bulletPoints];
                                                            updated[index] = e.target.value;
                                                            setSlotModal(prev => ({ ...prev, bulletPoints: updated }));
                                                        }}
                                                        placeholder={`النقطة ${index + 1}...`}
                                                        className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a27c9] focus:bg-white transition-premium font-medium text-slate-700 text-sm"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const updated = slotModal.bulletPoints.filter((_, i) => i !== index);
                                                            setSlotModal(prev => ({ ...prev, bulletPoints: updated }));
                                                        }}
                                                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-4 border-2 border-dashed border-slate-100 rounded-2xl text-center">
                                            <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">لا توجد نقاط — اضغط "Add Point" لإضافة واحدة</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-4 mt-10">
                                <button
                                    onClick={handleSaveSlot}
                                    disabled={slotModal.saving}
                                    className="flex-[2] px-8 py-4 bg-[#1a27c9] text-white rounded-2xl hover:bg-indigo-700 transition-premium font-black text-lg shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
                                >
                                    {slotModal.saving ? (
                                        <div className="animate-spin h-6 w-6 border-3 border-white border-t-transparent rounded-full" />
                                    ) : (
                                        <>
                                            <Save size={22} />
                                            <span>{slotModal.isEditing ? 'Update Pulse' : 'Save Pulse'}</span>
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => setSlotModal({ ...slotModal, show: false })}
                                    disabled={slotModal.saving}
                                    className="flex-1 px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-premium font-bold active:scale-95"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Custom Confirmation Modal */}
            {
                confirmState.show && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setConfirmState({ show: false, message: '', onConfirm: null })} />
                        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full relative z-10 shadow-2xl border border-white active:scale-[0.99] transition-transform">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-6 text-rose-500">
                                    <AlertTriangle size={36} />
                                </div>
                                <h3 className="text-xl font-black text-[#0d0e0e] mb-2 tracking-tight">تأكيد الإجراء</h3>
                                <p className="text-slate-500 font-bold mb-8 leading-relaxed">
                                    {confirmState.message}
                                </p>
                                <div className="flex gap-4 w-full">
                                    <button
                                        onClick={() => {
                                            confirmState.onConfirm();
                                            setConfirmState({ show: false, message: '', onConfirm: null });
                                        }}
                                        className="flex-1 px-6 py-4 bg-rose-600 text-white rounded-2xl font-black hover:bg-rose-700 transition-premium shadow-lg shadow-rose-200 active:scale-95"
                                    >
                                        تأكيد
                                    </button>
                                    <button
                                        onClick={() => setConfirmState({ show: false, message: '', onConfirm: null })}
                                        className="flex-1 px-6 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black hover:bg-slate-200 transition-premium active:scale-95"
                                    >
                                        تراجع
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Global Toast Notification */}
            {toast.show && (
                <div className={`fixed bottom-8 right-8 z-[110] flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl border animate-slideInRight ${toast.type === 'success' ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-rose-600 text-white border-rose-500'}`}>
                    <div className="flex items-center gap-3">
                        {toast.type === 'success' ? <Check size={20} className="shrink-0" /> : <AlertTriangle size={20} className="shrink-0" />}
                        <span className="font-extrabold text-sm tracking-tight">{toast.message}</span>
                    </div>
                    <button
                        onClick={() => setToast(prev => ({ ...prev, show: false }))}
                        className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}
        </>
    );
}
