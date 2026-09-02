from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime
from enum import Enum


class NodeType(str, Enum):
    PLACE = "place"
    TRANSITION = "transition"


class ArcType(str, Enum):
    INPUT = "input"
    OUTPUT = "output"


class Position(BaseModel):
    x: float = Field(ge=0)
    y: float = Field(ge=0)


class Place(BaseModel):
    id: str
    name: str
    position: Position
    tokens: int = Field(default=0, ge=0)
    label: Optional[str] = None


class Transition(BaseModel):
    id: str
    name: str
    position: Position
    label: Optional[str] = None
    enabled: bool = False


class Arc(BaseModel):
    id: str
    source_id: str
    target_id: str
    arc_type: ArcType
    weight: int = Field(default=1, ge=1)
    label: Optional[str] = None


class PetriNet(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    places: List[Place] = Field(default_factory=list)
    transitions: List[Transition] = Field(default_factory=list)
    arcs: List[Arc] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class PetriNetCreate(BaseModel):
    name: str
    description: Optional[str] = None


class PetriNetUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    places: Optional[List[Place]] = None
    transitions: Optional[List[Transition]] = None
    arcs: Optional[List[Arc]] = None


class PlaceCreate(BaseModel):
    name: str
    position: Position
    tokens: int = Field(default=0, ge=0)
    label: Optional[str] = None


class TransitionCreate(BaseModel):
    name: str
    position: Position
    label: Optional[str] = None


class ArcCreate(BaseModel):
    source_id: str
    target_id: str
    arc_type: ArcType
    weight: int = Field(default=1, ge=1)
    label: Optional[str] = None


class SimulationStep(BaseModel):
    step_number: int
    transition_id: str
    marking_before: Dict[str, int]  # place_id -> token_count
    marking_after: Dict[str, int]
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class SimulationResult(BaseModel):
    net_id: str
    steps: List[SimulationStep] = Field(default_factory=list)
    final_marking: Dict[str, int]
    is_deadlock: bool = False
    is_bounded: bool = True
    is_reachable: bool = True