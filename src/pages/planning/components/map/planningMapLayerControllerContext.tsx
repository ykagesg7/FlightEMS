import { createContext, useContext } from 'react';
import type { PlanningMapLayerController } from './hooks/usePlanningMapLayerController';

export const PlanningMapLayerControllerContext = createContext<PlanningMapLayerController | null>(
  null,
);

export function usePlanningMapLayerControllerContext(): PlanningMapLayerController | null {
  return useContext(PlanningMapLayerControllerContext);
}
