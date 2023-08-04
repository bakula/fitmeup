export type WorkoutType ={
    date:Date,
    machine:string, 
    user:string,
    sets:WorkoutSetType[]
}
export type WorkoutSetType ={
    index:number,
    kilograms:number,
    reps:number,
    full?:boolean,
    start?:Date, 
    end?:Date
}

export type UserType = {
    id:string,
    name:string,
    weight:number,
    height:number,
    birthDate: Date
}