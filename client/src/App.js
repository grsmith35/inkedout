// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;

import logo from './logo.svg';
import './App.css';
import Login from './pages/Login';
import Header from './Components/Header';
import PayView from './pages/PayView';
import BillView from './pages/BillView';
import BudgetsView from './pages/BudgetsView';
import AddCharge from './pages/AddCharge';
import Home from './pages/Home';
import auth from './utils/auth';
import { ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink, } from '@apollo/client';
  import { setContext } from '@apollo/client/link/context';
  import { BrowserRouter as Router, Routes, Route, Outlet, Link } from 'react-router-dom';
import { StoreProvider } from './utils/GlobalState';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Dropdown from 'react-bootstrap/Dropdown';
import NavItem from 'react-bootstrap/NavItem';
import NavLink from 'react-bootstrap/NavLink';
import AddIcon from './Components/AddIcon';
import ChargeView from './pages/ChargeView';
import BudgetGet from './Components/BudgetGet';
import AddUser from './pages/AddUser';


const httpLink = createHttpLink({
  uri: "http://localhost:3001/graphql",

});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('id_token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <div className="App">
          <Header />
          <StoreProvider>
            <BudgetGet />
              <Routes>
                <Route path='/' element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="Login" element={<Login />} />
                  <Route path="AddCharge" element={<AddCharge />} />
                  <Route path="Bill" element={<BillView />} />
                  <Route path="Pay" element={<PayView />} />
                  <Route path="Budget" element={<BudgetsView />} />
                  <Route path="Charges" element={<ChargeView />} />
                  <Route path="User" element={<AddUser />} />
                  <Route path="*" element={<Home />} />
                </Route>      
              </Routes>
            {/* </BudgetGet> */}
            {/* {auth.loggedIn() ? (<AddIcon />) : (<></>)} */}
            <AddIcon />
            {/* <AddIcon /> */}
          </StoreProvider>
          {/* <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="orange" className="backcolor fixedbutton bi bi-plus-circle" viewBox="0 0 16 16">
            <path className='backcolor' d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
            <path  className='backcolor' d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
          </svg> */}
      </div>
    </ApolloProvider>
  );
}


function Layout() {

  const handleLogout = () => {
    auth.logout()
  };

  return (
    <div>
      {auth.loggedIn() ? (
        <Nav>
          <Dropdown as={NavItem} className='justify-content-start'>
            <Dropdown.Toggle as={NavLink}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-list hamburger" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
              </svg>
            </Dropdown.Toggle>
            <Dropdown.Menu className='drop-down'>
              <Dropdown.Item id="Home"><Link to="/Home" className='nav-link'>Home</Link></Dropdown.Item>
              <Dropdown.Item id="Bill"><Link to="/Bill" className='nav-link'>Bills</Link></Dropdown.Item>
              <Dropdown.Item id="Income"><Link to="/Pay" className='nav-link'>Income</Link></Dropdown.Item>
              <Dropdown.Item id="Budget"><Link to="/Budget" className='nav-link'>Budgets</Link></Dropdown.Item>
              <Dropdown.Item id="Charges"><Link to="/Charges" className='nav-link'>Charges</Link></Dropdown.Item>
              <Dropdown.Item id="Charges"><Link to="/" onClick={handleLogout} className='nav-link'>Log Out</Link></Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          {/* <div className='justify-content-center'>{page}</div> */}
        </Nav>
      ): (<></>)}
      <Outlet />
    </div>
  )
}

export default App;