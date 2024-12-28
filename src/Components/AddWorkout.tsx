import { useCallback, useState } from 'react'
import Button from 'react-bootstrap/Button'
import {
  CollectionWithData,
  DocumentWithData,
  PercentageMap,
  VolumeAndPrecentageMap,
  WorkoutExcercise,
  WorkoutMachineType,
  WorkoutSetType,
  WorkoutType,
} from '../types'
import { WORKOUT_USER_ID, WORKOUT_GYM_ID } from '../App'
import { query, where, setDoc, orderBy, getDocs } from 'firebase/firestore'
import { useCollection, useDocument } from 'react-firebase-hooks/firestore'
import { Formik, Form, Field, FieldProps, FieldArray, ArrayHelpers } from 'formik'
import { COLLECTION_CONFIG, auth, collections, docs, queryCurrentUser } from './Firestore'
import {
  Badge,
  Card,
  Col,
  FormCheck,
  FormControl,
  FormGroup,
  FormLabel,
  FormSelect,
  OverlayTrigger,
  Row,
  Stack,
  Tooltip,
} from 'react-bootstrap'
import { useSessionStorage } from 'usehooks-ts'
import cloneDeep from 'lodash/cloneDeep'
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
  const [user, , userError] = useDocument(docs.user(userId))
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
  }, [selectedKilos])
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
function prepareVolumeTemplate(muscleGroups?: PercentageMap) {
  const initial = muscleGroups || { overal: { percentage: 100 } }
  const keys = Object.keys(initial)
  return keys.reduce((prev: VolumeAndPrecentageMap, curr: string) => {
    prev[curr] = { ...initial[curr], volume: 0 }
    return prev
  }, {})
}

function calculateExcerciseVolume(excercise: WorkoutExcercise) {
  const template = prepareVolumeTemplate(excercise.muscleGroups)
  return excercise.sets.reduce((prev: VolumeAndPrecentageMap, cur) => {
    return calculateSetVolume(cur, prev)
  }, template)
}

function calculateSetVolume(set: WorkoutSetType, extended: VolumeAndPrecentageMap) {
  const newValue = cloneDeep(extended)
  Object.keys(extended).forEach((key) => {
    newValue[key].volume = newValue[key].volume + set.kilograms * set.reps * newValue[key].percentage * 0.01
  })
  return newValue
}

function AddWorkout() {
  const [showAdd, setShowAdd] = useState(false)
  const [userId, setUserId] = useSessionStorage(WORKOUT_USER_ID, '')
  const [gymId, setGymId] = useSessionStorage(WORKOUT_GYM_ID, '')

  const [date] = useState<string>(new Date().toJSON().slice(0, 10))
  const getWorkoutId = () => `${gymId}_${userId}_${date}`
  const [workout, workoutLoading, workoutError] = useDocument(docs.workout(getWorkoutId()))

  const [workouts, workoutsLoading, workoutsError] = useCollection(
    queryCurrentUser(collections.workouts, where('gym', '==', gymId), orderBy('date', 'desc')),
    COLLECTION_CONFIG
  )
  console.log('workoiuts config', gymId, userId)

  console.log('workout', workout, workoutLoading, workoutError)
  console.log('workouts', workouts?.docs, workoutsLoading, workoutsError)

/*  const addNewWorkout: () => void = async () => {
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
        await setDoc(doc(firestoreDb, 'workouts', getWorkoutId()), workout)
        console.log('Document written with ID: ', getWorkoutId())
      } catch (e) {
        console.error('Error adding document: ', e)
      }
    }
  }
    */
  const [selectedWorout, setSelectedWorkout] = useState<DocumentWithData<WorkoutType>>()

  return (
    <div>
      <h1>Add workout</h1>
      <table>
        <thead>
          <tr>
            <th>date</th>
            <th>data</th>
            <th> </th>
          </tr>
        </thead>
        {workouts && (
          <tbody>
            {workouts.docs.map((workoutDoc) => (
              <tr>
                <td>{workoutDoc.data().date}</td>
                <td>
                  {workoutDoc.data().excercises.length}
                  {workoutDoc.data().excercises.map((ex: WorkoutExcercise) => (
                    <span>
                      {Object.entries(calculateExcerciseVolume(ex)).map(([key, value]) => (
                        <OverlayTrigger
                          overlay={
                            <Tooltip>
                              {ex.machine}
                              {key}
                            </Tooltip>
                          }
                        >
                          <Badge>{value.volume}</Badge>
                        </OverlayTrigger>
                      ))}
                    </span>
                  ))}
                </td>
                <td>
                  <Button
                    size="sm"
                    onClick={() => setSelectedWorkout(workoutDoc as unknown as DocumentWithData<WorkoutType>)}
                  >
                    edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        )}
      </table>

      <Button onClick={() => setShowAdd(true)}>add workout</Button>
      {showAdd && (
        <WorkoutForm
          setGymId={setGymId}
          gymId={gymId}
          setUserId={setUserId}
          initialValues={{ user: userId, gym: gymId, date, excercises: [], ownerId: auth?.currentUser?.uid }}
        />
      )}
      {selectedWorout && (
        <WorkoutForm setGymId={setGymId} gymId={gymId} setUserId={setUserId} initialValues={selectedWorout.data()} />
      )}
    </div>
  )
}
type ExcerciseCardProp = {
  excercise: WorkoutExcercise
  excerciseIndex: number
  values: WorkoutType
  workoutMachines: CollectionWithData<WorkoutMachineType>
  excercisesHelpers: ArrayHelpers<WorkoutExcercise[]>
}
function ExcerciseCard({ excercise, excerciseIndex, values, workoutMachines, excercisesHelpers }: ExcerciseCardProp) {
  const [formView] = useState(false)
  return formView ? (
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
                      workoutMachines?.docs?.find((doc) => doc.id === field.value)?.data() as WorkoutMachineType
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
          <Button variant="danger" size="sm" onClick={() => excercisesHelpers.remove(excerciseIndex)}>
            remove
          </Button>
        </Card.Footer>
      </Card>
    </Col>
  ) : (
    <Col xl={4} sm={6}>
      <Card>
        <Card.Body>
          <Field name={`excercises.${excerciseIndex}.machine`}>
            {({ field }: FieldProps) => {
              const machine = workoutMachines?.docs?.find((doc) => doc.id === field.value)?.data()
              return (
                <>
                  <Card.Title>
                    <Badge>#{machine?.number}</Badge>
                    <small>{machine?.name}</small>
                  </Card.Title>
                </>
              )
            }}
          </Field>
          <Field name={`excercises.${excerciseIndex}`}>
            {({ meta }: FieldProps<WorkoutExcercise>) => {
              const template = prepareVolumeTemplate(meta.value.muscleGroups)
              return (
                <>
                  {meta.value.sets.map((set) => (
                    <SetValueView kg={set.kilograms} reps={set.reps} volume={calculateSetVolume(set, template)} />
                  ))}
                </>
              )
            }}
          </Field>
        </Card.Body>
      </Card>
    </Col>
  )
}

function SetValueView({ kg, reps, volume }: { kg: number; reps: number; volume: VolumeAndPrecentageMap }) {
  return (
    <div
      className="
      badge
      shadow-sm
      border border-3 border-primary-subtle
      position-relative
      text-bg-primary
      pb-5
    "
    >
      {' '}
      <span className="fs-1 fw-bold">
        {kg} <sup className="fs-6">kg</sup>
      </span>
      <span className="badge rounded-pill position-absolute bottom-0 end-0 mb-4 fs-4">X {reps}</span>
      {Object.entries(volume).map(([key, value]) => (
        <OverlayTrigger placement="top" overlay={<Tooltip>{key}</Tooltip>}>
          <Badge className="position-absolute bottom-0 start-0 fs-6" bg="secondary">
            {value.volume}
          </Badge>
        </OverlayTrigger>
      ))}
    </div>
  )
}

export type WorkoutFormProps = {
  initialValues: WorkoutType
  gymId: string
  setGymId: (id: string) => void
  setUserId: (id: string) => void
}

function WorkoutForm({ initialValues, gymId, setGymId, setUserId }: WorkoutFormProps) {
  const [users] = useCollection(queryCurrentUser(collections.users), COLLECTION_CONFIG)
  const [gyms] = useCollection(collections.gyms)
  const [muscleGroups] = useCollection(query(collections.muscleGroups, orderBy('name', 'asc')), COLLECTION_CONFIG)
  const [workoutMachines] = useCollection(
    query(collections.workoutMachines, orderBy('number', 'asc'), where('gym', '==', gymId)),
    COLLECTION_CONFIG
  )
  return (
    <Formik<WorkoutType>
      initialValues={initialValues}
      enableReinitialize={true}
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
                  <Card.Header>
                    Excercises:
                    <Stack direction={'horizontal'} gap={3}>
                      {muscleGroups?.docs.map((group) => <FormCheck type="switch" label={group.data().name} />)}
                    </Stack>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      {values.excercises.map((excercise, excerciseIndex) => (
                        <ExcerciseCard
                          excercise={excercise}
                          excerciseIndex={excerciseIndex}
                          excercisesHelpers={excercisesHelpers}
                          values={values}
                          workoutMachines={workoutMachines as unknown as CollectionWithData<WorkoutMachineType>}
                        />
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
  )
}
export default AddWorkout
