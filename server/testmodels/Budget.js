const { Schema, model } = require('mongoose');

const budgetSchema = new Schema(
    {
        name: {
            type: String,
            require: true,
        },
        timePeriod: {
            type: String,
            require: true,
        },
        amount: {
            type: Number,
            require: true
        },
        // charges: [
        //     {
        //         type: Schema.Types.ObjectId,
        //         ref: 'Charge'
        //     }
        // ]
    },
    {
        toJSON: {
            virtuals: true
        }
    }
);

const Budget = model('Budget', budgetSchema);
module.exports = Budget;