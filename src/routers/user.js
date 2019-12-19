const express = require('express')
const User = require('../models/User')
const auth = require('../middleware/auth')

const router = express.Router()

router.get('/',async (req, res) => {
    res.status(200).send({
        "endpoint": "User",
        "status": "200",
        "version": 1.0
    })
})

// User Sign Up
router.post('/signup', async (req, res) => {

    try {
        const user = new User(req.body)
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (error) {
        res.status(400).send(error)
    }
})

// User Sign In
router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findByCredentials(email, password)
        if (!user) {
            return res.status(401).send({ error: 'Login failed! Check authentication credentials' })
        }
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (error) {
        res.status(400).send(error)
    }

})


// Get Current User
router.get('/me', auth, async (req, res) => {
    // View logged in user profile
    res.send(req.user)
})


//  Update Current User
router.put("/update", auth, async (req, res) => {
    try {
        result = await User.updateUser(req.body,req.user)
        
        res.send(result);

    } catch (error) {
        res.status(500).send(error);
    }



})

// Delete Current User
router.delete("/deactivate", auth, async (req, res) => {
    try {
        var result = await User.deactivateAccount(req.user)
        
        res.send(result);
    } catch (error) {
        res.status(500).send(error);
    }
});



//Logout Current User
router.post('/me/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token
        })
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})

//Logout Of All Devices
router.post('/me/logoutall', auth, async (req, res) => {
    try {
        req.user.tokens.splice(0, req.user.tokens.length)
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router