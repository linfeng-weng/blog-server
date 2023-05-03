const { log } = require('console')
const { Article, Comment } = require('../db/index')
const fs = require('fs')
const path = require('path')

/* 获取文章列表 */
exports.Article = async (req, res) => {
    try {
        // 设置分页参数(back)
        const limit = Number(req.query.limit) || 6
        const skip = Number(req.query.page) * limit || 0

        const article = await Article.find()
            .populate('author', '-password')    // 将author信息查询并填充到查询结果中，忽略password字段
            .populate('coms')       // 将评论信息填充到查询结果中
            .skip(skip)         //跳过skip数量的数据
            .limit(limit)       //限制查询结果的数量    
        
        return res.json({
            code: 1,
            msg: '获取文章成功',
            data: article   
        })
    } catch (err) {
        return res.json({
            code: 0,
            msg: '获取文章失败',
            err: err.message
        })
    }
}

/* 发布文章 */
exports.addArticle = async (req, res) => {
    try {
        const { imageUrl, title, content, tag } = req.body

        // 验证文章封面、标题、内容、分类是否符合要求
        if(!imageUrl) {
            return res.json({
                code: 0,
                msg: '文章封面不能为空'
            })
        }
        if(!title) {
            return res.json({
                code: 0,
                msg: '文章标题不能为空'
            })
        }
        if(!content) {
            return res.json({
                code: 0,
                msg: '文章内容不能为空'
            })
        }
        if(!tag) {
            return res.json({
                code: 0,
                msg: '文章分类不能为空'
            })
        }

        // 创建新文章
        const article = await Article.create({
            ...req.body,
            author: req.auth.uid
        })

        return res.json({
            code: 1,
            msg: '发布文章成功',
            data: article
        })

    } catch (err) {
        return res.json({
            code: 0,
            msg: '发布文章失败',
            err: err.message
        })
    }
}

/* 根据用户id获取文章列表 */
exports.getArticle = async (req, res) => {
    try {
        const { uid } = req.params
        
        // 设置分页参数(back)
        // const limit = Number(req.query.limit) || 6
        // const skip = Number(req.query.page) * limit || 0

        const articles = await Article.find({ author: uid })
            .sort({ createAt: -1 })
            .populate('author', '-password')
            .populate('coms')
            // .skip(skip)
            // .limit(limit)

        return res.json({
            code: 1,
            msg: '获取文章列表成功',
            data: articles
        })

    } catch (err) {
        return res.json({
            code: 0,
            msg: '获取文章列表失败',
            err: err.message
        })
    }
}

/* 根据文章id查看对应文章信息 */
exports.viewArticle = async (req, res) => {
    try {
        // 根据文章id查询并更新数据(views)
        const articles = await Article.findByIdAndUpdate(
            req.params.aid,
            { $inc: {views: 1} },   //views增加1
            { new: true }   //查询最新的结果
        )
            .populate('author', '-password')
            .populate({
                path: 'coms',
                populate: {
                    path: 'reply_user_id',
                    select: '-password'
                }
            })
            

        return res.json({
            code: 1,
            msg: '查看文章成功',
            data: articles
        })

    } catch (err) {
        return res.json({
            code: 0,
            msg: '查看文章失败',
            err: err.message
        })
    }
}

/* 根据文章id删除文章 */
exports.deleteArticle = async (req, res) => {
    try {
        const article = await Article.findById(req.params.aid)
        
        if(article.author.toString() !== req.auth.uid) {
            return res.json({
                code: 0,
                msg: '无权删除'
            })
        }

        // 删除文章
        await Article.findByIdAndDelete(req.params.aid)
        // 删除文章对应的评论内容
        await Comment.deleteMany({"article_id" : req.params.aid})

        // 删除存储在项目文件夹的文章封面图片
        const imagePath = path.join(__dirname, '..', 'uploads', article.imageUrl)
        fs.unlinkSync(imagePath)

        return res.json({
            code: 1,
            msg: '删除文章成功',
        })

        

    } catch (err) {
        return res.json({
            code: 0,
            msg: '删除文章失败',
            err: err.message
        })
    }
}

/* 根据文章id编辑文章 */
exports.editArticle = async (req, res) => {
    try {
        // 验证是否有权限编辑
        const article = await Article.findById(req.params.aid)
        if(article.author.toString() !== req.auth.uid) {
            return res.json({
                code: 0,
                msg: '无权编辑'
            })
        }

        const { imageUrl, title, content, tag } = req.body

        // 验证文章封面、标题、内容、分类是否符合要求
        if(!imageUrl) {
            return res.json({
                code: 0,
                msg: '文章封面不能为空'
            })
        }
        if(!title) {
            return res.json({
                code: 0,
                msg: '文章标题不能为空'
            })
        }
        if(!content) {
            return res.json({
                code: 0,
                msg: '文章内容不能为空'
            })
        }
        if(!tag) {
            return res.json({
                code: 0,
                msg: '文章分类不能为空'
            })
        }

        // 上传了新的封面图片就删除原来存储在本地的图片
        if(imageUrl != article.imageUrl) {
            const imagePath = path.join(__dirname, '..', 'uploads', article.imageUrl)
            fs.unlinkSync(imagePath)
        }

        const newArticle = await Article.findByIdAndUpdate(
            req.params.aid,
            { ...req.body },
            { new: true }
        )

        return res.json({
            code: 1,
            msg: '编辑文章成功',
            data: newArticle
        })
        
    } catch (err) {
        return res.json({
            code: 0,
            msg: '编辑文章失败',
            err: err.message
        })
    }
}