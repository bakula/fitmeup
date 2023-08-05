import { initializeApp } from "@firebase/app";
import {
  getFirestore,
  collection,
  doc,
  query,
  where,
  DocumentData,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

export enum USE_COLLECTION {
  DATA = 0,
  LOADING = 1,
  ERROR = 2,
}
const firebaseConfig = {
  apiKey: "AIzaSyDOnz6kVAnsfXVq1wxlzuy-txEnolLWJuc",
  authDomain: "fitmeup-f489e.firebaseapp.com",
  databaseURL:
    "https://fitmeup-f489e-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "fitmeup-f489e",
  storageBucket: "fitmeup-f489e.appspot.com",
  messagingSenderId: "584222140316",
  appId: "1:584222140316:web:1a07a96a5ae4316ad30a59",
  measurementId: "G-CKMWWFVYE3",
};
export const COLLECTION_CONFIG = {
  snapshotListenOptions: { includeMetadataChanges: true },
};

const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const firesoreDb = getFirestore(firebaseApp);
const dataBases = {
  gyms: "gyms",
  workoutMachines: "workoutMachines",
  workouts: "workouts",
  users: "users",
} as const;

export const collections = {
  gyms: collection(firesoreDb, dataBases.gyms),
  workoutMachines: collection(firesoreDb, dataBases.workoutMachines),
  workouts: collection(firesoreDb, dataBases.workouts),
  users: collection(firesoreDb, dataBases.users),
} as const;

export const docs = {
  workout: (id: string) => doc(firesoreDb, dataBases.workouts, id),
};

export const queryCurrentUser = (collection: any) =>
  query<DocumentData, DocumentData>(
    collection,
    where("ownerId", "==", auth.currentUser?.uid),
  );
