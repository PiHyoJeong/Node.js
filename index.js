const express = require('express');
const app = express()
const port = 8080
//User model 가져오기
const { User } = require("./models/User")
//body-parser 가져오기
const bodyParser = require('body-parser')
//cookieparser 가져오기
const cookieParser = require('cookie-parser');
//body-parser 옵션주기 (Server에서 정보를 분석하여 가져올 수 있도록)
app.use(bodyParser.urlencoded({extended: true})); //application/x-www-form-urlencoded
app.use(bodyParser.json()); //application/json
app.use(cookieParser()); //cookieparser 사용할 수 있음
//key.js 가져오기
const config = require('./config/key');
//auth 가져오기
//const { auth } = require('./middleware/auth');
//mongoose를 이용하여 어플리케이션과 mongo db 연결
const mongoose = require('mongoose')
mongoose.connect(config.mongoURI,{
    usenewurlparser: true, useUnifiedTopology: true
}).then(()=>console.log('MongoDb Connected..'))
  .catch(err=>console.log(err))

app.get('/',(req,res)=> res.send('Hello Hyojeong! nodemon 변경'))

//회원가입을 위한 route만들기
app.post('/api/users/register',(req,res) => {
    //Client에서 보내주는 정보들을 DB에 넣어주기


    const user = new User(req.body) //instance만들기 //req.body 안에는 bodyParser 덕분에 json 형식으로 data가 있다.
    user.save((err,userInfo)=>{
        if(err) return res.json({ success: false, err}) //성공하지 못했을 때 성공하지 못했다고 json 형식으로 전달되고 err message도 함께 전달한다.
        return res.status(200).json({ success: true })  //status(200) : 성공했다는 뜻
    })
})

 app.post('/login',(req,res)=>{
     //요청된 이메일을 DB에 있는지 찾는다.
     User.findOne({email:req.body.email},(err,user)=>{
         if(!user){
             return res.json({
                 loginSucces:false,
                 message:"제공된 이메일에 해당하는 user가 없습니다."
             })
         }
         //요청된 이메일이 DB에 있다면 PWD가 맞는 PWD인지 확인
         user.comparePassword(req.body.password,(err,isMatch)=>{ //isMatch : db에 있는 pwd와 입력한 pwd가 일치
             console.log('err',err)
             if(!isMatch) //비밀번호가 틀렸을 경우
             return res.json({loginSuccess: false, message:"비밀번호가 틀렸습니다."})

             //비밀번호가 맞았을 경우. 토큰 생성
             user.generateToken((err,user)=>{
                 if(err) return res.status(400).send(err); //err가 있을 때 clinet에 err전달
                
                 //token을 원하는 곳(쿠키, 로컬스토리지 등. 여기서는 쿠키에 저장)에 저장한다. 
                 res.cookie("x_auth",user.token) //cookie Name에 x_auth 설정. cookie 내용에 user.token 설정.
                 .status(200)
                 .json({loginSuccess:true,userId:user._id})
             })
         })
     })


 })

 
 let auth = (req,res,next)=>{
    //인증처리

    //Client Cookie 에서 Token을 가져온다.
    let token =req.cookies.x_auth;

    //Token을 복호화한 후 유저를 찾는다.
    User.findByToken(token,(err,user)=>{
        if(err) throw err;
        if(!user) return res.json({isAuth:false,error:true}) //user가 없을 때 

        //user 가 있을 때
        req.token = token; //token과 user를 사용하기 위해 req에 담아두기.
        req.user = user;
        next(); //index.js 에서 middleware(auth)에서 계속 진행할 수 있도록 작성
    })

    //유저가 있으면 인증 OK

    //유저가 없으면 인증 NO
}

 app.get('/api/users/auth',auth,(req,res)=>{
     //여기까지 middleware를 통과했다는 얘기는 authentication이 true 라는 말
     res.status(200).json({
         _id: req.user._id,
         isAdmin: req.user.role === 0? false : true, //0이면 일반 user, 0이 아니면 advisor
         isAuth : true,
         email: req.user.email,
         name: req.user.name,
         lastname: req.user.lastname,
         role: req.user.role,
         image: req.user.image

     })
 })

 app.get('/api/users/logout', auth, (req,res)=>{
     User.findOneAndUpdate({_id: req.user._id},//findOneAndUpdate : user을 찾아서 data들을 update 시켜주기
        {token: ""}
    , (err, user) =>{
        if(err) return res.json({success:false, err});
        return res.status(200).send({
            success:true
        })
    }
        ) 
 })

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
