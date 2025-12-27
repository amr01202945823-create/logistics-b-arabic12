
import React from 'react';
import { useLocalization } from '../localization';
import { Card, CardContent } from '../components/ui';

export const PrivacyPolicyPage: React.FC = () => {
    const { t, language } = useLocalization();

    const arabicContent = (
        <div className="prose prose-slate max-w-none text-right" dir="rtl">
            <p><strong>تاريخ آخر تحديث:</strong> 25 أكتوبر 2023</p>
            <p>تلتزم إدارة <strong>Logistics B Arabc</strong> باحترام خصوصيتك وحماية بياناتك الشخصية. توضح سياسة الخصوصية هذه كيفية جمعنا واستخدامنا وحمايتنا للمعلومات التي تقدمها لنا عند استخدامك لموقعنا/تطبيقنا.</p>

            <h3>1. المعلومات التي نجمعها</h3>
            <p>قد نقوم بجمع نوعين من المعلومات:</p>
            <ul>
                <li><strong>المعلومات الشخصية:</strong> وهي البيانات التي تقدمها طواعية عند التسجيل أو الشراء، مثل: (الاسم، البريد الإلكتروني، رقم الهاتف، العنوان، وبيانات الدفع).</li>
                <li><strong>معلومات الاستخدام:</strong> بيانات تقنية يتم جمعها تلقائياً عند زيارتك، مثل: (عنوان IP، نوع الجهاز، نوع المتصفح، الصفحات التي زرتها، ووقت الزيارة).</li>
            </ul>

            <h3>2. كيف نستخدم بياناتك؟</h3>
            <p>نستخدم المعلومات التي نجمعها للأغراض التالية:</p>
            <ul>
                <li>تقديم خدماتنا وتحسين تجربتك كمستخدم.</li>
                <li>معالجة المعاملات المالية وإرسال الإشعارات المتعلقة بها.</li>
                <li>الرد على استفساراتك وتقديم الدعم الفني.</li>
                <li>إرسال رسائل ترويجية أو تحديثات (في حال موافقتك الصريحة على ذلك).</li>
            </ul>

            <h3>3. ملفات تعريف الارتباط (Cookies)</h3>
            <p>يستخدم موقعنا ملفات تعريف الارتباط وتقنيات تتبع مشابهة لتحسين أداء الموقع وتخصيص المحتوى وفقاً لاهتماماتك. يمكنك التحكم في إعدادات "الكوكيز" من خلال متصفحك، ولكن قد يؤثر ذلك على عمل بعض وظائف الموقع.</p>

            <h3>4. مشاركة البيانات مع أطراف ثالثة</h3>
            <p>نحن لا نقوم ببيع أو تأجير بياناتك الشخصية. قد نشارك بياناتك فقط مع:</p>
            <ul>
                <li>مزودي الخدمات الموثوقين (مثل بوابات الدفع الإلكتروني، وخدمات الاستضافة) لأغراض تشغيل الخدمة فقط.</li>
                <li>الجهات القانونية إذا كان ذلك مطلوباً بموجب القانون أو لحماية حقوقنا.</li>
            </ul>

            <h3>5. حقوقك كمستخدم</h3>
            <p>يحق لك في أي وقت:</p>
            <ul>
                <li>طلب الوصول إلى بياناتك الشخصية التي نحتفظ بها.</li>
                <li>طلب تصحيح أي بيانات غير دقيقة.</li>
                <li>طلب حذف بياناتك نهائياً من سجلاتنا (مع مراعاة الالتزامات القانونية للاحتفاظ ببعض السجلات).</li>
            </ul>

            <h3>6. أمن البيانات</h3>
            <p>نحن نطبق تدابير أمنية تقنية وإدارية مناسبة لحماية بياناتك من الوصول غير المصرح به أو التغيير أو الإفشاء.</p>
        </div>
    );

    const englishContent = (
        <div className="prose prose-slate max-w-none text-left" dir="ltr">
            <p><strong>Last Updated:</strong> October 25, 2023</p>
            <p>The management of <strong>Logistics B Arabc</strong> is committed to respecting your privacy and protecting your personal data. This Privacy Policy explains how we collect, use, and protect the information you provide to us when using our website/application.</p>

            <h3>1. Information We Collect</h3>
            <p>We may collect two types of information:</p>
            <ul>
                <li><strong>Personal Information:</strong> Data you provide voluntarily upon registration or purchase, such as: (Name, Email, Phone Number, Address, and Payment Data).</li>
                <li><strong>Usage Information:</strong> Technical data collected automatically when you visit, such as: (IP address, device type, browser type, pages visited, and time of visit).</li>
            </ul>

            <h3>2. How We Use Your Data</h3>
            <p>We use the information we collect for the following purposes:</p>
            <ul>
                <li>To provide our services and improve your user experience.</li>
                <li>To process financial transactions and send related notifications.</li>
                <li>To respond to your inquiries and provide technical support.</li>
                <li>To send promotional messages or updates (only with your explicit consent).</li>
            </ul>

            <h3>3. Cookies</h3>
            <p>Our website uses cookies and similar tracking technologies to improve site performance and customize content according to your interests. You can control "cookie" settings through your browser, but this may affect the functionality of some site features.</p>

            <h3>4. Data Sharing with Third Parties</h3>
            <p>We do not sell or rent your personal data. We may only share your data with:</p>
            <ul>
                <li>Trusted service providers (such as payment gateways and hosting services) solely for the purpose of operating the service.</li>
                <li>Legal authorities if required by law or to protect our rights.</li>
            </ul>

            <h3>5. Your Rights as a User</h3>
            <p>You have the right at any time to:</p>
            <ul>
                <li>Request access to your personal data that we hold.</li>
                <li>Request correction of any inaccurate data.</li>
                <li>Request the permanent deletion of your data from our records (subject to legal obligations to retain certain records).</li>
            </ul>

            <h3>6. Data Security</h3>
            <p>We implement appropriate technical and administrative security measures to protect your data from unauthorized access, alteration, or disclosure.</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold text-text-heading mb-8 text-center">{t('privacyPolicy')}</h1>
            <Card className="card-shadow">
                <CardContent className="p-8">
                    {language === 'ar' ? arabicContent : englishContent}
                </CardContent>
            </Card>
        </div>
    );
};
