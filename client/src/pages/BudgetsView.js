import React from "react";
import { useStoreContext } from "../utils/GlobalState";
import Button from 'react-bootstrap/Button';
import { useMutation } from "@apollo/client";
import { ADD_BUDGET, DELETE_BUDGET, EDIT_BUDGET } from "../utils/mutations";
import { UPDATE_ACCOUNT_BUDGETS } from '../utils/actions';
import ModalForm from "../Components/ModalForm";
import accountNumbers from "../utils/congif";
import auth from "../utils/auth";
import Login from "./Login";


export default function BudgetsView() {
    const [state, dispatch] = useStoreContext()
    const [totalBudgets, setTotalBudgets] = React.useState(0);
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
    }, [budgetRemoved, budgetEdited])

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
                    <Button variant="primary" onClick={handleOpenModal}>Add Budget</Button>
                </div>
                {!!state?.account?.budgets?.length && state?.account?.budgets?.map((budget) => (
                            <div className="card m-3" key={budget._id} id={budget._id}>
                                <div className="card-title"><h3>{budget.name}</h3></div>
                                <hr />
                                <div className="card-text"><strong>Amount:</strong> ${budget.amount}</div>
                                <div className="card-text"><strong>Time Frame:</strong> {budget.timePeriod}</div>
                                {/* <div className="card-text"><strong>Payments</strong>
                                </div> */}
                                <Button variant="primary" id={budget._id} onClick={handleEditBudget}>Edit Budget</Button>
                                <Button variant="danger" id={budget._id} onClick={handleDeleteBudget}>Delete Budget</Button>
                                {/* <table>
                                    <thead>
                                        <tr>
                                            <th scope="col">Date</th>
                                            <th scope="col">Location</th>
                                            <th scope="col">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {budget.payments.map((payment) => (
                                            <tr>
                                                <td>{payment.date}</td>
                                                <td>{payment.location}</td>
                                                <td>{payment.amount}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <hr />
                                <div className="card-text">Remaining Amount: 100</div> */}
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