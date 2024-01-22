const { Schema, model } = require('mongoose');

const listSchema = new Schema(
    {
        name: {
            type: String,
            require: true,
        },
        accountId: {
            type: Schema.Types.ObjectId,
            require: true,
        },
        items: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Option'
            }
        ]
    },
    {
        toJSON: {
            virtuals: true
        }
    }
);

listSchema.virtual('itemCount').get(function() {
    return this.items.length;
})

const List = model('List', listSchema);
module.exports = List;