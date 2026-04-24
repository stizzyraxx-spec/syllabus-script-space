import { useState } from "react";

export const useCombatEncounter = () => {
  const [activeCombat, setActiveCombat] = useState(null);

  const triggerCombat = (missionId, enemyType = "demon") => {
    setActiveCombat({
      missionId,
      enemyType,
      active: true,
    });
  };

  const endCombat = (victory) => {
    return {
      victory,
      missionId: activeCombat?.missionId,
    };
  };

  const clearCombat = () => {
    setActiveCombat(null);
  };

  return {
    activeCombat,
    triggerCombat,
    endCombat,
    clearCombat,
  };
};