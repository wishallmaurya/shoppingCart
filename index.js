const express=require('express')
const multer=require('multer')
const aws=require('aws-sdk')
const mongoose=require('mongoose')
const route = require('./routes/route')
const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.json())


mongoose.connect("mongodb+srv://musharrafansari:XY5t9CKinqT75evR@cluster0.xsylin5.mongodb.net/group11Database", {
    useNewUrlParser: true
})
.then(()=>console.log("mongoDB is connected"))
.catch((error)=>console.log(error))



app.use( multer().any())
app.use('/',route)

app.listen(process.env.PORT || 3000,function(){
    console.log("express app is running on PORT " + (process.env.PORT || 3000))
})