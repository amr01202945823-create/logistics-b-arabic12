
import React from 'react';
import { useLocalization } from '../localization';
import type { Section, Company, Article, MaritimeScenario } from '../types';
import { COMPANIES } from '../constants';
import { SEO } from '../components/SEO';
import { 
  ArrowLeftIcon, ChevronRightIcon, CpuIcon, UsersIcon, 
  MapPinIcon, AnchorIcon, CheckCircleIcon, SearchIcon, FileTextIcon, SparklesIcon,
  ArrowRightCircleIcon, LockClosedIcon
} from '../components/icons';

interface HomePageProps {
  onSectionChange: (section: Section) => void;
  onOpenCompany: (company: Company) => void;
  articles: Article[];
  scenarios: MaritimeScenario[];
  testimonials?: { id: number; text: string; author: string; role: string; }[]; // New Prop
}

// Helper for read time
const getReadTime = (text: string) => {
    if (!text) return 1;
    const wordsPerMinute = 200;
    const noOfWords = text.split(/\s/g).length;
    return Math.ceil(noOfWords / wordsPerMinute);
};

export const HomePage: React.FC<HomePageProps> = ({ onSectionChange, onOpenCompany, articles, scenarios, testimonials = [] }) => {
    const { t, language } = useLocalization();
    const [activeScenarioIndex, setActiveScenarioIndex] = React.useState(0);

    // Auto-rotate scenarios every 6 seconds
    React.useEffect(() => {
        if (!scenarios || scenarios.length === 0) return;
        const interval = setInterval(() => {
            setActiveScenarioIndex((prev) => (prev + 1) % scenarios.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [scenarios]);

    const activeScenario = scenarios && scenarios.length > 0 ? scenarios[activeScenarioIndex] : null;

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'critical': return 'text-red-500';
            case 'optimal': return 'text-green-500';
            case 'warning': return 'text-amber-500';
            default: return 'text-text-muted';
        }
    };

    const getBgColor = (status: string) => {
        switch(status) {
            case 'critical': return 'rgba(239, 68, 68, 0.1)'; // red
            case 'optimal': return 'rgba(34, 197, 94, 0.1)'; // green
            case 'warning': return 'rgba(245, 158, 11, 0.1)'; // amber
            default: return 'rgba(37, 99, 235, 0.1)'; // blue
        }
    };

    const getScoreColor = (score: number) => {
        if (score > 90) return 'bg-green-100 text-green-700';
        if (score > 80) return 'bg-blue-100 text-blue-700';
        return 'bg-amber-100 text-amber-700';
    };

    // Find International Group Logistics - assuming ID 7 based on constants
    const iglCompany = COMPANIES.find(c => c.id === 7);

    const handlePartnerClick = () => {
        if (iglCompany) {
            onOpenCompany(iglCompany);
        } else {
            onSectionChange('directory');
        }
    };

    const scrollToTools = () => {
        const element = document.getElementById('tools-section');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Schema.org Organization Data
    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Logistics B Arabc",
        "url": window.location.href,
        "logo": "https://logisticsbarab.com/logo.png", // Placeholder
        "sameAs": [
            "https://www.facebook.com/logisticsbarab",
            "https://www.linkedin.com/company/logisticsbarab"
        ],
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+20-123-456-7890",
            "contactType": "Customer Support",
            "areaServed": ["EG", "SA", "AE"],
            "availableLanguage": ["English", "Arabic"]
        }
    };

    return (
        <div className="flex flex-col font-sans text-text-base">
            <SEO 
                titleKey="home" 
                descriptionKey="heroSubtitle_new"
                keywords={['logistics', 'maritime', 'freight', 'egypt', 'saudi arabia', 'tracking', 'hs code']}
                schema={organizationSchema}
            />

            {/* Hero Section - Force LTR Layout */}
            <header className="relative pt-16 pb-20 overflow-hidden" dir="ltr">
                {/* Background Decoration */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary-light/20 to-transparent -z-10"></div>
                
                <div className="container mx-auto px-4 md:px-8 grid lg:grid-cols-2 gap-12 items-center">
                    
                    {/* Visual/Card Content - Moved to Left (Order 1) */}
                    <div className={`relative order-1 lg:order-1 flex justify-center ${language === 'ar' ? 'lg:justify-start' : 'lg:justify-start'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        <div className="bg-surface rounded-3xl shadow-2xl p-6 md:p-8 max-w-md w-full border border-border relative overflow-hidden group transition-all duration-500">
                            {/* Background Gradient Blob */}
                            <div 
                                className="absolute top-0 right-0 w-48 h-48 rounded-full filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 transition-colors duration-700 ease-in-out"
                                style={{ backgroundColor: activeScenario ? getBgColor(activeScenario.status) : 'rgba(37, 99, 235, 0.1)' }}
                            ></div>
                            
                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div>
                                    <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                                        {t('poweredByAI')}
                                        <span className={`animate-pulse w-2 h-2 rounded-full ${activeScenario && activeScenario.status === 'optimal' ? 'bg-green-500' : 'bg-blue-500'}`}></span>
                                    </span>
                                    <h3 className="text-xl font-bold text-text-heading mt-1">{t('heroCardTitle')}</h3>
                                </div>
                            </div>

                            <p className="text-sm text-text-muted mb-6 leading-relaxed relative z-10">
                                {t('heroCardSubtitle')}
                            </p>

                            {/* Dynamic Scenario Card 1 - Route */}
                            {activeScenario && (
                                <>
                                <div className="bg-background rounded-xl p-4 mb-3 border border-border flex items-center justify-between relative z-10 hover:border-primary/30 transition-all duration-300">
                                    <div>
                                        <div className="text-xs text-text-muted mb-1">{t('alertRouteLabel')}</div>
                                        <div className="text-sm font-bold text-text-heading flex items-center gap-2">
                                            {activeScenario.route?.[language]}
                                        </div>
                                        <div className={`text-[10px] mt-1 font-medium transition-colors duration-300 ${getStatusColor(activeScenario.status)}`}>
                                            {activeScenario.routeDesc?.[language]}
                                        </div>
                                    </div>
                                    <div className={`text-xs font-bold px-3 py-1 rounded-full transition-colors duration-300 ${getScoreColor(activeScenario.score)}`}>
                                        {activeScenario.score}%
                                    </div>
                                </div>

                                {/* Dynamic Scenario Card 2 - Customs */}
                                <div className="bg-surface rounded-xl p-4 border border-border/60 hover:border-primary/20 transition-all duration-300 relative z-10">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="text-xs text-primary mb-1">{t('alertCustomsLabel')}</div>
                                            <div className="text-sm font-bold text-text-heading font-mono">{activeScenario.hsCode}</div>
                                        </div>
                                    </div>
                                    <div className="text-[10px] text-text-muted mt-2">{activeScenario.hsDesc?.[language]}</div>
                                </div>
                                </>
                            )}

                            {/* Controls */}
                            <div className="mt-6 flex justify-center gap-2 relative z-10">
                                {scenarios.map((_, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => setActiveScenarioIndex(idx)}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${idx === activeScenarioIndex ? 'w-8 bg-primary' : 'w-2 bg-border hover:bg-primary/50'}`}
                                        aria-label={`Select scenario ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Text Content - Moved to Right (Order 2) */}
                    <div className={`text-center ${language === 'ar' ? 'lg:text-right' : 'lg:text-left'} space-y-6 order-2 lg:order-2`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        <div className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold mb-2 border border-primary/20">
                            {t('knowledgeBridgeTag')}
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-text-heading leading-tight">
                            {t('heroTitle_new').split('Maritime')[0]} <br />
                            <span className="text-primary">{language === 'ar' ? 'اللوجستيات البحرية' : 'Maritime Logistics'}</span>
                        </h1>
                        <p className="text-lg text-text-muted leading-relaxed max-w-xl mx-auto lg:mx-0">
                            {t('heroSubtitle_new')}
                        </p>
                        
                        <div className={`flex flex-wrap gap-4 justify-center ${language === 'ar' ? 'lg:justify-start' : 'lg:justify-start'} pt-4`}>
                            <button onClick={scrollToTools} className="bg-primary text-white px-8 py-3.5 rounded-full font-bold hover:bg-primary-hover transition shadow-lg shadow-primary/25 flex items-center gap-2">
                                <span>{t('heroCta1')}</span>
                                {language === 'ar' ? <ArrowLeftIcon className="w-5 h-5" /> : <ChevronRightIcon className="w-5 h-5" />}
                            </button>
                            <button onClick={() => onSectionChange('directory')} className="bg-surface text-text-base border border-border px-8 py-3.5 rounded-full font-bold hover:bg-surface-hover transition flex items-center gap-2">
                                <span>{t('heroCta2')}</span>
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 pt-8 border-t border-border mt-8">
                            <div>
                                <div className="text-2xl md:text-3xl font-bold text-primary">1,250+</div>
                                <div className="text-xs text-text-muted mt-1">{t('stat1')}</div>
                            </div>
                            <div>
                                <div className="text-2xl md:text-3xl font-bold text-primary">480</div>
                                <div className="text-xs text-text-muted mt-1">{t('stat2')}</div>
                            </div>
                            <div>
                                <div className="text-2xl md:text-3xl font-bold text-primary">320</div>
                                <div className="text-xs text-text-muted mt-1">{t('stat3')}</div>
                            </div>
                        </div>
                    </div>

                </div>
            </header>

            {/* How it Works Section */}
            <section className="py-16 bg-surface border-t border-border">
                <div className="container mx-auto px-4 md:px-8 text-center">
                    <h2 className="text-3xl font-bold text-text-heading mb-3">{t('howItWorksTitle')}</h2>
                    <p className="text-text-muted max-w-2xl mx-auto mb-12">{t('howItWorksSubtitle')}</p>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-6 rounded-2xl bg-background border border-border hover:border-primary/30 transition duration-300">
                            <div className="w-12 h-12 bg-surface rounded-xl shadow-sm flex items-center justify-center text-primary mx-auto mb-4">
                                <CpuIcon className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-lg text-text-heading mb-2">{t('howItWorks1Title')}</h3>
                            <p className="text-sm text-text-muted">{t('howItWorks1Desc')}</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-background border border-border hover:border-primary/30 transition duration-300">
                            <div className="w-12 h-12 bg-surface rounded-xl shadow-sm flex items-center justify-center text-primary mx-auto mb-4">
                                <UsersIcon className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-lg text-text-heading mb-2">{t('howItWorks2Title')}</h3>
                            <p className="text-sm text-text-muted">{t('howItWorks2Desc')}</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-background border border-border hover:border-primary/30 transition duration-300">
                            <div className="w-12 h-12 bg-surface rounded-xl shadow-sm flex items-center justify-center text-primary mx-auto mb-4">
                                <MapPinIcon className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-lg text-text-heading mb-2">{t('howItWorks3Title')}</h3>
                            <p className="text-sm text-text-muted">{t('howItWorks3Desc')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tools Section */}
            <section id="tools-section" className="py-20 bg-gradient-to-br from-background to-primary/5">
                <div className="container mx-auto px-4 md:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-text-heading mb-4">{t('toolsTitle')}</h2>
                        <p className="text-text-muted max-w-2xl mx-auto">{t('toolsSubtitle')}</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { section: 'hs-code', icon: <SearchIcon />, title: 'hsCodeFinder', desc: 'tools2Desc' },
                            { section: 'invoice-generator', icon: <FileTextIcon />, title: 'invoiceGenerator', desc: 'tools3Desc' },
                            { section: 'shipment-tracker', icon: <AnchorIcon />, title: 'shipmentTracker', desc: 'tools4Desc' }
                        ].map((tool) => (
                            <div 
                                key={tool.section}
                                onClick={() => onSectionChange(tool.section as Section)}
                                className="bg-surface p-8 rounded-3xl shadow-sm hover:shadow-xl transition duration-300 border border-border group cursor-pointer"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-primary/10 p-3 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition">
                                        {React.cloneElement(tool.icon as React.ReactElement<any>, { className: 'w-7 h-7' })}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-text-heading mb-2">{t(tool.title)}</h3>
                                <p className="text-text-muted text-sm leading-relaxed">{t(tool.desc)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Knowledge & Directory Section */}
            <section className="py-20 bg-surface">
                <div className="container mx-auto px-4 md:px-8">
                    <div className="grid lg:grid-cols-2 gap-16">
                        
                        {/* Knowledge Base Column */}
                        <div>
                            <div className="flex justify-between items-end mb-8">
                                <div>
                                    <h2 className="text-3xl font-bold text-text-heading mb-2">{t('knowledgeSectionTitle')}</h2>
                                    <p className="text-sm text-text-muted max-w-sm">{t('knowledgeSectionDesc')}</p>
                                </div>
                                <button onClick={() => onSectionChange('articles')} className="text-primary text-sm font-bold hover:underline flex items-center gap-1">
                                    {t('viewAllArticles')} {language === 'ar' ? <ArrowLeftIcon className="w-4 h-4 rotate-180" /> : <ChevronRightIcon className="w-4 h-4" />}
                                </button>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { icon: <AnchorIcon />, title: 'knowledgeCard1Title', desc: 'knowledgeCard1Desc' },
                                    { icon: <CheckCircleIcon />, title: 'knowledgeCard2Title', desc: 'knowledgeCard2Desc' },
                                    { icon: <CpuIcon />, title: 'knowledgeCard3Title', desc: 'knowledgeCard3Desc' }
                                ].map((item, idx) => (
                                    <div key={idx} className="bg-background p-5 rounded-2xl border border-border hover:border-primary/30 transition flex gap-4 items-start group cursor-pointer" onClick={() => onSectionChange('articles')}>
                                        <div className="bg-surface p-2 rounded-lg shadow-sm text-primary border border-border">
                                            {React.cloneElement(item.icon as React.ReactElement<any>, { className: 'w-5 h-5' })}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-text-heading">{t(item.title)}</h4>
                                            <p className="text-xs text-text-muted mt-1">{t(item.desc)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Directory Column */}
                        <div>
                            <div className="flex justify-between items-end mb-8">
                                <div>
                                    <h2 className="text-3xl font-bold text-text-heading mb-2">{t('directorySectionTitle')}</h2>
                                    <p className="text-sm text-text-muted max-w-sm">{t('directorySectionDesc')}</p>
                                </div>
                                <button onClick={() => onSectionChange('directory')} className="text-primary text-sm font-bold hover:underline flex items-center gap-1">
                                    {t('addCompany')} {language === 'ar' ? <ArrowLeftIcon className="w-4 h-4 rotate-180" /> : <ChevronRightIcon className="w-4 h-4" />}
                                </button>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { title: 'directoryCard1Title', desc: 'directoryCard1Desc' },
                                    { title: 'directoryCard2Title', desc: 'directoryCard2Desc' },
                                    { title: 'directoryCard3Title', desc: 'directoryCard3Desc' }
                                ].map((item, idx) => (
                                    <div key={idx} className="bg-surface p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition cursor-pointer" onClick={() => onSectionChange('directory')}>
                                        <h4 className="font-bold text-lg text-text-heading mb-2">{t(item.title)}</h4>
                                        <p className="text-sm text-text-muted mb-3">{t(item.desc)}</p>
                                        <span className="text-xs text-primary font-medium hover:underline">{t('viewDetails')}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Community & Latest Articles */}
            <section className="py-20 bg-background border-t border-border">
                <div className="container mx-auto px-4 md:px-8">
                    
                    <h2 className="text-3xl font-bold text-text-heading text-center mb-12">{t('communityInsights')}</h2>

                    <div className="grid md:grid-cols-2 gap-6 mb-20">
                        {testimonials.map((tItem, idx) => (
                            <div key={idx} className="bg-surface p-8 rounded-2xl shadow-sm border border-border">
                                <p className="text-text-base italic mb-6 leading-relaxed">"{tItem.text}"</p>
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${idx % 2 === 0 ? 'bg-primary/10 text-primary' : 'bg-emerald-100 text-emerald-600'}`}>
                                        {tItem.author.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-text-heading">{tItem.author}</div>
                                        <div className="text-xs text-text-muted">{tItem.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {testimonials.length === 0 && (
                            <p className="text-center text-gray-500 col-span-2">No community insights available.</p>
                        )}
                    </div>

                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-3xl font-bold text-text-heading">{t('latestArticles')}</h2>
                        <button onClick={() => onSectionChange('articles')} className="text-primary text-sm font-bold hover:underline flex items-center gap-1">
                            {t('viewAllArticles')} {language === 'ar' ? <ArrowLeftIcon className="w-4 h-4 rotate-180" /> : <ChevronRightIcon className="w-4 h-4" />}
                        </button>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {articles.slice(0, 3).map((article, idx) => (
                            <div key={idx} onClick={() => onSectionChange('articles')} className="group bg-surface rounded-[20px] overflow-hidden shadow-sm border border-border hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-full transform hover:-translate-y-1">
                                <div className="h-60 w-full relative overflow-hidden">
                                    <img 
                                        src={article.imageUrl} 
                                        alt={article.title?.[language === 'ar' ? 'ar' : 'en']} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                        loading="lazy" 
                                    />
                                </div>
                                <div className="p-8 flex flex-col flex-grow">
                                    <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4" dir="ltr">
                                        <span>MIN READ {getReadTime(article.content?.['en'] || '')}</span>
                                        <span className="text-gray-300">•</span>
                                        <span>{article.date?.['en']?.toUpperCase()}</span>
                                    </div>

                                    <h3 className={`font-extrabold text-2xl text-text-heading mb-4 group-hover:text-primary transition leading-snug ${language === 'ar' ? 'font-cairo' : 'font-inter'}`}>
                                        {article.title?.[language]}
                                    </h3>
                                    
                                    <p className="text-sm text-text-muted leading-relaxed line-clamp-3 mb-6 flex-grow">
                                        {article.summary?.[language]}
                                    </p>

                                    <div className="flex items-center justify-end mt-auto pt-4 border-t border-dashed border-gray-100 dark:border-gray-800">
                                        <span className="text-primary font-bold text-sm group-hover:underline flex items-center gap-2">
                                            {language === 'ar' ? 'لمزيد' : 'Read More'} 
                                            <ArrowRightCircleIcon className={`w-5 h-5 transition-transform duration-300 ${language === 'ar' ? 'rotate-180' : ''}`} />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Special Thanks Section - Redesigned Premium Partner Card */}
                    <div className="mt-20 mb-12 container mx-auto px-4">
                        <div 
                            onClick={handlePartnerClick}
                            className="group relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-900 text-white shadow-2xl transition-all duration-500 hover:-translate-y-1 hover:shadow-blue-900/25 cursor-pointer"
                        >
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)', backgroundSize: '30px 30px'}}></div>
                            <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-blue-500/30 blur-3xl filter mix-blend-screen"></div>
                            <div className="absolute -left-20 -bottom-20 h-96 w-96 rounded-full bg-indigo-500/30 blur-3xl filter mix-blend-screen"></div>

                            <div className="relative z-10 flex flex-col md:flex-row items-center p-8 md:p-12 gap-8 md:gap-16">
                                
                                {/* Logo Section - Glassmorphism Cube */}
                                <div className="flex-shrink-0">
                                    <div className="relative h-40 w-40 md:h-48 md:w-48 flex items-center justify-center rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl group-hover:scale-105 transition-transform duration-500 group-hover:rotate-3">
                                        <div className="text-center">
                                            <span className="block text-5xl font-black tracking-tighter drop-shadow-md text-white">IGL</span>
                                            <span className="block text-[10px] font-bold uppercase tracking-[0.3em] text-blue-200 mt-1">Logistics</span>
                                        </div>
                                        {/* Decorative corner accents */}
                                        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-white/30 rounded-tl-lg"></div>
                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-white/30 rounded-br-lg"></div>
                                    </div>
                                </div>

                                {/* Text Section */}
                                <div className={`flex-1 text-center ${language === 'ar' ? 'md:text-right' : 'md:text-left'}`}>
                                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-100 backdrop-blur-sm border border-white/20 mb-6 shadow-sm">
                                        <SparklesIcon className="h-4 w-4 text-yellow-400" />
                                        <span>{t('specialThanksTitle')}</span>
                                    </div>
                                    
                                    <h3 className="mb-4 text-3xl md:text-5xl font-black leading-tight tracking-tight">
                                        {language === 'ar' ? 'المجموعة الدولية للوجستيات' : 'International Group Logistics'}
                                    </h3>
                                    
                                    <p className="mb-8 text-lg text-blue-100 leading-relaxed max-w-2xl font-medium">
                                        {t('specialThanksDesc')}
                                    </p>

                                    <button className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-sm font-bold text-blue-700 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-blue-50 group/btn">
                                        <span>{t('viewPartner')}</span>
                                        {language === 'ar' ? <ArrowLeftIcon className="h-4 w-4 group-hover/btn:-translate-x-1 transition-transform" /> : <ChevronRightIcon className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* Upcoming Tools Section (Locked) */}
            <section className="py-20 bg-gray-100 dark:bg-slate-950 border-t border-gray-200 dark:border-slate-800 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
                <div className="container mx-auto px-4 md:px-8 relative z-10">
                    <div className="text-center mb-12">
                        <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block">
                            {language === 'ar' ? 'تحت التطوير والاختبار' : 'Under Development & Testing'}
                        </span>
                        <h2 className="text-3xl font-bold text-text-heading mb-4">
                            {language === 'ar' ? 'أدوات الجيل القادم' : 'Next-Gen Tools'}
                        </h2>
                        <p className="text-text-muted max-w-2xl mx-auto">
                            {language === 'ar' ? 'هذه الأدوات تخضع حالياً لاختبارات الأداء النهائية وستكون متاحة قريباً لجميع المستخدمين.' : 'These tools are currently undergoing final performance testing and will be available soon.'}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Route Planner Card (Locked) */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-gray-200 dark:border-slate-700 relative overflow-hidden opacity-75 grayscale-[50%] hover:grayscale-0 transition-all duration-500">
                            <div className="absolute top-4 right-4 bg-gray-200 dark:bg-slate-700 p-2 rounded-full z-20">
                                <LockClosedIcon className="w-5 h-5 text-gray-500" />
                            </div>
                            <div className="mb-6 bg-blue-100 dark:bg-blue-900/30 w-14 h-14 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <MapPinIcon className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-text-heading mb-3">{t('routePlanner')}</h3>
                            <p className="text-text-muted text-sm leading-relaxed mb-6">
                                {language === 'ar' 
                                    ? 'نظام ذكي يحلل مسارات الشحن البحرية والبرية ويقترح الأفضل بناءً على التكلفة والوقت والمخاطر باستخدام خوارزميات الذكاء الاصطناعي المتقدمة. مغلق حالياً للتعديلات والاختبارات، وسيكون متاحاً قريباً.' 
                                    : 'Intelligent system analyzing sea and land routes to suggest the best options based on cost, time, and risk using advanced AI algorithms. Currently locked for modifications and testing, available soon.'}
                            </p>
                            <button disabled className="w-full py-3 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-400 font-bold text-sm cursor-not-allowed border border-gray-200 dark:border-slate-700">
                                {language === 'ar' ? 'مغلق للصيانة' : 'Locked for Maintenance'}
                            </button>
                        </div>

                        {/* Document Editor Card (Locked) */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-gray-200 dark:border-slate-700 relative overflow-hidden opacity-75 grayscale-[50%] hover:grayscale-0 transition-all duration-500">
                            <div className="absolute top-4 right-4 bg-gray-200 dark:bg-slate-700 p-2 rounded-full z-20">
                                <LockClosedIcon className="w-5 h-5 text-gray-500" />
                            </div>
                            <div className="mb-6 bg-purple-100 dark:bg-purple-900/30 w-14 h-14 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400">
                                <FileTextIcon className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-text-heading mb-3">{t('documentEditor')}</h3>
                            <p className="text-text-muted text-sm leading-relaxed mb-6">
                                {language === 'ar' 
                                    ? 'أداة متقدمة لإنشاء وتعديل شهادات المنشأ (EUR.1, COMESA) والفواتير بدقة وتوافق مع المعايير الدولية مع خاصية المعاينة الحية. مغلق حالياً للتعديلات والاختبارات، وسيكون متاحاً قريباً.' 
                                    : 'Advanced tool for creating and editing certificates of origin (EUR.1, COMESA) and invoices compliant with international standards with live preview. Currently locked for modifications and testing, available soon.'}
                            </p>
                            <button disabled className="w-full py-3 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-400 font-bold text-sm cursor-not-allowed border border-gray-200 dark:border-slate-700">
                                {language === 'ar' ? 'قريباً' : 'Coming Soon'}
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
