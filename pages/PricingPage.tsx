
import React, { useState } from 'react';
import { useLocalization } from '../localization';
import { Button, Card, CardContent, Spinner } from '../components/ui';
import { CheckCircleIcon } from '../components/icons';
import type { User, Section } from '../types';
import { initiateSubscription } from '../services/paymentService';

interface PricingPageProps {
    user: User | null;
    onNavigate: (section: Section) => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ user, onNavigate }) => {
    const { t, language } = useLocalization();
    const [loadingPlan, setLoadingPlan] = useState<'monthly' | 'yearly' | null>(null);

    const handleSubscribeClick = async (plan: 'monthly' | 'yearly') => {
        if (!user) {
            onNavigate('register');
            return;
        }

        setLoadingPlan(plan);
        
        // Call backend to get payment URL
        const paymentUrl = await initiateSubscription(user, plan);
        
        setLoadingPlan(null);

        if (paymentUrl) {
            // Open Paymob iframe/page
            window.open(paymentUrl, '_blank');
        } else {
            // Fallback for demo/mock environment if backend isn't running
            alert(language === 'ar' 
                ? 'عذراً، لا يمكن الاتصال بخادم الدفع حالياً (Backend offline). هذا النموذج توضيحي.' 
                : 'Sorry, cannot connect to payment server (Backend offline). This is a demo.');
        }
    };

    const features = [
        t('feature1'), t('feature2'), t('feature3'), t('feature4'), t('feature5')
    ];

    const PlanCard: React.FC<{
        plan: 'monthly' | 'yearly';
        isPopular?: boolean;
    }> = ({ plan, isPopular }) => {
        const isMonthly = plan === 'monthly';
        const price = isMonthly ? t('monthlyPrice') : t('yearlyPrice');
        const period = isMonthly ? t('perMonth') : t('perYear');
        const billing = isMonthly ? t('billedMonthly') : t('billedYearly');
        const title = isMonthly ? t('monthlyPlan') : t('yearlyPlan');
        const isLoading = loadingPlan === plan;
        
        return (
            <Card className={`card-shadow relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${isPopular ? 'border-2 border-primary' : ''}`}>
                {isPopular && (
                    <div className={`absolute top-0 ${language === 'ar' ? 'left-0 rounded-br-lg' : 'right-0 rounded-bl-lg'} bg-primary text-white text-xs font-bold px-4 py-1 `}>{t('mostPopular')}</div>
                )}
                <CardContent className="p-8 text-center">
                    <h3 className="text-2xl font-bold text-text-heading">{title}</h3>
                    <p className="mt-4">
                        <span className="text-5xl font-extrabold text-text-heading">{price}</span>
                        <span className="text-lg font-medium text-text-muted"> {t('currency')}{period}</span>
                    </p>
                    <p className="text-sm text-text-muted mt-2">{billing}</p>
                    {!isMonthly && <p className="text-sm font-bold text-green-600 mt-1">{t('savePrice')} 20%</p>}
                    
                    <Button 
                        onClick={() => handleSubscribeClick(plan)} 
                        className="w-full mt-6 py-3 font-bold text-base"
                        disabled={isLoading}
                    >
                        {isLoading ? <Spinner /> : t('subscribeNow')}
                    </Button>

                    <div className="mt-8 text-left">
                        <p className="font-semibold text-text-base">{t('planFeatures')}</p>
                        <ul className="mt-4 space-y-3">
                            {features.map((feature, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"/>
                                    <span className="text-text-muted">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="max-w-4xl mx-auto py-12">
            <div className="text-center">
                <h1 className={`text-4xl font-extrabold text-text-heading ${language === 'ar' ? 'font-cairo' : 'font-inter'}`}>{t('pricing')}</h1>
                <p className="mt-4 text-lg text-text-muted max-w-2xl mx-auto">{t('pricingSubtitle')}</p>
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <PlanCard plan="monthly" />
                <PlanCard plan="yearly" isPopular />
            </div>
        </div>
    );
};
