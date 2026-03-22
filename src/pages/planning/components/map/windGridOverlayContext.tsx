import { createContext, useContext } from 'react';
import type { WindGridMapOverlayModel } from './hooks/usePlanningMapWindGrid';

type Setter = (model: WindGridMapOverlayModel | null) => void;

export const WindGridOverlaySetterContext = createContext<Setter | null>(null);

export function useWindGridOverlaySetter(): Setter | null {
  return useContext(WindGridOverlaySetterContext);
}
