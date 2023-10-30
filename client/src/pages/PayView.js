import React from "react";
import { useStoreContext } from "../utils/GlobalState";
import ModalForm from "../Components/ModalForm";
import Button from 'react-bootstrap/Button';
import { useMutation, useQuery } from "@apollo/client";
import { QUERY_ACCOUNT } from "../utils/queries";
import { ADD_PAY, DELETE_PAY, EDIT_PAY } from "../utils/mutations";
import { UPDATE_ACCOUNT_PAYS, UPDATE_ACCOUNT } from "../utils/actions";
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
    const [editPayPatch] = useMutation(EDIT_PAY);
    const { data, loading } = useQuery(QUERY_ACCOUNT, {
        variables: { _id: localStorage.getItem('accountId')}
    });

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
    }, [payRemoved, payEdited]);

    React.useEffect(() => {
        if(!!data) {
            dispatch({
                type: UPDATE_ACCOUNT,
                account: data.getAccount
            });
        }
    }, [data]);

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
                                <div className="card-title">
                                    <h3>{pay.name}</h3>
                                    <div className="d-flex justify-content-evenly">
                                        <div onClick={handleDeletePay} className="pr-3" id={pay._id}>
                                            <svg xmlns="http://www.w3.org/2000/svg" id={pay._id} width="16" height="16" fill="currentColor" className="bi bi-trash3" viewBox="0 0 16 16">
                                                <path id={pay._id} d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"/>
                                            </svg>
                                        </div>
                                        <div onClick={handleEditPay} className="ml-3" id={pay._id}>
                                            <svg xmlns="http://www.w3.org/2000/svg" id={pay._id} width="16" height="16" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                                                <path id={pay._id} d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                                <path id={pay._id} fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                <hr />
                                <div className="card-text">Amount: {pay.amount}</div>
                                <div className="card-text">Consistency: {pay.consistency}</div>
                                <div className="card-text">Source: {pay.source}</div>
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