const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = mongoose.Schema({
    fname: {
        type: String,
        required: false,
        trim: true
    },
    lname: {
        type: String,
        required: false,
        trim: true
    },
    fullname: {
        type: String,
        required: false,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: value => {
            if (!validator.isEmail(value)) {
                throw new Error({ error: 'Invalid Email address' })
            }
        }
    },
    password: {
        type: String,
        required: true,
        minLength: 7
    },
    reg_date: {
        type: Date,
        default: Date.now
    },

    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]

})

userSchema.pre('save', async function (next) {
    // Hash the password before saving the user model
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
        user.fullname = user.fname + " " + user.lname

    }


    next()
})


userSchema.methods.generateAuthToken = async function () {
    // Generate an auth token for the user
    const user = this
    const token = jwt.sign({ _id: user._id }, process.env.JWT_KEY)
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}

userSchema.statics.findByCredentials = async (email, password) => {
    // Search for a user by email and password.
    const user = await User.findOne({ email })
    if (!user) {
        throw new Error({ error: 'Invalid login credentials' })
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password)
    if (!isPasswordMatch) {
        throw new Error({ error: 'Invalid login credentials' })
    }
    return user
}

// Update logged in user
userSchema.statics.updateUser = async (updatedUser,user) => {
    var user = await User.findById({ _id: user._id }).exec();
    user.set(updatedUser);
    var result = await user.save();
    return result
}

// Delete logged in user
userSchema.statics.deactivateAccount = async (user) => {
    var result = await User.deleteOne({ _id: user._id }).exec();
    return result
}

const User = mongoose.model('User', userSchema)

module.exports = User