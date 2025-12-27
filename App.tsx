import React, { useState, useMemo, useEffect, Suspense, lazy, useCallback } from 'react';
import { useLocalization } from './localization';
import type { Section, Company, User, SavedRoute, Shipment, Article, AuditLog, MaritimeScenario } from './types';
import { getCurrentUser, logout as authLogout, register, updateProfile } from './services/authService';
import { Button, Skeleton } from './components/ui';
import {
  CheckBadgeIcon, ShipIcon, DocumentTextIcon,
  GlobeAltIcon, SunIcon, MoonIcon, MenuIcon, XIcon, TwitterIcon, FacebookIcon, LinkedInIcon,
  ChevronDownIcon, CompassIcon, FilePlus2Icon, SearchIcon, UserIcon, UserCircleIcon,
  VisaIcon, MastercardIcon, WalletIcon, ChevronRightIcon, MapPinIcon
} from './components/icons';
import { COMPANIES, ARTICLES, DEFAULT_SCENARIOS } from './constants';
import { v4 as uuidv4 } from 'uuid';

declare const html2pdf: any;

// --- Lazy Loaded Components ---
const HomePage = lazy(() => import('./pages/HomePage').then(module => ({ default: module.HomePage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(module => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(module => ({ default: module.RegisterPage })));
const ContactUsPage = lazy(() => import('./pages/ContactUsPage').then(module => ({ default: module.ContactUsPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(module => ({ default: module.ProfilePage })));
const ShipmentTrackerPage = lazy(() => import('./pages/ShipmentTrackerPage').then(module => ({ default: module.ShipmentTrackerPage })));
const ShippingFormsPage = lazy(() => import('./pages/ShippingFormsPage').then(module => ({ default: module.ShippingFormsPage })));
const PricingPage = lazy(() => import('./pages/PricingPage').then(module => ({ default: module.PricingPage })));
const RoutePlannerPage = lazy(() => import('./pages/RoutePlannerPage').then(module => ({ default: module.RoutePlannerPage })));
const HSCodeFinderPage = lazy(() => import('./pages/HSCodeFinderPage').then(module => ({ default: module.HSCodeFinderPage })));
const InvoiceGeneratorPage = lazy(() => import('./pages/InvoiceGeneratorPage').then(module => ({ default: module.InvoiceGeneratorPage })));
const ArticlesPage = lazy(() => import('./pages/ArticlesPage').then(module => ({ default: module.ArticlesPage })));
const DirectoryPage = lazy(() => import('./pages/DirectoryPage').then(module => ({ default: module.DirectoryPage })));
const CompanyProfilePage = lazy(() => import('./pages/CompanyProfilePage').then(module => ({ default: module.CompanyProfilePage })));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage').then(module => ({ default: module.PrivacyPolicyPage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then(module => ({ default: module.TermsPage })));
const FAQPage = lazy(() => import('./pages/FAQPage').then(module => ({ default: module.FAQPage })));
const AdminPage = lazy(() => import('./pages/AdminPage').then(module => ({ default: module.AdminPage })));
const DocumentEditorPage = lazy(() => import('./pages/DocumentEditorPage'));

// --- Skeleton Loader for Pages ---
const PageLoader = () => (
  <div className="max-w-6xl mx-auto p-4 space-y-8 animate-fade-in">
    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="space-y-3 w-full md:w-1/2">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
        </div>
        <Skeleton className="h-12 w-32 rounded-lg" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
    </div>
  </div>
);

// Updated Logo Component
const Logo: React.FC<{ onNavigate: (section: Section) => void; isFooter?: boolean }> = React.memo(({ onNavigate, isFooter }) => {
    const { language } = useLocalization();
    const textColorClass = isFooter ? 'text-white' : 'text-slate-900 dark:text-white';
    
    return (
        <a 
            href="#/home" 
            onClick={(e) => { e.preventDefault(); onNavigate('home'); }} 
            className="group flex flex-col justify-center select-none"
            dir="ltr"
        >
            <h1 className={`text-2xl font-bold leading-none tracking-tight ${textColorClass} ${language === 'ar' ? 'font-cairo' : 'font-inter'} flex items-baseline`}>
                Logistics 
                <span className="text-3xl font-extrabold text-blue-600 mx-1 transform group-hover:scale-110 transition-transform duration-300 inline-block">B</span> 
                Arab
            </h1>
            <p className={`text-[10px] font-medium uppercase tracking-[0.2em] ${isFooter ? 'text-slate-400' : 'text-slate-500'} ml-0.5`}>
                Bridge of Knowledge
            </p>
        </a>
    );
});

const Header: React.FC<{
    activeSection: Section;
    onSectionChange: (section: Section) => void;
    currentUser: User | null;
    onLogout: () => void;
}> = React.memo(({ activeSection, onSectionChange, currentUser, onLogout }) => {
    const { t, language, setLanguage, theme, setTheme } = useLocalization();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
    const [isMobileToolsOpen, setIsMobileToolsOpen] = useState(false);
    
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setIsMobileMenuOpen(false);
        };
        if (isMobileMenuOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isMobileMenuOpen]);

    const ThemeToggleButton = () => (
        <button 
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
            aria-label="Toggle theme"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
            {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
        </button>
    );

    const LanguageToggleButton = () => (
         <button 
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')} 
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
            aria-label="Toggle language"
            title={language === 'en' ? 'Switch to Arabic' : 'Switch to English'}
        >
            <GlobeAltIcon className="w-6 h-6" />
        </button>
    );
    
    const toolsDropdownItems = useMemo(() => [
        { section: 'hs-code', labelKey: 'hsCodeFinder', icon: <SearchIcon /> },
        { section: 'invoice-generator', labelKey: 'invoiceGenerator', icon: <FilePlus2Icon /> },
        { section: 'shipping-forms', labelKey: 'shippingForms', icon: <ShipIcon /> },
        { section: 'shipment-tracker', labelKey: 'shipmentTracker', icon: <CheckBadgeIcon /> },
    ], [t]);

    const handleMobileLinkClick = (section: Section) => {
      onSectionChange(section);
      setIsMobileMenuOpen(false);
    };

    const isToolsSectionActive = useMemo(() => toolsDropdownItems.some(tool => tool.section === activeSection), [activeSection, toolsDropdownItems]);

    return (
        <>
        <nav dir="ltr" className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-all duration-300">
            <div className="container mx-auto px-4 md:px-8 py-3 flex justify-between items-center">
                <div className="flex-shrink-0">
                    <Logo onNavigate={onSectionChange} />
                </div>

                <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    <a href="#/home" onClick={(e) => { e.preventDefault(); onSectionChange('home'); }} className={`transition ${activeSection === 'home' ? 'text-blue-600 font-bold' : 'hover:text-blue-600 dark:hover:text-blue-400'}`}>{t('home')}</a>
                    
                    <div className="relative group h-full flex items-center" onMouseEnter={() => setIsToolsDropdownOpen(true)} onMouseLeave={() => setIsToolsDropdownOpen(false)}>
                        <button className={`transition flex items-center gap-1 ${isToolsSectionActive ? 'text-blue-600 font-bold' : 'hover:text-blue-600 dark:hover:text-blue-400'}`}>
                            {t('tools')}
                            <ChevronDownIcon className={`w-3 h-3 transition-transform duration-300 ${isToolsDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <div className={`mega-menu ${isToolsDropdownOpen ? 'mega-menu-open' : ''} absolute top-full mt-4 w-[400px] bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-800 p-4 z-50 left-1/2 -translate-x-1/2`}>
                            <div className="grid grid-cols-1 gap-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                                {toolsDropdownItems.map(tool => (
                                    <a key={tool.section} href={`#/${tool.section}`} onClick={(e) => { e.preventDefault(); onSectionChange(tool.section as Section); setIsToolsDropdownOpen(false); }} className="flex items-center p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors group/item text-left">
                                        <div className={`p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg shadow-sm group-hover/item:bg-white dark:group-hover/item:bg-slate-700 group-hover/item:shadow-md transition-all ${language === 'ar' ? 'ml-4' : 'mr-4'}`}>
                                            {React.cloneElement(tool.icon, { className: 'w-5 h-5 text-blue-600 dark:text-blue-400' })}
                                        </div>
                                        <div className="flex-1 text-start">
                                            <span className="font-bold block text-slate-900 dark:text-slate-100 text-sm">{t(tool.labelKey)}</span>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{t(`${tool.labelKey}Desc`)}</p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    <a href="#/articles" onClick={(e) => { e.preventDefault(); onSectionChange('articles'); }} className={`transition ${activeSection === 'articles' ? 'text-blue-600 font-bold' : 'hover:text-blue-600 dark:hover:text-blue-400'}`}>{t('knowledgeBase')}</a>
                    <a href="#/directory" onClick={(e) => { e.preventDefault(); onSectionChange('directory'); }} className={`transition ${activeSection === 'directory' ? 'text-blue-600 font-bold' : 'hover:text-blue-600 dark:hover:text-blue-400'}`}>{t('directory')}</a>
                    <a href="#/pricing" onClick={(e) => { e.preventDefault(); onSectionChange('pricing'); }} className={`transition ${activeSection === 'pricing' ? 'text-blue-600 font-bold' : 'hover:text-blue-600 dark:hover:text-blue-400'}`}>{t('pricing')}</a>
                    <a href="#/contact-us" onClick={(e) => { e.preventDefault(); onSectionChange('contact-us'); }} className={`transition ${activeSection === 'contact-us' ? 'text-blue-600 font-bold' : 'hover:text-blue-600 dark:hover:text-blue-400'}`}>{t('contactUs')}</a>
                    
                    {currentUser && (currentUser.isAdmin || currentUser.role === 'super_admin' || currentUser.role === 'editor') && (
                        <button onClick={() => onSectionChange('admin')} className="text-amber-600 font-bold hover:text-amber-700 transition">
                            Admin
                        </button>
                    )}
                </div>

                <div className="hidden lg:flex items-center gap-2">
                    <LanguageToggleButton />
                    <ThemeToggleButton />
                    {currentUser ? (
                        <button 
                            onClick={() => onSectionChange('profile')} 
                            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 relative group"
                            title={t('profile')}
                        >
                            <UserCircleIcon className="w-6 h-6 text-primary" />
                            <span className="absolute top-full right-0 mt-2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                {currentUser.name?.split(' ')[0]}
                            </span>
                        </button>
                    ) : (
                        <button 
                            onClick={() => onSectionChange('login')} 
                            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
                            title={t('login')}
                        >
                            <UserIcon className="w-6 h-6" />
                        </button>
                    )}
                </div>

                <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden text-slate-600 dark:text-slate-300 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                    <MenuIcon className="w-7 h-7" />
                </button>
            </div>
        </nav>

        <div className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMobileMenuOpen(false)}>
            <div className={`fixed top-0 h-full w-[85%] max-w-sm bg-surface shadow-2xl transition-transform duration-300 transform ${language === 'ar' ? 'right-0' : 'left-0'} ${isMobileMenuOpen ? 'translate-x-0' : (language === 'ar' ? 'translate-x-full' : '-translate-x-full')}`} onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800" dir="ltr">
                    <Logo onNavigate={handleMobileLinkClick} />
                    <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-500 hover:text-red-500 transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                
                 <nav className="p-6 space-y-4 overflow-y-auto h-[calc(100%-80px)]">
                    <a href="#/home" onClick={e => {e.preventDefault(); handleMobileLinkClick('home')}} className={`block font-bold text-lg ${activeSection === 'home' ? 'text-blue-600' : 'text-slate-600 dark:text-slate-300'}`}>{t('home')}</a>
                    
                    {currentUser && (currentUser.isAdmin || currentUser.role === 'super_admin' || currentUser.role === 'editor') && (
                        <a href="#/admin" onClick={e => {e.preventDefault(); handleMobileLinkClick('admin')}} className="block font-bold text-lg text-amber-600">Admin Dashboard</a>
                    )}

                    <div>
                        <button onClick={() => setIsMobileToolsOpen(!isMobileToolsOpen)} className="flex items-center justify-between w-full font-bold text-lg text-slate-600 dark:text-slate-300">
                            <span>{t('tools')}</span>
                            <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${isMobileToolsOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <div className={`space-y-3 ps-4 mt-3 overflow-hidden transition-all duration-300 ${isMobileToolsOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                              {toolsDropdownItems.map(item => (
                                 <a key={item.section} href={`#/${item.section}`} onClick={e => {e.preventDefault(); handleMobileLinkClick(item.section as Section)}} className={`block text-slate-500 dark:text-slate-400 font-medium`}>
                                      {t(item.labelKey)}
                                  </a>
                              ))}
                        </div>
                    </div>

                    <a href="#/articles" onClick={e => {e.preventDefault(); handleMobileLinkClick('articles')}} className={`block font-bold text-lg ${activeSection === 'articles' ? 'text-blue-600' : 'text-slate-600 dark:text-slate-300'}`}>{t('knowledgeBase')}</a>
                    <a href="#/directory" onClick={e => {e.preventDefault(); handleMobileLinkClick('directory')}} className={`block font-bold text-lg ${activeSection === 'directory' ? 'text-blue-600' : 'text-slate-600 dark:text-slate-300'}`}>{t('directory')}</a>
                    <a href="#/pricing" onClick={e => {e.preventDefault(); handleMobileLinkClick('pricing')}} className={`block font-bold text-lg ${activeSection === 'pricing' ? 'text-blue-600' : 'text-slate-600 dark:text-slate-300'}`}>{t('pricing')}</a>
                    <div className="border-t border-slate-100 dark:border-slate-800 my-2 pt-2">
                        <a href="#/privacy" onClick={e => {e.preventDefault(); handleMobileLinkClick('privacy')}} className={`block text-sm font-medium ${activeSection === 'privacy' ? 'text-blue-600' : 'text-slate-500 dark:text-slate-400'}`}>{t('privacyPolicy')}</a>
                        <a href="#/terms" onClick={e => {e.preventDefault(); handleMobileLinkClick('terms')}} className={`block text-sm font-medium mt-2 ${activeSection === 'terms' ? 'text-blue-600' : 'text-slate-500 dark:text-slate-400'}`}>{t('termsAndConditions')}</a>
                    </div>

                    
                    <div className="h-px bg-slate-100 dark:bg-slate-800 my-4"></div>

                    <div className="flex items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-2">
                            <ThemeToggleButton />
                            <LanguageToggleButton />
                        </div>
                    </div>
                    
                    {currentUser ? (
                         <button onClick={() => { onLogout(); setIsMobileMenuOpen(false); }} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold shadow-lg shadow-blue-600/20">
                             {t('logout')}
                        </button>
                    ) : (
                        <button onClick={() => handleMobileLinkClick('login')} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold shadow-lg shadow-blue-600/20">
                            {t('login')}
                        </button>
                    )}
                </nav>
            </div>
        </div>
        </>
    );
});

const PaymentBadge: React.FC<{ children: React.ReactNode, bg?: string, text?: string }> = ({ children, bg = "bg-white", text = "text-slate-700" }) => (
    <div className={`h-8 px-2 rounded border border-white/10 flex items-center justify-center ${bg} ${text} shadow-sm`}>
        {children}
    </div>
);

const Footer: React.FC<{ onSectionChange: (section: Section) => void; socialLinks?: { twitter: string; facebook: string; linkedin: string } }> = React.memo(({ onSectionChange, socialLinks }) => {
    const { t, language } = useLocalization();
    const currentYear = new Date().getFullYear();

    const socialMedia = [
        { icon: <TwitterIcon className="w-5 h-5"/>, href: socialLinks?.twitter || "#", label: "Twitter" },
        { icon: <FacebookIcon className="w-5 h-5"/>, href: socialLinks?.facebook || "#", label: "Facebook" },
        { icon: <LinkedInIcon className="w-5 h-5"/>, href: socialLinks?.linkedin || "#", label: "LinkedIn" },
    ];

    return (
        <footer className="bg-[#0f172a] text-white pt-16 pb-8 border-t border-slate-800 font-sans">
            <div className="container mx-auto px-4 md:px-8">
                {/* Top Section: 4 Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    
                    {/* Column 1: Brand & Bio */}
                    <div className="col-span-1">
                        <div className="mb-6 flex items-start">
                            <Logo onNavigate={onSectionChange} isFooter />
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6">
                            {t('heroSubtitle_new')}
                        </p>
                        <div className="flex gap-4">
                            {socialMedia.map((social, idx) => (
                                <a 
                                    key={idx} 
                                    href={social.href} 
                                    className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary transition-colors text-white"
                                    aria-label={social.label}
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h4 className="text-lg font-bold mb-6 text-white relative inline-block">
                            {t('quickLinks')}
                            <span className="absolute -bottom-2 left-0 w-12 h-1 bg-primary rounded-full"></span>
                        </h4>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li><button onClick={() => onSectionChange('home')} className="hover:text-primary transition-colors flex items-center gap-2"><ChevronRightIcon className="w-3 h-3 text-primary rtl:rotate-180"/> {t('home')}</button></li>
                            <li><button onClick={() => onSectionChange('directory')} className="hover:text-primary transition-colors flex items-center gap-2"><ChevronRightIcon className="w-3 h-3 text-primary rtl:rotate-180"/> {t('aboutUs')}</button></li>
                            <li><button onClick={() => onSectionChange('tools' as any)} className="hover:text-primary transition-colors flex items-center gap-2"><ChevronRightIcon className="w-3 h-3 text-primary rtl:rotate-180"/> {t('ourServices')}</button></li>
                            <li><button onClick={() => onSectionChange('articles')} className="hover:text-primary transition-colors flex items-center gap-2"><ChevronRightIcon className="w-3 h-3 text-primary rtl:rotate-180"/> {t('blog')}</button></li>
                            <li><button onClick={() => onSectionChange('contact-us')} className="hover:text-primary transition-colors flex items-center gap-2"><ChevronRightIcon className="w-3 h-3 text-primary rtl:rotate-180"/> {t('contactUs')}</button></li>
                        </ul>
                    </div>

                    {/* Column 3: Support & Legal */}
                    <div>
                        <h4 className="text-lg font-bold mb-6 text-white relative inline-block">
                            {t('supportLegal')}
                            <span className="absolute -bottom-2 left-0 w-12 h-1 bg-primary rounded-full"></span>
                        </h4>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li><button onClick={() => onSectionChange('faq')} className="hover:text-primary transition-colors flex items-center gap-2"><ChevronRightIcon className="w-3 h-3 text-primary rtl:rotate-180"/> {t('faq')}</button></li>
                            <li><button onClick={() => onSectionChange('privacy')} className="hover:text-primary transition-colors flex items-center gap-2"><ChevronRightIcon className="w-3 h-3 text-primary rtl:rotate-180"/> {t('privacyPolicy')}</button></li>
                            <li><button onClick={() => onSectionChange('terms')} className="hover:text-primary transition-colors flex items-center gap-2"><ChevronRightIcon className="w-3 h-3 text-primary rtl:rotate-180"/> {t('termsAndConditions')}</button></li>
                            <li><button onClick={() => onSectionChange('terms')} className="hover:text-primary transition-colors flex items-center gap-2"><ChevronRightIcon className="w-3 h-3 text-primary rtl:rotate-180"/> {t('refundPolicy')}</button></li>
                        </ul>
                    </div>

                    {/* Column 4: Newsletter & Contact */}
                    <div>
                        <h4 className="text-lg font-bold mb-6 text-white relative inline-block">
                            {t('newsletterTitle')}
                            <span className="absolute -bottom-2 left-0 w-12 h-1 bg-primary rounded-full"></span>
                        </h4>
                        <p className="text-slate-400 text-sm mb-4">{t('newsletterDesc')}</p>
                        <div className="flex flex-col gap-3">
                            <input 
                                type="email" 
                                placeholder={t('enterYourEmail')} 
                                className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary w-full"
                            />
                            <button className="bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-lg transition-colors w-full shadow-lg shadow-primary/25">
                                {t('subscribe')}
                            </button>
                        </div>
                        <div className="mt-6 flex items-start gap-3 text-slate-400 text-sm">
                            <MapPinIcon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                            <span>{t('addressLabel')}</span>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-slate-500 text-xs text-center md:text-left">
                        &copy; {currentYear} Logistics B Arabc. {t('footerRights')}.
                    </p>
                    
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        <span className="text-slate-500 text-xs font-bold uppercase mr-2">{t('paymentMethods')}:</span>
                        <PaymentBadge><VisaIcon /></PaymentBadge>
                        <PaymentBadge><MastercardIcon /></PaymentBadge>
                        {/* Vodafone Cash Badge */}
                        <PaymentBadge bg="bg-[#E60000]" text="text-white">
                            <span className="font-bold text-[10px] tracking-tight">Vodafone Cash</span>
                        </PaymentBadge>
                        {/* InstaPay Badge */}
                        <PaymentBadge bg="bg-[#4A148C]" text="text-white">
                            <div className="flex items-center gap-1">
                                <WalletIcon className="w-3 h-3" />
                                <span className="font-bold text-[10px]">InstaPay</span>
                            </div>
                        </PaymentBadge>
                    </div>
                </div>
            </div>
        </footer>
    );
});

// Main App Component
export const App: React.FC = () => {
    // ... (State declarations preserved) ...
    const { t, language } = useLocalization();
    const [section, setSection] = useState<Section>('home');
    const [currentUser, setCurrentUser] = useState<User | null>(getCurrentUser());
    const [shipments, setShipments] = useState<Record<string, Shipment>>({});
    const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);
    const [favorites, setFavorites] = useState<number[]>([]);
    
    // --- Application State (Lifted Up for Admin Control) ---
    const [companies, setCompanies] = useState<Company[]>(
        COMPANIES.map(c => ({...c, status: 'approved'}))
    );
    const [articles, setArticles] = useState<Article[]>(ARTICLES);
    const [users, setUsers] = useState<Record<string, User>>({}); 

    // --- NEW DYNAMIC CORE STATES ---
    const [globalSettings, setGlobalSettings] = useState({
        siteName: 'Logistics B Arabc',
        contactEmail: 'support@logisticsbarab.com',
        supportPhone: '+20 123 456 7890',
        maintenanceMode: false,
        // Added for Admin Control
        testimonials: [
            { id: 1, text: "The bilingual HS code search tool saved our documentation process.", author: "Import & Export Specialist", role: "Retail Sector" },
            { id: 2, text: "Logistics B Arabc became our regional intelligence layer.", author: "Logistics Manager", role: "Major Export Company" }
        ],
        socialLinks: {
            twitter: "#",
            facebook: "#",
            linkedin: "#"
        }
    });

    const [systemPrompts, setSystemPrompts] = useState(() => {
        try {
            const saved = localStorage.getItem('system_ai_prompts');
            return saved ? JSON.parse(saved) : { routePlanner: '', hsCode: '' };
        } catch (e) {
            console.error("Failed to parse saved prompts", e);
            return { routePlanner: '', hsCode: '' };
        }
    });

    const [maritimeAlerts, setMaritimeAlerts] = useState<any[]>([]);
    const [intelligenceScenarios, setIntelligenceScenarios] = useState<MaritimeScenario[]>(DEFAULT_SCENARIOS);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [viewCompany, setViewCompany] = useState<Company | null>(null);

    // ... (Effects and Handlers preserved) ...
    // Sync users from localStorage for demo purposes
    useEffect(() => {
        const savedUsers = localStorage.getItem('logistics_app_users');
        if (savedUsers) {
            setUsers(JSON.parse(savedUsers));
        }
    }, [currentUser]); 

    useEffect(() => {
        const savedFavs = localStorage.getItem('favorites');
        if (savedFavs) {
            try {
                setFavorites(JSON.parse(savedFavs));
            } catch (e) {
                console.error("Error parsing favorites", e);
            }
        }
    }, []);

    const handleToggleFavorite = (id: number) => {
        setFavorites(prev => {
            const newFavs = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
            localStorage.setItem('favorites', JSON.stringify(newFavs));
            return newFavs;
        });
    };

    const handleLogin = (user: User) => {
        setCurrentUser(user);
        if (user.isAdmin || user.role === 'super_admin' || user.role === 'editor') {
            setSection('admin');
        } else {
            setSection('home');
        }
    };

    const handleLogout = useCallback(() => {
        authLogout();
        setCurrentUser(null);
        setSection('home');
    }, []);

    // Stable navigation handlers for memoized components
    const handleNavigate = useCallback((s: Section) => {
        setSection(s);
        setViewCompany(null);
        window.scrollTo(0,0);
    }, []);

    // --- User Profile Update Handler ---
    const handleUpdateUser = (updatedUser: User) => {
        // Update in auth service (persists to storage)
        const savedUser = updateProfile(updatedUser);
        // Update local state to reflect changes in UI immediately
        setCurrentUser(savedUser);
    };

    const handleSaveShipment = (newShipment: Shipment) => {
        setShipments(prev => ({ ...prev, [newShipment.id]: newShipment }));
    };

    // --- Audit Log Helper ---
    const logAdminAction = (action: string, details: string) => {
        if (!currentUser) return;
        const newLog: AuditLog = {
            id: uuidv4(),
            action,
            user: currentUser.email,
            role: currentUser.role?.replace('_', ' ') || 'User',
            timestamp: new Date().toLocaleString(),
            details,
            status: 'Success'
        };
        setAuditLogs(prev => [newLog, ...prev]);
    };

    // --- Admin Handlers ---
    const handleAddCompanyRequest = (newCompany: Company) => {
        setCompanies(prev => [...prev, { ...newCompany, status: 'pending' }]);
    };

    const handleUpdateCompanyStatus = (id: number, status: 'approved' | 'rejected') => {
        setCompanies(prev => prev.map(c => c.id === id ? { ...c, status } : c));
        logAdminAction(status === 'approved' ? 'APPROVE_COMPANY' : 'REJECT_COMPANY', `Company ID ${id} status changed to ${status}`);
    };

    const handleUpdateCompany = (updatedCompany: Company) => {
        setCompanies(prev => {
            const exists = prev.find(c => c.id === updatedCompany.id);
            if (exists) {
                logAdminAction('UPDATE_COMPANY', `Updated company: ${updatedCompany.name.en}`);
                return prev.map(c => c.id === updatedCompany.id ? updatedCompany : c);
            } else {
                logAdminAction('CREATE_COMPANY', `Created company: ${updatedCompany.name.en}`);
                return [...prev, updatedCompany];
            }
        });
    };

    const handleDeleteCompany = (id: number) => {
        setCompanies(prev => prev.filter(c => c.id !== id));
        logAdminAction('DELETE_COMPANY', `Deleted company ID: ${id}`);
    };

    const handleDeleteUserAdmin = (id: string) => {
        const newUsers = { ...users };
        delete newUsers[id];
        setUsers(newUsers);
        localStorage.setItem('logistics_app_users', JSON.stringify(newUsers));
        logAdminAction('DELETE_USER', `Deleted user ID: ${id}`);
    };

    const handleAddUser = (user: User) => {
        const newUsers = { ...users, [user.id]: user };
        setUsers(newUsers);
        localStorage.setItem('logistics_app_users', JSON.stringify(newUsers));
        register(user.name || '', user.email, user.password || 'password123', user.role); 
        logAdminAction('CREATE_USER', `Created user: ${user.email}`);
    };

    const handleUpdateUserAdmin = (updatedUser: User) => {
        const newUsers = { ...users, [updatedUser.id]: updatedUser };
        setUsers(newUsers);
        localStorage.setItem('logistics_app_users', JSON.stringify(newUsers));
        logAdminAction('UPDATE_USER', `Updated user: ${updatedUser.email}`);
    };

    const handleAddArticle = (article: Article) => {
        setArticles(prev => [article, ...prev]);
        logAdminAction('CREATE_ARTICLE', `Published article: ${article.title.en}`);
    };

    const handleUpdateArticle = (updatedArticle: Article) => {
        setArticles(prev => prev.map(a => a.id === updatedArticle.id ? updatedArticle : a));
        logAdminAction('UPDATE_ARTICLE', `Updated article: ${updatedArticle.title.en}`);
    };

    const handleDeleteArticle = (id: number) => {
        setArticles(prev => prev.filter(a => a.id !== id));
        logAdminAction('DELETE_ARTICLE', `Deleted article ID: ${id}`);
    };

    const handleUpdateSettings = (newSettings: any) => {
        setGlobalSettings(newSettings);
        logAdminAction('UPDATE_SETTINGS', 'Updated global settings');
    };

    const handleUpdatePrompts = (newPrompts: any) => {
        setSystemPrompts(newPrompts);
        localStorage.setItem('system_ai_prompts', JSON.stringify(newPrompts));
        logAdminAction('UPDATE_AI_PROMPTS', 'Modified AI system instructions');
    };

    const handleUpdateAlerts = (alerts: any[]) => {
        setMaritimeAlerts(alerts);
        logAdminAction('BROADCAST_ALERT', alerts.length > 0 ? `Posted alert: ${alerts[0].message}` : 'Cleared alerts');
    };
    
    const handleUpdateScenarios = (scenarios: MaritimeScenario[]) => {
        setIntelligenceScenarios(scenarios);
        logAdminAction('UPDATE_INTELLIGENCE', 'Updated maritime intelligence scenarios');
    };

    const handleDeleteShipment = (id: string) => {
        setShipments(prev => {
            const newShipments = { ...prev };
            delete newShipments[id];
            return newShipments;
        });
        logAdminAction('DELETE_SHIPMENT', `Deleted shipment ID: ${id}`);
    };

    const handleAdminAddShipment = (shipment: Shipment) => {
        handleSaveShipment(shipment);
        logAdminAction('CREATE_SHIPMENT', `Created shipment ${shipment.id}`);
    };

    const handleAdminUpdateShipment = (shipment: Shipment) => {
        handleSaveShipment(shipment);
        logAdminAction('UPDATE_SHIPMENT', `Updated shipment ${shipment.id}`);
    };

    const renderContent = () => {
        if (viewCompany) {
             return <CompanyProfilePage company={viewCompany} onBack={() => setViewCompany(null)} currentUser={currentUser} />;
        }

        switch (section) {
            case 'home': return (
                <HomePage 
                    onSectionChange={handleNavigate} 
                    onOpenCompany={setViewCompany} 
                    articles={articles} 
                    scenarios={intelligenceScenarios}
                    testimonials={globalSettings.testimonials} 
                />
            );
            case 'login': return <LoginPage onLoginSuccess={handleLogin} onNavigateToRegister={() => setSection('register')} />;
            case 'register': return <RegisterPage onRegisterSuccess={handleLogin} onNavigateToLogin={() => setSection('login')} />;
            case 'contact-us': return <ContactUsPage />;
            case 'profile': return currentUser ? (
                <ProfilePage 
                    user={currentUser} 
                    onLogout={handleLogout} 
                    onNavigate={handleNavigate} 
                    shipments={shipments} 
                    savedRoutes={savedRoutes}
                    onUpdateUser={handleUpdateUser} // PASS THE HANDLER
                />
            ) : <LoginPage onLoginSuccess={handleLogin} onNavigateToRegister={() => setSection('register')} />;
            case 'route-planner': 
                return <RoutePlannerPage 
                    onSaveRoute={(r) => setSavedRoutes([...savedRoutes, r])} 
                    savedRoutes={savedRoutes}
                    onDeleteRoute={(id) => setSavedRoutes(prev => prev.filter(r => r.id !== id))}
                    onAddShipment={handleSaveShipment}
                    systemPromptOverride={systemPrompts.routePlanner} 
                    companies={companies} 
                    articles={articles} 
                />;
            case 'hs-code': return <HSCodeFinderPage systemPromptOverride={systemPrompts.hsCode} />;
            case 'invoice-generator': return <InvoiceGeneratorPage />;
            case 'shipping-forms': return <ShippingFormsPage shipments={shipments}/>;
            case 'shipment-tracker': return <ShipmentTrackerPage shipments={shipments} onUpdateShipments={setShipments} onSaveShipment={handleSaveShipment} />;
            case 'document-editor': return <DocumentEditorPage shipments={shipments} />;
            case 'articles': return (
                <ArticlesPage 
                    onArticleClick={(a) => console.log(a)} 
                    articles={articles}
                    currentUser={currentUser}
                    onAddArticle={handleAddArticle}
                    onUpdateArticle={handleUpdateArticle}
                    onDeleteArticle={handleDeleteArticle}
                />
            ); 
            case 'directory': return <DirectoryPage onCompanyClick={setViewCompany} favorites={favorites} onToggleFavorite={handleToggleFavorite} companies={companies.filter(c => c.status === 'approved')} onAddCompany={handleAddCompanyRequest} />;
            case 'pricing': return <PricingPage user={currentUser} onNavigate={handleNavigate} />;
            case 'privacy': return <PrivacyPolicyPage />;
            case 'terms': return <TermsPage />;
            case 'faq': return <FAQPage />;
            case 'admin': 
                return currentUser && (currentUser.isAdmin || currentUser.role === 'super_admin' || currentUser.role === 'editor') ? (
                    <AdminPage 
                        companies={companies} 
                        users={users} 
                        articles={articles}
                        shipments={shipments} 
                        currentUser={currentUser}
                        onUpdateCompanyStatus={handleUpdateCompanyStatus}
                        onUpdateCompany={handleUpdateCompany} 
                        onDeleteCompany={handleDeleteCompany}
                        onDeleteUser={handleDeleteUserAdmin}
                        onAddUser={handleAddUser}
                        onUpdateUser={handleUpdateUserAdmin}
                        onAddArticle={handleAddArticle}
                        onUpdateArticle={handleUpdateArticle} 
                        onDeleteArticle={handleDeleteArticle}
                        onBack={() => handleNavigate('home')}
                        onNavigateToTool={(toolSection) => handleNavigate(toolSection as Section)} 
                        globalSettings={globalSettings}
                        onUpdateSettings={handleUpdateSettings}
                        systemPrompts={systemPrompts}
                        onUpdatePrompts={handleUpdatePrompts}
                        maritimeAlerts={maritimeAlerts}
                        onUpdateAlerts={handleUpdateAlerts}
                        auditLogs={auditLogs} 
                        onAddShipment={handleAdminAddShipment}
                        onUpdateShipment={handleAdminUpdateShipment}
                        onDeleteShipment={handleDeleteShipment}
                        intelligenceScenarios={intelligenceScenarios}
                        onUpdateScenarios={handleUpdateScenarios}
                    />
                ) : <HomePage onSectionChange={handleNavigate} onOpenCompany={setViewCompany} articles={articles} scenarios={intelligenceScenarios} testimonials={globalSettings.testimonials} />;
            default: return <HomePage onSectionChange={handleNavigate} onOpenCompany={setViewCompany} articles={articles} scenarios={intelligenceScenarios} testimonials={globalSettings.testimonials} />;
        }
    };

    return (
        <div className="min-h-screen bg-background text-text-base font-sans transition-colors duration-300 flex flex-col">
            <Header 
                activeSection={section} 
                onSectionChange={handleNavigate} 
                currentUser={currentUser} 
                onLogout={handleLogout} 
            />
            
            {maritimeAlerts.length > 0 && (
                <div className="bg-red-600 text-white px-4 py-2 text-center text-sm font-bold animate-pulse">
                    ⚠️ {maritimeAlerts[0].message}
                </div>
            )}

            <main className="flex-grow animate-fade-in p-4 sm:p-6 lg:p-8">
                <Suspense fallback={<PageLoader />}>
                    {renderContent()}
                </Suspense>
            </main>
            
            <Footer 
                onSectionChange={handleNavigate} 
                socialLinks={globalSettings.socialLinks}
            />
        </div>
    );
};