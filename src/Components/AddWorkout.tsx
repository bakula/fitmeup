import { useCallback, useState } from 'react'
import Button from 'react-bootstrap/Button'
import { WorkoutMachineType, WorkoutType } from '../types'
import { WORKOUT_USER_ID, WORKOUT_GYM_ID } from '../App'
import { addDoc, doc, query, where, setDoc } from 'firebase/firestore'
import { useCollection, useDocument } from 'react-firebase-hooks/firestore'
import { Formik, Form, Field } from 'formik'
import BForm from 'react-bootstrap/Form'
import { COLLECTION_CONFIG, auth, collections, docs, queryCurrentUser } from './Firestore'

function AddWorkout() {
  const [userId, _setUserId] = useState(localStorage.getItem(WORKOUT_USER_ID) || '')
  const [gymId, _setGymId] = useState(localStorage.getItem(WORKOUT_GYM_ID) || '')

  const setUserId = useCallback((id: string) => {
    _setUserId(id)
    localStorage.setItem(WORKOUT_USER_ID, id)
  }, [])
  const setGymId = useCallback((id: string) => {
    _setGymId(id)
    localStorage.setItem(WORKOUT_GYM_ID, id)
  }, [])
  const [date, setDate] = useState<string>(new Date().toJSON().slice(0, 10))
  const getWorkoutId = () => `${gymId}_${userId}_${date}`
  const [workout, workoutLoading, workoutError] = useDocument(docs.workout(getWorkoutId()))
  const [gyms, gymsLoading, gymsError] = useCollection(collections.gyms)
  const [users, usersLoading, usersError] = useCollection(queryCurrentUser(collections.users), COLLECTION_CONFIG)
  const [workouts, workoutsLoading, workoutsError] = useCollection(
    queryCurrentUser(collections.workouts),
    COLLECTION_CONFIG
  )
  const [workoutMachines, workoutMachinesLoading, workoutMachinesError] = useCollection(
    query(collections.workoutMachines, where('gym', '==', gymId)),
    COLLECTION_CONFIG
  )
  console.log('workout', workout, workoutLoading, workoutError)
  console.log('workouts', workouts?.docs)
  console.log('gyms', gyms, gymsError)
  console.log('workoutMachines', workoutMachines, workoutMachinesError)
  const addNewWorkout: () => void = async () => {
    const ownerId = auth?.currentUser?.uid
    if (ownerId) {
      const workout: WorkoutType = {
        date: new Date(date),
        excercises: [],
        user: userId,
        ownerId,
      }
      try {
        console.log('try to add: ', getWorkoutId(), workout)
        await setDoc(doc(db, 'workouts', getWorkoutId()), workout)
        console.log('Document written with ID: ', getWorkoutId())
      } catch (e) {
        console.error('Error adding document: ', e)
      }
    }
  }
  const addNewWorkoutMachine: () => void = async () => {
    const ownerId = auth?.currentUser?.uid
    if (ownerId) {
      const workoutMachine: WorkoutMachineType = {
        name: 'test',
        number: 1,
        gym: gymId,
      }
      try {
        console.log('try to add: ', workoutMachine)
        const id = await addDoc(collections.workoutMachines, workoutMachine)
        console.log('Document written with ID: ', id)
      } catch (e) {
        console.error('Error adding document: ', e)
      }
    }
  }
  return (
    <div>
      <h1>Add workout</h1>

      <Formik
        initialValues={{ user: userId, gym: gymId, date }}
        onSubmit={(values, { setSubmitting }) => {
          setTimeout(() => {
            alert(JSON.stringify(values, null, 2))
            setSubmitting(false)
          }, 400)
        }}
      >
        {({ isSubmitting, setFieldValue, values }) => (
          <Form>
            <Field name={'date'}>
              {() => (
                <BForm.Control
                  type="date"
                  value={values.date}
                  onChange={(e) => {
                    setDate(e.target.value)
                    setFieldValue('date', e.target.value)
                  }}
                ></BForm.Control>
              )}
            </Field>
            <Field name={'gym'}>
              {() => (
                <BForm.Group>
                  <BForm.Label>Gym</BForm.Label>
                  <BForm.Select
                    value={values.gym}
                    onChange={(e) => {
                      setGymId(e.target.value)
                      setFieldValue('gym', e.target.value)
                    }}
                  >
                    {gyms?.docs?.map((dock) => (
                      <option value={dock.id} key={dock.id}>
                        {dock.data().name}
                      </option>
                    ))}
                  </BForm.Select>
                </BForm.Group>
              )}
            </Field>
            <Field name={'user'}>
              {() => (
                <BForm.Group>
                  <BForm.Select
                    value={values.user}
                    onChange={(e) => {
                      setUserId(e.target.value)
                      setFieldValue('user', e.target.value)
                    }}
                  >
                    {users?.docs?.map((userDock) => (
                      <option value={userDock.id} key={userDock.id}>
                        {userDock.data().name}
                      </option>
                    ))}
                  </BForm.Select>
                </BForm.Group>
              )}
            </Field>

            <button type="submit" disabled={isSubmitting}>
              Submit
            </button>
          </Form>
        )}
      </Formik>
      <Button onClick={() => addNewWorkout()}>add</Button>
      <Button onClick={addNewWorkoutMachine}>add machine</Button>
    </div>
  )
}
export default AddWorkout
