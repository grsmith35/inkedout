const { AuthenticationError } = require('apollo-server-express');
const { Account, Pay, Bill, Budget, Charge, Area, GroceryList, GroceryOption, List } = require('../models');
const moment = require('moment');
const { signToken } = require('../utils/auth');
const { nextPayDate, getDatesArray, getBudgetRemainder, parseIds } = require('../utils/helpers');

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
            account.bills = account.bills.filter((b) => getDatesArray(startDate, days).includes(parseInt(b.date)));
            account.pays = account.pays.filter((p) => nextPayDate())
            account.pays = nextPayDate(account?.pays, getDatesArray(startDate, days));
            for(let i = 0; i < account?.budgets?.length; i++) {
                const budgetCharges = await Charge.find({ 
                    accountId: _id, 
                    budgetId: account?.budgets[i]?._id.toString() 
                })
                accountbudgets.push(getBudgetRemainder(budgetCharges.filter((c) => moment(c.date).isAfter(startDateUse) && moment(c.date).isBefore(moment(startDateUse).add(days, 'days'))), account?.budgets[i], days))
            }
            account.budgets = accountbudgets
            return account;
        },
        getAreas: async (parent, { accountId }) => {
            return await Area.find({ accountId: accountId });
        },
        getArea: async (parent, { _id }) => {
            return await Area.findOne({ _id: _id });
        },
        getOptions: async (parent, { accountId }) => {
            return await GroceryOption.find({ accountId: accountId });
        },
        getOptionsByName: async (parent, { accountId, name }) => {
            const accountOptions = await GroceryOption.find({ accountId: accountId })
            // return await context.db.Option.find((o) => o.name.includes(name))
            if(!!name.length) {
                return accountOptions.filter((o) => o.name.toLowerCase().includes(name.toLowerCase()));
            } else return accountOptions;
        },
        getGroceryLists: async (parent, { _id }) => {
            return await GroceryList.find({ accountId: _id });
        },
        getItemsByList: async (parent, { listId }) => {
            return await GroceryList.find({ listId: listId })
        },
        getGroceryList: async (parent, { _id }) => {
            return await GroceryList.findOne({ _id: _id });
        },
        getLists: async (parent, { accountId }) => {
            return await List.find({ accountId: accountId });
        },
        getList: async (parent, { _id }) => {
            return await List.findOne({ _id: _id });
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
        addArea: async (parent, args) => {
            return await Area.create(args);
        },
        editArea: async (parent, args) => {
            return await Area.findOneAndUpdate(
                { _id: args._id },
                { $set: { name: args.name, accountId: args.accountId }},
                { new: true }
            );
        },
        deleteArea: async (parent, { _id }) => {
            return await Area.findOneAndDelete({ _id : _id });
        },
        addOption: async (parent, args) => {
            return await GroceryOption.create(args);
        },
        editOption: async (parent, args) => {
            return await GroceryOption.findOneAndUpdate(
                { _id: args._id },
                { $set: { name: args.name, areaId: args.areaId }},
                { new: true },
            );
        },
        deleteOption: async (parent, { _id }) => {
            return await GroceryOption.findOneAndDelete({ _id : _id });
        },
        addGroceryItem: async (parent, args) => {
            const newItem = await GroceryList.create(args);
            const changedList = await List.findOneAndUpdate(
                { _id: args.listId },
                { $push: { items: newItem._id }},
                { new: true }
            );
            return newItem
        },
        editGroceryItem: async (parent, args) => {
            return await GroceryList.findOneAndUpdate(
                { _id: args._id },
                // { $set: { name: args.name, areaId: args.areaId, listId: args.listId, amount: args.amount }},
                { $set: args },
                { new: true }
            );
            // return await GroceryList.find({ listId: args.listId });
        },
        deleteGroceryItem: async (parent, { _id, listId }) => {
            await List.findOneAndUpdate(
                { _id}
            )
            return await GroceryList.findOneAndDelete({ _id: _id });
        },
        addGroceryOptionAndList: async (parent, { name, areaId, accountId, listId}) => {
            const option = await GroceryOption.create({
                name,
                areaId,
                accountId,
            });
            const item = await GroceryList.create({
                name,
                areaId,
                listId,
                optionId: option._id
            });
            const changedList = await List.findOneAndUpdate(
                { _id: listId },
                { $push: { items: item._id }},
                { new: true }
            );
            return item;
        },
        addList: async (parent, args) => {
            return await List.create(args);
        },
        editList: async (parent, args) => {
            return await List.findOneAndUpdate(
                { _id: args._id },
                { $set: { name: args.name, accoundId: args.accountId }},
                { new: true }
            );
        },
        deleteList: async (parent, { _id }) => {
            return await List.findOneAndDelete({ _id: _id });
        },
        deleteAllGroceryItems: async (parent, { _id, itemsList }) => {
            const ids = parseIds(itemsList);
            const list = List.findOneAndUpdate(
                { _id: _id },
                { $set: { items: [] }},
                { new: true }
            );
            for(let i = 0; i < ids.length; i++) {
                let item = await GroceryList.findOneAndDelete({ _id: ids[i]})
            };
            return list;
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
