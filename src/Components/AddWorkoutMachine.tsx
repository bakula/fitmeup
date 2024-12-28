import { query, where, setDoc, orderBy, deleteDoc, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore'
import { useCollection, useDocument } from 'react-firebase-hooks/firestore'
import { COLLECTION_CONFIG, USE_COLLECTION, collections, docs } from './Firestore'
import {
  FloatingLabel,
  FormControl,
  Row,
  Col,
  Nav,
  Table,
  Button,
  FormGroup,
  FormLabel,
  Badge,
  FormCheck,
  Stack,
  Card,
  Container,
  ToastContainer,
  Toast,
  ButtonGroup,
} from 'react-bootstrap'
import { useSessionStorage } from 'usehooks-ts'
import { WORKOUT_GYM_ID, WORKOUT_MACHINE_ID } from '../App'
import { Field, Form, Formik, FieldProps, FieldArray, ArrayHelpers, useField } from 'formik'
import { useCallback, useEffect, useReducer, useState } from 'react'
import {
  AdjustmentElement,
  AdjustmentValue,
  DocumentWithData,
  MuscleGroupsAffectedMap,
  WorkoutMachineType,
} from '../types'
import { v4 as uuidv4 } from 'uuid'
import FormRange from 'react-bootstrap/esm/FormRange'
function EditWorkoutDetails({ id, cancel }: { id: string; cancel: () => void }) {
  const [doc] = useDocument(docs.workoutMachine(id))
  const saveDoc = useCallback(
    async (values: Partial<WorkoutMachineType>) => {
      try {
        await setDoc(docs.workoutMachine(id), values)
        cancel()
      } catch (e) {
        console.log(e)
      }
    },
    [cancel, id]
  )
  return (
    doc && (
      <WorkoutMachineDetailsForm initialData={doc.data()!} save={saveDoc} cancel={cancel}></WorkoutMachineDetailsForm>
    )
  )
}
function AddWorkoutDetails({ cancel, gymId }: { cancel: () => void; gymId: string }) {
  const saveDoc = useCallback(
    async (values: Partial<WorkoutMachineType>) => {
      try {
        const id = `${gymId}_${values.number}`
        await setDoc(docs.workoutMachine(id), { ...values, gym: gymId })
        cancel()
      } catch (e) {
        console.log(e)
      }
    },
    [cancel, gymId]
  )
  return <WorkoutMachineDetailsForm initialData={{}} save={saveDoc} cancel={cancel}></WorkoutMachineDetailsForm>
}

function ScaleConfig({ index }: { index: number }) {
  return (
    <Stack direction="horizontal" gap={3}>
      <FormGroup>
        <FormLabel>minimal</FormLabel>
        <Field name={`adjustments.${index}.scale.min`}>
          {({ field }: FieldProps) => <FormControl type="number" placeholder="min" {...field} />}
        </Field>
      </FormGroup>
      <FormGroup>
        <FormLabel>maximum</FormLabel>
        <Field name={`adjustments.${index}.scale.max`}>
          {({ field }: FieldProps) => <FormControl type="number" placeholder="maximum" {...field} />}
        </Field>
      </FormGroup>
      <FormGroup>
        <FormLabel>step</FormLabel>
        <Field name={`adjustments.${index}.scale.step`}>
          {({ field }: FieldProps) => <FormControl type="number" placeholder="step" {...field} />}
        </Field>
      </FormGroup>
    </Stack>
  )
}
function ValuesConfig({ adjIndex, values }: { adjIndex: number; values: AdjustmentValue[] }) {
  return (
    <FieldArray name={`adjustments.${adjIndex}.values`}>
      {(valuesHelpers: ArrayHelpers<AdjustmentValue[]>) => (
        <>
          {values.map((_value, valueIndex) => (
            <Stack direction={'horizontal'} gap={3}>
              <FormLabel>value</FormLabel>
              <Field name={`adjustments.${adjIndex}.values.${valueIndex}.kg`}>
                {({ field }: FieldProps) => <FormControl type="number" placeholder="kg" {...field} />}
              </Field>
              <Button size="sm" variant="danger" onClick={() => valuesHelpers.remove(valueIndex)}>
                Remove value
              </Button>
            </Stack>
          ))}
          <Button size="sm" onClick={() => valuesHelpers.push({ kg: 0 })}>
            Add value
          </Button>
        </>
      )}
    </FieldArray>
  )
}
function ElementsConfig({ adjIndex, elements }: { adjIndex: number; elements: AdjustmentElement[] }) {
  return (
    <FieldArray name={`adjustments.${adjIndex}.elements`}>
      {(valuesHelpers: ArrayHelpers<AdjustmentValue[]>) => (
        <>
          {elements.map((_element, elementIndex) => (
            <Stack direction={'horizontal'} gap={3}>
              <FormLabel>element name</FormLabel>
              <Field name={`adjustments.${adjIndex}.elements.${elementIndex}.name`}>
                {({ field }: FieldProps) => <FormControl type="text" placeholder="name" {...field} />}
              </Field>
              <Button size="sm" variant="danger" onClick={() => valuesHelpers.remove(elementIndex)}>
                Remove element
              </Button>
            </Stack>
          ))}
          <Button size="sm" onClick={() => valuesHelpers.push({ name: '' })}>
            Add element
          </Button>
        </>
      )}
    </FieldArray>
  )
}
function WorkoutAdjustments({ values }: { values: Partial<WorkoutMachineType> }) {
  return (
    <Card bg={'light'} className="m-3">
      <Card.Title>Machine adjustments</Card.Title>
      <Card.Body>
        <FieldArray name={'adjustments'}>
          {(helpers: ArrayHelpers) => (
            <FormGroup as={Col}>
              {values.adjustments && (
                <Table striped hover size="sm">
                  <thead>
                    <tr>
                      <th>name</th>
                      <th>config</th>
                    </tr>
                  </thead>
                  <tbody>
                    {values.adjustments.map((adj, adjIndex) => (
                      <tr>
                        <td>
                          <Stack gap={3}>
                            <Field name={`adjustments.${adjIndex}.name`}>
                              {({ field }: FieldProps) => <FormControl type="text" placeholder="" {...field} />}
                            </Field>
                            <FormGroup>
                              <Button variant="danger" size="sm" onClick={() => helpers.remove(adjIndex)}>
                                remove config
                              </Button>
                            </FormGroup>
                          </Stack>
                        </td>
                        <td>
                          {adj.scale && <ScaleConfig index={adjIndex} />}
                          {adj.values && <ValuesConfig adjIndex={adjIndex} values={adj.values} />}
                          {adj.elements && <ElementsConfig adjIndex={adjIndex} elements={adj.elements} />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
              <Stack direction="horizontal" gap={3}>
                <Button
                  size="sm"
                  onClick={() => helpers.push({ uuid: uuidv4(), name: '', scale: { min: 1, max: 10, step: 1 } })}
                >
                  Add scale adjustments
                </Button>
                <Button size="sm" onClick={() => helpers.push({ uuid: uuidv4(), name: '', values: [] })}>
                  Add values adjustments
                </Button>
                <Button size="sm" onClick={() => helpers.push({ uuid: uuidv4(), name: '', elements: [] })}>
                  Add elements adjustments
                </Button>
              </Stack>
            </FormGroup>
          )}
        </FieldArray>
      </Card.Body>
    </Card>
  )
}
type MusceGroupAffectedFieldState = {
  checked: boolean
  percentage: number
}
type MusceGroupAffectedFieldActions =
  | { type: 'checkChange'; payload: boolean }
  | { type: 'percentageChange'; payload: number }
export function MusceGroupAffectedField({
  group,
  muscleGroupsAffected,
}: {
  group: QueryDocumentSnapshot<DocumentData, DocumentData>
  muscleGroupsAffected?: MuscleGroupsAffectedMap
}) {
  function reducer(state: MusceGroupAffectedFieldState, action: MusceGroupAffectedFieldActions) {
    switch (action.type) {
      case 'checkChange':
        return action.payload
          ? { checked: true, percentage: state.percentage || 100 }
          : { checked: false, percentage: 0 }
      case 'percentageChange':
        return { checked: state.checked, percentage: action.payload }
      default:
        return state
    }
  }
  const initialState = {
    checked: Boolean((muscleGroupsAffected || {})[group.id]),
    percentage: (muscleGroupsAffected || {})[group.id]?.percentage || 0,
  }
  const [state, dispatch] = useReducer(reducer, initialState)
  const [, , helpers] = useField(`muscleGroupsAffected.${group.id}`)
  useEffect(() => {
    helpers.setValue(state.checked ? { percentage: state.percentage } : false)
  }, [state, helpers])
  return (
    <Card className={'h-100'}>
      <Card.Body>
        <Card.Header>
          <FormCheck
            type="switch"
            onChange={(e) => dispatch({ type: 'checkChange', payload: e.target.checked })}
            checked={state.checked}
            id={`muscleGroupsAffected.${group.id}.check`}
            label={group.data().name}
          />
        </Card.Header>
        {state.checked && (
          <Card.Title>
            <Stack>
              <Badge>{state.percentage}</Badge>
              <FormRange
                value={state.percentage}
                onChange={(e) => dispatch({ type: 'percentageChange', payload: parseFloat(e.target.value) })}
              ></FormRange>
              <ButtonGroup>
                {[10, 20, 50, 80, 100].map((value) => (
                  <Button
                    size="sm"
                    style={{ opacity: value * 0.01 }}
                    onClick={() => dispatch({ type: 'percentageChange', payload: value })}
                  >
                    {value}%
                  </Button>
                ))}
              </ButtonGroup>
            </Stack>
          </Card.Title>
        )}
      </Card.Body>
    </Card>
  )
}
function WorkoutMachineDetailsForm({
  initialData,
  save,
  cancel,
}: {
  initialData: Partial<WorkoutMachineType>
  save: (values: Partial<WorkoutMachineType>) => void
  cancel: () => void
}) {
  const [muscleGroups, muscleGroupsLoading, muscleGroupsError] = useCollection(
    query(collections.muscleGroups, orderBy('name', 'asc')),
    COLLECTION_CONFIG
  )
  console.log(muscleGroupsLoading, muscleGroupsError)

  return (
    <Formik<Partial<WorkoutMachineType>> initialValues={{ adjustments: [], ...initialData }} onSubmit={save}>
      {({ values }) => (
        <Form>
          <Row>
            <Col>
              <FloatingLabel label="Number">
                <Field name="number">
                  {({ field }: FieldProps) => <FormControl required type="number" placeholder="1" {...field} />}
                </Field>
              </FloatingLabel>
            </Col>
            <Col>
              <FloatingLabel label="Name" className="mb-3">
                <Field name="name">
                  {({ field }: FieldProps) => <FormControl type="text" placeholder="2" {...field} />}
                </Field>
              </FloatingLabel>
            </Col>
          </Row>
          <Row>
            <FormGroup as={Col}>
              <FormLabel>Description</FormLabel>
              <Field name="description">
                {({ field }: FieldProps) => <FormControl as="textarea" placeholder="Description" rows={3} {...field} />}
              </Field>
            </FormGroup>
          </Row>

          <Row>
            <Col lg={12}>Muscule groups</Col>
            {muscleGroups?.docs.map((group) => (
              <Col lg={4}>
                <MusceGroupAffectedField group={group} muscleGroupsAffected={values.muscleGroupsAffected} />
              </Col>
            ))}
          </Row>
          <Row>
            <Col>
              <WorkoutAdjustments values={values} />
            </Col>
          </Row>
          <Row>
            <Col>
              <Stack direction="horizontal" gap={3}>
                <Button type="submit" variant="primary">
                  Save
                </Button>
                <Button type="button" variant="warning" onClick={cancel}>
                  Cancel
                </Button>
              </Stack>
            </Col>
          </Row>
        </Form>
      )}
    </Formik>
  )
}
function AddWorkoutMachine() {
  const [gymId, setGymId] = useSessionStorage<string | null>(WORKOUT_GYM_ID, null)
  const [machineId, setMachineId] = useSessionStorage<string | null>(WORKOUT_MACHINE_ID, null)
  const [deletedMachines, setDeletedMachines] = useState<Record<string, WorkoutMachineType>>({})
  const [add, setAdd] = useState<boolean>(false)
  const gyms = useCollection(collections.gyms, COLLECTION_CONFIG)
  const workoutMachines = useCollection(
    query(collections.workoutMachines, orderBy('number', 'asc'), where('gym', '==', gymId)),
    COLLECTION_CONFIG
  )

  const deleteMachine = useCallback(
    async (machine: DocumentWithData<WorkoutMachineType>) => {
      try {
        await deleteDoc(docs.workoutMachine(machine.id))
        deletedMachines[machine.id] = machine.data()
        console.log('deleteMachine', machine.id, JSON.stringify(deletedMachines))
        setDeletedMachines({ ...deletedMachines })
      } catch (e) {
        console.log(e)
      }
    },
    [deletedMachines]
  )

  const revertDeleteMachine = useCallback(
    async (machine: DocumentWithData<WorkoutMachineType>) => {
      try {
        await setDoc(docs.workoutMachine(machine.id), { ...machine.data() })
        delete deletedMachines[machine.id]
        console.log('revertDeleteMachine', machine.id, JSON.stringify(deletedMachines))
        setDeletedMachines({ ...deletedMachines })
      } catch (e) {
        console.log(e)
      }
    },
    [deletedMachines]
  )
  const finalizeDeleteMachine = useCallback(
    (machineId: string) => {
      delete deletedMachines[machineId]
      console.log('finalizeDeleteMachine', machineId, JSON.stringify(deletedMachines))
      setDeletedMachines({ ...deletedMachines })
    },
    [deletedMachines]
  )
  console.log(gyms)
  console.log(gymId, workoutMachines)
  return (
    <>
      <ToastContainer position="bottom-center" containerPosition="absolute">
        {Object.entries(deletedMachines).map(([id, data]) => (
          <Toast autohide={true} delay={5000} animation={true} onClose={() => finalizeDeleteMachine(id)} key={id}>
            <Toast.Body>
              "#{data.number} {data.name}" has been deleted{' '}
              <Button variant="link" onClick={() => revertDeleteMachine({ id, data: () => data })}>
                cancel
              </Button>
            </Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
      <h1>Workout machines</h1>
      <h5>select gym:</h5>
      <Nav variant="tabs" defaultActiveKey={gymId || ''} onSelect={setGymId}>
        {gyms[USE_COLLECTION.DATA]?.docs.map((doc) => (
          <Nav.Item key={doc.id}>
            <Nav.Link eventKey={doc.id}>{doc.data().name}</Nav.Link>
          </Nav.Item>
        ))}
      </Nav>
      <Container>
        <Row>
          <Col>
            <Table size="sm" hover borderless={false} className={'align-middle'}>
              <thead>
                <tr>
                  <th align="center">#</th>
                  <th align="center">Name</th>
                  <th align="center">description</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {workoutMachines[USE_COLLECTION.DATA]?.docs.map((doc) =>
                  machineId === doc.id ? (
                    <tr>
                      <td colSpan={4}>
                        <EditWorkoutDetails id={machineId} cancel={() => setMachineId(null)} />
                      </td>
                    </tr>
                  ) : (
                    <tr key={doc.id} className={doc.id === machineId ? 'table-primary' : ''}>
                      <td align="center" onClick={() => setMachineId(doc.id)}>
                        <h3>
                          <Badge bg="info">#{doc.data().number}</Badge>
                        </h3>
                      </td>
                      <td onClick={() => setMachineId(doc.id)}>{doc.data().name}</td>
                      <td onClick={() => setMachineId(doc.id)}>{doc.data().description}</td>
                      <td>
                        <Stack direction="horizontal" gap={3}>
                          <Button variant="primary" size="sm" onClick={() => setMachineId(doc.id)}>
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => deleteMachine({ id: doc.id, data: doc.data as () => WorkoutMachineType })}
                          >
                            Delete
                          </Button>
                        </Stack>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </Table>
            {!machineId && gymId && add ? (
              <>
                <h1>Add new machine</h1>
                <AddWorkoutDetails cancel={() => setAdd(false)} gymId={gymId} />
              </>
            ) : (
              <FormGroup>
                <Button variant="success" onClick={() => setAdd(true)}>
                  Add new machine
                </Button>
              </FormGroup>
            )}
          </Col>
        </Row>
      </Container>
    </>
  )
}
export default AddWorkoutMachine
