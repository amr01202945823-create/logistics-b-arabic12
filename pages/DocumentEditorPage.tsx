
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocalization } from '../localization';
import type { Shipment } from '../types';
import { getShipmentDraft } from '../services/draftService';
import { Button, Card, CardContent, CardHeader, Input } from '../components/ui';
import { BookmarkIcon, FolderOpenIcon, PrintIcon, TrashIcon, DocumentTextIcon, SettingsIcon, XIcon, DownloadIcon } from '../components/icons';

// --- TYPES ---
interface FieldData {
    value: string;
    fontSize: number;
    align: 'left' | 'center' | 'right';
    isBold?: boolean;
}

interface PrintConfig {
    mode: 'full' | 'data-only';
    marginTop: number;
    marginLeft: number;
    fontSizeOffset: number;
}

interface InteractiveDocumentProps {
    data: Record<string, FieldData>;
    onChange: (name: string, val: string) => void;
    onFocus: (name: string) => void;
    printConfig: PrintConfig;
}

// Helper to create initial field data
const createField = (val: string = '', size: number = 10, align: 'left' | 'center' | 'right' = 'left', isBold: boolean = false): FieldData => ({
    value: val,
    fontSize: size,
    align,
    isBold
});

declare const html2pdf: any;

// Helper to detect text direction
const getDirection = (text: string): 'rtl' | 'ltr' => {
    const arabicRegex = /[\u0600-\u06FF]/;
    return arabicRegex.test(text) ? 'rtl' : 'ltr';
};

// --- EDITABLE COMPONENT ---
const EditableField: React.FC<{
    fieldData: FieldData;
    name: string;
    onChange: (name: string, value: string) => void;
    onFocus: (name: string) => void;
    className?: string;
    placeholder?: string;
    rows?: number;
}> = ({ fieldData, name, onChange, onFocus, className, placeholder, rows = 1 }) => (
    <textarea
        name={name}
        value={fieldData?.value || ''}
        onChange={(e) => onChange(name, e.target.value)}
        onFocus={() => onFocus(name)}
        placeholder={placeholder}
        className={`w-full h-full bg-transparent border-none resize-none focus:ring-0 focus:bg-blue-50/30 p-1 font-mono text-black placeholder-gray-300 hover:bg-gray-50/50 transition-colors
            ${fieldData?.isBold ? 'font-bold' : 'font-normal'}
            ${className || ''}
        `}
        rows={rows}
        style={{ 
            outline: 'none', 
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: `${fieldData?.fontSize || 10}pt`,
            textAlign: fieldData?.align || 'left'
        }} 
    />
);

// --- INTERACTIVE EUR.1 DOCUMENT ---
const InteractiveEur1: React.FC<InteractiveDocumentProps> = ({ data, onChange, onFocus, printConfig }) => {
    const borderClass = printConfig.mode === 'data-only' ? 'print:border-transparent' : 'print:border-green-700';
    const labelClass = printConfig.mode === 'data-only' ? 'print:text-transparent select-none' : '';
    const bgClass = printConfig.mode === 'data-only' ? 'print:bg-none' : 'certificate-green-pattern';
    const dottedClass = printConfig.mode === 'data-only' ? 'print:border-transparent' : 'border-gray-500';

    return (
        <div id="preview-eur1" className={`document-preview bg-white ${bgClass} font-serif text-black h-full relative transition-all`} dir="ltr">
            <div className={`border-2 border-green-700 ${borderClass} h-full flex flex-col`}>
                {/* Header Row 1 */}
                <div className={`flex border-b border-green-700 ${borderClass} h-[150px]`}>
                    <div className={`w-1/2 border-r border-green-700 ${borderClass} p-2 flex flex-col relative`}>
                        <div className={`preview-label ${labelClass}`}>1. Exporter (Name, full address, country)</div>
                        <EditableField name="exporter" fieldData={data.exporter} onChange={onChange} onFocus={onFocus} rows={5} />
                    </div>
                    <div className="w-1/2 flex flex-col">
                        <div className={`h-[40px] border-b border-green-700 ${borderClass} p-2 flex justify-between items-center`}>
                            <div className={`font-bold text-xl ${printConfig.mode === 'data-only' ? 'print:text-transparent' : ''}`}>EUR.1</div>
                            <div className="font-mono text-sm flex items-center gap-2">
                                <span className={labelClass}>No. A</span> 
                                <EditableField name="certNo" fieldData={data.certNo} onChange={onChange} onFocus={onFocus} className="text-red-600 text-lg font-bold w-24 !h-8" />
                            </div>
                        </div>
                        <div className="p-2 flex flex-col justify-center flex-grow">
                             <div className={`preview-label ${labelClass}`}>2. Certificate used in preferential trade between</div>
                             <div className={`border-b border-dotted ${dottedClass} mb-1 mt-1`}>
                                 <EditableField name="preferentialTrade1" fieldData={data.preferentialTrade1} onChange={onChange} onFocus={onFocus} />
                             </div>
                             <div className={`text-center text-[10px] mb-1 ${labelClass}`}>and</div>
                             <div className={`border-b border-dotted ${dottedClass}`}>
                                <EditableField name="preferentialTrade2" fieldData={data.preferentialTrade2} onChange={onChange} onFocus={onFocus} />
                             </div>
                        </div>
                    </div>
                </div>

                {/* Header Row 2 */}
                <div className={`flex border-b border-green-700 ${borderClass} h-[120px]`}>
                    <div className={`w-1/2 border-r border-green-700 ${borderClass} p-2 relative`}>
                        <div className={`preview-label ${labelClass}`}>3. Consignee (Name, full address, country) (Optional)</div>
                        <EditableField name="importer" fieldData={data.importer} onChange={onChange} onFocus={onFocus} rows={4} />
                    </div>
                    <div className="w-1/2 flex flex-col">
                         <div className={`h-1/2 border-b border-green-700 ${borderClass} p-2`}>
                            <div className={`preview-label ${labelClass}`}>4. Country, group of countries or territory in which the products are considered as originating</div>
                            <EditableField name="countryOfOrigin" fieldData={data.countryOfOrigin} onChange={onChange} onFocus={onFocus} />
                        </div>
                        <div className="h-1/2 p-2">
                            <div className={`preview-label ${labelClass}`}>5. Country, group of countries or territory of destination</div>
                            <EditableField name="countryOfDestination" fieldData={data.countryOfDestination} onChange={onChange} onFocus={onFocus} />
                        </div>
                    </div>
                </div>

                {/* Transport & Remarks */}
                <div className={`flex border-b border-green-700 ${borderClass} h-[130px]`}>
                    <div className={`w-1/2 border-r border-green-700 ${borderClass} p-2 relative`}>
                        <div className={`preview-label ${labelClass}`}>6. Transport details (Optional)</div>
                        <EditableField name="transportDetails" fieldData={data.transportDetails} onChange={onChange} onFocus={onFocus} rows={4} placeholder="e.g. BY SEA, FROM ALEXANDRIA TO ROTTERDAM" />
                    </div>
                    <div className="w-1/2 p-2 relative">
                        <div className={`preview-label ${labelClass}`}>7. Remarks</div>
                        <EditableField name="remarks" fieldData={data.remarks} onChange={onChange} onFocus={onFocus} rows={4} />
                    </div>
                </div>

                {/* Goods Table Headers */}
                <div className={`flex border-b border-green-700 ${borderClass} h-[50px]`}>
                     <div className={`w-[10%] border-r border-green-700 ${borderClass} p-1 text-center preview-label flex items-center justify-center ${labelClass}`}>8. Item number; Marks and numbers</div>
                     <div className={`w-[50%] border-r border-green-700 ${borderClass} p-1 text-center preview-label flex items-center justify-center ${labelClass}`}>Number and kind of packages (1); Description of goods</div>
                     <div className={`w-[20%] border-r border-green-700 ${borderClass} p-1 text-center preview-label flex items-center justify-center ${labelClass}`}>9. Gross mass (kg) or other measure</div>
                     <div className={`w-[20%] p-1 text-center preview-label flex items-center justify-center ${labelClass}`}>10. Invoices (Optional)</div>
                </div>

                {/* Goods Table Content */}
                <div className={`flex flex-grow border-b border-green-700 ${borderClass} relative`}>
                     <div className={`w-[10%] border-r border-green-700 ${borderClass} p-1`}>
                         <EditableField name="itemNumber" fieldData={data.itemNumber} onChange={onChange} onFocus={onFocus} />
                     </div>
                     <div className={`w-[50%] border-r border-green-700 ${borderClass} p-2 relative flex flex-col`}>
                         <EditableField name="goodsDescription" fieldData={data.goodsDescription} onChange={onChange} onFocus={onFocus} rows={10} />
                     </div>
                     <div className={`w-[20%] border-r border-green-700 ${borderClass} p-2`}>
                         <EditableField name="grossWeight" fieldData={data.grossWeight} onChange={onChange} onFocus={onFocus} />
                     </div>
                     <div className="w-[20%] p-2">
                         <EditableField name="invoice" fieldData={data.invoice} onChange={onChange} onFocus={onFocus} />
                     </div>
                </div>

                {/* Footer */}
                <div className="flex h-[180px]">
                    <div className={`w-1/2 border-r border-green-700 ${borderClass} p-2 relative`}>
                        <div className={`preview-label font-bold ${labelClass}`}>11. CUSTOMS ENDORSEMENT</div>
                        <div className={`text-[10px] mt-1 space-y-2 ${labelClass}`}>
                            <div className="flex">Declaration certified.</div>
                            <div className="flex">Export document (2) <span className={`border-b border-dotted ${dottedClass} flex-grow mx-1`}></span></div>
                            <div className="flex">Form <span className={`border-b border-dotted ${dottedClass} w-20 mx-1`}></span> No <span className={`border-b border-dotted ${dottedClass} w-20 mx-1`}></span></div>
                            <div className="flex">Customs office <span className={`border-b border-dotted ${dottedClass} flex-grow mx-1`}></span></div>
                            <div className="flex">Issuing country <span className={`border-b border-dotted ${dottedClass} flex-grow mx-1`}></span></div>
                        </div>
                        <div className="mt-8 text-[10px] flex gap-2 items-end">
                            <span className={labelClass}>Place and date</span>
                            <div className={`border-b border-dotted ${dottedClass} flex-grow`}>
                                <EditableField name="customsDate" fieldData={data.customsDate} onChange={onChange} onFocus={onFocus} className="h-6" />
                            </div>
                        </div>
                         <div className={`absolute bottom-2 right-2 text-[10px] ${labelClass}`}>(Signature)</div>
                    </div>
                     <div className="w-1/2 p-2 relative">
                        <div className={`preview-label font-bold ${labelClass}`}>12. DECLARATION BY THE EXPORTER</div>
                        <div className={`text-[10px] mt-2 text-justify leading-tight ${labelClass}`}>
                            I, the undersigned, declare that the goods described above meet the conditions required for the issue of this certificate.
                        </div>
                        <div className="mt-8 text-[10px] flex gap-2 items-end">
                            <span className={labelClass}>Place and date</span> 
                            <div className="flex-grow">
                                <EditableField name="exporterDate" fieldData={data.exporterDate} onChange={onChange} onFocus={onFocus} className="h-6" />
                            </div>
                        </div>
                         <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 w-40 h-10 border-b border-black ${printConfig.mode === 'data-only' ? 'print:border-transparent' : ''}`}></div>
                         <div className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 text-[10px] ${labelClass}`}>(Signature)</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- INTERACTIVE PHYTO DOCUMENT ---
const InteractivePhyto: React.FC<InteractiveDocumentProps> = ({ data, onChange, onFocus, printConfig }) => {
    const borderClass = printConfig.mode === 'data-only' ? 'print:border-transparent' : 'print:border-black';
    const labelClass = printConfig.mode === 'data-only' ? 'print:text-transparent select-none' : '';
    const bgClass = printConfig.mode === 'data-only' ? 'print:bg-none' : '';
    
    // STRICT LTR ENFORCEMENT
    const docDir = 'ltr';

    return (
        <div id="preview-phyto" className={`document-preview bg-white p-8 text-black font-serif relative ${bgClass}`} dir={docDir}>
            {/* Header */}
            <div className={`flex justify-between items-start mb-4 pb-2 border-b-2 border-double border-black ${printConfig.mode === 'data-only' ? 'print:border-transparent' : ''}`}>
                <div className={`w-1/3 text-center ${labelClass}`}>
                    <div className="font-bold text-sm">Arab Republic of Egypt</div>
                    <div className="text-xs">Ministry of Agriculture</div>
                    <div className="mt-2 w-16 h-16 border border-black rounded-full mx-auto flex items-center justify-center text-[8px]">LOGO</div>
                </div>
                <div className="w-1/3 text-center pt-4">
                    <h2 className={`font-bold text-2xl uppercase ${labelClass}`}>Phytosanitary Certificate</h2>
                    <div className="font-mono text-lg mt-2 flex justify-center items-center gap-2">
                        <span className={labelClass}>No.</span> 
                        <EditableField name="certNo" fieldData={data.certNo} onChange={onChange} onFocus={onFocus} className="text-red-600 w-32 text-center !h-8" />
                    </div>
                </div>
                 <div className="w-1/3 text-center text-xs pt-8">
                    <div className={`mb-1 ${labelClass}`}>1. To the National Plant Protection Organization of:</div>
                    <div className={`border-b border-black ${printConfig.mode === 'data-only' ? 'print:border-transparent' : ''}`}>
                        <EditableField name="to" fieldData={data.to} onChange={onChange} onFocus={onFocus} />
                    </div>
                </div>
            </div>

            {/* Exporter/Consignee */}
            <div className="grid grid-cols-2 gap-8 mb-6">
                <div className={`border border-gray-400 ${borderClass} p-3 rounded min-h-[100px]`}>
                    <div className={`preview-label font-bold ${labelClass}`}>2. Name and address of exporter:</div>
                    <EditableField name="exporter" fieldData={data.exporter} onChange={onChange} onFocus={onFocus} rows={3} />
                </div>
                <div className={`border border-gray-400 ${borderClass} p-3 rounded min-h-[100px]`}>
                    <div className={`preview-label font-bold ${labelClass}`}>3. Declared name and address of consignee:</div>
                    <EditableField name="consignee" fieldData={data.consignee} onChange={onChange} onFocus={onFocus} rows={3} />
                </div>
            </div>
            
            <div className={`bg-gray-200 p-1 text-center font-bold mb-0 border border-black text-sm ${printConfig.mode === 'data-only' ? 'print:hidden' : ''}`}>Description of the Consignment</div>
            <table className={`w-full border-collapse border border-black mb-6 text-xs ${borderClass}`}>
                <tbody>
                    <tr className={`border-b border-black ${borderClass}`}>
                        <td className={`w-1/3 p-2 border-r border-black ${borderClass}`}>
                            <div className={`preview-label ${labelClass}`}>4. Declared means of conveyance</div>
                            <EditableField name="conveyance" fieldData={data.conveyance} onChange={onChange} onFocus={onFocus} />
                        </td>
                        <td className={`w-1/3 p-2 border-r border-black ${borderClass}`}>
                            <div className={`preview-label ${labelClass}`}>5. Declared point of entry</div>
                            <EditableField name="entryPoint" fieldData={data.entryPoint} onChange={onChange} onFocus={onFocus} />
                        </td>
                        <td className="w-1/3 p-2">
                            <div className={`preview-label ${labelClass}`}>6. Place of origin</div>
                            <EditableField name="placeOfOrigin" fieldData={data.placeOfOrigin} onChange={onChange} onFocus={onFocus} />
                        </td>
                    </tr>
                     <tr className={`border-b border-black ${borderClass}`}>
                        <td className={`p-2 border-r border-black align-top h-[80px] ${borderClass}`}>
                            <div className={`preview-label ${labelClass}`}>7. Distinguishing marks</div>
                            <EditableField name="distinguishingMarks" fieldData={data.distinguishingMarks} onChange={onChange} onFocus={onFocus} rows={2} />
                        </td>
                        <td className={`p-2 border-r border-black align-top ${borderClass}`}>
                            <div className={`preview-label ${labelClass}`}>8. Number and description of packages</div>
                            <EditableField name="numAndDesc" fieldData={data.numAndDesc} onChange={onChange} onFocus={onFocus} rows={3} />
                        </td>
                        <td className="p-2 align-top">
                            <div className={`preview-label ${labelClass}`}>9. Name of produce and quantity declared</div>
                            <EditableField name="nameOfProduce" fieldData={data.nameOfProduce} onChange={onChange} onFocus={onFocus} rows={3} />
                        </td>
                    </tr>
                     <tr>
                        <td colSpan={3} className="p-2 h-[60px] align-top">
                            <div className={`preview-label ${labelClass}`}>10. Botanical name of plants</div>
                            <EditableField name="botanicalName" fieldData={data.botanicalName} onChange={onChange} onFocus={onFocus} className="italic text-lg" />
                        </td>
                    </tr>
                </tbody>
            </table>
            
            <div className={`text-[10px] text-justify mb-6 p-3 border border-black bg-gray-50 rounded leading-relaxed ${printConfig.mode === 'data-only' ? 'print:hidden' : ''