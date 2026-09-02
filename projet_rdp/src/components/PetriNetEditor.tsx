import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "@tanstack/react-router";
import type { PetriNet, Place, Transition, Arc, Position } from "#/types/petri";
import { petriApiClient } from "#/lib/api";

export function PetriNetEditor() {
  const { netId } = useParams({ from: "/net/$netId" });
  const [net, setNet] = useState<PetriNet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"select" | "place" | "transition" | "arc">("select");
  const [selectedElement, setSelectedElement] = useState<{ type: "place" | "transition" | "arc"; id: string } | null>(null);
  const [arcSource, setArcSource] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadNet();
  }, [netId]);

  const loadNet = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await petriApiClient.getNet(netId);
      setNet(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Petri net");
    } finally {
      setLoading(false);
    }
  };

  const handleCanvasClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current || !net) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (mode === "place") {
      try {
        const place = await petriApiClient.addPlace(net.id, {
          name: `P${net.places.length + 1}`,
          position: { x, y },
          tokens: 0,
        });
        setNet({ ...net, places: [...net.places, place] });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add place");
      }
    } else if (mode === "transition") {
      try {
        const transition = await petriApiClient.addTransition(net.id, {
          name: `T${net.transitions.length + 1}`,
          position: { x, y },
        });
        setNet({ ...net, transitions: [...net.transitions, transition] });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add transition");
      }
    }
  };

  const handleElementClick = (e: React.MouseEvent, type: "place" | "transition", id: string) => {
    e.stopPropagation();
    
    if (mode === "arc") {
      if (!arcSource) {
        setArcSource(id);
      } else if (arcSource !== id) {
        // Create arc
        createArc(arcSource, id);
        setArcSource(null);
      }
    } else {
      setSelectedElement({ type, id });
    }
  };

  const createArc = async (sourceId: string, targetId: string) => {
    if (!net) return;

    try {
      // Determine arc type based on element types
      const sourcePlace = net.places.find(p => p.id === sourceId);
      const targetPlace = net.places.find(p => p.id === targetId);
      const sourceTransition = net.transitions.find(t => t.id === sourceId);
      const targetTransition = net.transitions.find(t => t.id === targetId);

      let arcType: "input" | "output";
      if (sourcePlace && targetTransition) {
        arcType = "input";
      } else if (sourceTransition && targetPlace) {
        arcType = "output";
      } else {
        setError("Invalid arc: must connect place to transition or vice versa");
        return;
      }

      const arc = await petriApiClient.addArc(net.id, {
        source_id: sourceId,
        target_id: targetId,
        arc_type: arcType,
        weight: 1,
      });
      setNet({ ...net, arcs: [...net.arcs, arc] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add arc");
    }
  };

  const handleTokensChange = async (placeId: string, delta: number) => {
    if (!net) return;

    const place = net.places.find(p => p.id === placeId);
    if (!place) return;

    const newTokens = Math.max(0, place.tokens + delta);
    
    // Update locally first for responsiveness
    const updatedPlaces = net.places.map(p => 
      p.id === placeId ? { ...p, tokens: newTokens } : p
    );
    setNet({ ...net, places: updatedPlaces });

    // You might want to sync this with the backend
  };

  const handleDeleteElement = async () => {
    if (!selectedElement || !net) return;

    try {
      if (selectedElement.type === "place") {
        const updatedPlaces = net.places.filter(p => p.id !== selectedElement.id);
        const updatedArcs = net.arcs.filter(a => a.source_id !== selectedElement.id && a.target_id !== selectedElement.id);
        setNet({ ...net, places: updatedPlaces, arcs: updatedArcs });
      } else if (selectedElement.type === "transition") {
        const updatedTransitions = net.transitions.filter(t => t.id !== selectedElement.id);
        const updatedArcs = net.arcs.filter(a => a.source_id !== selectedElement.id && a.target_id !== selectedElement.id);
        setNet({ ...net, transitions: updatedTransitions, arcs: updatedArcs });
      }
      setSelectedElement(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete element");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading Petri net...</div>
      </div>
    );
  }

  if (!net) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-red-500">Petri net not found</div>
        <Link to="/nets" className="text-blue-500">Back to Petri nets</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link to="/nets" className="text-blue-500 hover:text-blue-600">
            ← Back to Petri Nets
          </Link>
          <h1 className="text-3xl font-bold mt-2">{net.name}</h1>
          {net.description && <p className="text-gray-600">{net.description}</p>}
        </div>
        <Link
          to="/simulate/$netId"
          params={{ netId: net.id }}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
          Simulate
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-gray-100 p-3 rounded mb-4 flex gap-2">
        <button
          onClick={() => setMode("select")}
          className={`px-3 py-1 rounded ${mode === "select" ? "bg-blue-500 text-white" : "bg-white"}`}
        >
          Select
        </button>
        <button
          onClick={() => setMode("place")}
          className={`px-3 py-1 rounded ${mode === "place" ? "bg-blue-500 text-white" : "bg-white"}`}
        >
          Add Place
        </button>
        <button
          onClick={() => setMode("transition")}
          className={`px-3 py-1 rounded ${mode === "transition" ? "bg-blue-500 text-white" : "bg-white"}`}
        >
          Add Transition
        </button>
        <button
          onClick={() => setMode("arc")}
          className={`px-3 py-1 rounded ${mode === "arc" ? "bg-blue-500 text-white" : "bg-white"}`}
        >
          Add Arc
        </button>
        {selectedElement && (
          <button
            onClick={handleDeleteElement}
            className="px-3 py-1 rounded bg-red-500 text-white"
          >
            Delete Selected
          </button>
        )}
        {arcSource && (
          <div className="text-sm text-gray-600 self-center">
            Select target for arc...
          </div>
        )}
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="border-2 border-dashed border-gray-300 rounded bg-white relative"
        style={{ height: "600px", cursor: mode === "select" ? "default" : "crosshair" }}
        onClick={handleCanvasClick}
      >
        {/* Render arcs */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {net.arcs.map((arc) => {
            const source = [...net.places, ...net.transitions].find(n => n.id === arc.source_id);
            const target = [...net.places, ...net.transitions].find(n => n.id === arc.target_id);
            if (!source || !target) return null;

            return (
              <line
                key={arc.id}
                x1={source.position.x}
                y1={source.position.y}
                x2={target.position.x}
                y2={target.position.y}
                stroke={arc.arc_type === "input" ? "#3B82F6" : "#10B981"}
                strokeWidth="2"
                markerEnd={arc.arc_type === "input" ? "url(#arrowhead-input)" : "url(#arrowhead-output)"}
              />
            );
          })}
          <defs>
            <marker id="arrowhead-input" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#3B82F6" />
            </marker>
            <marker id="arrowhead-output" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#10B981" />
            </marker>
          </defs>
        </svg>

        {/* Render places */}
        {net.places.map((place) => (
          <div
            key={place.id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer ${
              selectedElement?.type === "place" && selectedElement.id === place.id ? "ring-2 ring-blue-500" : ""
            } ${arcSource === place.id ? "ring-2 ring-yellow-500" : ""}`}
            style={{ left: place.position.x, top: place.position.y }}
            onClick={(e) => handleElementClick(e, "place", place.id)}
          >
            <div className="w-16 h-16 rounded-full border-4 border-gray-800 bg-white flex items-center justify-center relative">
              <span className="font-bold">{place.tokens}</span>
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs whitespace-nowrap">
                {place.name}
              </div>
            </div>
            {selectedElement?.type === "place" && selectedElement.id === place.id && (
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); handleTokensChange(place.id, -1); }}
                  className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                >
                  -
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleTokensChange(place.id, 1); }}
                  className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                >
                  +
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Render transitions */}
        {net.transitions.map((transition) => (
          <div
            key={transition.id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer ${
              selectedElement?.type === "transition" && selectedElement.id === transition.id ? "ring-2 ring-blue-500" : ""
            } ${arcSource === transition.id ? "ring-2 ring-yellow-500" : ""}`}
            style={{ left: transition.position.x, top: transition.position.y }}
            onClick={(e) => handleElementClick(e, "transition", transition.id)}
          >
            <div className="w-12 h-12 bg-gray-800 flex items-center justify-center relative">
              <div className="w-1 h-8 bg-white"></div>
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs whitespace-nowrap">
                {transition.name}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info panel */}
      <div className="mt-4 bg-gray-100 p-4 rounded">
        <h3 className="font-semibold mb-2">Instructions:</h3>
        <ul className="text-sm space-y-1">
          <li>• Select "Add Place" and click on canvas to add places</li>
          <li>• Select "Add Transition" and click on canvas to add transitions</li>
          <li>• Select "Add Arc", click source, then click target to connect</li>
          <li>• Click on places to select and adjust token count</li>
          <li>• Use "Delete Selected" to remove elements</li>
        </ul>
      </div>
    </div>
  );
}