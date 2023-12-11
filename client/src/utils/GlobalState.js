import React, { createContext, useContext } from 'react';
import { useBudgetReducer } from './reducers';

const StoreContext = createContext();

const { Provider } = StoreContext;

const StoreProvider = ({ value = [], ...props}) => {
    const [state, dispatch] = useBudgetReducer({
        accountId: {},
        account: {},
        charges: [],
        accountSummary: {},
        searchedCharges: []
    });

    return <Provider value={[state, dispatch]} {...props} />;
};

const useStoreContext = () => {
    return useContext(StoreContext);
};

export { StoreProvider, useStoreContext };