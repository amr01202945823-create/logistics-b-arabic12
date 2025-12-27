
import React, { useState, useRef, useEffect } from 'react';
import { useLocalization } from '../localization';
import type { SavedRoute, Company, Article } from '../types';
import { INCOTERMS } from '../constants';
import { getShippingAdvice, generateProfessionalEmail } from '../services/geminiService';
import { Button, Card, CardContent, Input, Spinner, Dropdown, Textarea, Modal } from '../components/ui';
import { 
  MapPinIcon, SparklesIcon, BookmarkIcon, RobotIcon, GlobeAltIcon, 
  PrintIcon, ShareIcon, ShipIcon, AnchorIcon, CubeIcon,
  ShieldCheckIcon, DocumentTextIcon, LightBulbIcon, BoltIcon, CheckCircleIcon,
  ArrowRightCircleIcon, TruckIcon, HomeIcon, CurrencyDollarIcon, StarIcon, ArrowRightIcon, ArrowLeftIcon,
  UsersIcon, FileTextIcon, CalendarDaysIcon, EnvelopeIcon
} from '../components/icons';
import ReactMarkdown from 'react-markdown';
import { v4 as uuidv4 } from 'uuid';

const getSectionIcon = (text: string) => {
    const lower = text.toLowerCase();
    
    // Customs Broker
    if (lower.includes('customs') || lower.includes('مخلص') || lower.includes('جمرك')) return <DocumentTextIcon className="w-6 h-6 text-amber-600" />;
    
    // Transport Contractor
    if (lower.includes('transport') || lower.includes('نقل') || lower.includes('truck') || lower.includes('طقس') || lower.includes('weather')) return <TruckIcon className="w-6 h-6 text-orange-600" />;
    
    // Shipping Line
    if (lower.includes('shipping line') || lower.includes('خط ملاحي') || lower.includes('sea route')) return <ShipIcon className="w-6 h-6 text-blue-600" />;
    
    // Freight Forwarder
    if (lower.includes('forwarder') || lower.includes('وكيل')) return <CubeIcon className="w-6 h-6 text-indigo-600" />;
    
    // Legal
    if (lower.includes('legal') || lower.includes('law') || lower.includes('قانون') || lower.includes('incoterm')) return <ShieldCheckIcon className="w-6 h-6 text-red-600" />;
    
    // Trader/Financial
    if (lower.includes('trader') || lower.includes('importer') || lower.includes('exporter') || lower.includes('cost') || lower.includes('خلاصة')) return <CurrencyDollarIcon className="w-6 h-6 text-green-600" />;
    
    return <BoltIcon className="w-6 h-6 text-gray-600" />;
};

export const RoutePlannerPage: React.FC<{
    onSaveRoute: (route: SavedRoute) => void;
    systemPromptOverride?: string;
    companies: Company[];
    articles: Article[];
}> = ({ onSaveRoute, systemPromptOverride, companies, articles }) => {
    const { t, language } = useLocalization();
    
    // Unified State
    const [pickupLocation, setPickupLocation] = useState(''); 
    const [pickupDate, setPickupDate] = useState(''); // New State
    const [origin, setOrigin] = useState('');
    const [departureDate, setDepartureDate] = useState(''); // New State
    const [destination, setDestination] = useState('');
    const [goods, setGoods] = useState('');
    const [weight, setWeight] = useState(''); 
    const [incoterm, setIncoterm] = useState(INCOTERMS[0]);
    const [shipmentType, setShipmentType] = useState('fcl');
    const [quantity, setQuantity] = useState('');
    const [problemDescription, setProblemDescription] = useState('');
    
    const [advice, setAdvice] = useState('');
    const [recommendedCompanies, setRecommendedCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(false);
    const [groundingChunks, setGroundingChunks] = useState<{ maps?: { uri?: string; title?: string } }[]>([]);
    const resultRef = useRef<HTMLDivElement>(null);

    // Email State
    const [emailModalOpen, setEmailModalOpen] = useState(false);
    const [emailDraft, setEmailDraft] = useState('');
    const [selectedCompanyForEmail, setSelectedCompanyForEmail] = useState<Company | null>(null);
    const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);

    const handleAnalyze = async () => {
        if (!origin || !destination || !goods) return;
        setLoading(true);
        setAdvice('');
        setRecommendedCompanies([]);
        setGroundingChunks([]);
        try {
            const result = await getShippingAdvice(
                origin, 
                destination, 
                goods, 
                incoterm, 
                shipmentType, 
                quantity, 
                weight,
                companies, 
                articles, 
                language,
                systemPromptOverride,
                problemDescription,
                pickupLocation,
                pickupDate,
                departureDate
            );
            setAdvice(result.advice);
            if (result.groundingChunks) {
                setGroundingChunks(result.groundingChunks);
            }
            if (result.recommendedCompanies) {
                setRecommendedCompanies(result.recommendedCompanies);
            }
            setTimeout(() => {
                resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = () => {
        if (origin && destination && goods) {
            onSaveRoute({
                id: uuidv4(),
                name: `${pickupLocation ? pickupLocation + ' > ' : ''}${origin} to ${destination}`,
                origin,
                destination,
                goods,
                incoterm,
                shipmentType,
                quantity
            });
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(advice);
        alert(language === 'ar' ? 'تم النسخ' : 'Copied');
    };

    const handleDraftEmail = async (company: Company) => {
        setSelectedCompanyForEmail(company);
        setEmailModalOpen(true);
        setIsGeneratingEmail(true);
        setEmailDraft('');
        
        try {
            const draft = await generateProfessionalEmail(
                company.name[language],
                { origin, destination, goods, weight, type: shipmentType },
                language
            );
            setEmailDraft(draft);
        } catch (error) {
            setEmailDraft("Error generating draft. Please write your email manually.");
        } finally {
            setIsGeneratingEmail(false);
        }
    };

    const handleSendEmail = () => {
        if (!selectedCompanyForEmail) return;
        const subject = encodeURIComponent(language === 'ar' ? `استفسار شحن: ${goods}` : `Freight Inquiry: ${goods}`);
        const body = encodeURIComponent(emailDraft);
        window.open(`mailto:${selectedCompanyForEmail.contact.email}?subject=${subject}&body=${body}`);
        setEmailModalOpen(false);
    };

    const incotermOptions = INCOTERMS.map(i => ({ value: i, label: i }));
    const typeOptions = [{ value: 'fcl', label: t('fcl') }, { value: 'lcl', label: t('lcl') }];

    return (
        <div className="max-w-5xl mx-auto pb-12">
            
            {/* Header */}
            <div className="text-center mb-10 animate-fade-in">
                <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl shadow-lg mb-4">
                    <UsersIcon className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-extrabold text-text-heading mb-2">
                    {language === 'ar' ? 'مركز العمليات اللوجستية الموحد' : 'Unified Logistics Command Center'}
                </h1>
                <p className="text-text-muted max-w-2xl mx-auto">
                    {language === 'ar' 
                        ? 'محاكاة كاملة لسلسلة الإمداد: المخلص، الناقل، الخط الملاحي، الوكيل، المستشار القانوني، والتاجر.' 
                        : 'Full Supply Chain Simulation: Customs Broker, Transporter, Carrier, Forwarder, Legal, and Trader.'}
                </p>
            </div>

            {/* Visual Journey Input */}
            <div className="mb-8 relative z-10">
                <div className="bg-surface rounded-2xl shadow-xl border border-blue-100 dark:border-slate-700 overflow-hidden">
                    
                    {/* Visual Connector Line (Desktop) */}
                    <div className="hidden md:block absolute top-16 left-10 right-10 h-1 bg-gray-100 dark:bg-slate-700 -z-0"></div>

                    <div className="grid md:grid-cols-3 relative z-10">
                        {/* 1. Pickup */}
                        <div className="p-6 border-b md:border-b-0 md:border-r border-border hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group bg-white dark:bg-slate-900">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-amber-100 text-amber-600 rounded-lg group-focus-within:ring-2 group-focus-within:ring-amber-400"><TruckIcon className="w-5 h-5" /></div>
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">{language === 'ar' ? 'موقع التحميل (المصنع)' : 'Pickup (Factory)'}</label>
                            </div>
                            <Input 
                                className="border-0 bg-transparent focus:ring-0 text-lg font-bold p-0 h-auto placeholder-gray-300 w-full mb-2" 
                                value={pickupLocation} 
                                onChange={e => setPickupLocation(e.target.value)} 
                                placeholder={language === 'ar' ? 'اختياري (مثال: القاهرة)' : 'Optional (e.g. Cairo)'} 
                            />
                            {/* Date Input for Pickup */}
                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-dashed border-border/50">
                                <CalendarDaysIcon className="w-4 h-4 text-text-muted" />
                                <Input 
                                    type="date"
                                    className="border-0 bg-transparent focus:ring-0 p-0 h-auto text-xs text-text-muted w-full"
                                    value={pickupDate}
                                    onChange={e => setPickupDate(e.target.value)}
                                    title={t('pickupDate')}
                                />
                            </div>
                        </div>

                        {/* 2. POL */}
                        <div className="p-6 border-b md:border-b-0 md:border-r border-border hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group bg-white dark:bg-slate-900">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-focus-within:ring-2 group-focus-within:ring-blue-400"><AnchorIcon className="w-5 h-5" /></div>
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">{t('origin')}</label>
                            </div>
                            <Input 
                                className="border-0 bg-transparent focus:ring-0 text-lg font-bold p-0 h-auto placeholder-gray-300 w-full mb-2" 
                                value={origin} 
                                onChange={e => setOrigin(e.target.value)} 
                                placeholder={language === 'ar' ? 'مثال: الإسكندرية' : 'e.g. Alexandria'} 
                            />
                            {/* Date Input for Departure */}
                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-dashed border-border/50">
                                <CalendarDaysIcon className="w-4 h-4 text-text-muted" />
                                <Input 
                                    type="date"
                                    className="border-0 bg-transparent focus:ring-0 p-0 h-auto text-xs text-text-muted w-full"
                                    value={departureDate}
                                    onChange={e => setDepartureDate(e.target.value)}
                                    title={t('expectedDepartureDate')}
                                />
                            </div>
                        </div>

                        {/* 3. POD */}
                        <div className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group bg-white dark:bg-slate-900">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-green-100 text-green-600 rounded-lg group-focus-within:ring-2 group-focus-within:ring-green-400"><MapPinIcon className="w-5 h-5" /></div>
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">{t('destination')}</label>
                            </div>
                            <Input 
                                className="border-0 bg-transparent focus:ring-0 text-lg font-bold p-0 h-auto placeholder-gray-300 w-full" 
                                value={destination} 
                                onChange={e => setDestination(e.target.value)} 
                                placeholder={language === 'ar' ? 'مثال: بيروت' : 'e.g. Beirut'} 
                            />
                        </div>
                    </div>

                    {/* Cargo & Actions Footer */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 border-t border-border">
                        <div className="grid md:grid-cols-12 gap-4 items-center">
                            
                            {/* Cargo Input */}
                            <div className="md:col-span-4 flex items-center bg-white dark:bg-slate-900 rounded-xl border border-border px-3 focus-within:border-blue-500 transition-colors">
                                <CubeIcon className="w-5 h-5 text-gray-400" />
                                <Input 
                                    className="border-0 bg-transparent focus:ring-0 text-base h-12 w-full" 
                                    value={goods} 
                                    onChange={e => setGoods(e.target.value)} 
                                    placeholder={language === 'ar' ? 'المنتج (مثال: تمور)' : 'Product (e.g. Dates)'} 
                                />
                            </div>

                            {/* Weight Input (NEW) */}
                            <div className="md:col-span-2 flex items-center bg-white dark:bg-slate-900 rounded-xl border border-border px-3 focus-within:border-blue-500 transition-colors">
                                <span className="text-gray-400 text-xs font-bold whitespace-nowrap mr-2">KG</span>
                                <Input 
                                    className="border-0 bg-transparent focus:ring-0 text-base h-12 w-full" 
                                    value={weight} 
                                    onChange={e => setWeight(e.target.value)} 
                                    placeholder={language === 'ar' ? 'الوزن' : 'Weight'} 
                                    type="text"
                                />
                            </div>

                            {/* Options */}
                            <div className="md:col-span-3 grid grid-cols-2 gap-2">
                                <Dropdown options={incotermOptions} value={incoterm} onChange={setIncoterm} />
                                <Dropdown options={typeOptions} value={shipmentType} onChange={setShipmentType} />
                            </div>

                            {/* Action Button */}
                            <div className="md:col-span-3">
                                <Button 
                                    onClick={handleAnalyze} 
                                    disabled={loading || !origin || !destination || !goods} 
                                    className="w-full h-12 text-base font-bold text-white shadow-lg bg-indigo-600 hover:bg-indigo-700"
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <Spinner className="text-white w-4 h-4" />
                                            {language === 'ar' ? 'تحليل الطقس واللوجستيات...' : 'Analyzing...'}
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <UsersIcon className="w-4 h-4" />
                                            {language === 'ar' ? 'بدء العمليات' : 'Start Operations'}
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Optional Context */}
                        <div className="mt-4 pt-4 border-t border-dashed border-gray-200 dark:border-slate-700">
                            <label className="flex items-center gap-2 text-[10px] font-bold text-purple-600 uppercase tracking-wider mb-2 cursor-pointer hover:text-purple-700 transition-colors">
                                <SparklesIcon className="w-3 h-3" />
                                {language === 'ar' ? 'تفاصيل إضافية (اختياري)' : 'Additional Context (Optional)'}
                            </label>
                            <Input 
                                className="bg-transparent border-0 border-b border-gray-200 dark:border-slate-700 rounded-none focus:ring-0 px-0 h-8 text-sm focus:border-purple-500 placeholder-gray-400"
                                value={problemDescription} 
                                onChange={e => setProblemDescription(e.target.value)} 
                                placeholder={language === 'ar' ? 'مثال: بضاعة سريعة التلف، ميزانية محدودة...' : 'e.g., Perishable goods, budget constraints...'} 
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Output */}
            {advice && (
                <div ref={resultRef} className="animate-slide-up space-y-8" id="ai-report-content">
                    
                    {/* Main Report */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-slate-700">
                        {/* Report Header */}
                        <div className="bg-slate-900 text-white p-6 flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden gap-4">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                            
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                                    <RobotIcon className="w-6 h-6 text-indigo-300" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                                            {language === 'ar' ? 'خطة شاملة (متضمنة الطقس)' : 'Comprehensive Plan (Weather Included)'}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-white">Logistics Operations Report</h3>
                                    <div className="flex flex-wrap items-center text-xs text-gray-400 gap-2 mt-2">
                                        {pickupLocation && (
                                            <>
                                                <span className="bg-white/10 px-2 py-0.5 rounded">{pickupLocation}</span>
                                                <ArrowRightCircleIcon className={`w-3 h-3 ${language === 'ar' ? 'rotate-180' : ''}`} />
                                            </>
                                        )}
                                        <span className="bg-white/10 px-2 py-0.5 rounded">{origin}</span>
                                        <ArrowRightCircleIcon className={`w-3 h-3 ${language === 'ar' ? 'rotate-180' : ''}`} />
                                        <span className="bg-white/10 px-2 py-0.5 rounded">{destination}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex gap-2 relative z-10 no-print self-end md:self-auto">
                                <Button size="sm" variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/10" onClick={handleCopy}>
                                    <FileTextIcon className="w-4 h-4"/>
                                </Button>
                                <Button size="sm" variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/10" onClick={() => window.print()}>
                                    <PrintIcon className="w-4 h-4"/>
                                </Button>
                                <Button size="sm" onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-500 border-none text-white shadow-lg shadow-indigo-900/50">
                                    <BookmarkIcon className="w-4 h-4 me-2"/> {t('save')}
                                </Button>
                            </div>
                        </div>

                        {/* Markdown Content */}
                        <div className="p-8 md:p-10">
                            <div className="prose dark:prose-invert max-w-none text-sm md:text-base leading-relaxed text-justify">
                                <ReactMarkdown
                                    components={{
                                        h3: ({node, ...props}) => {
                                            const text = String(props.children);
                                            return (
                                                <div className="flex items-center gap-3 mt-10 mb-4 pb-3 border-b-2 border-gray-100 dark:border-slate-800">
                                                    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg shadow-sm">
                                                        {getSectionIcon(text)}
                                                    </div>
                                                    <h3 className="text-xl font-extrabold text-gray-900 dark:text-white m-0" {...props} />
                                                </div>
                                            );
                                        },
                                        table: ({node, ...props}) => (
                                            <div className="overflow-x-auto my-6 border rounded-xl border-gray-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
                                                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700" {...props} />
                                            </div>
                                        ),
                                        thead: ({node, ...props}) => <thead className="bg-gray-50 dark:bg-slate-900" {...props} />,
                                        th: ({node, ...props}) => <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-slate-700" {...props} />,
                                        td: ({node, ...props}) => <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-slate-700/50 last:border-0" {...props} />,
                                        ul: ({node, ...props}) => <ul className="space-y-3 my-4 list-none pl-0" {...props} />,
                                        li: ({node, ...props}) => (
                                            <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300 bg-gray-50/50 dark:bg-slate-800/30 p-3 rounded-lg border border-gray-100 dark:border-slate-800/50 text-justify">
                                                <CheckCircleIcon className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                                                <span className="flex-1">{props.children}</span>
                                            </li>
                                        ),
                                        strong: ({node, ...props}) => <strong className="font-extrabold text-indigo-800 dark:text-indigo-300" {...props} />,
                                    }}
                                >
                                    {advice}
                                </ReactMarkdown>
                            </div>

                            {/* Grounding Sources */}
                            {groundingChunks.length > 0 && (
                                <div className="mt-10 pt-6 border-t border-gray-100 dark:border-slate-800 bg-blue-50/30 dark:bg-slate-800/30 -mx-8 -mb-10 p-8">
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                                        <GlobeAltIcon className="w-3 h-3"/> Data Sources
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {groundingChunks.map((chunk, idx) => (
                                             chunk.maps?.uri ? (
                                                <a 
                                                    key={idx} 
                                                    href={chunk.maps.uri} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-md text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:border-blue-300 transition-colors shadow-sm"
                                                >
                                                    <MapPinIcon className="w-3 h-3 text-red-500" />
                                                    {chunk.maps.title || 'Verified Location'}
                                                </a>
                                            ) : null
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RECOMMENDED PARTNERS SECTION */}
                    {recommendedCompanies.length > 0 && (
                        <div className="bg-surface rounded-2xl p-8 border border-border shadow-md">
                            <h3 className="text-xl font-bold text-text-heading mb-6 flex items-center gap-2">
                                <UsersIcon className="w-6 h-6 text-purple-600" />
                                {language === 'ar' ? 'الشركاء الموصى بهم لتنفيذ هذه الشحنة' : 'Recommended Partners for Execution'}
                            </h3>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {recommendedCompanies.map(company => (
                                    <div key={company.id} className="group relative bg-background border border-border rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:border-purple-300">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div style={{ backgroundColor: company.logoBgColor }} className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-sm">
                                                {company.logoShortName}
                                            </div>
                                            <div className="overflow-hidden">
                                                <h4 className="font-bold text-sm text-text-heading truncate" title={company.name[language]}>{company.name[language]}</h4>
                                                <span className="text-[10px] uppercase font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">{t(company.category)}</span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-text-muted line-clamp-2 mb-3 h-8">{company.description[language]}</p>
                                        <div className="flex gap-2">
                                            <Button size="sm" onClick={() => handleDraftEmail(company)} className="w-full text-xs h-8 bg-purple-600 hover:bg-purple-700 text-white">
                                                <EnvelopeIcon className="w-3 h-3 me-1"/> {language === 'ar' ? 'مسودة إيميل' : 'Draft Email'}
                                            </Button>
                                            <a href={`mailto:${company.contact.email}`} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                                                <ArrowRightIcon className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Email Draft Modal */}
            <Modal isOpen={emailModalOpen} onClose={() => setEmailModalOpen(false)} title={language === 'ar' ? 'مسودة تواصل احترافية' : 'Professional Contact Draft'}>
                <div className="space-y-4">
                    {isGeneratingEmail ? (
                        <div className="text-center py-8">
                            <Spinner className="w-8 h-8 mx-auto text-purple-600 mb-2" />
                            <p className="text-sm text-text-muted">{language === 'ar' ? 'جاري صياغة الإيميل بالذكاء الاصطناعي...' : 'AI is drafting your email...'}</p>
                        </div>
                    ) : (
                        <>
                            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
                                <span className="font-bold">{language === 'ar' ? 'إلى:' : 'To:'}</span> {selectedCompanyForEmail?.name[language]} <br/>
                                <span className="font-bold">{language === 'ar' ? 'البريد:' : 'Email:'}</span> {selectedCompanyForEmail?.contact.email}
                            </div>
                            <Textarea 
                                value={emailDraft} 
                                onChange={(e) => setEmailDraft(e.target.value)} 
                                rows={10} 
                                className="font-mono text-sm"
                            />
                            <div className="flex justify-end gap-2">
                                <Button variant="secondary" onClick={() => setEmailModalOpen(false)}>{t('cancel')}</Button>
                                <Button onClick={handleSendEmail} className="bg-purple-600 hover:bg-purple-700 text-white">
                                    <EnvelopeIcon className="w-4 h-4 me-2"/> {language === 'ar' ? 'فتح في تطبيق الإيميل' : 'Open in Mail App'}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </Modal>
        </div>
    );
};
