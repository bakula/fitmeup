
import './App.css'
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form'
import Card from 'react-bootstrap/Card';
import Spinner from 'react-bootstrap/Spinner';
import { Link, Route } from "wouter";
import AddWorkout from './Components/AddWorkout';
import WorkoutHistory from './Components/WorkoutHistory';
import Register from './Components/Register';
import Alert from 'react-bootstrap/Alert';
import { useAuthState,useSendSignInLinkToEmail } from 'react-firebase-hooks/auth';
import { initializeApp } from "@firebase/app";
import {  getFirestore } from "firebase/firestore";
import { getAuth } from 'firebase/auth';
import { useState } from 'react';
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
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
const APP_PREFIX = `fit-me-up-`;
export const REGISTER_EMAIL_KEY = `${APP_PREFIX}register-email`
function App() {

  
  const [user, loading, error] = useAuthState(auth);
  
  
  const [sendSignInLinkToEmail, sending, sendingError] = useSendSignInLinkToEmail(auth);
  const [email, setEmail] = useState(localStorage.getItem(REGISTER_EMAIL_KEY)||"");
  const url = import.meta.env.MODE === "development" ?"http://localhost:5173/register":"https://fitmeup-f489e.web.app/register"
  console.log(user)
   return (!loading && !error && user ? 
    <>
      <Route path='/register' component={Register}></Route>
      <h1>FitMeUp</h1>
      <h2>{user.displayName} {user.email} </h2>
      <Card>
        <Link href='/add'>
          <Button>Add workout</Button>
        </Link>

        
      </Card> 
      <Card>
        <Link href='/history'>
          <Button>Workout history</Button>
        </Link>

        
      </Card>       
      <Route path='/add' component={AddWorkout}></Route>
      <Route path='/history' component={WorkoutHistory}></Route>
    </> :
    <>
    <Route path='/register' component={Register}></Route>
      <h1>Sig in {url}</h1>
      <Form.Control type="email" placeholder='email' value={email} onChange={(e)=>setEmail(e.target.value)}/>
    <Button variant='primary' onClick={()=>{sendSignInLinkToEmail(email, {url, handleCodeInApp:true});localStorage.setItem(REGISTER_EMAIL_KEY,email);}}>Sig in with email {sending && <Spinner
          as="span"
          animation="border"
          size="sm"
          role="status"
          aria-hidden="true"
        />}</Button>
        {sendingError && <Alert variant="danger" dismissible>
        <Alert.Heading>Erorr {sendingError.name}</Alert.Heading>
        <p>
          {sendingError.message}
          {sendingError.stack}
        </p>
      </Alert>}
    </>
  )
}

export default App
