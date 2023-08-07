import { useCallback, useState } from 'react'
import Button from 'react-bootstrap/Button'
import { WorkoutExcercise, WorkoutMachineType, WorkoutSetType, WorkoutType } from '../types'
import { WORKOUT_USER_ID, WORKOUT_GYM_ID } from '../App'
import { addDoc, doc, query, where, setDoc, orderBy, getDocs } from 'firebase/firestore'
import { useCollection, useDocument } from 'react-firebase-hooks/firestore'
import { Formik, Form, Field, FieldProps, FieldArray, ArrayHelpers } from 'formik'
import { COLLECTION_CONFIG, auth, collections, docs, firesoreDb, queryCurrentUser } from './Firestore'
import { Card, Col, FormCheck, FormControl, FormGroup, FormLabel, FormSelect, Row, Stack } from 'react-bootstrap'
const range = (start: number, stop: number, step: number) =>
  Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + i * step)
function SetupWorkoutMachine({
  workoutMachine,
  excercise,
  prefix,
  userId,
}: {
  workoutMachine: WorkoutMachineType
  excercise: WorkoutExcercise
  prefix: string
  userId: string
}) {
  const [user, userLoading, userError] = useDocument(docs.user(userId))
  console.log(user, userError)
  const setSelectedAdjustment = useCallback(
    async (uiid: string, value: number | string) => {
      console.log('setSelectedAdjustment data', uiid, value)
      if (user && uiid) {
        const adjustments: Record<string, { value: number | string }> = { ...user?.data()?.adjustments }
        adjustments[uiid] = { value }
        const newData = { ...user.data(), adjustments }
        console.log('new data', newData)
        await setDoc(docs.user(user.id), newData)
      }
    },
    [user]
  )

  const [selectedKilos, setSelectedKilos] = useState<number | null>(null)
  const [selectedReps, setSelectedReps] = useState<number | null>(null)
  const adjustments = user?.data()?.adjustments || {}
  const predictWeight = useCallback(() => {
    const fromPreviousSet = 1
    return selectedKilos ? selectedKilos : fromPreviousSet
  }, [])
  return (
    <>
      {user &&
        workoutMachine &&
        workoutMachine.adjustments?.map((adjustment) => (
          <div>
            {adjustment.name}
            {adjustment.values &&
              adjustment.values.map((value, valueIndex) => (
                <Button
                  key={`${adjustment.uuid}_${valueIndex}`}
                  data-bs-toggle="button"
                  className={adjustments[adjustment.uuid]?.value === value.kg ? 'active' : ''}
                  variant={'light'}
                  onClick={() => {
                    //user.data()?.adjustments [adjustment.uuid] = { value: value.kg }
                    console.log(user.data()?.adjustments)
                    setSelectedAdjustment(adjustment.uuid, value.kg)
                    setSelectedKilos(value.kg)
                  }}
                >
                  {value.kg}
                </Button>
              ))}
            {adjustment.scale &&
              range(adjustment.scale.min, adjustment.scale.max, adjustment.scale.step).map((value, valueIndex) => (
                <Button
                  key={`${adjustment.uuid}_${valueIndex}`}
                  data-bs-toggle="button"
                  className={adjustments[adjustment.uuid]?.value === value ? 'active' : ''}
                  variant={'light'}
                  onClick={() => {
                    setSelectedAdjustment(adjustment.uuid, value)
                  }}
                >
                  {value}
                </Button>
              ))}
          </div>
        ))}
      <FieldArray name={`${prefix}.sets`}>
        {(setsHelpers: ArrayHelpers<WorkoutSetType[]>) => (
          <>
            {excercise.sets.map((set, setIndex) => (
              <Stack gap={3} direction="horizontal">
                <h5>{set.index}</h5>
                <FormGroup>
                  <FormLabel>Kilograms</FormLabel>
                  <Field name={`${prefix}.sets.${setIndex}.kilograms`}>
                    {({ field }: FieldProps) => <FormControl type="number" {...field}></FormControl>}
                  </Field>
                </FormGroup>
                <FormGroup>
                  <FormLabel>reps</FormLabel>
                  <Field name={`${prefix}.sets.${setIndex}.reps`}>
                    {({ field }: FieldProps) => (
                      <FormControl
                        type="number"
                        min={1}
                        {...field}
                        onChange={(e) => {
                          field.onChange(e)
                          setSelectedReps(parseInt(e.target.value))
                        }}
                      ></FormControl>
                    )}
                  </Field>
                </FormGroup>
                <FormGroup>
                  <FormLabel>full</FormLabel>
                  <Field name={`${prefix}.sets.${setIndex}.full`}>
                    {({ field }: FieldProps) => <FormCheck type="switch" {...field}></FormCheck>}
                  </Field>
                </FormGroup>
                <Button variant="danger" size="sm" onClick={() => setsHelpers.remove(setIndex)}>
                  Remove set
                </Button>
              </Stack>
            ))}
            <Button
              size={'sm'}
              onClick={() =>
                setsHelpers.push({
                  adjustments: user?.data()?.adjustments,
                  index: excercise.sets.length + 1,
                  kilograms: predictWeight(),
                  reps: selectedReps,
                })
              }
            >
              Add set
            </Button>
          </>
        )}
      </FieldArray>
    </>
  )
}
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
    query(collections.workoutMachines, orderBy('number', 'asc'), where('gym', '==', gymId)),
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
        date: date,
        excercises: [],
        user: userId,
        ownerId,
        gym: gymId,
      }
      try {
        console.log('try to add: ', getWorkoutId(), workout)
        await setDoc(doc(firesoreDb, 'workouts', getWorkoutId()), workout)
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

      <Formik<WorkoutType>
        initialValues={{ user: userId, gym: gymId, date, excercises: [], ownerId: auth?.currentUser?.uid }}
        onSubmit={async (values, { setSubmitting, resetForm }) => {
          try {
            const existing = await getDocs(
              queryCurrentUser(
                collections.workouts,
                where('date', '==', values.date),
                where('gym', '==', values.gym),
                where('user', '==', values.user)
              )
            )

            const id = `${values.date}_${values.gym}_${values.user}_${existing.size + 1}`
            await setDoc(docs.workout(id), values)
            resetForm()
          } catch (e) {
            console.log(e)
          }
          setSubmitting(false)
        }}
      >
        {({ isSubmitting, values }) => (
          <Form>
            <Field name={`date`}>
              {({ field }: FieldProps) => <FormControl type="date" placeholder="" {...field} />}
            </Field>

            <Field name={'gym'}>
              {({ field }: FieldProps) => (
                <FormGroup>
                  <FormLabel>Gym</FormLabel>
                  <FormSelect
                    {...field}
                    onChange={(e) => {
                      setGymId(e.target.value)
                      field.onChange(e)
                    }}
                  >
                    {gyms?.docs?.map((dock) => (
                      <option value={dock.id} key={dock.id}>
                        {dock.data().name}
                      </option>
                    ))}
                  </FormSelect>
                </FormGroup>
              )}
            </Field>
            <Field name={'user'}>
              {({ field }: FieldProps) => (
                <FormGroup>
                  <FormSelect
                    {...field}
                    onChange={(e) => {
                      setUserId(e.target.value)
                      field.onChange(e)
                    }}
                  >
                    {users?.docs?.map((userDock) => (
                      <option value={userDock.id} key={userDock.id}>
                        {userDock.data().name}
                      </option>
                    ))}
                  </FormSelect>
                </FormGroup>
              )}
            </Field>
            <FieldArray name={'excercises'}>
              {(excercisesHelpers: ArrayHelpers<WorkoutExcercise[]>) => (
                <>
                  <Card>
                    <Card.Header>Excercises:</Card.Header>
                    <Card.Body>
                      <Row>
                        {values.excercises.map((excercise, excerciseIndex) => (
                          <Col xl={4} sm={6}>
                            <Card>
                              <Card.Body>
                                <FormGroup>
                                  <Field name={`excercises.${excerciseIndex}.machine`}>
                                    {({ field }: FieldProps) => (
                                      <FormGroup>
                                        <FormSelect {...field}>
                                          {workoutMachines?.docs?.map((machine) => (
                                            <option value={machine.id} key={machine.id}>
                                              #{machine.data().number} {machine.data().name}
                                            </option>
                                          ))}
                                        </FormSelect>
                                        <SetupWorkoutMachine
                                          workoutMachine={
                                            workoutMachines?.docs
                                              .find((doc) => doc.id === field.value)
                                              ?.data() as WorkoutMachineType
                                          }
                                          excercise={excercise}
                                          prefix={`excercises.${excerciseIndex}`}
                                          userId={values.user}
                                        />
                                      </FormGroup>
                                    )}
                                  </Field>
                                </FormGroup>
                              </Card.Body>
                              <Card.Footer>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => excercisesHelpers.remove(excerciseIndex)}
                                >
                                  remove
                                </Button>
                              </Card.Footer>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    </Card.Body>
                    <Card.Footer>
                      <Button
                        onClick={() => {
                          excercisesHelpers.push({ machine: '', sets: [], index: values.excercises.length + 1 })
                        }}
                      >
                        Add excercise
                      </Button>
                    </Card.Footer>
                  </Card>
                </>
              )}
            </FieldArray>

            <button type="submit" disabled={isSubmitting}>
              Save workout
            </button>
          </Form>
        )}
      </Formik>
      <Button onClick={() => addNewWorkout()}>add workout</Button>
    </div>
  )
}
export default AddWorkout
