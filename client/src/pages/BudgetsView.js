import React from "react";
import { useStoreContext } from "../utils/GlobalState";
import Button from 'react-bootstrap/Button';
import { QUERY_ACCOUNT } from "../utils/queries";
import { useMutation, useQuery } from "@apollo/client";
import { ADD_BUDGET, DELETE_BUDGET, EDIT_BUDGET } from "../utils/mutations";
import { UPDATE_ACCOUNT_BUDGETS, UPDATE_ACCOUNT } from '../utils/actions';
import ModalForm from "../Components/ModalForm";
import auth from "../utils/auth";
import Login from "./Login";


export default function BudgetsView() {
    const [state, dispatch] = useStoreContext()
    const [addBudget, setAddBudget] = React.useState(false);
    const [budgetForm, setBudgetForm] = React.useState();
    const [editBudget, setEditBudget] = React.useState(false);
    const [addBudgetPost] = useMutation(ADD_BUDGET);
    const [budgetAdded, setBudgetAdded] = React.useState();
    const [budgetRemoved, setBudgetRemoved] = React.useState();
    const [deleteBudget] = useMutation(DELETE_BUDGET);
    const [editBudgetPatch] = useMutation(EDIT_BUDGET);
    const [budgetEdited, setBudgetEdited] = React.useState();
    const [editBudgetId, setBudgetId] = React.useState();
    const { data, loading, error } = useQuery(QUERY_ACCOUNT, {
        variables: { _id: localStorage.getItem('accountId')}
    });

    const handleOpenModal = () => {
        setBudgetForm([
            {
                title: "Budget Name",
                type: "text",
                name: "name",
                value: ""
            },
            {
                title: "Time Frame",
                type: "dropdown",
                items: [{ value: "Weekly", name: "Weekly" }, { name: "Bi-weekly", value: "Bi-weekly"}, { value: "Bi-monthly", name: "Bi-monthly" }, { value: "Monthly", name: "Monthly" }],
                name: 'timePeriod',
                value: ""
            },
            {
                title: "Amount",
                type: "number",
                name: "amount",
                value: "0"
            }
        ]);
        setAddBudget(true);
    };
    
    const handleEditBudget = (e) => {
        const budgetToEdit = state?.account?.budgets?.filter((b) => b._id === e.target.id);
        setBudgetId(() => budgetToEdit[0]._id);
        setBudgetForm([
            {
                title: "Budget Name",
                type: "text",
                name: "name",
                value: budgetToEdit[0].name ,
                defaultValue: budgetToEdit[0].name
            },
            {
                title: "Time Frame",
                type: "dropdown",
                items: [{ value: "Weekly", name: "Weekly" }, { value: "Monthly", name: "Monthly" }],
                name: 'timePeriod',
                value: budgetToEdit[0].timePeriod ,
                defaultValue: budgetToEdit[0].timePeriod
            },
            {
                title: "Amount",
                type: "number",
                name: "amount",
                value: budgetToEdit[0].amount ,
                defaultValue: budgetToEdit[0].amount
            }
        ]);
        setEditBudget(true);
    };

    const handleDeleteBudget = async (e) => {
        const removedBudget = await deleteBudget({
            variables: { _id: `${e.target.id}`, accountId: state?.account?._id}
        })
        if(!!removedBudget) {
            setBudgetRemoved(e.target.id)
        }
    };

    const handlePatchBudget = async () => {
        const editedBudget = await editBudgetPatch({
            variables: { _id: editBudgetId, name: budgetForm[0].value, timePeriod: budgetForm[1].value, amount: parseFloat(budgetForm[2].value)}
        });
        if(!!editedBudget) {
            setBudgetEdited(editedBudget.data.editBudget);
            setEditBudget(false);
        }
    };

    const handlePostBudget = async () => {
        const newBudget = await addBudgetPost({
            variables: { _id: state?.account?._id, name: budgetForm[0].value, timePeriod: budgetForm[1].value, amount: parseFloat(budgetForm[2].value) }
        });
        if(!!newBudget) {
            setBudgetAdded(newBudget.data.addBudget);
            setAddBudget(false);
        }
    };
    
    const handleCloseModal = () => {
        setAddBudget(false);
        setEditBudget(false);
    };

    React.useEffect(() => {
        if(!!budgetAdded) {
            const allBudgets = [
                ...state?.account?.budgets,
                budgetAdded
            ];
            dispatch({
                type: UPDATE_ACCOUNT_BUDGETS,
                budgets: allBudgets
            })
        }
    }, [budgetAdded]);

    React.useEffect(() => {
        if(!!budgetRemoved) {
            const updatedBudgets = state?.account?.budgets?.filter((b) => b._id != budgetRemoved);
            dispatch({
                type: UPDATE_ACCOUNT_BUDGETS,
                budgets: updatedBudgets
            })
        } else if(!!budgetEdited) {
            const budgetIndex = state?.account?.budgets?.map((b) => b._id).indexOf(editBudgetId);
            const tempBudgets = state?.account?.budgets?.filter((b) => b._id != editBudgetId);
            const allBudgets = tempBudgets.toSpliced(budgetIndex, 0, budgetEdited);
            dispatch({
                type: UPDATE_ACCOUNT_BUDGETS,
                budgets: allBudgets
            })
        }
        setBudgetRemoved(null);
        setBudgetEdited(null);
    }, [budgetRemoved, budgetEdited]);

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
                {editBudget && (
                    <ModalForm
                        title={'Edit Budget'}
                        fields={budgetForm}
                        editFields={setBudgetForm}
                        submitFunction={handlePatchBudget}
                        closeDialog={handleCloseModal}
                    />
                )}
                {addBudget && (
                    <ModalForm
                        title={'Add Budget'}
                        fields={budgetForm}
                        editFields={setBudgetForm}
                        submitFunction={handlePostBudget}
                        closeDialog={handleCloseModal}
                    />
                )}
                <h3>Budgets</h3>
                {state?.account?.budgets?.length === 0 && (
                    <div>Add your First Budget</div>
                )}
                <div>
                    <Button variant="primary" className="green-color" onClick={handleOpenModal}>Add Budget</Button>
                </div>
                {!!state?.account?.budgets?.length && state?.account?.budgets?.map((budget) => (
                            <div className="card m-3" key={budget._id} id={budget._id}>
                                <div className="card-title">
                                    <h3>{budget.name}</h3>
                                    <div className="d-flex justify-content-evenly">
                                        <div onClick={handleDeleteBudget} className="pr-3" id={budget._id}>
                                            <svg xmlns="http://www.w3.org/2000/svg" id={budget._id} width="16" height="16" fill="currentColor" className="bi bi-trash3" viewBox="0 0 16 16">
                                                <path id={budget._id} d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"/>
                                            </svg>
                                        </div>
                                        <div onClick={handleEditBudget} className="ml-3" id={budget._id}>
                                            <svg xmlns="http://www.w3.org/2000/svg" id={budget._id} width="16" height="16" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                                                <path id={budget._id} d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                                <path id={budget._id} fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                <hr />
                                <div className="card-text"><strong>Amount:</strong> ${budget.amount}</div>
                                <div className="card-text"><strong>Time Frame:</strong> {budget.timePeriod}</div>
                            </div>
                        ))}
            </>
        )
    } else {
        return (
            <Login />
        )
    }

};