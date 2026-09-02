export type NodeType = "place" | "transition";
export type ArcType = "input" | "output";

export interface Position {
  x: number;
  y: number;
}

export interface Place {
  id: string;
  name: string;
  position: Position;
  tokens: number;
  label?: string;
}

export interface Transition {
  id: string;
  name: string;
  position: Position;
  label?: string;
  enabled: boolean;
}

export interface Arc {
  id: string;
  source_id: string;
  target_id: string;
  arc_type: ArcType;
  weight: number;
  label?: string;
}

export interface PetriNet {
  id: string;
  name: string;
  description?: string;
  places: Place[];
  transitions: Transition[];
  arcs: Arc[];
  created_at: string;
  updated_at: string;
}

export interface PetriNetCreate {
  name: string;
  description?: string;
}

export interface PetriNetUpdate {
  name?: string;
  description?: string;
  places?: Place[];
  transitions?: Transition[];
  arcs?: Arc[];
}

export interface PlaceCreate {
  name: string;
  position: Position;
  tokens?: number;
  label?: string;
}

export interface TransitionCreate {
  name: string;
  position: Position;
  label?: string;
}

export interface ArcCreate {
  source_id: string;
  target_id: string;
  arc_type: ArcType;
  weight?: number;
  label?: string;
}

export interface SimulationStep {
  step_number: number;
  transition_id: string;
  marking_before: Record<string, number>;
  marking_after: Record<string, number>;
  timestamp: string;
}

export interface SimulationResult {
  net_id: string;
  steps: SimulationStep[];
  final_marking: Record<string, number>;
  is_deadlock: boolean;
  is_bounded: boolean;
  is_reachable: boolean;
}