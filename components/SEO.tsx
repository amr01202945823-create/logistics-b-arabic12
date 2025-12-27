
import React, { useEffect } from 'react';
import { useLocalization } from '../localization';

interface SEOProps {
  titleKey: string;
  descriptionKey: string;
  keywords?: string[];
  image?: string;
  type?: 'website' | 'article' | 'product' | 'profile';
  schema?: Record<string, any>;
  canonicalUrl?: string;
  robots?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}

export const SEO: React.FC<SEOProps> = ({ 
  titleKey, 
  descriptionKey, 
  keywords, 
  image, 
  type = 'website', 
  schema,
  canonicalUrl,
  robots = 'index, follow',
  publishedTime,
  modifiedTime,
  author
}) => {
  const { t, language } = useLocalization();
  
  // Fallback to English if translation is missing, or use key as is
  const title = t(titleKey);
  const description = t(descriptionKey);
  const siteName = "Logistics B Arabc";
  const fullTitle = `${title} | ${siteName}`;
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const defaultImage = "https://images.unsplash.com/photo-1586528116311-069242136d1f?w=800&q=80"; // Fallback logistics image
  const effectiveImage = image || defaultImage;
  const effectiveCanonical = canonicalUrl || currentUrl.split('?')[0]; // Default to current URL without query params

  useEffect(() => {
    // 1. Update Title
    document.title = fullTitle;

    // Helper to update or create meta tags
    const updateMeta = (name: string, content: string, attribute: 'name' | 'property' = 'name') => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper to update or create link tags
    const updateLink = (rel: string, href: string) => {
        let element = document.querySelector(`link[rel="${rel}"]`);
        if (!element) {
            element = document.createElement('link');
            element.setAttribute('rel', rel);
            document.head.appendChild(element);
        }
        element.setAttribute('href', href);
    };

    // 2. Basic Meta Tags
    updateMeta('description', description);
    updateMeta('robots', robots);
    if (keywords && keywords.length > 0) {
        updateMeta('keywords', keywords.join(', '));
    }
    updateMeta('author', author || siteName);

    // 3. Open Graph / Social Media
    updateMeta('og:title', fullTitle, 'property');
    updateMeta('og:description', description, 'property');
    updateMeta('og:type', type, 'property');
    updateMeta('og:url', effectiveCanonical, 'property');
    updateMeta('og:image', effectiveImage, 'property');
    updateMeta('og:site_name', siteName, 'property');
    updateMeta('og:locale', language === 'ar' ? 'ar_AR' : 'en_US');

    // 4. Twitter Card
    updateMeta('twitter:card', 'summary_large_image', 'name');
    updateMeta('twitter:title', fullTitle, 'name');
    updateMeta('twitter:description', description, 'name');
    updateMeta('twitter:image', effectiveImage, 'name');

    // 5. Article Specifics
    if (type === 'article' && publishedTime) {
        updateMeta('article:published_time', publishedTime, 'property');
    }
    if (type === 'article' && modifiedTime) {
        updateMeta('article:modified_time', modifiedTime, 'property');
    }
    if (type === 'article' && author) {
        updateMeta('article:author', author, 'property');
    }

    // 6. Canonical URL
    updateLink('canonical', effectiveCanonical);

  }, [fullTitle, description, keywords, effectiveImage, type, effectiveCanonical, language, robots, publishedTime, modifiedTime, author]);

  // 7. JSON-LD Structured Data
  useEffect(() => {
      if (!schema) return;

      const scriptId = 'json-ld-schema';
      let script = document.getElementById(scriptId);
      
      if (!script) {
          script = document.createElement('script');
          script.id = scriptId;
          script.setAttribute('type', 'application/ld+json');
          document.head.appendChild(script);
      }

      script.textContent = JSON.stringify(schema);

      return () => {
          // Cleanup schema when component unmounts or changes to prevent pollution
          const el = document.getElementById(scriptId);
          if (el) el.textContent = '';
      };
  }, [schema]);

  return null;
};
