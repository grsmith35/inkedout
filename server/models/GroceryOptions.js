const { Schema, model } = require('mongoose');

const optionSchema = new Schema(
    {
        name: {
            type: String,
            require: true,
        },
        areaId: {
            type: Schema.Types.ObjectId,
            require: true,
        },
        accountId: {
            type: Schema.Types.ObjectId,
            require: true,
        }
    },
    {
        toJSON: {
            virtuals: true
        }
    }
);

const Option = model('Option', optionSchema);
module.exports = Option;