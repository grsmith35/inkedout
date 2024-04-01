const moment = require('moment')
const { Account, Pay, Bill, Budget, Charge } = require('../models');


function formatDate(day) {
    const date = moment();
    const m = moment().format('M');
    const y = moment().format('YYYY');
    return `${m}/${day}/${y}`;
};

function getDateArray() {
    const datesComing = [];
    const date = moment().format('D');
    const daysInMonth = moment().daysInMonth();
    if(parseInt(date) + 7 > daysInMonth) {
        for(let i = parseInt(date); i <= daysInMonth; i++) {
            datesComing.push(i)
        }
        const numLeft = 7 - datesComing.length;
        for(let i = 1; i <= numLeft; i++) {
            datesComing.push(i)
        }

        //handle end of the month stuff
    } else {
        //handle earlier in the month stuff
        for(let i = 0; i < 7; i++) {
            datesComing.push(parseInt(date) + i)
        }
    }
    return datesComing;
};

function getPayDays() {
    const dayArray = [];
    const today = parseInt(moment().day(Date()).format('d'));
    if(today !== 0) {
        dayArray.push(today);
    }
    while(dayArray.length < 7) {
        if(dayArray[-1] < 7) {
            dayArray.push(dayArray[-1] + 1)
        } 
    };
    for(let i = 0; dayArray.length <= 7; i++) {
        dayArray.push(i);
    };
}

function createArrayWithDate(list) {
    const date = moment().format('D');
    const month = moment().format('M');
    const year = moment().format('YYYY');

    const array = sortArrayByDay(list)

    return array?.map((e) => {
        if(parseInt(e.date) > date) {
            return {
                ...e,
                date: `${month}/${e.date}/${year}`
            }
        } else {
            return {
                ...e,
                date: `${parseInt(month) + 1}/${e.date}/${year}`,
            }
        } 
    })
}

const sortArrayByDay = (array) => {
    array?.sort((a, b) => a.date - b.date);
    return array;
  };

const sumUp = (array) => {
    const sum = array?.reduce((acc, cur) => {
        return acc + cur;
    }, 0);
    return sum
};

const nextPayDate = (pays, datesArr) => {
    const comingPay = [];
    for(let i = 0; i < pays?.length; i++) {
        switch(pays[i].consistency){
            case 'Weekly':
                const payDate = moment().day(pays[i].payDate).add(7, 'days').format('M/D/YYYY');
                comingPay.push({...pays[i], date: payDate});
                break;
            case 'Bi-weekly':
                const payScheduleWeek = (moment(pays[i].payWeek).week())%2 === 0;
                const currentWeek = (moment().week())%2 === 0;
                const weekPayDay = moment().day(pays[i].payDate).format('d');
                const today = moment().day(Date()).format('d');
                if(payScheduleWeek === currentWeek) {
                    if(parseInt(weekPayDay) > parseInt(today)) {
                        const payDate = moment().day(pays[i].payDate).format('M/D/YYYY');
                        comingPay.push({ ...pays[i], date: payDate });
                    }
                } else {
                    if(parseInt(weekPayDay) < parseInt(today)) {
                        const payDate = moment().day(pays[i].payDate).add(7, 'days').format('M/D/YYYY');
                        comingPay.push({ ...pays[i], date: payDate })
                    }
                }
                break;
            case "Bi-monthly":
                const payDays = pays[i].payDate.split(', ');
                const payIntDays = payDays.map((e) => parseInt(e));
                const dates = getDateArray();
                for(let i = 0; i < payIntDays.length; i++) {
                    if(dates.includes(payIntDays[i])) {
                        const payDate = formatDate(payIntDays[i])
                        comingPay.push({...pays[i], date: payDate })
                    }
                }
                break;
            case "Monthly":
                    if(datesArr.includes(parseInt(pays[i].payDate))) {
                        comingPay.push({
                            ...pays[i],
                            date: formatDate(pays[i].payDate)
                        })
                    }
                    break;
        }
    }
    return comingPay;
};

const getBudgetCharges = async (budgetId) => {
    return await Charge.find({ budgetId: budgetId })
};

const getDatesArray = (date, days) => {
    const daysArr = [];
    for(let i = 0; i < days; i++) {
        daysArr.push(parseInt(date) + i)
    };
    return daysArr;
}

const getBudgetRemainder = (charges, budget, days) => {
    const weeklyBudget = budget.timePeriod === 'Monthly' ? budget.amount/4 : budget.amount;
    let budgetStartingAmount = 0;
    switch(budget.timePeriod) {
        case 'Weekly':
            budgetStartingAmount = (budget.amount/7)*days;
            break;
        case 'Bi-weekly':
            budgetStartingAmount = (budget.amount/14)*days;
            break;
        case 'Bi-monthly':
            budgetStartingAmount = (budget.amount/15)*days;
            break;
        case 'Monthly':
            budgetStartingAmount = (budget.amount/30)*days;
            break
    };

    // const bbudget = {
    //     _id: budget._id,
    //     name: budget.name,
    //     amount: weeklyBudget,
    //     charges: charges,
    //     remainingAmount : budgetStartingAmount - charges.map((e) => e.amount).reduce((val, acc) => {
    //         return val + acc;
    //     }, 0)
    // };

    // console.log('in budget creator' , bbudget)

    return {
        _id: budget._id,
        name: budget.name,
        amount: weeklyBudget,
        charges: charges.filter((c) => c.budgetId === budget._id),
        remainingAmount : budgetStartingAmount - charges.map((e) => e.amount).reduce((val, acc) => {
            return val + acc;
        }, 0)
    }

};

const parseIds = (idsString) => {
    const cleanedString = idsString.replace(/[\[/]]/g);
    return cleanedString.split(',')
};

const organizeCharges = async (charges, budgets) => {
    const budgetStatus = budgets?.map((b) => {
        const weeklyBudget = b.timePeriod === 'Monthly' ? b.amount/4 : b.amount;
        const budgetCharges = getBudgetCharges(b.budgetId)
        return {
            _id: b._id,
            name: b.name,
            amount: weeklyBudget,
            charges: charges.filter((c) => c.budgetId === b._id),
            remainingAmount : weeklyBudget - budgetCharges.map((e) => e.amount).reduce((val, acc) => {
                return val + acc;
            }, 0)
        }
    });
    return budgetStatus;
}

module.exports = { organizeCharges, getBudgetRemainder, nextPayDate, sumUp, getPayDays, parseIds, createArrayWithDate, getDatesArray }