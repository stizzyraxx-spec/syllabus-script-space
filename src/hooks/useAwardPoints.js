import { base44 } from '@/api/base44Client';

export const useAwardPoints = () => {
  const awardPoints = async (userEmail, actionType, pointsAmount = 1) => {
    try {
      const response = await base44.functions.invoke('awardPoints', {
        userEmail,
        actionType,
        pointsAmount,
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to award points for ${actionType}:`, error);
      return null;
    }
  };

  return { awardPoints };
};