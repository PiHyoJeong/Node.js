const express = require('express');
const app = express()
const port = 8080
//User model 가져오기
const { User } = require("./models/User")
//body-parser 가져오기
const bodyParser = require('body-parser')
//body-parser 옵션주기 (Server에서 정보를 분석하여 가져올 수 있도록)
app.use(bodyParser.urlencoded({extended: true})); //application/x-www-form-urlencoded
app.use(bodyParser.json()); //application/json
//key.js 가져오기
const config = require('./config/key');
console.log(config)
//mongoose를 이용하여 어플리케이션과 mongo db 연결
const mongoose = require('mongoose')
mongoose.connect(config.mongoURI,{
    usenewurlparser: true, useUnifiedTopology: true
}).then(()=>console.log('MongoDb Connected..'))
  .catch(err=>console.log(err))

app.get('/',(req,res)=> res.send('Hello Hyojeong! nodemon 변경'))

//회원가입을 위한 route만들기
app.post('/register',(req,res) => {
    //Client에서 보내주는 정보들을 DB에 넣어주기


    const user = new User(req.body) //instance만들기 //req.body 안에는 bodyParser 덕분에 json 형식으로 data가 있다.
    user.save((err,userInfo)=>{
        if(err) return res.json({ success: false, err}) //성공하지 못했을 때 성공하지 못했다고 json 형식으로 전달되고 err message도 함께 전달한다.
        return res.status(200).json({ success: true })  //status(200) : 성공했다는 뜻
    })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
