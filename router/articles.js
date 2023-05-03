// 导入Express模块
const express = require('express')

// 创建一个新的路由器实例
const router = express.Router()

// 引入文章处理函数模块
const articles_handler = require('../router-handler/articles')

// 获取文章列表
router.get('/', articles_handler.Article)

// 发布文章(认证)
router.post('/', articles_handler.addArticle)

// 根据用户id获取文章列表
router.get('/users/:uid', articles_handler.getArticle)

// 根据文章id查看对应文章信息
router.get('/:aid', articles_handler.viewArticle)

// 根据文章id删除文章(认证)
router.delete('/:aid', articles_handler.deleteArticle)

// 根据文章id编辑文章(认证)
router.patch('/:aid', articles_handler.editArticle)

// 将路由器实例作为模块输出
module.exports = router