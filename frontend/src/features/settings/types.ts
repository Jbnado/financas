export interface Category {
  id: string
  name: string
  icon: string | null
  color: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateCategoryInput {
  name: string
  icon?: string
  color?: string
}

export interface UpdateCategoryInput {
  name?: string
  icon?: string
  color?: string
}
