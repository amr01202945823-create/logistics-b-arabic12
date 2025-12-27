
import React, { useState, useEffect, useMemo } from 'react';
import { useLocalization } from '../localization';
import type { Company, User, Article, Shipment, AuditLog, MaritimeScenario } from '../types';
import { 
    ChartBarIcon, UsersIcon, BuildingLibraryIcon, 
    ShipIcon, LightBulbIcon, ShieldCheckIcon, SettingsIcon, CpuIcon,
    PlusIcon, EditIcon, TrashIcon, LogOutIcon, BoltIcon, CheckCircleIcon,
    DocumentTextIcon, MapPinIcon, SearchIcon, CommandLineIcon, SparklesIcon, CreditCardIcon, ArrowRightIcon,
    TwitterIcon, FacebookIcon, LinkedInIcon, LockClosedIcon,
    CurrencyDollarIcon, XIcon, DownloadIcon, TagIcon, EyeIcon, PhoneIcon, EnvelopeIcon, GlobeAltIcon, StarIcon
} from '../components/icons';
import { Button, Modal, Input, Textarea, Spinner, Card, CardContent } from '../components/ui';
import { getShippingAdvice } from '../services/geminiService';
import { ArticleForm } from '../components/ArticleForm';

interface AdminPageProps {
    companies: Company[];
    users: Record<string, User>;
    articles: Article[];
    shipments?: Record<string, Shipment>; 
    currentUser: User;
    onUpdateCompanyStatus: (id: number, status: 'approved' | 'rejected') => void;
    onUpdateCompany: (company: Company) => void;
    onDeleteCompany: (id: number) => void;
    onDeleteUser: (id: string) => void;
    onAddUser: (user: User) => void;
    onUpdateUser: (user: User) => void;
    onAddArticle: (article: Article) => void;
    onUpdateArticle: (article: Article) => void;
    onDeleteArticle: (id: number) => void;
    onBack: () => void;
    onNavigateToTool?: (tool: string) => void;
    globalSettings: any;
    onUpdateSettings: (settings: any) => void;
    systemPrompts: any;
    onUpdatePrompts: (prompts: any) => void;
    maritimeAlerts: any[];
    onUpdateAlerts: (alerts: any[]) => void;
    auditLogs: AuditLog[];
    onAddShipment: (shipment: Shipment) => void;
    onUpdateShipment: (shipment: Shipment) => void;
    onDeleteShipment: (id: string) => void;
    intelligenceScenarios: MaritimeScenario[];
    onUpdateScenarios: (scenarios: MaritimeScenario[]) => void;
}

const useMockWebSocket = () => {
    const [liveStats, setLiveStats] = useState({ activeUsers: 0, activeShipments: 0 });
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const connectionTimer = setTimeout(() => setIsConnected(true), 1500);
        const interval = setInterval(() => {
            setLiveStats(prev => ({
                activeUsers: prev.activeUsers + (Math.random() > 0.7 ? 1 : 0), 
                activeShipments: prev.activeShipments + (Math.random() > 0.85 ? 1 : 0)
            }));
        }, 5000); 

        return () => {
            clearTimeout(connectionTimer);
            clearInterval(interval);
        };
    }, []);

    return { liveStats, isConnected };
};

const exportToCSV = (data: any[], filename: string) => {
    if (!data.length) {
        alert("No data to export");
        return;
    }
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => 
        Object.values(obj).map(v => {
            const valStr = String(v || '');
            return `"${valStr.replace(/"/g, '""')}"`; 
        }).join(',')
    ).join('\n');

    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const canEdit = (user: User) => user.role === 'super_admin' || user.role === 'editor';
const canDelete = (user: User) => user.role === 'super_admin';
const canApprove = (user: User) => user.role === 'super_admin';
const canManageUsers = (user: User) => user.role === 'super_admin';
const canManageSettings = (user: User) => user.role === 'super_admin';
const canTestAI = (user: User) => user.role === 'super_admin' || user.role === 'editor';
const canDeployAI = (user: User) => user.role === 'super_admin';

export const DashboardStats = React.memo(({ 
    companies, users, activeShipmentsCount = 0, revenue = 0, liveStats 
}: { 
    companies: Company[]; 
    users: User[]; 
    activeShipmentsCount?: number;
    revenue?: number;
    liveStats?: { activeUsers: number, activeShipments: number }
}) => {
    const activeUsers = users.length + (liveStats?.activeUsers || 0);
    const totalShipments = activeShipmentsCount + (liveStats?.activeShipments || 0);
    const activeCompanies = useMemo(() => companies.filter(c => c.status === 'approved').length, [companies]);

    const calculatedRevenue = useMemo(() => {
        return users.reduce((acc, user) => {
            if (user.subscription === 'premium_monthly') return acc + 250;
            if (user.subscription === 'premium_yearly') return acc + 2400;
            return acc;
        }, 0);
    }, [users]);

    const displayRevenue = revenue > 0 ? revenue : calculatedRevenue;

    const cards = [
        {
            title: 'Active Users',
            value: activeUsers.toLocaleString(),
            change: '12% Increase',
            changeType: 'positive',
            icon: <UsersIcon className="w-7 h-7 text-white" />,
            gradient: 'from-[#4285f4] to-[#34a853]',
            border: 'border-[#4285f4]',
            isLive: true
        },
        {
            title: 'Active Shipments',
            value: totalShipments.toLocaleString(),
            change: '8% Increase',
            changeType: 'positive',
            icon: <ShipIcon className="w-7 h-7 text-white" />,
            gradient: 'from-[#fbbc05] to-[#ea4335]',
            border: 'border-[#fbbc05]',
            isLive: true
        },
        {
            title: 'Registered Companies',
            value: activeCompanies.toLocaleString(),
            change: '5 New',
            changeType: 'positive',
            icon: <BuildingLibraryIcon className="w-7 h-7 text-white" />,
            gradient: 'from-[#673ab7] to-[#9c27b0]',
            border: 'border-[#673ab7]'
        },
        {
            title: 'Total Revenue',
            value: `EGP ${displayRevenue.toLocaleString()}`,
            change: 'Based on active plans',
            changeType: 'positive',
            icon: <CurrencyDollarIcon className="w-7 h-7 text-white" />,
            gradient: 'from-[#00bcd4] to-[#009688]',
            border: 'border-[#00bcd4]'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {cards.map((card, idx) => (
                <div key={idx} className={`bg-white dark:bg-[#1e293b] rounded-[10px] p-5 shadow-sm hover:-translate-y-1 transition-transform duration-300 border-t-4 ${card.border} relative overflow-hidden group`}>
                    {card.isLive && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            <span className="text-[9px] font-bold text-red-500 tracking-wider">LIVE</span>
                        </div>
                    )}
                    <div className="flex items-center gap-4">
                        <div className={`w-[60px] h-[60px] rounded-[10px] flex items-center justify-center bg-gradient-to-br ${card.gradient}`}>
                            {card.icon}
                        </div>
                        <div>
                            <h3 className="text-[1.5rem] font-bold text-[#202124] dark:text-white leading-tight">{card.value}</h3>
                            <p className="text-[#5f6368] dark:text-slate-400 text-[0.8rem]">{card.title}</p>
                        </div>
                    </div>
                    <div className={`mt-2 text-[0.8rem] flex items-center gap-1 ${card.changeType === 'positive' ? 'text-[#34a853]' : 'text-[#ea4335]'}`}>
                        {card.changeType === 'positive' ? <ArrowRightIcon className="w-3 h-3 -rotate-45 rtl:rotate-45" /> : <ArrowRightIcon className="w-3 h-3 rotate-45 rtl:-rotate-45" />}
                        <span>{card.change}</span>
                    </div>
                </div>
            ))}
        </div>
    );
});

export const DashboardCharts = React.memo(() => {
    return <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-[#1e293b] rounded-[10px] p-5 shadow-sm h-64 flex items-center justify-center border border-gray-100 dark:border-gray-700">
            <div className="text-center">
                <ChartBarIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">User Activity Analytics</p>
            </div>
        </div>
        <div className="bg-white dark:bg-[#1e293b] rounded-[10px] p-5 shadow-sm h-64 flex items-center justify-center border border-gray-100 dark:border-gray-700">
            <div className="text-center">
                <ShipIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Shipment Volume by Region</p>
            </div>
        </div>
    </div>;
});

export const RecentActivities = React.memo(() => {
    const activities = [
        { title: 'New User Registered', desc: 'Global Logistics Co. signed up', time: '10 mins ago', icon: <UsersIcon className="w-4 h-4"/>, color: 'bg-[#4285f4]' },
        { title: 'New Shipment Created', desc: 'Jeddah to Alexandria shipment #2023', time: '35 mins ago', icon: <ShipIcon className="w-4 h-4"/>, color: 'bg-[#34a853]' },
        { title: 'Subscription Payment', desc: 'United Shipping paid annual plan', time: '1 hour ago', icon: <CreditCardIcon className="w-4 h-4"/>, color: 'bg-[#fbbc05]' },
        { title: 'New Article Published', desc: 'Customs Clearance Guide', time: '3 hours ago', icon: <DocumentTextIcon className="w-4 h-4"/>, color: 'bg-[#ea4335]' },
    ];

    return (
        <div className="bg-white dark:bg-[#1e293b] rounded-[10px] p-5 shadow-sm mb-8">
            <div className="flex justify-between items-center mb-5">
                <h3 className="text-[1.2rem] text-[#202124] dark:text-white font-bold">Recent System Activities</h3>
                <button className="px-4 py-1 bg-[#f1f3f4] dark:bg-slate-700 text-[#5f6368] dark:text-slate-300 text-[0.85rem] rounded-full hover:bg-[#e8eaed] dark:hover:bg-slate-600 transition">View All</button>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
                {activities.map((item, idx) => (
                    <div key={idx} className="flex gap-4 py-4 border-b border-[#f1f3f4] dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 px-2 rounded-lg transition-colors cursor-default">
                        <div className={`w-[40px] h-[40px] rounded-full flex items-center justify-center text-white text-[1rem] ${item.color}`}>
                            {item.icon}
                        </div>
                        <div>
                            <h4 className="mb-1 font-bold text-sm text-[#202124] dark:text-white">{item.title}</h4>
                            <p className="text--[#5f6368] dark:text-slate-400 text-[0.9rem] mb-1">{item.desc}</p>
                            <div className="text-[0.8rem] text-[#5f6368] dark:text-slate-500">{item.time}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});

// Company Form
const CompanyForm: React.FC<{
    initialData: Company | null;
    onSubmit: (company: Company, close: boolean) => void;
    onCancel: () => void;
    isReadOnly: boolean;
}> = ({ initialData, onSubmit, onCancel, isReadOnly }) => {
    const defaultCompany: Company = {
        id: Date.now(),
        name: { ar: '', en: '' },
        description: { ar: '', en: '' },
        category: 'freight-forwarder',
        logoShortName: 'NEW',
        logoBgColor: '#64748b',
        ports: [],
        branches: [{
            city: { ar: 'القاهرة', en: 'Cairo' },
            address: { ar: '', en: '' },
            workingHours: { ar: '9:00 - 17:00', en: '9:00 - 5:00' },
            peakTimes: [1, 1, 1, 1, 1]
        }],
        serviceAreas: {},
        contact: { email: '', phone: '' },
        status: 'approved',
        isFeatured: false
    };

    const [formData, setFormData] = useState<Company>(() => {
        if (!initialData) return defaultCompany;
        return {
            ...defaultCompany,
            ...initialData,
            name: { ...defaultCompany.name, ...(initialData.name || {}) },
            description: { ...defaultCompany.description, ...(initialData.description || {}) },
            contact: { ...defaultCompany.contact, ...(initialData.contact || {}) },
            branches: (initialData.branches && initialData.branches.length > 0) ? initialData.branches : defaultCompany.branches,
            serviceAreas: initialData.serviceAreas || {},
            isFeatured: initialData.isFeatured || false
        };
    });

    const [newServiceArea, setNewServiceArea] = useState({ key: '', en: '', ar: '', locations: '' });
    const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    useEffect(() => {
        if (!autoSaveEnabled || isReadOnly) return;
        setSaveStatus('saving');
        const timer = setTimeout(() => {
            onSubmit(formData, false);
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        }, 1500);
        return () => clearTimeout(timer);
    }, [formData, autoSaveEnabled, isReadOnly]);

    const handleNestedChange = (parent: 'name' | 'description' | 'contact', key: string, value: string) => {
        setFormData(prev => ({ ...prev, [parent]: { ...(prev[parent] || {}), [key]: value } }));
    };
    
    const handleAddServiceArea = () => {
        if (!newServiceArea.key || !newServiceArea.en || !newServiceArea.locations) return;
        const locationsArray = newServiceArea.locations.split(',').map(l => l.trim()).filter(l => l);
        const safeKey = newServiceArea.key.toLowerCase().replace(/\s+/g, '_');
        
        setFormData(prev => ({ 
            ...prev, 
            serviceAreas: { 
                ...(prev.serviceAreas || {}), 
                [safeKey]: { 
                    en: newServiceArea.en, 
                    ar: newServiceArea.ar || newServiceArea.en, 
                    locations: locationsArray 
                } 
            } 
        }));
        setNewServiceArea({ key: '', en: '', ar: '', locations: '' });
    };

    const handleRemoveServiceArea = (key: string) => { 
        const updatedAreas = { ...formData.serviceAreas }; 
        delete updatedAreas[key]; 
        setFormData(prev => ({ ...prev, serviceAreas: updatedAreas })); 
    };

    const handleUpdateServiceAreaLocations = (key: string, value: string) => {
        const locationsArray = value.split(',').map(l => l.trim());
        setFormData(prev => ({ 
            ...prev, 
            serviceAreas: { 
                ...(prev.serviceAreas || {}), 
                [key]: { 
                    ...(prev.serviceAreas?.[key] || { ar: '', en: '', locations: [] }), 
                    locations: locationsArray 
                } 
            } 
        }));
    };

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData, true); }} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            {!isReadOnly && (
                <div className="flex items-center justify-between bg-blue-50 dark:bg-slate-800/80 p-3 rounded-lg border border-blue-100 dark:border-slate-700 mb-4 sticky top-0 z-10 backdrop-blur-sm shadow-sm">
                    <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-full ${autoSaveEnabled ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'}`}><BoltIcon className="w-4 h-4" /></div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Auto-Update</span>
                    </div>
                    <div className="flex items-center gap-4">
                        {saveStatus === 'saving' && <span className="text-xs text-blue-600 font-medium flex items-center gap-1"><Spinner className="w-3 h-3"/> Saving...</span>}
                        {saveStatus === 'saved' && <span className="text-xs text-green-600 font-medium flex items-center gap-1"><CheckCircleIcon className="w-3 h-3"/> Saved</span>}
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={autoSaveEnabled} onChange={() => setAutoSaveEnabled(!autoSaveEnabled)} />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                    </div>
                </div>
            )}
            
            {/* Basic Info */}
            <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                    <h4 className="font-bold text-sm text-gray-500 uppercase">Basic Details</h4>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={formData.isFeatured || false} 
                            onChange={e => setFormData({...formData, isFeatured: e.target.checked})} 
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            disabled={isReadOnly}
                        />
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                             {formData.isFeatured && <StarIcon filled className="w-3 h-3 text-yellow-500" />} Featured
                        </span>
                    </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="Company Name (English)" value={formData.name?.en || ''} onChange={e => handleNestedChange('name', 'en', e.target.value)} required disabled={isReadOnly} />
                    <Input placeholder="اسم الشركة (Arabic)" value={formData.name?.ar || ''} onChange={e => handleNestedChange('name', 'ar', e.target.value)} required dir="rtl" disabled={isReadOnly} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <Textarea placeholder="Description (English)" value={formData.description?.en || ''} onChange={e => handleNestedChange('description', 'en', e.target.value)} rows={3} disabled={isReadOnly} />
                    <Textarea placeholder="الوصف (Arabic)" value={formData.description?.ar || ''} onChange={e => handleNestedChange('description', 'ar', e.target.value)} rows={3} dir="rtl" disabled={isReadOnly} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Category</label>
                        <select 
                            value={formData.category} 
                            onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                            className="w-full p-2 border rounded-lg bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm"
                            disabled={isReadOnly}
                        >
                            <option value="shipping-line">Shipping Line</option>
                            <option value="freight-forwarder">Freight Forwarder</option>
                            <option value="transportation">Transportation</option>
                            <option value="customs-broker">Customs Broker</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Website</label>
                        <Input placeholder="https://example.com" value={formData.website || ''} onChange={e => setFormData({...formData, website: e.target.value})} disabled={isReadOnly} />
                    </div>
                </div>

                {/* Branding Section */}
                <h4 className="font-bold text-sm text-gray-500 uppercase border-b pb-2 mt-4">Branding & Identity</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Logo Text (Short)</label>
                        <Input placeholder="e.g. MAERSK" value={formData.logoShortName || ''} onChange={e => setFormData({...formData, logoShortName: e.target.value})} disabled={isReadOnly} maxLength={10} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Brand Color</label>
                        <div className="flex items-center gap-2">
                            <input 
                                type="color" 
                                value={formData.logoBgColor || '#000000'} 
                                onChange={e => setFormData({...formData, logoBgColor: e.target.value})} 
                                className="w-10 h-10 p-1 rounded cursor-pointer border border-gray-300"
                                disabled={isReadOnly}
                            />
                            <Input value={formData.logoBgColor || ''} onChange={e => setFormData({...formData, logoBgColor: e.target.value})} disabled={isReadOnly} />
                        </div>
                    </div>
                </div>
                
                {/* Contact Section */}
                <h4 className="font-bold text-sm text-gray-500 uppercase border-b pb-2 mt-4">Contact Info</h4>
                <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg bg-gray-50 dark:bg-slate-800/50">
                    <Input placeholder="Email" value={formData.contact?.email || ''} onChange={e => handleNestedChange('contact', 'email', e.target.value)} disabled={isReadOnly} />
                    <Input placeholder="Phone" value={formData.contact?.phone || ''} onChange={e => handleNestedChange('contact', 'phone', e.target.value)} disabled={isReadOnly} />
                </div>

                {/* Service Areas */}
                <h4 className="font-bold text-sm text-gray-500 uppercase border-b pb-2 mt-4">Service Regions & Ports</h4>
                <div className="p-4 bg-blue-50 dark:bg-slate-800/50 rounded-lg border border-blue-100 dark:border-slate-700">
                    <h5 className="text-xs font-bold text-blue-600 mb-2 uppercase flex items-center gap-2"><GlobeAltIcon className="w-3 h-3" /> Add New Region</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                        <Input placeholder="Key (e.g. asia)" value={newServiceArea.key} onChange={e => setNewServiceArea({...newServiceArea, key: e.target.value})} className="h-9 text-xs" />
                        <Input placeholder="Name (EN)" value={newServiceArea.en} onChange={e => setNewServiceArea({...newServiceArea, en: e.target.value})} className="h-9 text-xs" />
                        <Input placeholder="Name (AR)" value={newServiceArea.ar} onChange={e => setNewServiceArea({...newServiceArea, ar: e.target.value})} className="h-9 text-xs text-right" dir="rtl" />
                    </div>
                    <div className="flex gap-2">
                        <Input placeholder="Ports (comma separated)" value={newServiceArea.locations} onChange={e => setNewServiceArea({...newServiceArea, locations: e.target.value})} className="h-9 text-xs flex-grow" />
                        <Button type="button" size="sm" onClick={handleAddServiceArea} disabled={!newServiceArea.key}><PlusIcon className="w-3 h-3 mr-1"/> Add</Button>
                    </div>
                </div>
                <div className="space-y-3">
                    {formData.serviceAreas && Object.entries(formData.serviceAreas).map(([key, area]) => (
                        <div key={key} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                            <div className="flex justify-between items-start mb-2">
                                <div className="font-bold text-sm text-slate-700 dark:text-slate-200">{(area as any).en} | {(area as any).ar}</div>
                                {!isReadOnly && <button type="button" onClick={() => handleRemoveServiceArea(key)} className="text-red-400"><TrashIcon className="w-4 h-4" /></button>}
                            </div>
                            <div className="flex flex-wrap gap-1 mb-2">
                                {(area as any).locations?.map((loc: string, i: number) => <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"><TagIcon className="w-3 h-3 mr-1 inline"/>{loc}</span>)}
                            </div>
                            <Textarea 
                                value={(area as any).locations?.join(', ')} 
                                onChange={(e) => handleUpdateServiceAreaLocations(key, e.target.value)} 
                                disabled={isReadOnly} 
                                className="text-xs min-h-[40px]" 
                                placeholder="Edit ports (comma separated)..."
                            />
                        </div>
                    ))}
                </div>
            </div>
            {!isReadOnly && <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-700 sticky bottom-0 bg-white dark:bg-[#1e293b] pb-2 z-10"><Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button><Button type="submit" className="bg-[#1a73e8] text-white px-8">Save Changes</Button></div>}
        </form>
    );
};

// Settings View - Updated with Testimonials & Socials
export const SettingsView: React.FC<{ settings: any; onUpdate: (s: any) => void; currentUser?: User }> = React.memo(({ settings, onUpdate, currentUser }) => {
    const [localSettings, setLocalSettings] = useState({
        ...settings,
        emailNotifications: settings.emailNotifications ?? true,
        smsNotifications: settings.smsNotifications ?? false,
        testimonials: settings.testimonials || [],
        socialLinks: settings.socialLinks || { twitter: '', facebook: '', linkedin: '' }
    });
    
    // Auto-Save State
    const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    // RBAC: Check if user can manage settings
    const hasAccess = currentUser ? canManageSettings(currentUser) : false;

    // Auto-Save Effect
    useEffect(() => {
        if (!autoSaveEnabled || !hasAccess) return;

        setSaveStatus('saving');
        const timer = setTimeout(() => {
            onUpdate(localSettings);
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        }, 1500);

        return () => clearTimeout(timer);
    }, [localSettings, autoSaveEnabled, hasAccess, onUpdate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalSettings({...localSettings, [e.target.name]: e.target.value});
    };

    const handleToggle = (name: string) => {
        setLocalSettings({...localSettings, [name]: !localSettings[name]});
    };

    // --- Social Media Handler ---
    const handleSocialChange = (platform: string, value: string) => {
        setLocalSettings({
            ...localSettings,
            socialLinks: { ...localSettings.socialLinks, [platform]: value }
        });
    };

    // --- Testimonial Handlers ---
    const handleAddTestimonial = () => {
        setLocalSettings({
            ...localSettings,
            testimonials: [...localSettings.testimonials, { id: Date.now(), text: '', author: '', role: '' }]
        });
    };

    const handleTestimonialChange = (index: number, field: string, value: string) => {
        const updated = [...localSettings.testimonials];
        updated[index] = { ...updated[index], [field]: value };
        setLocalSettings({ ...localSettings, testimonials: updated });
    };

    const handleRemoveTestimonial = (index: number) => {
        const updated = localSettings.testimonials.filter((_: any, i: number) => i !== index);
        setLocalSettings({ ...localSettings, testimonials: updated });
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            <Card className="relative overflow-hidden">
                {!hasAccess && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
                        <div className="bg-white dark:bg-[#1e293b] px-6 py-4 rounded-xl shadow-2xl border border-red-200 flex items-center gap-3">
                            <LockClosedIcon className="w-5 h-5 text-red-500"/>
                            <span className="font-bold text-red-600 dark:text-red-400">Read Only: Super Admin Access Required</span>
                        </div>
                    </div>
                )}
                
                <div className="p-6 border-b border-border bg-gray-50 dark:bg-slate-800 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-text-heading">General Settings</h3>
                        <p className="text-xs text-text-muted uppercase tracking-wider mt-1">Global Configuration</p>
                    </div>
                    
                    {/* Auto Update Toggle */}
                    {hasAccess && (
                        <div className="flex items-center gap-4 bg-white dark:bg-slate-700 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-600 shadow-sm">
                            <div className="flex items-center gap-2">
                                <div className={`p-1 rounded-full ${autoSaveEnabled ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                                    <BoltIcon className="w-3 h-3" />
                                </div>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Auto-Update</span>
                            </div>
                            
                            {saveStatus === 'saving' && <Spinner className="w-3 h-3 text-blue-500"/>}
                            {saveStatus === 'saved' && <CheckCircleIcon className="w-3 h-3 text-green-500"/>}
                            
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked={autoSaveEnabled} onChange={() => setAutoSaveEnabled(!autoSaveEnabled)} />
                                <div className="w-7 h-4 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-green-500"></div>
                            </label>
                        </div>
                    )}
                </div>
                <CardContent className="p-6 space-y-8">
                    {/* Basic Info */}
                    <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-text-muted mb-1">Site Name</label>
                                <Input name="siteName" value={localSettings.siteName} onChange={handleChange} disabled={!hasAccess} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-text-muted mb-1">Primary Color</label>
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded border border-border" style={{background: localSettings.primaryColor || '#2563eb'}}></div>
                                    <Input name="primaryColor" value={localSettings.primaryColor || '#2563eb'} onChange={handleChange} disabled={!hasAccess} />
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-text-muted mb-1">Support Email</label>
                            <Input name="contactEmail" value={localSettings.contactEmail} onChange={handleChange} disabled={!hasAccess} />
                        </div>
                    </div>

                    {/* Social Media Links */}
                    <div className="pt-6 border-t border-border">
                        <h4 className="text-sm font-bold text-text-heading uppercase tracking-wider mb-4 flex items-center gap-2">
                            <GlobeAltIcon className="w-4 h-4"/> Social Media Links
                        </h4>
                        <div className="grid gap-4">
                            <div className="flex items-center gap-2">
                                <TwitterIcon className="w-5 h-5 text-blue-400" />
                                <Input 
                                    placeholder="Twitter URL" 
                                    value={localSettings.socialLinks.twitter} 
                                    onChange={(e) => handleSocialChange('twitter', e.target.value)} 
                                    disabled={!hasAccess}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <FacebookIcon className="w-5 h-5 text-blue-700" />
                                <Input 
                                    placeholder="Facebook URL" 
                                    value={localSettings.socialLinks.facebook} 
                                    onChange={(e) => handleSocialChange('facebook', e.target.value)} 
                                    disabled={!hasAccess}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <LinkedInIcon className="w-5 h-5 text-blue-600" />
                                <Input 
                                    placeholder="LinkedIn URL" 
                                    value={localSettings.socialLinks.linkedin} 
                                    onChange={(e) => handleSocialChange('linkedin', e.target.value)} 
                                    disabled={!hasAccess}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Community Insights (Testimonials) */}
                    <div className="pt-6 border-t border-border">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-sm font-bold text-text-heading uppercase tracking-wider flex items-center gap-2">
                                <UsersIcon className="w-4 h-4"/> Community Insights
                            </h4>
                            <Button size="sm" variant="secondary" onClick={handleAddTestimonial} disabled={!hasAccess}>
                                <PlusIcon className="w-3 h-3 mr-1"/> Add Quote
                            </Button>
                        </div>
                        
                        <div className="space-y-4">
                            {localSettings.testimonials.map((t: any, idx: number) => (
                                <div key={idx} className="p-4 border border-border rounded-xl bg-gray-50 dark:bg-slate-800/50 relative">
                                    <button 
                                        onClick={() => handleRemoveTestimonial(idx)}
                                        className="absolute top-2 right-2 text-red-400 hover:text-red-600 p-1"
                                        disabled={!hasAccess}
                                    >
                                        <XIcon className="w-4 h-4"/>
                                    </button>
                                    <div className="grid md:grid-cols-2 gap-4 mb-2">
                                        <Input 
                                            placeholder="Author Name" 
                                            value={t.author} 
                                            onChange={(e) => handleTestimonialChange(idx, 'author', e.target.value)} 
                                            disabled={!hasAccess}
                                            className="text-sm"
                                        />
                                        <Input 
                                            placeholder="Role / Company" 
                                            value={t.role} 
                                            onChange={(e) => handleTestimonialChange(idx, 'role', e.target.value)} 
                                            disabled={!hasAccess}
                                            className="text-sm"
                                        />
                                    </div>
                                    <Textarea 
                                        placeholder="Quote text..." 
                                        value={t.text} 
                                        onChange={(e) => handleTestimonialChange(idx, 'text', e.target.value)}
                                        rows={2}
                                        disabled={!hasAccess}
                                        className="text-sm"
                                    />
                                </div>
                            ))}
                            {localSettings.testimonials.length === 0 && (
                                <p className="text-center text-xs text-text-muted italic py-4">No testimonials added.</p>
                            )}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-border flex justify-end">
                        <Button onClick={() => onUpdate(localSettings)} className="bg-blue-600 hover:bg-blue-700 text-white px-8" disabled={!hasAccess}>Save Changes</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
});

// --- COMPANIES VIEW ---
export const CompaniesView: React.FC<{
    companies: Company[];
    currentUser: User;
    onUpdateStatus: (id: number, status: 'approved' | 'rejected') => void;
    onDelete: (id: number) => void;
    onEdit: (company: Company) => void;
    onAdd: () => void;
}> = ({ companies, currentUser, onUpdateStatus, onDelete, onEdit, onAdd }) => {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Companies</h3>
                {canEdit(currentUser) && (
                    <Button onClick={onAdd} className="bg-blue-600 text-white"><PlusIcon className="w-4 h-4 mr-2"/> Add Company</Button>
                )}
            </div>
            <div className="grid gap-4">
                {companies.map(company => (
                    <Card key={company.id} className="p-4 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-slate-700 font-bold text-lg relative" style={{backgroundColor: company.logoBgColor, color: '#fff'}}>
                                {company.logoShortName}
                                {company.isFeatured && <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5 border border-white"><StarIcon filled className="w-3 h-3 text-white"/></div>}
                            </div>
                            <div>
                                <div className="font-bold text-lg flex items-center gap-2">
                                    {company.name.en}
                                    {company.isFeatured && <span className="text-[10px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-bold">FEATURED</span>}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">{company.category} • <span className={`font-semibold ${company.status === 'approved' ? 'text-green-600' : company.status === 'pending' ? 'text-yellow-600' : 'text-red-600'}`}>{company.status}</span></div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {company.status === 'pending' && canApprove(currentUser) && (
                                <>
                                    <Button size="sm" onClick={() => onUpdateStatus(company.id, 'approved')} className="bg-green-600 hover:bg-green-700 text-white">Approve</Button>
                                    <Button size="sm" variant="secondary" onClick={() => onUpdateStatus(company.id, 'rejected')} className="text-red-600 hover:text-red-800">Reject</Button>
                                </>
                            )}
                            {canEdit(currentUser) && (
                                <Button size="sm" variant="secondary" onClick={() => onEdit(company)}><EditIcon className="w-4 h-4"/></Button>
                            )}
                            {canDelete(currentUser) && (
                                <Button size="sm" variant="ghost" onClick={() => onDelete(company.id)}><TrashIcon className="w-4 h-4 text-red-500"/></Button>
                            )}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

// --- USERS VIEW ---
export const UsersView: React.FC<{
    users: User[];
    currentUser: User;
    onDelete: (id: string) => void;
    onEdit: (user: User) => void;
    onAdd: () => void;
}> = ({ users, currentUser, onDelete, onEdit, onAdd }) => {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">User Management</h3>
                {canManageUsers(currentUser) && (
                    <Button onClick={onAdd} className="bg-blue-600 text-white"><PlusIcon className="w-4 h-4 mr-2"/> Add User</Button>
                )}
            </div>
            <div className="grid gap-3">
                {users.map(user => (
                    <Card key={user.id} className="p-4 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                {user.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                                <div className="font-bold">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email} • <span className="uppercase text-xs font-semibold bg-gray-100 px-2 py-0.5 rounded">{user.role || 'viewer'}</span></div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {canEdit(currentUser) && (
                                <Button size="sm" variant="secondary" onClick={() => onEdit(user)}><EditIcon className="w-4 h-4"/></Button>
                            )}
                            {canDelete(currentUser) && user.id !== currentUser.id && (
                                <Button size="sm" variant="ghost" onClick={() => onDelete(user.id)}><TrashIcon className="w-4 h-4 text-red-500"/></Button>
                            )}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

// --- CONTENT VIEW ---
export const ContentView: React.FC<{
    articles: Article[];
    currentUser: User;
    onDelete: (id: number) => void;
    onEdit: (article: Article) => void;
    onAdd: () => void;
}> = ({ articles, currentUser, onDelete, onEdit, onAdd }) => {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Articles & News</h3>
                {canEdit(currentUser) && (
                    <Button onClick={onAdd} className="bg-blue-600 text-white"><PlusIcon className="w-4 h-4 mr-2"/> Add Article</Button>
                )}
            </div>
            <div className="grid gap-4">
                {articles.map(article => (
                    <Card key={article.id} className="p-4 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                                <img src={article.imageUrl} alt="" className="w-full h-full object-cover"/>
                            </div>
                            <div>
                                <div className="font-bold text-lg line-clamp-1">{article.title.en}</div>
                                <div className="text-sm text-gray-500">{article.category}</div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {canEdit(currentUser) && (
                                <Button size="sm" variant="secondary" onClick={() => onEdit(article)}><EditIcon className="w-4 h-4"/></Button>
                            )}
                            {canDelete(currentUser) && (
                                <Button size="sm" variant="ghost" onClick={() => onDelete(article.id)}><TrashIcon className="w-4 h-4 text-red-500"/></Button>
                            )}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

// --- SHIPMENTS VIEW ---
export const ShipmentsView: React.FC<{
    shipments: Record<string, Shipment>;
    currentUser: User;
    onDelete: (id: string) => void;
    onEdit: (shipment: Shipment) => void;
    onAdd: () => void;
}> = ({ shipments, currentUser, onDelete, onEdit, onAdd }) => {
    const list = Object.values(shipments) as Shipment[];
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Shipments</h3>
                {canEdit(currentUser) && (
                    <Button onClick={onAdd} className="bg-blue-600 text-white"><PlusIcon className="w-4 h-4 mr-2"/> Add Shipment</Button>
                )}
            </div>
            <div className="grid gap-3">
                {list.map(shipment => (
                    <Card key={shipment.id} className="p-4 flex flex-row items-center justify-between">
                        <div>
                            <div className="font-bold">{shipment.id}</div>
                            <div className="text-sm text-gray-500">{shipment.origin} → {shipment.destination} • {shipment.status}</div>
                        </div>
                        <div className="flex gap-2">
                            {canEdit(currentUser) && (
                                <Button size="sm" variant="secondary" onClick={() => onEdit(shipment)}><EditIcon className="w-4 h-4"/></Button>
                            )}
                            {canDelete(currentUser) && (
                                <Button size="sm" variant="ghost" onClick={() => onDelete(shipment.id)}><TrashIcon className="w-4 h-4 text-red-500"/></Button>
                            )}
                        </div>
                    </Card>
                ))}
                {list.length === 0 && <div className="text-center text-gray-500 py-8">No shipments found.</div>}
            </div>
        </div>
    );
};

// --- SUBSCRIPTIONS VIEW ---
export const SubscriptionsView: React.FC<{ users: User[] }> = ({ users }) => {
    const paidUsers = users.filter(u => u.subscription !== 'free');
    return (
        <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Active Subscriptions</h3>
            <div className="grid gap-3">
                {paidUsers.map(user => (
                    <Card key={user.id} className="p-4 flex flex-row items-center justify-between border-l-4 border-green-500">
                        <div>
                            <div className="font-bold">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                        <div className="text-right">
                            <div className="font-bold capitalize text-green-600">{user.subscription?.replace('_', ' ')}</div>
                            <div className="text-xs text-gray-400">Expires: {user.subscriptionEndDate || 'N/A'}</div>
                        </div>
                    </Card>
                ))}
                {paidUsers.length === 0 && <div className="text-center text-gray-500 py-8">No active subscriptions.</div>}
            </div>
        </div>
    );
};

// --- ANALYTICS VIEW ---
export const AnalyticsView: React.FC<{ shipments?: Record<string, Shipment> }> = ({ shipments }) => {
    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Analytics & Reports</h3>
            <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6 h-64 flex items-center justify-center bg-gray-50 dark:bg-slate-800">
                    <p className="text-gray-400">Shipment Volume Chart Placeholder</p>
                </Card>
                <Card className="p-6 h-64 flex items-center justify-center bg-gray-50 dark:bg-slate-800">
                    <p className="text-gray-400">Revenue Growth Chart Placeholder</p>
                </Card>
            </div>
            <div className="flex justify-end">
                <Button variant="outline" onClick={() => exportToCSV(Object.values(shipments || {}), 'shipments_report.csv')}>
                    <DownloadIcon className="w-4 h-4 mr-2"/> Export Shipments Data
                </Button>
            </div>
        </div>
    );
};

// --- AUDIT LOGS VIEW ---
export const AuditLogsView: React.FC<{ logs: AuditLog[] }> = ({ logs }) => {
    return (
        <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">System Audit Logs</h3>
            <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow border border-gray-200 dark:border-slate-700">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-gray-300 uppercase font-bold text-xs">
                        <tr>
                            <th className="px-6 py-3">Timestamp</th>
                            <th className="px-6 py-3">User</th>
                            <th className="px-6 py-3">Action</th>
                            <th className="px-6 py-3">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                        {logs.map(log => (
                            <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                <td className="px-6 py-4 font-mono text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                                <td className="px-6 py-4">{log.user} <span className="text-xs text-gray-400 block">{log.role}</span></td>
                                <td className="px-6 py-4 font-bold text-blue-600">{log.action}</td>
                                <td className="px-6 py-4 text-gray-500 truncate max-w-xs" title={log.details}>{log.details}</td>
                            </tr>
                        ))}
                        {logs.length === 0 && (
                            <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No logs recorded yet.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- AI BRAIN VIEW ---
export const AIBrainView: React.FC<{ 
    prompts: any; 
    onUpdatePrompts: (p: any) => void; 
    companies: Company[]; 
    articles: Article[];
    currentUser: User;
}> = ({ prompts, onUpdatePrompts, companies, articles, currentUser }) => {
    const [testPrompt, setTestPrompt] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [isTesting, setIsTesting] = useState(false);
    const [localPrompts, setLocalPrompts] = useState(prompts);

    const handleTestAI = async () => {
        setIsTesting(true);
        try {
            // Test Route Planner Logic
            const result = await getShippingAdvice(
                'Shanghai', 'Alexandria', 'Electronics', 'FOB', 'fcl', '1 container', 
                '10000 kg',
                companies, articles, 'en', localPrompts.routePlanner
            );
            setAiResponse(result.advice);
        } catch (e) {
            setAiResponse('Error: ' + (e as Error).message);
        } finally {
            setIsTesting(false);
        }
    };

    const handleSave = () => {
        onUpdatePrompts(localPrompts);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">AI Brain Configuration</h3>
                {canDeployAI(currentUser) && (
                    <Button onClick={handleSave} className="bg-purple-600 text-white"><BoltIcon className="w-4 h-4 mr-2"/> Deploy Prompts</Button>
                )}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h4 className="font-bold mb-2 flex items-center gap-2"><MapPinIcon className="w-4 h-4 text-blue-500"/> Route Planner System Prompt</h4>
                    <p className="text-xs text-gray-500 mb-4">Define how the AI analyzes routes. Use {'{articles}'} placeholder logic implicitly handled by backend.</p>
                    <Textarea 
                        value={localPrompts.routePlanner}
                        onChange={(e) => setLocalPrompts({...localPrompts, routePlanner: e.target.value})}
                        rows={10}
                        className="font-mono text-xs bg-slate-50"
                        disabled={!canEdit(currentUser)}
                    />
                </Card>
                <Card className="p-6">
                    <h4 className="font-bold mb-2 flex items-center gap-2"><SearchIcon className="w-4 h-4 text-green-500"/> HS Code System Prompt</h4>
                    <p className="text-xs text-gray-500 mb-4">Instructions for HS Code classification logic.</p>
                    <Textarea 
                        value={localPrompts.hsCode}
                        onChange={(e) => setLocalPrompts({...localPrompts, hsCode: e.target.value})}
                        rows={10}
                        className="font-mono text-xs bg-slate-50"
                        disabled={!canEdit(currentUser)}
                    />
                </Card>
            </div>

            {canTestAI(currentUser) && (
                <Card className="p-6 bg-slate-900 text-white">
                    <h4 className="font-bold mb-4 flex items-center gap-2"><CommandLineIcon className="w-5 h-5"/> Test Playground</h4>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-xs text-slate-400 mb-2">Simulated User Input (Route Planner)</p>
                            <div className="bg-slate-800 p-3 rounded text-xs font-mono text-slate-300">
                                Origin: Shanghai<br/>Destination: Alexandria<br/>Goods: Electronics
                            </div>
                            <Button onClick={handleTestAI} disabled={isTesting} className="mt-4 bg-blue-600 hover:bg-blue-700 w-full">
                                {isTesting ? <Spinner className="w-4 h-4 mr-2"/> : <SparklesIcon className="w-4 h-4 mr-2"/>}
                                Run Simulation
                            </Button>
                        </div>
                        <div className="bg-black/50 p-4 rounded-lg font-mono text-xs overflow-y-auto max-h-60 border border-slate-700">
                            {aiResponse || <span className="text-slate-600">// AI Response will appear here...</span>}
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
};

export const IntelligenceView: React.FC<{
    scenarios: MaritimeScenario[];
    onUpdateScenarios: (s: MaritimeScenario[]) => void;
}> = ({ scenarios, onUpdateScenarios }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentScenario, setCurrentScenario] = useState<MaritimeScenario | null>(null);

    // Form State with Safe Initialization
    const [formData, setFormData] = useState<MaritimeScenario>({
        id: 0,
        route: { ar: '', en: '' },
        routeDesc: { ar: '', en: '' },
        score: 0,
        hsCode: '',
        hsDesc: { ar: '', en: '' },
        status: 'optimal'
    });

    // Open Modal for Add
    const handleAdd = () => {
        setFormData({
            id: Date.now(),
            route: { ar: '', en: '' },
            routeDesc: { ar: '', en: '' },
            score: 80,
            hsCode: '',
            hsDesc: { ar: '', en: '' },
            status: 'optimal'
        });
        setCurrentScenario(null);
        setIsModalOpen(true);
    };

    // Open Modal for Edit - Robust parsing
    const handleEdit = (scenario: MaritimeScenario) => {
        try {
            const data = JSON.parse(JSON.stringify(scenario));
            // Ensure nested objects exist to prevent crashes
            if (!data.route) data.route = { ar: '', en: '' };
            if (!data.routeDesc) data.routeDesc = { ar: '', en: '' };
            if (!data.hsDesc) data.hsDesc = { ar: '', en: '' };
            
            setFormData(data);
            setCurrentScenario(scenario);
            setIsModalOpen(true);
        } catch (e) {
            console.error("Failed to parse scenario data", e);
        }
    };

    // Handle Delete
    const handleDelete = (id: number) => {
        if (window.confirm("Are you sure you want to delete this scenario?")) {
            onUpdateScenarios(scenarios.filter(s => s.id !== id));
        }
    };

    // Handle Save
    const handleSave = () => {
        if (currentScenario) {
            // Update
            onUpdateScenarios(scenarios.map(s => s.id === currentScenario.id ? formData : s));
        } else {
            // Create
            onUpdateScenarios([...scenarios, { ...formData, id: Date.now() }]);
        }
        setIsModalOpen(false);
    };

    // Helper to handle nested changes
    const handleNestedChange = (parent: 'route' | 'routeDesc' | 'hsDesc', lang: 'ar' | 'en', value: string) => {
        setFormData(prev => ({
            ...prev,
            [parent]: { ...(prev[parent] || {ar:'', en:''}), [lang]: value }
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Maritime Intelligence Scenarios</h3>
                <Button onClick={handleAdd} className="bg-blue-600 text-white">
                    <PlusIcon className="w-4 h-4 mr-2" /> Add Scenario
                </Button>
            </div>

            <div className="grid gap-4">
                {scenarios.map((scenario) => (
                    <Card key={scenario.id} className="p-0 overflow-hidden border-l-4 hover:shadow-md transition-all duration-300" style={{ borderLeftColor: scenario.status === 'critical' ? '#ef4444' : scenario.status === 'warning' ? '#f59e0b' : '#10b981' }}>
                        <div className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex-grow">
                                <div className="flex items-center gap-3 mb-1">
                                    <h4 className="font-bold text-lg text-gray-900 dark:text-white">{scenario.route?.en}</h4>
                                    <span className="text-sm text-gray-400">|</span>
                                    <h4 className="font-bold text-lg text-gray-900 dark:text-white font-cairo" dir="rtl">{scenario.route?.ar}</h4>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{scenario.routeDesc?.en} • {scenario.routeDesc?.ar}</p>
                                
                                <div className="flex items-center gap-2 text-xs bg-gray-100 dark:bg-slate-700 w-fit px-3 py-1.5 rounded-lg">
                                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{scenario.hsCode}</span>
                                    <span className="text-gray-400">-</span>
                                    <span className="text-gray-600 dark:text-gray-300">{scenario.hsDesc?.en}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 min-w-[200px] justify-end">
                                <div className="text-right">
                                    <span className={`inline-block px-2 py-1 rounded text-xs font-bold uppercase mb-1 ${
                                        scenario.status === 'critical' ? 'bg-red-100 text-red-600' : 
                                        scenario.status === 'warning' ? 'bg-amber-100 text-amber-600' : 
                                        'bg-green-100 text-green-600'
                                    }`}>
                                        {scenario.status}
                                    </span>
                                    <div className="text-sm font-bold text-gray-700 dark:text-gray-300">Score: {scenario.score}%</div>
                                </div>
                                
                                <div className="flex gap-2 pl-4 border-l border-gray-200 dark:border-gray-700">
                                    <button onClick={() => handleEdit(scenario)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors">
                                        <EditIcon className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(scenario.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentScenario ? "Edit Scenario" : "Add Scenario"}>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
                    {/* Route */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Route (EN)</label>
                            <Input value={formData.route?.en || ''} onChange={e => handleNestedChange('route', 'en', e.target.value)} placeholder="e.g. Jeddah -> Rotterdam" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Route (AR)</label>
                            <Input value={formData.route?.ar || ''} onChange={e => handleNestedChange('route', 'ar', e.target.value)} placeholder="مثال: جدة -> روتردام" dir="rtl" />
                        </div>
                    </div>

                    {/* Status & Score */}
                    <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
                            <select 
                                value={formData.status} 
                                onChange={e => setFormData({...formData, status: e.target.value as any})}
                                className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-sm"
                            >
                                <option value="optimal">Optimal (Green)</option>
                                <option value="warning">Warning (Amber)</option>
                                <option value="critical">Critical (Red)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Confidence Score (0-100)</label>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="range" 
                                    min="0" max="100" 
                                    value={formData.score} 
                                    onChange={e => setFormData({...formData, score: parseInt(e.target.value)})} 
                                    className="w-full"
                                />
                                <span className="font-bold text-sm w-8">{formData.score}</span>
                            </div>
                        </div>
                    </div>

                    {/* Route Description */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Route Description (EN)</label>
                        <Input value={formData.routeDesc?.en || ''} onChange={e => handleNestedChange('routeDesc', 'en', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Route Description (AR)</label>
                        <Input value={formData.routeDesc?.ar || ''} onChange={e => handleNestedChange('routeDesc', 'ar', e.target.value)} dir="rtl" />
                    </div>

                    <div className="border-t border-gray-200 my-2"></div>

                    {/* HS Code Info */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">HS Code</label>
                        <Input value={formData.hsCode || ''} onChange={e => setFormData({...formData, hsCode: e.target.value})} placeholder="e.g. HS 8418.69" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">HS Description (EN)</label>
                            <Input value={formData.hsDesc?.en || ''} onChange={e => handleNestedChange('hsDesc', 'en', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">HS Description (AR)</label>
                            <Input value={formData.hsDesc?.ar || ''} onChange={e => handleNestedChange('hsDesc', 'ar', e.target.value)} dir="rtl" />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}>Save Scenario</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export const AdminPage: React.FC<AdminPageProps> = ({
    companies, users, articles, shipments = {}, currentUser,
    onUpdateCompanyStatus, onUpdateCompany, onDeleteCompany,
    onDeleteUser, onAddUser, onUpdateUser,
    onAddArticle, onUpdateArticle, onDeleteArticle,
    onBack,
    globalSettings, onUpdateSettings,
    systemPrompts, onUpdatePrompts,
    maritimeAlerts, onUpdateAlerts,
    auditLogs,
    onAddShipment, onUpdateShipment, onDeleteShipment,
    intelligenceScenarios, onUpdateScenarios
}) => {
    const [view, setView] = useState('dashboard');
    const { liveStats, isConnected } = useMockWebSocket();
    
    // Modal States
    const [companyModal, setCompanyModal] = useState<{ isOpen: boolean, data: Company | null }>({ isOpen: false, data: null });
    const [articleModal, setArticleModal] = useState<{ isOpen: boolean, data: Article | null }>({ isOpen: false, data: null });

    const usersList = Object.values(users);

    const handleSaveCompany = (company: Company) => {
        onUpdateCompany(company);
        setCompanyModal({ isOpen: false, data: null });
    };

    const handleSaveArticle = (article: Article) => {
        if (articleModal.data) {
            onUpdateArticle(article);
        } else {
            onAddArticle(article);
        }
        setArticleModal({ isOpen: false, data: null });
    };

    const renderView = () => {
        switch(view) {
            case 'dashboard':
                return (
                    <div className="space-y-6 animate-fade-in">
                        <DashboardStats 
                            companies={companies} 
                            users={usersList} 
                            activeShipmentsCount={Object.keys(shipments).length}
                            revenue={0} 
                            liveStats={liveStats}
                        />
                        <DashboardCharts />
                        <RecentActivities />
                    </div>
                );
            case 'companies':
                return (
                    <>
                        <CompaniesView 
                            companies={companies} 
                            currentUser={currentUser}
                            onUpdateStatus={onUpdateCompanyStatus}
                            onDelete={onDeleteCompany}
                            onEdit={(c) => setCompanyModal({ isOpen: true, data: c })}
                            onAdd={() => setCompanyModal({ isOpen: true, data: null })}
                        />
                        <Modal isOpen={companyModal.isOpen} onClose={() => setCompanyModal({ isOpen: false, data: null })} title={companyModal.data ? 'Edit Company' : 'Add Company'}>
                            <CompanyForm 
                                initialData={companyModal.data} 
                                onSubmit={(c) => handleSaveCompany(c)} 
                                onCancel={() => setCompanyModal({ isOpen: false, data: null })} 
                                isReadOnly={!canEdit(currentUser)}
                            />
                        </Modal>
                    </>
                );
            case 'users':
                return <UsersView users={usersList} currentUser={currentUser} onDelete={onDeleteUser} onEdit={() => {}} onAdd={() => {}} />;
            case 'content':
                return (
                    <>
                        <ContentView 
                            articles={articles} 
                            currentUser={currentUser} 
                            onDelete={onDeleteArticle} 
                            onEdit={(a) => setArticleModal({ isOpen: true, data: a })} 
                            onAdd={() => setArticleModal({ isOpen: true, data: null })} 
                        />
                        <Modal isOpen={articleModal.isOpen} onClose={() => setArticleModal({ isOpen: false, data: null })} title={articleModal.data ? 'Edit Article' : 'Add Article'}>
                            <ArticleForm 
                                initialData={articleModal.data}
                                onSubmit={handleSaveArticle}
                                onCancel={() => setArticleModal({ isOpen: false, data: null })}
                            />
                        </Modal>
                    </>
                );
            case 'shipments':
                return <ShipmentsView shipments={shipments} currentUser={currentUser} onDelete={onDeleteShipment} onEdit={() => {}} onAdd={() => {}} />;
            case 'subscriptions':
                return <SubscriptionsView users={usersList} />;
            case 'analytics':
                return <AnalyticsView shipments={shipments} />;
            case 'intelligence':
                return <IntelligenceView scenarios={intelligenceScenarios} onUpdateScenarios={onUpdateScenarios} />;
            case 'ai-brain':
                return <AIBrainView prompts={systemPrompts} onUpdatePrompts={onUpdatePrompts} companies={companies} articles={articles} currentUser={currentUser} />;
            case 'settings':
                return <SettingsView settings={globalSettings} onUpdate={onUpdateSettings} currentUser={currentUser} />;
            case 'audit':
                return <AuditLogsView logs={auditLogs} />;
            default:
                return <div>View not found</div>;
        }
    };

    const menuItems = [
        { id: 'dashboard', label: 'Overview', icon: <ChartBarIcon className="w-5 h-5"/> },
        { id: 'companies', label: 'Companies', icon: <BuildingLibraryIcon className="w-5 h-5"/> },
        { id: 'users', label: 'Users', icon: <UsersIcon className="w-5 h-5"/> },
        { id: 'shipments', label: 'Shipments', icon: <ShipIcon className="w-5 h-5"/> },
        { id: 'content', label: 'Articles', icon: <DocumentTextIcon className="w-5 h-5"/> },
        { id: 'subscriptions', label: 'Subscriptions', icon: <CreditCardIcon className="w-5 h-5"/> },
        { id: 'analytics', label: 'Analytics', icon: <ChartBarIcon className="w-5 h-5"/> },
        { id: 'intelligence', label: 'Intelligence', icon: <LightBulbIcon className="w-5 h-5"/> },
        { id: 'ai-brain', label: 'AI Brain', icon: <CpuIcon className="w-5 h-5"/> },
        { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-5 h-5"/> },
        { id: 'audit', label: 'Audit Logs', icon: <ShieldCheckIcon className="w-5 h-5"/> },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-[#0f172a]">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-[#1e293b] border-r border-gray-200 dark:border-gray-700 hidden lg:block sticky top-0 h-screen overflow-y-auto">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <ShieldCheckIcon className="w-6 h-6 text-blue-600"/> Admin
                    </h2>
                </div>
                <nav className="px-4 space-y-1">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setView(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${view === item.id ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                </nav>
                <div className="p-4 mt-auto border-t border-gray-200 dark:border-gray-700">
                    <Button variant="ghost" onClick={onBack} className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50">
                        <LogOutIcon className="w-5 h-5 mr-2"/> Exit
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto h-screen">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white capitalize">{view.replace('-', ' ')}</h1>
                    <div className="flex items-center gap-4">
                        <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 ${isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                            {isConnected ? 'System Online' : 'Connecting...'}
                        </div>
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold">
                            {currentUser.name?.charAt(0)}
                        </div>
                    </div>
                </header>
                {renderView()}
            </main>
        </div>
    );
};
