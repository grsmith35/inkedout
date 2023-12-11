import * as React from 'react';
import Table from 'react-bootstrap/Table';
import { getDateArray, getDateArrayWithAmount, createArrayWithDate, sumUp, nextPayDate, organizeCharges } from '../utils/helpers';


export default function SummaryBills(bills, isAutomated, days) {

    const handleGetUpcomingBills = (automated) => {
        let finalBills;
        const datesComing = getDateArrayWithAmount(days);
        const weeklyBills = bills?.filter((bill) => datesComing.includes(parseInt(bill.date)));
        if(automated) {
            finalBills = createArrayWithDate(weeklyBills)?.filter((e) => e.automated)
        } else {
            finalBills = createArrayWithDate(weeklyBills)?.filter((e) => !e.automated)
        }
        if(finalBills?.length > 0) {
            return (
                <>
                    {finalBills.map((bill) => (
                        <tr key={bill.name}>
                            <td>{bill.name}</td>
                            <td>{bill.date}</td>
                            <td>${bill.amount}</td>
                        </tr>
                    ))}
                </>
            )
        } else return <>No upcoming Bills</>
    }


    return (
        <>
            <Table striped bordered hover size='sm'>
                <tbody>
                    {handleGetUpcomingBills(isAutomated)}
                </tbody>
            </Table>
        </>
    )
}