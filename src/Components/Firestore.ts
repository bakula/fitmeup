import { initializeApp } from '@firebase/app'
import {
  getFirestore,
  collection,
  doc,
  query,
  where,
  DocumentData,
  Query,
  QueryFieldFilterConstraint,
  QueryOrderByConstraint,
} from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

export enum USE_COLLECTION {
  DATA = 0,
  LOADING = 1,
  ERROR = 2,
}
const firebaseConfig = {
  apiKey: 'AIzaSyDOnz6kVAnsfXVq1wxlzuy-txEnolLWJuc',
  authDomain: 'fitmeup-f489e.firebaseapp.com',
  databaseURL: 'https://fitmeup-f489e-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'fitmeup-f489e',
  storageBucket: 'fitmeup-f489e.appspot.com',
  messagingSenderId: '584222140316',
  appId: '1:584222140316:web:1a07a96a5ae4316ad30a59',
  measurementId: 'G-CKMWWFVYE3',
}
export const COLLECTION_CONFIG = {
  snapshotListenOptions: { includeMetadataChanges: true },
}

const firebaseApp = initializeApp(firebaseConfig)
export const auth = getAuth(firebaseApp)
export const firestoreDb = getFirestore(firebaseApp)
const dataBases = {
  exercises: 'exercises',
  gyms: 'gyms',
  muscleGroups: 'muscleGroups',
  workoutMachines: 'workoutMachines',
  workouts: 'workouts',
  users: 'users',
} as const

export const collections = {
  exercises: collection(firestoreDb, dataBases.exercises),
  gyms: collection(firestoreDb, dataBases.gyms),
  muscleGroups: collection(firestoreDb, dataBases.muscleGroups),
  workoutMachines: collection(firestoreDb, dataBases.workoutMachines),
  workouts: collection(firestoreDb, dataBases.workouts),
  users: collection(firestoreDb, dataBases.users),
} as const

export const docs = {
  exercise: (id: string) => doc(firestoreDb, dataBases.exercises, id),
  user: (id: string) => doc(firestoreDb, dataBases.users, id),
  workout: (id: string) => doc(firestoreDb, dataBases.workouts, id),
  workoutMachine: (id: string) => doc(firestoreDb, dataBases.workoutMachines, id),
}

export const queryCurrentUser = (
  collection: Query<DocumentData, DocumentData>,
  ...aditionalRules: (QueryFieldFilterConstraint | QueryOrderByConstraint)[]
) => {
  const rules = [where('ownerId', '==', auth.currentUser?.uid), ...aditionalRules]
  return query<DocumentData, DocumentData>(collection, ...rules)
}
