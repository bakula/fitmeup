import { query, where, setDoc, doc, addDoc, orderBy, deleteDoc } from 'firebase/firestore'
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
} from 'react-bootstrap'
import { useSessionStorage } from 'usehooks-ts'
import { WORKOUT_GYM_ID, WORKOUT_MACHINE_ID } from '../App'
import { Field, Form, Formik, FormikHelpers, FieldProps, FieldArray, ArrayHelpers } from 'formik'
import { useCallback, useState } from 'react'
import { AdjustmentValue, DocumentWithData, MachineAdjustmentType, WorkoutMachineType } from '../types'
function EditWorkoutDetails({ id, cancel }: { id: string; cancel: () => void }) {
  const [doc, loading, error] = useDocument(docs.workoutMachine(id))
  const saveDoc = useCallback(async (values: any) => {
    try {
      await setDoc(docs.workoutMachine(id), values)
      cancel()
    } catch (e) {}
  }, [])
  return (
    doc && (
      <WorkoutMachineDetailsForm initialData={doc?.data()!} save={saveDoc} cancel={cancel}></WorkoutMachineDetailsForm>
    )
  )
}
function AddWorkoutDetails({ cancel, gymId }: { cancel: () => void; gymId: string }) {
  const saveDoc = useCallback(async (values: any) => {
    try {
      const id = `${gymId}_${values.number}`
      await setDoc(docs.workoutMachine(id), { ...values, gym: gymId })
      cancel()
    } catch (e) {}
  }, [])
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
          {values.map((value, valueIndex) => (
            <Stack direction={'horizontal'} gap={3}>
              <FormLabel>value</FormLabel>
              <Field name={`adjustments.${adjIndex}.values.${valueIndex}.value`}>
                {({ field }: FieldProps) => <FormControl type="number" placeholder="value" {...field} />}
              </Field>
              <Field name={`adjustments.${adjIndex}.values.${valueIndex}.unit`} value={'kilogram'} type={'radio'}>
                {({ field }: FieldProps) => (
                  <>
                    <FormLabel>kg</FormLabel>
                    <FormCheck type="radio" placeholder="value" {...field} inline />
                  </>
                )}
              </Field>
              <Field name={`adjustments.${adjIndex}.values.${valueIndex}.unit`} value={'lb'} type={'radio'}>
                {({ field }: FieldProps) => (
                  <FormLabel>
                    lb
                    <FormCheck type="radio" placeholder="value" {...field} inline />
                  </FormLabel>
                )}
              </Field>
              <Button size="sm" variant="danger" onClick={() => valuesHelpers.remove(valueIndex)}>
                Remove value
              </Button>
            </Stack>
          ))}
          <Button size="sm" onClick={() => valuesHelpers.push({ value: 0, unit: 'kilogram' })}>
            Add value
          </Button>
        </>
      )}
    </FieldArray>
  )
}
function WorkoutAdjustments({ values }: { values: WorkoutMachineType }) {
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
              <Stack direction="horizontal" gap={3}>
                <Button size="sm" onClick={() => helpers.push({ name: '', scale: { min: 1, max: 10, step: 1 } })}>
                  Add scale adjustments
                </Button>
                <Button size="sm" onClick={() => helpers.push({ name: '', values: [] })}>
                  Add values adjustments
                </Button>
              </Stack>
            </FormGroup>
          )}
        </FieldArray>
      </Card.Body>
    </Card>
  )
}
function WorkoutMachineDetailsForm({
  initialData,
  save,
  cancel,
}: {
  initialData: any
  save: (values: any) => void
  cancel: () => void
}) {
  return (
    <Formik<WorkoutMachineType> initialValues={{ adjustments: [], ...initialData }} onSubmit={save}>
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

  const deleteMachine = useCallback(async (machine: DocumentWithData<WorkoutMachineType>) => {
    try {
      await deleteDoc(docs.workoutMachine(machine.id))
      deletedMachines[machine.id] = machine.data
      console.log('deleteMachine', machine.id, JSON.stringify(deletedMachines))
      setDeletedMachines({ ...deletedMachines })
    } catch (e) {}
  }, [])

  const revertDeleteMachine = useCallback(async (machine: DocumentWithData<WorkoutMachineType>) => {
    try {
      await setDoc(docs.workoutMachine(machine.id), { ...machine.data })
      delete deletedMachines[machine.id]
      console.log('revertDeleteMachine', machine.id, JSON.stringify(deletedMachines))
      setDeletedMachines({ ...deletedMachines })
    } catch (e) {}
  }, [])
  const finalizeDeleteMachine = useCallback((machine: DocumentWithData<WorkoutMachineType>) => {
    delete deletedMachines[machine.id]
    console.log('finalizeDeleteMachine', machine.id, JSON.stringify(deletedMachines))
    setDeletedMachines({ ...deletedMachines })
  }, [])
  console.log(gyms)
  console.log(gymId, workoutMachines)
  return (
    <>
      <ToastContainer position="bottom-center" containerPosition="absolute">
        {Object.entries(deletedMachines).map(([id, data]) => (
          <Toast
            autohide={true}
            delay={5000}
            animation={true}
            onClose={() => finalizeDeleteMachine({ id, data })}
            key={id}
          >
            <Toast.Body>
              "#{data.number} {data.name}" has been deleted{' '}
              <Button variant="link" onClick={() => revertDeleteMachine({ id, data })}>
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
                            onClick={() => deleteMachine({ id: doc.id, data: doc.data() as WorkoutMachineType })}
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
            {!machineId && add ? (
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
