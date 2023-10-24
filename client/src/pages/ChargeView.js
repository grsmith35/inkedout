import React from 'react';
import { useStoreContext } from '../utils/GlobalState';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import Accordion from 'react-bootstrap/Accordion';
import { QUERY_CHARGE_RANGE, QUERY_ALL_CHARGES } from '../utils/queries';
import { EDIT_CHARGE, DELETE_CHARGE } from '../utils/mutations';
import { UPDATE_CHARGES } from '../utils/actions';
import moment from 'moment/moment';
import ModalForm from '../Components/ModalForm';
import accountNumbers from '../utils/congif';
import auth from "../utils/auth";
import Login from "./Login";

export default function ChargeView() {
    const [state, dispatch] = useStoreContext();
    const [searchCharges] = useLazyQuery(QUERY_CHARGE_RANGE);
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
                        <Accordion.Header>Search Criteria</Accordion.Header>
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
                                <Button variant="primary" className='green-color' onClick={handleChargeSearch}>Search</Button>
                            </Form>
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>
                {state?.charges?.length > 0 && (state?.charges?.map((c) => 
                    <div className="card m-3" key={c._id} id={c._id}>
                    <div className="card-title"><h3>{c.name}</h3></div>
                    <hr />
                    <div className="card-text"><strong className="mr-3">Date:</strong>{`${moment(c.date).format('MM/DD/YYYY')}`}</div>
                    <div className="card-text"><strong>Amount:</strong>{`$${c.amount}`}</div>
                    <div className="card-text"><strong>Budget:</strong>{`${state?.account?.budgets?.find((b) => b._id === c.budgetId).name}`}</div>
                    <Button variant="primary" id={c._id} onClick={handleEditCharge}>Edit Charge</Button>
                    <Button variant="danger" id={c._id} onClick={handleDeleteCharge}>Delete Charge</Button>
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