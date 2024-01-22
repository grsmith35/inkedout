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
import Dropdown from 'react-bootstrap/Dropdown';
import NavItem from 'react-bootstrap/NavItem';
import NavLink from 'react-bootstrap/NavLink';

export default function BillView() {
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
        if(!!data) {
            setBillAdded(data.data.addBill);
            setAddBill(false);
        }
    };

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
                {state?.account?.bills?.length === 0 && (
                    <div>Add Your First Bill</div>
                )}
                <div>
                    <Button variant="primary" className="green-color" onClick={handleOpenModal}>Add Bill</Button>
                </div>
                {!!state?.account?.bills?.length && (state?.account?.bills?.map((bill) => (
                            <div className="card m-3" key={bill._id} id={bill._id}>
                                <div className="d-flex flex-wrap justify-content-between mt-1 mx-3">
                                    <h4>{bill.name}</h4>
                                    <div>
                                        <Dropdown as={NavItem} className='align-items-end'>
                                            <Dropdown.Toggle as={NavLink}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-three-dots" viewBox="0 0 16 16">
                                                    <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"/>
                                                </svg>
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu className='drop-down'>
                                                <Dropdown.Item id={bill._id} onClick={handleEditBill}>Edit</Dropdown.Item>
                                                <Dropdown.Item id={bill._id} onClick={handleDeleteBill}>Delete</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </div>
                                </div>
                                <div className="card-body">

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