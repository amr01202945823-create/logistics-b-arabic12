
import React, { useState, useRef } from 'react';
import { useLocalization } from '../localization';
import type { CommercialInvoiceItem } from '../types';
import { Button, Card, CardContent, CardHeader, Input } from '../components/ui';
import { TrashIcon, PlusIcon, DocumentTextIcon, SearchIcon, EditIcon, XIcon, CheckCircleIcon, DownloadIcon } from '../components/icons';
import { v4 as uuidv4 } from 'uuid';
import { getShipmentDraft } from '../services/draftService';

declare const html2pdf: any;

export const InvoiceGeneratorPage: React.FC = () => {
    const { t } = useLocalization();
    const previewRef = useRef<HTMLDivElement>(null);
    
    // State for Invoice Meta Data
    const [invoiceData, setInvoiceData] = useState({
        // Branding
        logo: null as string | null,
        seal: null as string | null,
        logoWidth: '200',
        sealWidth: '150',
        // Exporter
        exporterName: '',
        exporterAddress: '',
        // Importer
        importerName: '',
        importerAddress: '',
        // Shipment
        invoiceNo: `INV-${new Date().getFullYear()}-001`,
        date: new Date().toISOString().split('T')[0],
        packingIn: '', 
        pol: 'Alexandria, EG', 
        pod: '', 
        incoterm: 'CFR',
        // Bank
        bankName: '',
        advisingBank: '',
        accountName: '',
        swiftCode: '',
        iban: '',
    });

    const [items, setItems] = useState<CommercialInvoiceItem[]>([]);
    
    // Enhanced Form State for calculations
    const [formItem, setFormItem] = useState({
        desc: '',
        packages: '',
        packageUnit: 'Cartons',
        netWeightPerPkg: '',
        totalNet: '',
        grossWeightPerPkg: '',
        totalGross: '',
        price: '', // Unit Price
        totalPrice: ''
    });

    const [editingId, setEditingId] = useState<string | null>(null);
    const [currency, setCurrency] = useState('USD');
    const [shipmentIdInput, setShipmentIdInput] = useState('');

    // --- Handlers ---

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setInvoiceData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'seal') => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setInvoiceData(prev => ({ ...prev, [field]: reader.result as string }));
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleLoadShipment = () => {
        if(!shipmentIdInput) return;
        const draft = getShipmentDraft(shipmentIdInput);
        if(draft) {
            setInvoiceData(prev => ({
                ...prev,
                exporterName: draft.exporterName || prev.exporterName,
                importerName: draft.importerName || prev.importerName,
                pol: draft.portOfLoading || prev.pol,
                pod: draft.portOfDischarge || prev.pod,
                packingIn: draft.vessel ? `VESSEL: ${draft.vessel}` : prev.packingIn
            }));
            alert("Data loaded from Shipment Tracker!");
        } else {
            alert("Shipment ID not found.");
        }
    };

    const handleDownloadPdf = () => {
        const element = document.getElementById('printable-area-invoice-content');
        if (!element) return;

        const opt = {
            margin: [10, 10],
            filename: `Invoice_${invoiceData.invoiceNo}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save();
    };

    const handleClearForms = () => {
        if (window.confirm(t('confirmClear'))) {
             setInvoiceData({
                logo: null, seal: null, logoWidth: '200', sealWidth: '150',
                exporterName: '', exporterAddress: '',
                importerName: '', importerAddress: '',
                invoiceNo: `INV-${new Date().getFullYear()}-001`,
                date: new Date().toISOString().split('T')[0],
                packingIn: '', pol: 'Alexandria, EG', pod: '', incoterm: 'CFR',
                bankName: '', advisingBank: '', accountName: '', swiftCode: '', iban: ''
             });
             setItems([]);
             setCurrency('USD');
        }
    };

    // --- Advanced Item Logic (Bidirectional Calculation) ---

    const handleItemChange = (field: string, val: string) => {
        const updates: any = { [field]: val };
        const current = { ...formItem, ...updates };
        
        const qty = parseFloat(current.packages) || 0;
        const numVal = parseFloat(val);

        if (field === 'packages') {
             if (!isNaN(numVal)) {
                 // Update all totals based on units
                 if (current.netWeightPerPkg) updates.totalNet = (numVal * parseFloat(current.netWeightPerPkg)).toFixed(2);
                 if (current.grossWeightPerPkg) updates.totalGross = (numVal * parseFloat(current.grossWeightPerPkg)).toFixed(2);
                 if (current.price) updates.totalPrice = (numVal * parseFloat(current.price)).toFixed(2);
             }
        }
        // Net Weight Logic
        else if (field === 'netWeightPerPkg') {
             if (!isNaN(numVal) && qty) updates.totalNet = (numVal * qty).toFixed(2);
        }
        else if (field === 'totalNet') {
             if (!isNaN(numVal) && qty > 0) updates.netWeightPerPkg = (numVal / qty).toFixed(3);
        }
        // Gross Weight Logic
        else if (field === 'grossWeightPerPkg') {
             if (!isNaN(numVal) && qty) updates.totalGross = (numVal * qty).toFixed(2);
        }
        else if (field === 'totalGross') {
             if (!isNaN(numVal) && qty > 0) updates.grossWeightPerPkg = (numVal / qty).toFixed(3);
        }
        // Price Logic
        else if (field === 'price') {
             if (!isNaN(numVal) && qty) updates.totalPrice = (numVal * qty).toFixed(2);
        }
        else if (field === 'totalPrice') {
             if (!isNaN(numVal) && qty > 0) updates.price = (numVal / qty).toFixed(2);
        }
        
        setFormItem(prev => ({ ...prev, ...updates }));
    };

    const handleUpsertItem = () => {
        if (!formItem.desc) return;
        
        const newItem: CommercialInvoiceItem = {
            id: editingId || uuidv4(),
            desc: formItem.desc,
            packages: parseFloat(formItem.packages) || 0,
            packageUnit: formItem.packageUnit,
            netWeightPerPkg: parseFloat(formItem.netWeightPerPkg) || 0,
            totalNet: parseFloat(formItem.totalNet) || 0,
            grossWeightPerPkg: parseFloat(formItem.grossWeightPerPkg) || 0,
            totalGross: parseFloat(formItem.totalGross) || 0,
            price: parseFloat(formItem.price) || 0,
            totalPrice: parseFloat(formItem.totalPrice) || 0,
        };

        if (editingId) {
            setItems(items.map(i => i.id === editingId ? newItem : i));
            setEditingId(null);
        } else {
            setItems([...items, newItem]);
        }
        
        // Reset Form
        setFormItem({
            desc: '', packages: '', packageUnit: 'Cartons', 
            netWeightPerPkg: '', totalNet: '', 
            grossWeightPerPkg: '', totalGross: '', 
            price: '', totalPrice: ''
        });
    };

    const handleEditItem = (item: CommercialInvoiceItem) => {
        setFormItem({
            desc: item.desc,
            packages: item.packages.toString(),
            packageUnit: item.packageUnit,
            netWeightPerPkg: item.netWeightPerPkg.toString(),
            totalNet: item.totalNet.toString(),
            grossWeightPerPkg: item.grossWeightPerPkg.toString(),
            totalGross: item.totalGross.toString(),
            price: item.price.toString(),
            totalPrice: item.totalPrice.toString()
        });
        setEditingId(item.id);
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormItem({
            desc: '', packages: '', packageUnit: 'Cartons', 
            netWeightPerPkg: '', totalNet: '', 
            grossWeightPerPkg: '', totalGross: '', 
            price: '', totalPrice: ''
        });
    };

    const handleDeleteItem = (id: string) => {
        if (window.confirm(t('confirmDeleteItem'))) {
            setItems(items.filter(i => i.id !== id));
            if (editingId === id) handleCancelEdit();
        }
    };

    // Calculations for Preview
    const totalPackages = items.reduce((sum, item) => sum + item.packages, 0);
    const totalNet = items.reduce((sum, item) => sum + item.totalNet, 0);
    const totalGross = items.reduce((sum, item) => sum + item.totalGross, 0);
    const grandTotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    
    return (
        <div className="max-w-6xl mx-auto pb-20">
            
            {/* Header - Simplified */}
             <div className="mb-8 no-print">
                <h2 className="text-3xl font-bold text-text-heading">{t('invoiceAndPackingList')}</h2>
                <p className="text-text-muted mt-1">{t('invoiceAndPackingListSubtitle')}</p>
            </div>

            {/* ---------------- CONTROL TOOLBAR (Unified Action Bar) ---------------- */}
            <div className="mb-8 no-print animate-fade-in">
                <Card className="card-shadow bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100/50">
                    <CardContent className="p-4">
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                            
                            {/* Shipment Loader Section */}
                            <div className="relative flex-grow w-full lg:max-w-2xl group">
                                <SearchIcon className="absolute top-1/2 -translate-y-1/2 left-3 w-5 h-5 text-blue-400 group-focus-within:text-blue-600 transition-colors rtl:right-3 rtl:left-auto pointer-events-none z-10" />
                                <Input 
                                    placeholder={t('searchShipmentsPlaceholder')}
                                    value={shipmentIdInput} 
                                    onChange={e => setShipmentIdInput(e.target.value)} 
                                    className="w-full bg-white pl-10 rtl:pr-10 rtl:pl-32 pr-32 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all h-12 shadow-sm rounded-xl"
                                />
                                <div className="absolute top-1.5 right-1.5 rtl:left-1.5 rtl:right-auto bottom-1.5">
                                    <Button 
                                        onClick={handleLoadShipment} 
                                        size="sm" 
                                        className="h-full bg-blue-600 hover:bg-blue-700 text-white px-5 rounded-lg shadow-sm font-bold"
                                    >
                                        {t('loadFromShipment')}
                                    </Button>
                                </div>
                            </div>

                            {/* Actions Group */}
                            <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-blue-100 shadow-sm w-full lg:w-auto justify-end">
                                <Button onClick={handleClearForms} variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 rounded-lg w-10 h-10" title={t('clearForm')}>
                                    <TrashIcon className="w-5 h-5"/>
                                </Button>
                                <div className="w-px h-6 bg-gray-200"></div>
                                <Button onClick={handleDownloadPdf} variant="ghost" size="icon" className="text-gray-600 hover:bg-gray-100 rounded-lg w-10 h-10" title="Download PDF">
                                    <DownloadIcon className="w-5 h-5"/>
                                </Button>
                            </div>

                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ---------------- INPUTS SECTION ---------------- */}
            <div className="space-y-6 mb-12 no-print animate-fade-in">
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Branding & Basic Info */}
                    <Card className="card-shadow h-full">
                        <CardHeader><h3 className="text-lg font-bold text-text-heading">{t('logoAndSeal')}</h3></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-text-muted mb-2">{t('companyLogo')}</label>
                                    <Input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} />
                                    <div className="mt-3">
                                        <label className="block text-xs font-medium text-text-muted mb-1">Logo Width: {invoiceData.logoWidth}px</label>
                                        <input 
                                            type="range" 
                                            min="50" 
                                            max="400" 
                                            name="logoWidth"
                                            value={invoiceData.logoWidth} 
                                            onChange={(e) => handleInputChange(e as any)} 
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                    {invoiceData.logo && <div className="mt-2 text-xs text-green-600 flex items-center"><CheckCircleIcon className="w-3 h-3 me-1"/> Logo Uploaded</div>}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-text-muted mb-2">{t('companySeal')}</label>
                                    <Input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'seal')} />
                                    <div className="mt-3">
                                        <label className="block text-xs font-medium text-text-muted mb-1">Seal Width: {invoiceData.sealWidth}px</label>
                                        <input 
                                            type="range" 
                                            min="50" 
                                            max="300" 
                                            name="sealWidth"
                                            value={invoiceData.sealWidth} 
                                            onChange={(e) => handleInputChange(e as any)} 
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                    {invoiceData.seal && <div className="mt-2 text-xs text-green-600 flex items-center"><CheckCircleIcon className="w-3 h-3 me-1"/> Seal Uploaded</div>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="card-shadow h-full">
                        <CardHeader><h3 className="text-lg font-bold text-text-heading">{t('invoiceAndShipmentDetails')}</h3></CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-text-muted mb-1">{t('invoiceNo')}</label>
                                <Input name="invoiceNo" value={invoiceData.invoiceNo} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-text-muted mb-1">{t('invoiceDate')}</label>
                                <Input type="date" name="date" value={invoiceData.date} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-text-muted mb-1">Currency</label>
                                <select 
                                    value={currency} 
                                    onChange={(e) => setCurrency(e.target.value)}
                                    className="flex h-11 w-full rounded-lg border border-border bg-background py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                >
                                    {['USD', 'EUR', 'GBP', 'EGP', 'SAR', 'AED'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-text-muted mb-1">{t('incoterm')}</label>
                                <select 
                                    name="incoterm" 
                                    value={invoiceData.incoterm} 
                                    onChange={handleInputChange}
                                    className="flex h-11 w-full rounded-lg border border-border bg-background py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                >
                                    {['EXW', 'FCA', 'FOB', 'CFR', 'CIF', 'DAP', 'DDP'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Parties & Transport */}
                <div className="grid md:grid-cols-2 gap-6">
                    <Card className="card-shadow">
                        <CardHeader><h3 className="text-lg font-bold text-text-heading">{t('exporterDetails')} & {t('importerDetails')}</h3></CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-text-muted mb-1">{t('exporterName')}</label>
                                <Input name="exporterName" value={invoiceData.exporterName} onChange={handleInputChange} />
                                <Input name="exporterAddress" value={invoiceData.exporterAddress} onChange={handleInputChange} className="mt-2" placeholder="Address" />
                            </div>
                            <hr className="border-border" />
                            <div>
                                <label className="block text-xs font-medium text-text-muted mb-1">{t('importerName')}</label>
                                <Input name="importerName" value={invoiceData.importerName} onChange={handleInputChange} />
                                <Input name="importerAddress" value={invoiceData.importerAddress} onChange={handleInputChange} className="mt-2" placeholder="Address" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <div className="space-y-6">
                        <Card className="card-shadow">
                            <CardHeader><h3 className="text-lg font-bold text-text-heading">{t('transportDetails')}</h3></CardHeader>
                            <CardContent className="space-y-3">
                                <Input name="pol" placeholder="Port of Loading (P.O.L)" value={invoiceData.pol} onChange={handleInputChange} />
                                <Input name="pod" placeholder="Port of Discharge (P.O.D)" value={invoiceData.pod} onChange={handleInputChange} />
                                <Input name="packingIn" placeholder="Packing In (e.g., 1x40HC)" value={invoiceData.packingIn} onChange={handleInputChange} />
                            </CardContent>
                        </Card>
                        
                        <Card className="card-shadow">
                            <CardHeader><h3 className="text-lg font-bold text-text-heading">{t('bankDetails')} (For Invoice)</h3></CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input name="bankName" placeholder={t('bankName')} value={invoiceData.bankName} onChange={handleInputChange} />
                                    <Input name="accountName" placeholder={t('accountName')} value={invoiceData.accountName} onChange={handleInputChange} />
                                    <Input name="swiftCode" placeholder={t('swiftCode')} value={invoiceData.swiftCode} onChange={handleInputChange} />
                                    <Input name="iban" placeholder={t('iban')} value={invoiceData.iban} onChange={handleInputChange} />
                                    <Input name="advisingBank" placeholder={t('advisingBank')} value={invoiceData.advisingBank} onChange={handleInputChange} className="col-span-2" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* 3. Item Management (Add/Edit) */}
                <Card className={`card-shadow border-2 ${editingId ? 'border-yellow-400' : 'border-primary/10'}`}>
                    <CardHeader className={`flex justify-between items-center border-b ${editingId ? 'bg-yellow-50 border-yellow-200' : 'bg-primary/5 border-primary/10'}`}>
                        <h3 className={`font-bold text-lg ${editingId ? 'text-yellow-700' : 'text-text-heading'}`}>
                            {editingId ? t('editItem') : t('addItem')}
                        </h3>
                        <div className="flex gap-2">
                            {editingId && (
                                <Button variant="ghost" size="sm" onClick={handleCancelEdit} className="text-text-muted hover:text-text-heading">
                                    <XIcon className="w-4 h-4 me-1"/> {t('cancel')}
                                </Button>
                            )}
                            {items.length > 0 && !editingId && (
                                <Button variant="ghost" size="sm" onClick={() => setItems([])} className="text-red-500 hover:text-red-700 text-xs">
                                    <TrashIcon className="w-4 h-4 me-1"/> {t('clearForm')}
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Description Row */}
                        <div>
                            <label className="block text-xs font-medium text-text-muted mb-1">{t('itemDescription')}</label>
                            <Input value={formItem.desc} onChange={e => handleItemChange('desc', e.target.value)} placeholder="Item description" />
                        </div>

                        {/* Quantity & Price Row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-text-muted mb-1">{t('packagesCount')}</label>
                                <Input type="number" value={formItem.packages} onChange={e => handleItemChange('packages', e.target.value)} placeholder="0" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-text-muted mb-1">{t('packageUnit')}</label>
                                <Input value={formItem.packageUnit} onChange={e => handleItemChange('packageUnit', e.target.value)} placeholder="Cartons" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-text-muted mb-1">{t('pricePerKgs')}</label>
                                <Input type="number" value={formItem.price} onChange={e => handleItemChange('price', e.target.value)} placeholder="0.00" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-text-muted mb-1">Total Price</label>
                                <Input 
                                    type="number" 
                                    value={formItem.totalPrice} 
                                    onChange={e => handleItemChange('totalPrice', e.target.value)} 
                                    className="font-semibold text-gray-700" 
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        
                        {/* Weight Calculations Row */}
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-text-muted mb-1">{t('netWtPerUnit')}</label>
                                <Input type="number" value={formItem.netWeightPerPkg} onChange={e => handleItemChange('netWeightPerPkg', e.target.value)} placeholder="KG" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-text-muted mb-1">{t('totalNetWt')}</label>
                                <Input type="number" value={formItem.totalNet} onChange={e => handleItemChange('totalNet', e.target.value)} placeholder="Total Net" className="border-blue-200 focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-text-muted mb-1">{t('grossWtPerUnit')}</label>
                                <Input type="number" value={formItem.grossWeightPerPkg} onChange={e => handleItemChange('grossWeightPerPkg', e.target.value)} placeholder="KG" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-text-muted mb-1">{t('totalGrossWt')}</label>
                                <Input type="number" value={formItem.totalGross} onChange={e => handleItemChange('totalGross', e.target.value)} placeholder="Total Gross" className="border-blue-200 focus:border-blue-500" />
                            </div>
                        </div>

                        <Button onClick={handleUpsertItem} className={`w-full h-11 text-white ${editingId ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                            {editingId ? <><EditIcon className="w-5 h-5 me-2"/> {t('updateItem')}</> : <><PlusIcon className="w-5 h-5 me-2"/> {t('addItem')}</>}
                        </Button>

                        {/* Items List Summary (Interactive) */}
                        {items.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <h4 className="text-xs font-bold text-text-muted uppercase mb-3">Items Added</h4>
                                <div className="flex flex-col gap-2">
                                    {items.map(item => (
                                        <div key={item.id} className={`bg-white border rounded-lg p-3 flex justify-between items-center shadow-sm transition-colors ${editingId === item.id ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 hover:border-blue-300'}`}>
                                            <div className="flex items-center gap-4 overflow-hidden">
                                                <div className="bg-gray-100 px-3 py-1 rounded text-xs font-bold min-w-[60px] text-center">
                                                    {item.packages} {item.packageUnit}
                                                </div>
                                                <div className="flex flex-col truncate">
                                                    <span className="font-medium text-sm truncate">{item.desc}</span>
                                                    <span className="text-xs text-text-muted">NW: {item.totalNet} | GW: {item.totalGross}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 pl-2">
                                                <button onClick={() => handleEditItem(item)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors" title={t('edit')}>
                                                    <EditIcon className="w-4 h-4"/>
                                                </button>
                                                <button onClick={() => handleDeleteItem(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors" title={t('delete')}>
                                                    <TrashIcon className="w-4 h-4"/>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* ---------------- PREVIEW SECTION (BOTTOM) ---------------- */}
            <div className="flex justify-center mb-6 no-print border-t pt-8 mt-8">
                <h2 className="text-2xl font-bold text-text-heading flex items-center gap-2">
                    <DocumentTextIcon className="w-6 h-6"/> {t('officialPreview')}
                </h2>
            </div>
            
            {/* Force LTR and Left Align regardless of App Language */}
            <div id="printable-area-invoice" dir="ltr" className="text-left bg-gray-100 p-0 md:p-8 print:p-0 print:bg-white">
                <div id="printable-area-invoice-content" className="bg-white text-black shadow-xl mx-auto max-w-[210mm] print:shadow-none print:w-full print:max-w-none">
                    
                    {/* PACKING LIST SECTION */}
                    {/* Inline style for Page Break required to ensure printing works correctly */}
                    <div className="min-h-[297mm] p-8 relative print:p-0" style={{ pageBreakAfter: 'always' }}>
                        {invoiceData.logo && <img src={invoiceData.logo} alt="Logo" style={{ width: `${invoiceData.logoWidth}px` }} className="object-contain mx-auto mb-4 block" />}
                        <div className="border-b-2 border-black mb-4"></div>
                        <h1 className="text-center font-bold text-xl mb-6">PACKING LIST FOR INVOICE # {invoiceData.invoiceNo}</h1>
                        
                        <div className="grid grid-cols-[100px_1fr] gap-y-2 text-sm mb-6 font-serif text-left" dir="ltr">
                            <div className="font-bold text-left">DATE:</div>
                            <div className="text-left">{invoiceData.date}</div>
                            
                            <div className="font-bold text-left">EXPORTER:</div>
                            <div className="uppercase text-left">{invoiceData.exporterName}</div>
                            
                            <div className="font-bold text-left">ADDRESS:</div>
                            <div className="uppercase text-left">{invoiceData.exporterAddress}</div>
                            
                            <div className="font-bold mt-2 text-left">IMPORTER:</div>
                            <div className="uppercase mt-2 text-left">{invoiceData.importerName}</div>
                            
                            <div className="font-bold text-left">ADDRESS:</div>
                            <div className="uppercase text-left">{invoiceData.importerAddress}</div>
                        </div>

                        <table className="w-full border-collapse border border-black text-xs mb-4 text-center font-serif" dir="ltr">
                            <thead>
                                <tr>
                                    <th className="border border-black p-1 w-1/3 text-left">DESCRIPTION</th>
                                    <th className="border border-black p-1">PACKAGES</th>
                                    <th className="border border-black p-1">N.W</th>
                                    <th className="border border-black p-1">NET</th>
                                    <th className="border border-black p-1">GROSS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="border border-black p-1 text-left">{item.desc}</td>
                                        <td className="border border-black p-1">{item.packages} {item.packageUnit}</td>
                                        <td className="border border-black p-1">{item.netWeightPerPkg}</td>
                                        <td className="border border-black p-1">{item.totalNet}</td>
                                        <td className="border border-black p-1">{item.totalGross}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="font-bold">
                                    <td className="border border-black p-1 text-left">TOTAL</td>
                                    <td className="border border-black p-1">{totalPackages}</td>
                                    <td className="border border-black p-1"></td>
                                    <td className="border border-black p-1">{totalNet.toFixed(2)}</td>
                                    <td className="border border-black p-1">{totalGross.toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        </table>

                        <div className="flex justify-between items-end text-sm font-serif mt-8 text-left flex-row" dir="ltr">
                            <div className="space-y-1 w-full text-left">
                                <div><span className="font-bold">EGYPTIAN ORIGIN</span></div>
                                <div><span className="font-bold">NET WEIGHT:</span> {totalNet.toFixed(2)} KGS</div>
                                <div><span className="font-bold">GROSS WEIGHT:</span> {totalGross.toFixed(2)} KGS</div>
                                <div><span className="font-bold">PACKING IN:</span> {invoiceData.packingIn}</div>
                                <div><span className="font-bold">P.O.L:</span> {invoiceData.pol}</div>
                                <div><span className="font-bold">P.O.D:</span> {invoiceData.pod}</div>
                            </div>
                            <div className="text-center flex flex-col items-center flex-shrink-0 ml-8">
                                <div className="border-t border-black w-48 pt-1">SIGNATURE</div>
                                {invoiceData.seal && <img src={invoiceData.seal} alt="Seal" style={{ width: `${invoiceData.sealWidth}px` }} className="object-contain mt-2 block" />}
                            </div>
                        </div>
                    </div>

                    {/* INVOICE SECTION */}
                    <div className="min-h-[297mm] p-8 relative print:p-0 text-left" style={{direction: 'ltr', textAlign: 'left'}}>
                        {invoiceData.logo && <img src={invoiceData.logo} alt="Logo" style={{ width: `${invoiceData.logoWidth}px` }} className="object-contain mx-auto mb-4 block" />}
                         <div className="border-b-2 border-black mb-4"></div>
                        <h1 className="text-center font-bold text-xl mb-6">INVOICE # {invoiceData.invoiceNo}</h1>
                        
                        <div className="grid grid-cols-[100px_1fr] gap-y-2 text-sm mb-6 font-serif text-left" dir="ltr">
                            <div className="font-bold text-left">DATE:</div>
                            <div className="text-left">{invoiceData.date}</div>
                            
                            <div className="font-bold text-left">EXPORTER:</div>
                            <div className="uppercase text-left">{invoiceData.exporterName}</div>
                            
                            <div className="font-bold text-left">ADDRESS:</div>
                            <div className="uppercase text-left">{invoiceData.exporterAddress}</div>
                            
                            <div className="font-bold mt-2 text-left">IMPORTER:</div>
                            <div className="uppercase mt-2 text-left">{invoiceData.importerName}</div>
                            
                            <div className="font-bold text-left">ADDRESS:</div>
                            <div className="uppercase text-left">{invoiceData.importerAddress}</div>
                        </div>

                        <table className="w-full border-collapse border border-black text-xs mb-4 text-center font-serif" dir="ltr">
                            <thead>
                                <tr>
                                    <th className="border border-black p-1 w-1/2 text-left">DESCRIPTION</th>
                                    <th className="border border-black p-1">KGS</th>
                                    <th className="border border-black p-1">PRICE {currency}</th>
                                    <th className="border border-black p-1">TOTAL</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="border border-black p-1 text-left">{item.desc}</td>
                                        <td className="border border-black p-1">{item.totalGross}</td>
                                        <td className="border border-black p-1">{item.price.toFixed(2)}</td>
                                        <td className="border border-black p-1">{item.totalPrice.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="font-bold">
                                    <td colSpan={3} className="border border-black p-1 text-center">TOTAL PRICE {invoiceData.incoterm} SEA PORT</td>
                                    <td className="border border-black p-1">{grandTotal.toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        </table>

                        <div className="flex justify-between items-start text-sm font-serif mt-8 text-left flex-row" dir="ltr">
                            <div className="space-y-1 w-full text-left">
                                <div><span className="font-bold">EGYPTIAN ORIGIN</span></div>
                                <div><span className="font-bold">NET WEIGHT:</span> {totalNet.toFixed(2)} KGS</div>
                                <div><span className="font-bold">GROSS WEIGHT:</span> {totalGross.toFixed(2)} KGS</div>
                                <div><span className="font-bold">PACKING IN:</span> {invoiceData.packingIn}</div>
                                <div><span className="font-bold">P.O.L:</span> {invoiceData.pol}</div>
                                <div><span className="font-bold">P.O.D:</span> {invoiceData.pod}</div>
                                
                                {(invoiceData.bankName || invoiceData.iban) && (
                                    <div className="mt-4 pt-2 border-t border-black/50 text-left">
                                        <div className="font-bold underline mb-1">BANK DETAILS:</div>
                                        {invoiceData.bankName && <div>Bank: {invoiceData.bankName}</div>}
                                        {invoiceData.accountName && <div>Account Name: {invoiceData.accountName}</div>}
                                        {invoiceData.iban && <div>IBAN: {invoiceData.iban}</div>}
                                        {invoiceData.swiftCode && <div>SWIFT: {invoiceData.swiftCode}</div>}
                                        {invoiceData.advisingBank && <div>Advising: {invoiceData.advisingBank}</div>}
                                    </div>
                                )}
                            </div>
                            <div className="text-center flex flex-col items-center flex-shrink-0 ml-8">
                                <div className="border-t border-black w-48 pt-1">SIGNATURE</div>
                                {invoiceData.seal && <img src={invoiceData.seal} alt="Seal" style={{ width: `${invoiceData.sealWidth}px` }} className="object-contain mt-2 block" />}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
