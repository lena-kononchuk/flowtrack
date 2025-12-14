export interface Project {
  id: number;
  name: string;
  shortDescription?: string;
  fullDescription?: string;
  status: 'pending' | 'active' | 'completed' | 'planned';
  createdAt: string;
}