import { query, setDoc, addDoc, orderBy, deleteDoc } from 'firebase/firestore'
import { useCollection, useDocument } from 'react-firebase-hooks/firestore'
import { COLLECTION_CONFIG, collections, docs } from './Firestore'
import {
  FloatingLabel,
  FormControl,
  Row,
  Col,
  Table,
  Button,
  FormGroup,
  FormLabel,
  Badge,
  Stack,
  Container,
  ToastContainer,
  Toast,
  FormCheck,
  InputGroup,
} from 'react-bootstrap'

import { Field, Form, Formik, FieldProps } from 'formik'
import { useCallback, useState } from 'react'
import { DocumentWithData, Excercise } from '../types'

import { MusceGroupAffectedField } from './AddWorkoutMachine'
function EditExcerciseDetails({ id, cancel }: { id: string; cancel: () => void }) {
  const [doc] = useDocument(docs.exercise(id))
  const saveDoc = useCallback(
    async (values: Partial<Excercise>) => {
      try {
        await setDoc(docs.exercise(id), values)
        cancel()
      } catch (e) {
        console.log(e)
      }
    },
    [cancel, id]
  )
  return doc && <ExcerciseDetailsForm initialData={doc.data()!} save={saveDoc} cancel={cancel}></ExcerciseDetailsForm>
}
function AddExcerciseDetails({ cancel }: { cancel: () => void }) {
  const saveDoc = useCallback(
    async (values: Partial<Excercise>) => {
      try {
        await addDoc(collections.exercises, { ...values })
        cancel()
      } catch (e) {
        console.log(e)
      }
    },
    [cancel]
  )
  return <ExcerciseDetailsForm initialData={{}} save={saveDoc} cancel={cancel}></ExcerciseDetailsForm>
}

function ExcerciseDetailsForm({
  initialData,
  save,
  cancel,
}: {
  initialData: Partial<Excercise>
  save: (values: Partial<Excercise>) => void
  cancel: () => void
}) {
  const [muscleGroups, ,] = useCollection(query(collections.muscleGroups, orderBy('name', 'asc')), COLLECTION_CONFIG)

  const [workoutMachines, , workoutMachinesError] = useCollection(
    query(collections.workoutMachines, orderBy('gym', 'asc'), orderBy('number', 'asc')),
    COLLECTION_CONFIG
  )
  console.log(workoutMachinesError)
  return (
    <Formik<Partial<Excercise>> initialValues={{ ...initialData }} onSubmit={save}>
      {({ values }) => (
        <Form>
          <Row>
            <Col>
              <FloatingLabel label="Name" className="mb-3">
                <Field name="name">
                  {({ field, form }: FieldProps) => (
                    <InputGroup>
                      <FormControl type="text" {...field} />
                      <Button
                        variant="primary"
                        onClick={() => form.setFieldValue('name', field.value.toLocaleLowerCase())}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-textarea-t"
                          viewBox="0 0 16 16"
                        >
                          <path d="M1.5 2.5A1.5 1.5 0 0 1 3 1h10a1.5 1.5 0 0 1 1.5 1.5v3.563a2 2 0 0 1 0 3.874V13.5A1.5 1.5 0 0 1 13 15H3a1.5 1.5 0 0 1-1.5-1.5V9.937a2 2 0 0 1 0-3.874V2.5zm1 3.563a2 2 0 0 1 0 3.874V13.5a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5V9.937a2 2 0 0 1 0-3.874V2.5A.5.5 0 0 0 13 2H3a.5.5 0 0 0-.5.5v3.563zM2 7a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm12 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
                          <path d="M11.434 4H4.566L4.5 5.994h.386c.21-1.252.612-1.446 2.173-1.495l.343-.011v6.343c0 .537-.116.665-1.049.748V12h3.294v-.421c-.938-.083-1.054-.21-1.054-.748V4.488l.348.01c1.56.05 1.963.244 2.173 1.496h.386L11.434 4z" />
                        </svg>
                      </Button>
                    </InputGroup>
                  )}
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
            <Col lg={12}>Machines</Col>
            {workoutMachines?.docs.map((machine) => (
              <Col lg={4}>
                {' '}
                <FormGroup>
                  <FormLabel>
                    <Badge bg={'info'}>#{machine.data().number}</Badge>
                    <small>{machine.data().name}</small>

                    <Field name={`machineIds`} type="checkbox" value={machine.id}>
                      {({ field }: FieldProps) => <FormCheck type="switch" {...field}></FormCheck>}
                    </Field>
                  </FormLabel>
                </FormGroup>
              </Col>
            ))}
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
function AddExcercise() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [deletedExcercises, setDeletedExcercises] = useState<Record<string, Excercise>>({})
  const [add, setAdd] = useState<boolean>(false)
  const [excercises, , excercisesError] = useCollection(
    query(collections.exercises, orderBy('name', 'asc')),
    COLLECTION_CONFIG
  )
  console.log(excercises, excercisesError)
  const deleteExcercise = useCallback(
    async (exercise: DocumentWithData<Excercise>) => {
      try {
        await deleteDoc(docs.exercise(exercise.id))
        deletedExcercises[exercise.id] = exercise.data()
        console.log('deleteExcercise', exercise.id, JSON.stringify(deletedExcercises))
        setDeletedExcercises({ ...deletedExcercises })
      } catch (e) {
        console.log(e)
      }
    },
    [deletedExcercises]
  )

  const revertDeleteExcercise = useCallback(
    async (exercise: DocumentWithData<Excercise>) => {
      try {
        await setDoc(docs.exercise(exercise.id), { ...exercise.data() })
        delete deletedExcercises[exercise.id]
        console.log('revertDeleteExcercise', exercise.id, JSON.stringify(deletedExcercises))
        setDeletedExcercises({ ...deletedExcercises })
      } catch (e) {
        console.log(e)
      }
    },
    [deletedExcercises]
  )
  const finalizeDeleteExcercise = useCallback(
    (id: string) => {
      delete deletedExcercises[id]
      console.log('finalizeDeleteExcercise', id, JSON.stringify(deletedExcercises))
      setDeletedExcercises({ ...deletedExcercises })
    },
    [deletedExcercises]
  )

  return (
    <>
      <ToastContainer position="bottom-center" containerPosition="absolute">
        {Object.entries(deleteExcercise).map(([id, data]) => (
          <Toast autohide={true} delay={5000} animation={true} onClose={() => finalizeDeleteExcercise(id)} key={id}>
            <Toast.Body>
              "#{data.number} {data.name}" has been deleted{' '}
              <Button variant="link" onClick={() => revertDeleteExcercise({ id, data: () => data })}>
                cancel
              </Button>
            </Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
      <h1>Excercises</h1>
      <Container>
        <Row>
          <Col>
            {excercises && (
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
                  {excercises.docs.map((doc) =>
                    selectedId === doc.id ? (
                      <tr>
                        <td colSpan={4}>
                          <EditExcerciseDetails id={doc.id} cancel={() => setSelectedId(null)} />
                        </td>
                      </tr>
                    ) : (
                      <tr key={doc.id} className={doc.id === selectedId ? 'table-primary' : ''}>
                        <td align="center" onClick={() => setSelectedId(doc.id)}>
                          <h3>
                            <Badge bg="info">#{doc.data().number}</Badge>
                          </h3>
                        </td>
                        <td onClick={() => setSelectedId(doc.id)}>{doc.data().name}</td>
                        <td onClick={() => setSelectedId(doc.id)}>{doc.data().description}</td>
                        <td>
                          <Stack direction="horizontal" gap={3}>
                            <Button variant="primary" size="sm" onClick={() => setSelectedId(doc.id)}>
                              Edit
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => deleteExcercise({ id: doc.id, data: doc.data as () => Excercise })}
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
            )}

            {!selectedId && add ? (
              <>
                <h1>Add new excercise</h1>
                <AddExcerciseDetails cancel={() => setAdd(false)} />
              </>
            ) : (
              <FormGroup>
                <Button variant="success" onClick={() => setAdd(true)}>
                  Add new excercise
                </Button>
              </FormGroup>
            )}
          </Col>
        </Row>
      </Container>
    </>
  )
}
export default AddExcercise
