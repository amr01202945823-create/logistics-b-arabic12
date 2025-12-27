
import React from 'react';
import { useLocalization } from '../localization';
import { Card, CardContent } from '../components/ui';

export const TermsPage: React.FC = () => {
    const { t, language } = useLocalization();

    const arabicContent = (
        <div className="prose prose-slate max-w-none text-right" dir="rtl">
            <p><strong>مقدمة</strong></p>
            <p>مرحباً بك في <strong>Logistics B Arabc</strong>. بمجرد استخدامك لهذا الموقع/التطبيق، فإنك توافق على الالتزام بالشروط والأحكام التالية. إذا كنت لا توافق على أي من هذه البنود، يرجى التوقف عن استخدام خدماتنا.</p>

            <h3>1. شروط الاستخدام</h3>
            <ul>
                <li>يجب أن يكون عمرك 18 عاماً أو أكثر لاستخدام خدماتنا، أو الحصول على موافقة ولي الأمر.</li>
                <li>تتعهد باستخدام الموقع لأغراض قانونية فقط، وعدم استخدامه في أي نشاط يخرق القوانين أو حقوق الآخرين.</li>
                <li>أنت مسؤول عن الحفاظ على سرية بيانات حسابك وكلمة المرور الخاصة بك.</li>
            </ul>

            <h3>2. حقوق الملكية الفكرية</h3>
            <p>جميع المحتويات الموجودة على هذا الموقع/التطبيق (بما في ذلك النصوص، الشعارات، الصور، البرمجيات) هي ملكية حصرية لـ <strong>Logistics B Arabc</strong> ومحمية بموجب قوانين الملكية الفكرية. يُمنع نسخ أو إعادة نشر أو توزيع أي جزء من المحتوى دون إذن كتابي مسبق.</p>

            <h3>3. إنهاء الخدمة</h3>
            <p>نحتفظ بالحق في تعليق أو إنهاء حسابك ومنعك من استخدام خدماتنا في أي وقت ودون سابق إنذار في حال انتهاكك لهذه الشروط والأحكام أو في حال الاشتباه بنشاط احتيالي.</p>

            <h3>4. إخلاء المسؤولية (Disclaimer)</h3>
            <p>يتم تقديم خدماتنا "كما هي" دون أي ضمانات من أي نوع، سواء كانت صريحة أو ضمنية. لا نضمن أن الخدمة ستكون خالية من الأخطاء أو الانقطاعات. نحن غير مسؤولين عن أي أضرار مباشرة أو غير مباشرة قد تنجم عن استخدامك للموقع.</p>

            <h3>5. التعويض</h3>
            <p>أنت توافق على تعويض <strong>Logistics B Arabc</strong> ومدرائه وموظفيه عن أي خسائر أو أضرار أو نفقات (بما في ذلك الرسوم القانونية) تنشأ عن مخالفتك لهذه الشروط أو إساءة استخدامك للخدمة.</p>

            <h3>6. القانون الواجب التطبيق</h3>
            <p>تخضع هذه الشروط والأحكام وتفسر وفقاً لقوانين <strong>جمهورية مصر العربية</strong>، وتخضع أي نزاعات للاختصاص القضائي الحصري لمحاكم تلك الدولة.</p>
        </div>
    );

    const englishContent = (
        <div className="prose prose-slate max-w-none text-left" dir="ltr">
            <p><strong>Introduction</strong></p>
            <p>Welcome to <strong>Logistics B Arabc</strong>. By using this website/application, you agree to comply with the following terms and conditions. If you do not agree with any of these terms, please stop using our services.</p>

            <h3>1. Terms of Use</h3>
            <ul>
                <li>You must be 18 years of age or older to use our services, or have obtained parental consent.</li>
                <li>You agree to use the site for lawful purposes only, and not to use it for any activity that violates laws or the rights of others.</li>
                <li>You are responsible for maintaining the confidentiality of your account information and password.</li>
            </ul>

            <h3>2. Intellectual Property Rights</h3>
            <p>All content on this website/application (including text, logos, images, software) is the exclusive property of <strong>Logistics B Arabc</strong> and is protected by intellectual property laws. Copying, republishing, or distributing any part of the content without prior written permission is prohibited.</p>

            <h3>3. Termination of Service</h3>
            <p>We reserve the right to suspend or terminate your account and prevent you from using our services at any time and without prior notice if you violate these terms and conditions or if fraudulent activity is suspected.</p>

            <h3>4. Disclaimer</h3>
            <p>Our services are provided "as is" without warranties of any kind, whether express or implied. We do not guarantee that the service will be free from errors or interruptions. We are not liable for any direct or indirect damages that may result from your use of the site.</p>

            <h3>5. Indemnification</h3>
            <p>You agree to indemnify <strong>Logistics B Arabc</strong>, its directors, and employees against any losses, damages, or expenses (including legal fees) arising from your violation of these terms or misuse of the service.</p>

            <h3>6. Governing Law</h3>
            <p>These terms and conditions are governed by and construed in accordance with the laws of <strong>The Arab Republic of Egypt</strong>, and any disputes are subject to the exclusive jurisdiction of the courts of that country.</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold text-text-heading mb-8 text-center">{t('termsAndConditions')}</h1>
            <Card className="card-shadow">
                <CardContent className="p-8">
                    {language === 'ar' ? arabicContent : englishContent}
                </CardContent>
            </Card>
        </div>
    );
};
