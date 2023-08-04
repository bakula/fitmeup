
import { useCallback, useState } from "react";
import Button from "react-bootstrap/Button";
import { WorkoutType } from "../types";
import {db} from "../App";
import {addDoc,collection } from "firebase/firestore"; 
import { useCollection} from 'react-firebase-hooks/firestore';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import BForm from 'react-bootstrap/Form';
function AddWorkout(){
    const [users, usersLoading, usersError] = useCollection(collection(db,"users"),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    })
console.log(users,usersLoading,usersError)
  const addNewWorkout:()=>void = async ()=>{
    const workout:WorkoutType = { date:new Date(),machine:"",sets:[],user:""}
    try {
        const docRef = await addDoc(collection(db, "workouts"), workout);
        console.log("Document written with ID: ", docRef.id);
      } catch (e) {
        console.error("Error adding document: ", e);
      }
  }
    return <div>
        <h1>Add workout</h1>

        <Formik
       initialValues={{ user: '' }}
       onSubmit={(values, { setSubmitting }) => {
         setTimeout(() => {
           alert(JSON.stringify(values, null, 2));
           setSubmitting(false);
         }, 400);
       }}
     >
       {({ isSubmitting }) => (
         <Form>
            <BForm.Select>{users?.docs.map(user=><option>{user.data().name}</option>)}</BForm.Select>
        
           <button type="submit" disabled={isSubmitting}>
             Submit
           </button>
         </Form>
       )}
     </Formik>
        <Button onClick={() => addNewWorkout()}>
          add
        </Button>
       
    </div>
}
export default AddWorkout;