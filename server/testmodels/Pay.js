const { Schema, model } = require('mongoose');

const paySchema = new Schema(
    {
        name: {
            type: String,
            require: true
        },
        consistency: {
            type: String,
            require: true
        },
        source: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        payDate: {
            type: String
        },
        payWeek: {
            type: String
        }
    },
    {
        toJSON: {
            virtuals: true
        }
    }
);

const Pay = model('Pay', paySchema);
module.exports = Pay;