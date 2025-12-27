import type { SharedShipmentData } from '../types';

const DRAFTS_STORAGE_KEY = 'shipmentDataDrafts';

/**
 * Retrieves all saved shipment drafts from localStorage.
 * @returns An object containing all shipment drafts, keyed by shipment ID.
 */
export const getShipmentDrafts = (): Record<string, SharedShipmentData> => {
    try {
        const saved = localStorage.getItem(DRAFTS_STORAGE_KEY);
        return saved ? JSON.parse(saved) : {};
    } catch {
        return {};
    }
};

/**
 * Retrieves a specific shipment draft by its ID.
 * @param shipmentId The ID of the shipment to retrieve.
 * @returns The shared data for the shipment, or undefined if not found.
 */
export const getShipmentDraft = (shipmentId: string): SharedShipmentData | undefined => {
    if (!shipmentId) return undefined;
    const drafts = getShipmentDrafts();
    return drafts[shipmentId];
};

/**
 * Updates a shipment draft with new data, merging with any existing data.
 * @param shipmentId The ID of the shipment draft to update.
 * @param data An object containing the new or updated fields.
 */
export const updateShipmentDraft = (shipmentId: string, data: Partial<SharedShipmentData>): void => {
    if (!shipmentId) return;
    const drafts = getShipmentDrafts();
    const existingDraft = drafts[shipmentId] || {};
    // Merge new data, filtering out any undefined values to avoid overwriting existing data with nothing.
    const filteredData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
    drafts[shipmentId] = { ...existingDraft, ...filteredData };
    try {
        localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
    } catch (error) {
        console.error("Failed to save shipment draft", error);
    }
};