
import { v4 as uuidv4 } from 'uuid';

export type Language = 'ar' | 'en';

export type Section = 'home' | 'articles' | 'directory' | 'route-planner' | 'hs-code' | 'invoice-generator' | 'shipping-forms' | 'shipment-tracker' | 'contact-us' | 'login' | 'register' | 'profile' | 'pricing' | 'privacy' | 'terms' | 'faq' | 'admin';

export type CompanyCategory = 'shipping-line' | 'freight-forwarder' | 'transportation' | 'customs-broker';

export type ShippingFormType = 'bill-of-lading' | 'commercial-invoice';

export type ArticleCategory = 'sea-freight' | 'customs' | 'ports' | 'news' | 'logistics-tech' | 'warehousing' | 'global-trade' | 'financial' | 'educational' | 'laws-and-regulations';

export type UserRole = 'super_admin' | 'editor' | 'viewer';

export interface AuditLog {
  id: string;
  action: string;
  user: string;
  role: string;
  timestamp: string;
  details: string;
  status: 'Success' | 'Failed';
}

export interface MaritimeScenario {
    id: number;
    route: { ar: string; en: string };
    routeDesc: { ar: string; en: string };
    score: number;
    hsCode: string;
    hsDesc: { ar: string; en: string };
    status: 'critical' | 'optimal' | 'warning';
}

export interface Article {
  id: number;
  category: ArticleCategory;
  title: {
    ar: string;
    en: string;
  };
  summary: {
    ar: string;
    en: string;
  };
  content: {
    ar: string;
    en: string;
  };
  imageUrl: string;
  date?: {
    ar: string;
    en: string;
  };
}

export interface Company {
  id: number;
  name: {
    ar: string;
    en: string;
  };
  description: {
    ar: string;
    en: string;
  };
  category: CompanyCategory;
  logoShortName: string;
  logoBgColor: string;
  ports: string[];
  branches: { 
    city: { ar: string; en: string }; 
    address: { ar: string; en: string };
    workingHours: { ar: string; en: string };
    peakTimes: number[]; // Array of 5 numbers representing time slots from morning to evening
  }[];
  serviceAreas: {
    [key: string]: {
        ar: string,
        en: string,
        locations: string[]
    }
  };
  featuredAreas?: {
    [key: string]: {
        ar: string,
        en: string,
        locations: string[]
    }
  };
  contact: {
    email: string;
    phone: string;
  };
  website?: string;
  status: 'pending' | 'approved' | 'rejected';
  // Added fields for verification
  verificationDocumentUrl?: string;
  verificationDocumentName?: string;
  isFeatured?: boolean;
}

export interface CommercialInvoiceItem {
  id: string;
  desc: string;
  packages: number;
  packageUnit: string;
  netWeightPerPkg: number;
  totalNet: number;
  grossWeightPerPkg: number;
  totalGross: number;
  price: number; // Price per KGS
  totalPrice: number;
}


export interface User {
  id: string;
  name?: string;
  email: string;
  phone?: string;
  companyName?: string;
  password?: string; // Should not be stored long-term or sent to client
  subscription: 'free' | 'premium_monthly' | 'premium_yearly';
  subscriptionEndDate?: string;
  isAdmin?: boolean; // Deprecated, use role
  role?: UserRole;
  preferences?: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    marketingEmails: boolean;
  };
}

export interface SavedAdvice {
  id: string;
  timestamp: number;
  origin: string;
  destination:string;
  goods: string;
  incoterm: string;
  shipmentType: string;
  quantity: string;
  advice: string;
}

export interface SavedRoute {
  id: string;
  name: string;
  origin: string;
  destination: string;
  goods: string;
  incoterm: string;
  shipmentType: string;
  quantity: string;
}

export type ShipmentStatus = 
  'pending' | 
  'pickup_order_issued' | 
  'driver_assigned_for_pickup' | 
  'container_picked_up' | 
  'at_shipper_for_loading' | 
  'loading_complete_enroute_to_port' | 
  'documents_submitted' |
  'customs_clearance_export' |
  'in_transit' | 
  'customs_clearance_import' |
  'ready_for_delivery' |
  'delivered';


export interface ShipmentUpdate {
  timestamp: string;
  message: string;
}

export interface ShipmentDocument {
  id: string;
  name: string;
  type: 'B/L' | 'Invoice' | 'Packing List' | 'Other';
  uploadedAt: string;
}

// New Interface for Detailed Expenses based on uploaded documents
export interface ShipmentExpense {
    id: string;
    description: string; // e.g., "Agricultural Inspection", "Nathria"
    amount: number;
    category: 'official_receipt' | 'clearance_fees' | 'inspection' | 'transport' | 'other';
    date: string;
}

export interface Shipment {
  id: string; // Typically B/L or Booking Number
  operationNumber?: string; // New: From "رقم العملية"
  origin: string;
  destination: string;
  customer: string;
  weight: string;
  value: string;
  status: ShipmentStatus;
  createdAt: string;
  updates: ShipmentUpdate[];
  driverId?: string;
  vehicleId?: string;
  containerId?: string;
  vesselName?: string;
  voyageNumber?: string;
  billOfLading?: string;
  portOfLoading?: string;
  portOfDischarge?: string;
  estimatedDeparture?: string;
  actualDeparture?: string;
  estimatedArrival?: string;
  actualArrival?: string;
  deliveredAt?: string;
  isTemperatureControlled?: boolean;
  temperatureSetting?: string;
  documents: ShipmentDocument[];
  // New fields from chat analysis
  shippingLine?: string;
  bookingNo?: string;
  containerSize?: string;
  sealNo?: string;
  driverName?: string;
  driverPhone?: string;
  truckPlate?: string;
  trailerPlate?: string;
  customsBroker?: string;
  exporter?: string;
  importer?: string;
  transportCompany?: string;
  // Financial fields
  cost?: string;
  price?: string;
  certificateNumber?: string; // New: From "رقم الشهادة"
  expenses?: ShipmentExpense[]; // New: Detailed breakdown
}

export interface SharedShipmentData {
  exporterName?: string;
  importerName?: string;
  portOfLoading?: string;
  portOfDischarge?: string;
  vessel?: string;
  blNo?: string;
  bookingNo?: string;
  marksAndNumbers?: string;
  descriptionOfGoods?: string;
  grossWeight?: string;
  netWeight?: string;
  notifyParty?: string;
}

export interface Rating {
  userId: string;
  userName?: string;
  score: number;
  comment?: string;
  date?: string;
}

export type CompanyRatings = Record<string, { ratings: Rating[] }>;
