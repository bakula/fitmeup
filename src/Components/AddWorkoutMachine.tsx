import { useState } from "react";
import {
  addDoc,
  collection,
  doc,
  query,
  where,
  setDoc,
} from "firebase/firestore";
import { useCollection, useDocument } from "react-firebase-hooks/firestore";
import {
  COLLECTION_CONFIG,
  USE_COLLECTION,
  collections,
  firesoreDb,
} from "./Firestore";
import {
  FloatingLabel,
  FormCheck,
  FormControl,
  FormSelect,
  InputGroup,
  FormLabel,
  Form,
  Row,
  Col,
  Nav
} from "react-bootstrap";
function AddWorkoutMachine() {
  const [gymId,setGymId] = useState<string | null>(null);
  const gyms = useCollection(collections.gyms, COLLECTION_CONFIG);
  const workoutMachines = useCollection(
    query(collections.workoutMachines, where("gym", "==", gymId)),
    COLLECTION_CONFIG,
  );
  console.log(gyms);
  return (
    <Form>
      <h1>Add workout machine</h1>
      <Nav variant="tabs" defaultActiveKey={gymId||""} onSelect={setGymId}>
      {gyms[USE_COLLECTION.DATA]?.docs.map((doc) => (
        <Nav.Item key={doc.id}>
        <Nav.Link eventKey={doc.id}>{doc.data().name}</Nav.Link>
      </Nav.Item>
      ))}
    </Nav>
      {gyms[USE_COLLECTION.DATA]?.docs.map((doc) => (
        <FormCheck
          name={"gym"}
          key={doc.id}
          inline
          type="radio"
          label={doc.data().name}
        />
      ))}
<Row><Col ><FloatingLabel label="Number" >
        <FormControl required type="number" placeholder="1" />
      </FloatingLabel></Col><Col><FloatingLabel label="Name" className="mb-3">
        <FormControl type="text" placeholder="2" />
      </FloatingLabel></Col></Row>
      <Row>
      <Form.Group as={Col} controlId="formGridEmail">
          <Form.Label>Description</Form.Label>
          <Form.Control as="textarea" placeholder="Description" />
        </Form.Group>
      </Row>
      <FormLabel label="Description" className="mb-3">
        <FormControl as="textarea" placeholder="" rows={3} />
      </FormLabel>
    </Form>
  );
}
export default AddWorkoutMachine;
