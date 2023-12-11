import { useReducer } from "react";
import { UPDATE_ACCOUNT, UPDATE_SEARCHED_CHARGES, UPDATE_ACCOUNT_BALANCE, UPDATE_ACCOUNT_SUMMARY_BUDGETS, UPDATE_ACCOUNT_SUMMARY_INCOME, UPDATE_ACCOUNT_SUMMARY_BILLS, UPDATE_ACCOUNT_SUMMARY_CHARGES, UPDATE_ACCOUNT_ID, UPDATE_ACCOUNT_BILLS, UPDATE_ACCOUNT_PAYS, UPDATE_ACCOUNT_BUDGETS, UPDATE_CHARGES } from "./actions";

export const reducer = (state, action) => {
    switch(action.type) {
        case UPDATE_ACCOUNT:
            return {
                ...state,
                account: action?.account
            }
        case UPDATE_ACCOUNT_ID:
            return {
                ...state,
                accountId: action.accountId
            }
        case UPDATE_ACCOUNT_BILLS:
            return {
                ...state,
                account: {
                    ...state?.account,
                    bills: action.bills
                }
            }
        case UPDATE_ACCOUNT_PAYS:
            return {
                ...state,
                account: {
                    ...state?.account,
                    pays: action.pays
                }
            }
        case UPDATE_ACCOUNT_BUDGETS:
            return {
                ...state,
                account: {
                    ...state?.account,
                    budgets: action.budgets
                }
            }
        case UPDATE_CHARGES:
            return {
                ...state,
                charges: action.charges
            }
        case UPDATE_ACCOUNT_BALANCE:
            return {
                ...state,
                account: {
                    ...state?.account,
                    balance: action.balance
                }
            }
        case UPDATE_ACCOUNT_SUMMARY_CHARGES:
            return {
                ...state,
                accountSummary: {
                    ...state?.accountSummary,
                    charges: action.charges
                }
            }
        case UPDATE_ACCOUNT_SUMMARY_BILLS:
            return {
                ...state,
                accountSummary: {
                    ...state?.accountSummary,
                    bills: action.bills
                }
            }
        case UPDATE_ACCOUNT_SUMMARY_BUDGETS:
            return {
                ...state,
                accountSummary: {
                    ...state?.accountSummary,
                    budgets: action.budgets
                }
            }
        case UPDATE_ACCOUNT_SUMMARY_INCOME:
            return {
                ...state,
                accountSummary: {
                    ...state?.accountSummary,
                    income: action.income
                }
            }
        case UPDATE_SEARCHED_CHARGES:
            return {
                ...state,
                searchedCharges: action.searchedCharges
            }
        default:
            return state
    }
}

export function useBudgetReducer(initialState) {
    return useReducer(reducer, initialState)
}