const express=require('express')
const multer=require('multer')
const mongoose=require('mongoose')
const route = require('./routes/route')

const app = express()
app.use(express.json())


mongoose.connect("mongodb+srv://wishall:vishal@atlascluster.p9u9uvd.mongodb.net/cartDatabase?retryWrites=true&w=majority", {
})
.then(()=>console.log("mongoDB is connected"))
.catch((error)=>console.log(error))



app.use( multer().any())
app.use('/',route)

app.listen(3000,function(){
    console.log("express app is running on PORT " + (3000))
})