
import React, { useState } from 'react';
import { useLocalization } from '../localization';
import { getHSCode } from '../services/geminiService';
import { Button, Card, CardContent, Input, Spinner } from '../components/ui';
import { SearchIcon, ClipboardDocumentCheckIcon } from '../components/icons';

export const HSCodeFinderPage: React.FC<{ systemPromptOverride?: string }> = ({ systemPromptOverride }) => {
    const { t, language } = useLocalization();
    const [description, setDescription] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!description.trim()) return;
        setLoading(true);
        setSuggestions([]);
        try {
            const result = await getHSCode(description, language, systemPromptOverride);
            const parsed = JSON.parse(result);
            if (parsed.suggestions) {
                setSuggestions(parsed.suggestions);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                    <SearchIcon className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-bold text-text-heading">{t('hsCodeFinder')}</h2>
                <p className="text-text-muted mt-2 max-w-lg mx-auto">{t('hsCodeFinderDesc')}</p>
            </div>

            <Card className="card-shadow overflow-visible">
                <CardContent className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-grow">
                            <SearchIcon className="absolute top-1/2 -translate-y-1/2 left-4 w-5 h-5 text-text-muted" />
                            <Input 
                                value={description} 
                                onChange={e => setDescription(e.target.value)} 
                                placeholder={t('productDescription')} 
                                className="pl-12 h-12 text-lg"
                                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <Button onClick={handleSearch} disabled={loading || !description} className="h-12 px-8 text-lg bg-blue-600 hover:bg-blue-700 text-white">
                            {loading ? <Spinner /> : t('findHSCode')}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {suggestions.length > 0 && (
                <div className="mt-8 grid gap-4 animate-fade-in">
                    <h3 className="text-lg font-bold text-text-heading px-2">{t('hsCodeSuggestions')}</h3>
                    {suggestions.map((s, idx) => (
                        <Card key={idx} className="card-shadow-hover border-l-4 border-blue-600">
                            <CardContent className="flex flex-col md:flex-row justify-between md:items-center gap-4 p-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-2xl font-mono font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">{s.code}</span>
                                        <span className="text-lg font-semibold text-text-heading">{s.itemName}</span>
                                    </div>
                                    <p className="text-text-muted">{s.description}</p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(`${s.code} - ${s.itemName}`)}>
                                    <ClipboardDocumentCheckIcon className="w-5 h-5" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
