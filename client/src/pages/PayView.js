import React from "react";
import { useStoreContext } from "../utils/GlobalState";
import ModalForm from "../Components/ModalForm";
import Button from 'react-bootstrap/Button';
import { useMutation, useQuery } from "@apollo/client";
import { QUERY_ACCOUNT } from "../utils/queries";
import { ADD_PAY, DELETE_PAY, EDIT_PAY } from "../utils/mutations";
import { UPDATE_ACCOUNT_PAYS, UPDATE_ACCOUNT } from "../utils/actions";
import Dropdown from 'react-bootstrap/Dropdown';
import NavItem from 'react-bootstrap/NavItem';
import NavLink from 'react-bootstrap/NavLink';
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
        setPayForm([
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
        ])
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
                                <div className="d-flex flex-wrap justify-content-between mt-1 mx-3">
                                    <h4>{pay.name}</h4>
                                    <div>
                                        <Dropdown as={NavItem} className='align-items-end'>
                                            <Dropdown.Toggle as={NavLink}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-three-dots" viewBox="0 0 16 16">
                                                    <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"/>
                                                </svg>
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu className='drop-down'>
                                                <Dropdown.Item id={pay._id} onClick={handleEditPay}>Edit</Dropdown.Item>
                                                <Dropdown.Item id={pay._id} onClick={handleDeletePay}>Delete</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div className="card-text"><strong>Amount:</strong>{pay.amount}</div>
                                    <div className="card-text"><strong>Consistency:</strong>{pay.consistency}</div>
                                    <div className="card-text"><strong>Source:</strong>{pay.source}</div>
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