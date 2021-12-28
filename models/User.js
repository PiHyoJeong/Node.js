const mongoose = require('mongoose'); //mongoose module 가져오기

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

const User = mongoose.model('User', userSchema) //model(model이름,schema)

module.exports = { User } //model 을 다른 파일에서도 쓰기 위해 export하기