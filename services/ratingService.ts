
import type { CompanyRatings, Rating } from '../types';

const RATING_STORAGE_KEY = 'companyRatings';

/**
 * Retrieves all saved company ratings from localStorage.
 * @returns An object containing all company ratings.
 */
export const getRatings = (): CompanyRatings => {
    try {
        const saved = localStorage.getItem(RATING_STORAGE_KEY);
        return saved ? JSON.parse(saved) : {};
    } catch {
        return {};
    }
};

/**
 * Saves the entire ratings object to localStorage.
 * @param ratings The ratings object to save.
 */
const saveRatings = (ratings: CompanyRatings): void => {
    try {
        localStorage.setItem(RATING_STORAGE_KEY, JSON.stringify(ratings));
    } catch (error) {
        console.error("Failed to save ratings", error);
    }
};

/**
 * Adds or updates a user's rating for a specific company.
 * @param companyId The ID of the company being rated.
 * @param userId The ID of the user submitting the rating.
 * @param userName The name of the user.
 * @param score The rating score (1-5).
 * @param comment The review comment.
 * @returns The updated ratings object.
 */
export const rateCompany = (companyId: number, userId: string, userName: string, score: number, comment?: string): CompanyRatings => {
    const allRatings = getRatings();
    const companyRatings = allRatings[companyId]?.ratings || [];

    const existingRatingIndex = companyRatings.findIndex(r => r.userId === userId);

    if (existingRatingIndex > -1) {
        // Update existing rating
        companyRatings[existingRatingIndex].score = score;
        if (comment) companyRatings[existingRatingIndex].comment = comment;
        companyRatings[existingRatingIndex].date = new Date().toISOString();
        companyRatings[existingRatingIndex].userName = userName;
    } else {
        // Add new rating
        companyRatings.push({ 
            userId, 
            userName,
            score, 
            comment, 
            date: new Date().toISOString() 
        });
    }

    const updatedRatings = {
        ...allRatings,
        [companyId]: { ratings: companyRatings },
    };

    saveRatings(updatedRatings);
    return updatedRatings;
};
