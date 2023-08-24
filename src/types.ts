export type WorkoutType = {
  date: string
  gym: string
  ownerId?: string
  excercises: WorkoutExcercise[]
  user: string
}
export type PercentageMap = Record<string, Percentage>
export type WorkoutExcercise = {
  muscleGroups: PercentageMap
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
export type Percentage = { percentage: number }
export type Volume = { volume: number }
export type VolumeAndPrecentageMap = Record<string, Volume & Percentage>
export type UserType = {
  name: string
  weight: number
  height: number
  birthDate: Date
  adjustments: Record<string, { value: number }>
}

export type Excercise = {
  name: string
  description: string
  muscleGroupsAffected: MuscleGroupsAffectedMap
  machineIds: string[]
}

export type WorkoutMachineType = {
  name?: string
  number: number
  description?: string
  gym: string
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
export type CollectionWithData<T> = {
  docs?: DocumentWithData<T>[]
}
