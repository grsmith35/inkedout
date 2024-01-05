import React from 'react';
import ModalForm from '../Components/ModalForm';
import { useMutation } from '@apollo/client';
import { ADD_USER } from '../utils/mutations';
import { useStoreContext } from '../utils/GlobalState';

export default function AddUser() {
    const [addCharge, setAddCharge] = React.useState(false);
    const [state, dispatch] = useStoreContext();
    const [userForm, setUserForm] = React.useState();
    const [postUser] = useMutation(ADD_USER);
    const [chargeAdded, setChargeAdded] = React.useState();

    const handleSubmitUser = async () => {
        const newUser = await postUser({
            variables: { name: 'Demo Account', email: 'Demo@email.com', password: '1234' }
        });
    };

    const handleCloseModal = () => {
        setAddCharge(false);
    };

    return (
        <div>
            <input></input>
            <input></input>
            <button onClick={handleSubmitUser}>{'test'}</button>
        </div>
    )
}