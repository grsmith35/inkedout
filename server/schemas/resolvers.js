const { AuthenticationError } = require('apollo-server-express');
const { Account, Pay, Bill, Budget, Charge } = require('../models');
const moment = require('moment');
const { signToken } = require('../utils/auth');
const { nextPayDate, getDatesArray, getBudgetRemainder } = require('../utils/helpers');

const resolvers = {
    Query: {
        getAccount: async (parent, { _id }) => {
            return await Account.findOne({ _id: _id})
            .populate('pays')
            .populate('bills')
            .populate('budgets')
        },
        getAccounts: async () => {
            return await Account.find()
            .populate('pays')
            .populate('bills')
            .populate('budgets')
        },
        getAccountSummary: async (parent, { _id, days, startDate }) => {
            const accountbudgets = [];
            const startDateUse = `${moment().format('MM')}/${startDate}/${moment().format('YYYY')}`
            const account = await Account.findOne({ _id: _id })
            .populate('pays')
            .populate('bills')
            .populate('budgets')
            console.log(days, startDate)
            // const charges = await Charge.find({ accountId: _id });
            account.bills = account.bills.filter((b) => getDatesArray(startDate, days).includes(parseInt(b.date)));
            account.pays = account.pays.filter((p) => nextPayDate())
            account.pays = nextPayDate(account?.pays, getDatesArray(startDate, days));
            for(let i = 0; i < account?.budgets?.length; i++) {
                const budgetCharges = await Charge.find({ 
                    accountId: _id, 
                    budgetId: account?.budgets[i]?._id.toString() 
                })
                // if(!!budgetCharges?.length > 0) {
                //     budgetCharges.filter((c) => {
                //         moment(c.date).isAfter(startDateUse) && moment(c.date).isBefore(moment(startDateUse).add(days, 'days'))
                //     })
                // }
                // console.log(budgetCharges.filter((c) => moment(c.date).isAfter(startDateUse) && moment(c.date).isBefore(moment(startDateUse).add(days, 'days'))))
                accountbudgets.push(getBudgetRemainder(budgetCharges.filter((c) => moment(c.date).isAfter(startDateUse) && moment(c.date).isBefore(moment(startDateUse).add(days, 'days'))), account?.budgets[i], days))
            }
            account.budgets = accountbudgets
            // console.log(startDateUse)
            // const budgets = await organizeCharges(charges, account.budgets)
            // console.log(account)
            return account;
        },
        getBudget: async (parent, { _id }) => {
            return await Budget.findOne({ _id: _id })
            .populate('charges')
        },
        getCharges: async (parent, { budgetId, accountId, startDate, endDate }) => {
            const filter = {
                accountId: accountId,
                ...(!!budgetId && { budgetId: budgetId })
            }
            let charges =  await Charge.find(filter)
            if(!!startDate && !!endDate) {
                charges = charges.filter((ac) => moment(ac.date).isAfter(startDate) && moment(ac.date).isBefore(endDate))
            }
            return charges;
        },
        getAllCharges: async () => {
            const charges =  await Charge.find()
            return charges;
        },
        getBalance: async () => {
            const bankInfo = await fetch('https://www.boredapi.com/api/activity')
            const result = await bankInfo.json();
            console.log(result)
        }
    },
    Mutation: {
        login: async (parent, { email, password }) => {
            const checkEmail = email.toLowerCase();
            const account = await Account.findOne({ email: checkEmail });
            if(!account) {
                throw new AuthenticationError('No user exists with this email');
            }

            const correctPw = await account.isCorrectPassword(password);
            if(!correctPw) {
                throw new AuthenticationError('Incorrect Credentials');
            }

            const token = signToken(account);
            return { token, account }
        },
        addAccount: async (parent, args) => {
            return await Account.create(args)
        },
        editAccount: async (parent, { _id, name, email }) => {
            return await Account.findOneAndUpdate(
                { _id: _id },
                { $set: { name: name, email: email}},
                {new: true, runValidators: true}
            )
        },
        editAccountBalance: async (parent, { _id, balance }) => {
            return await Account.findOneAndUpdate(
                { _id: _id },
                { $set: { balance: !Number.isInteger(balance) ? balance : parseFloat(`${balance.toString()}.00`) }},
                { new: true }
            )
        },
        deleteAccount: async (parent, { _id }) => {
            return await Account.findOneAndDelete({ _id: _id })
        },
        addPay: async (parent, args) => {
            const pay = await Pay.create({
                name: args.name, 
                consistency: args.consistency, 
                source: args.source, 
                amount: !Number.isInteger(args.amount) ? args.amount : parseFloat(`${args.amount.toString()}.00`),
                payDate: args.payDate,
                payWeek: args.payWeek,
            });
            const addAccount = await Account.findOneAndUpdate(
                { _id: args._id },
                { $push: { pays: pay._id }},
                { new: true }
            )
            return pay;
        },
        editPay: async (parent, args) => {
            if(!!Number.isInteger(args.amount)) {
                args.amount = parseFloat(`${args.amount.toString()}.00`)
            }
            return await Pay.findOneAndUpdate(
                { _id: args._id },
                { $set: args },
                { new: true }
            )
        },
        deletePay: async (parent, { _id, accountId }) => {
            const pay = await Pay.findOneAndDelete({ _id: _id });
            const removedPay = Account.findOneAndUpdate(
                { _id: accountId },
                { $pull: { pays: _id }},
                { new: true }
            )
            return pay;
        },
        addBill: async (parent, args) => {
            const bill = await Bill.create({
                name: args.name,
                source: args.source,
                date: args.date,
                amount: !Number.isInteger(args.amount) ? args.amount : parseFloat(`${args.amount.toString()}.00`),
                automated: args.automated
            })
            const addBillToAccount = await Account.findOneAndUpdate(
                { _id: args._id },
                { $push: { bills: bill._id}},
                { new: true }
            )
            return bill;
        },
        editBill: async (parent, args) => {
            if(!!Number.isInteger(args.amount)) {
                args.amount = parseFloat(`${args.amount.toString()}.00`)
            }
            return await Bill.findOneAndUpdate(
                { _id: args._id },
                { $set: args },
                { new: true }
            )
        },
        deleteBill: async (parent, { _id, accountId }) => {
            const bill = await Bill.findOneAndDelete({ _id: _id });
            const removedBill = await Account.findOneAndUpdate(
                { _id: accountId },
                { $pull: { bills: _id }},
                { new: true }
            )
            return bill;
        },
        addBudget: async (parent, args) => {
            const budget = await Budget.create({
                name: args.name,
                timePeriod: args.timePeriod,
                amount: args.amount
            });
            const addBudgetToAccount = await Account.findOneAndUpdate(
                { _id: args._id },
                { $push: { budgets: budget._id }},
                { new: true}
            )
            return budget
        },
        editBudget: async (parent, args) => {
            return await Budget.findOneAndUpdate(
                { _id: args._id },
                { $set: args },
                { new: true }
            )
        },
        deleteBudget: async (parent, { _id, accountId }) => {
            const budget = await Budget.findOneAndDelete({ _id: _id });
            const removeBudget = await Account.findOneAndUpdate(
                { _id: accountId },
                { $pull: { budgets: _id }},
                { new: true }
            )
            return budget;
        }, 
        addCharge: async (parent, args) => {
            const charge = await Charge.create({
                name: args.name,
                date: moment(args.date),
                // budget: args.budget,
                amount: args.amount,
                budgetId: args.budgetId,
                accountId: args.accountId
            });
            // const addCharge = await Budget.findOneAndUpdate(
            //     { _id: args._id },
            //     { $push: { charges: charge._id}},
            //     { new: true}
            // );
            return charge;
        },
        editCharge: async (parent, args) => {
            return await Charge.findOneAndUpdate(
                { _id: args._id },
                { $set: args },
                { new: true }
            )
        },
        deleteCharge: async (parent, { _id }) => {
            const charge = await Charge.findOneAndDelete({ _id: _id });
            // const removeChargeFromBudget = await Budget.findOneAndUpdate(
            //     { _id: accountId },
            //     { $pull: { charges: _id }},
            //     { new: true }
            // )
            return charge;
        }
    }
}


module.exports = resolvers;
