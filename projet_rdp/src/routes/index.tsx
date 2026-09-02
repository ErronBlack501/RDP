import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-4">Petri Net Simulation</h1>
      <p className="text-lg mb-8">
        Welcome to the Petri Net simulation system. Create, edit, and simulate Petri nets for modeling distributed systems.
      </p>
      
      <div className="grid gap-4 md:grid-cols-2 max-w-2xl">
        <Link to="/nets" className="block p-6 border rounded-lg hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">View Petri Nets</h2>
          <p className="text-gray-600">Browse and manage your Petri net models</p>
        </Link>
        
        <Link to="/create-net" className="block p-6 border rounded-lg hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Create Petri Net</h2>
          <p className="text-gray-600">Start a new Petri net model from scratch</p>
        </Link>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-2">About Petri Nets</h2>
        <p className="text-gray-700 mb-2">
          Petri nets are a mathematical modeling tool for describing and analyzing distributed systems. 
          They consist of places (circles), transitions (bars), and arcs (arrows) that connect them.
        </p>
        <p className="text-gray-700">
          Tokens (dots) move through the network as transitions fire, enabling the simulation of concurrent processes.
        </p>
      </div>
    </div>
  )
}
