import React, { useState } from 'react';
import { useLocalization } from '../localization';
import { Button, Card, CardContent, CardHeader, Input, Textarea } from '../components/ui';
import { CheckCircleIcon, EnvelopeIcon, PhoneIcon } from '../components/icons';

export const ContactUsPage: React.FC = () => {
    const { t } = useLocalization();
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <div className="max-w-4xl mx-auto py-12">
            {submitted ? (
                <div className="text-center py-16">
                    <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-text-heading">{t('messageSent')}</h1>
                    <p className="text-text-muted mt-2">{t('messageSentDesc')}</p>
                </div>
            ) : (
                 <div className="grid md:grid-cols-2 gap-12 items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-text-heading">{t('contactFormTitle')}</h1>
                        <p className="text-text-muted mt-2 mb-8">{t('contactFormSubtitle')}</p>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-text-muted mb-1">{t('yourName')}</label>
                                <Input id="name" type="text" required />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-text-muted mb-1">{t('yourEmail')}</label>
                                <Input id="email" type="email" required />
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-text-muted mb-1">{t('message')}</label>
                                <Textarea id="message" required rows={5} />
                            </div>
                            <Button type="submit" className="w-full">{t('sendMessage')}</Button>
                        </form>
                    </div>
                    <div className="bg-primary-light p-8 rounded-lg">
                        <h2 className="text-2xl font-bold text-text-heading mb-6">{t('talkWithUs')}</h2>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <EnvelopeIcon className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                                <div>
                                    <h3 className="font-semibold text-text-heading">{t('emailSupportTitle')}</h3>
                                    <a href={`mailto:${t('emailAddress')}`} className="text-primary hover:underline">{t('emailAddress')}</a>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <PhoneIcon className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                                <div>
                                    <h3 className="font-semibold text-text-heading">{t('phoneSupportTitle')}</h3>
                                    <p className="text-text-muted">{t('phoneNumber')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
