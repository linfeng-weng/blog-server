// 导入express模块
const express = require('express')

// 导入Node.js的path模块
const path = require('path')

// 创建express服务器实例
const app = express()

// 配置跨域中间件
const cors = require('cors')

// 用于解析http请求体
const bodyParser = require('body-parser')

// 配置解析token中间件
const { expressjwt } = require('express-jwt')



app.use(cors())

// 解析表单数据的中间件,这个中间件，解析 application/x-www-form-urlencoded 格式的表单
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

// 将uploads文件夹设置为静态文件夹，可供外部直接访问
app.use(express.static(path.join(__dirname, 'uploads')))

// 解析jwt  jwt验证通过，会在req添加user属性，可以在req.user中访问到用户信息
app.use(
    expressjwt({
      secret: 'blog123',
      algorithms: ['HS256']   //对称加密方法
    }).unless({
      path:[
        '/api/users',
        '/api/upload', 
        /^\/api\/articles\/users\/\w+/,
        /\/api\/comments\/article\/\w+/,
        {
          url: '/api/articles',
          method:['GET']
        },
        {
          url: /^\/api\/articles\/\w+/,
          methods: ['GET']
        }, 
      ]
    })
  )


// 导入使用处理图片路由模块
const uploadRouter = require('./router/uploads')
app.use('/api/upload', uploadRouter)
// 导入并使用用户路由模块
const usersRouter = require('./router/users')
app.use('/api/users', usersRouter)
// 导入并使用文章路由模块
const articlesRouter = require('./router/articles')
app.use('/api/articles', articlesRouter)
// 导入并使用评论路由模块
const commentsRouter = require('./router/comments')
app.use('/api/comments', commentsRouter)





// 定义错误级别中间件
app.use((err, req, res, next) => {
    const errorLevels = {
        400: 'Bad Request',
        401: 'Unauthorized',
        403: 'Forbidden',
        404: 'Not Found',
        500: 'Internal Server Error',
        503: 'Service Unavailable'
      };
    
      const statusCode = err.status || 500;
      const errorLevel = errorLevels[statusCode] || 'Unknown Error';
    
      console.error(err.stack);
    
      res.status(statusCode).json({
        error: {
          level: errorLevel,
          message: err.message
        }
      });
})

// 调用app.listen方法，指定端口号并启动web服务器
app.listen(3000, () => {
    console.log('blog-server running at http://127.0.0.1:3000')
})