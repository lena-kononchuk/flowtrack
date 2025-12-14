# FlowTrack - Task Management Application

A modern task management application built with Vue 3, TypeScript, and Vite. Track your projects and tasks with an intuitive Kanban board and table view.

##  Live Demo

[View Live Application]

##  Features

-  Project management with status tracking
-  Task management with drag-and-drop Kanban board
-  Alternative table view for tasks
-  Search and filter functionality
-  Local data persistence

##  Tech Stack

- **Frontend:** Vue 3, TypeScript, Vite
- **Styling:** SCSS, Flexboxgrid
- **State Management:** Pinia
- **Backend:** JSON Server (mock API)
- **HTTP Client:** Axios
- **Drag & Drop:** vuedraggable

##  Installation

### Steps

1. Clone the repository:
```bash
git clone 
cd flowtrack
```

2. Install dependencies:
```bash
npm install
```

3. Start the development servers:
```bash
npm run dev:all
```


##  Project Structure
```
flowtrack/
├── src/
│   ├── api/              # API service layers
│   ├── components/       # Vue components
│   │   ├── common/       # Shared components
│   │   ├── projects/     # Project-related components
│   │   └── tasks/        # Task-related components
│   ├── composables/      # Vue composables
│   ├── router/           # Vue Router configuration
│   ├── stores/           # Pinia stores
│   ├── types/            # TypeScript type definitions
│   ├── views/            # Page components
│   └── main.ts           # Application entry point
├── db.json               # Mock database for JSON Server
└── package.json
```

##  Usage

### Managing Projects

1. Click "Add Project" button on the home page
2. Fill in project name and description
3. Click a project to view its tasks

### Managing Tasks

1. Inside a project, click "Add Task" in any column
2. Fill in task details (name, description, assignee, due date)
3. Drag and drop tasks between columns to change status
4. Click "Edit" on a task to modify it
5. Switch between Kanban and Table views using the toggle buttons

### Search and Filter

- Use the search bar to find projects by name
- Filter projects by status using the dropdown
- In table view, sort columns by clicking column headers

