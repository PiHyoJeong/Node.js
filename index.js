const express = require('express');
const app = express()
const port = 8080
//mongoose를 이용하여 어플리케이션과 mongo db 연결

const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://HyoJeong:abcde1234@cluster0.qzcc8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',{
    usenewurlparser: true, useUnifiedTopology: true
}).then(()=>console.log('MongoDb Connected..'))
  .catch(err=>console.log(err))

app.get('/',(req,res)=> res.send('Hello Hyojeong!'))
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
