import db from '../../db.json'

export const getProjects = () => {
  return db.projects
}

export const getTasks = () => {
  return db.tasks
}

export const getProjectById = (id) => {
  return db.projects.find(project => project.id === id)
}

export const getTasksByProjectId = (projectId) => {
  return db.tasks.filter(task => task.projectId === projectId)
}
