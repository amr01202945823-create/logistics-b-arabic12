
import React, { useState } from 'react';
import type { Article, ArticleCategory } from '../types';
import { Button, Input, Textarea } from './ui';
import { CheckCircleIcon, XIcon } from './icons';

interface ArticleFormProps {
    initialData: Article | null;
    onSubmit: (article: Article) => void;
    onCancel: () => void;
}

export const ArticleForm: React.FC<ArticleFormProps> = ({ initialData, onSubmit, onCancel }) => {
    const defaultArticle: Article = {
        id: Date.now(),
        category: 'news',
        title: { ar: '', en: '' },
        summary: { ar: '', en: '' },
        content: { ar: '', en: '' },
        imageUrl: 'https://images.unsplash.com/photo-1586528116311-069242136d1f?w=800&auto=format&fit=crop&q=60',
        date: { ar: new Date().toLocaleDateString('ar-EG'), en: new Date().toLocaleDateString('en-US') }
    };

    const [formData, setFormData] = useState<Article>(() => {
        if (!initialData) return defaultArticle;
        return {
            ...defaultArticle,
            ...initialData,
            title: { ...defaultArticle.title, ...(initialData.title || {}) },
            summary: { ...defaultArticle.summary, ...(initialData.summary || {}) },
            content: { ...defaultArticle.content, ...(initialData.content || {}) },
        };
    });

    const handleNestedChange = (parent: 'title' | 'summary' | 'content', key: 'ar' | 'en', value: string) => {
        setFormData(prev => ({ ...prev, [parent]: { ...prev[parent], [key]: value } }));
    };

    const categories: ArticleCategory[] = [
        'news', 'sea-freight', 'customs', 'ports', 'logistics-tech', 
        'warehousing', 'global-trade', 'financial', 'educational', 'laws-and-regulations'
    ];

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Category</label>
                    <select 
                        value={formData.category} 
                        onChange={(e) => setFormData({...formData, category: e.target.value as ArticleCategory})}
                        className="w-full h-11 px-4 rounded-lg border border-border bg-background text-text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat.replace('-', ' ').toUpperCase()}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Publish Date (EN)</label>
                    <Input 
                        value={formData.date?.en} 
                        onChange={e => setFormData({ ...formData, date: { ...formData.date, en: e.target.value, ar: e.target.value } as any })} 
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Cover Image URL</label>
                <div className="flex gap-4 items-start">
                    <div className="flex-grow">
                        <Input 
                            placeholder="https://..." 
                            value={formData.imageUrl} 
                            onChange={e => setFormData({...formData, imageUrl: e.target.value})} 
                        />
                    </div>
                    <div className="w-16 h-11 bg-gray-100 rounded-lg overflow-hidden border border-border flex-shrink-0">
                        {formData.imageUrl && <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Preview" />}
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* English Section */}
                <div className="space-y-4 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
                    <h4 className="font-bold text-sm text-blue-600 dark:text-blue-400 uppercase flex items-center gap-2">
                        <span>🇬🇧 English Content</span>
                    </h4>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
                        <Input value={formData.title.en} onChange={e => handleNestedChange('title', 'en', e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Summary</label>
                        <Textarea value={formData.summary.en} onChange={e => handleNestedChange('summary', 'en', e.target.value)} rows={3} required />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Content (Markdown)</label>
                        <Textarea value={formData.content.en} onChange={e => handleNestedChange('content', 'en', e.target.value)} rows={10} required className="font-mono text-sm" />
                    </div>
                </div>

                {/* Arabic Section */}
                <div className="space-y-4 p-4 bg-green-50/50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/30" dir="rtl">
                    <h4 className="font-bold text-sm text-green-600 dark:text-green-400 uppercase flex items-center gap-2">
                        <span>🇪🇬 المحتوى العربي</span>
                    </h4>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">العنوان</label>
                        <Input value={formData.title.ar} onChange={e => handleNestedChange('title', 'ar', e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">الملخص</label>
                        <Textarea value={formData.summary.ar} onChange={e => handleNestedChange('summary', 'ar', e.target.value)} rows={3} required />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">المحتوى (Markdown)</label>
                        <Textarea value={formData.content.ar} onChange={e => handleNestedChange('content', 'ar', e.target.value)} rows={10} required className="font-mono text-sm" />
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-border">
                <Button type="button" variant="secondary" onClick={onCancel}>
                    <XIcon className="w-4 h-4 me-2"/> Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 text-white px-8 hover:bg-blue-700">
                    <CheckCircleIcon className="w-4 h-4 me-2"/> Save Article
                </Button>
            </div>
        </form>
    );
};
