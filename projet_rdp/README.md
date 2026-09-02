# Frontend - Petri Net Simulation UI

React frontend with TanStack Router for Petri Net simulation interface.

## 🏗️ Architecture

### Structure
```
projet_rdp/
├── src/
│   ├── components/    # React components
│   ├── types/        # TypeScript types
│   ├── lib/          # Utilities and API client
│   ├── routes/       # TanStack Router routes
│   ├── main.tsx      # Entry point
│   └── router.tsx    # Router configuration
├── index.html        # HTML template
├── package.json     # Dependencies
└── vite.config.ts    # Vite configuration
```

### Components
- **PetriNetList**: Network list with management
- **CreatePetriNet**: Creation form
- **PetriNetEditor**: Interactive visual editor
- **PetriNetSimulator**: Automatic and manual simulation

### Types
Defines TypeScript structures corresponding to backend models:
- PetriNet, Place, Transition, Arc
- SimulationResult, SimulationStep
- Creation and update types

### API Client
HTTP client for backend communication:
- Methods for all API endpoints
- Error handling
- Base URL configuration

## 🎨 UI Features

### Visual Editor
- ✅ Interactive canvas for element placement
- ✅ Add places (circles) and transitions (bars)
- ✅ Create arcs between elements
- ✅ Token adjustment with +/- buttons
- ✅ Element selection and deletion
- ✅ Arc visualization with directional arrows

### Simulation
- ✅ Automatic mode with complete simulation
- ✅ Manual mode with individual transition firing
- ✅ Enabled transition visualization
- ✅ Real-time marking display
- ✅ Simulation results (deadlock, boundedness, reachability)
- ✅ Marking reset

### Navigation
- ✅ Home page with introduction
- ✅ Network list with quick actions
- ✅ Creation form
- ✅ Editor with toolbar
- ✅ Simulator with controls

## 🚀 Getting Started

```bash
cd projet_rdp
pnpm dev
```

- **URL**: http://localhost:3000
- **Build**: `pnpm build`
- **Preview**: `pnpm preview`

## 🔧 Configuration

### Backend API
The API URL is configured in `src/lib/api.ts`:
```typescript
const API_BASE_URL = "http://localhost:8000/api/petri";
```

### Routes
Routes are generated automatically:
```bash
pnpm run generate-routes
```

## 📝 Development

### Adding a New Page

1. **Create component** in `src/components/`
2. **Create route** in `src/routes/`
3. **Generate routes**: `pnpm run generate-routes`
4. **Add navigation** in `src/routes/__root.tsx`

### Styles
The project uses Tailwind CSS v4 with Vite plugin.

### Linting
```bash
pnpm lint
pnpm format
pnpm check
```

## 🎯 Usage

### Create a Network
1. Click "Create Petri Net"
2. Enter name and description
3. Redirected to editor

### Edit a Network
1. Select mode (Place, Transition, Arc)
2. Click on canvas to add
3. For arcs: click source then target
4. Adjust tokens with +/- buttons on places

### Simulate
1. Click "Simulate" from editor
2. Choose mode (Auto/Manual)
3. Run simulation or fire transitions manually
4. View results and final marking