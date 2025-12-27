
import React, { useState, useMemo, useEffect } from 'react';
import { useLocalization } from '../localization';
import type { Article, ArticleCategory, User } from '../types';
import { SEO } from '../components/SEO';
import { Card, CardContent, Input, Button } from '../components/ui';
import { 
    CalendarDaysIcon, ArrowRightCircleIcon, SearchIcon, FireIcon, 
    ClockIcon, TagIcon, ShareIcon, EditIcon, PlusIcon, ArrowLeftIcon,
    ArrowsPointingInIcon, ArrowsPointingOutIcon, ArrowRightIcon
} from '../components/icons';
import ReactMarkdown from 'react-markdown';
import { ArticleForm } from '../components/ArticleForm';

// --- Helper for Category Styles ---
const getCategoryStyles = (category: string) => {
    const styles: Record<string, string> = {
        'news': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
        'logistics-tech': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800',
        'ports': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
        'customs': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        'sea-freight': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        'warehousing': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800',
        'global-trade': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        'financial': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',
        'educational': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
        'laws-and-regulations': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    };
    return styles[category] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200';
};

// --- Dedicated Article Detail View ---
const ArticleDetailView: React.FC<{ 
    article: Article; 
    onBack: () => void;
    t: (key: string) => string;
    language: 'ar' | 'en';
    getReadTime: (text: string) => string;
    articles: Article[];
    onArticleClick: (article: Article) => void;
    isAdmin: boolean;
    onEdit: () => void;
}> = ({ article, onBack, t, language, getReadTime, articles, onArticleClick, isAdmin, onEdit }) => {
    
    // View Mode State
    const [viewMode, setViewMode] = useState<'compact' | 'expanded'>('expanded');

    // Toggle Function
    const toggleView = () => setViewMode(prev => prev === 'expanded' ? 'compact' : 'expanded');

    // Get 3 related articles
    const relatedArticles = useMemo(() => {
        return articles
            .filter(a => a.id !== article.id)
            .sort((a, b) => (a.category === article.category ? -1 : 1)) // Prioritize same category
            .slice(0, 3);
    }, [article, articles]);

    // Structured Data for Article
    const articleSchema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": article.title?.[language],
        "image": [article.imageUrl],
        "datePublished": new Date().toISOString(), // In real app, use article.createdAt
        "dateModified": new Date().toISOString(),
        "author": [{
            "@type": "Organization",
            "name": "Logistics B Arabc Editorial",
            "url": "https://logisticsbarab.com"
        }],
        "publisher": {
            "@type": "Organization",
            "name": "Logistics B Arabc",
            "logo": {
              "@type": "ImageObject",
              "url": "https://logisticsbarab.com/logo.png"
            }
        },
        "description": article.summary?.[language]
    };

    return (
        <div className="animate-fade-in pb-20">
            <SEO 
                titleKey={article.title?.[language] || 'brandName'}
                descriptionKey={article.summary?.[language] || 'brandName'}
                type="article"
                image={article.imageUrl}
                author="Logistics B Arabc Editorial"
                publishedTime={new Date().toISOString()} // Mocking date
                schema={articleSchema}
                canonicalUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/#/articles/${article.id}`}
            />
            <div className="max-w-5xl mx-auto">
                {/* Navigation Bar */}
                <div className="flex justify-between items-center mb-6">
                    <Button onClick={onBack} variant="ghost" className="hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300">
                        {/* Fix: In Arabic (RTL), Back button should point Right (rotate-180). In English (LTR), it should point Left (default). */}
                        <ArrowLeftIcon className={`w-5 h-5 ${language === 'ar' ? 'rotate-180' : ''} me-2`} />
                        {t('back')}
                    </Button>
                    <div className="flex gap-2">
                        {/* Toggle Button */}
                        <Button 
                            onClick={toggleView} 
                            variant="outline"
                            className="transition-all hidden md:flex items-center"
                        >
                            {viewMode === 'expanded' ? (
                                <><ArrowsPointingInIcon className="w-4 h-4 me-2" /> Compact</>
                            ) : (
                                <><ArrowsPointingOutIcon className="w-4 h-4 me-2" /> Expand</>
                            )}
                        </Button>

                        {isAdmin && (
                            <Button onClick={onEdit} variant="secondary">
                                <EditIcon className="w-4 h-4 me-2"/> {t('edit')}
                            </Button>
                        )}
                        <Button variant="outline" className="rounded-full w-10 h-10 p-0 flex items-center justify-center">
                            <ShareIcon className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Hero Section */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-10 h-[400px] md:h-[500px]">
                    <img 
                        src={article.imageUrl} 
                        alt={article.title?.[language]} 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 w-full p-8 md:p-12">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border bg-white/10 backdrop-blur-md text-white border-white/20`}>
                                {t(article.category)}
                            </span>
                            <span className="text-gray-300 text-sm font-medium flex items-center gap-2">
                                <CalendarDaysIcon className="w-4 h-4" /> {article.date?.['en']}
                            </span>
                            <span className="text-gray-300 text-sm font-medium flex items-center gap-2">
                                <ClockIcon className="w-4 h-4" /> {getReadTime(article.content?.[language] || '')}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight max-w-4xl drop-shadow-lg">
                            {article.title?.[language]}
                        </h1>
                    </div>
                </div>

                {/* Expanded Content with Transition */}
                <div className={`transition-all duration-700 ease-in-out overflow-hidden ${viewMode === 'expanded' ? 'opacity-100 max-h-[10000px]' : 'opacity-0 max-h-0'}`}>
                    <div className="grid lg:grid-cols-12 gap-12">
                        {/* Main Content */}
                        <div className="lg:col-span-8">
                            <Card className="bg-white dark:bg-slate-900 border-none shadow-sm overflow-hidden">
                                <CardContent className="p-8 md:p-10">
                                    {/* Editorial Info */}
                                    <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100 dark:border-slate-800">
                                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg">
                                            LB
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 dark:text-white">Logistics B Arabc Editorial</div>
                                            <div className="text-sm text-gray-500">Market Intelligence Team</div>
                                        </div>
                                    </div>

                                    <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 text-lg leading-relaxed prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white prose-a:text-blue-600 prose-img:rounded-xl">
                                        <ReactMarkdown>
                                            {article.content?.[language] || ''}
                                        </ReactMarkdown>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar / Related */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="sticky top-24">
                                <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-6 border-l-4 border-primary pl-3">
                                    {t('youMightLike')}
                                </h3>
                                <div className="flex flex-col gap-4">
                                    {relatedArticles.map((relArt) => (
                                        <div 
                                            key={relArt.id} 
                                            onClick={() => onArticleClick(relArt)}
                                            className="group cursor-pointer bg-white dark:bg-slate-900 rounded-xl p-3 shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-slate-800 flex gap-4 items-start"
                                        >
                                            <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 relative">
                                                <img src={relArt.imageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className={`text-[10px] font-bold uppercase mb-1 ${relatedArticles.indexOf(relArt) % 2 === 0 ? 'text-blue-600' : 'text-purple-600'}`}>
                                                    {t(relArt.category)}
                                                </div>
                                                <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 line-clamp-3 leading-snug group-hover:text-primary transition-colors">
                                                    {relArt.title?.[language]}
                                                </h4>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Newsletter Signup (Visual) */}
                                <div className="mt-8 p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl text-white text-center">
                                    <h4 className="font-bold text-lg mb-2">Weekly Logistics Brief</h4>
                                    <p className="text-blue-100 text-sm mb-4">Get the latest market updates delivered to your inbox.</p>
                                    <Button className="w-full bg-white text-blue-700 hover:bg-blue-50 font-bold border-none">Subscribe</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Compact View Fallback */}
                <div className={`transition-all duration-500 ease-in-out ${viewMode === 'compact' ? 'opacity-100 max-h-[500px] mt-8 transform translate-y-0' : 'opacity-0 max-h-0 overflow-hidden transform -translate-y-10'}`}>
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-700 text-center">
                        <h3 className="text-xl font-bold text-text-heading mb-4">Summary</h3>
                        <p className="text-lg text-text-muted mb-8 max-w-3xl mx-auto leading-relaxed">
                            {article.summary?.[language]}
                        </p>
                        <Button onClick={() => setViewMode('expanded')} size="lg" className="bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                            {t('readMore') || 'Read Full Article'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Updated Grid Item ---
const ArticleGridItem: React.FC<{ 
    article: Article; 
    onClick: (article: Article) => void;
    t: (key: string) => string;
    language: 'ar' | 'en';
    getReadTime: (text: string) => string;
    isAdmin: boolean;
    onEdit: (e: React.MouseEvent) => void;
}> = ({ article, onClick, t, language, getReadTime, isAdmin, onEdit }) => {
    const categoryStyle = getCategoryStyles(article.category);

    return (
        <div 
            onClick={() => onClick(article)}
            className="group flex flex-col h-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden transition-all duration-300 cursor-pointer transform hover:-translate-y-1 relative"
        >
            <div className="relative h-52 overflow-hidden">
                <img 
                    src={article.imageUrl} 
                    alt={article.title?.[language] || 'Article Image'} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    loading="lazy" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                <div className="absolute top-4 left-4">
                    <span className={`backdrop-blur-md bg-white/95 dark:bg-slate-900/95 text-xs font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wider flex items-center gap-1 border ${categoryStyle}`}>
                        <TagIcon className="w-3 h-3" /> {t(article.category)}
                    </span>
                </div>
                {isAdmin && (
                    <button 
                        onClick={onEdit} 
                        className="absolute top-4 right-4 bg-white/20 backdrop-blur-md hover:bg-white text-white hover:text-blue-600 p-2 rounded-full shadow-md transition z-20"
                    >
                        <EditIcon className="w-4 h-4"/>
                    </button>
                )}
            </div>
            
            <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-3 text-xs text-gray-400 mb-3 font-medium uppercase tracking-wide">
                    <span className="flex items-center gap-1"><CalendarDaysIcon className="w-3 h-3" /> {article.date?.['en']}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span className="flex items-center gap-1"><ClockIcon className="w-3 h-3" /> {getReadTime(article.content?.[language] || '')}</span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                    {article.title?.[language]}
                </h3>
                
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 line-clamp-3 leading-relaxed flex-grow">
                    {article.summary?.[language]}
                </p>
                
                <div className="mt-auto pt-4 border-t border-gray-50 dark:border-slate-700/50 flex items-center justify-between">
                    <span className="flex items-center text-blue-600 font-bold text-xs uppercase tracking-wider group-hover:underline">
                        {t('readMore')} <ArrowRightCircleIcon className={`w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1 ${language === 'ar' ? 'rotate-180' : ''}`} />
                    </span>
                </div>
            </div>
        </div>
    );
};

const ITEMS_PER_PAGE = 6;

export const ArticlesPage: React.FC<{ 
    onArticleClick: (article: Article) => void, 
    articles: Article[], 
    currentUser?: User | null,
    onAddArticle?: (article: Article) => void,
    onUpdateArticle?: (article: Article) => void,
    onDeleteArticle?: (id: number) => void
}> = ({ onArticleClick, articles, currentUser, onAddArticle, onUpdateArticle, onDeleteArticle }) => {
    const { t, language } = useLocalization();
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<ArticleCategory | 'all'>('all');
    
    // View Management
    const [activeArticle, setActiveArticle] = useState<Article | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'detail' | 'form'>('list');
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);

    const isAdmin = !!currentUser && (currentUser.isAdmin || currentUser.role === 'super_admin' || currentUser.role === 'editor');

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, selectedCategory]);

    const categories: (ArticleCategory | 'all')[] = [
        'all',
        'sea-freight',
        'customs',
        'ports',
        'laws-and-regulations',
        'educational',
        'logistics-tech',
        'financial',
        'global-trade'
    ];

    const filteredArticles = useMemo(() => {
        return articles.filter(article => {
            const title = article.title?.[language]?.toLowerCase() || '';
            const summary = article.summary?.[language]?.toLowerCase() || '';
            
            const matchesSearch = title.includes(debouncedSearchTerm.toLowerCase()) ||
                                  summary.includes(debouncedSearchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [debouncedSearchTerm, selectedCategory, language, articles]);
    
    // Pagination Logic
    const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
    const paginatedArticles = filteredArticles.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getReadTime = (text: string) => {
        if (!text) return '1 min read';
        const wordsPerMinute = 200;
        const noOfWords = text.split(/\s/g).length;
        const minutes = Math.ceil(noOfWords / wordsPerMinute);
        return `${minutes} min read`;
    };

    // Navigation Handlers
    const handleArticleSelect = (article: Article) => {
        setActiveArticle(article);
        setViewMode('detail');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleBackToList = () => {
        setActiveArticle(null);
        setViewMode('list');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCreateClick = () => {
        setActiveArticle(null);
        setFormMode('create');
        setViewMode('form');
    };

    const handleEditClick = (e?: React.MouseEvent, article?: Article) => {
        if (e) e.stopPropagation();
        const target = article || activeArticle;
        if (target) {
            setActiveArticle(target);
            setFormMode('edit');
            setViewMode('form');
        }
    };

    const handleFormSubmit = (article: Article) => {
        if (formMode === 'create' && onAddArticle) {
            onAddArticle(article);
        } else if (formMode === 'edit' && onUpdateArticle) {
            onUpdateArticle(article);
        }
        // After save, show the detail view of the saved article
        setActiveArticle(article);
        setViewMode('detail');
    };

    // Schema for CollectionPage
    const collectionSchema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": t('knowledgeBaseHeroTitle'),
        "description": t('knowledgeBaseHeroSubtitle'),
        "url": typeof window !== 'undefined' ? window.location.href : '',
        "mainEntity": {
            "@type": "ItemList",
            "itemListElement": articles.map((article, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "url": `${typeof window !== 'undefined' ? window.location.origin : ''}/#/articles/${article.id}`, 
                "name": article.title?.['en'] || 'Article'
            }))
        }
    };

    // --- RENDER ---

    if (viewMode === 'detail' && activeArticle) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] pt-8 px-4">
                <ArticleDetailView 
                    article={activeArticle}
                    onBack={handleBackToList}
                    t={t}
                    language={language}
                    getReadTime={getReadTime}
                    articles={articles}
                    onArticleClick={handleArticleSelect}
                    isAdmin={isAdmin}
                    onEdit={handleEditClick}
                />
            </div>
        );
    }

    if (viewMode === 'form') {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] pt-8 px-4 pb-20">
                <div className="max-w-4xl mx-auto">
                    <Button onClick={handleBackToList} variant="ghost" className="mb-6 pl-0">
                        {language === 'ar' ? <ArrowRightIcon className="w-5 h-5 me-2" /> : <ArrowLeftIcon className="w-5 h-5 me-2" />}
                        {t('cancel')}
                    </Button>
                    <Card className="card-shadow">
                        <div className="p-6 border-b border-border bg-white dark:bg-slate-900 rounded-t-xl">
                            <h2 className="text-2xl font-bold">{formMode === 'create' ? 'Add New Article' : 'Edit Article'}</h2>
                        </div>
                        <div className="p-6 bg-white dark:bg-slate-900 rounded-b-xl">
                            <ArticleForm 
                                initialData={formMode === 'edit' ? activeArticle : null} 
                                onSubmit={handleFormSubmit} 
                                onCancel={handleBackToList} 
                            />
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    // Default: List View
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a]">
             <SEO 
                titleKey="knowledgeBase" 
                descriptionKey="knowledgeBaseHeroSubtitle"
                keywords={['logistics news', 'customs regulations', 'maritime updates', 'shipping articles']}
                schema={collectionSchema}
                canonicalUrl={typeof window !== 'undefined' ? `${window.location.origin}/#/articles` : ''}
            />
             
             {/* Hero Section */}
             <div className="relative bg-slate-900 text-white pt-24 pb-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 opacity-90"></div>
                {/* Abstract Pattern */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl mix-blend-screen"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl mix-blend-screen"></div>
                
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <span className="inline-block py-1 px-3 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-sm">
                        {t('knowledgeBridgeTag')}
                    </span>
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight">
                        {t('knowledgeBaseHeroTitle')}
                    </h1>
                    <p className="text-blue-100/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
                        {t('knowledgeBaseHeroSubtitle')}
                    </p>
                    
                    {/* Embedded Search Bar */}
                    <div className="max-w-2xl mx-auto relative group">
                        <div className="absolute inset-0 bg-blue-400 rounded-full blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                        <div className="relative bg-white dark:bg-slate-800 rounded-full shadow-2xl flex items-center p-1.5 transition-transform group-hover:scale-[1.01]">
                            <div className="pl-4 pr-2 text-gray-400">
                                <SearchIcon className="h-6 w-6" />
                            </div>
                            <input 
                                type="text" 
                                placeholder={t('searchArticles')} 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-12 bg-transparent border-none focus:ring-0 text-lg placeholder-gray-400 text-gray-800 dark:text-white"
                            />
                            {isAdmin && (
                                <Button onClick={handleCreateClick} className="hidden sm:flex rounded-full bg-green-600 hover:bg-green-700 text-white px-6 h-11 shadow-md font-bold ml-2 whitespace-nowrap">
                                    <PlusIcon className="w-4 h-4 mr-2"/> Add
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-16 relative z-20 pb-20">
                {/* Categories */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-3 mb-12 flex overflow-x-auto custom-scrollbar gap-2 mx-auto max-w-5xl border border-gray-100 dark:border-slate-700">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${
                                selectedCategory === cat 
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md' 
                                : 'bg-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            {cat === 'all' && <FireIcon className={`w-4 h-4 ${selectedCategory === 'all' ? 'text-yellow-400' : 'text-gray-400'}`}/>}
                            {cat === 'all' ? t('allCategories') : t(cat)}
                        </button>
                    ))}
                </div>

                {/* Articles Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {paginatedArticles.length > 0 ? (
                        paginatedArticles.map((article, index) => {
                            return (
                                <ArticleGridItem 
                                    key={article.id} 
                                    article={article} 
                                    onClick={handleArticleSelect} 
                                    t={t} 
                                    language={language}
                                    getReadTime={getReadTime}
                                    isAdmin={isAdmin}
                                    onEdit={(e) => handleEditClick(e, article)}
                                />
                            );
                        })
                    ) : (
                        <div className="col-span-full text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-slate-700">
                            <div className="inline-flex justify-center items-center w-20 h-20 bg-gray-50 dark:bg-slate-700 rounded-full mb-4">
                                <SearchIcon className="w-10 h-10 text-gray-300 dark:text-gray-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">No articles found</h3>
                            <p className="text-gray-500 dark:text-gray-400 mt-2">We couldn't find anything matching "{searchTerm}". Try adjusting your filters.</p>
                            <Button variant="secondary" className="mt-6" onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}>Clear Filters</Button>
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-12" dir="ltr">
                        <Button
                            variant="outline"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="w-10 h-10 p-0 rounded-full flex items-center justify-center disabled:opacity-30 border-gray-300 dark:border-gray-600"
                        >
                            <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </Button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`w-10 h-10 rounded-full text-sm font-bold transition-all ${
                                    currentPage === page
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-110'
                                    : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-gray-700'
                                }`}
                            >
                                {page}
                            </button>
                        ))}

                        <Button
                            variant="outline"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="w-10 h-10 p-0 rounded-full flex items-center justify-center disabled:opacity-30 border-gray-300 dark:border-gray-600"
                        >
                            <ArrowRightIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
