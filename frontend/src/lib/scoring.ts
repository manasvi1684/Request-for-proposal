
interface ScorableProposal {
    totalPrice: number | null;
    deliveryDays: number | null;
    warrantyMonths: number | null;
    completenessScore: number | null; // 0-1
}

interface RfpCriteria {
    budget: number | null;
    deliveryDeadline: Date | null;
}

/**
 * Calculates a 0-100 score for a proposal based on criteria.
 */
export function calculateScore(proposal: ScorableProposal, criteria: RfpCriteria, allProposals: ScorableProposal[]): number {
    let score = 0;

    // Weights matching the assignment spec
    const WEIGHTS = {
        price: 0.5,
        delivery: 0.2,
        warranty: 0.2,
        completeness: 0.1
    };

    // 1. Price Score (50%)
    // If price is missing, 0. If price is lower than others, higher score.
    // We'll use a relative scale: (BestPrice / ProposalPrice) * 100
    let priceScore = 0;
    const validPrices = allProposals.map(p => p.totalPrice).filter(p => p !== null) as number[];
    const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : 0;

    if (proposal.totalPrice && minPrice > 0) {
        // If within budget (if set), bonus? Or just relative? 
        // Spec says: "cheaper = higher score, relative to others if available"
        priceScore = (minPrice / proposal.totalPrice);
        // Cap at 1.0 (though logic ensures it is <= 1.0 since minPrice <= proposalPrice)
    }

    // 2. Delivery Score (20%)
    // "on-time = high score, slower = lower"
    // If we have a deadline, meeting it is 1.0. 
    // If not, maybe relative to fastest delivery? Let's use relative to fastest.
    let deliveryScore = 0;
    const validDelivery = allProposals.map(p => p.deliveryDays).filter(d => d !== null) as number[];
    const fastDelivery = validDelivery.length > 0 ? Math.min(...validDelivery) : 30; // default 30 baseline

    if (proposal.deliveryDays) {
        if (proposal.deliveryDays <= fastDelivery) {
            deliveryScore = 1.0;
        } else {
            // Decay score as it gets slower. e.g. 1.0 - (difference / baseline)
            const ratio = fastDelivery / proposal.deliveryDays;
            deliveryScore = ratio;
        }
    }

    // 3. Warranty Score (20%)
    // "meets or exceeds available" -> Higher is better
    let warrantyScore = 0;
    // Let's assume 12 months is baseline good (0.5), 24 is excellent (1.0)
    if (proposal.warrantyMonths) {
        if (proposal.warrantyMonths >= 24) warrantyScore = 1.0;
        else if (proposal.warrantyMonths >= 12) warrantyScore = 0.8;
        else if (proposal.warrantyMonths >= 6) warrantyScore = 0.5;
        else warrantyScore = 0.2;
    }

    // 4. Completeness Score (10%)
    // "based on AI signal"
    const completeness = proposal.completenessScore || 0;

    // Weighted Sum
    const total = (
        (priceScore * WEIGHTS.price) +
        (deliveryScore * WEIGHTS.delivery) +
        (warrantyScore * WEIGHTS.warranty) +
        (completeness * WEIGHTS.completeness)
    );

    return Math.round(total * 100);
}
