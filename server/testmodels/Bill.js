const { Schema, model } = require('mongoose');

const billSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        source: {
            type: String,
            required: true
        },
        source: {
            type: String,
            required: true,
        },
        date: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        automated: {
            type: Boolean,
            required: true
        }
    }
);

const Bill = model('Bill', billSchema);
module.exports = Bill;