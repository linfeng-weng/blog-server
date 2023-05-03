const express = require('express')
const router = express.Router()
const comment_handler = require('../router-handler/comments')

// 发布评论(认证)
router.post('/', comment_handler.addComment)

// 根据文章id获取文章的评论列表
router.get('/article/:aid', comment_handler.getComment)

// 根据评论id删除评论(认证)
router.delete('/:cid', comment_handler.deleteComment)

module.exports = router