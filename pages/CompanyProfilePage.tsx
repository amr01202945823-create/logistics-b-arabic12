
import React, { useState, useEffect } from 'react';
import { useLocalization } from '../localization';
import type { Company, User, Rating } from '../types';
import { getRatings, rateCompany } from '../services/ratingService';
import { Button, Card, CardContent, Textarea, Spinner, StarRating } from '../components/ui';
import { SEO } from '../components/SEO';
import { 
  ArrowLeftIcon, BuildingLibraryIcon, ClockIcon, EnvelopeIcon, PhoneIcon, ShipIcon, CheckCircleIcon 
} from '../components/icons';

export const CompanyProfilePage: React.FC<{ company: Company; onBack: () => void; currentUser: User | null }> = ({ company, onBack, currentUser }) => {
    const { t, language } = useLocalization();
    const [viewCompanyTab, setViewCompanyTab] = useState<'overview' | 'services' | 'reviews'>('overview');
    const [reviews, setReviews] = useState<Rating[]>([]);
    const [newReview, setNewReview] = useState({ score: 0, comment: '' });
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    useEffect(() => {
        const allRatings = getRatings();
        const companyRatings = allRatings[company.id]?.ratings || [];
        if (companyRatings.length === 0) {
             const mockReviews: Rating[] = [
                { userId: 'u1', userName: 'Logistics User 1', score: 4, comment: 'Great service and timely updates. Highly recommended for shipping-line services.', date: new Date(Date.now() - 86400000 * 2).toISOString() },
                { userId: 'u2', userName: 'Logistics User 2', score: 4, comment: 'Great service and timely updates. Highly recommended for shipping-line services.', date: new Date(Date.now() - 86400000 * 5).toISOString() }
            ];
            setReviews(mockReviews);
        } else {
            setReviews(companyRatings);
        }
    }, [company.id]);

    const handleRate = (score: number) => {
        setNewReview(prev => ({ ...prev, score }));
    };

    const handleSubmitReview = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;
        if (newReview.score === 0) return;

        setIsSubmittingReview(true);
        
        setTimeout(() => {
            const updatedRatings = rateCompany(company.id, currentUser.id, currentUser.name || 'Anonymous', newReview.score, newReview.comment);
            setReviews(updatedRatings[company.id].ratings);
            setNewReview({ score: 0, comment: '' });
            setIsSubmittingReview(false);
        }, 500);
    };

    const averageRating = reviews.length > 0 
        ? (reviews.reduce((acc, r) => acc + r.score, 0) / reviews.length).toFixed(1)
        : '0.0';

    // Structured Data for LocalBusiness
    const companySchema = {
        "@context": "https://schema.org",
        "@type": "LogisticsService",
        "name": company.name?.[language],
        "image": "https://logisticsbarab.com/logo.png", // Fallback if no specific image
        "description": company.description?.[language],
        "address": {
            "@type": "PostalAddress",
            "addressLocality": company.branches?.[0]?.city?.[language],
            "streetAddress": company.branches?.[0]?.address?.[language]
        },
        "telephone": company.contact?.phone,
        "email": company.contact?.email,
        "url": company.website,
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": averageRating,
            "reviewCount": reviews.length
        }
    };

    return (
        <div className="max-w-5xl mx-auto animate-fade-in">
             <SEO 
                titleKey={company.name?.[language] || 'directory'}
                descriptionKey={company.description?.[language] || 'directorySectionDesc'}
                type="profile"
                schema={companySchema}
                keywords={[company.category, 'logistics', company.name?.['en'], company.name?.['ar']].filter(Boolean) as string[]}
                canonicalUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/#/directory/${company.id}`}
             />
             <Button onClick={onBack} variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-primary">
                 <ArrowLeftIcon className="w-5 h-5 me-2"/> Back to Directory
             </Button>
             
             {/* Company Header */}
             <Card className="card-shadow mb-8 overflow-hidden">
                 <div className="h-32 bg-gradient-to-r from-slate-800 to-slate-900 relative">
                     <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-black/50 to-transparent"></div>
                 </div>
                 <div className="px-8 pb-8 relative">
                     <div className="flex flex-col md:flex-row justify-between items-end md:items-center -mt-12 mb-6">
                         <div className="flex items-end gap-6">
                             <div style={{ backgroundColor: company.logoBgColor }} className="w-28 h-28 rounded-2xl flex items-center justify-center text-white font-bold text-4xl shadow-xl border-4 border-surface">
                                 {company.logoShortName}
                             </div>
                             <div className="mb-2">
                                 <h1 className="text-3xl font-bold text-text-heading">{company.name?.[language]}</h1>
                                 <p className="text-primary font-medium">{t(company.category)}</p>
                             </div>
                         </div>
                         <div className="flex flex-col items-end gap-2 mt-4 md:mt-0">
                             <StarRating rating={parseFloat(averageRating)} readOnly size="lg" />
                             <span className="text-sm text-text-muted">{averageRating} ({reviews.length} {t('reviews')})</span>
                         </div>
                     </div>

                     <div className="flex border-b border-border mb-6">
                         <button onClick={() => setViewCompanyTab('overview')} className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${viewCompanyTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-heading'}`}>Overview</button>
                         <button onClick={() => setViewCompanyTab('services')} className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${viewCompanyTab === 'services' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-heading'}`}>Services</button>
                         <button onClick={() => setViewCompanyTab('reviews')} className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${viewCompanyTab === 'reviews' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-heading'}`}>Reviews</button>
                     </div>

                     {viewCompanyTab === 'overview' && (
                         <div className="grid md:grid-cols-3 gap-8 animate-fade-in">
                             <div className="md:col-span-2 space-y-8">
                                 <div>
                                     <h3 className="font-bold text-lg text-text-heading mb-3">About Us</h3>
                                     <p className="text-text-base leading-relaxed">{company.description?.[language]}</p>
                                 </div>
                                 
                                 {company.branches?.length > 0 && (
                                     <div>
                                         <h3 className="font-bold text-lg text-text-heading mb-3">Main Branch</h3>
                                         <div className="bg-surface p-4 rounded-xl border border-border flex items-start gap-4">
                                             <div className="p-3 bg-primary/10 rounded-lg text-primary"><BuildingLibraryIcon className="w-6 h-6"/></div>
                                             <div>
                                                 <h4 className="font-bold text-text-heading">{company.branches[0].city?.[language]}</h4>
                                                 <p className="text-text-muted text-sm mt-1">{company.branches[0].address?.[language]}</p>
                                                 <div className="flex items-center gap-4 mt-3 text-sm text-text-muted">
                                                     <span className="flex items-center gap-1"><ClockIcon className="w-4 h-4"/> {company.branches[0].workingHours?.[language]}</span>
                                                 </div>
                                             </div>
                                         </div>
                                     </div>
                                 )}
                             </div>
                             <div className="space-y-6">
                                 <Card className="bg-surface border border-border shadow-none">
                                     <CardContent className="p-6 space-y-4">
                                         <h3 className="font-bold text-lg text-text-heading">Contact Info</h3>
                                         <a href={`mailto:${company.contact?.email}`} className="flex items-center gap-3 text-text-base hover:text-primary transition-colors">
                                             <div className="p-2 bg-primary/5 rounded-full text-primary"><EnvelopeIcon className="w-4 h-4"/></div>
                                             <span className="text-sm font-medium truncate">{company.contact?.email}</span>
                                         </a>
                                         <div className="flex items-center gap-3 text-text-base">
                                             <div className="p-2 bg-primary/5 rounded-full text-primary"><PhoneIcon className="w-4 h-4"/></div>
                                             <span className="text-sm font-medium">{company.contact?.phone}</span>
                                         </div>
                                         <Button className="w-full mt-2">{t('contactCompany')}</Button>
                                     </CardContent>
                                 </Card>
                                 
                                 <div>
                                     <h3 className="font-bold text-sm text-text-muted uppercase tracking-wider mb-3">Operating Ports</h3>
                                     <div className="flex flex-wrap gap-2">
                                         {company.ports?.map(port => (
                                             <span key={port} className="px-3 py-1 bg-surface border border-border rounded-full text-xs font-medium text-text-base flex items-center gap-1">
                                                 <ShipIcon className="w-3 h-3 text-text-muted"/> {port}
                                             </span>
                                         ))}
                                     </div>
                                 </div>
                             </div>
                         </div>
                     )}
                     
                     {viewCompanyTab === 'services' && (
                         <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
                             {company.serviceAreas && Object.entries(company.serviceAreas).map(([key, area]) => {
                                 const serviceArea = area as { en: string; ar: string; locations: string[] };
                                 return (
                                 <div key={key} className="p-6 rounded-xl border border-border bg-surface hover:border-primary/50 transition-colors">
                                     <h3 className="font-bold text-lg text-text-heading mb-2">{serviceArea?.[language]}</h3>
                                     <ul className="space-y-2">
                                         {serviceArea?.locations?.map((loc) => (
                                             <li key={loc} className="flex items-center gap-2 text-sm text-text-muted">
                                                 <CheckCircleIcon className="w-4 h-4 text-green-500" /> {loc}
                                             </li>
                                         ))}
                                     </ul>
                                 </div>
                             )})}
                         </div>
                     )}

                     {viewCompanyTab === 'reviews' && (
                         <div className="space-y-8 animate-fade-in">
                             <div className="flex items-center justify-between bg-surface p-6 rounded-xl border border-border">
                                 <div>
                                     <h3 className="text-xl font-bold text-text-heading">{t('reviews')}</h3>
                                     <p className="text-text-muted text-sm">What people are saying about {company.name?.[language]}</p>
                                 </div>
                                 <div className="text-center">
                                     <span className="text-4xl font-bold text-text-heading block">{averageRating}</span>
                                     <StarRating rating={parseFloat(averageRating)} readOnly />
                                     <span className="text-xs text-text-muted mt-1 block">Based on {reviews.length} reviews</span>
                                 </div>
                             </div>

                             {currentUser ? (
                                 <div className="bg-surface p-6 rounded-xl border border-border">
                                     <h4 className="font-bold text-lg text-text-heading mb-4">{t('writeReview')}</h4>
                                     <form onSubmit={handleSubmitReview} className="space-y-4">
                                         <div>
                                             <label className="block text-sm font-medium text-text-muted mb-1">{t('yourRating')}</label>
                                             <StarRating rating={newReview.score} onRate={handleRate} size="lg" />
                                         </div>
                                         <div>
                                             <label className="block text-sm font-medium text-text-muted mb-1">{t('reviews')}</label>
                                             <Textarea 
                                                 value={newReview.comment} 
                                                 onChange={e => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                                                 placeholder={t('ratingCommentPlaceholder')}
                                                 rows={3}
                                             />
                                         </div>
                                         <Button type="submit" disabled={isSubmittingReview || newReview.score === 0}>
                                             {isSubmittingReview ? <Spinner className="mr-2"/> : null}
                                             {t('submitReview')}
                                         </Button>
                                     </form>
                                 </div>
                             ) : (
                                 <div className="text-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                     <p className="text-text-muted mb-2">{t('loginToView')}</p>
                                 </div>
                             )}

                             <div className="space-y-6">
                                 {reviews.length === 0 ? (
                                     <p className="text-center text-text-muted py-4">{t('noRatingsYet')}</p>
                                 ) : (
                                     reviews.map((review, i) => (
                                         <div key={i} className="border-b border-border/50 pb-6 last:border-0">
                                             <div className="flex justify-between items-start mb-2">
                                                 <div className="flex items-center gap-3">
                                                     <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
                                                         {review.userName ? review.userName.charAt(0).toUpperCase() : 'U'}
                                                     </div>
                                                     <div>
                                                         <h4 className="font-bold text-text-heading text-sm">{review.userName || 'Anonymous'}</h4>
                                                         <span className="text-xs text-text-muted">{new Date(review.date || Date.now()).toLocaleDateString()}</span>
                                                     </div>
                                                 </div>
                                                 <StarRating rating={review.score} readOnly size="sm" />
                                             </div>
                                             {review.comment && <p className="text-text-base text-sm leading-relaxed pl-13">{review.comment}</p>}
                                         </div>
                                     ))
                                 )}
                             </div>
                         </div>
                     )}
                 </div>
             </Card>
         </div>
    );
};
