import React from 'react';
import { useLazyQuery } from '@apollo/client';
import { QUERY_ACCOUNT } from '../utils/queries';
import { useStoreContext } from '../utils/GlobalState';
import { UPDATE_ACCOUNT } from '../utils/actions';

export default function BudgetGet() {
    const [state, dispatch] = useStoreContext();
    const [account] = useLazyQuery(QUERY_ACCOUNT);

    const getAccountInfo = async () => {
        const fullAccount = await account({
            variables: {
                _id: state.accountId
            }
        });
        if(!!fullAccount) {
            dispatch({
                type: UPDATE_ACCOUNT,
                account: fullAccount.data.getAccountInfo
            })
        }
    }

    return (
        <>
        </>
    )
}