import { query, where, setDoc, doc, addDoc, orderBy } from 'firebase/firestore'
import { useCollection, useDocument } from 'react-firebase-hooks/firestore'
import { COLLECTION_CONFIG, USE_COLLECTION, collections, docs } from './Firestore'
import { FloatingLabel, FormControl, Row, Col, Nav, Table, Button, FormGroup, FormLabel, Badge } from 'react-bootstrap'
import { useSessionStorage } from 'usehooks-ts'
import { WORKOUT_GYM_ID, WORKOUT_MACHINE_ID } from '../App'
import { Field, Form, Formik, FormikHelpers, FieldProps } from 'formik'
import { useCallback, useState } from 'react'
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
    <Formik initialValues={initialData} onSubmit={save}>
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
          <FormGroup as={Col}>
            <FormLabel>Description</FormLabel>
            <Field name="description">
              {({ field }: FieldProps) => <FormControl as="textarea" placeholder="Description" rows={3} {...field} />}
            </Field>
          </FormGroup>
        </Row>
        <Button type="submit" variant="primary">
          Save
        </Button>
        <Button type="button" variant="warning" onClick={cancel}>
          Cancel
        </Button>
      </Form>
    </Formik>
  )
}
function AddWorkoutMachine() {
  const [gymId, setGymId] = useSessionStorage<string | null>(WORKOUT_GYM_ID, null)
  const [machineId, setMachineId] = useSessionStorage<string | null>(WORKOUT_MACHINE_ID, null)
  const [add, setAdd] = useState<boolean>(false)
  const gyms = useCollection(collections.gyms, COLLECTION_CONFIG)
  const workoutMachines = useCollection(
    query(collections.workoutMachines, orderBy('number', 'asc'), where('gym', '==', gymId)),
    COLLECTION_CONFIG
  )

  console.log(gyms)
  console.log(gymId, workoutMachines)
  return (
    <>
      <h1>Workout machines</h1>
      <h5>select gym:</h5>
      <Nav variant="tabs" defaultActiveKey={gymId || ''} onSelect={setGymId}>
        {gyms[USE_COLLECTION.DATA]?.docs.map((doc) => (
          <Nav.Item key={doc.id}>
            <Nav.Link eventKey={doc.id}>{doc.data().name}</Nav.Link>
          </Nav.Item>
        ))}
      </Nav>
      <Row>
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
                <tr
                  key={doc.id}
                  className={doc.id === machineId ? 'table-primary' : ''}
                  onClick={() => setMachineId(doc.id)}
                >
                  <td align="center">
                    <h3>
                      <Badge bg="info">#{doc.data().number}</Badge>
                    </h3>
                  </td>
                  <td>{doc.data().name}</td>
                  <td>{doc.data().description}</td>
                  <td>
                    <Button variant="primary" size="sm" onClick={() => setMachineId(doc.id)}>
                      Edit
                    </Button>
                    <Button variant="danger" size="sm">
                      Delete
                    </Button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </Table>
      </Row>
      {machineId ? (
        <></>
      ) : add ? (
        <AddWorkoutDetails cancel={() => setAdd(false)} gymId={gymId} />
      ) : (
        <FormGroup>
          <Button variant="success" onClick={() => setAdd(true)}>
            Add
          </Button>
        </FormGroup>
      )}
    </>
  )
}
export default AddWorkoutMachine
