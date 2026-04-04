// utils/payoutHelper.js
export const calculateSplit = (totalAmount, commissionRate) => {
    // commissionRate for example 10%
    const commissionAmount = (totalAmount * commissionRate) / 100;
    const netAmount = totalAmount - commissionAmount;
    return {
        commissionAmount: Math.round(commissionAmount),
        netAmount: Math.round(netAmount)
    };
};