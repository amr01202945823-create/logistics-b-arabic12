
import React, { useState, useMemo, useEffect } from 'react';
import { useLocalization } from '../localization';
import { Button, Card, CardContent, CardHeader, Input, Skeleton } from '../components/ui';
import type { User, Shipment, SavedRoute, Section } from '../types';
import { 
    CubeIcon, MapPinIcon, CurrencyDollarIcon, ClockIcon, CalendarDaysIcon, 
    CheckCircleIcon, HomeIcon, UserCircleIcon, ArrowLeftIcon, ArrowRightIcon, ChevronRightIcon, 
    SettingsIcon, CreditCardIcon, LogOutIcon, BellIcon, QuestionMarkCircleIcon,
    ShieldCheckIcon, EnvelopeIcon, PhoneIcon, DocumentTextIcon, CheckBadgeIcon
} from '../components/icons';

interface ProfilePageProps {
    user: User;
    onLogout: () => void;
    onNavigate: (section: Section) => void;
    shipments: Record<string, Shipment>;
    savedRoutes: SavedRoute[];
    onUpdateUser: (user: User) => void; // Added Prop
}

type Tab = 'dashboard' | 'shipments' | 'routes' | 'settings' | 'billing' | 'notifications' | 'help';

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, onLogout, onNavigate, shipments, savedRoutes, onUpdateUser }) => {
    const { t, language } = useLocalization();
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');

    // --- Statistics Calculation (Same as before) ---
    const stats = useMemo(() => {
        const shipmentList = Object.values(shipments) as Shipment[];
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const shipmentsToday = shipmentList.filter(s => new Date(s.createdAt) >= startOfToday).length;
        const shipmentsMonth = shipmentList.filter(s => new Date(s.createdAt) >= startOfMonth).length;
        
        const activeShipments = shipmentList.filter(s => s.status !== 'delivered').length;
        const completedShipments = shipmentList.filter(s => s.status === 'delivered').length;

        const totalProfit = shipmentList.reduce((acc, s) => {
            const cost = parseFloat(s.cost || '0');
            const price = parseFloat(s.price || '0');
            return acc + (price - cost);
        }, 0);

        const profitToday = shipmentList
            .filter(s => new Date(s.createdAt) >= startOfToday)
            .reduce((acc, s) => {
                const cost = parseFloat(s.cost || '0');
                const price = parseFloat(s.price || '0');
                return acc + (price - cost);
            }, 0);

        return {
            shipmentsToday,
            shipmentsMonth,
            activeShipments,
            completedShipments,
            totalProfit: totalProfit.toFixed(2),
            profitToday: profitToday.toFixed(2),
            savedRoutesCount: savedRoutes.length
        };
    }, [shipments, savedRoutes]);

    // --- Render Components ---

    const SidebarItem = ({ id, icon, label }: { id: Tab, icon: React.ReactNode, label: string }) => (
        <button 
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm group
                ${activeTab === id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : 'text-text-muted hover:bg-surface hover:text-text-heading hover:shadow-sm'
                }`}
        >
            {React.cloneElement(icon as React.ReactElement, { 
                className: `w-5 h-5 ${activeTab === id ? 'text-white' : 'text-text-muted group-hover:text-blue-600'}` 
            })}
            <span className="flex-grow text-start">{label}</span>
            {activeTab === id && (
                <div className="">
                    {language === 'ar' ? <ArrowLeftIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
                </div>
            )}
        </button>
    );

    const StatCard = ({ title, value, subtext, icon, colorClass }: any) => (
        <div className="bg-surface border border-border rounded-2xl p-5 hover:shadow-md transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 group-hover:scale-110 transition-transform`}>
                    {React.cloneElement(icon, { className: `w-6 h-6 ${colorClass.replace('bg-', 'text-')}` })}
                </div>
                {subtext && <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">{subtext}</span>}
            </div>
            <div>
                <h3 className="text-text-muted text-sm font-medium mb-1">{title}</h3>
                <div className="text-2xl font-extrabold text-text-heading">{value}</div>
            </div>
        </div>
    );

    const renderDashboard = () => (
        <div className="space-y-8 animate-fade-in">
            {/* Overview Section */}
            <div>
                <h3 className="text-xl font-bold text-text-heading mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                    {t('activityOverview')}
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <StatCard 
                        title={t('operationsMonth')} 
                        value={stats.shipmentsMonth} 
                        icon={<CalendarDaysIcon />} 
                        colorClass="bg-blue-600 text-blue-600"
                    />
                    <StatCard 
                        title={t('operationsToday')} 
                        value={stats.shipmentsToday} 
                        subtext={`${t('profit')}: ${stats.profitToday}`} 
                        icon={<ClockIcon />} 
                        colorClass="bg-indigo-500 text-indigo-500"
                    />
                </div>
            </div>

            {/* Tracking Section */}
            <div>
                <h3 className="text-xl font-bold text-text-heading mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                    {t('shipmentTracker')}
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                    <StatCard 
                        title={t('estimatedProfit')} 
                        value={stats.totalProfit} 
                        icon={<CurrencyDollarIcon />} 
                        colorClass="bg-emerald-500 text-emerald-500"
                    />
                    <StatCard 
                        title={t('completedShipments')} 
                        value={stats.completedShipments} 
                        icon={<CheckCircleIcon />} 
                        colorClass="bg-green-500 text-green-500"
                    />
                    <StatCard 
                        title={t('activeShipments')} 
                        value={stats.activeShipments} 
                        icon={<CubeIcon />} 
                        colorClass="bg-blue-500 text-blue-500"
                    />
                </div>
            </div>

            {/* Tools Section */}
            <div>
                <h3 className="text-xl font-bold text-text-heading mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                    {t('tools')}
                </h3>
                <div className="grid md:grid-cols-1 gap-6">
                    <StatCard 
                        title={t('savedRoutesCount')} 
                        value={stats.savedRoutesCount} 
                        icon={<MapPinIcon />} 
                        colorClass="bg-purple-500 text-purple-500"
                    />
                </div>
            </div>
        </div>
    );

    const renderShipments = () => (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-text-heading">{t('myShipments')}</h2>
            {Object.values(shipments).length > 0 ? (
                <div className="grid gap-4">
                    {Object.values(shipments).map((shipment: Shipment) => (
                        <div key={shipment.id} className="bg-surface border border-border p-4 rounded-xl flex items-center justify-between hover:border-blue-300 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                    <CubeIcon className="w-6 h-6"/>
                                </div>
                                <div>
                                    <h4 className="font-bold text-text-heading">{shipment.id}</h4>
                                    <p className="text-sm text-text-muted">{shipment.origin} → {shipment.destination}</p>
                                </div>
                            </div>
                            <div className="text-end">
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${shipment.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {t(shipment.status)}
                                </span>
                                <p className="text-xs text-text-muted mt-1">{new Date(shipment.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-surface border border-dashed border-border rounded-xl">
                    <p className="text-text-muted">{t('noShipments')}</p>
                </div>
            )}
        </div>
    );

    const renderRoutes = () => (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-text-heading">{t('savedRoutes')}</h2>
            {savedRoutes.length > 0 ? (
                <div className="grid gap-4">
                    {savedRoutes.map(route => (
                        <div key={route.id} className="bg-surface border border-border p-4 rounded-xl flex items-center justify-between hover:border-blue-300 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                                    <MapPinIcon className="w-6 h-6"/>
                                </div>
                                <div>
                                    <h4 className="font-bold text-text-heading">{route.name}</h4>
                                    <p className="text-sm text-text-muted">{route.origin} → {route.destination}</p>
                                </div>
                            </div>
                            <div className="text-end">
                                <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-text-heading">{route.shipmentType.toUpperCase()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-surface border border-dashed border-border rounded-xl">
                    <p className="text-text-muted">{t('noSavedRoutes')}</p>
                </div>
            )}
        </div>
    );

    // --- Interactive Settings Form ---
    const renderSettings = () => {
        const [formData, setFormData] = useState({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            companyName: user.companyName || '',
            currentPassword: '',
            newPassword: ''
        });
        const [isSaving, setIsSaving] = useState(false);
        const [saveMessage, setSaveMessage] = useState('');

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        };

        const handleSave = (e: React.FormEvent) => {
            e.preventDefault();
            setIsSaving(true);
            setSaveMessage('');

            // Simulate API delay
            setTimeout(() => {
                const updatedUser: User = {
                    ...user,
                    name: formData.name,
                    phone: formData.phone,
                    companyName: formData.companyName,
                    // Note: In a real app, password change would be a separate secure API call
                };
                onUpdateUser(updatedUser);
                setIsSaving(false);
                setSaveMessage('Profile updated successfully!');
                setTimeout(() => setSaveMessage(''), 3000);
            }, 800);
        };

        return (
            <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold text-text-heading">{t('accountSettings')}</h2>
                <Card className="max-w-xl">
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-3xl font-bold">
                                {user.name?.charAt(0).toUpperCase()}
                            </div>
                            <Button variant="outline" size="sm">{t('uploadPhoto')}</Button>
                        </div>
                        
                        <form onSubmit={handleSave} className="grid gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">{t('name')}</label>
                                <Input name="name" value={formData.name} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">{t('email')}</label>
                                <Input name="email" value={formData.email} disabled className="bg-gray-50 cursor-not-allowed" />
                                <p className="text-xs text-text-muted mt-1">Email cannot be changed directly.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">{t('phone')}</label>
                                <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 234 567 890" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">Company Name</label>
                                <Input name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Your Company Ltd." />
                            </div>
                            
                            <hr className="border-border my-2"/>
                            
                            <div>
                                <h4 className="font-bold text-sm text-text-heading mb-3">Change Password</h4>
                                <div className="grid gap-3">
                                    <Input 
                                        name="currentPassword" 
                                        type="password" 
                                        placeholder="Current Password" 
                                        value={formData.currentPassword} 
                                        onChange={handleChange} 
                                    />
                                    <Input 
                                        name="newPassword" 
                                        type="password" 
                                        placeholder="New Password" 
                                        value={formData.newPassword} 
                                        onChange={handleChange} 
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex items-center gap-4">
                                <Button type="submit" disabled={isSaving}>
                                    {isSaving ? 'Saving...' : t('saveChanges')}
                                </Button>
                                {saveMessage && <span className="text-green-600 text-sm font-medium animate-fade-in">{saveMessage}</span>}
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    };

    const renderBilling = () => (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-text-heading">{t('subscription')}</h2>
            <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none">
                <CardContent className="p-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-blue-100 mb-1">{t('currentPlan')}</p>
                            <h3 className="text-3xl font-bold mb-4 capitalize">{user.subscription === 'free' ? t('notSubscribed') : user.subscription.replace('_', ' ')}</h3>
                            {user.subscriptionEndDate && (
                                <p className="text-sm text-blue-100 bg-white/10 px-3 py-1 rounded-full inline-block">
                                    {t('expiresOn')} {new Date(user.subscriptionEndDate).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                        <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                            <CurrencyDollarIcon className="w-8 h-8 text-white"/>
                        </div>
                    </div>
                    <div className="mt-8">
                        <Button onClick={() => onNavigate('pricing')} className="bg-white text-blue-700 hover:bg-blue-50 border-none font-bold">
                            {user.subscription === 'free' ? t('upgradeSubscription') : t('manageSubscription')}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    // --- Interactive Notifications Form ---
    const renderNotifications = () => {
        const [prefs, setPrefs] = useState({
            emailNotifications: user.preferences?.emailNotifications ?? true,
            smsNotifications: user.preferences?.smsNotifications ?? false,
            marketingEmails: user.preferences?.marketingEmails ?? false,
        });

        const togglePref = (key: keyof typeof prefs) => {
            const newPrefs = { ...prefs, [key]: !prefs[key] };
            setPrefs(newPrefs);
            
            // Auto-save logic
            const updatedUser = { ...user, preferences: newPrefs };
            onUpdateUser(updatedUser);
        };

        return (
            <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold text-text-heading">{t('notificationsSettings')}</h2>
                <Card>
                    <CardContent className="p-6 space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-border">
                            <div>
                                <h4 className="font-bold text-text-heading">{t('emailNotifications')}</h4>
                                <p className="text-sm text-text-muted">{t('receiveEmails')}</p>
                            </div>
                            <button 
                                onClick={() => togglePref('emailNotifications')}
                                className={`relative inline-block w-12 h-6 rounded-full transition-colors ${prefs.emailNotifications ? 'bg-blue-600' : 'bg-gray-300'}`}
                            >
                                <span className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform transform ${prefs.emailNotifications ? 'translate-x-6' : ''}`}></span>
                            </button>
                        </div>
                        <div className="flex items-center justify-between pb-4 border-b border-border">
                            <div>
                                <h4 className="font-bold text-text-heading">{t('smsNotifications')}</h4>
                                <p className="text-sm text-text-muted">{t('receiveSms')}</p>
                            </div>
                            <button 
                                onClick={() => togglePref('smsNotifications')}
                                className={`relative inline-block w-12 h-6 rounded-full transition-colors ${prefs.smsNotifications ? 'bg-blue-600' : 'bg-gray-300'}`}
                            >
                                <span className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform transform ${prefs.smsNotifications ? 'translate-x-6' : ''}`}></span>
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-text-heading">{t('appUpdates')}</h4>
                                <p className="text-sm text-text-muted">{t('receiveAppUpdates')}</p>
                            </div>
                            <button 
                                onClick={() => togglePref('marketingEmails')}
                                className={`relative inline-block w-12 h-6 rounded-full transition-colors ${prefs.marketingEmails ? 'bg-blue-600' : 'bg-gray-300'}`}
                            >
                                <span className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform transform ${prefs.marketingEmails ? 'translate-x-6' : ''}`}></span>
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    };

    const renderHelp = () => (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-text-heading capitalize">{t('helpAndSupport')}</h2>
            
            <div className="grid gap-4">
                {/* FAQs */}
                <div 
                    onClick={() => onNavigate('faq')}
                    className="bg-surface border border-border rounded-xl p-5 hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-full group-hover:scale-110 transition-transform">
                            <QuestionMarkCircleIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-text-heading">{t('faqs')}</h4>
                            <p className="text-sm text-text-muted">{t('commonQuestions')}</p>
                        </div>
                    </div>
                    {language === 'ar' ? <ArrowLeftIcon className="w-5 h-5 text-text-muted group-hover:text-blue-600" /> : <ArrowRightIcon className="w-5 h-5 text-text-muted group-hover:text-blue-600" />}
                </div>

                {/* Contact Support */}
                <div 
                    onClick={() => onNavigate('contact-us')}
                    className="bg-surface border border-border rounded-xl p-5 hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-full group-hover:scale-110 transition-transform">
                            <PhoneIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-text-heading">{t('contactSupport')}</h4>
                            <p className="text-sm text-text-muted">{t('reachSupportTeam')}</p>
                        </div>
                    </div>
                    {language === 'ar' ? <ArrowLeftIcon className="w-5 h-5 text-text-muted group-hover:text-green-600" /> : <ArrowRightIcon className="w-5 h-5 text-text-muted group-hover:text-green-600" />}
                </div>

                {/* Terms and Conditions */}
                <div 
                    onClick={() => onNavigate('terms')}
                    className="bg-surface border border-border rounded-xl p-5 hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-full group-hover:scale-110 transition-transform">
                            <DocumentTextIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-text-heading">{t('termsAndConditions')}</h4>
                            <p className="text-sm text-text-muted">{t('legalInformation')}</p>
                        </div>
                    </div>
                    {language === 'ar' ? <ArrowLeftIcon className="w-5 h-5 text-text-muted group-hover:text-purple-600" /> : <ArrowRightIcon className="w-5 h-5 text-text-muted group-hover:text-purple-600" />}
                </div>

                {/* Privacy Policy */}
                <div 
                    onClick={() => onNavigate('privacy')}
                    className="bg-surface border border-border rounded-xl p-5 hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-full group-hover:scale-110 transition-transform">
                            <ShieldCheckIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-text-heading">{t('privacyPolicy')}</h4>
                            <p className="text-sm text-text-muted">{t('dataProtection')}</p>
                        </div>
                    </div>
                    {language === 'ar' ? <ArrowLeftIcon className="w-5 h-5 text-text-muted group-hover:text-orange-600" /> : <ArrowRightIcon className="w-5 h-5 text-text-muted group-hover:text-orange-600" />}
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto py-8 min-h-[calc(100vh-80px)]">
            <div className="grid lg:grid-cols-4 gap-8 h-full">
                
                {/* Sidebar (Profile Card + Navigation) */}
                <div className="lg:col-span-1 order-1 lg:order-2">
                    <div className="sticky top-24 space-y-6">
                        {/* User Profile Summary */}
                        <div className="bg-surface border border-border rounded-2xl p-6 text-center shadow-sm">
                            <div className="w-24 h-24 mx-auto bg-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-md mb-4 border-4 border-white dark:border-slate-800">
                                {user.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <h2 className="font-bold text-lg text-text-heading truncate">{user.name}</h2>
                            <p className="text-xs text-text-muted truncate mb-4">{user.email}</p>
                            
                            <div className="flex justify-center gap-2 mb-4">
                                {user.role === 'super_admin' && <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-[10px] font-bold uppercase">Admin</span>}
                                <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wide">
                                    {user.subscription === 'free' ? t('notSubscribed') : t('premiumFeature')}
                                </span>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="space-y-1 bg-surface rounded-xl border border-border p-2 shadow-sm">
                            <SidebarItem id="dashboard" icon={<HomeIcon />} label={t('viewDashboard')} />
                            <SidebarItem id="shipments" icon={<CubeIcon />} label={t('myShipments')} />
                            <SidebarItem id="routes" icon={<MapPinIcon />} label={t('savedRoutes')} />
                            <SidebarItem id="settings" icon={<UserCircleIcon />} label={t('accountSettings')} />
                            <SidebarItem id="notifications" icon={<BellIcon />} label={t('notifications')} />
                            <SidebarItem id="billing" icon={<CurrencyDollarIcon />} label={t('subscription')} />
                            <SidebarItem id="help" icon={<QuestionMarkCircleIcon />} label={t('helpAndSupport')} />
                        </nav>

                        <div className="pt-4">
                            <button 
                                onClick={onLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors font-medium text-sm justify-center border border-transparent hover:border-red-100"
                            >
                                <LogOutIcon className="w-5 h-5 rotate-180 rtl:rotate-0" />
                                <span>{t('logout')}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3 order-2 lg:order-1">
                    <div className="bg-surface rounded-2xl border border-border p-6 md:p-8 shadow-sm min-h-[600px]">
                        {activeTab === 'dashboard' && renderDashboard()}
                        {activeTab === 'shipments' && renderShipments()}
                        {activeTab === 'routes' && renderRoutes()}
                        {activeTab === 'settings' && renderSettings()}
                        {activeTab === 'billing' && renderBilling()}
                        {activeTab === 'notifications' && renderNotifications()}
                        {activeTab === 'help' && renderHelp()}
                    </div>
                </div>
            </div>
        </div>
    );
};
