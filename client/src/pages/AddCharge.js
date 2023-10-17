import React from "react";

export default function AddCharge() {

    const options = [
        {
            type: 1,
            name: 'Gas'
        },
        {
            type: 2,
            name: 'Groceries'
        }
    ]

    const handleAddChargeSubmit = () => {

    }

    return (
        <div className="container">
            <form onSubmit={handleAddChargeSubmit}>
                <label htmlFor='date' className='row from-label'>Date</label>
                <input id='date' type='date' className='row form-control'></input>
                <label htmlFor='amount' className='row from-label'>Amount</label>
                <input id='amount' type='number' className='row form-control'></input>
                <label htmlFor='name' className='row from-label'>Name</label>
                <input id='name' type='text' className='row form-control'></input>
                <label htmlFor='budget' className='row from-label'>Budget</label>
                <select id='budget'className='row form-select'>
                    {options.map((o) => (
                        <option value={o.type}>{o.name}</option>
                    ))}
                </select>
                <button className='btn btn-primary mt-3'>Add Charge</button>
            </form>
        </div>
    )
}