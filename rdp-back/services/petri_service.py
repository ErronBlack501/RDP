from typing import Dict, List, Optional
from datetime import datetime
import uuid
from models import (
    PetriNet, PetriNetCreate, PetriNetUpdate,
    Place, PlaceCreate, Transition, TransitionCreate,
    Arc, ArcCreate, SimulationStep, SimulationResult, ArcType
)


class PetriService:
    def __init__(self):
        self.nets: Dict[str, PetriNet] = {}
    
    def create_net(self, net_data: PetriNetCreate) -> PetriNet:
        """Create a new Petri net"""
        net_id = str(uuid.uuid4())
        net = PetriNet(
            id=net_id,
            name=net_data.name,
            description=net_data.description
        )
        self.nets[net_id] = net
        return net
    
    def get_net(self, net_id: str) -> Optional[PetriNet]:
        """Get a network by ID"""
        return self.nets.get(net_id)
    
    def get_all_nets(self) -> List[PetriNet]:
        """Get all networks"""
        return list(self.nets.values())
    
    def update_net(self, net_id: str, update_data: PetriNetUpdate) -> Optional[PetriNet]:
        """Update a network"""
        net = self.nets.get(net_id)
        if not net:
            return None
        
        update_dict = update_data.model_dump(exclude_unset=True)
        for field, value in update_dict.items():
            if field in ["places", "transitions", "arcs"]:
                continue  # These fields are managed by specific methods
            setattr(net, field, value)
        
        net.updated_at = datetime.utcnow()
        return net
    
    def delete_net(self, net_id: str) -> bool:
        """Delete a network"""
        if net_id in self.nets:
            del self.nets[net_id]
            return True
        return False
    
    def add_place(self, net_id: str, place_data: PlaceCreate) -> Optional[Place]:
        """Add a place to a network"""
        net = self.nets.get(net_id)
        if not net:
            return None
        
        place_id = str(uuid.uuid4())
        place = Place(
            id=place_id,
            name=place_data.name,
            position=place_data.position,
            tokens=place_data.tokens,
            label=place_data.label
        )
        net.places.append(place)
        net.updated_at = datetime.utcnow()
        return place
    
    def add_transition(self, net_id: str, transition_data: TransitionCreate) -> Optional[Transition]:
        """Add a transition to a network"""
        net = self.nets.get(net_id)
        if not net:
            return None
        
        transition_id = str(uuid.uuid4())
        transition = Transition(
            id=transition_id,
            name=transition_data.name,
            position=transition_data.position,
            label=transition_data.label
        )
        net.transitions.append(transition)
        net.updated_at = datetime.utcnow()
        return transition
    
    def add_arc(self, net_id: str, arc_data: ArcCreate) -> Optional[Arc]:
        """Add an arc to a network"""
        net = self.nets.get(net_id)
        if not net:
            return None
        
        # Check that source and target exist
        source_exists = any(n.id == arc_data.source_id for n in net.places + net.transitions)
        target_exists = any(n.id == arc_data.target_id for n in net.places + net.transitions)
        
        if not source_exists or not target_exists:
            return None
        
        arc_id = str(uuid.uuid4())
        arc = Arc(
            id=arc_id,
            source_id=arc_data.source_id,
            target_id=arc_data.target_id,
            arc_type=arc_data.arc_type,
            weight=arc_data.weight,
            label=arc_data.label
        )
        net.arcs.append(arc)
        net.updated_at = datetime.utcnow()
        return arc
    
    def get_marking(self, net_id: str) -> Dict[str, int]:
        """Get current marking (place_id -> tokens)"""
        net = self.nets.get(net_id)
        if not net:
            return {}
        
        return {place.id: place.tokens for place in net.places}
    
    def is_transition_enabled(self, net_id: str, transition_id: str) -> bool:
        """Check if a transition is enabled"""
        net = self.nets.get(net_id)
        if not net:
            return False
        
        transition = next((t for t in net.transitions if t.id == transition_id), None)
        if not transition:
            return False
        
        # Get input arcs for this transition
        input_arcs = [arc for arc in net.arcs 
                      if arc.target_id == transition_id and arc.arc_type == ArcType.INPUT]
        
        # Check that each input place has enough tokens
        for arc in input_arcs:
            place = next((p for p in net.places if p.id == arc.source_id), None)
            if not place or place.tokens < arc.weight:
                return False
        
        return True
    
    def get_enabled_transitions(self, net_id: str) -> List[str]:
        """Get all enabled transitions"""
        net = self.nets.get(net_id)
        if not net:
            return []
        
        return [t.id for t in net.transitions if self.is_transition_enabled(net_id, t.id)]
    
    def fire_transition(self, net_id: str, transition_id: str) -> Optional[Dict[str, int]]:
        """Fire a transition and return the new marking"""
        net = self.nets.get(net_id)
        if not net:
            return None
        
        if not self.is_transition_enabled(net_id, transition_id):
            return None
        
        # Get arcs
        input_arcs = [arc for arc in net.arcs 
                      if arc.target_id == transition_id and arc.arc_type == ArcType.INPUT]
        output_arcs = [arc for arc in net.arcs 
                       if arc.source_id == transition_id and arc.arc_type == ArcType.OUTPUT]
        
        # Save marking before
        marking_before = self.get_marking(net_id)
        
        # Remove tokens from input places
        for arc in input_arcs:
            place = next((p for p in net.places if p.id == arc.source_id), None)
            if place:
                place.tokens -= arc.weight
        
        # Add tokens to output places
        for arc in output_arcs:
            place = next((p for p in net.places if p.id == arc.target_id), None)
            if place:
                place.tokens += arc.weight
        
        net.updated_at = datetime.utcnow()
        
        # Return new marking
        return self.get_marking(net_id)
    
    def simulate(self, net_id: str, max_steps: int = 100) -> Optional[SimulationResult]:
        """Simulate the network automatically until deadlock or max_steps"""
        net = self.nets.get(net_id)
        if not net:
            return None
        
        steps: List[SimulationStep] = []
        step_number = 0
        initial_marking = self.get_marking(net_id)
        
        while step_number < max_steps:
            enabled_transitions = self.get_enabled_transitions(net_id)
            
            if not enabled_transitions:
                # Deadlock detected
                break
            
            # Choose a transition (here the first one)
            transition_id = enabled_transitions[0]
            marking_before = self.get_marking(net_id)
            
            # Fire the transition
            new_marking = self.fire_transition(net_id, transition_id)
            if not new_marking:
                break
            
            step = SimulationStep(
                step_number=step_number,
                transition_id=transition_id,
                marking_before=marking_before,
                marking_after=new_marking
            )
            steps.append(step)
            step_number += 1
        
        final_marking = self.get_marking(net_id)
        is_deadlock = len(self.get_enabled_transitions(net_id)) == 0
        
        return SimulationResult(
            net_id=net_id,
            steps=steps,
            final_marking=final_marking,
            is_deadlock=is_deadlock,
            is_bounded=self._check_bounded(net_id),
            is_reachable=True
        )
    
    def _check_bounded(self, net_id: str) -> bool:
        """Check if the network is bounded (simplified)"""
        net = self.nets.get(net_id)
        if not net:
            return True
        
        # Simplified check: if a place can have infinite tokens
        # In a real implementation, we would do deeper analysis
        for place in net.places:
            # For now, consider bounded if no cycle that adds tokens
            pass
        return True
    
    def reset_marking(self, net_id: str, initial_tokens: Optional[Dict[str, int]] = None) -> bool:
        """Reset the network marking"""
        net = self.nets.get(net_id)
        if not net:
            return False
        
        if initial_tokens:
            for place in net.places:
                place.tokens = initial_tokens.get(place.id, 0)
        else:
            for place in net.places:
                place.tokens = 0
        
        net.updated_at = datetime.utcnow()
        return True


# Global service instance
petri_service = PetriService()