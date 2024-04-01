import './App.css';
import Login from './pages/Login';
import Header from './Components/Header';
import PayView from './pages/PayView';
import BillView from './pages/BillView';
import BudgetsView from './pages/BudgetsView';
import Home from './pages/Home';
import ListsView from './pages/AccountLists';
import auth from './utils/auth';
import { ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink, } from '@apollo/client';
  import { setContext } from '@apollo/client/link/context';
  import { Routes, Route, Outlet } from 'react-router-dom';
import { StoreProvider } from './utils/GlobalState';
import AddIcon from './Components/AddIcon';
import ChargeView from './pages/ChargeView';
import AddUser from './pages/AddUser';
import GroceryItemsView from './pages/GroceryItemsView';
import AreaView from './pages/AreaView';
import GroceryOptionView from './pages/GroceryOptionsView';

const httpLink = createHttpLink({
  uri: process.env.REACT_APP_SERVER_URL || "http://localhost:3001/graphql",

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
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'no-cache',
      nextFetchPolicy: 'network-only',
    },
  },
});

function App() {
  return (
    <ApolloProvider client={client}>
      <div className="App">
          <Header />
          <StoreProvider>
              <Routes>
                <Route path='/' element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="Login" element={<Login />} />
                  <Route path="Bill" element={<BillView />} />
                  <Route path="Pay" element={<PayView />} />
                  <Route path="Budget" element={<BudgetsView />} />
                  <Route path="Charges" element={<ChargeView />} />
                  <Route path="User" element={<AddUser />} />
                  <Route path="Lists" element={<ListsView />} />
                  <Route path="Areas" element={<AreaView />} />
                  <Route path="GroceryOptions" element={<GroceryOptionView />} />
                  <Route path="GroceryItems/:listId" element={<GroceryItemsView />} />
                  <Route path="*" element={<Home />} />
                </Route>      
              </Routes>
            {auth.loggedIn() ? (<AddIcon />) : (<></>)}
          </StoreProvider>
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
      <Outlet />
    </div>
  )
}

export default App;