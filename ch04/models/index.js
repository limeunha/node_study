const Sequelize = require('sequelize')
const User = require('./user')
const Comment = require('./comment')

const dotenv = require('dotenv')

// .env에서 현재 실행환경(development, test, production 중 하나)을 가져옴
const env = process.env.NODE_ENV || 'development'

//가져온 실행환경에 맞는 db 설정을 가져옴
const config = require('../config/config')[env]
const db = {}
dotenv.config()

//sequelize를 사용해서 데이터베이스 연결 객체 생성
const sequelize = new Sequelize(config.database, config.username, config.password, config)

//db객체를 생성하여 sequelize 객체와 모든 모델들으 저장
db.sequelize = sequelize

//User모델과 Comment 모델을 db 객체에 추가
db.User = User
db.Comment = Comment

//모델을 초기화 하고 데이터베이스와 연결
User.init(sequelize)
Comment.init(sequelize)

//모델간의 관계설정(예-외래키, 연관 테이블 등)
User.associate(db)
Comment.associate(db)

//db객체를 모듈로 내보냄
module.exports = db
