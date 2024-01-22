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

export const QUERY_ACCOUNT_SUMMARY = gql`
    query getAccountSummary($_id: ID!, $days: Int!, $startDate: String!) {
        getAccountSummary(_id: $_id, days: $days, startDate: $startDate) {
            _id
            name
            email
            balance
            bills {
                _id
                name
                source
                date
                amount
                automated
            }
            pays {
                _id
                name
                consistency
                source
                amount
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

export const QUERY_AREAS = gql`
    query getAreas($accountId: ID!) {
        getAreas(accountId: $accountId) {
            _id
            accountId
            name
        }
    }
`;

export const QUERY_OPTIONS = gql`
    query getOptions($accountId: ID!) {
        getOptions(accountId: $accountId) {
            _id
            name
            areaId
        }
    }
`;

export const QUERY_ACCOUNT_LISTS = gql`
    query getLists($accountId: ID!) {
        getLists(accountId: $accountId) {
            _id
            name
            accountId
            itemCount
        }
    }
`;

export const QUERY_LIST_ITEMS = gql`
    query getList($listId: ID!) {
        getList(listId: $listId) {
            _id
            name
            items {
                name
                _id
                areaId
            }
            itemCount
        }
    }
`;

export const QUERY_ITEMS_BY_LIST = gql`
    query getItemsByList($listId: ID!) {
        getItemsByList(listId: $listId) {
            _id
            name
            amount
            areaId
        }
    }
`;