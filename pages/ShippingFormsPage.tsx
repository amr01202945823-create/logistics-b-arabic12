
import React, { useState, useEffect } from 'react';
import { useLocalization } from '../localization';
import type { Shipment, SharedShipmentData } from '../types';
import { getShipmentDraft, updateShipmentDraft } from '../services/draftService';
import { Button, Card, CardContent, CardHeader, Input, Textarea } from '../components/ui';
import { BookmarkIcon, FolderOpenIcon, PrintIcon, TrashIcon, ShareIcon, DownloadIcon } from '../components/icons';

declare const html2pdf: any;

// Moved FormInput and FormTextarea outside of ShippingFormsPage to prevent re-rendering and input focus loss.
type FormInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    isFsd?: boolean;
};
const FormInput: React.FC<FormInputProps> = ({ label, isFsd, ...props }) => (
    <div dir="auto">
        <label htmlFor={props.id} className="block text-sm font-medium text-text-muted mb-1">{label}</label>
        <Input 
            {...props} 
            dir="auto"
            className={`${isFsd ? 'focus:ring-green-500 focus:border-green-500 focus:ring-offset-0' : ''} ${props.className || ''}`} 
        />
    </div>
);
type FormTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label: string;
    isFsd?: boolean;
};
const FormTextarea: React.FC<FormTextareaProps> = ({ label, isFsd, ...props }) => (
    <div dir="auto">
        <label htmlFor={props.id} className="block text-sm font-medium text-text-muted mb-1">{label}</label>
        <Textarea 
            {...props} 
            dir="auto"
            className={`${isFsd ? 'focus:ring-green-500 focus:border-green-500 focus:ring-offset-0' : ''} ${props.className || ''}`} 
        />
    </div>
);

// Final Shipping Declaration (Green Theme)
const FsdPreview: React.FC<{ data: any; }> = ({ data }) => {
    return (
        <div className="document-preview bg-white p-8 text-black font-serif text-sm border border-gray-200 shadow-lg mx-auto max-w-[210mm] min-h-[297mm] text-left flex flex-col" dir="ltr" style={{ direction: 'ltr', textAlign: 'left' }}>
             {/* Header */}
             <div className="mb-2 border-b border-gray-300 pb-4 relative text-center">
                {data.logo && (
                    <div className="flex justify-center mb-2">
                        <img 
                            src={data.logo} 
                            alt="Logo" 
                            style={{ width: `${data.logoWidth || 200}px` }}
                            className="object-contain mix-blend-multiply" 
                        />
                    </div>
                )}
            </div>
            
            {/* Title & Date Section */}
            <div className="relative mb-6">
                <h1 className="text-center text-green-800 font-bold text-2xl uppercase tracking-wide" style={{ textShadow: '0px 0px 1px rgba(0,0,0,0.1)' }}>
                    FINAL SHIPPING DECLARATION
                </h1>
                {/* Moved City/Date to the left below the line/header area */}
                <div className="absolute left-0 top-full mt-2 font-bold text-sm">
                    {data.city_in || 'ALEXANDRIA IN'}: <span className="font-normal border-b border-dotted border-black min-w-[100px] inline-block">{data.date}</span>
                </div>
            </div>
            
            {/* Spacer for the absolute positioned date */}
            <div className="h-8"></div>
            
            {/* Main Grid Container */}
            <div className="border-2 border-black text-left flex-grow" dir="ltr">
                
                {/* Row 1 */}
                <div className="flex border-b border-black flex-row">
                    <div className="w-1/2 border-r border-black p-2 min-h-[100px] text-left">
                        <div className="font-bold mb-1 text-xs md:text-sm text-left">SHIPPER</div>
                        <div className="whitespace-pre-wrap font-semibold text-left" dir="ltr">{data.shipper}</div>
                    </div>
                    <div className="w-1/2 p-2 min-h-[100px] text-left">
                        <div className="font-bold mb-1 text-xs md:text-sm text-left">BOOKING NO.</div>
                        <div className="whitespace-pre-wrap font-mono text-lg font-bold text-left" dir="ltr">{data.booking_no}</div>
                    </div>
                </div>

                {/* Row 2 */}
                <div className="flex border-b border-black flex-row">
                    <div className="w-1/2 border-r border-black p-2 min-h-[120px] text-left">
                        <div className="font-bold mb-1 text-xs md:text-sm text-left">CONSIGNEE</div>
                        <div className="whitespace-pre-wrap font-semibold text-left" dir="ltr">{data.consignee}</div>
                    </div>
                    <div className="w-1/2 flex flex-col text-left">
                        <div className="p-2 border-b border-black flex-grow text-left">
                            <div className="font-bold mb-1 text-xs md:text-sm text-left">PORT OF DESTINATION</div>
                            <div className="font-semibold uppercase text-left" dir="ltr">{data.port_destination}</div>
                        </div>
                        <div className="p-2 flex-grow text-left">
                            <div className="font-bold mb-1 text-xs md:text-sm text-left">PORT OF LOADING</div>
                            <div className="font-semibold uppercase text-left" dir="ltr">{data.port_loading || 'Alexandria'}</div>
                        </div>
                    </div>
                </div>

                {/* Row 3 */}
                <div className="flex border-b border-black flex-row">
                    <div className="w-1/2 border-r border-black p-2 min-h-[100px] text-left">
                        <div className="font-bold mb-1 text-xs md:text-sm text-left">NOTIFY</div>
                        <div className="whitespace-pre-wrap font-semibold text-left" dir="ltr">{data.notify || 'SAME AS CONSIGNEE'}</div>
                    </div>
                    <div className="w-1/2 flex flex-col text-left">
                        <div className="p-2 border-b border-black flex-grow text-left">
                            <div className="font-bold mb-1 text-xs md:text-sm underline text-left">NUMBER OF B/L REQUIRED:</div>
                            <div className="grid grid-cols-1 gap-1 mt-1 text-xs md:text-sm text-left">
                                <div>ORIGINAL: <span className="font-mono font-bold text-base ml-2">{data.bl_original || '3'}</span></div>
                                <div>NON NEGOTIABLE COPY: <span className="font-mono font-bold text-base ml-2">{data.bl_copy || '7'}</span></div>
                            </div>
                        </div>
                        <div className="p-2 flex-grow text-left">
                            <div className="font-bold mb-1 text-xs md:text-sm text-left">FREIGHT PAYABLE</div>
                            <div className="font-bold uppercase text-sm text-left" dir="ltr">{data.freight_payable}</div>
                        </div>
                    </div>
                </div>

                {/* Goods Table Header */}
                <div className="flex border-b border-black bg-gray-100/50 text-left flex-row">
                    <div className="w-[30%] border-r border-black p-2 text-center font-bold text-xs leading-tight flex items-center justify-center">
                        MARKS & NUMBERS
                    </div>
                    <div className="w-[45%] border-r border-black p-2 text-center font-bold text-xs leading-tight flex items-center justify-center">
                        DESCRIPTION OF GOODS
                    </div>
                    <div className="w-[25%] p-2 text-center font-bold text-xs leading-tight flex items-center justify-center">
                        WEIGHT
                    </div>
                </div>

                {/* Goods Table Content */}
                <div className="flex min-h-[350px] text-left flex-row">
                    <div className="w-[30%] border-r border-black p-2 whitespace-pre-wrap text-xs md:text-sm leading-relaxed text-left" dir="ltr">
                        {data.marks}
                    </div>
                    <div className="w-[45%] border-r border-black p-2 whitespace-pre-wrap text-xs md:text-sm leading-relaxed font-semibold text-left" dir="ltr">
                        {data.description}
                    </div>
                    <div className="w-[25%] p-2 whitespace-pre-wrap text-xs md:text-sm text-left" dir="ltr">
                        <div className="mb-6">
                            <span className="font-bold block mb-1 border-b border-black/20 pb-1 text-left">NET WEIGHT</span>
                            <span className="font-mono font-bold">{data.net_weight}{data.net_weight ? ' KGS' : ''}</span>
                        </div>
                        <div>
                            <span className="font-bold block mb-1 border-b border-black/20 pb-1 text-left">GROSS WEIGHT</span>
                            <span className="font-mono font-bold">{data.gross_weight}{data.gross_weight ? ' KGS' : ''}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer with Seal */}
            <div className="mt-6 pt-4 min-h-[150px] text-left relative flex justify-between items-end">
                <div className="w-1/2">
                    <div className="font-bold mb-2 text-xs text-left">SIGNATURE</div>
                    <div className="whitespace-pre-wrap text-sm text-left" dir="ltr">{data.footer}</div>
                </div>
                
                {data.seal && (
                    <div className="w-1/2 flex justify-end">
                        <img 
                            src={data.seal} 
                            alt="Seal" 
                            style={{ width: `${data.sealWidth || 150}px` }}
                            className="object-contain mix-blend-multiply" 
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

// Shipping Declaration (Blue Theme)
const SdPreview: React.FC<{ data: any; }> = ({ data }) => {
    return (
        <div className="document-preview bg-white p-8 text-black font-serif text-sm border border-gray-200 shadow-lg mx-auto max-w-[210mm] min-h-[297mm] text-left flex flex-col" dir="ltr" style={{ direction: 'ltr', textAlign: 'left' }}>
            {/* Header with Logo */}
            <div className="mb-2 border-b border-gray-300 pb-4 relative text-center">
                {data.logo && (
                    <div className="flex justify-center mb-2">
                        <img 
                            src={data.logo} 
                            alt="Logo" 
                            style={{ width: `${data.logoWidth || 200}px` }}
                            className="object-contain mix-blend-multiply" 
                        />
                    </div>
                )}
            </div>
            
            {/* Title & Date Section */}
            <div className="relative mb-6">
                <h1 className="text-center text-blue-800 font-bold text-2xl uppercase tracking-wide" style={{ textShadow: '0px 0px 1px rgba(0,0,0,0.1)' }}>
                    SHIPPING DECLARATION
                </h1>
                {/* Moved City/Date to the left below the line/header area */}
                <div className="absolute left-0 top-full mt-2 font-bold text-sm">
                    {data.city_in || 'ALEXANDRIA IN'}: <span className="font-normal border-b border-dotted border-black min-w-[100px] inline-block">{data.date}</span>
                </div>
            </div>

            {/* Spacer for the absolute positioned date */}
            <div className="h-8"></div>
            
            {/* Main Grid Container */}
            <div className="border-2 border-black text-left flex-grow" dir="ltr">
                
                {/* Row 1 */}
                <div className="flex border-b border-black flex-row">
                    <div className="w-1/2 border-r border-black p-2 min-h-[100px] text-left">
                        <div className="font-bold mb-1 text-xs md:text-sm text-left">SHIPPER</div>
                        <div className="whitespace-pre-wrap font-semibold text-left" dir="ltr">{data.shipper}</div>
                    </div>
                    <div className="w-1/2 p-2 min-h-[100px] text-left">
                        <div className="font-bold mb-1 text-xs md:text-sm text-left">VESSEL</div>
                        <div className="whitespace-pre-wrap font-mono text-lg font-bold text-left" dir="ltr">{data.vessel}</div>
                    </div>
                </div>

                {/* Row 2 */}
                <div className="flex border-b border-black flex-row">
                    <div className="w-1/2 border-r border-black p-2 min-h-[120px] text-left">
                        <div className="font-bold mb-1 text-xs md:text-sm text-left">CONSIGNEE</div>
                        <div className="whitespace-pre-wrap font-semibold text-left" dir="ltr">{data.consignee}</div>
                    </div>
                    <div className="w-1/2 flex flex-col text-left">
                        <div className="p-2 border-b border-black flex-grow text-left">
                            <div className="font-bold mb-1 text-xs md:text-sm text-left">PORT OF DESTINATION</div>
                            <div className="font-semibold uppercase text-left" dir="ltr">{data.port_destination}</div>
                        </div>
                        <div className="p-2 flex-grow text-left">
                            <div className="font-bold mb-1 text-xs md:text-sm text-left">PORT OF LOADING</div>
                            <div className="font-semibold uppercase text-left" dir="ltr">{data.port_loading || 'Alexandria'}</div>
                        </div>
                    </div>
                </div>

                {/* Row 3 */}
                <div className="flex border-b border-black flex-row">
                    <div className="w-1/2 border-r border-black p-2 min-h-[100px] text-left">
                        <div className="font-bold mb-1 text-xs md:text-sm text-left">NOTIFY</div>
                        <div className="whitespace-pre-wrap font-semibold text-left" dir="ltr">{data.notify || 'SAME AS CONSIGNEE'}</div>
                    </div>
                    <div className="w-1/2 flex flex-col text-left">
                        <div className="p-2 border-b border-black flex-grow text-left">
                            <div className="font-bold mb-1 text-xs md:text-sm underline text-left">NUMBER OF B/L REQUIRED:</div>
                            <div className="grid grid-cols-1 gap-1 mt-1 text-xs md:text-sm text-left">
                                <div>ORIGINAL: <span className="font-mono font-bold text-base ml-2">{data.bl_original || '3'}</span></div>
                                <div>NON NEGOTIABLE COPY: <span className="font-mono font-bold text-base ml-2">{data.bl_copy || '7'}</span></div>
                            </div>
                        </div>
                        <div className="p-2 flex-grow text-left">
                            <div className="font-bold mb-1 text-xs md:text-sm text-left">FREIGHT PAYABLE</div>
                            <div className="font-bold uppercase text-sm text-left" dir="ltr">{data.freight_payable}</div>
                        </div>
                    </div>
                </div>

                {/* Goods Table Header */}
                <div className="flex border-b border-black bg-gray-100/50 text-left flex-row">
                    <div className="w-[30%] border-r border-black p-2 text-center font-bold text-xs leading-tight flex items-center justify-center">
                        MARKS & NUMBERS
                    </div>
                    <div className="w-[45%] border-r border-black p-2 text-center font-bold text-xs leading-tight flex items-center justify-center">
                        DESCRIPTION OF GOODS
                    </div>
                    <div className="w-[25%] p-2 text-center font-bold text-xs leading-tight flex items-center justify-center">
                        WEIGHT
                    </div>
                </div>

                {/* Goods Table Content */}
                <div className="flex min-h-[350px] text-left flex-row">
                    <div className="w-[30%] border-r border-black p-2 whitespace-pre-wrap text-xs md:text-sm leading-relaxed text-left" dir="ltr">
                        {data.marks}
                    </div>
                    <div className="w-[45%] border-r border-black p-2 whitespace-pre-wrap text-xs md:text-sm leading-relaxed font-semibold text-left" dir="ltr">
                        {data.description}
                    </div>
                    <div className="w-[25%] p-2 whitespace-pre-wrap text-xs md:text-sm text-left" dir="ltr">
                        <div className="mb-6">
                            <span className="font-bold block mb-1 border-b border-black/20 pb-1 text-left">NET WEIGHT</span>
                            <span className="font-mono font-bold">{data.net_weight}{data.net_weight ? ' KGS' : ''}</span>
                        </div>
                        <div>
                            <span className="font-bold block mb-1 border-b border-black/20 pb-1 text-left">GROSS WEIGHT</span>
                            <span className="font-mono font-bold">{data.gross_weight}{data.gross_weight ? ' KGS' : ''}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer with Seal */}
            <div className="mt-6 pt-4 min-h-[150px] text-left relative flex justify-between items-end">
                <div className="w-1/2">
                    <div className="font-bold mb-2 text-xs text-left">SIGNATURE</div>
                    <div className="whitespace-pre-wrap text-sm text-left" dir="ltr">{data.footer}</div>
                </div>
                
                {data.seal && (
                    <div className="w-1/2 flex justify-end">
                        <img 
                            src={data.seal} 
                            alt="Seal" 
                            style={{ width: `${data.sealWidth || 150}px` }}
                            className="object-contain mix-blend-multiply" 
                        />
                    </div>
                )}
            </div>
        </div>
    );
};


// Advanced Shipping Forms Page
export const ShippingFormsPage: React.FC<{shipments: Record<string, Shipment>}> = ({ shipments }) => {
    const { t } = useLocalization();
    const [activeForm, setActiveForm] = useState<'sd' | 'fsd'>('sd');
    const [notification, setNotification] = useState<{type: 'success' | 'info' | 'error', message: string} | null>(null);
    const [shipmentId, setShipmentId] = useState('');

    const initialSdData = {
        city_in: 'ALEXANDRIA IN', date: '', vessel: '', freight_payable: 'FREIGHT PREPAID', port_loading: 'Alexandria',
        port_destination: '', shipper: '', consignee: '', notify: 'SAME AS CONSIGNEE', bl_original: '3', bl_copy: '7',
        marks: '', description: '', net_weight: '', gross_weight: '', footer: '',
        logo: '', seal: '', logoWidth: '200', sealWidth: '150'
    };
    const initialFsdData = {
        city_in: 'ALEXANDRIA IN', date: '', booking_no: '', freight_payable: 'FREIGHT PREPAID', port_loading: '',
        port_destination: '', shipper: '', consignee: '', notify: 'SAME AS CONSIGNEE', bl_original: '3', bl_copy: '7',
        marks: '', description: '', net_weight: '', gross_weight: '', footer: '',
        logo: '', seal: '', logoWidth: '200', sealWidth: '150'
    };

    const [sdData, setSdData] = useState(initialSdData);
    const [fsdData, setFsdData] = useState(initialFsdData);

    const [canShare, setCanShare] = useState(false);

    useEffect(() => {
        if (typeof navigator !== 'undefined' && navigator.share) {
            setCanShare(true);
        }
        
        const savedData = localStorage.getItem('shippingFormsData');
        if (savedData) {
            if (window.confirm(t('foundSavedDraft'))) {
                handleLoadDraft(false);
            }
        }
    }, [t]);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);
    
    const handleLoadDataFromShipment = () => {
        const draft = getShipmentDraft(shipmentId);
        const shipment = shipments[shipmentId];

        if (!draft && !shipment) {
            setNotification({ type: 'error', message: t('shipmentNotFound', { shipmentId }) });
            return;
        }
        
        const updates = {
            shipper: draft?.exporterName || '',
            consignee: draft?.importerName || shipment?.customer || '',
            notify: draft?.notifyParty || 'SAME AS CONSIGNEE',
            port_loading: draft?.portOfLoading || shipment?.portOfLoading || shipment?.origin || '',
            port_destination: draft?.portOfDischarge || shipment?.portOfDischarge || shipment?.destination || '',
            marks: draft?.marksAndNumbers || '',
            description: draft?.descriptionOfGoods || '',
            gross_weight: draft?.grossWeight || shipment?.weight || '',
            net_weight: draft?.netWeight || '',
            vessel: draft?.vessel || shipment?.vesselName || '',
            booking_no: draft?.bookingNo || shipmentId || '',
        };

        setSdData(prev => ({ ...prev, ...updates }));
        setFsdData(prev => ({ ...prev, ...updates }));
        setNotification({ type: 'success', message: t('dataLoadedSuccess', { shipmentId }) });
    };

    const handleShare = async () => {
        const formTitle = activeForm === 'sd' ? 'Shipping Declaration' : 'Final Shipping Declaration';
        if (navigator.share) {
            try {
                const shareUrl = window.location.href.startsWith('http') 
                    ? window.location.href 
                    : 'https://aistudio.google.com/';

                const shareData = {
                    title: formTitle,
                    text: `Here is the ${formTitle} document I created with Logistics B Arabic.`,
                    url: shareUrl,
                };
                
                if (navigator.canShare && navigator.canShare(shareData)) {
                    await navigator.share(shareData);
                } else {
                    setNotification({ type: 'error', message: "URL sharing is not supported."});
                }
            } catch (error) {
                 if (error instanceof DOMException && error.name === 'AbortError') {
                    console.log('Share cancelled.');
                } else {
                    console.error('Error sharing:', error);
                    setNotification({ type: 'error', message: `Error sharing: ${(error as Error).message}`});
                }
            }
        } else {
            setNotification({ type: 'error', message: "Sharing is not supported on this browser."});
        }
    };

    const handleDownloadPdf = () => {
        const element = document.getElementById('printable-area-forms');
        if (!element) return;

        const formName = activeForm === 'sd' ? 'Shipping_Declaration' : 'Final_Shipping_Declaration';
        const idRef = activeForm === 'sd' ? (sdData.vessel || 'draft') : (fsdData.booking_no || 'draft');
        
        const opt = {
            margin: 5,
            filename: `${formName}_${idRef}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save();
    };

    const handleSaveDraft = () => {
        try {
            // Save full form state locally
            const dataToSave = JSON.stringify({ sdData, fsdData });
            localStorage.setItem('shippingFormsData', dataToSave);
            
            // Sync common data to centralized draft store
            const idToSave = shipmentId || (activeForm === 'fsd' ? fsdData.booking_no : sdData.vessel);
            if (idToSave) {
                const data = activeForm === 'sd' ? sdData : fsdData;
                const sharedData: Partial<SharedShipmentData> = {
                    exporterName: data.shipper,
                    importerName: data.consignee,
                    notifyParty: data.notify,
                    portOfLoading: data.port_loading,
                    portOfDischarge: data.port_destination,
                    marksAndNumbers: data.marks,
                    descriptionOfGoods: data.description,
                    grossWeight: data.gross_weight,
                    netWeight: data.net_weight,
                    vessel: activeForm === 'sd' ? (data as typeof sdData).vessel : undefined,
                    bookingNo: activeForm === 'fsd' ? (data as typeof fsdData).booking_no : undefined,
                };
                updateShipmentDraft(idToSave, sharedData);
            }

            setNotification({ type: 'success', message: t('draftSaved') });
        } catch (error) {
            console.error("Failed to save draft", error);
        }
    };

    const handleLoadDraft = (confirmLoad = true) => {
        const performLoad = () => {
            try {
                const savedData = localStorage.getItem('shippingFormsData');
                if (savedData) {
                    const parsedData = JSON.parse(savedData);
                    setSdData(parsedData.sdData || initialSdData);
                    setFsdData(parsedData.fsdData || initialFsdData);
                    setNotification({ type: 'success', message: t('draftLoaded') });
                } else {
                    alert('No saved draft found.');
                }
            } catch (error) {
                console.error("Failed to load draft", error);
            }
        };

        if (confirmLoad) {
            if (window.confirm(t('confirmLoad'))) {
                performLoad();
            }
        } else {
            performLoad();
        }
    };

    const handleClearForms = () => {
        if (window.confirm(t('confirmClear'))) {
            setSdData(initialSdData);
            setFsdData(initialFsdData);
            setNotification({ type: 'info', message: t('formCleared') });
        }
    };
    
    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>, 
        field: 'logo' | 'seal', 
        formType: 'sd' | 'fsd'
    ) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                const dataSetter = formType === 'sd' ? setSdData : setFsdData;
                dataSetter(prev => ({ ...prev, [field]: result }));
                 // Also update the other form's data so they stay in sync
                const otherDataSetter = formType === 'sd' ? setFsdData : setSdData;
                otherDataSetter(prev => ({ ...prev, [field]: result }));
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSdChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setSdData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleFsdChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFsdData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const renderSdForm = () => (
         <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
                <FormInput label={t('cityIn')} name="city_in" value={sdData.city_in} onChange={handleSdChange} />
                <FormInput label={t('date')} name="date" type="date" value={sdData.date} onChange={handleSdChange} />
            </div>
             <div className="grid md:grid-cols-2 gap-4">
                 <FormInput label={t('vesselNameForm')} name="vessel" value={sdData.vessel} onChange={handleSdChange} />
                 <FormInput label={t('freightPayableAt')} name="freight_payable" value={sdData.freight_payable} onChange={handleSdChange} />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
                 <FormInput label={t('portOfLoading')} name="port_loading" value={sdData.port_loading} onChange={handleSdChange} />
                 <FormInput label={t('portOfDestination')} name="port_destination" value={sdData.port_destination} onChange={handleSdChange} />
            </div>
            <FormTextarea label={t('shipperExporter')} name="shipper" value={sdData.shipper} onChange={handleSdChange} rows={3}/>
            <FormTextarea label={t('consignee')} name="consignee" value={sdData.consignee} onChange={handleSdChange} rows={3}/>
            <FormTextarea label={t('notifyParty')} name="notify" value={sdData.notify} onChange={handleSdChange} rows={3}/>
             <div className="grid md:grid-cols-2 gap-4">
                 <FormInput label={t('numberOfOriginalBl')} name="bl_original" value={sdData.bl_original} onChange={handleSdChange} />
                 <FormInput label={t('numberOfCopyBl')} name="bl_copy" value={sdData.bl_copy} onChange={handleSdChange} />
            </div>
            <FormTextarea label={t('marksAndNumbers')} name="marks" value={sdData.marks} onChange={handleSdChange} rows={5}/>
            <FormTextarea label={t('descriptionOfGoods')} name="description" value={sdData.description} onChange={handleSdChange} rows={5}/>
             <div className="grid md:grid-cols-2 gap-4">
                 <FormInput label={t('netWeightKgs')} name="net_weight" value={sdData.net_weight} onChange={handleSdChange} />
                 <FormInput label={t('grossWeightKgs')} name="gross_weight" value={sdData.gross_weight} onChange={handleSdChange} />
            </div>
            <FormInput label={t('footerSignature')} name="footer" value={sdData.footer} onChange={handleSdChange} />
        </div>
    );
    
    const renderFsdForm = () => (
        <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
                <FormInput isFsd label={t('cityIn')} name="city_in" value={fsdData.city_in} onChange={handleFsdChange} />
                <FormInput isFsd label={t('date')} name="date" type="date" value={fsdData.date} onChange={handleFsdChange} />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
                <FormInput isFsd label={t('bookingNo')} name="booking_no" value={fsdData.booking_no} onChange={handleFsdChange} />
                <FormInput isFsd label={t('freightPayableAt')} name="freight_payable" value={fsdData.freight_payable} onChange={handleFsdChange} />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
                <FormInput isFsd label={t('portOfLoading')} name="port_loading" value={fsdData.port_loading} onChange={handleFsdChange} />
                <FormInput isFsd label={t('portOfDestination')} name="port_destination" value={fsdData.port_destination} onChange={handleFsdChange} />
            </div>
            <FormTextarea isFsd label={t('shipperExporter')} name="shipper" value={fsdData.shipper} onChange={handleFsdChange} rows={3} />
            <FormTextarea isFsd label={t('consignee')} name="consignee" value={fsdData.consignee} onChange={handleFsdChange} rows={3} />
            <FormTextarea isFsd label={t('notifyParty')} name="notify" value={fsdData.notify} onChange={handleFsdChange} rows={3} />
            <div className="grid md:grid-cols-2 gap-4">
                <FormInput isFsd label={t('numberOfOriginalBl')} name="bl_original" value={fsdData.bl_original} onChange={handleFsdChange} />
                <FormInput isFsd label={t('numberOfCopyBl')} name="bl_copy" value={fsdData.bl_copy} onChange={handleFsdChange} />
            </div>
            <FormTextarea isFsd label={t('marksAndNumbers')} name="marks" value={fsdData.marks} onChange={handleFsdChange} rows={5} />
            <FormTextarea isFsd label={t('descriptionOfGoods')} name="description" value={fsdData.description} onChange={handleFsdChange} rows={5} />
            <div className="grid md:grid-cols-2 gap-4">
                <FormInput isFsd label={t('netWeightKgs')} name="net_weight" value={fsdData.net_weight} onChange={handleFsdChange} />
                <FormInput isFsd label={t('grossWeightKgs')} name="gross_weight" value={fsdData.gross_weight} onChange={handleFsdChange} />
            </div>
            <FormInput isFsd label={t('footerSignature')} name="footer" value={fsdData.footer} onChange={handleFsdChange} />
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="no-print space-y-6">
                <Card className="card-shadow">
                    <CardHeader><h3 className="text-xl font-bold text-text-heading">{t('actions')}</h3></CardHeader>
                    <CardContent className="flex flex-wrap items-center gap-2">
                        <Button onClick={handleSaveDraft} variant="primary"><BookmarkIcon className="w-5 h-5 me-2"/>{t('saveDraft')}</Button>
                        <Button onClick={() => handleLoadDraft()} variant="secondary"><FolderOpenIcon className="w-5 h-5 me-2"/>{t('loadDraft')}</Button>
                        <Button onClick={handleClearForms} variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700"><TrashIcon className="w-5 h-5 me-2"/>{t('clearForm')}</Button>
                        <Button onClick={() => window.print()}><PrintIcon className="w-5 h-5 me-2"/>{t('printOrSave')}</Button>
                        {canShare && <Button onClick={handleShare} variant="primary" className="bg-accent hover:bg-accent-hover"><ShareIcon className="w-5 h-5 me-2"/>{t('share')}</Button>}
                        {notification && (
                             <div className={`p-2 rounded-md text-sm ${notification.type === 'success' ? 'bg-green-100 text-green-800' : notification.type === 'info' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                                {notification.message}
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card className="card-shadow">
                    <CardHeader><h3 className="text-xl font-bold text-text-heading">{t('loadDataFromShipment')}</h3></CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Input value={shipmentId} onChange={(e) => setShipmentId(e.target.value)} placeholder={t('shipmentId')} className="flex-grow" />
                            <Button onClick={handleLoadDataFromShipment} disabled={!shipmentId}>{t('loadFromShipment')}</Button>
                        </div>
                    </CardContent>
                </Card>
                 <Card className="card-shadow">
                    <CardHeader><h3 className="text-xl font-bold text-text-heading">{t('selectForm')}</h3></CardHeader>
                    <CardContent className="space-y-4">
                         <div className="grid grid-cols-2 gap-2">
                            <Button onClick={() => setActiveForm('sd')} variant={activeForm === 'sd' ? 'primary' : 'secondary'} className={`w-full ${activeForm === 'sd' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}>{t('shippingDeclaration')}</Button>
                            <Button onClick={() => setActiveForm('fsd')} variant={activeForm === 'fsd' ? 'primary' : 'secondary'} className={`w-full ${activeForm === 'fsd' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}>{t('finalShippingDeclaration')}</Button>
                        </div>
                    </CardContent>
                </Card>
                 <Card className="card-shadow">
                    <CardHeader><h3 className="text-xl font-bold text-text-heading">{t('logoAndSeal')}</h3></CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-2">{t('companyLogo')}</label>
                            <Input type="file" accept="image/*" onChange={e => handleFileChange(e, 'logo', activeForm)} />
                            <div className="mt-3">
                                <label className="block text-xs font-medium text-text-muted mb-1">Logo Width</label>
                                <input 
                                    type="range" 
                                    min="50" 
                                    max="400" 
                                    value={activeForm === 'sd' ? sdData.logoWidth : fsdData.logoWidth} 
                                    onChange={(e) => activeForm === 'sd' ? handleSdChange(e as any) : handleFsdChange(e as any)} 
                                    name="logoWidth"
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                            <div className="mt-2 p-4 border border-border rounded-lg min-h-[100px] bg-background flex justify-center items-center">
                                {sdData.logo ? <img src={sdData.logo} style={{ width: `${activeForm === 'sd' ? sdData.logoWidth : fsdData.logoWidth}px` }} className="object-contain" alt="Logo Preview"/> : <p className="text-text-muted text-center text-sm">{t('logoPlaceholder')}</p>}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-2">{t('companySeal')}</label>
                            <Input type="file" accept="image/*" onChange={e => handleFileChange(e, 'seal', activeForm)} />
                            <div className="mt-3">
                                <label className="block text-xs font-medium text-text-muted mb-1">Seal Width</label>
                                <input 
                                    type="range" 
                                    min="50" 
                                    max="300" 
                                    value={activeForm === 'sd' ? sdData.sealWidth : fsdData.sealWidth} 
                                    onChange={(e) => activeForm === 'sd' ? handleSdChange(e as any) : handleFsdChange(e as any)} 
                                    name="sealWidth"
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                             <div className="mt-2 p-4 border border-border rounded-lg min-h-[100px] bg-background flex justify-center items-center">
                                {sdData.seal ? <img src={sdData.seal} style={{ width: `${activeForm === 'sd' ? sdData.sealWidth : fsdData.sealWidth}px` }} className="object-contain" alt="Seal Preview"/> : <p className="text-text-muted text-center text-sm">{t('sealPlaceholder')}</p>}
                            </div>
                        </div>
                    </CardContent>
                </Card>
                 <Card className="card-shadow">
                    <CardHeader><h3 className="text-xl font-bold text-text-heading">{activeForm === 'sd' ? t('shippingDeclaration') : t('finalShippingDeclaration')}</h3></CardHeader>
                    <CardContent>
                        {activeForm === 'sd' ? renderSdForm() : renderFsdForm()}
                    </CardContent>
                </Card>
            </div>
            
             <div className="space-y-4">
                <h2 className="text-2xl font-bold text-text-heading text-center no-print">{t('officialPreview')}</h2>
                <div className="preview-container-mobile">
                    <div id="printable-area-forms" dir="ltr" style={{ direction: 'ltr', textAlign: 'left' }}>
                        <div className={`${activeForm === 'sd' ? '' : 'hidden'}`}>
                            <SdPreview data={sdData} />
                        </div>
                        <div className={`${activeForm === 'fsd' ? '' : 'hidden'}`}>
                            <FsdPreview data={fsdData} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};