import { useSignInWithEmailLink } from 'react-firebase-hooks/auth';
import {REGISTER_EMAIL_KEY, auth} from '../App'
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/esm/Spinner';
function Register(){

    const [signInWithEmailLink, user, loading, error] = useSignInWithEmailLink(
        auth
      );
      console.log("register",user, loading, error)
      const email = localStorage.getItem(REGISTER_EMAIL_KEY);
      email && !user && !loading && !error && signInWithEmailLink(email)
    return <div>
        <h1>Register</h1>
        {loading && <Spinner />}
        {user && <h2>{user?.user.displayName} {user.user.email}</h2>}
        {error && <Alert variant="danger">{error.message}</Alert>}
    </div>
}
export default Register;