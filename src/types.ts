export type WorkoutType = {
  date: string
  gym: string
  ownerId?: string
  excercises: WorkoutExcercise[]
  user: string
}
export type WorkoutExcercise = {
  muscleGroups: Record<string, { percentage: number }>
  machine: string
  sets: WorkoutSetType[]
  index: number
}
export type AdjustmentMap = Record<string, { value: number | string; name: string }>
export type WorkoutSetType = {
  adjustments: AdjustmentMap
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
  adjustments: Record<string, { value: number }>
}

export type WorkoutMachineType = {
  name?: string
  number: number
  description?: string
  gym: any
  adjustments?: MachineAdjustmentType[]
  muscleGroupsAffected: MuscleGroupsAffectedMap
}
export type MuscleGroupsAffectedMap = Record<string, { percentage: number; adjustments: AdjustmentMap }>
export type ScaleOrValues =
  | {
      scale: AdjustmentValueLinearScale
      values: never
      elements: never
    }
  | {
      scale: never
      values: AdjustmentValue[]
      elements: never
    }
  | {
      scale: never
      values: never
      elements: AdjustmentElement[]
    }
export type MachineAdjustmentType = {
  uuid: string
  name: string
} & ScaleOrValues
export type AdjustmentValueLinearScale = {
  min: number
  max: number
  step: number
}
export type AdjustmentValue = {
  kg: number
}
export type AdjustmentElement = {
  name: string
}
export type MuscleGroup = {
  name: string
  relaxBreak?: Record<'low' | 'mid' | 'high', number>
}
export type DocumentWithData<T> = {
  id: string
  data: () => T
}
