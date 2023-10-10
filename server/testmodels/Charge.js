const { Schema, model } = require('mongoose');

const chargeSchema = new Schema(
    {
        name: {
            type: String,
            require: true,
        },
        date: {
            type: Date,
            require: true,
        },
        amount: {
            type: Number,
            require: true
        },
        budgetId: {
            type: Schema.Types.ObjectId,
            require: true
        },
        accountId: {
            type: Schema.Types.ObjectId,
            require: true
        },    
    },
    {
        toJSON: {
            virtuals: true
        }
    }
);

const Charge = model('Charge', chargeSchema);
module.exports = Charge;