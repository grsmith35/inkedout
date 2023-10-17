import { gql } from '@apollo/client';

export const QUERY_ACCOUNT = gql`
    query getAccount($_id: ID!) {
        getAccount(_id: $_id) {
            _id
            name
            email
            balance
            pays {
                _id
                amount
                name
                source
                consistency
                payDate
                payWeek
            }
            bills {
                _id
                amount
                automated
                source
                name
                date
            }
            budgets {
                _id
                amount
                name
                timePeriod
            }
        }
    }
`;

export const QUERY_CHARGE_RANGE = gql`
    query getCharges($accountId: ID! $startDate: Date, $endDate: Date, $budgetId: ID) {
        getCharges(accountId: $accountId, startDate: $startDate, endDate: $endDate, budgetId: $budgetId) {
            _id,
            name
            amount
            date
            budgetId
        }
    }
`;

export const QUERY_ALL_CHARGES = gql`
    query getAllCharges {
        getAllCharges {
            _id
            name
            amount
            date
            budgetId
        }
    }
`;