import { createContext } from 'react';
import { createMongoAbility } from '@casl/ability';

const ability = createMongoAbility([]);

export const AbilityContext = createContext();

export const AbilityProvider = ({ children }) => {
  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  );
};