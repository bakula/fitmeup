export type WorkoutType = {
  date: string
  gym: string
  ownerId?: string
  excercises: WorkoutExcercise[]
  user: string
}
export type WorkoutExcercise = {
  machine: string
  sets: WorkoutSetType[]
  index: number
}
export type WorkoutSetType = {
  adjustments: Record<string, { value: number | string; name: string }>
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
}

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

export type DocumentWithData<T> = {
  id: string
  data: T
}
