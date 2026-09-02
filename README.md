# Petri Net Simulation Project

Petri Net simulation project with separated frontend/backend architecture.

## 📁 Project Structure

```
RDP/
├── rdp-back/          # Backend FastAPI MVC
├── projet_rdp/        # Frontend React + TanStack Router
├── README.md          # Main documentation
└── .gitignore         # Combined git ignore
```

## 🚀 Quick Start

### Backend (FastAPI)

```bash
cd rdp-back
uv run fastapi dev
```

- **URL**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/api/petri/health

### Frontend (React)

```bash
cd projet_rdp
pnpm dev
```

- **URL**: http://localhost:3000

## 📖 Documentation

- [Backend Documentation](./rdp-back/README.md) - FastAPI MVC Architecture
- [Frontend Documentation](./projet_rdp/README.md) - React + TanStack Router Architecture

## 🎯 Features

### Backend API
- ✅ Complete Petri net management
- ✅ Creation of places, transitions, and arcs
- ✅ Token marking management
- ✅ Automatic and manual simulation
- ✅ Analysis (deadlock, boundedness, reachability)

### Frontend
- ✅ Interactive visual editor
- ✅ Real-time simulation
- ✅ Responsive interface
- ✅ Intuitive navigation

## 🔧 Technologies

### Backend
- **Framework**: FastAPI
- **Architecture**: MVC
- **Validation**: Pydantic
- **Server**: Uvicorn

### Frontend
- **Framework**: React 19
- **Router**: TanStack Router
- **Styling**: Tailwind CSS
- **Build**: Vite

## 📝 Petri Net Concepts

- **Places (Circles)**: Contain tokens, represent states
- **Transitions (Bars)**: Represent events/actions
- **Arcs (Arrows)**: Connect places and transitions
- **Tokens**: Move when transitions are fired
- **Marking**: Distribution of tokens in places

## 🤝 Development

### Adding New Features

1. **Backend**: Add in `models/` → `services/` → `controllers/` → `routes/`
2. **Frontend**: Add in `types/` → `lib/api.ts` → `components/` → `routes/`
3. **Generate routes**: `pnpm run generate-routes`

### Testing

```bash
# Backend
cd rdp-back
# Test with Swagger docs: http://localhost:8000/docs

# Frontend
cd projet_rdp
pnpm dev
```