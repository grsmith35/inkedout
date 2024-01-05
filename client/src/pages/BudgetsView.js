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
import Dropdown from 'react-bootstrap/Dropdown';
import NavItem from 'react-bootstrap/NavItem';
import NavLink from 'react-bootstrap/NavLink';

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
                                <div className="d-flex flex-wrap justify-content-between mt-1 mx-3">
                                    <h4>{budget.name}</h4>
                                    <div>
                                        <Dropdown as={NavItem} className='align-items-end'>
                                            <Dropdown.Toggle as={NavLink}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-three-dots" viewBox="0 0 16 16">
                                                    <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"/>
                                                </svg>
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu className='drop-down'>
                                                <Dropdown.Item id={budget._id} onClick={handleEditBudget}>Edit</Dropdown.Item>
                                                <Dropdown.Item id={budget._id} onClick={handleDeleteBudget}>Delete</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div className="card-text"><strong>Amount:</strong> ${budget.amount}</div>
                                    <div className="card-text"><strong>Time Frame:</strong> {budget.timePeriod}</div>
                                </div>
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