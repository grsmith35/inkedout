import { gql } from '@apollo/client';

export const ACCOUNT_LOGIN = gql`
    mutation login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
            token
            account {
                _id
                name
            }
        }
    }
`;

export const ADD_ACCOUNT = gql`
    mutation addAccount($name: String!, $email: String!, $password: String!) {
        addAccount(name: $name, email: $email, password: $password) {
            _id,
            name,
            email
  }
}
`;

export const EDIT_ACCOUNT = gql`
    mutation editAccount($_id: ID!, $name: String, $email: String) {
        editAccount(_id: $_id, name: $name, email: $email) {
            _id,
            name,
            email
        }
    }
`;

export const EDIT_ACCOUNT_BALANCE = gql`
    mutation editAccount($_id: ID!, $balance: Float!) {
        editAccountBalance(_id: $_id, balance: $balance) {
            _id
            balance
        }
    }
`;

export const DELETE_ACCOUNT = gql`
    mutation deleteAccount($_id: ID!) {
        deleteAccount(_id: $_id) {
            _id
            name
        }
    }
`;

export const ADD_PAY = gql`
    mutation addPay($_id: ID!, $name: String!, $consistency: String!, $source: String!, $amount: Float! $payDate: String, $payWeek: String) {
        addPay(_id: $_id, name: $name, consistency: $consistency, source: $source, amount: $amount, payDate: $payDate, payWeek: $payWeek) {
            _id
            name
            consistency
            source
            amount
            payDate
            payWeek
        }
    }
`;

export const EDIT_PAY = gql`
    mutation editPay($_id: ID!, $name: String, $source: String, $consistency: String, $amount: Float, $payDate: String, $payWeek: String) {
        editPay(_id: $_id, name: $name, source: $source, consistency: $consistency, amount: $amount, payDate: $payDate, payWeek: $payWeek) {
            _id
            name
            source 
            consistency
            amount
            payDate
            payWeek
        }
    }
`;

export const DELETE_PAY = gql`
    mutation deletePay($_id: ID!, $accountId: ID!) {
        deletePay(_id: $_id, accountId: $accountId) {
            _id
            source
            name
        }
    }
`;

export const ADD_BILL = gql`
    mutation addBill($_id: ID!, $name: String!, $date: String!, $source: String!, $amount: Float!, $automated: Boolean!) {
        addBill(_id: $_id, name: $name, date: $date, source: $source, amount: $amount, automated: $automated) {
            _id
            name
            date
            automated
            source
            amount
        }
    }
`;

export const EDIT_BILL = gql`
    mutation editBill($_id: ID!, $name: String, $date: String, $source: String, $amount: Float, $automated: Boolean) {
        editBill(_id: $_id, name: $name, date: $date, source: $source, amount: $amount, automated: $automated) {
            _id
            name
            date
            automated
            source
            amount
        }
    }
`;

export const DELETE_BILL = gql`
    mutation deleteBill($_id: ID!, $accountId: ID!) {
        deleteBill(_id: $_id, accountId: $accountId) {
            _id
            name
            amount
        }
    }
`;

export const ADD_BUDGET = gql`
    mutation addBudget($_id: ID!, $name: String!, $timePeriod: String!, $amount: Float!) {
        addBudget(_id: $_id, name: $name, timePeriod: $timePeriod, amount: $amount) {
            _id
            name
            timePeriod
            amount
        }
    }
`;

export const EDIT_BUDGET = gql`
    mutation editBudget($_id: ID!, $name: String, $timePeriod: String, $amount: Float) {
        editBudget(_id: $_id, name: $name, timePeriod: $timePeriod, amount: $amount) {
            _id,
            name
            timePeriod
            amount
        }
    }
`;

export const DELETE_BUDGET = gql`
    mutation deleteBudget($_id: ID!, $accountId: ID!) {
        deleteBudget(_id: $_id, accountId: $accountId) {
            _id,
            name,
            amount
        }
    }
`;

export const ADD_CHARGE = gql`
    mutation addCharge($name: String!, $amount: Float!, $date: Date!, $budgetId: ID!, $accountId: ID!) {
        addCharge(name: $name, amount: $amount, date: $date, budgetId: $budgetId, accountId: $accountId) {
            _id
            name
            amount
            date
        }
    }
`;

export const EDIT_CHARGE = gql`
    mutation editCharge($_id: ID!, $name: String, $date: String, $amount: Float, $budgetId: ID) {
        editCharge(_id: $_id, name: $name, date: $date, amount: $amount, budgetId: $budgetId) {
            _id
            name
            date
            amount
            budgetId
        }
    }
`;

export const DELETE_CHARGE = gql`
    mutation deleteCharge($_id: ID!) {
        deleteCharge(_id: $_id) {
            _id
        }
    }
`;

export const ADD_USER = gql`
    mutation addAccount($name: String!, $email: String!, $password: String!) {
        addAccount(name: $name, email: $email, password: $password) {
            _id
            email
        }
    }
`
