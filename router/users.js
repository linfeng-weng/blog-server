const express = require('express')
const router = express.Router()
const users_handler = require('../router-handler/users')

// 注册请求
router.post('/', users_handler.userRegister)

// 登录请求
router.get('/', users_handler.userLogin)

module.exports = router