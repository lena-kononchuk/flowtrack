# FlowTrack

Modern project and task management application built with Vue 3, TypeScript, and Pinia. Organize your projects with flexible table and kanban board views.

🔗 **[Live Demo](https://lena-kononchuk.github.io/flowtrack/)**

## Features

- 📊 **Project Management** - Create and track multiple projects
- ✅ **Task Tracking** - Add, edit, and organize tasks within projects
- 📋 **Dual View Modes** - Switch between Table and Kanban board views
- 🎯 **Drag & Drop** - Reorder tasks with intuitive drag-and-drop
- 🏷️ **Task Statuses** - Todo, In Progress, Done, Blocked
- 💾 **Local Storage** - Automatic data persistence
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🎨 **Clean UI** - Modern interface with FontAwesome icons

## Tech Stack

- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe development
- **Pinia** - State management
- **Vue Router** - Client-side routing
- **Vite** - Fast build tool
- **SCSS** - Styling with variables and mixins
- **Axios** - HTTP client
- **vuedraggable** - Drag and drop functionality
- **JSON Server** - Mock REST API

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/lena-kononchuk/flowtrack.git
cd flowtrack

# Install dependencies
npm install

# Start development server
npm run dev

# Start JSON server (in another terminal)
npx json-server --watch db.json --port 3001
```

The app will be available at `http://localhost:5173`

## Build for Production

```bash
# Build
npm run build

# Preview production build
npm run preview
```

## Deployment to GitHub Pages

```bash
npm run deploy
```

## Project Structure

```
flowtrack/
├── src/
│   ├── api/              # API service layer
│   ├── components/       # Vue components
│   │   ├── common/       # Shared components
│   │   ├── projects/     # Project components
│   │   └── tasks/        # Task components
│   ├── composables/      # Vue composables
│   ├── router/           # Vue Router config
│   ├── stores/           # Pinia stores
│   ├── styles/           # SCSS styles
│   ├── types/            # TypeScript types
│   ├── views/            # Page components
│   └── main.ts           # App entry point
├── public/               # Static assets
└── db.json               # JSON Server database
```

## Key Features Explained

### Project Management
- Create projects with names and descriptions
- Track project status (Planned, Pending, Active, Completed)
- View task count per project
- Navigate to detailed project view

### Task Views

**Table View:**
- List all tasks in a sortable table
- Quick status updates
- Inline editing
- Reorder with drag & drop

**Kanban View:**
- Visual board with status columns
- Drag tasks between columns
- Status automatically updates on drop
- Add tasks directly to specific columns

### Data Persistence
- Automatic save to localStorage
- Sync with backend API (JSON Server)
- Offline-first approach

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run deploy` - Deploy to GitHub Pages

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
