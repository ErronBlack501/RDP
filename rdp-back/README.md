# Backend - Petri Net Simulation API

FastAPI backend with MVC architecture for Petri Net simulation.

## 🏗️ MVC Architecture

### Structure
```
rdp-back/
├── models/           # Pydantic data models
├── services/         # Business logic and simulation
├── controllers/      # API controllers
├── routes/           # FastAPI routes
├── main.py          # Entry point
└── pyproject.toml   # Python configuration
```

### Models
Defines data structures:
- `PetriNet`: Complete network
- `Place`: Place with position and tokens
- `Transition`: Transition with position
- `Arc`: Arc between place and transition
- `SimulationResult`: Simulation results

### Services
Business logic and simulation:
- `PetriService`: Network management
- Enabled transition checking
- Transition firing
- Automatic simulation
- Analysis (deadlock, boundedness, reachability)

### Controllers
HTTP request handling:
- `PetriController`: Validation and service calls
- HTTP error handling

### Routes
REST API endpoints with automatic documentation.

## 🔌 API Endpoints

### Networks
- `POST /api/petri/nets` - Create a network
- `GET /api/petri/nets` - List all networks
- `GET /api/petri/nets/{net_id}` - Get a network
- `PUT /api/petri/nets/{net_id}` - Update a network
- `DELETE /api/petri/nets/{net_id}` - Delete a network

### Elements
- `POST /api/petri/nets/{net_id}/places` - Add a place
- `POST /api/petri/nets/{net_id}/transitions` - Add a transition
- `POST /api/petri/nets/{net_id}/arcs` - Add an arc

### Marking
- `GET /api/petri/nets/{net_id}/marking` - Get marking
- `POST /api/petri/nets/{net_id}/marking/reset` - Reset marking

### Transitions
- `GET /api/petri/nets/{net_id}/transitions/enabled` - Enabled transitions
- `POST /api/petri/nets/{net_id}/transitions/{transition_id}/fire` - Fire a transition

### Simulation
- `POST /api/petri/nets/{net_id}/simulate` - Simulate the network

## 🚀 Getting Started

```bash
cd rdp-back
uv run fastapi dev
```

- **URL**: http://localhost:8000
- **Docs**: http://localhost:8000/docs
- **Health**: http://localhost:8000/api/petri/health

## 🔧 Configuration

### CORS
The backend accepts requests from:
- `http://localhost:3000`
- `http://localhost:5173`

### Dependencies
```bash
uv add "fastapi[standard]"
```

## 📝 Development

### Adding a New Feature

1. **Model**: Create the model in `models/`
2. **Service**: Implement logic in `services/`
3. **Controller**: Create controller in `controllers/`
4. **Route**: Add endpoint in `routes/`

### Testing
Use the interactive Swagger documentation:
```bash
# Open http://localhost:8000/docs
```