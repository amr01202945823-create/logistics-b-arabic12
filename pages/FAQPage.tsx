
import React, { useState } from 'react';
import { useLocalization } from '../localization';
import { Card, CardContent } from '../components/ui';
import { ChevronDownIcon } from '../components/icons';

interface FAQItem {
    question: { ar: string; en: string };
    answer: { ar: string; en: string };
}

const FAQ_ITEMS: FAQItem[] = [
    {
        question: { ar: 'ما هي طبيعة الخدمات التي يقدمها Logistics B Arabc؟', en: 'What services does Logistics B Arabc provide?' },
        answer: { 
            ar: 'نحن منصة متخصصة في الخدمات اللوجستية البحرية والمعلومات التجارية، حيث نسعى لتوفير تجربة سهلة وموثوقة لعملائنا للحصول على أدوات حساب الشحن، تتبع الحاويات، ودليل شامل للشركات.', 
            en: 'We are a platform specialized in maritime logistics and trade intelligence, striving to provide a seamless and reliable experience for our customers to access shipping calculation tools, container tracking, and a comprehensive business directory.' 
        }
    },
    {
        question: { ar: 'كيف يمكنني إنشاء حساب جديد؟', en: 'How can I create a new account?' },
        answer: { 
            ar: 'يمكنك إنشاء حساب بسهولة عن طريق النقر على زر "حساب جديد" في الصفحة الرئيسية، وملء البيانات المطلوبة مثل الاسم والبريد الإلكتروني، وتعيين كلمة مرور.', 
            en: 'You can easily create an account by clicking the "Register" button on the homepage, filling in the required details such as name and email, and setting a password.' 
        }
    },
    {
        question: { ar: 'لقد نسيت كلمة المرور، ماذا أفعل؟', en: 'I forgot my password, what should I do?' },
        answer: { 
            ar: 'لا تقلق، يمكنك استعادة كلمة المرور بالضغط على رابط "نسيت كلمة المرور" في صفحة تسجيل الدخول. سنقوم بإرسال تعليمات إعادة تعيين كلمة المرور إلى بريدك الإلكتروني المسجل لدينا.', 
            en: 'Don\'t worry, you can recover your password by clicking the "Forgot Password" link on the login page. We will send password reset instructions to your registered email.' 
        }
    },
    {
        question: { ar: 'ما هي وسائل الدفع المتاحة؟', en: 'What payment methods are available?' },
        answer: { 
            ar: 'نحن نقبل الدفع عبر: البطاقات الائتمانية (Visa/Mastercard) ومحافظ الهاتف المحمول. جميع معاملاتك المالية محمية ومشفرة بالكامل.', 
            en: 'We accept payments via: Credit Cards (Visa/Mastercard) and mobile wallets. All your financial transactions are fully protected and encrypted.' 
        }
    },
    {
        question: { ar: 'هل يمكنني إلغاء الاشتراك؟', en: 'Can I cancel my subscription?' },
        answer: { 
            ar: 'نعم، يمكنك إدارة وإلغاء اشتراكك من خلال صفحة "حسابي" تحت قسم "الباقة". سيستمر الاشتراك حتى نهاية الفترة المدفوعة.', 
            en: 'Yes, you can manage and cancel your subscription through the "Profile" page under the "Subscription" section. Access will continue until the end of the paid period.' 
        }
    },
    {
        question: { ar: 'هل بياناتي الشخصية آمنة معكم؟', en: 'Is my personal data safe with you?' },
        answer: { 
            ar: 'نحن نأخذ خصوصية بياناتك بجدية تامة. نستخدم أحدث تقنيات التشفير وبروتوكولات الأمان لحماية معلوماتك الشخصية والمالية ولا نشاركها مع أي أطراف غير مصرح لها.', 
            en: 'We take your data privacy very seriously. We use the latest encryption technologies and security protocols to protect your personal and financial information and do not share it with unauthorized parties.' 
        }
    },
    {
        question: { ar: 'كيف يمكنني التواصل مع الدعم الفني؟', en: 'How can I contact technical support?' },
        answer: { 
            ar: 'فريقنا جاهز لمساعدتك دائماً. يمكنك التواصل معنا عبر البريد الإلكتروني: support@logisticsbarab.com أو عبر صفحة "اتصل بنا" في الموقع، وسيتم الرد عليك خلال 24 ساعة.', 
            en: 'Our team is always ready to help. You can contact us via email: support@logisticsbarab.com or through the "Contact Us" page on the site, and we will respond within 24 hours.' 
        }
    }
];

export const FAQPage: React.FC = () => {
    const { t, language } = useLocalization();
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggleIndex = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold text-text-heading mb-8 text-center">{t('faq')}</h1>
            <div className="space-y-4">
                {FAQ_ITEMS.map((item, index) => (
                    <Card key={index} className="card-shadow overflow-hidden transition-all duration-300">
                        <button
                            onClick={() => toggleIndex(index)}
                            className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                        >
                            <span className={`font-bold text-lg ${openIndex === index ? 'text-primary' : 'text-text-heading'}`}>
                                {item.question[language]}
                            </span>
                            <ChevronDownIcon 
                                className={`w-5 h-5 text-text-muted transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`} 
                            />
                        </button>
                        <div 
                            className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96 opacity-100 pb-6' : 'max-h-0 opacity-0 pb-0'}`}
                        >
                            <p className="text-text-muted leading-relaxed">
                                {item.answer[language]}
                            </p>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};
