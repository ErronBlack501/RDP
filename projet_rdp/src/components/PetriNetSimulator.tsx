import { useState, useEffect } from "react";
import { Link, useParams } from "@tanstack/react-router";
import type { PetriNet, SimulationResult } from "#/types/petri";
import { petriApiClient } from "#/lib/api";

export function PetriNetSimulator() {
  const { netId } = useParams({ from: "/simulate/$netId" });
  const [net, setNet] = useState<PetriNet | null>(null);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [manualMode, setManualMode] = useState(false);
  const [enabledTransitions, setEnabledTransitions] = useState<string[]>([]);

  useEffect(() => {
    loadNet();
  }, [netId]);

  const loadNet = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await petriApiClient.getNet(netId);
      setNet(data);
      await loadEnabledTransitions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Petri net");
    } finally {
      setLoading(false);
    }
  };

  const loadEnabledTransitions = async () => {
    try {
      const transitions = await petriApiClient.getEnabledTransitions(netId);
      setEnabledTransitions(transitions);
    } catch (err) {
      console.error("Failed to load enabled transitions", err);
    }
  };

  const runSimulation = async () => {
    if (!net) return;

    try {
      setSimulating(true);
      setError(null);
      const result = await petriApiClient.simulateNet(net.id, 100);
      setSimulationResult(result);
      setCurrentStep(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Simulation failed");
    } finally {
      setSimulating(false);
    }
  };

  const fireTransition = async (transitionId: string) => {
    if (!net) return;

    try {
      const newMarking = await petriApiClient.fireTransition(net.id, transitionId);
      
      // Update local net state
      const updatedPlaces = net.places.map(place => ({
        ...place,
        tokens: newMarking[place.id] || 0
      }));
      setNet({ ...net, places: updatedPlaces });
      
      await loadEnabledTransitions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fire transition");
    }
  };

  const resetMarking = async () => {
    if (!net) return;

    try {
      await petriApiClient.resetMarking(net.id);
      await loadNet();
      setSimulationResult(null);
      setCurrentStep(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset marking");
    }
  };

  const getTransitionName = (transitionId: string) => {
    if (!net) return transitionId;
    const transition = net.transitions.find(t => t.id === transitionId);
    return transition?.name || transitionId;
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
          <h1 className="text-3xl font-bold mt-2">Simulation: {net.name}</h1>
        </div>
        <div className="flex gap-2">
          <Link
            to="/net/$netId"
            params={{ netId: net.id }}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Edit Net
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Current Marking */}
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-semibold mb-2">Current Marking:</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {net.places.map((place) => (
            <div key={place.id} className="bg-white p-2 rounded text-center">
              <div className="font-medium">{place.name}</div>
              <div className="text-2xl font-bold">{place.tokens}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-100 p-4 rounded mb-4">
        <div className="flex items-center gap-4 mb-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={manualMode}
              onChange={(e) => setManualMode(e.target.checked)}
              className="mr-2"
            />
            <span className="font-medium">Manual Mode</span>
          </label>
        </div>

        {!manualMode ? (
          <div className="flex gap-2">
            <button
              onClick={runSimulation}
              disabled={simulating}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:bg-gray-400"
            >
              {simulating ? "Simulating..." : "Run Full Simulation"}
            </button>
            <button
              onClick={resetMarking}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Reset Marking
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-2">
              <span className="font-medium">Enabled Transitions:</span>
            </div>
            {enabledTransitions.length === 0 ? (
              <div className="text-red-500">No enabled transitions (deadlock)</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {enabledTransitions.map((transitionId) => (
                  <button
                    key={transitionId}
                    onClick={() => fireTransition(transitionId)}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  >
                    Fire {getTransitionName(transitionId)}
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={resetMarking}
              className="mt-3 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Reset Marking
            </button>
          </div>
        )}
      </div>

      {/* Simulation Results */}
      {simulationResult && (
        <div className="bg-white border rounded p-4 mb-4">
          <h2 className="font-semibold mb-3">Simulation Results</h2>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className={`p-2 rounded ${simulationResult.is_deadlock ? "bg-red-100" : "bg-green-100"}`}>
              <div className="font-medium">Deadlock</div>
              <div>{simulationResult.is_deadlock ? "Yes" : "No"}</div>
            </div>
            <div className={`p-2 rounded ${simulationResult.is_bounded ? "bg-green-100" : "bg-red-100"}`}>
              <div className="font-medium">Bounded</div>
              <div>{simulationResult.is_bounded ? "Yes" : "No"}</div>
            </div>
            <div className={`p-2 rounded ${simulationResult.is_reachable ? "bg-green-100" : "bg-red-100"}`}>
              <div className="font-medium">Reachable</div>
              <div>{simulationResult.is_reachable ? "Yes" : "No"}</div>
            </div>
          </div>

          <div className="mb-3">
            <div className="font-medium mb-2">Steps: {simulationResult.steps.length}</div>
            {simulationResult.steps.length > 0 && (
              <div className="max-h-48 overflow-y-auto border rounded p-2">
                {simulationResult.steps.map((step, index) => (
                  <div key={index} className="py-1 border-b last:border-0">
                    <span className="font-medium">Step {step.step_number}:</span>{" "}
                    Fired {getTransitionName(step.transition_id)}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="font-medium mb-2">Final Marking:</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(simulationResult.final_marking).map(([placeId, tokens]) => {
                const place = net.places.find(p => p.id === placeId);
                return (
                  <div key={placeId} className="bg-gray-100 p-2 rounded text-center">
                    <div className="font-medium">{place?.name || placeId}</div>
                    <div className="text-xl font-bold">{tokens}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Visual representation */}
      <div className="bg-white border rounded p-4">
        <h2 className="font-semibold mb-3">Network Visualization</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2">Places</h3>
            {net.places.map((place) => (
              <div key={place.id} className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-full border-2 border-gray-800 bg-white flex items-center justify-center">
                  {place.tokens}
                </div>
                <span>{place.name}</span>
              </div>
            ))}
          </div>
          <div>
            <h3 className="font-medium mb-2">Transitions</h3>
            {net.transitions.map((transition) => (
              <div key={transition.id} className="flex items-center gap-2 mb-1">
                <div className={`w-8 h-8 bg-gray-800 flex items-center justify-center ${enabledTransitions.includes(transition.id) ? "ring-2 ring-green-500" : ""}`}>
                  <div className="w-0.5 h-6 bg-white"></div>
                </div>
                <span>{transition.name}</span>
                {enabledTransitions.includes(transition.id) && (
                  <span className="text-xs text-green-500">(enabled)</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}