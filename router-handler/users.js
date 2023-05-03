const { User } = require('../db/index')
// 导入生成token的包
const jwt = require('jsonwebtoken')
// 导入 bcryptjs 对密码进行加密
const bcrypt = require('bcryptjs')


/* 注册 */
exports.userRegister = async (req, res) => {
    const { username, password, headImgUrl } = req.body
    // 判断参数是否为空
    if( !username || !password || !headImgUrl) {
        return res.json({
            code: 0,
            msg: '注册失败，缺少参数'
        })
    }

    try {
        // 检查是否已经存在该用户名
        const user = await User.findOne({ username })
        if(user) {
            return res.json({
                code: 0,
                msg: '注册失败，用户名已经存在'
            })
        }

        // 对密码进行加密
        const hashedPassword = await bcrypt.hash(password, 10)

        // 创建用户
        const newUser = await User.create({ username, password: hashedPassword, headImgUrl })
        return res.json({
            code: 1,
            msg: '注册成功',
            // data: newUser
        })
    } catch (err) {
        return res.json({
            code: 0,
            msg: '注册失败',
            err: err.message
        })
    }
}



/* 登录 */
exports.userLogin = async (req, res) => {
    const { username, password } = req.query

    try {
        // 查找用户
        const user = await User.findOne({ username })

        // 判断用户是否存在
        if( !user ) {
            return res.json({
                code: 0,
                msg: '用户不存在'
            })
        }

        // 比较密码是否一致,不一致则返回false
        const match = await bcrypt.compare(password, user.password)

        // 密码不一致时
        if(!match) {
            return res.json({
                code: 0,
                msg: '密码不正确'
            })
        }

        // 生成token
        const token = jwt.sign({ username: user.username, uid: user._id }, 'blog123', {
            expiresIn: '30d',       //有效期
            algorithm: 'HS256'
        })

        // 返回用户信息和token
        return res.json({
            code: 1,
            msg: '登录成功',
            token,
            uid: user._id,
            username: user.username,
            headImgUrl: user.headImgUrl,
        })

    } catch(err) {
        return res.json({
            code: 0,
            msg: '登录失败',
            err: err.message
        })
    }
}