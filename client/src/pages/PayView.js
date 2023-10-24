import React from "react";
import { useStoreContext } from "../utils/GlobalState";
import ModalForm from "../Components/ModalForm";
import Button from 'react-bootstrap/Button';
import { useMutation } from "@apollo/client";
import { ADD_PAY, DELETE_PAY, EDIT_PAY } from "../utils/mutations";
import { UPDATE_ACCOUNT_PAYS } from "../utils/actions";
import accountNumbers from "../utils/congif";
import moment from "moment";
import auth from "../utils/auth";
import Login from "./Login";

export default function PayView() {
    const [addPay, setAddPay] = React.useState(false);
    const [state, dispatch] = useStoreContext();
    const [addNewPay, {error}] = useMutation(ADD_PAY);
    const [payAdded, setPayAdded] = React.useState();
    const [deletePay] = useMutation(DELETE_PAY);
    const [payRemoved, setPayRemoved] = React.useState();
    const [editPayId, setEditPayId] = React.useState();
    const [editPay, setEditPay] = React.useState();
    const [payEdited, setPayEdited] = React.useState();
    const [editPayPatch] = useMutation(EDIT_PAY)

    const [payForm, setPayForm] = React.useState([
        {
            title: "Income Source",
            type: "text",
            name: "name",
            value: ""
        },
        {
            title: "Consistency",
            type: "dropdown",
            items: [{ value: "Weekly", name: "weekly" }, {value: "Bi-weekly", name: "Bi-weekly" }, { value: "Bi-monthly", name: "Bi-monthly" }, { value: "Monthly", name: "Monthly" }],
            name: 'consistency',
            value: ""
        },   
        {
            title: "Source",
            type: "text",
            name: 'source',
            value: ""
        },
        {
            title: "Amount",
            type: "number",
            name: "amount",
            value: "0"
        },
        {
            title: "Pay Date(s)",
            type: "text",
            name: "payDate",
            value: ""
        },
        {
            title: "Pay Week",
            type: "date",
            name: "payWeek",
            value: null
        },
    ]);

    const handleCloseModal = () => {
        setAddPay(false);
        setEditPay(false);
    };
    
    const handleEditPay = (e) => {
        const payToEdit = state?.account?.pays?.filter((pay) => pay._id === e.target.id)
        setEditPayId(() => payToEdit[0]._id)
        setPayForm([
            {
                title: "Income Source",
                type: "text",
                name: "name",
                value: payToEdit[0].name,
                defaultValue: payToEdit[0].name
            },
            {
                title: "Consistency",
                type: "dropdown",
                items: [{ value: "Weekly", name: "weekly" }, {value: "Bi-weekly", name: "Bi-weekly" }, { value: "Bi-monthly", name: "Bi-monthly" }, { value: "Monthly", name: "Monthly" }],
                name: 'consistency',
                value: payToEdit[0].consistency,
                defaultValue: payToEdit[0].consistency
            },
            {
                title: "Source",
                type: "text",
                name: 'source',
                value: payToEdit[0].source,
                defaultValue: payToEdit[0].source
            },
            {
                title: "Amount",
                type: "number",
                name: "amount",
                value: payToEdit[0].amount,
                defaultValue: payToEdit[0].amount
            },
            {
                title: "Pay Date(s)",
                type: "text",
                name: "payDate",
                value: payToEdit[0]?.payDate,
                defaultValue: payToEdit[0]?.payDate
            },
            {
                title: "Pay Week",
                type: "date",
                name: "payWeek",
                value: payToEdit[0]?.payWeek,
                defaultValue: payToEdit[0]?.payWeek
            },
        ]);
        setEditPay(true);
    };

    const handlePostPay = async () => {
        const newPay = await addNewPay({
            variables: { 
                _id: state?.account?._id, 
                name: payForm[0].value, 
                source: payForm[2].value, 
                consistency: payForm[1].value, 
                amount: parseFloat(payForm[3].value),
                payDate: payForm [4].value,
                payWeek: payForm[5].value
            }
        })
        if(!!newPay) {
            setPayAdded(newPay.data.addPay);
            setAddPay(false);
        }
    };

    const handleDeletePay = async (e) => {
        const removedPay = await deletePay({
            variables: { _id: `${e.target.id}`, accountId: state?.account?._id}
        })
        if(!!removedPay) {
            setPayRemoved(e.target.id)
        }
    };

    const handlePatchPay = async () => {
        const editedPay = await editPayPatch({
            variables: { 
                _id: editPayId, 
                name: payForm[0].value, 
                consistency: payForm[1].value, 
                source: payForm[2].value, 
                amount: parseFloat(payForm[3].value),
                payDate: payForm [4].value,
                payWeek: payForm[5].value
            }
        });
        if(!!editedPay) {
            setPayEdited(editedPay.data.editPay);
            setEditPay(false);
        }
    }

    const handleOpenModal = () => {
        setAddPay(true)
    };

    React.useEffect(() => {
        if(!!payAdded) {
            const allPays = [
                ...state?.account?.pays,
                payAdded
            ];
            dispatch({
                type: UPDATE_ACCOUNT_PAYS,
                pays: allPays
            })
        }
    }, [payAdded])

    React.useEffect(() => {
        if(!!payRemoved) {
            const updatePays = state?.account?.pays.filter((pay) => pay._id != payRemoved);
            dispatch({
                type: UPDATE_ACCOUNT_PAYS,
                pays: updatePays
            })
        } else if(!!payEdited) {
            const payIndex = state?.account?.pays?.map((pay) => pay._id).indexOf(editPayId);
            const tempPays = state?.account?.pays?.filter((pay) => pay._id != editPayId);
            const allPays = tempPays.toSpliced(payIndex, 0, payEdited);
            dispatch({
                type: UPDATE_ACCOUNT_PAYS,
                pays: allPays
            })
        };
        setPayRemoved(null);
        setPayEdited(null);
    }, [payRemoved, payEdited])

    if(auth.loggedIn()) {

        return (
            <>
                {editPay && (
                    <ModalForm
                        title={'Edit Pay'}
                        fields={payForm}
                        editFields={setPayForm}
                        submitFunction={handlePatchPay}
                        closeDialog={handleCloseModal}
                    />
                )}
                {addPay && (
                    <ModalForm
                        title={'Add Pay'}
                        fields={payForm}
                        editFields={setPayForm}
                        submitFunction={handlePostPay}
                        closeDialog={handleCloseModal}
                    />
                )}
                <h3>Pay Sources</h3>
                {state?.account?.pay?.length === 0 && (
                    <div>Add your First Pay Source</div>
                )}
                <div>
                    <Button variant="primary" className="green-color" onClick={handleOpenModal}>Add Pay</Button>
                </div>
                {!!state?.account?.pays?.length && (state?.account?.pays?.map((pay) => (
                            <div className="card m-3" key={pay.name} id={pay.name}>
                                <div className="card-title"><h3>{pay.name}</h3></div>
                                <hr />
                                <div className="card-text">Amount: {pay.amount}</div>
                                <div className="card-text">Consistency: {pay.consistency}</div>
                                <div className="card-text">Source: {pay.source}</div>
                                <Button variant="primary" id={pay._id} onClick={handleEditPay}>Edit Pay</Button>
                                <Button variant="danger" id={pay._id} onClick={handleDeletePay}>Delete Pay</Button>
                            </div>
                        )))}
            </>
        )
    } else {
        return (
            <Login />
        )
    }
};