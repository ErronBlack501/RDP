import { Link } from "@tanstack/react-router";
import { useState } from "react";
import type { PetriNetCreate } from "#/types/petri";
import { petriApiClient } from "#/lib/api";

export function CreatePetriNet() {
  const [formData, setFormData] = useState<PetriNetCreate>({
    name: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const net = await petriApiClient.createNet(formData);
      setSuccess(true);
      // Redirect to the net editor
      window.location.href = `/net/${net.id}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create Petri net");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Create Petri Net</h1>

      <Link
        to="/nets"
        className="inline-block mb-4 text-blue-500 hover:text-blue-600"
      >
        ← Back to Petri Nets
      </Link>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Petri net created successfully!
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="border rounded px-3 py-2 w-full"
            required
            placeholder="e.g., Production System"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="border rounded px-3 py-2 w-full"
            rows={3}
            placeholder="Optional description of the Petri net"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 w-full"
        >
          {loading ? "Creating..." : "Create Petri Net"}
        </button>
      </form>
    </div>
  );
}