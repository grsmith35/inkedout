import React from "react";
import { useStoreContext } from "../utils/GlobalState";
import Button from 'react-bootstrap/Button';
import ModalForm from "../Components/ModalForm";
import { useMutation } from "@apollo/client";
import { ADD_BILL, DELETE_BILL, EDIT_BILL } from "../utils/mutations";
import { UPDATE_ACCOUNT_BILLS } from "../utils/actions";
import accountNumbers from "../utils/congif";
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
            variables: { _id: editBillId, name: billsForm[0].value, date: billsForm[1].value, source: billsForm[2].value, amount: parseFloat(billsForm[3].value), automated: billsForm[4].value }
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
                    <Button variant="primary" onClick={handleOpenModal}>Add Bill</Button>
                </div>
                {!!state?.account?.bills?.length && (state?.account?.bills?.map((bill) => (
                            <div className="card m-3" key={bill._id} id={bill._id}>
                                <div className="card-title"><h3>{bill.name}</h3></div>
                                <hr />
                                <div className="card-text"><strong className="mr-3">Date of Month billed:</strong>{`${bill.date}`}</div>
                                <div className="card-text"><strong>Amount:</strong>{` $${bill.amount}`}</div>
                                <div className="card-text"><strong>Source:</strong>{` ${bill.source}`}</div>
                                <div className="card-text"><strong>Automated:</strong>
                                    {!bill.automated ? (   
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-square-fill x-box" viewBox="0 0 16 16">
                                                <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2zm3.354 4.646L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 1 1 .708-.708z"/>
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check-square-fill check-box" viewBox="0 0 16 16">
                                                <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2zm10.03 4.97a.75.75 0 0 1 .011 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.75.75 0 0 1 1.08-.022z"/>
                                            </svg>
                                        )
                                    }
                                </div>
                                <Button variant="primary" id={bill._id} onClick={handleEditBill}>Edit Bill</Button>
                                <Button variant="danger" id={bill._id} onClick={handleDeleteBill}>Delete Bill</Button>
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