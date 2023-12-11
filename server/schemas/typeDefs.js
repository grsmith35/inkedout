const { gql } = require('apollo-server');
const { dateScalar } = require('../models/ScalarTypes');

const typeDefs = gql`
    scalar Date

    type Account {
        _id: ID
        name: String!
        email: String!
        password: String!
        balance: Float
        pays: [Pay]   
        bills: [Bill]
        budgets: [Budget]
    }

    type Pay {
        _id: ID
        name: String!
        consistency: String!
        source: String!
        amount: Float!
        payDate: String
        payWeek: String
    }

    type Bill {
        _id: ID
        name: String!
        date: String!
        amount: Float!
        source: String!
        automated: Boolean!
    }

    type Budget {
        _id: ID
        name: String!,
        timePeriod: String!,
        amount: Float!
    }

    type Charge {
        _id: ID
        name: String!,
        amount: Float!
        date: Date!
        budgetId: ID!
        accountId: ID!
    }

    type Query {
        getAccounts: [Account]
        getAccount(_id: ID!): Account
        getBalance: Account
        getBudget(_id: ID!): Budget
        getAllCharges: [Charge]
        getCharges(accountId: ID! startDate: Date, endDate: Date, budgetId: ID): [Charge]
        getAccountSummary(_id: ID!, days: Int!, startDate: String!): Account
    }

    type Auth {
        token: ID!
        account: Account
    }

    type Mutation {
        login(email: String!, password: String!): Auth
        addAccount(name: String!, email: String!, password: String!): Account
        editAccount(_id: ID!, name: String, email: String): Account
        editAccountBalance(_id: ID!, balance: Float!): Account
        deleteAccount(_id: ID!): Account
        addPay(_id: ID!, name: String!, payDate: String, payWeek: String, consistency: String!, source: String!, amount: Float!): Pay
        editPay(_id: ID!, name: String, source: String, payDate: String, payWeek: String consistency: String, amount: Float ): Pay
        deletePay(_id: ID!, accountId: ID!): Pay
        addBill(_id: ID!, name: String!, source: String!, date: String!, amount: Float!, automated: Boolean!): Bill
        editBill(_id: ID!, name: String, source: String, date: String, amount: Float, automated: Boolean): Bill
        deleteBill(_id: ID!, accountId: ID!): Bill
        addBudget(_id: ID!, name: String!, timePeriod: String!, amount: Float!): Budget
        editBudget(_id: ID!, name: String, timePeriod: String, amount: Float): Budget
        deleteBudget(_id: ID!, accountId: ID!): Budget
        addCharge(name: String!, amount: Float!, date: Date!, accountId: ID, budgetId: ID): Charge
        editCharge(_id: ID!, name: String, date: String, amount: Float, budgetId: ID): Charge
        deleteCharge(_id: ID!): Charge
    }
   
`;

module.exports = typeDefs;