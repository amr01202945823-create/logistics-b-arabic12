
import React, { useState, useMemo, useEffect } from 'react';
import { useLocalization } from '../localization';
import type { Company, CompanyRatings } from '../types';
import { getRatings } from '../services/ratingService';
import { SEO } from '../components/SEO';
import { Button, Card, CardContent, Input, Dropdown, StarRating, Modal, Spinner } from '../components/ui';
import { 
  SearchIcon, HeartIcon, MapPinIcon, ShipIcon, ArrowLeftIcon, ChevronRightIcon, DocumentArrowUpIcon, ArrowRightIcon
} from '../components/icons';

const ITEMS_PER_PAGE = 9;

const AddCompanyModal: React.FC<{ isOpen: boolean; onClose: () => void; onAdd: (company: Company) => void }> = ({ isOpen, onClose, onAdd }) => {
    const { t } = useLocalization();
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        email: '',
        phone: '',
        website: '',
        category: 'freight-forwarder',
        verificationFile: null as File | null
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError('');
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                setError(t('fileTooLarge'));
                e.target.value = ''; 
                return;
            }
            setFormData(prev => ({ ...prev, verificationFile: file }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.verificationFile) {
            setError(t('requiredField'));
            return;
        }
        setIsSubmitting(true);
        
        // Convert file to Base64 to simulate backend storage so Admin can download it
        const reader = new FileReader();
        reader.onload = () => {
            const fileUrl = reader.result as string;
            
            setTimeout(() => {
                const newCompany: Company = {
                    id: Date.now(),
                    name: { ar: formData.name, en: formData.name },
                    description: { ar: 'بانتظار المراجعة', en: 'Pending Verification' },
                    category: formData.category as any,
                    logoShortName: formData.name.substring(0,2).toUpperCase(),
                    logoBgColor: '#64748b',
                    ports: ['Pending Review'],
                    branches: [{ 
                        city: { ar: 'القاهرة', en: 'Cairo' }, // Default for now
                        address: { ar: formData.address, en: formData.address },
                        workingHours: { ar: '9-5', en: '9-5' },
                        peakTimes: [1,1,1,1,1]
                    }],
                    serviceAreas: {},
                    contact: { email: formData.email, phone: formData.phone },
                    website: formData.website,
                    status: 'pending',
                    verificationDocumentUrl: fileUrl,
                    verificationDocumentName: formData.verificationFile?.name || 'document.pdf'
                };

                onAdd(newCompany);
                setIsSubmitting(false);
                alert(t('companyAddedSuccess'));
                onClose();
                setFormData({
                    name: '', address: '', email: '', phone: '', website: '', category: 'freight-forwarder', verificationFile: null
                });
            }, 1000);
        };
        
        if (formData.verificationFile) {
            reader.readAsDataURL(formData.verificationFile);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('addCompany')}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">{t('companyName')}</label>
                    <Input name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">{t('category')}</label>
                    <select 
                        name="category" 
                        value={formData.category} 
                        onChange={handleChange}
                        className="flex h-11 w-full rounded-lg border border-border bg-background py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                        <option value="shipping-line">{t('shipping-line')}</option>
                        <option value="freight-forwarder">{t('freight-forwarder')}</option>
                        <option value="transportation">{t('transportation')}</option>
                        <option value="customs-broker">{t('customs-broker')}</option>
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">{t('address')}</label>
                    <Input name="address" value={formData.address} onChange={handleChange} required />
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1">{t('phone')}</label>
                        <Input name="phone" type="tel" value={formData.phone} onChange={handleChange} required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-text-muted mb-1">{t('email')}</label>
                        <Input name="email" type="email" value={formData.email} onChange={handleChange} required />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">{t('companyWebsite')}</label>
                    <Input name="website" type="url" value={formData.website} onChange={handleChange} placeholder="https://example.com" />
                </div>
                
                 <div className="pt-4">
                    <label className="block text-sm font-medium text-text-heading mb-1">{t('verificationDocument')}</label>
                    <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-border border-dashed rounded-md hover:bg-slate-50 transition-colors">
                        <div className="space-y-1 text-center">
                            <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-text-muted" />
                            <div className="flex text-sm text-text-muted justify-center">
                                <label htmlFor="file-upload" className="relative cursor-pointer bg-surface rounded-md font-medium text-primary hover:text-primary-hover focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                                    <span>{t('uploadFile')}</span>
                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*,.pdf" />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            {formData.verificationFile ? (
                                <p className="text-xs text-green-600 font-bold">{formData.verificationFile.name}</p>
                            ) : (
                                <p className="text-xs text-text-muted">PDF, PNG, JPG up to 5MB</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>{t('cancel')}</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Spinner className="w-4 h-4 mr-2" />}
                        {t('submit')}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export const DirectoryPage: React.FC<{ 
    onCompanyClick: (company: Company) => void; 
    favorites: number[]; 
    onToggleFavorite: (id: number) => void;
    companies: Company[];
    onAddCompany: (company: Company) => void;
}> = ({ onCompanyClick, favorites, onToggleFavorite, companies, onAddCompany }) => {
    const { t, language } = useLocalization();
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [ratings, setRatings] = useState<CompanyRatings>(getRatings());
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setRatings(getRatings());
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, selectedCategory, showFavoritesOnly]);

    const filteredCompanies = useMemo(() => {
        return companies.filter(company => {
            if (showFavoritesOnly && !favorites.includes(company.id)) {
                return false;
            }

            const lowerSearch = debouncedSearchTerm.toLowerCase();
            
            const matchesCategory = selectedCategory === 'all' || company.category === selectedCategory;
            if (!matchesCategory) return false;

            if (lowerSearch === '') return true;

            const matchesName = company.name?.[language]?.toLowerCase().includes(lowerSearch);
            const matchesDesc = company.description?.[language]?.toLowerCase().includes(lowerSearch);
            const matchesPorts = company.ports?.some(p => p.toLowerCase().includes(lowerSearch));
            const locationMatch = company.serviceAreas && Object.values(company.serviceAreas).some(area => 
                (area as { locations: string[] }).locations.some(loc => loc.toLowerCase().includes(lowerSearch))
            );

            return matchesName || matchesDesc || matchesPorts || locationMatch;
        });
    }, [debouncedSearchTerm, selectedCategory, language, showFavoritesOnly, favorites, companies]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredCompanies.length / ITEMS_PER_PAGE);
    const paginatedCompanies = filteredCompanies.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="max-w-7xl mx-auto pb-12">
            <SEO 
                titleKey="directory" 
                descriptionKey="directorySectionDesc"
                keywords={['freight forwarders', 'shipping lines', 'logistics companies', 'egypt', 'customs brokers']}
            />
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-text-heading">{t('directory')}</h2>
                    <p className="text-text-muted mt-2">{t('howItWorks2Desc')}</p>
                </div>
                <Button onClick={() => setIsAddModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">{t('addCompany')}</Button>
            </div>

            {/* Filters */}
            <Card className="card-shadow mb-8 !overflow-visible relative z-30">
                <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2 relative">
                            <SearchIcon className="absolute top-1/2 -translate-y-1/2 left-3 w-5 h-5 text-text-muted" />
                            <Input 
                                placeholder={t('searchByName')} 
                                value={searchTerm} 
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Dropdown 
                            options={[{value: 'all', label: t('selectCompanyType')}, ...['shipping-line', 'freight-forwarder', 'transportation', 'customs-broker'].map(c => ({value: c, label: t(c)}))]}
                            value={selectedCategory}
                            onChange={setSelectedCategory}
                        />
                        <Button 
                            variant={showFavoritesOnly ? 'primary' : 'secondary'} 
                            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                            className={`flex items-center gap-2 justify-center ${showFavoritesOnly ? 'bg-red-500 hover:bg-red-600 text-white border-transparent' : ''}`}
                        >
                            <HeartIcon filled={true} className={`w-4 h-4 ${showFavoritesOnly ? 'text-white' : 'text-red-500'}`} />
                            {t('myFavorites')}
                        </Button>
                    </div>
                </CardContent>
            </Card>
            
            {/* Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10 min-h-[400px]">
                {paginatedCompanies.map(company => {
                    const isFavorite = favorites.includes(company.id);
                    const companyRatings = ratings[company.id]?.ratings || [];
                    const avgRating = companyRatings.length > 0 
                        ? companyRatings.reduce((sum, r) => sum + r.score, 0) / companyRatings.length 
                        : 0;

                    return (
                        <Card key={company.id} className="card-shadow-hover cursor-pointer flex flex-col group" onClick={() => onCompanyClick(company)}>
                            <CardContent className="p-6 flex-grow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div style={{ backgroundColor: company.logoBgColor }} className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0">
                                            {company.logoShortName}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-text-heading leading-tight group-hover:text-blue-600 transition-colors">{company.name?.[language]}</h3>
                                            <span className="inline-block bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider mt-1">{t(company.category)}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onToggleFavorite(company.id); }}
                                            className={`p-2 rounded-full shadow-sm border transition-all duration-200 ${isFavorite ? 'bg-red-50 border-red-100 text-red-500' : 'bg-white border-slate-100 text-slate-300 hover:text-red-400 hover:border-red-100'}`}
                                        >
                                            <HeartIcon className="w-5 h-5" filled={isFavorite} />
                                        </button>
                                        <div className="flex flex-col items-end">
                                            <StarRating rating={avgRating} readOnly size="sm" />
                                            <span className="text-[10px] text-text-muted mt-0.5">{companyRatings.length} {t('reviews')}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <p className="text-text-muted text-sm line-clamp-2 mb-4 min-h-[2.5em]">{company.description?.[language]}</p>
                                
                                <div className="space-y-2 text-sm text-text-muted border-t border-border/50 pt-3">
                                    <div className="flex items-center gap-2">
                                        <MapPinIcon className="w-4 h-4 text-blue-600/70" />
                                        <span className="truncate">{company.branches?.[0]?.city?.[language] || 'Main Branch'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ShipIcon className="w-4 h-4 text-blue-600/70" />
                                        <span className="truncate" title={company.ports?.join(', ')}>
                                            {company.ports?.length > 0 ? company.ports.slice(0, 3).join(', ') + (company.ports.length > 3 ? '...' : '') : 'Global Ports'}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                             <div className="p-3 bg-surface-hover rounded-b-xl flex justify-center items-center border-t border-border/50 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                 <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                    View Profile {language === 'ar' ? <ArrowLeftIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
                                 </span>
                            </div>
                        </Card>
                    );
                })}
                {filteredCompanies.length === 0 && (
                    <div className="col-span-full text-center py-12 text-text-muted">
                        <p>{showFavoritesOnly ? t('noFavorites') : 'No companies found.'}</p>
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

            <AddCompanyModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={onAddCompany} />
        </div>
    );
};
