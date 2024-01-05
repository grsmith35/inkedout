import React from 'react';
import { useStoreContext } from '../utils/GlobalState';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import { useLazyQuery, useMutation } from '@apollo/client';
import Accordion from 'react-bootstrap/Accordion';
import { QUERY_CHARGE_RANGE } from '../utils/queries';
import { EDIT_CHARGE, DELETE_CHARGE } from '../utils/mutations';
import { UPDATE_CHARGES, UPDATE_SEARCHED_CHARGES } from '../utils/actions';
import moment from 'moment/moment';
import ModalForm from '../Components/ModalForm';
import auth from "../utils/auth";
import Login from "./Login";
import Dropdown from 'react-bootstrap/Dropdown';
import NavItem from 'react-bootstrap/NavItem';
import NavLink from 'react-bootstrap/NavLink';


export default function ChargeView() {
    const [state, dispatch] = useStoreContext();
    const [searchCharges, { loading, called }] = useLazyQuery(QUERY_CHARGE_RANGE);
    const [editCharge, setEditCharge] = React.useState(false);
    const [chargeForm, setChargeForm] = React.useState();
    const [deleteCharge] = useMutation(DELETE_CHARGE);
    const [searchForm, setSearchForm] = React.useState();
    const [patchCharge] = useMutation(EDIT_CHARGE);
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
        if(searchedCharges) {
            dispatch({
                type: UPDATE_SEARCHED_CHARGES,
                searchedCharges: searchedCharges.data.getCharges
            })
        }
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
        const chargeToEdit = state.searchedCharges.find((c) => c._id === e.target.id);
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
            const chargeList = state.charges.filter((c) =>  c._id != deletedCharge?._id);
            dispatch({
                type: UPDATE_CHARGES,
                charges: chargeList
            });
        }
    };

    const handleCloseModal = () => {
        setEditCharge(false)
    }

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
                <Accordion  className='accordion-box' defaultActiveKey="0">
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
                                <Button variant='custom' disabled={!searchForm?.startDate || !searchForm?.endDate} className='' onClick={handleChargeSearch}>Search</Button>
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
                        {state?.searchedCharges?.length > 0 ? (state?.searchedCharges?.map((c) => 
                        <div className="card m-3" key={c._id} id={c._id}>
                            <div className="d-flex flex-wrap justify-content-between mt-1 mx-3">
                                    <h4>{c.name}</h4>
                                    <div>
                                        <Dropdown as={NavItem} className='align-items-end'>
                                            <Dropdown.Toggle as={NavLink}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-three-dots" viewBox="0 0 16 16">
                                                    <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"/>
                                                </svg>
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu className='drop-down'>
                                                <Dropdown.Item id={c._id} onClick={handleEditCharge}>Edit</Dropdown.Item>
                                                <Dropdown.Item id={c._id} onClick={handleDeleteCharge}>Delete</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </div>
                                </div>
                            <div className='card-body'>
                                <div className="card-text"><strong className="mr-3">Date:</strong>{`${moment(c.date).format('MM/DD/YYYY')}`}</div>
                                <div className="card-text"><strong>Amount:</strong>{`$${c.amount}`}</div>
                                <div className="card-text"><strong>Budget:</strong>{`${state?.account?.budgets?.find((b) => b._id === c.budgetId)?.name}`}</div>
                            </div>
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