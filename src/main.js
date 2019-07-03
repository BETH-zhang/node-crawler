// var http = require('http');
// 　　http.createServer(function (req, res) {
// 　　  res.writeHead(200, {'Content-Type': 'text/plain'});
//  　　 res.end('Hello World\n');
// 　　}).listen(3000, "127.0.0.1");
// 　　console.log('Server running at http://127.0.0.1:3000/');
// phantomjs
// https://www.jianshu.com/p/d84f2e9321da
const request = require('superagent') // 抓取网页
const cheerio = require('cheerio') // 分析页面
const fs = require('fs')
const express = require('express')
const http = require('http')
const app = express()
const port = 3000
const ip = '127.0.0.1'

const userAgents = require('./userAgent')

app.listen(port, ip)
// app.set('view engine', 'ejs')

// app.set('views', __dirname)
app.get('/', function(req, res) {
  // res.send('hello world')
  res.render('index', {
    title: 'aaa'
  })
})

app.get('/user/:id', function(req, res) {
  res.send('user: ' + req.params.id)
})

const headers = {
  'User-Agent': userAgents[0]
}
app.get('/getJobs/:page', function(req, res, next) {
  // 浏览器发起get请求
  console.log(req.params)
  const page　= req.params.page
  // const url = 'http://www.lagou.com/jobs/list_%E5%89%8D%E7%AB%AF%E5%BC%80%E5%8F%91?kd=%E5%89%8D%E7%AB%AF%E5%BC%80%E5%8F%91&spc=1&pl=&gj=&xl=&yx=&gx=&st=&labelWords=label&lc=&workAddress=&city=%E5%85%A8%E5%9B%BD&requestId=&pn='
  // const url = 'http://www.uskid.com?pn='
 
  request.get('./data.json')
    .set({ 'User-Agent': userAgents[0] })
    .timeout({ response: 5000, deadline: 60000 })
    .end((err, res) => {
      // 处理数据
      if (err) {
        return next(err)
      }
      // headers.Cookie = err.response.headers['set-cookie'].toString()

      console.log('res: ', res)
      // const $ = cheerio.load(res.text)
      res.json(res)
    })

  // 因为网站通过识别cookie来进行反爬虫措施
  // http.get(url + page, headers, function(res) {
  //   let chunks = ''
  //   let size = 0
  //   res.on('data', function(chunk) {
  //     // 监听事件传输
  //     // chunks.push(chunk)
  //     chunks += chunk
  //     size += chunks.length
  //   })

  //   res.on('end', function() {
  //     // 数据传输完
  //     console.log('---', chunks, size)
  //     // const data = Buffer.concat(chunks, size)
  //     const html = chunks.toString()
  //     console.log('===', html, size)
  //     // const html = chunks

  //     const $ = cheerio.load(html)
  //     // console.log('$', $)
  //     const jobs = []

  //     const jobs_list = $('.item_con_list li')
  //     // console.log('jobs_list', jobs_list)
  //     jobs_list.each(function() {
  //       // 对页面岗位栏信息进行处理
  //       const job = {}
  //       job.name = $(this).find('.position .p_top h3').html()
  //       // 公司名
  //       // job.company = $(this).find('.hot_pos_r div').eq(1).find('a').html()
  //       // // 阶段
  //       // job.period = $(this).find('.hot_pos_r span').eq(1).html()
  //       // // 规模
  //       // job.scale = $(this).find('.hot_pos_r span').eq(2).html()
  //       // // 岗位名
  //       // job.name = $(this).find('.hot_pos_l a').attr('title')
  //       // // 岗位链接
  //       // job.name = $(this).find('.hot_pos_l a').attr('href')
  //       // // 岗位
  //       // job.city = $(this).find('.hot_pos_l .c9').html()
  //       // // 岗位所在城市
  //       // job.salary = $(this).find('.hot_pos_l span').eq(1).html()
  //       // // 岗位所需经验
  //       // job.exp = $(this).find('.hot_pos_l span').eq(2).html()
  //       // // 发布时间
  //       // job.time = $(this).find('.hot_pos_l span').eq(5).html()

  //       console.log('------\n' + job)
  //       jobs.push(job)
  //     })

  //     console.log('jobs: ', jobs)
  //     // res.json({
  //     //   jobs: jobs
  //     // })
  //   })
  // })
})

console.log('start express server\n at http://127.0.0.1:3000/')