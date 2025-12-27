# Logistics B Arabic - Complete Platform

## 🌐 Overview
Logistics B Arabic is a comprehensive bilingual (Arabic/English) logistics platform designed to bridge the gap between Arabic-speaking logistics professionals and global industry standards. It serves as an integrated ecosystem combining educational content, a verified business directory, and advanced AI-powered tools to empower operations in the MENA region.

## 🚀 Key Modules

### 1. 🧠 AI Route Planner ("The Logistics Brain")
*   **Core Function**: Strategic shipping consultant.
*   **Persona**: Acts as a Senior Supply Chain Strategist for MENA.
*   **Features**:
    *   **Tetris Logic**: Calculates container utilization based on weight/volume rules (e.g., 20ft max 28 tons).
    *   **Risk Analysis**: Evaluates Incoterms (e.g., Ex Works vs CIF) and route safety (e.g., Red Sea alerts).
    *   **Compliance**: Checks specific trade agreements (GAFTA, EUR.1, Agadir).
    *   **Grounding**: Uses Google Maps data for inland trucking estimates.

### 2. 🔍 HS Code Finder
*   **Core Function**: Intelligent commodity classification.
*   **AI Feature**: Fuzzy search capabilities accepting colloquial Arabic/English terms (e.g., "Frozen Shrimp" -> HS 030617) and returning structured JSON data.

### 3. 📄 Smart Document Editor
*   **Core Function**: WYSIWYG editor for trade certificates.
*   **Templates**: EUR.1, COMESA, Phyto, Commercial Invoice.
*   **Tech**: Real-time preview with print-ready CSS and PDF export.

### 4. 📦 Shipment Tracker
*   **Core Function**: Operational dashboard (Mini-TMS).
*   **Features**:
    *   Milestone tracking (Pickup -> Port -> Delivery).
    *   Financial visibility (Cost, Price, Profit calculation).
    *   Document repository (Upload/Manage B/L, Packing Lists).

### 5. 📒 Company Directory
*   **Core Function**: Verified partner ecosystem.
*   **Features**: User reviews, ratings, favorites, and detailed service area mapping.

### 6. 📚 Knowledge Base
*   **Core Function**: Industry intelligence hub.
*   **Content**: Articles on ports, customs regulations, and logistics tech.

## 🛠️ Technical Architecture
*   **Frontend**: React 19, TypeScript, Tailwind CSS.
*   **AI Engine**: Google Gemini API (`gemini-2.5-flash`) via `@google/genai` SDK.
*   **State Management**: React Hooks + LocalStorage (Persistence).
*   **Localization**: Custom hook supporting RTL (Arabic) and LTR (English) layouts.
*   **Printing**: CSS `@media print` optimization for documents.

## 🔐 Security & Access Control
*   **RBAC**: Role-Based Access Control (Super Admin, Editor, Viewer).
*   **Admin Dashboard**:
    *   User Management.
    *   Company Verification (Approve/Reject).
    *   **AI Brain Config**: Edit system prompts live.
    *   Audit Logs.

## 🤖 AI Persona Configuration
The system utilizes a specific "Logistics Brain" persona injected into the Gemini model:
*   **Context**: MENA region expertise.
*   **Behavior**: Analytical, strategic, and safety-conscious.
*   **Output**: Strictly formatted Markdown reports for readability.

## 📦 Installation & Setup
1.  Clone the repository.
2.  Install dependencies (`npm install`).
3.  Set `API_KEY` in environment variables.
4.  Run `npm start`.
