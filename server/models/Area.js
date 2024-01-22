const { Schema, model } = require('mongoose');

const areaSchema = new Schema(
    {
        name: {
            type: String,
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

const Area = model('Area', areaSchema);
module.exports = Area;