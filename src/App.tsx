
import './App.css'
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { Link, Route } from "wouter";
import AddWorkout from './Components/AddWorkout';
import WorkoutHistory from './Components/WorkoutHistory';
function App() {
  
  return (
    <>
      <h1>FitMeUp</h1>
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
    </>
  )
}

export default App
