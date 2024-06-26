const { Schema, model } = require('mongoose');

const groceryListSchema = new Schema(
    {
        name: {
            type: String,
            require: true,
        },
        areaId: {
            type: Schema.Types.ObjectId,
            require: false,
        },
        listId: {
            type: Schema.Types.ObjectId,
            require: true
        },    
        amount: {
            type: Number,
            require: false
        },
        quantity: {
            type: Number,
            require: false
        },
        optionId: {
            type: Schema.Types.ObjectId,
            require: true
        }
    },
    {
        toJSON: {
            virtuals: true
        }
    }
);

const GroceryList = model('GroceryList', groceryListSchema);
module.exports = GroceryList;