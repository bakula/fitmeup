export type WorkoutType = {
  date: Date
  ownerId: string
  excercises: WorkoutExcercise[]
  user: string
}
export type WorkoutExcercise = {
  machine: string
  sets: WorkoutSetType[]
  index: number
}
export type WorkoutSetType = {
  index: number
  kilograms: number
  reps: number
  full?: boolean
  start?: Date
  end?: Date
}

export type UserType = {
  id: string
  name: string
  weight: number
  height: number
  birthDate: Date
}

export type WorkoutMachineType = {
  name?: string
  number: number
  description?: string
  gym: any
  adjustments?: MachineAdjustmentType[]
}

export type MachineAdjustmentType = {
  name: string
} & (
  | {
      scale: AdjustmentValueLinearScale
    }
  | {
      values: AdjustmentValue[]
    }
)
export type AdjustmentValueLinearScale = {
  min: number
  max: number
  step: number
}
export type AdjustmentValue = {
  value: number
  unit: 'kilogram' | 'lb'
}
