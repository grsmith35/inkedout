import React from 'react';
import ModalForm from './ModalForm';
import { useMutation } from '@apollo/client';
import { ADD_CHARGE } from '../utils/mutations';
import { useStoreContext } from '../utils/GlobalState';
import moment from 'moment';

export default function AddIcon() {
    const [addCharge, setAddCharge] = React.useState(false);
    const [state, dispatch] = useStoreContext();
    const [chargeForm, setChargeForm] = React.useState();
    const [postCharge] = useMutation(ADD_CHARGE);
    const [chargeAdded, setChargeAdded] = React.useState();

    const handleClickAdd = () => {
        setChargeForm([
            {
                title: "Source",
                type: "text",
                name: "name",
                value: "", 
            },
            {
                title: "Date",
                type: "date",
                name: "date",
                value: moment().format('YYYY-MM-DD'),
            },
            {
                title: "Budget",
                type: "dropdown",
                items: state?.account?.budgets?.map((b) => { return {value: b._id, name: b.name }}) ?? [{value: 'none', name: 'none'}],
                name: "budget",
                value: ""
            },
            {
                title: "Amount",
                type: "number",
                name: "amount",
                value: "0"
            }
        ]);
        setAddCharge(true)
    };

    const handleSubmitCharge = async () => {
        const newCharge = await postCharge({
            variables: { accountId: state?.account?._id, name: chargeForm[0].value, date: chargeForm[1].value, budgetId: chargeForm[2].value, amount: parseFloat(chargeForm[3].value)}
        });
        if(!!newCharge) {
            setChargeAdded(newCharge.data.addCharge);
            setAddCharge(false);
        }
    };

    const handleCloseModal = () => {
        setAddCharge(false);
    };

    React.useEffect(() => {
        
    }, [chargeAdded])

    return (
        <div>
            {!!addCharge && (
                <ModalForm
                    title={'Add Charge'}
                    fields={chargeForm}
                    editFields={setChargeForm}
                    submitFunction={handleSubmitCharge}
                    closeDialog={handleCloseModal}
                />
            )}
            <svg xmlns="http://www.w3.org/2000/svg" onClick={handleClickAdd} width="16" height="16" fill="green" className="backcolor fixedbutton bi bi-plus-circle" viewBox="0 0 16 16">
                <path className='green-color' d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path  className='green-color' d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
            </svg>
        </div>
    )
}