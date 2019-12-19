const express = require('express')
const userRouter = require('./src/routers/user')
const port = process.env.PORT
const db = require('./src/db/db')
const llg = require("llg").llg

const app = express()

app.use(express.json())
app.use('/v1/users',userRouter)

//connect to mongodb[failed]
db.on('error', function() {
    llg("Connetion errror!")
})

//connect to mongodb[success]
db.once('open', function() {
 llg("Connected to database...")
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})