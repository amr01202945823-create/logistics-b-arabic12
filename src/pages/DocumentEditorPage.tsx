
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocalization } from '../localization';
import type { Shipment } from '../types';
import { getShipmentDraft } from '../services/draftService';
import { Button, Card, CardContent, CardHeader, Input } from '../components/ui';
import { BookmarkIcon, FolderOpenIcon, PrintIcon, TrashIcon, SparklesIcon, DocumentTextIcon, ArrowLeftIcon, ChevronDownIcon, PlusIcon, DownloadIcon, SettingsIcon, XIcon } from '../components/icons';

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
            
            <div className={`text-[10px] text-justify mb-6 p-3 border border-black bg-gray-50 rounded leading-relaxed ${printConfig.mode === 'data-only' ? 'print:hidden' : ''}`}>
                This is to certify that the plants, plant products or other regulated articles described herein have been inspected and/or tested...
            </div>

            <div className={`bg-gray-200 p-1 text-center font-bold mb-0 border border-black text-sm ${printConfig.mode === 'data-only' ? 'print:hidden' : ''}`}>Disinfestation and/or Disinfection Treatment</div>
            <table className={`w-full border-collapse border border-black mb-6 text-xs ${borderClass}`}>
                 <tbody>
                    <tr className={`border-b border-black ${borderClass}`}>
                        <td className={`p-2 border-r border-black w-1/4 ${borderClass}`}><div className={`preview-label ${labelClass}`}>11. Date</div><EditableField name="treatmentDate" fieldData={data.treatmentDate} onChange={onChange} onFocus={onFocus} /></td>
                        <td className={`p-2 border-r border-black w-1/4 ${borderClass}`}><div className={`preview-label ${labelClass}`}>12. Treatment</div><EditableField name="treatment" fieldData={data.treatment} onChange={onChange} onFocus={onFocus} /></td>
                        <td className={`p-2 border-r border-black w-1/4 ${borderClass}`}><div className={`preview-label ${labelClass}`}>13. Chemical</div><EditableField name="chemical" fieldData={data.chemical} onChange={onChange} onFocus={onFocus} /></td>
                        <td className="p-2 w-1/4"><div className={`preview-label ${labelClass}`}>14. Concentration</div><EditableField name="concentration" fieldData={data.concentration} onChange={onChange} onFocus={onFocus} /></td>
                    </tr>
                     <tr>
                        <td colSpan={2} className={`p-2 border-r border-black ${borderClass}`}><div className={`preview-label ${labelClass}`}>15. Duration and temperature</div><EditableField name="durationTemp" fieldData={data.durationTemp} onChange={onChange} onFocus={onFocus} /></td>
                        <td colSpan={2} className="p-2"><div className={`preview-label ${labelClass}`}>16. Additional information</div><EditableField name="addInfo" fieldData={data.addInfo} onChange={onChange} onFocus={onFocus} /></td>
                    </tr>
                </tbody>
            </table>

             <div className={`border border-black p-3 mb-6 min-h-[60px] ${borderClass}`}>
                 <div className={`preview-label font-bold mb-1 ${labelClass}`}>17. Additional Declaration</div>
                 <EditableField name="addDeclaration" fieldData={data.addDeclaration} onChange={onChange} onFocus={onFocus} rows={2} />
             </div>
             
             <div className={`flex justify-between items-end mt-auto border-t border-black pt-4 ${printConfig.mode === 'data-only' ? 'print:border-transparent' : ''}`}>
                 <div className="w-1/3">
                     <div className={`preview-label ${labelClass}`}>Place of Issue</div>
                     <div className={`border-b border-black mb-2 pb-1 ${printConfig.mode === 'data-only' ? 'print:border-transparent' : ''}`}><EditableField name="issuePlace" fieldData={data.issuePlace} onChange={onChange} onFocus={onFocus} /></div>
                     <div className={`preview-label ${labelClass}`}>Date</div>
                     <div className={`border-b border-black pb-1 ${printConfig.mode === 'data-only' ? 'print:border-transparent' : ''}`}><EditableField name="issueDate" fieldData={data.issueDate} onChange={onChange} onFocus={onFocus} /></div>
                 </div>
                 <div className={`w-1/3 text-center ${labelClass}`}>
                     <div className="preview-label">Stamp of Organization</div>
                     <div className="h-20 w-20 rounded-full border-2 border-dotted border-gray-400 mx-auto mt-2 flex items-center justify-center text-[8px] text-gray-400">OFFICIAL STAMP</div>
                 </div>
                  <div className="w-1/3 text-right">
                     <div className={`preview-label ${labelClass}`}>Name of Authorized Officer</div>
                     <div className={`border-b border-black mb-6 pb-1 text-center ${printConfig.mode === 'data-only' ? 'print:border-transparent' : ''}`}><EditableField name="authOfficerName" fieldData={data.authOfficerName} onChange={onChange} onFocus={onFocus} /></div>
                     <div className={`text-[10px] text-center ${labelClass}`}>(Signature)</div>
                 </div>
             </div>
        </div>
    );
}

// --- INTERACTIVE COMESA DOCUMENT ---
const InteractiveComesa: React.FC<InteractiveDocumentProps> = ({ data, onChange, onFocus, printConfig }) => {
    const borderClass = printConfig.mode === 'data-only' ? 'print:border-transparent' : 'print:border-black';
    const labelClass = printConfig.mode === 'data-only' ? 'print:text-transparent select-none' : '';
    const bgClass = printConfig.mode === 'data-only' ? 'print:bg-none' : 'certificate-green-pattern';
    
    // STRICT LTR ENFORCEMENT
    const docDir = 'ltr';

    return (
        <div id="preview-comesa" className={`document-preview bg-white ${bgClass} font-serif text-black h-full`} dir={docDir}>
             <div className={`border border-black ${borderClass} h-full flex flex-col`}>
                 {/* Row 1 */}
                <div className={`flex border-b border-black ${borderClass} h-[140px]`}>
                    <div className={`w-1/2 border-r border-black ${borderClass} p-2 flex flex-col`}>
                        <div className={`preview-label ${labelClass}`}>1. Exporter (Name & Office address)</div>
                        <EditableField name="exporter" fieldData={data.exporter} onChange={onChange} onFocus={onFocus} rows={4} />
                    </div>
                    <div className="w-1/2 p-2 relative flex flex-col items-center">
                         <div className="absolute top-2 right-2 font-mono text-xl text-red-600 font-bold">
                             <EditableField name="certNo" fieldData={data.certNo} onChange={onChange} onFocus={onFocus} className="!h-8 w-32 text-right" />
                         </div>
                         <div className={`w-16 h-16 rounded-full border border-black flex items-center justify-center mt-4 bg-gray-100 text-[8px] text-center p-1 ${labelClass} ${printConfig.mode === 'data-only' ? 'print:border-transparent print:bg-transparent' : ''}`}>
                             COMESA LOGO
                         </div>
                         <div className={`mt-2 text-center font-bold text-sm ${labelClass}`}>COMESA CERTIFICATE OF ORIGIN</div>
                         <div className={`text-center font-bold text-2xl mt-1 ${labelClass}`}>EG</div>
                    </div>
                </div>

                {/* Row 2 */}
                <div className={`flex border-b border-black ${borderClass} h-[100px]`}>
                     <div className={`w-1/2 border-r border-black ${borderClass} p-2 flex flex-col`}>
                        <div className={`preview-label ${labelClass}`}>2. Consignee (Name & Office address)</div>
                        <EditableField name="importer" fieldData={data.importer} onChange={onChange} onFocus={onFocus} rows={3} />
                    </div>
                     <div className={`w-1/2 p-2 flex flex-col text-center justify-center bg-green-50/50 ${printConfig.mode === 'data-only' ? 'print:bg-none' : ''}`}>
                        <div className={`font-bold text-xs uppercase ${labelClass}`}>COMMON MARKET FOR EASTERN AND SOUTHERN AFRICA</div>
                    </div>
                </div>

                {/* Row 3 */}
                 <div className={`flex border-b border-black ${borderClass} h-[70px]`}>
                     <div className={`w-1/2 border-r border-black ${borderClass} p-2 flex flex-col`}>
                        <div className={`preview-label ${labelClass}`}>3. Country, Group of countries in which the products are considered as originating</div>
                        <EditableField name="countryOfOrigin" fieldData={data.countryOfOrigin} onChange={onChange} onFocus={onFocus} />
                    </div>
                     <div className="w-1/2 p-2 flex flex-col">
                         <div className={`preview-label ${labelClass}`}>Ref No.</div>
                         <EditableField name="refNo" fieldData={data.refNo} onChange={onChange} onFocus={onFocus} />
                    </div>
                </div>

                {/* Row 4 */}
                 <div className={`flex border-b border-black ${borderClass} h-[70px]`}>
                     <div className={`w-1/2 border-r border-black ${borderClass} p-2 flex flex-col`}>
                        <div className={`preview-label ${labelClass}`}>4. Particulars of Transport</div>
                        <EditableField name="transportDetails" fieldData={data.transportDetails} onChange={onChange} onFocus={onFocus} />
                    </div>
                     <div className="w-1/2 p-2 flex flex-col">
                         <div className={`preview-label ${labelClass}`}>5. For Official use</div>
                    </div>
                </div>

                {/* Table Header */}
                <div className={`flex border-b border-black ${borderClass} h-[50px] bg-green-100/30 ${printConfig.mode === 'data-only' ? 'print:bg-none' : ''}`}>
                    <div className={`w-[30%] border-r border-black ${borderClass} p-1 text-center preview-label flex items-center justify-center ${labelClass}`}>6. Marks and Numbers; number and kind of package</div>
                    <div className={`w-[10%] border-r border-black ${borderClass} p-1 text-center preview-label flex items-center justify-center ${labelClass}`}>7. Customs Tariff No.</div>
                    <div className={`w-[15%] border-r border-black ${borderClass} p-1 text-center preview-label flex items-center justify-center ${labelClass}`}>8. Origin criterion</div>
                    <div className={`w-[20%] border-r border-black ${borderClass} p-1 text-center preview-label flex items-center justify-center ${labelClass}`}>9. Gross weight or other quantity</div>
                    <div className={`w-[25%] p-1 text-center preview-label flex items-center justify-center ${labelClass}`}>10. Invoice No.</div>
                </div>

                {/* Table Content */}
                <div className={`flex flex-grow border-b border-black ${borderClass} relative`}>
                    <div className={`w-[30%] border-r border-black ${borderClass} p-2`}>
                        <EditableField name="goodsDescription" fieldData={data.goodsDescription} onChange={onChange} onFocus={onFocus} rows={12} />
                    </div>
                    <div className={`w-[10%] border-r border-black ${borderClass} p-2 text-center`}><EditableField name="tariffItem" fieldData={data.tariffItem} onChange={onChange} onFocus={onFocus} /></div>
                    <div className={`w-[15%] border-r border-black ${borderClass} p-2 text-center`}><EditableField name="originCriterion" fieldData={data.originCriterion} onChange={onChange} onFocus={onFocus} /></div>
                    <div className={`w-[20%] border-r border-black ${borderClass} p-2 text-center`}><EditableField name="grossWeight" fieldData={data.grossWeight} onChange={onChange} onFocus={onFocus} /></div>
                    <div className="w-[25%] p-2 text-center"><EditableField name="invoice" fieldData={data.invoice} onChange={onChange} onFocus={onFocus} /></div>
                </div>

                {/* Footer */}
                 <div className="flex h-[130px]">
                     <div className={`w-1/2 border-r border-black ${borderClass} p-2`}>
                        <div className={`preview-label font-bold ${labelClass}`}>11. DECLARATION BY EXPORTER/PRODUCER/SUPPLIER</div>
                        <div className={`text-[10px] mt-1 leading-tight ${labelClass}`}>I, the undersigned, hereby declare that the above details and statements are correct, that all goods are produced in <span className="font-bold">EGYPT</span>.</div>
                         <div className="mt-6 text-[10px] flex items-center gap-2">
                             <span className={labelClass}>Place, date, signature:</span> 
                             <EditableField name="exporterDate" fieldData={data.exporterDate} onChange={onChange} onFocus={onFocus} className="h-6 font-bold" />
                         </div>
                    </div>
                    <div className="w-1/2 p-2">
                         <div className={`preview-label font-bold ${labelClass}`}>12. CERTIFICATE OF ORIGIN</div>
                         <div className={`text-[10px] mt-1 ${labelClass}`}>It is hereby certified that the above-mentioned goods are of Egyptian origin.</div>
                         <div className={`mt-6 text-[10px] ${labelClass}`}>STAMP - SCEAU - CARIMBO</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- INTERACTIVE MERCOSUR DOCUMENT ---
const InteractiveMercosur: React.FC<InteractiveDocumentProps> = ({ data, onChange, onFocus, printConfig }) => {
    const borderClass = printConfig.mode === 'data-only' ? 'print:border-transparent' : 'print:border-black';
    const labelClass = printConfig.mode === 'data-only' ? 'print:text-transparent select-none' : '';
    const bgClass = printConfig.mode === 'data-only' ? 'print:bg-none' : '';
    
    // STRICT LTR ENFORCEMENT
    const docDir = 'ltr';

    return (
        <div id="preview-mercosur" className={`document-preview bg-white p-0 text-black font-serif relative ${bgClass}`} dir={docDir}>
            {/* Fancy Border */}
            <div className={`absolute inset-[5mm] border-4 border-double border-green-800 pointer-events-none z-10 ${printConfig.mode === 'data-only' ? 'print:border-transparent' : ''}`}></div>
            
            <div className={`border border-black ${borderClass} h-full flex flex-col z-20 relative bg-white/90 ${printConfig.mode === 'data-only' ? 'print:bg-transparent' : ''}`}>
                <div className={`border-b border-black ${borderClass} p-2 text-center font-bold text-lg bg-gray-100 ${printConfig.mode === 'data-only' ? 'print:bg-none' : ''}`}>
                    <span className={labelClass}>MERCOSUR - EGYPT CERTIFICATE OF ORIGIN</span>
                </div>
                
                <div className={`flex border-b border-black ${borderClass} h-[120px]`}>
                     <div className={`w-1/2 border-r border-black ${borderClass} p-2`}>
                        <div className={`preview-label ${labelClass}`}>1. Exporter (name, address, country)</div>
                        <EditableField name="exporter" fieldData={data.exporter} onChange={onChange} onFocus={onFocus} rows={3} />
                    </div>
                    <div className="w-1/2 p-2">
                        <div className={`preview-label ${labelClass}`}>Certificate No</div>
                        <EditableField name="certNo" fieldData={data.certNo} onChange={onChange} onFocus={onFocus} className="text-2xl font-mono text-right mt-2" />
                        <div className={`text-[10px] mt-4 text-center ${labelClass}`}>General Organization of Export and Import Control (GOEIC)</div>
                    </div>
                </div>

                <div className={`border-b border-black ${borderClass} p-2 h-[80px]`}>
                     <div className={`preview-label ${labelClass}`}>2. Importer (name, address, country)</div>
                     <EditableField name="importer" fieldData={data.importer} onChange={onChange} onFocus={onFocus} rows={2} />
                </div>

                 <div className={`flex border-b border-black ${borderClass} h-[70px]`}>
                     <div className={`w-1/3 border-r border-black ${borderClass} p-2`}>
                        <div className={`preview-label ${labelClass}`}>3. Port of shipment (Optional)</div>
                        <EditableField name="portOfShipment" fieldData={data.portOfShipment} onChange={onChange} onFocus={onFocus} />
                    </div>
                    <div className={`w-1/3 border-r border-black ${borderClass} p-2`}>
                        <div className={`preview-label ${labelClass}`}>4. Country of Origin</div>
                        <EditableField name="countryOfOrigin" fieldData={data.countryOfOrigin} onChange={onChange} onFocus={onFocus} />
                    </div>
                     <div className="w-1/3 p-2">
                        <div className={`preview-label ${labelClass}`}>5. Country of Destination</div>
                        <EditableField name="countryOfDestination" fieldData={data.countryOfDestination} onChange={onChange} onFocus={onFocus} />
                    </div>
                </div>

                <div className={`border-b border-black ${borderClass} p-2 h-[50px] flex items-center`}>
                     <div className={`preview-label mr-4 ${labelClass}`}>6. Commercial Invoice</div>
                     <div className="flex gap-12 text-sm flex-grow">
                         <div className="flex items-center gap-2"><span className={labelClass}>Number:</span> <EditableField name="invoice" fieldData={data.invoice} onChange={onChange} onFocus={onFocus} className="!w-32" /></div>
                         <div className="flex items-center gap-2"><span className={labelClass}>Date:</span> <EditableField name="invoiceDate" fieldData={data.invoiceDate} onChange={onChange} onFocus={onFocus} className="!w-32" /></div>
                     </div>
                </div>

                {/* Table */}
                <div className={`flex border-b border-black ${borderClass} h-[40px] bg-gray-50 ${printConfig.mode === 'data-only' ? 'print:bg-none' : ''}`}>
                     <div className={`w-[15%] border-r border-black ${borderClass} p-1 text-center preview-label flex items-center justify-center ${labelClass}`}>7. Tariff item number</div>
                     <div className={`w-[45%] border-r border-black ${borderClass} p-1 text-center preview-label flex items-center justify-center ${labelClass}`}>8. Goods description</div>
                     <div className={`w-[20%] border-r border-black ${borderClass} p-1 text-center preview-label flex items-center justify-center ${labelClass}`}>9. Origin criteria</div>
                     <div className={`w-[20%] p-1 text-center preview-label flex items-center justify-center ${labelClass}`}>10. Gross Mass (kg)</div>
                </div>
                <div className={`flex flex-grow border-b border-black ${borderClass}`}>
                     <div className={`w-[15%] border-r border-black ${borderClass} p-2 text-center`}><EditableField name="tariffItem" fieldData={data.tariffItem} onChange={onChange} onFocus={onFocus} /></div>
                     <div className={`w-[45%] border-r border-black ${borderClass} p-2`}><EditableField name="goodsDescription" fieldData={data.goodsDescription} onChange={onChange} onFocus={onFocus} rows={10} /></div>
                     <div className={`w-[20%] border-r border-black ${borderClass} p-2 text-center`}><EditableField name="originCriterion" fieldData={data.originCriterion} onChange={onChange} onFocus={onFocus} /></div>
                     <div className="w-[20%] p-2 text-center"><EditableField name="grossWeight" fieldData={data.grossWeight} onChange={onChange} onFocus={onFocus} /></div>
                </div>

                <div className={`border-b border-black ${borderClass} p-2 h-[80px]`}>
                     <div className={`preview-label ${labelClass}`}>11. Remarks</div>
                     <EditableField name="remarks" fieldData={data.remarks} onChange={onChange} onFocus={onFocus} rows={2} />
                </div>

                 <div className="flex h-[140px]">
                     <div className={`w-1/2 border-r border-black ${borderClass} p-2`}>
                        <div className={`preview-label ${labelClass}`}>12. Statement by the exporter:</div>
                        <div className={`text-[9px] mt-1 text-justify ${labelClass}`}>I, the undersigned, declare that the goods described above meet the conditions required for the issuance of this Certificate of Origin.</div>
                        <div className="mt-8 text-[10px] flex items-center gap-2">
                            <span className={labelClass}>Place and Date:</span> 
                            <EditableField name="exporterDate" fieldData={data.exporterDate} onChange={onChange} onFocus={onFocus} className="h-6" />
                        </div>
                        <div className={`mt-4 text-[10px] ${labelClass}`}>Stamp and Signature</div>
                    </div>
                    <div className="w-1/2 p-2">
                         <div className={`preview-label ${labelClass}`}>13. Certification Authority certifies that:</div>
                         <div className={`text-[9px] mt-1 text-justify ${labelClass}`}>This is to certify the authenticity of the precedent statement in accordance with the applicable regulations.</div>
                         <div className="mt-8 text-[10px] flex items-center gap-2">
                             <span className={labelClass}>Place and Date:</span> 
                             <EditableField name="issueDate" fieldData={data.issueDate} onChange={onChange} onFocus={onFocus} className="h-6" />
                         </div>
                         <div className={`mt-4 text-[10px] ${labelClass}`}>Stamp and Signature</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- MAIN PAGE COMPONENT ---

const initialData: Record<string, FieldData> = {
    certNo: createField('', 12, 'right'),
    to: createField('', 10, 'center', true),
    exporter: createField('', 10, 'left'),
    importer: createField('', 10, 'left'),
    consignee: createField('', 10, 'left'),
    conveyance: createField('', 10, 'left', true),
    entryPoint: createField('', 10, 'left', true),
    placeOfOrigin: createField('EGYPT', 10, 'left', true),
    distinguishingMarks: createField('', 10, 'left'),
    numAndDesc: createField('', 10, 'left'),
    nameOfProduce: createField('', 10, 'left'),
    botanicalName: createField('', 12, 'center'),
    treatment: createField('', 10, 'left'),
    chemical: createField('', 10, 'left'),
    concentration: createField('', 10, 'left'),
    durationTemp: createField('', 10, 'left'),
    addInfo: createField('', 10, 'left'),
    addDeclaration: createField('', 10, 'left'),
    issueDate: createField('', 10, 'left'),
    issuePlace: createField('Cairo', 10, 'left'),
    authOfficerName: createField('', 10, 'center'),
    itemNumber: createField('1', 10, 'center'),
    marksAndNumbers: createField('', 10, 'left'),
    packages: createField('', 10, 'left'),
    goodsDescription: createField('', 10, 'left'),
    grossWeight: createField('', 10, 'right'),
    invoice: createField('', 10, 'center'),
    invoiceDate: createField('', 10, 'left', true),
    countryOfOrigin: createField('EGYPT', 10, 'center', true),
    countryOfDestination: createField('', 10, 'center', true),
    preferentialTrade1: createField('ARAB REPUBLIC OF EGYPT', 10, 'center', true),
    preferentialTrade2: createField('THE EUROPEAN COMMUNITY', 10, 'center', true),
    remarks: createField('', 10, 'left'),
    customsDate: createField('', 10, 'left'),
    exporterDate: createField('', 10, 'left', true),
    transportDetails: createField('', 10, 'left'),
    tariffItem: createField('', 10, 'center'),
    originCriterion: createField('', 10, 'center'),
    portOfShipment: createField('', 10, 'left'),
    vessel: createField('', 10, 'left'),
    refNo: createField('', 10, 'left'),
    treatmentDate: createField('', 10, 'left'),
};

export const DocumentEditorPage: React.FC<{ shipments: Record<string, Shipment> }> = ({ shipments }) => {
    const { t } = useLocalization();
    const [certType, setCertType] = useState('eur1');
    const [shipmentId, setShipmentId] = useState('');
    const [data, setData] = useState<Record<string, FieldData>>(initialData);
    
    // Updated Print Config State
    const [printConfig, setPrintConfig] = useState<PrintConfig>({
        mode: 'full',
        marginTop: 0,
        marginLeft: 0,
        fontSizeOffset: 0
    });
    
    const [zoom, setZoom] = useState(100);
    const [activeField, setActiveField] = useState<string | null>(null);
    const [showSettings, setShowSettings] = useState(false);
    const previewRef = useRef<HTMLDivElement>(null);

    // Handle text value changes
    const handleChange = (name: string, value: string) => {
        setData(prev => ({
            ...prev,
            [name]: { ...prev[name], value }
        }));
    };

    // Handle active field selection
    const handleFocus = (name: string) => {
        setActiveField(name);
    };

    // Handle style updates
    const updateFieldStyle = (updates: Partial<FieldData>) => {
        if (!activeField) return;
        setData(prev => ({
            ...prev,
            [activeField]: { ...prev[activeField], ...updates }
        }));
    };

    const handleFontSizeChange = (delta: number) => {
        if (!activeField) return;
        const currentSize = data[activeField]?.fontSize || 10;
        updateFieldStyle({ fontSize: Math.max(6, currentSize + delta) });
    };

    const handleAlignChange = (align: 'left' | 'center' | 'right') => {
        updateFieldStyle({ align });
    };

    const handleLoadFromShipment = () => {
        const draft = getShipmentDraft(shipmentId);
        const shipment = shipments[shipmentId];
        if (!draft && !shipment) {
            alert(t('shipmentNotFound', { shipmentId }));
            return;
        }
        
        // Update only values, preserve styles
        setData(prev => ({
            ...prev,
            exporter: { ...prev.exporter, value: draft?.exporterName || prev.exporter.value },
            importer: { ...prev.importer, value: draft?.importerName || shipment?.customer || prev.importer.value },
            consignee: { ...prev.consignee, value: draft?.importerName || shipment?.customer || prev.consignee.value },
            transportDetails: { ...prev.transportDetails, value: `${draft?.vessel || shipment?.vesselName || ''} ${draft?.portOfLoading || ''} to ${draft?.portOfDischarge || ''}` },
            conveyance: { ...prev.conveyance, value: draft?.vessel || shipment?.vesselName || prev.conveyance.value },
            to: { ...prev.to, value: draft?.portOfDischarge || shipment?.destination || prev.to.value },
            goodsDescription: { ...prev.goodsDescription, value: draft?.descriptionOfGoods || prev.goodsDescription.value },
            grossWeight: { ...prev.grossWeight, value: draft?.grossWeight || shipment?.weight || prev.grossWeight.value },
            certNo: { ...prev.certNo, value: shipmentId },
            vessel: { ...prev.vessel, value: draft?.vessel || shipment?.vesselName || prev.vessel.value },
            portOfShipment: { ...prev.portOfShipment, value: draft?.portOfLoading || shipment?.portOfLoading || prev.portOfShipment.value },
        }));
        alert(t('dataLoadedSuccess', { shipmentId }));
    };

    const handleClear = () => {
        if(window.confirm(t('confirmClear'))) setData(initialData);
    };

    const handleDownloadPdf = () => {
        if (!previewRef.current) return;
        
        const element = previewRef.current;
        const clone = element.cloneNode(true) as HTMLElement;
        
        // FIX: Sync textarea values to the cloned fields
        const originalTextareas = element.querySelectorAll('textarea');
        const clonedTextareas = clone.querySelectorAll('textarea');
        originalTextareas.forEach((orig, index) => {
            if (clonedTextareas[index]) {
                clonedTextareas[index].value = orig.value;
                clonedTextareas[index].textContent = orig.value; // Important for some renderers
            }
        });

        // Apply print settings to clone
        clone.style.transform = 'none';
        clone.style.margin = '0';
        clone.style.width = '210mm';
        clone.style.minHeight = '297mm';
        clone.style.overflow = 'hidden';
        clone.style.paddingTop = `${printConfig.marginTop}mm`;
        clone.style.paddingLeft = `${printConfig.marginLeft}mm`;
        
        // Create a temp container off-screen
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '0';
        container.appendChild(clone);
        document.body.appendChild(container);

        const opt = {
            margin: 0,
            filename: `Document_${certType}_${shipmentId || 'draft'}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, letterRendering: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(clone).save().then(() => {
            document.body.removeChild(container);
        });
    };

    const renderDocument = () => {
        const props = { data, onChange: handleChange, onFocus: handleFocus, printConfig };
        switch (certType) {
            case 'agricultural': return <InteractivePhyto {...props} />;
            case 'comesa': return <InteractiveComesa {...props} />;
            case 'mercosur': return <InteractiveMercosur {...props} />;
            default: return <InteractiveEur1 {...props} />;
        }
    };

    const certTypes = [
        { id: 'eur1', label: 'EUR.1' },
        { id: 'comesa', label: 'COMESA' },
        { id: 'mercosur', label: 'MERCOSUR' },
        { id: 'agricultural', label: 'Phyto' },
    ];

    return (
        <div className="min-h-screen bg-gray-100 pb-20">
            {/* Toolbar */}
            <div className="sticky top-[60px] z-40 bg-white border-b border-gray-200 shadow-sm px-4 py-3 no-print">
                <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><DocumentTextIcon className="w-6 h-6"/></div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">{t('documentEditor')}</h1>
                            <p className="text-xs text-gray-500">Interactive Editor</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Formatting Controls - Only show when field active */}
                        <div className={`flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-200 transition-opacity ${activeField ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                            <span className="text-[10px] font-bold text-gray-500 px-2 uppercase">{t('formatting')}</span>
                            <button onClick={() => handleFontSizeChange(-1)} className="p-1.5 hover:bg-white rounded border border-transparent hover:border-gray-200" title={t('decreaseFont')}>A-</button>
                            <button onClick={() => handleFontSizeChange(1)} className="p-1.5 hover:bg-white rounded border border-transparent hover:border-gray-200" title={t('increaseFont')}>A+</button>
                            <div className="w-px h-4 bg-gray-300 mx-1"></div>
                            <button onClick={() => handleAlignChange('left')} className={`p-1.5 rounded ${data[activeField || '']?.align === 'left' ? 'bg-blue-100 text-blue-600' : 'hover:bg-white'}`} title={t('alignLeft')}>L</button>
                            <button onClick={() => handleAlignChange('center')} className={`p-1.5 rounded ${data[activeField || '']?.align === 'center' ? 'bg-blue-100 text-blue-600' : 'hover:bg-white'}`} title={t('alignCenter')}>C</button>
                            <button onClick={() => handleAlignChange('right')} className={`p-1.5 rounded ${data[activeField || '']?.align === 'right' ? 'bg-blue-100 text-blue-600' : 'hover:bg-white'}`} title={t('alignRight')}>R</button>
                        </div>

                        <div className="h-6 w-px bg-gray-300 mx-1"></div>

                        {/* Cert Type Selector */}
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            {certTypes.map(type => (
                                <button 
                                    key={type.id}
                                    onClick={() => setCertType(type.id)} 
                                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${certType === type.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <Input 
                                value={shipmentId} 
                                onChange={(e) => setShipmentId(e.target.value)} 
                                placeholder={t('shipmentId')} 
                                className="w-32 h-9 text-sm" 
                            />
                            <Button onClick={handleLoadFromShipment} size="sm" variant="secondary" disabled={!shipmentId}><FolderOpenIcon className="w-4 h-4"/></Button>
                            <Button onClick={handleClear} size="sm" variant="ghost" className="text-red-500"><TrashIcon className="w-4 h-4"/></Button>
                        </div>

                        <div className="h-6 w-px bg-gray-300 mx-1"></div>

                        {/* Print Settings & Actions */}
                        <div className="flex items-center gap-2 relative">
                            <Button 
                                onClick={() => setShowSettings(!showSettings)} 
                                size="sm" 
                                variant={showSettings ? 'primary' : 'secondary'} 
                                className="h-9 px-3"
                                title={t('printSettings')}
                            >
                                <SettingsIcon className="w-4 h-4"/>
                            </Button>

                            {/* Settings Popover */}
                            {showSettings && (
                                <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-50 animate-fade-in">
                                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                                        <h4 className="font-bold text-sm text-gray-800">{t('printSettings')}</h4>
                                        <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600"><XIcon className="w-4 h-4"/></button>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {/* Print Mode */}
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">{t('printMode')}</label>
                                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                                <button 
                                                    onClick={() => setPrintConfig(p => ({...p, mode: 'full'}))}
                                                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${printConfig.mode === 'full' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                                >
                                                    {t('fullDocument')}
                                                </button>
                                                <button 
                                                    onClick={() => setPrintConfig(p => ({...p, mode: 'data-only'}))}
                                                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${printConfig.mode === 'data-only' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                                >
                                                    {t('dataOnly')}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Page Margins */}
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">{t('margins')}</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <span className="text-[10px] text-gray-400 mb-1 block">{t('marginTop')}</span>
                                                    <div className="flex items-center">
                                                        <input 
                                                            type="number" 
                                                            value={printConfig.marginTop} 
                                                            onChange={(e) => setPrintConfig(p => ({...p, marginTop: Number(e.target.value)}))}
                                                            className="w-full h-8 text-sm border border-gray-300 rounded px-2"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-gray-400 mb-1 block">{t('marginLeft')}</span>
                                                    <div className="flex items-center">
                                                        <input 
                                                            type="number" 
                                                            value={printConfig.marginLeft} 
                                                            onChange={(e) => setPrintConfig(p => ({...p, marginLeft: Number(e.target.value)}))}
                                                            className="w-full h-8 text-sm border border-gray-300 rounded px-2"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Font Scaling */}
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">{t('baseFontSize')}</label>
                                            <div className="flex items-center gap-3">
                                                <input 
                                                    type="range" 
                                                    min="-4" max="4" step="1"
                                                    value={printConfig.fontSizeOffset}
                                                    onChange={(e) => setPrintConfig(p => ({...p, fontSizeOffset: Number(e.target.value)}))}
                                                    className="flex-grow h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                                />
                                                <span className="text-xs font-mono w-8 text-right">{printConfig.fontSizeOffset > 0 ? '+' : ''}{printConfig.fontSizeOffset}pt</span>
                                            </div>
                                        </div>

                                        <div className="pt-2 border-t border-gray-100 flex justify-end">
                                            <Button 
                                                size="sm" 
                                                variant="ghost" 
                                                className="text-xs h-7 text-red-500" 
                                                onClick={() => setPrintConfig({ mode: 'full', marginTop: 0, marginLeft: 0, fontSizeOffset: 0 })}
                                            >
                                                {t('resetSettings')}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <Button onClick={() => window.print()} size="sm" variant="secondary" className="h-9 px-3" title="Print">
                                <PrintIcon className="w-4 h-4"/>
                            </Button>
                            <Button onClick={handleDownloadPdf} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-3 shadow-md" title="Download PDF">
                                <DownloadIcon className="w-4 h-4"/>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Workspace */}
            <div className="flex justify-center p-8 overflow-auto" onClick={() => setActiveField(null)}>
                <div 
                    ref={previewRef}
                    className="bg-white shadow-2xl print:shadow-none transition-transform duration-300 origin-top print:transform-none"
                    style={{ 
                        width: '210mm', 
                        minHeight: '297mm',
                        transform: `scale(${zoom / 100})`,
                        paddingTop: `${printConfig.marginTop}mm`,
                        paddingLeft: `${printConfig.marginLeft}mm`,
                        fontSize: `${10 + printConfig.fontSizeOffset}pt` // Apply base font scaling
                    }}
                    onClick={(e) => e.stopPropagation()} // Prevent deselection when clicking inside document
                >
                    {renderDocument()}
                </div>
            </div>

            {/* Zoom FAB */}
            <div className="fixed bottom-8 right-8 flex flex-col gap-2 bg-white p-2 rounded-full shadow-xl border border-gray-200 no-print">
                <button onClick={() => setZoom(z => Math.min(z + 10, 150))} className="p-2 hover:bg-gray-100 rounded-full font-bold">+</button>
                <span className="text-xs text-center font-medium">{zoom}%</span>
                <button onClick={() => setZoom(z => Math.max(z - 10, 50))} className="p-2 hover:bg-gray-100 rounded-full font-bold">-</button>
            </div>
        </div>
    );
};

export default DocumentEditorPage;
