import React from "react";
import img from '../assets/images/BBB.png'
import Nav from 'react-bootstrap/Nav';
import Dropdown from 'react-bootstrap/Dropdown';
import NavItem from 'react-bootstrap/NavItem';
import NavLink from 'react-bootstrap/NavLink';
import auth from '../utils/auth';
import { Link } from 'react-router-dom';


export default function Header() {

    const handleLogout = (event) => {
      event.preventDefault();
      auth.logout();
    }

    return (
        <header className="bd-header header-style py-3 d-flex mb-3 align-items-stretch border-bottom border-dark">
            <div className="container-fluid d-flex align-items-center">
                <h1 className="d-flex align-items-center fs-4 text-white mb-0">
                  <Link to="/Home" className="App-header-link">
                      <img src={img} width='50' height='50' className="me-3" />
                      Be Better Budgeter
                    </Link>
                </h1>
            </div>
            {auth.loggedIn() && (
              <Nav>
                <Dropdown as={NavItem} className='align-items-end'>
                  <Dropdown.Toggle as={NavLink}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" className="bi bi-list hamburger" viewBox="0 0 16 16">
                      <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
                    </svg>
                  </Dropdown.Toggle>
                  <Dropdown.Menu className='drop-down'>
                    <Dropdown.Item id="Home"><Link to="/Home" className='nav-link'>Summary</Link></Dropdown.Item>
                    <Dropdown.Item id="Bill"><Link to="/Bill" className='nav-link'>Bills</Link></Dropdown.Item>
                    <Dropdown.Item id="Budget"><Link to="/Budget" className='nav-link'>Budgets</Link></Dropdown.Item>
                    <Dropdown.Item id="Charges"><Link to="/Charges" className='nav-link'>Charges</Link></Dropdown.Item>
                    <Dropdown.Item id="Lists"><Link to="/Lists" className='nav-link'>Lists</Link></Dropdown.Item>
                    <Dropdown.Item id="Income"><Link to="/Pay" className='nav-link'>Income</Link></Dropdown.Item>
                    <Dropdown.Item id="Areas"><Link to="/Areas" className="nav-link">Areas</Link></Dropdown.Item>
                    <Dropdown.Item id="GroceryOptions"><Link to="/GroceryOptions" className="nav-link">Grocery Options</Link></Dropdown.Item>
                    <Dropdown.Item id="Logout"><Link to="/" onClick={handleLogout} className='nav-link'>Log Out</Link></Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
            </Nav>
            ) }
            
        </header>
    )
}