import type { VehicleProject } from '../../constants/model'

export type ComponentUpdate = { project: VehicleProject; changed: boolean }

/** Component entries in the current library represent one installable instance. */
export function addProjectComponent(project: VehicleProject, name: string, at: string): ComponentUpdate {
  const selectedComponents = project.selectedComponents ?? []
  if (selectedComponents.includes(name)) return { project, changed: false }

  return {
    changed: true,
    project: {
      ...project,
      selectedComponents: [...selectedComponents, name],
      componentHistory: [...(project.componentHistory ?? []), { name, action: 'added', at }],
      updatedAt: at,
    },
  }
}

export function removeProjectComponent(project: VehicleProject, name: string, at: string): ComponentUpdate {
  const selectedComponents = project.selectedComponents ?? []
  if (!selectedComponents.includes(name)) return { project, changed: false }

  return {
    changed: true,
    project: {
      ...project,
      selectedComponents: selectedComponents.filter(component => component !== name),
      componentHistory: [...(project.componentHistory ?? []), { name, action: 'removed', at }],
      updatedAt: at,
    },
  }
}
