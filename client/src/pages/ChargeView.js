import React from 'react';
import { useStoreContext } from '../utils/GlobalState';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import Row from 'react-bootstrap/Row';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import Accordion from 'react-bootstrap/Accordion';
import { QUERY_CHARGE_RANGE, QUERY_ALL_CHARGES } from '../utils/queries';
import { EDIT_CHARGE, DELETE_CHARGE } from '../utils/mutations';
import { UPDATE_CHARGES } from '../utils/actions';
import moment from 'moment/moment';
import ModalForm from '../Components/ModalForm';
import auth from "../utils/auth";
import Login from "./Login";

export default function ChargeView() {
    const [state, dispatch] = useStoreContext();
    const [searchCharges, { loading, called }] = useLazyQuery(QUERY_CHARGE_RANGE);
    const [editCharge, setEditCharge] = React.useState(false);
    const [chargeEdited, setChargeEdited] = React.useState();
    const [chargeForm, setChargeForm] = React.useState();
    const [deleteCharge] = useMutation(DELETE_CHARGE);
    const [deletedChargeId, setDeletedChargeId] = React.useState();
    const [searchForm, setSearchForm] = React.useState();
    const [patchCharge] = useMutation(EDIT_CHARGE);
    const [charges, setCharges] = React.useState();
    const [chargeToEdit, setChargeToEdit] = React.useState();
    const [chargeToEditId, setChargeToEditId] = React.useState();

    const handleChargeSearch = async (e) => {
        const searchedCharges = await searchCharges({
            variables: { 
                accountId: state?.account?._id,
                ...(!!searchForm?.budgetId && searchForm?.budgetId !== 'noBudget' && { budgetId: searchForm.budgetId }),
                ...(!!searchForm?.startDate && { startDate: searchForm.startDate, endDate: searchForm.endDate }) 
            },
            fetchPolicy: 'no-cache'
        });
        setCharges(searchedCharges?.data?.getCharges ?? []);
    };

    const handleSetSearchCriteria = (e) => {
        const { name, value } = e.target;
        
        setSearchForm({
            ...searchForm,
            [name]: value
        });
    }

    const handlePatchCharge = async () => {
        const patchedCharge = await patchCharge({
            variables: { _id: chargeToEditId, name: chargeForm[0].value, date: chargeForm[1].value, amount: parseFloat(chargeForm[3].value), budgetId: chargeForm[2].value}
        });
        if(!!patchedCharge) {
            const newCharge = patchedCharge.data.editCharge
            const chargeIndex = state?.charges?.map((charge) => charge._id).indexOf(newCharge._id);
            const tempCharges = state?.charges?.filter((charge) =>  charge._id !== newCharge._id);
            const allCharges = tempCharges.toSpliced(chargeIndex, 0, newCharge);
            dispatch({
                type: UPDATE_CHARGES,
                charges: allCharges
            });
            setEditCharge(false);
        }
    }

    const handleEditCharge = (e) => {
        const chargeToEdit = state.charges.find((c) => c._id === e.target.id);
        setChargeToEditId(chargeToEdit._id)
        setChargeForm([
            {
                title: "Source",
                type: "text",
                name: "name",
                value: chargeToEdit?.name, 
            },
            {
                title: "Date",
                type: "date",
                name: "date",
                value: moment(chargeToEdit?.date).format('YYYY-MM-DD'),
            },
            {
                title: "Budget",
                type: "dropdown",
                items: state?.account?.budgets?.map((b) => { return {value: b._id, name: b.name }}),
                name: "budget",
                value: chargeToEdit?.budgetId,
                defaultValue: chargeToEdit?.budgetId
            },
            {
                title: "Amount",
                type: "number",
                name: "amount",
                value: chargeToEdit?.amount
            }
        ]);
        setEditCharge(true);
    };

    const handleDeleteCharge = async (e) => {
        const deletedCharge = await deleteCharge({
            variables: { _id: e.target.id}
        })
        if(!!deletedCharge) {
            setDeletedChargeId(e.target.id);
        }
    };

    const handleCloseModal = () => {
        setEditCharge(false)
    }

    React.useEffect(() => {
        if(!!deletedChargeId) {
            const chargeList = state.charges.filter((c) =>  c._id != deletedChargeId);
            dispatch({
                type: UPDATE_CHARGES,
                charges: chargeList
            });
        }
    }, [deletedChargeId]);

    React.useEffect(() => {
        if(!!charges) {
            dispatch({
                type: UPDATE_CHARGES,
                charges: charges
            })
        }
        setCharges();
    }, [charges]);

    console.log(state)

    if(auth.loggedIn()) {

        return (
            <>
                {editCharge && (
                    <ModalForm
                    title={'Edit Charge'}
                    fields={chargeForm}
                    editFields={setChargeForm}
                    submitFunction={handlePatchCharge}
                    closeDialog={handleCloseModal}
                />
                )}
                <h3>Charges</h3>
                <Accordion defaultActiveKey="0">
                    <Accordion.Item eventKey="0">
                        <Accordion.Header className='faded-green-color'>Search Criteria</Accordion.Header>
                        <Accordion.Body>
                            <Form onChange={handleSetSearchCriteria}>
                                <Form.Label>Start Date</Form.Label>
                                <Form.Control type='date' name='startDate' className='pl-3'/>
                                <Form.Label>End Date</Form.Label>
                                <Form.Control type='date' name='endDate' className='pl-3'/>
                                <hr />
                                <Form.Select className='mb-3' aria-label={'Budget'} name='budgetId' >
                                    <option value='noBudget'>Budget</option>
                                    {state?.account?.budgets?.map((b) => <option value={b._id}>{b.name}</option>)}
                                </Form.Select>
                                <Button variant="primary" disabled={!searchForm?.startDate || !searchForm?.endDate} className='green-color' onClick={handleChargeSearch}>Search</Button>
                            </Form>
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>
                {loading ? (
                    <div>
                        <Spinner animation='border' role='status'>
                            <span className='visually-hidden'>Loading...</span>
                        </Spinner>
                    </div>
                ) : (
                    <div>
                        {state?.charges?.length > 0 ? (state?.charges?.map((c) => 
                        <div className="card m-3" key={c._id} id={c._id}>
                            <div className="card-title">
                                <h3>{c.name}</h3>
                                <div className="d-flex justify-content-evenly">
                                    <div onClick={handleDeleteCharge} className="pr-3" id={c._id}>
                                        <svg xmlns="http://www.w3.org/2000/svg" id={c._id} width="16" height="16" fill="currentColor" className="bi bi-trash3" viewBox="0 0 16 16">
                                            <path id={c._id} d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"/>
                                        </svg>
                                    </div>
                                    <div onClick={handleEditCharge} className="ml-3" id={c._id}>
                                        <svg xmlns="http://www.w3.org/2000/svg" id={c._id} width="16" height="16" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                                            <path id={c._id} d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                            <path id={c._id} fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <hr />
                            <div className="card-text"><strong className="mr-3">Date:</strong>{`${moment(c.date).format('MM/DD/YYYY')}`}</div>
                            <div className="card-text"><strong>Amount:</strong>{`$${c.amount}`}</div>
                            <div className="card-text"><strong>Budget:</strong>{`${state?.account?.budgets?.find((b) => b._id === c.budgetId).name}`}</div>
                        </div>
                )) : (
                    <div>{called ? 'No Charges for this period.' : ''}</div>
                )}
                    </div>
                )}
                
            </>
        )
    } else {
        return (
            <Login />
        )
    }
};