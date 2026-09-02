from fastapi import HTTPException, status
from typing import List, Dict
from models import (
    PetriNet, PetriNetCreate, PetriNetUpdate,
    Place, PlaceCreate, Transition, TransitionCreate,
    Arc, ArcCreate, SimulationResult
)
from services import petri_service


class PetriController:
    def __init__(self):
        self.service = petri_service
    
    # Network management
    def create_net(self, net_data: PetriNetCreate) -> PetriNet:
        """Create a new Petri net"""
        try:
            return self.service.create_net(net_data)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error creating network: {str(e)}"
            )
    
    def get_net(self, net_id: str) -> PetriNet:
        """Get a network by ID"""
        net = self.service.get_net(net_id)
        if not net:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Network not found"
            )
        return net
    
    def get_all_nets(self) -> List[PetriNet]:
        """Get all networks"""
        return self.service.get_all_nets()
    
    def update_net(self, net_id: str, update_data: PetriNetUpdate) -> PetriNet:
        """Update a network"""
        net = self.service.update_net(net_id, update_data)
        if not net:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Network not found"
            )
        return net
    
    def delete_net(self, net_id: str) -> dict:
        """Delete a network"""
        success = self.service.delete_net(net_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Network not found"
            )
        return {"message": "Network deleted successfully"}
    
    # Place management
    def add_place(self, net_id: str, place_data: PlaceCreate) -> Place:
        """Add a place to a network"""
        place = self.service.add_place(net_id, place_data)
        if not place:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Network not found"
            )
        return place
    
    # Transition management
    def add_transition(self, net_id: str, transition_data: TransitionCreate) -> Transition:
        """Add a transition to a network"""
        transition = self.service.add_transition(net_id, transition_data)
        if not transition:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Network not found"
            )
        return transition
    
    # Arc management
    def add_arc(self, net_id: str, arc_data: ArcCreate) -> Arc:
        """Add an arc to a network"""
        arc = self.service.add_arc(net_id, arc_data)
        if not arc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot add arc (source or target not found)"
            )
        return arc
    
    # Marking management
    def get_marking(self, net_id: str) -> Dict[str, int]:
        """Get current marking"""
        net = self.service.get_net(net_id)
        if not net:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Network not found"
            )
        return self.service.get_marking(net_id)
    
    def reset_marking(self, net_id: str, initial_tokens: Dict[str, int] = None) -> dict:
        """Reset the marking"""
        net = self.service.get_net(net_id)
        if not net:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Network not found"
            )
        success = self.service.reset_marking(net_id, initial_tokens)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error resetting marking"
            )
        return {"message": "Marking reset", "marking": self.service.get_marking(net_id)}
    
    # Transition management
    def get_enabled_transitions(self, net_id: str) -> List[str]:
        """Get enabled transitions"""
        net = self.service.get_net(net_id)
        if not net:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Network not found"
            )
        return self.service.get_enabled_transitions(net_id)
    
    def fire_transition(self, net_id: str, transition_id: str) -> Dict[str, int]:
        """Fire a transition"""
        net = self.service.get_net(net_id)
        if not net:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Network not found"
            )
        
        new_marking = self.service.fire_transition(net_id, transition_id)
        if not new_marking:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Transition not enabled or not found"
            )
        return new_marking
    
    # Simulation
    def simulate(self, net_id: str, max_steps: int = 100) -> SimulationResult:
        """Simulate the network"""
        net = self.service.get_net(net_id)
        if not net:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Network not found"
            )
        
        result = self.service.simulate(net_id, max_steps)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error during simulation"
            )
        return result


# Global controller instance
petri_controller = PetriController()