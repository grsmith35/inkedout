import React from 'react';
import { useLazyQuery, useQuery, useMutation } from '@apollo/client';
import { QUERY_ACCOUNT, QUERY_CHARGE_RANGE } from '../utils/queries';
import { useStoreContext } from "../utils/GlobalState";
import { EDIT_ACCOUNT_BALANCE } from '../utils/mutations';
import Spinner from 'react-bootstrap/Spinner';
import { UPDATE_ACCOUNT, UPDATE_ACCOUNT_BALANCE, UPDATE_CHARGES } from '../utils/actions';
import Table from 'react-bootstrap/Table';
import { formatDate, getDateArray, createArrayWithDate, sumUp, nextPayDate, organizeCharges } from '../utils/helpers';
import accountNumbers from '../utils/congif';
import moment from 'moment';
import ModalForm from '../Components/ModalForm';
import Form from 'react-bootstrap/Form'
import auth from "../utils/auth";
import Login from "./Login";

export default function Home() {
    const [editBalance] = useMutation(EDIT_ACCOUNT_BALANCE)
    const [upcomingBills, setUpcomingBills] = React.useState();
    const [upcomingPay, setUpcomingPay] = React.useState();
    const [remainingAmount, setRemainingAmount] = React.useState();
    const [remaningBudgets, setRemainingBudgets] = React.useState();
    const [editPayModal, setEditPayModal] = React.useState(false);
    const [state, dispatch] = useStoreContext();
    const [balanceForm, setBalanceForm] = React.useState([
        {
            title: "Balance",
            type: 'number',
            name: 'amount',
            value: state?.account?.balance
        }
    ])
    const [periodCharges] = useLazyQuery(QUERY_CHARGE_RANGE);
    const { data, loading, error } = useQuery(QUERY_ACCOUNT, {
        variables: { _id: localStorage.getItem('accountId')}
    });

    const handleSetUpcomingBills = () => {
        const datesComing = getDateArray();
        const weeklyBills = state?.account?.bills?.filter((bill) => datesComing.includes(parseInt(bill.date)));
        const finalBills = createArrayWithDate(weeklyBills);
        setUpcomingBills(() => finalBills);
    };

    const handleSetUpcomingPay = () => {
        const datesComing = getDateArray();
        setUpcomingPay(() => nextPayDate(state?.account?.pays, datesComing))
    };

    const handleEditBalance = () => {
        setEditPayModal(() => true);
    };

    const handlePostBalance = async () => {
        const updatedBalance = await editBalance({ variables: { _id: state?.account?._id, balance: parseFloat(balanceForm[0].value)}});
        if(!!updatedBalance) {
            console.log(updatedBalance)
            dispatch({
                type: UPDATE_ACCOUNT_BALANCE,
                balance: updatedBalance.data.editBalance
            })
            setEditPayModal(() => false);
        }
    };

    const handleCloseModal = () => {
        setEditPayModal(() => false)
    };

    const getCharges = async () => {
        const date = parseInt(moment().day(Date()).format('d'));
        const today = moment().format('MM/DD/YYYY');
        const startSearchDate = moment(today).subtract(date, 'days').format('M/D/YYYY');
        const endSearchDate = moment(startSearchDate).add(7, 'days').format('M/D/YYYY');
        if(state?.account?._id) {

            const charges = await periodCharges({
                variables: {
                    accountId: state?.account?._id,
                    startDate: startSearchDate,
                    endDate: endSearchDate
                }
            });
            dispatch({
                type: UPDATE_CHARGES,
                charges: charges?.data?.getCharges
            });
        }
    };
    
    React.useEffect(() => {
        if(!!data) {
            dispatch({
                type: UPDATE_ACCOUNT,
                account: data.getAccount
            });
            handleSetUpcomingBills();
            handleSetUpcomingPay();
            getCharges();
            
        }
    }, [data]);

    React.useEffect(() => {
        if(state?.charges) {
            setRemainingBudgets(() => organizeCharges(state.charges, state.account.budgets))
        }
    }, [state?.charges])


    if(auth.loggedIn()) {

        return (
            <div>
                {!!editPayModal && (
                    <ModalForm
                        title={'Edit Balance'}
                        fields={balanceForm}
                        editFields={setBalanceForm}
                        submitFunction={handlePostBalance}
                        closeDialog={handleCloseModal}
                    />
                )}
                {loading ? (
                <div>
                    <Spinner animation='border' role='status'>
                        <span className='visually-hidden'>Loading...</span>
                    </Spinner>
                </div>
                ) : (
                    <div className='container'>
                        <div className='mx-auto'>
                            <h3>
                            <Form.Select name={'period-field'}>
                                <option value={'7 Day Look Ahead'}>7 Day Look Ahead</option>
                                <option value={'2 Week Look Ahead'}>2 Week Look Ahead</option>
                                <option value={'1 Month Look Ahead'}>1 Month look Ahead</option>
                            </Form.Select>
                            </h3>
                        </div>
                        {/* <div className='mx-auto'><h3>7 Day Look Ahead</h3></div> */}
                        <hr />
                        <div className='row'>
                            <div className='col'>
                                Expected Balance
                            </div>
                            <div className='col'>
                                <svg onClick={handleEditBalance} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-square me-1" viewBox="0 0 16 16">
                                    <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                    <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                                </svg>
                                ${state?.account?.balance}
                            </div>
                        </div>
                        <hr />
                        <div style={{ backgroundColor: 'red'}}> Non-Automated Bills Due</div>
                        <Table striped bordered hover size='sm'>
                            <tbody>
                                {upcomingBills?.filter((e) => !e.automated)?.map((bill) => (
                                    <tr>
                                        <td>{bill.name}</td>
                                        <td>{bill.date}</td>
                                        <td>${bill.amount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        <div style={{ backgroundColor: 'yellow'}}>Automated Bills Due</div>
                        <Table striped bordered hover size='sm'>
                            <tbody>
                                {upcomingBills?.filter((e) => e.automated)?.map((bill) => (
                                    <tr>
                                        <td>{bill.name}</td>
                                        <td>{bill.date}</td>
                                        <td>${bill.amount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        <hr />
                        <div className='row'>
                            <div className='col'>
                                Balance After Bills
                            </div>
                            <div className='col'>${state?.account?.balance - sumUp(upcomingBills?.map((b) => b.amount))}</div>
                        </div>
                        <hr />
                        <div style={{ backgroundColor: 'green' }}>Upcoming Income</div>
                        <Table striped bordered hover size='sm'>
                            <tbody>
                                {upcomingPay?.map((p) => (
                                    <tr>
                                        <td>{p.name}</td>
                                        <td>{p.date}</td>
                                        <td>${p.amount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        <hr />
                        <div className='row'>
                            <div className='col'>
                                Balance After Income
                            </div>
                            <div className='col'>${state?.account?.balance - sumUp(upcomingBills?.map((b) => b.amount)) + sumUp(upcomingPay?.map((p) => p.amount))}</div>
                        </div>
                        <hr />
                        <div style={{ backgroundColor: 'blue' }}>Budgets</div>
                        <Table striped bordered hover size='sm'>
                            <thead>
                                <tr>
                                    <th>Budget</th>
                                    <th>Weekly Amount</th>
                                    <th>Remaining Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {remaningBudgets?.map((b) => (
                                    <tr>
                                        <td>{b.name}</td>
                                        <td>${b.amount}</td>
                                        <td>${b.remainingAmount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        <hr />
                        <div className='row'>
                            <div className='col'>
                                Balance After Budgets
                            </div>
                            <div className='col'>${state?.account?.balance - sumUp(upcomingBills?.map((b) => b.amount)) + sumUp(upcomingPay?.map((p) => p.amount)) - sumUp(remaningBudgets?.map((b) => {
                                if(b.remainingAmount > 0) {
                                    return b.remainingAmount
                                } else {
                                    return 0
                                }
                                }))}</div>
                        </div>
                        <hr />
                    </div>
                )}
            </div>
        )
    } else { return (
        <Login />
    )}
}