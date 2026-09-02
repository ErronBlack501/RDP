from fastapi import APIRouter
from typing import List, Dict
from models import (
    PetriNet, PetriNetCreate, PetriNetUpdate,
    Place, PlaceCreate, Transition, TransitionCreate,
    Arc, ArcCreate, SimulationResult
)
from controllers import petri_controller

router = APIRouter(prefix="/api/petri", tags=["Petri Nets"])


# Network routes
@router.post("/nets", response_model=PetriNet, status_code=201)
async def create_net(net_data: PetriNetCreate):
    """Create a new Petri net"""
    return petri_controller.create_net(net_data)


@router.get("/nets", response_model=List[PetriNet])
async def get_all_nets():
    """Get all Petri nets"""
    return petri_controller.get_all_nets()


@router.get("/nets/{net_id}", response_model=PetriNet)
async def get_net(net_id: str):
    """Get a network by ID"""
    return petri_controller.get_net(net_id)


@router.put("/nets/{net_id}", response_model=PetriNet)
async def update_net(net_id: str, update_data: PetriNetUpdate):
    """Update a network"""
    return petri_controller.update_net(net_id, update_data)


@router.delete("/nets/{net_id}")
async def delete_net(net_id: str):
    """Delete a network"""
    return petri_controller.delete_net(net_id)


# Place routes
@router.post("/nets/{net_id}/places", response_model=Place, status_code=201)
async def add_place(net_id: str, place_data: PlaceCreate):
    """Add a place to a network"""
    return petri_controller.add_place(net_id, place_data)


# Transition routes
@router.post("/nets/{net_id}/transitions", response_model=Transition, status_code=201)
async def add_transition(net_id: str, transition_data: TransitionCreate):
    """Add a transition to a network"""
    return petri_controller.add_transition(net_id, transition_data)


# Arc routes
@router.post("/nets/{net_id}/arcs", response_model=Arc, status_code=201)
async def add_arc(net_id: str, arc_data: ArcCreate):
    """Add an arc to a network"""
    return petri_controller.add_arc(net_id, arc_data)


# Marking routes
@router.get("/nets/{net_id}/marking")
async def get_marking(net_id: str):
    """Get current marking of a network"""
    return petri_controller.get_marking(net_id)


@router.post("/nets/{net_id}/marking/reset")
async def reset_marking(net_id: str, initial_tokens: Dict[str, int] = None):
    """Reset marking of a network"""
    return petri_controller.reset_marking(net_id, initial_tokens)


# Transition firing routes
@router.get("/nets/{net_id}/transitions/enabled")
async def get_enabled_transitions(net_id: str):
    """Get enabled transitions of a network"""
    return petri_controller.get_enabled_transitions(net_id)


@router.post("/nets/{net_id}/transitions/{transition_id}/fire")
async def fire_transition(net_id: str, transition_id: str):
    """Fire a specific transition"""
    return petri_controller.fire_transition(net_id, transition_id)


# Simulation routes
@router.post("/nets/{net_id}/simulate", response_model=SimulationResult)
async def simulate_net(net_id: str, max_steps: int = 100):
    """Simulate a Petri net"""
    return petri_controller.simulate(net_id, max_steps)


@router.get("/health")
async def health_check():
    """Check Petri service health"""
    return {"status": "healthy", "service": "Petri Net Simulation Service"}