const express = require('express');
const router = express.Router();

// 导入处理文件上传中间件
const multer = require('multer');
const path = require('path');


// 配置 multer 存储引擎
const storage = multer.diskStorage({
  // 设置上传文件的存储目录
  destination: (req, file, cb) => cb(null, 'uploads/images'),
  // 设置上传文件的文件名
  filename: (req, file, cb) => {
    // 获取原始文件名的扩展名
    const ext = path.extname(file.originalname);
    // 使用当前时间戳和原始文件扩展名创建一个新文件名
    const fileName = `${Date.now()}${ext}`;
    // 将新文件名返回给 multer
    cb(null, fileName);
  }
});

// 使用配置好的存储引擎初始化 multer，并设置其只接受名为 "file" 的单个文件
const upload = multer({ storage }).single('file');

// 定义处理文件上传的路由
router.post('/', upload, (req, res) => {
  // 从请求对象中获取上传的文件
  const { file } = req;
  // 创建上传图片的 URL
  const imgUrl = `/images/${file.filename}`;
  res.json({
    code: 1,
    msg: '上传成功',
    data: imgUrl 
  });
});

module.exports = router;

