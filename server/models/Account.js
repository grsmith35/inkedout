const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');

const accountSchema = new Schema(
    {
        name: {
            type: String,
            require: true
        },
        email: {
            type: String,
            require: true,
            unique: true
        },
        password: {
            type: String,
            require: true,
            trim: true,
            min: [8, 'Password must be atleast 8 characters']
        },
        balance: {
            type: Number,
        },
        pays: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Pay'
            }
        ],
        bills: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Bill'
            }
        ],
        budgets: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Budget'
            }
        ]
    },
    {
        toJSON: {
            virtuals: true
        }
    }
);

accountSchema.pre('save', async function(next) {
    if(this.new || this.isModified('password')) {
        const saltRounds = 10;
        this.password = await bcrypt.hash(this.password, saltRounds);
    }
    next()
})

accountSchema.methods.isCorrectPassword = async function(password) {
    return bcrypt.compare(password, this.password)
}

const Account = model('Account', accountSchema);
module.exports = Account;