
import React, { useState } from 'react';
import { useLocalization } from '../localization';
import { Button, Card, CardContent, CardHeader, Input, Spinner } from '../components/ui';
import { register } from '../services/authService';
import type { User } from '../types';

interface RegisterPageProps {
    onRegisterSuccess: (user: User) => void;
    onNavigateToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onRegisterSuccess, onNavigateToLogin }) => {
    const { t } = useLocalization();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        setIsSubmitting(true);
        try {
            const user = await register(name, email, password);
            if (user) {
                onRegisterSuccess(user);
            }
        } catch (err: any) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex justify-center items-center py-12 animate-fade-in">
            <Card className="w-full max-w-md card-shadow">
                <CardHeader className="text-center">
                    <h1 className="text-2xl font-bold text-text-heading">{t('registerWelcome')}</h1>
                    <p className="text-text-muted">{t('registerSubtext')}</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && <p className="text-red-600 text-sm text-center bg-red-50 p-3 rounded border border-red-100">{error}</p>}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-text-muted mb-1">{t('name')}</label>
                            <Input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required disabled={isSubmitting} />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-text-muted mb-1">{t('email')}</label>
                            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={isSubmitting} />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-text-muted mb-1">{t('password')}</label>
                            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required disabled={isSubmitting} />
                        </div>
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? <Spinner className="w-5 h-5 mx-auto" /> : t('createAccount')}
                        </Button>
                        <p className="text-center text-sm text-text-muted">
                            {t('alreadyHaveAccount')} <button type="button" onClick={onNavigateToLogin} className="font-semibold text-primary hover:underline">{t('login')}</button>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};
