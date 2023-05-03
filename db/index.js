// 引入模块
const mongoose = require('mongoose')

// 链接数据库
// mongodb://127.0.0.1数据库地址
// blog 是数据库名，没有就创建，有直接使用这个数据库-数据库我们只需链接一次，有的时候，他会自动连接和断开
mongoose.connect('mongodb://127.0.0.1/blog')
.then(res => {
    console.log('数据库链接成功')
})
.catch( err => {
    console.log(err)
})

// 获取创建的集合（表）模块
const Schema = mongoose.Schema


// 文章表结构
const ArticleSchema = new Schema(
    {
        imageUrl:{ type: String, required: true },     //文章封面，必填
        title: { type: String, require: true },        //文章标题，必填
        content: { type: String, require: true },      //文章内容，必填
        tag: { type: String, require: true },          //文章分类
        author: { type: Schema.Types.ObjectId, ref: "User" },      // author 关联了用户表（User)中的_id, 其值与User模型中的'_id'属性值相同
        views: { type: Number, default: 0}      //文章的浏览量,默认值为0
    },
    {
        //启用时间戳，Mongoose会将createAt和updateAt属性添加到模型中。表中添加一行数据的时候会产生时间戳，记录，数据的创建时间和修改时间
        timestamps: true
    }
)

//ArticleSchema.virtual() 方法用来定义虚拟属性
ArticleSchema.virtual('coms', {
    ref: 'Comment',     //表示该虚拟属性引用了另一个模型 'Comment'，也就是评论模型
    localField: "_id",  //表示该虚拟属性依赖于本模型中的 _id 属性
    foreignField: 'article_id',     //表示该虚拟属性依赖于 'Comment' 模型中的 article_id 属性
    justOne: false      //表示该虚拟属性是一个数组，因为一篇文章可能有多个评论
})
// 下面这两句 只有加上了，虚拟字段才可以显性的看到，不然只能隐性使用
ArticleSchema.set('toObject', { virtuals: true })
ArticleSchema.set('toJSON', { virtuals: true })


// 用户表结构
const UserSchema = new Schema(
    {
        username: { type: String, require: true, unique: true },    //用户名
        password: { type: String, require: true },      //密码
        headImgUrl:{ type: String, required: true }     //头像
    },
    {
        timestamps: true    //启用时间戳
    }
)

// 评论表结构
const CommentSchema = new Schema(
    {
        content: { type: String, require: true },   //评论内容
        article_id: { type: Schema.Types.ObjectId, ref: "Article"}, //评论所属文章id
        reply_user_id: {type: Schema.Types.ObjectId, ref: "User"}   //评论人id
    },
    {
        timestamps: true
    }
)


// 创建数据模型
// 将表绑定到当前数据库上，得到表的构造函数
// 用构造函数可以创建表中的数据，进行CRUD增删改查
//第一个参数 'Article' 表示模型名称，Mongoose 会把它转换成复数形式作为对应的数据库集合名称，所以这里对应的数据库集合名称应该是 'articles'。第二个参数 articleSchema 是该模型对应的数据结构（Schema）对象
const Article = mongoose.model('Article', ArticleSchema)
const User = mongoose.model('User', UserSchema)
const Comment = mongoose.model('Comment', CommentSchema)

// 导出 Article,User,Comment 函数
module.exports = { Article, User, Comment }