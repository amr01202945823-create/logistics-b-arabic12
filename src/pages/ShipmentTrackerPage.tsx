
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLocalization } from '../localization';
import type { Shipment, ShipmentStatus, ShipmentUpdate, ShipmentDocument, ShipmentExpense } from '../types';
import { Button, Card, CardContent, CardHeader, Input, Modal, Textarea, Spinner, Dropdown } from '../components/ui';
import { ArrowLeftIcon, PlusIcon, TruckIcon, ShipIcon, CheckBadgeIcon, UserCircleIcon, CubeIcon, CalendarDaysIcon, ThermometerIcon, DocumentTextIcon, PhoneIcon, EditIcon, CurrencyDollarIcon, ChatBubbleBottomCenterTextIcon, TrashIcon, ClipboardDocumentCheckIcon, MapPinIcon, UsersIcon, SearchIcon, TagIcon, ArrowRightIcon } from '../components/icons';
import { v4 as uuidv4 } from 'uuid';

const STATUS_ORDER: ShipmentStatus[] = [
    'pending', 'pickup_order_issued', 'driver_assigned_for_pickup', 'container_picked_up', 'at_shipper_for_loading',
    'loading_complete_enroute_to_port', 'documents_submitted', 'customs_clearance_export', 'in_transit',
    'customs_clearance_import', 'ready_for_delivery', 'delivered'
];

const getStatusColor = (status: ShipmentStatus) => {
    const index = STATUS_ORDER.indexOf(status);
    if (index < 7) return 'bg-yellow-500'; // Pre-transit
    if (index < 9) return 'bg-blue-500'; // In Transit
    if (index < 11) return 'bg-purple-500'; // Post-transit
    return 'bg-green-500'; // Delivered
};

const getProgress = (status: ShipmentStatus) => {
    const currentIndex = STATUS_ORDER.indexOf(status);
    return ((currentIndex + 1) / STATUS_ORDER.length) * 100;
};

// Optimization: Memoize ShipmentCard to prevent unnecessary re-renders in the list
const ShipmentCard: React.FC<{ shipment: Shipment, onViewDetails: (id: string) => void }> = React.memo(({ shipment, onViewDetails }) => {
    const { t, language } = useLocalization();
    const progress = getProgress(shipment.status);
    const statusColor = getStatusColor(shipment.status);

    return (
        <Card className="card-shadow-hover group transition-all duration-300 border border-border hover:border-primary/50">
            <CardHeader className="pb-3 bg-surface-hover">
                <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                            {shipment.shippingLine && (
                                <span className="font-bold text-xs text-white bg-primary px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                                    {shipment.shippingLine}
                                </span>
                            )}
                            {shipment.operationNumber && (
                                <span className="font-mono text-xs text-text-muted border border-border px-2 py-0.5 rounded bg-surface">
                                    Op: {shipment.operationNumber}
                                </span>
                            )}
                        </div>
                        <h3 className="font-extrabold text-xl text-text-heading tracking-tight">{shipment.id}</h3>
                        <span className="text-[10px] text-text-muted font-medium flex items-center gap-1 mt-1">
                            <CalendarDaysIcon className="w-3 h-3" />
                            {new Date(shipment.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                        </span>
                    </div>
                    <span className={`px-3 py-1 text-[10px] font-bold text-white rounded-full ${statusColor} shadow-sm uppercase tracking-wide`}>{t(shipment.status)}</span>
                </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
                {/* Route */}
                <div className="flex items-center justify-between text-sm mb-2">
                    <div className="flex items-center gap-2 max-w-[45%]">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0 shadow-sm ring-2 ring-blue-100"></div>
                        <span className="font-bold text-text-heading truncate" title={shipment.origin}>{shipment.origin}</span>
                    </div>
                    <div className="h-px bg-border flex-grow mx-3 relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface px-2 text-text-muted">
                            {/* Correct arrow direction for RTL/LTR */}
                            {language === 'ar' ? <ArrowLeftIcon className="w-3 h-3" /> : <ArrowRightIcon className="w-3 h-3" />}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 max-w-[45%] justify-end">
                        <span className="font-bold text-text-heading truncate" title={shipment.destination}>{shipment.destination}</span>
                        <div className="w-2.5 h-2.5 rounded-full bg-accent flex-shrink-0 shadow-sm ring-2 ring-amber-100"></div>
                    </div>
                </div>

                {/* Exporter & Importer - Replaces Financials */}
                <div className="bg-surface border border-border rounded-lg p-3 flex items-center justify-between">
                     <div className="flex flex-col max-w-[45%]">
                         <span className="text-[10px] text-text-muted mb-1 flex items-center gap-1">
                            {t('exporterDetails')}
                         </span>
                         <span className="font-bold text-text-heading text-xs truncate" title={shipment.exporter}>{shipment.exporter || '---'}</span>
                     </div>
                     <div className="w-px h-8 bg-border"></div>
                     <div className="flex flex-col items-end max-w-[45%]">
                         <span className="text-[10px] text-text-muted mb-1 flex items-center gap-1">
                            {t('importerDetails')}
                         </span>
                         <span className="font-bold text-text-heading text-xs truncate" title={shipment.importer}>{shipment.importer || '---'}</span>
                     </div>
                </div>

                {/* Logistics Details Grid - Enhanced for Operational Needs */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Container */}
                    <div className="bg-background border border-border p-2.5 rounded-lg flex flex-col justify-center">
                        <span className="text-[9px] text-text-muted uppercase tracking-wider font-semibold mb-1">{t('containerId')}</span>
                        <div className="flex items-center gap-2 text-text-heading font-mono font-bold text-xs truncate">
                            <CubeIcon className="w-3 h-3" />
                            <span className="truncate">{shipment.containerId || '---'}</span>
                        </div>
                    </div>

                    {/* Weight */}
                     <div className="bg-background border border-border p-2.5 rounded-lg flex flex-col justify-center">
                        <span className="text-[9px] text-text-muted uppercase tracking-wider font-semibold mb-1">{t('shipmentWeight')}</span>
                        <div className="font-bold text-text-heading text-xs truncate">{shipment.weight || '-'}</div>
                    </div>
                </div>

                {/* Contractors: Transport & Broker */}
                <div className="space-y-2">
                    {(shipment.transportCompany || shipment.driverName) && (
                        <div className="flex items-center gap-3 text-xs text-text-base bg-background p-2 rounded border border-border">
                            <TruckIcon className="w-4 h-4 text-text-muted flex-shrink-0" />
                            <div className="flex flex-col truncate">
                                <span className="font-semibold truncate">{shipment.transportCompany || t('transportCompany')}</span>
                                {shipment.driverName && <span className="text-[10px] text-text-muted">{shipment.driverName}</span>}
                            </div>
                        </div>
                    )}
                    {shipment.customsBroker && (
                        <div className="flex items-center gap-3 text-xs text-text-base bg-background p-2 rounded border border-border">
                            <DocumentTextIcon className="w-4 h-4 text-purple-400 flex-shrink-0" />
                            <div className="flex flex-col truncate">
                                <span className="font-semibold truncate">{shipment.customsBroker}</span>
                                <span className="text-[10px] text-text-muted">{t('customsBroker')}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-background rounded-full h-1.5 overflow-hidden mt-2">
                    <div className={`${statusColor} h-full rounded-full transition-all duration-500`} style={{ width: `${progress}%` }}></div>
                </div>
                
                <Button onClick={() => onViewDetails(shipment.id)} className="w-full mt-2 group-hover:bg-primary group-hover:text-white group-hover:border-transparent transition-all" variant="outline" size="sm">
                    {t('viewDetails')}
                </Button>
            </CardContent>
        </Card>
    );
});

const ShipmentDashboard: React.FC<{
    shipments: Shipment[],
    onViewDetails: (id: string) => void,
    onAddShipment: () => void,
}> = ({ shipments, onViewDetails, onAddShipment }) => {
    const { t } = useLocalization();
    const [searchTerm, setSearchTerm] = useState('');
    // Optimization: Debounced search term state
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

    // Optimization: Effect to debounce the search input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300); // 300ms delay

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);

    const filteredShipments = useMemo(() => {
        return shipments.filter(s => {
            // Text Search using debounced term
            const searchLower = debouncedSearchTerm.toLowerCase();
            const matchesText = 
                s.id.toLowerCase().includes(searchLower) ||
                (s.bookingNo && s.bookingNo.toLowerCase().includes(searchLower)) ||
                (s.operationNumber && s.operationNumber.toLowerCase().includes(searchLower)) ||
                (s.exporter && s.exporter.toLowerCase().includes(searchLower)) ||
                (s.importer && s.importer.toLowerCase().includes(searchLower)) ||
                (s.transportCompany && s.transportCompany.toLowerCase().includes(searchLower)) ||
                (s.customsBroker && s.customsBroker.toLowerCase().includes(searchLower)) ||
                s.origin.toLowerCase().includes(searchLower) ||
                s.destination.toLowerCase().includes(searchLower);

            if (!matchesText) return false;

            // Date Filter based on createdAt
            if (dateFilter === 'all') return true;
            
            const date = new Date(s.createdAt);
            const now = new Date();
            const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            
            if (dateFilter === 'today') {
                return date >= startOfToday;
            }
            
            if (dateFilter === 'week') {
                const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return date >= oneWeekAgo;
            }
            
            if (dateFilter === 'month') {
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                return date >= startOfMonth;
            }

            return true;
        });
    }, [shipments, debouncedSearchTerm, dateFilter]);

    const dateOptions = [
        { value: 'all', label: t('allDates') },
        { value: 'today', label: t('today') },
        { value: 'week', label: t('thisWeek') },
        { value: 'month', label: t('thisMonth') },
    ];

    return (
        <div>
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-text-heading">{t('shipmentTracker')}</h1>
                <div className="flex gap-3">
                    <Button onClick={onAddShipment}>
                        <PlusIcon className="w-5 h-5 me-2" />
                        {t('addShipment')}
                    </Button>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <Card className="mb-8 card-shadow !overflow-visible z-30 relative">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-grow">
                            <SearchIcon className="absolute top-1/2 -translate-y-1/2 left-3 w-5 h-5 text-text-muted" />
                            <Input 
                                placeholder={t('searchShipmentsPlaceholder')}
                                value={searchTerm} 
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-10 h-11"
                            />
                        </div>
                        <div className="w-full md:w-48">
                            <Dropdown 
                                options={dateOptions} 
                                value={dateFilter} 
                                onChange={(val) => setDateFilter(val as any)} 
                                placeholder={t('filterByDate')}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {filteredShipments.length === 0 ? (
                <div className="text-center py-16 text-text-muted">
                    <TruckIcon className="w-16 h-16 mx-auto mb-4" />
                    <p>{searchTerm || dateFilter !== 'all' ? t('noShipments') : t('noShipments')}</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredShipments.map(s => <ShipmentCard key={s.id} shipment={s} onViewDetails={onViewDetails} />)}
                </div>
            )}
        </div>
    );
};

const EditableDetailItem: React.FC<{
    label: string;
    value?: string | null;
    name: keyof Shipment;
    isEditing: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    children?: React.ReactNode;
}> = ({ label, value, name, isEditing, onChange, type = 'text', children }) => {
    return (
         <div>
            <p className="text-sm text-text-muted">{label}</p>
            {isEditing ? (
                <Input name={name} value={value || ''} onChange={onChange} type={type} className="mt-1"/>
            ) : (
                children || <p className="font-semibold text-text-base min-h-[24px]">{value || 'N/A'}</p>
            )}
        </div>
    );
};

const ShipmentDetails: React.FC<{
    shipment: Shipment,
    onBack: () => void,
    onUpdateShipment: (id: string, newStatus: ShipmentStatus, updateMessage: string, details?: Partial<Shipment>) => void,
    onSave: (updatedShipment: Shipment) => void,
}> = ({ shipment, onBack, onUpdateShipment, onSave }) => {
    const { t, language } = useLocalization();
    const [isEditing, setIsEditing] = useState(false);
    const [editedShipment, setEditedShipment] = useState<Shipment>(shipment);
    const [newUpdateMessage, setNewUpdateMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // New State for Detailed Expense Addition
    const [newExpense, setNewExpense] = useState<Partial<ShipmentExpense>>({ description: '', amount: 0, category: 'other' });

    useEffect(() => {
        setEditedShipment(shipment);
    }, [shipment]);

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditedShipment(prev => ({...prev, [name]: value}));
    };

    const handleSave = () => {
        onSave(editedShipment);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedShipment(shipment);
        setIsEditing(false);
    };

    const handleAddUpdate = () => {
      if (!newUpdateMessage.trim()) return;
      onUpdateShipment(shipment.id, shipment.status, newUpdateMessage.trim());
      setNewUpdateMessage('');
    };

    const handleAddExpense = () => {
        if (!newExpense.description || !newExpense.amount) return;
        const expense: ShipmentExpense = {
            id: uuidv4(),
            description: newExpense.description,
            amount: Number(newExpense.amount),
            category: newExpense.category as any,
            date: new Date().toISOString()
        };
        const updatedExpenses = [...(editedShipment.expenses || []), expense];
        // Calculate new Cost
        const totalExpenses = updatedExpenses.reduce((sum, e) => sum + e.amount, 0);
        
        const updatedShipment = { ...editedShipment, expenses: updatedExpenses, cost: totalExpenses.toString() };
        setEditedShipment(updatedShipment);
        onSave(updatedShipment); // Auto-save for finances
        setNewExpense({ description: '', amount: 0, category: 'other' });
    };

    const triggerFileUpload = () => {
        fileInputRef.current?.click();
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            // Simple inference for document type
            let type: 'B/L' | 'Invoice' | 'Packing List' | 'Other' = 'Other';
            const nameLower = file.name.toLowerCase();
            if (nameLower.includes('b/l') || nameLower.includes('bill')) type = 'B/L';
            else if (nameLower.includes('invoice')) type = 'Invoice';
            else if (nameLower.includes('packing')) type = 'Packing List';

            const newDoc: ShipmentDocument = {
                id: uuidv4(),
                name: file.name,
                type: type,
                uploadedAt: new Date().toISOString(),
            };
            
            const updatedDocs = [...(shipment.documents || []), newDoc];
            onUpdateShipment(shipment.id, shipment.status, `Document uploaded: ${file.name}`, { documents: updatedDocs });
        }
    };

    const handleDeleteDocument = (docId: string) => {
        const docName = shipment.documents.find(d => d.id === docId)?.name || 'Document';
        if (window.confirm(t('confirmDeleteDocument', { docName }))) {
            const updatedDocs = shipment.documents.filter(d => d.id !== docId);
            onUpdateShipment(shipment.id, shipment.status, `Document deleted: ${docName}`, { documents: updatedDocs });
        }
    };

    const progress = getProgress(shipment.status);

    const getActionForStatus = (status: ShipmentStatus) => {
        const actions: Record<ShipmentStatus, { next: ShipmentStatus, label: string } | null> = {
            'pending': { next: 'pickup_order_issued', label: t('issuePickupOrder') },
            'pickup_order_issued': { next: 'driver_assigned_for_pickup', label: t('assignDriverForPickup') },
            'driver_assigned_for_pickup': { next: 'container_picked_up', label: t('confirmContainerPickup') },
            'container_picked_up': { next: 'at_shipper_for_loading', label: t('confirmArrivalAtShipper') },
            'at_shipper_for_loading': { next: 'loading_complete_enroute_to_port', label: t('markLoadingComplete') },
            'loading_complete_enroute_to_port': { next: 'documents_submitted', label: t('submitDocuments') },
            'documents_submitted': { next: 'customs_clearance_export', label: t('startExportClearance') },
            'customs_clearance_export': { next: 'in_transit', label: t('logVesselDeparture') },
            'in_transit': { next: 'customs_clearance_import', label: t('startImportClearance') },
            'customs_clearance_import': { next: 'ready_for_delivery', label: t('markReadyForDelivery') },
            'ready_for_delivery': { next: 'delivered', label: t('markAsDelivered') },
            'delivered': null,
        };
        return actions[status];
    };
    const nextAction = getActionForStatus(shipment.status);

    const handleAction = () => {
        if (nextAction) {
            const message = t(nextAction.next); // Using the status key for a default message
            onUpdateShipment(shipment.id, nextAction.next, message);
        }
    };
    
    const sortedUpdates = useMemo(() => [...shipment.updates].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()), [shipment.updates]);
    
    // Financial Calc
    const expenses = editedShipment.expenses || [];
    const totalCost = expenses.length > 0 
        ? expenses.reduce((sum, e) => sum + e.amount, 0)
        : parseFloat(editedShipment.cost || '0');
    
    const price = parseFloat(editedShipment.price || '0');
    const profit = price - totalCost;

    return (
        <div>
            <Button onClick={onBack} variant="ghost" className="mb-4">
                {language === 'ar' ? <ArrowRightIcon className="w-5 h-5 me-2" /> : <ArrowLeftIcon className="w-5 h-5 me-2" />}
                {t('backToDashboard')}
            </Button>
            <Card className="card-shadow">
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
                        <div>
                            <h2 className="text-2xl font-bold text-text-heading">{t('shipmentDetails')}</h2>
                            <p className="text-primary font-mono">{shipment.id}</p>
                        </div>
                        <div className="flex items-center gap-2">
                             {isEditing ? (
                                <>
                                    <Button onClick={handleCancel} variant="secondary">{t('cancel')}</Button>
                                    <Button onClick={handleSave}><CheckBadgeIcon className="w-5 h-5 me-2"/>{t('saveChanges')}</Button>
                                </>
                            ) : (
                                <Button onClick={() => setIsEditing(true)} variant="secondary"><EditIcon className="w-5 h-5 me-2"/>{t('editShipment')}</Button>
                            )}
                            <div className={`px-4 py-2 text-white font-bold rounded-lg ${getStatusColor(shipment.status)}`}>
                                {t(shipment.status)}
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="w-full bg-gray-200 dark:bg-border rounded-full h-4 my-4">
                        <div className={`${getStatusColor(shipment.status)} h-4 rounded-full flex items-center justify-center text-xs font-medium text-white`} style={{ width: `${progress}%` }}>
                            {Math.round(progress)}%
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                        <Card className="bg-surface">
                            <CardHeader className="flex items-center gap-3"><UserCircleIcon className="w-6 h-6 text-primary"/> <h4 className="font-bold text-text-heading">{t('shipmentInfo')}</h4></CardHeader>
                            <CardContent className="space-y-3">
                                <EditableDetailItem label={t('operationNumber')} value={editedShipment.operationNumber} name="operationNumber" isEditing={isEditing} onChange={handleEditChange} />
                                <EditableDetailItem label={t('certificateNumber')} value={editedShipment.certificateNumber} name="certificateNumber" isEditing={isEditing} onChange={handleEditChange} />
                                <EditableDetailItem label={t('origin')} value={editedShipment.origin} name="origin" isEditing={isEditing} onChange={handleEditChange} />
                                <EditableDetailItem label={t('destination')} value={editedShipment.destination} name="destination" isEditing={isEditing} onChange={handleEditChange} />
                                <EditableDetailItem label={t('exporterName')} value={editedShipment.exporter} name="exporter" isEditing={isEditing} onChange={handleEditChange} />
                                <EditableDetailItem label={t('importerName')} value={editedShipment.importer} name="importer" isEditing={isEditing} onChange={handleEditChange} />
                            </CardContent>
                        </Card>
                         <Card className="bg-surface">
                             <CardHeader className="flex items-center gap-3"><CubeIcon className="w-6 h-6 text-primary"/> <h4 className="font-bold text-text-heading">{t('logisticsInfo')}</h4></CardHeader>
                             <CardContent className="space-y-3">
                                <EditableDetailItem label={t('shippingLine')} value={editedShipment.shippingLine} name="shippingLine" isEditing={isEditing} onChange={handleEditChange} />
                                <EditableDetailItem label={t('vesselName')} value={editedShipment.vesselName} name="vesselName" isEditing={isEditing} onChange={handleEditChange} />
                                <EditableDetailItem label={t('bookingNo')} value={editedShipment.bookingNo} name="bookingNo" isEditing={isEditing} onChange={handleEditChange} />
                                <EditableDetailItem label={t('containerId')} value={editedShipment.containerId} name="containerId" isEditing={isEditing} onChange={handleEditChange} />
                                <EditableDetailItem label={t('containerSize')} value={editedShipment.containerSize} name="containerSize" isEditing={isEditing} onChange={handleEditChange} />
                                {editedShipment.isTemperatureControlled && (
                                    <EditableDetailItem label={t('temperatureControlled')} value={`${editedShipment.temperatureSetting}°C`} name="temperatureSetting" isEditing={isEditing} onChange={handleEditChange}>
                                        <p className="font-semibold text-blue-600 flex items-center">{editedShipment.temperatureSetting}°C <ThermometerIcon className="w-5 h-5 ms-2"/></p>
                                    </EditableDetailItem>
                                )}
                            </CardContent>
                        </Card>
                         <Card className="bg-surface">
                            <CardHeader className="flex items-center gap-3"><CurrencyDollarIcon className="w-6 h-6 text-primary"/> <h4 className="font-bold text-text-heading">{t('financeInfo')}</h4></CardHeader>
                            <CardContent className="space-y-3">
                                <EditableDetailItem label={t('price')} value={editedShipment.price} name="price" isEditing={isEditing} onChange={handleEditChange} type="number" />
                                <div className="border-t border-dashed border-border pt-2 mt-2">
                                    <p className="text-sm font-bold text-text-heading mb-2">{t('expensesBreakdown')}</p>
                                    <div className="max-h-32 overflow-y-auto space-y-1 mb-2">
                                        {expenses.map(e => (
                                            <div key={e.id} className="flex justify-between text-xs">
                                                <span>{e.description}</span>
                                                <span className="font-mono">{e.amount}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <Input placeholder="Desc (e.g. Agri)" value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} className="h-8 text-xs" />
                                        <Input placeholder="Amt" type="number" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: Number(e.target.value)})} className="h-8 text-xs w-20" />
                                        <Button size="sm" onClick={handleAddExpense} className="h-8 w-8 p-0 flex items-center justify-center">+</Button>
                                    </div>
                                    <div className="flex justify-between font-bold text-sm mt-2 pt-2 border-t border-border">
                                        <span>Total Cost</span>
                                        <span>{totalCost.toFixed(2)}</span>
                                    </div>
                                     <div className="flex justify-between font-bold text-sm text-green-600">
                                        <span>Profit</span>
                                        <span>{profit.toFixed(2)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-surface lg:col-span-2">
                            <CardHeader className="flex items-center gap-3"><CalendarDaysIcon className="w-6 h-6 text-primary"/> <h4 className="font-bold text-text-heading">{t('keyDates')}</h4></CardHeader>
                            <CardContent className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
                                <EditableDetailItem label={t('estimatedDeparture')} value={editedShipment.estimatedDeparture} name="estimatedDeparture" isEditing={isEditing} onChange={handleEditChange} type="datetime-local" />
                                <EditableDetailItem label={t('actualDeparture')} value={editedShipment.actualDeparture} name="actualDeparture" isEditing={isEditing} onChange={handleEditChange} type="datetime-local" />
                                <EditableDetailItem label={t('estimatedArrival')} value={editedShipment.estimatedArrival} name="estimatedArrival" isEditing={isEditing} onChange={handleEditChange} type="datetime-local" />
                                <EditableDetailItem label={t('actualArrival')} value={editedShipment.actualArrival} name="actualArrival" isEditing={isEditing} onChange={handleEditChange} type="datetime-local" />
                            </CardContent>
                        </Card>
                        
                        {/* Documents Card */}
                        <Card className="bg-surface lg:col-span-3">
                            <CardHeader className="flex items-center justify-between border-b border-border/50 pb-3">
                                <div className="flex items-center gap-3">
                                    <DocumentTextIcon className="w-6 h-6 text-primary"/> 
                                    <h4 className="font-bold text-text-heading">{t('documents')}</h4>
                                </div>
                                {!isEditing && (
                                    <div>
                                        <input 
                                            type="file" 
                                            ref={fileInputRef}
                                            className="hidden" 
                                            onChange={handleFileUpload} 
                                        />
                                        <Button size="sm" variant="secondary" onClick={triggerFileUpload}>
                                            <PlusIcon className="w-4 h-4 me-2"/> {t('uploadDocument')}
                                        </Button>
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent>
                                {shipment.documents && shipment.documents.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        {shipment.documents.map(doc => (
                                            <div key={doc.id} className="flex items-center justify-between p-3 border border-border rounded-lg bg-surface hover:border-primary/30 transition-colors group/doc">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                                        <DocumentTextIcon className="w-5 h-5"/>
                                                    </div>
                                                    <div className="truncate">
                                                        <p className="font-medium text-sm truncate text-text-heading">{doc.name}</p>
                                                        <p className="text-xs text-text-muted">{new Date(doc.uploadedAt).toLocaleDateString()} • {doc.type}</p>
                                                    </div>
                                                </div>
                                                {!isEditing && (
                                                    <button 
                                                        onClick={() => handleDeleteDocument(doc.id)}
                                                        className="text-text-muted hover:text-red-500 p-2 opacity-0 group-hover/doc:opacity-100 transition-opacity"
                                                        title={t('delete')}
                                                    >
                                                        <TrashIcon className="w-4 h-4"/>
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-text-muted text-center py-4">{t('noDocuments')}</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {nextAction && !isEditing && (
                        <div className="mt-6 border-t border-border pt-6 text-center">
                            <Button onClick={handleAction} className="px-8 py-3 text-base font-bold">
                                {nextAction.label}
                            </Button>
                        </div>
                    )}
                    
                    <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="lg:order-2">
                             {!isEditing && (
                                <Card className="bg-surface">
                                    <CardHeader className="flex items-center gap-3">
                                        <ChatBubbleBottomCenterTextIcon className="w-6 h-6 text-primary"/>
                                        <h4 className="font-bold text-text-heading">{t('addShipmentUpdate')}</h4>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <Textarea
                                                value={newUpdateMessage}
                                                onChange={(e) => setNewUpdateMessage(e.target.value)}
                                                placeholder={t('enterUpdateMessage')}
                                                rows={2}
                                                className="flex-grow"
                                            />
                                            <Button onClick={handleAddUpdate} disabled={!newUpdateMessage.trim()} className="w-full sm:w-auto">
                                                {t('addUpdate')}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                        <div className="lg:order-1">
                             <h3 className="text-xl font-bold text-text-heading mb-4">{t('shipmentTimeline')}</h3>
                            <div className={`relative ${language === 'ar' ? 'pr-4 border-r' : 'pl-4 border-l'} border-border`}>
                                {sortedUpdates.map((update, index) => (
                                    <div key={index} className={`mb-6 ${language === 'ar' ? 'mr-4' : 'ml-4'}`}>
                                        <div className={`absolute w-3 h-3 bg-primary rounded-full mt-1.5 ${language === 'ar' ? '-right-1.5' : '-left-1.5'} border border-background ring-2 ring-background`}></div>
                                        <time className="mb-1 text-sm font-normal leading-none text-text-muted">{new Date(update.timestamp).toLocaleString()}</time>
                                        <p className="text-base font-semibold text-text-base">{update.message}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export const ShipmentTrackerPage: React.FC<{ 
    shipments: Record<string, Shipment>; 
    onUpdateShipments: React.Dispatch<React.SetStateAction<Record<string, Shipment>>>; 
    onSaveShipment: (shipment: Shipment) => void;
}> = ({ shipments, onUpdateShipments, onSaveShipment }) => {
    const { t } = useLocalization();
    const [view, setView] = useState<'dashboard' | 'details' | 'add'>('dashboard');
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const handleViewDetails = (id: string) => {
        setSelectedId(id);
        setView('details');
    };

    const handleAddClick = () => {
        setView('add');
    };

    const handleBack = () => {
        setView('dashboard');
        setSelectedId(null);
    };

    const handleUpdateShipmentStatus = (id: string, newStatus: ShipmentStatus, message: string, details?: Partial<Shipment>) => {
        const shipment = shipments[id];
        if (!shipment) return;

        const update: ShipmentUpdate = {
            timestamp: new Date().toISOString(),
            message: message
        };

        const updatedShipment = {
            ...shipment,
            status: newStatus,
            updates: [update, ...shipment.updates],
            ...details
        };

        onSaveShipment(updatedShipment);
    };

    const handleSave = (updatedShipment: Shipment) => {
        onSaveShipment(updatedShipment);
        if (view === 'add') {
            setView('dashboard');
        }
    };

    const shipmentList = useMemo(() => Object.values(shipments), [shipments]);

    if (view === 'details' && selectedId && shipments[selectedId]) {
        return (
            <ShipmentDetails 
                shipment={shipments[selectedId]} 
                onBack={handleBack} 
                onUpdateShipment={handleUpdateShipmentStatus}
                onSave={handleSave}
            />
        );
    }

    if (view === 'add') {
        const newShipment: Shipment = {
            id: `SHP-${uuidv4().substring(0, 8).toUpperCase()}`,
            origin: '',
            destination: '',
            customer: '',
            status: 'pending',
            weight: '',
            value: '',
            createdAt: new Date().toISOString(),
            updates: [],
            documents: []
        };

        return (
            <ShipmentDetails 
                shipment={newShipment} 
                onBack={handleBack} 
                onUpdateShipment={() => {}} 
                onSave={handleSave}
            />
        );
    }

    return (
        <ShipmentDashboard 
            shipments={shipmentList} 
            onViewDetails={handleViewDetails} 
            onAddShipment={handleAddClick} 
        />
    );
};
