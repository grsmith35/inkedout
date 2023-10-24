import react from 'react';
import { useMutation } from '@apollo/client';
import { ACCOUNT_LOGIN } from '../utils/mutations';
import { useStoreContext } from "../utils/GlobalState";
import auth from '../utils/auth';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button'
import { UPDATE_ACCOUNT_ID, UPDATE_ACCOUNT } from '../utils/actions';

export default function Login() {
    const [state, dispatch] = useStoreContext();
    const [formState, setFormState] = react.useState({
        email: '',
        password: ''
    });

    const [login, { error }] = useMutation(ACCOUNT_LOGIN)


    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const { data } = await login({
                variables: {email: formState.email, password: formState.password}
            });
            dispatch({
                type: UPDATE_ACCOUNT,
                accountId: data.login.account
            })
            auth.login(data.login.token, data.login.account._id)
        } catch (e) {
            console.error(error)
        }

        setFormState({
            email: "",
            password: ""
        })
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormState({
            ...formState,
            [name]: value
        })
    };

    return (
        <div className='container align-items-center large-margin'>
            <div className='row mx-auto'>
                {/* <form className='my-auto' onSubmit={handleLogin} onChange={handleFormChange}>
                    <label htmlFor='email' className='row'>Email</label>
                    <input id='email' name='email' type='text' className='row' value={formState.email}></input>
                    <label htmlFor='password' className='row'>Password</label>
                    <input id='password' name='password' type='password' className='row' value={formState.password}></input>
                    <button className='btn btn-primary'>Login</button>
                    {error && <div>Login Failed</div>}
                </form> */}
                <Form onChange={handleFormChange} onSubmit={handleLogin}>
                    <Form.Group className="mb-3" controlId='email'>
                        <Form.Label>Email</Form.Label>
                        <Form.Control type={'text'} name='email' value={formState.email}/>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId='password'>
                        <Form.Label>Password</Form.Label>
                        <Form.Control type={'password'} name='password' value={formState.password}/>
                    </Form.Group>
                    <Button variant='primary' className='green-color full-width-button' type='submit'>Login</Button>
                    {error && <div className='login-error'>Login Failed</div>}

                </Form>
            </div>
        </div>
    )
};