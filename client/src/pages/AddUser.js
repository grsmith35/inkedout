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

    const handleClickAdd = () => {
        setUserForm([
            {
                title: "Name",
                type: "text",
                name: "name",
                value: "", 
            },
            {
                title: "E-mail",
                type: "text",
                name: "email",
                value: "", 
            },
            {
                title: "Password",
                type: "password",
                name: "password",
                value: "",
            },
        ]);
        // setAddCharge(true)
    };

    const handleSubmitUser = async () => {
        const newUser = await postUser({
            variables: { name: 'riley', email: 'riley@email.com', password: '1234' }
        });
        if(!!newUser) {
            // setChargeAdded(newCharge.data.addCharge);
            // setAddCharge(false);
            console.log(newUser)
        }
    };

    const handleCloseModal = () => {
        setAddCharge(false);
    };

    // React.useEffect(() => {
        
    // }, [chargeAdded])

    return (
        <div>
            <input></input>
            <input></input>
            {/* {!!addCharge && (
                <ModalForm
                    title={'Add User'}
                    fields={userForm}
                    editFields={setUserForm}
                    submitFunction={handleSubmitUser}
                    closeDialog={handleCloseModal}
                />
            )} */}
            <button onClick={handleSubmitUser}>{'test'}</button>
            {/* <svg xmlns="http://www.w3.org/2000/svg" onClick={handleSubmitUser} width="16" height="16" fill="orange" className="backcolor fixedbutton bi bi-plus-circle" viewBox="0 0 16 16">
                <path className='backcolor' d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path  className='backcolor' d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
            </svg> */}
        </div>
    )
}