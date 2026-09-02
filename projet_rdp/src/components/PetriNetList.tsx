import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import type { PetriNet } from "#/types/petri";
import { petriApiClient } from "#/lib/api";

export function PetriNetList() {
  const [nets, setNets] = useState<PetriNet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await petriApiClient.getAllNets();
      setNets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Petri nets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNets();
  }, []);

  const handleDelete = async (netId: string) => {
    if (!confirm("Are you sure you want to delete this Petri net?")) return;
    
    try {
      await petriApiClient.deleteNet(netId);
      setNets(nets.filter((n) => n.id !== netId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete net");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading Petri nets...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Petri Nets</h1>
        <Link
          to="/create-net"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create New Net
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        {nets.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            No Petri nets found. Create your first one!
          </div>
        ) : (
          nets.map((net) => (
            <div
              key={net.id}
              className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-lg">{net.name}</h3>
                <span className="text-sm text-gray-500">
                  {new Date(net.created_at).toLocaleDateString()}
                </span>
              </div>

              {net.description && (
                <p className="text-gray-600 mb-3">{net.description}</p>
              )}

              <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                <div>
                  <span className="font-medium">Places:</span> {net.places.length}
                </div>
                <div>
                  <span className="font-medium">Transitions:</span> {net.transitions.length}
                </div>
                <div>
                  <span className="font-medium">Arcs:</span> {net.arcs.length}
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  to="/net/$netId"
                  params={{ netId: net.id }}
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm"
                >
                  View & Edit
                </Link>
                <Link
                  to="/simulate/$netId"
                  params={{ netId: net.id }}
                  className="bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600 text-sm"
                >
                  Simulate
                </Link>
                <button
                  onClick={() => handleDelete(net.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}