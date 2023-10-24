import React from "react";
import img from '../assets/images/BBB.png'

export default function Header() {

    // return (
    //     <div className="container">
    //         <div className="row header-style">Be Better Budget Tracker</div>
    //     </div>
    // )
    return (
        <header className="bd-header header-style py-3 d-flex align-items-stretch border-bottom border-dark">
            <div className="container-fluid d-flex align-items-center">
                <h1 className="d-flex align-items-center fs-4 text-white mb-0">
                    <img src={img} width='50' height='50' className="me-3" />
                    Be Better Budgeter
                </h1>
            </div>
        </header>
    )
}