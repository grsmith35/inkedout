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
`;

export const ADD_AREA = gql`
    mutation addArea($name: String!, $accountId: ID!) {
        addArea(name: $name, accountId: $accountId) {
            _id
            accountId
            name
        }
    }
`;

export const EDIT_AREA = gql`
    mutation editArea($_id: ID!, $name: String!) {
        editArea(_id: $_id, name: $name) {
            _id
            accountId
            name
        }
    }
`;

export const DELETE_AREA = gql`
    mutation deleteArea($_id: ID!) {
        deleteArea(_id: $_id) {
            _id
        }
    }
`;

export const ADD_OPTION = gql`
    mutation addOption($name: String!, $areaId: ID!, $accountId: ID!) {
        addOption(name: $name, areaId: $areaId, accountId: $accountId) {
            _id
            name
            areaId
            accountId
        }
    }
`;

export const EDIT_OPTION = gql`
    mutation editOption($_id: ID!, $name: String, $areaId: ID) {
        editOption(_id: $_id, name: $name, areaId: $areaId) {
            _id
            name
            areaId
            accountId
        }
    }
`;

export const DELETE_OPTION = gql`
    mutation deleteOption($_id: ID!) {
        deleteOption(_id: $_id) {
            _id
        }
    }
`;

export const ADD_GROCERY_ITEM = gql`
    mutation addGroceryItem($name: String!, $areaId: ID!, $listId: ID!, $optionId: ID!, $amount: Float) {
        addGroceryItem(name: $name, areaId: $areaId, listId: $listId, optionId: $optionId, amount: $amount) {
            _id
            name
            areaId
            listId
            amount
            optionId
            quantity
        }
    }
`;

export const EDIT_GROCERY_ITEM = gql`
    mutation editGroceryItem($_id: ID!, $name: String, $areaId: ID, $listId: ID, $amount: Float, $quantity: Int) {
        editGroceryItem(_id: $_id, name: $name, areaId: $areaId, listId: $listId, amount: $amount, quantity: $quantity) {
            _id
            name
            amount
            areaId
            listId
            optionId
            quantity
        }
    }
`;

export const DELETE_GROCERY_ITEM = gql`
    mutation deleteGroceryItem($_id: ID!, $listId: ID!) {
        deleteGroceryItem(_id: $_id, listId: $listId) {
            _id
        }
    }
`;

export const ADD_LIST = gql`
    mutation addList($name: String!, $accountId: ID!) {
        addList(name: $name, accountId: $accountId) {
            _id
            name
            accountId
        }
    }
`;

export const EDIT_LIST = gql`
    mutation editList($_id: ID!, $name: String, $accountId: ID) {
        editList(_id: $_id, name: $name, accountId: $accountId) {
            _id
            name
            accountId
        }
    }
`;

export const DELETE_LIST = gql`
    mutation deleteList($_id: ID!) {
        deleteList(_id: $_id) {
            _id
        }
    }
`;

export const DELETE_ALL_LIST_ITEMS = gql`
    mutation deleteAllGroceryItems($_id: ID!, $itemsList: String!) {
        deleteAllGroceryItems(_id: $_id, itemsList: $itemsList) {
            _id
            name
            accountId
            itemCount
            items {
                _id
            }
        }
    }
`
