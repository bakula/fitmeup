import { useState, useCallback } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { initializeApp } from 'firebase/app';
import { getFirestore,collection , getDocs } from 'firebase/firestore/lite';

function App() {
  const [count, setCount] = useState(0)
  const [groups,setGrups] = useState<{id:string}[]>([])
  const firebaseConfig = {
    apiKey: "AIzaSyDOnz6kVAnsfXVq1wxlzuy-txEnolLWJuc",
    authDomain: "fitmeup-f489e.firebaseapp.com",
    databaseURL: "https://fitmeup-f489e-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "fitmeup-f489e",
    storageBucket: "fitmeup-f489e.appspot.com",
    messagingSenderId: "584222140316",
    appId: "1:584222140316:web:1a07a96a5ae4316ad30a59",
    measurementId: "G-CKMWWFVYE3"
  };
  const firebaseApp = initializeApp(firebaseConfig);
  const db = getFirestore(firebaseApp);
  const loadMuscleGroups = useCallback(async () => {
    const groupsCollecion = collection(db, `muscle-groups`);
    const list = await getDocs(groupsCollecion);
    setGrups(list.docs.map(item=> ({
      id: item.id
    })))
  },[])
  return (
    <>
      <h1>FitMeUp</h1>
      <div className="card">
        <button onClick={() => loadMuscleGroups()}>
          load
        </button>
        {groups.map(group=><p key={group.id}>{group.id}</p>)}
        
      </div>
      
    </>
  )
}

export default App
