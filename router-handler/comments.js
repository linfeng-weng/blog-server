const { Comment, Article } = require('../db/index')


/* 发布评论 */
exports.addComment = async (req, res) => {
    try {
        const { content, article_id } = req.body
        if(!content) {
            return res.json({
                code: 0,
                msg: '评论内容不能为空'
            })
        }

        const comment = await Comment.create({
            content,
            article_id,
            reply_user_id: req.auth.uid
        })

        return res.json({
            code: 1,
            msg: '发布评论成功',
            data: comment
        })

    } catch (err) {
        return res.json({
            code: 0,
            msg: '发布评论失败',
            err: err.message
        })
    }
}

/* 根据文章id获取文章的评论列表 */
exports.getComment = async (req, res) => {
    try {
        const comment = await Comment.find({ article_id: req.params.aid })
            .populate('reply_user_id', '-password')
        return res.json({
            code: 1,
            msg: '获取评论列表成功',
            data: comment
        })

    } catch (err) {
        return res.json({
            code: 0,
            msg: '获取评论列表失败',
            err: err.message
        })
    }
}

/* 根据评论id删除评论 */
exports.deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.cid)
            .populate('article_id') //back

        const author_id = await comment.article_id.author.toString()
        if(author_id !== req.auth.uid) {
            return res.json({
                code: 0,
                msg: '无权删除'
            })
        }

        await Comment.findByIdAndDelete(req.params.cid)
        return res.json({
            code: 1,
            msg: '删除评论成功'
        })

    } catch (err) {
        return res.json({
            code: 0,
            msg: '删除评论失败',
            err: err.message
        })
    }
}