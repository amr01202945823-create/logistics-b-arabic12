
import React, { useState, useEffect } from 'react';
import { useLocalization } from '../localization';
import { Button, Card, CardContent, CardHeader, Input, Spinner } from '../components/ui';
import { login, loginWithGoogle } from '../services/authService';
import type { User } from '../types';
import { GoogleIcon, ShieldCheckIcon } from '../components/icons';

interface LoginPageProps {
    onLoginSuccess: (user: User) => void;
    onNavigateToRegister: () => void;
}

declare global {
    interface Window {
        google: any;
    }
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onNavigateToRegister }) => {
    const { t, language } = useLocalization();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [view, setView] = useState<'login' | 'forgotPassword'>('login');
    const [resetSent, setResetSent] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            const user = await login(email, password, rememberMe);
            if (user) {
                onLoginSuccess(user);
            }
        } catch (err: any) {
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDemoAdminLogin = async () => {
        setIsSubmitting(true);
        setError('');
        try {
            // Auto-login with the hardcoded admin credentials
            const user = await login('admin@logisticsbarab.com', 'admin', true);
            if (user) {
                onLoginSuccess(user);
            }
        } catch (err: any) {
            setError(err.message || 'Demo login failed.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleLogin = () => {
        setIsGoogleLoading(true);
        setError('');
        
        if (window.google && process.env.REACT_APP_GOOGLE_CLIENT_ID) {
            try {
                const client = window.google.accounts.oauth2.initTokenClient({
                    client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
                    scope: 'email profile',
                    callback: (response: any) => {
                        if (response.access_token) {
                            fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                                headers: { Authorization: `Bearer ${response.access_token}` }
                            })
                            .then(res => res.json())
                            .then(userInfo => {
                                 const user: User = {
                                    id: userInfo.sub,
                                    name: userInfo.name,
                                    email: userInfo.email,
                                    subscription: 'free'
                                };
                                setIsGoogleLoading(false);
                                onLoginSuccess(user);
                            })
                            .catch(err => {
                                console.error(err);
                                setIsGoogleLoading(false);
                                setError('Google Login failed.');
                            });
                        } else {
                            setIsGoogleLoading(false);
                        }
                    },
                });
                client.requestAccessToken();
            } catch (error) {
                console.warn("Google Auth SDK failed, falling back to simulation.", error);
                simulateLogin();
            }
        } else {
            simulateLogin();
        }
    };

    const simulateLogin = () => {
        setTimeout(() => {
            const user = loginWithGoogle();
            setIsGoogleLoading(false);
            onLoginSuccess(user);
        }, 1500);
    };

    const handleResetSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            setTimeout(() => setResetSent(true), 500);
        }
    };

    if (view === 'forgotPassword') {
        return (
            <div className="flex justify-center items-center py-12 animate-fade-in">
                <Card className="w-full max-w-md card-shadow">
                    <CardHeader className="text-center">
                        <h1 className="text-2xl font-bold text-text-heading">{t('resetPassword')}</h1>
                        <p className="text-text-muted">{t('enterEmailToReset')}</p>
                    </CardHeader>
                    <CardContent>
                        {resetSent ? (
                            <div className="text-center space-y-6 animate-slide-up">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                </div>
                                <p className="text-lg font-medium text-text-heading">{t('resetEmailSent')}</p>
                                <Button variant="secondary" onClick={() => { setView('login'); setResetSent(false); }} className="w-full">{t('backToLogin')}</Button>
                            </div>
                        ) : (
                            <form onSubmit={handleResetSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="reset-email" className="block text-sm font-medium text-text-muted mb-1">{t('email')}</label>
                                    <Input id="reset-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
                                </div>
                                <Button type="submit" className="w-full">{t('sendResetLink')}</Button>
                                <button type="button" onClick={() => setView('login')} className="w-full text-sm text-text-muted hover:text-primary transition-colors">
                                    {t('backToLogin')}
                                </button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center py-12 animate-fade-in">
            <Card className="w-full max-w-md card-shadow border border-border">
                <CardHeader className="text-center">
                    <h1 className="text-2xl font-bold text-text-heading">{t('loginWelcome')}</h1>
                    <p className="text-text-muted">{t('loginSubtext')}</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && <p className="text-red-600 text-sm text-center bg-red-50 p-3 rounded border border-red-100">{error}</p>}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-text-muted mb-1">{t('email')}</label>
                            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={isSubmitting} />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-text-muted mb-1">{t('password')}</label>
                            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required disabled={isSubmitting} />
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={rememberMe} 
                                    onChange={e => setRememberMe(e.target.checked)} 
                                    className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4" 
                                />
                                <span className="text-sm text-text-muted">{t('rememberMe')}</span>
                            </label>
                            <button type="button" onClick={() => setView('forgotPassword')} className="text-sm font-medium text-primary hover:underline">
                                {t('forgotPassword')}
                            </button>
                        </div>

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? <Spinner className="w-5 h-5 mx-auto" /> : t('login')}
                        </Button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white dark:bg-slate-900 text-text-muted">{t('or')}</span>
                        </div>
                    </div>

                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleGoogleLogin} 
                        disabled={isGoogleLoading || isSubmitting}
                        className="w-full flex items-center justify-center gap-2 relative overflow-hidden transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                        {isGoogleLoading ? (
                            <Spinner className="w-5 h-5" />
                        ) : (
                            <>
                                <GoogleIcon className="w-5 h-5" />
                                {t('loginWithGoogle')}
                            </>
                        )}
                    </Button>

                    {/* DEMO ADMIN LOGIN BUTTON */}
                    <div className="mt-6 pt-4 border-t border-border bg-slate-50 dark:bg-slate-800/50 -mx-6 -mb-6 p-4 rounded-b-xl">
                        <p className="text-xs text-center text-text-muted mb-3 font-semibold uppercase tracking-wider">
                            {language === 'ar' ? 'للمطورين / تجربة المسؤول' : 'Developer / Admin Demo'}
                        </p>
                        <Button 
                            type="button" 
                            onClick={handleDemoAdminLogin} 
                            disabled={isSubmitting}
                            className="w-full bg-slate-800 text-white hover:bg-slate-900 border border-slate-700 shadow-lg flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? <Spinner className="w-4 h-4" /> : <ShieldCheckIcon className="w-4 h-4 text-green-400" />}
                            {language === 'ar' ? 'دخول سريع: مدير النظام' : 'Quick Login: Super Admin'}
                        </Button>
                    </div>

                    <p className="text-center text-sm text-text-muted mt-6">
                        {t('dontHaveAccount')} <button type="button" onClick={onNavigateToRegister} className="font-semibold text-primary hover:underline">{t('signup')}</button>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};
