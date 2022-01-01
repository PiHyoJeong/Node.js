const mongoose = require('mongoose'); //mongoose module 가져오기
const bcrypt = require('bcrypt')
const saltRounds = 10
const jwt = require('jsonwebtoken');
const userSchema = mongoose.Schema({ //mongoose를 이용하여 schema 생성
    name:{
        type: String,
        maxlength: 50
    },
    email:{
        type: String,
        trim: true, //빈칸 제거
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token:{
        type: String
    },
    tokenExp: {
        type: Number
    }
})

userSchema.pre('save',function(next){
    var user = this;

    if(user.isModified('password')){
        //비밀번호를 암호화 시킨다.
        bcrypt.genSalt(saltRounds,function(err,salt){
            if(err) return next(err)
            bcrypt.hash(user.password,salt,function(err,hash){
                if(err) return next(err)
                user.password=hash
                next()
            })
        })
    }else{
        next()
    }
    
    
})

userSchema.methods.comparePassword = function(plainPassword,cb){
    //plainPassword 1234567 암호화된 비밀번호:
    bcrypt.compare(plainPassword,this.password, function(err,isMatch){
        if(err) return cb(err),
        cb(null,isMatch)
    })
}

userSchema.methods.generateToken = function(cb){
    var user = this;
    console.log('user._id',user._id)
    //jsonwebtoken을 이용해서 token 생성
    var token = jwt.sign(user._id.toHexString(),'secretToken')

    // user._id + 'secretToken' = token
    // ->
    // 'secretToken' -> user._id
     
    user.token = token
    user.save(function(err,user){
        if(err) return cb(err)
        cb(null,user)
    })
}

userSchema.statics.findByToken = function(token,cb){
    var user = this;

    user._id + '' = token
    //token을 decode 한다.
    jwt.verify(token, 'secretToken', function(err,decoded){
        //user id 이용하여 user 찾은 후 client 에서 가져온 token과
        //DB 에 보관된 token이 일치하는지 확인하기

        user.findOne({"_id": decoded, "token": token}, function(err,user){
            if(err) return cb(err);
            cb(null,user)
        })
    })
}

const User = mongoose.model('User', userSchema) //model(model이름,schema)

module.exports = { User } //model 을 다른 파일에서도 쓰기 위해 export하기