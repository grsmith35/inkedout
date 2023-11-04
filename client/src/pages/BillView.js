import React from "react";
import { useStoreContext } from "../utils/GlobalState";
import Button from 'react-bootstrap/Button';
import ModalForm from "../Components/ModalForm";
import { useMutation, useQuery } from "@apollo/client";
import { QUERY_ACCOUNT } from "../utils/queries";
import { ADD_BILL, DELETE_BILL, EDIT_BILL } from "../utils/mutations";
import { UPDATE_ACCOUNT_BILLS, UPDATE_ACCOUNT } from "../utils/actions";
import auth from "../utils/auth";
import Login from "./Login";

export default function BillView() {
    const [totalBills, setTotalBills] = React.useState(0);
    const [state, dispatch] = useStoreContext();
    const [editBill, setEditBill] = React.useState(false);    
    const [addBill, setAddBill] = React.useState(false);
    const [addNewBill] = useMutation(ADD_BILL);
    const [billAdded, setBillAdded] = React.useState();
    const [deleteBill] = useMutation(DELETE_BILL);
    const [editBillPatch] = useMutation(EDIT_BILL);
    const [billRemoved, setBillRemoved] = React.useState();
    const [billEdited, setBillEdited] = React.useState();
    const [editBillId, setEditBillId] = React.useState();
    const { data, loading, error } = useQuery(QUERY_ACCOUNT, {
        variables: { _id: localStorage.getItem('accountId')}
    });
    
    const handleEditBill = (e) => {
        const billToEdit = state?.account?.bills?.filter((bill) => bill._id === e.target.id)
        setEditBillId(() => billToEdit[0]._id)
        setBillsForm([
            {
                title: "Bill Name",
                type: "text",
                name: "name",
                value: billToEdit[0].name,
                defaultValue: billToEdit[0].name
            },
            {
                title: "Day of month Due",
                type: "text",
                name: 'date',
                value: billToEdit[0].date,
                defaultValue: billToEdit[0].date
            },
            {
                title: "Source",
                type: "text",
                name: 'source',
                value: billToEdit[0].source,
                defaultValue: billToEdit[0].source
            },
            {
                title: "Amount",
                type: "number",
                name: "amount",
                value: billToEdit[0].amount,
                defaultValue: billToEdit[0].amount
            },{
                title: "Automated",
                type: "checkbox",
                name: "automated",
                value: !!billToEdit[0].automated ? 'on' : false,
                defaultValue: !!billToEdit[0].automated  ? 'on' : false
            }
        ])
        setEditBill(true);
    }

    const handleOpenModal = () => {
        setBillsForm([
            {
                title: "Bill Name",
                type: "text",
                name: "name",
                value: ""
            },
            {
                title: "Day of month Due",
                type: "text",
                name: 'date',
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
            },{
                title: "Automated",
                type: "checkbox",
                name: "automated",
                value: false
            }
        ])
        setAddBill(true)
    };

    const [billsForm, setBillsForm] = React.useState([
        {
            title: "Bill Name",
            type: "text",
            name: "name",
            value: ""
        },
        {
            title: "Day of month Due",
            type: "text",
            name: 'date',
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
        },{
            title: "Automated",
            type: "checkbox",
            name: "automated",
            value: false
        }
    ]);

    const handleCloseModal = (e) => {
        setAddBill(() => false);
        setEditBill(() => false);
    }

    const handleDeleteBill = async (e) => {
        const removedBill = await deleteBill({
            variables: { _id: `${e.target.id}`, accountId: state?.account?._id}
        })
        if(!!removedBill) {
            setBillRemoved(e.target.id)
        }
    };

    const handlePatchBill = async () => {
        const editedBill = await editBillPatch({
            variables: { _id: editBillId, name: billsForm[0].value, date: billsForm[1].value, source: billsForm[2].value, amount: parseFloat(billsForm[3].value), automated: billsForm[4].value === 'on' }
        });
        if(!!editedBill) {
            setBillEdited(editedBill.data.editBill);
            setEditBill(false)
        }
    }

    const handleAddBill = async () => {
        const data = await addNewBill({
            variables: { _id: state?.account?._id, name: billsForm[0].value, date: billsForm[1].value, source: billsForm[2].value, amount: parseFloat(billsForm[3].value), automated: billsForm[4].value }
        })
        //todotodo update the store
        if(!!data) {
            setBillAdded(data.data.addBill);
            setAddBill(false);
        }
    };

    React.useEffect(() => {
        setTotalBills(() => state?.account?.bills?.reduce((acc, obj) => { return acc + obj.amount; }, 0));
    }, []);

    React.useEffect(() => {
        if(!!billAdded) {
            const allBills = [
                ...state?.account?.bills,
                billAdded
            ];
            dispatch({
                type: UPDATE_ACCOUNT_BILLS,
                bills: allBills
            })
        }
    }, [billAdded]);

    React.useEffect(() => {
        
        if(!!billRemoved) {
            const allBills = state?.account?.bills?.filter((bill) => bill._id != billRemoved);
            dispatch({
                type: UPDATE_ACCOUNT_BILLS,
                bills: allBills
            });
        } else if(!!billEdited) {
            const billIndex = state?.account?.bills?.map((bill) => bill._id).indexOf(billEdited._id);
            const tempBills = state?.account?.bills?.filter((bill) =>  bill._id != billEdited._id);
            const allBills = tempBills.toSpliced(billIndex, 0, billEdited);
            dispatch({
                type: UPDATE_ACCOUNT_BILLS,
                bills: allBills
            });
        };
        
        setBillRemoved(null);
        setBillEdited(null);
    }, [billRemoved, billEdited]);

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
                {editBill && (
                    <ModalForm
                    title={'Edit Bill'}
                    fields={billsForm}
                    editFields={setBillsForm}
                    submitFunction={handlePatchBill}
                    closeDialog={handleCloseModal}
                />
                )}
                {addBill && (
                    <ModalForm
                        title={'Add Bill'}
                        fields={billsForm}
                        editFields={setBillsForm}
                        submitFunction={handleAddBill}
                        closeDialog={handleCloseModal}
                    />
                )}
                <h3>Bills</h3>
                {state?.account?.bills?.lenght === 0 && (
                    <div>Add Your First Bill</div>
                )}
                <div>
                    <Button variant="primary" className="green-color" onClick={handleOpenModal}>Add Bill</Button>
                </div>
                {!!state?.account?.bills?.length && (state?.account?.bills?.map((bill) => (
                            <div className="card m-3" key={bill._id} id={bill._id}>
                                <div className="card-title">
                                    <h4>{bill.name}</h4>
                                    <div className="d-flex justify-content-evenly">
                                        <div onClick={handleDeleteBill} className="pr-3" id={bill._id}>
                                            <svg xmlns="http://www.w3.org/2000/svg" id={bill._id} width="16" height="16" fill="currentColor" className="bi bi-trash3" viewBox="0 0 16 16">
                                                <path id={bill._id} d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"/>
                                            </svg>
                                        </div>
                                        <div onClick={handleEditBill} className="ml-3" id={bill._id}>
                                            <svg xmlns="http://www.w3.org/2000/svg" id={bill._id} width="16" height="16" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                                                <path id={bill._id} d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                                <path id={bill._id} fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                <hr />
                                <div className="card-text"><strong className="mr-3">Date of Month billed:</strong>{`${bill.date}`}</div>
                                <div className="card-text"><strong>Amount:</strong>{` $${bill.amount}`}</div>
                                <div className="card-text"><strong>Source:</strong>{` ${bill.source}`}</div>
                                    {!bill.automated ? (   
                                            <div></div>
                                        ) : (
                                            <div className="card-text"><strong>Automated</strong></div>
                                        )
                                    }
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