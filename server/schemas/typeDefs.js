const { gql } = require('apollo-server');
const { dateScalar } = require('../models/ScalarTypes');

const typeDefs = gql`
    scalar Date

    enum Order {
        ASC
        DESC
    }

    input SortBy {
        field: String!
        order: Order!
    }

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

    type Area {
        _id: ID
        name: String!
        accountId: ID!
    }

    type Option {
        _id: ID
        name: String!
        areaId: ID!
        accountId: ID!
    }

    type GroceryList {
        _id: ID
        name: String!
        areaId: ID!
        listId: ID!
        optionId: ID!
        amount: Float
        quantity: Int
    }

    type List {
        _id: ID
        name: String!
        accountId: ID!
        items: [Option]
        itemCount: Int
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
        getAreas(accountId: ID!): [Area]
        getArea(_id: ID!): Area
        getOptions(accountId: ID!): [Option]
        getGroceryLists(accountId: ID!): [GroceryList]
        getGroceryList(_id: ID!): GroceryList
        getLists(accountId: ID!): [List]
        getList(listId: ID!): List
        getItemsByList(listId: ID!): [GroceryList]
        getAccount(_id: ID!): Account
        getOptionsByName(accountId: ID!, name: String!): [Option]
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
        addArea(name: String!, accountId: ID!): Area
        editArea(_id: ID!, name: String!): Area
        deleteArea(_id: ID!): Area
        addOption(name: String!, areaId: ID, accountId: ID!): Option
        editOption(_id: ID!, name: String, areaId: ID): Option
        deleteOption(_id: ID!): Option
        addGroceryItem(name: String!, areaId: ID, listId: ID!, amount: Float, optionId: ID!): GroceryList
        editGroceryItem(_id: ID!, name: String, areaId: ID, listId: ID, amount: Float, quantity: Int): GroceryList
        deleteGroceryItem(_id: ID!, listId: ID!): GroceryList
        addList(name: String!, accountId: ID!): List
        editList(_id: ID!, name: String, accountId: ID): List
        deleteList(_id: ID!): List
        addItemToList(listId: ID!, optionId: ID!): List
        removeItemFromList(listId: ID!, optionId: ID!): List
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
        deleteAllGroceryItems(_id: ID!, itemsList: String!): List
    }
   
`;

module.exports = typeDefs;