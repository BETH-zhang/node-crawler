const superagent = require('superagent') // 抓取网页
const cheerio = require('cheerio') // 分析页面
const fs = require('fs')
const http = require('http')
const https = require('https')
const request = require('request');
const port = 3000
const ip = '127.0.0.1'
const userAgents = require('./userAgent')
const Entities = require('html-entities').XmlEntities;
const entities = new Entities();
const co = require('co');

const express = require('express')
const app = express()
const config = require('./config.js')
const html2markdown = require('html2markdown');

app.listen(port, ip)
app.set('view engine', 'ejs')
app.set('views', __dirname)

app.get('/', function(req, res) {
  // res.send('hello world')
  res.render('index', {
    htmlContent: '<div>111</div>'
  })

  // co(fetch).then((res) => {
  //   console.log('res', res)
  //   res.render('index', {
  //     htmlContent: res
  //   })
  // })
})

app.get('/article',  function(req, res) {
  co(getContent, config.articleUrl).then((html) => {
    co(doSomeThingInList, html).then((data) => {
      res.render('index', {
        htmlContent: JSON.stringify(data) 
      }) 
    })
  })
})

app.get('/tags', function(req, res) {
  config.tagsUrl.forEach(function(item) {
    ((tagUrl) => {
      co(getContent, tagUrl).then((html) => {
        // console.log('html', html)
        // const tags = doSomeThingInTags(html)
        // const url = 'https://www.uskid.com/tags/' + encodeURIComponent(tags[19].replace('https://www.uskid.com/tags/', ''))
        // co(getContent, url).then((html) => {
        //   co(doSomeThingInList, html)
        // }) 
        co(doSomeThingInList, html)
      })
    })(item)
  })

  res.render('index', {
    htmlContent: 'loading'
  })
})

function getContent(url) {
  console.log(url)
  return new Promise((resolve) => {
    const headers = {
      'User-Agent': userAgents[0]
    }
  
    // 因为网站通过识别cookie来进行反爬虫措施
    https.get(url, headers, function(res) {
      let chunks = ''
      let size = 0
      res.on('data', function(chunk) {
        // 监听事件传输
        // chunks.push(chunk)
        chunks += chunk
        size += chunks.length
      })
  
      res.on('end', function() {
        // 数据传输完
        // console.log('---', chunks, size)
        // const data = Buffer.concat(chunks, size)
        const html = chunks.toString()
        // console.log('===', html, size)
        resolve(html)
      })
    })
  })
}

function * doSomeThingInList (html) {
  return new Promise((resolve) => {
    const listData = []
    const $ = cheerio.load(html)
    // console.log('$', $)
    const list = $('.kw_list')
    const len = list.length
    list.each(function() {
      const href = $(this).find('.inner-li a').attr('href')
      console.log('href', href)

      const item = {}
      // console.log(this, $(this).find('.intro h3').html())
      item.title = entities.decode($(this).find('.intro h3').text())
      item.description = entities.decode($(this).find('.abstract').text())
      item.publishTime = new Date(`${$(this).find('.time-div .time').text()}`)
      item.publisher = 'USKid'

      const tag = entities.decode($(this).find('.tags-list a').text())
      const tags = tag ? [tag] : []
      const taglist = $(this).find('.comments-list a')
      if (taglist && taglist.length) {
        taglist.each(function() {
          tags.push(entities.decode($(this).text()))
        })
      }
      item.tags = tags.join(',')
      item.poster = `${config.cdn}${$(this).find('.img_box img').attr('src')}`
      item.href = `https://www.uskid.com${$(this).find('.inner-li a').attr('href')}`

      if (href.indexOf('.html') > -1) {
        // 对单条信息进行处理
        (function (self) {
          co(getContent, item.href).then((contentHtml) => {
            co(doSomeThingInDetail, contentHtml).then((contentData) => {
              item.body = contentData
              item.href = item.body ? '' : item.href
              if (item.title) {
                co(fetch, item).then((res) => {
                  listData.push(item)
                  if (len === listData.length) {
                    console.log(item.title, '---创建成功---res:', res)
                    resolve(listData)
                  }
                }).catch(() => {
                  resolve(listData) 
                })
              }
            })
          })
        })(this)
      } else {
        item.body = '---'
        if (href === '/plus/view.php?aid=424') {
          item.href = config.cdn + '/gjdl/index.html'
        } else if (href === '/plus/view.php?aid=421') {
          item.href = config.cdn + '/uclub/index.html'
        } else if (href === '/plus/view.php?aid=144') {
          item.href = config.cdn + '/jiazhanghui/index.html'
        } else if (href === '/plus/view.php?aid=143') {
          item.href = 'https://uskid.com/global?c=www'
        } else {
          item.href = item.href.indexOf('uskid.com') > -1 ? item.href : `https://www.uskid.com${item.href}`
        }

        if (item.title) {
          co(fetch, item).then((res) => {
            listData.push(item)
            if (len === listData.length) {
              console.log(item.title, '---创建成功---res:', res)
              resolve(listData)
            }
          })
        }
      }
    })
  })
}

function * fetch(data) {
  return new Promise((reslove, reject) => {
    request.post({
      url: config.apiUrl,
      body: JSON.stringify(data),
      headers: {
        'Content-type': 'application/json; charset=utf-8',
      },
    }, (err, body) => {
      if (err) {
        reject(err);
      }

      if (body) {
        reslove(JSON.parse(body.body));
      } else {
        reslove(null);
      }
    })
  })
}

function doSomeThingInDetail(html) {
  const $ = cheerio.load(html)
  // const content = $('.section-content').html()
  const videos = $('video')
  const a = $('a')
  const img = $('img')
  let videoPoster = null
  let videoUrl = null
  if (videos) {
    videoPoster = videos.attr('poster')
    videoUrl = videos.find('source').attr('src')
  }
  if (a) {
    a.each(function() {
      let href = $(this).attr('href')
      const text = $(this).text()
      if (text.length > 5) {
        $(this).attr('href', '/article/' + text)
      } else if (href.indexOf('tags/USKid') > -1) {
        $(this).attr('href', `/list/USKid`)
      } if (href.indexOf('tags') > -1) {
        var reg = new RegExp(/[\u4e00-\u9fa5]+/ig, 'i');
        href = decodeURIComponent(href)
        var data = reg.exec(href)
        if (data) {
          $(this).attr('href', `/list/${data[0]}`)
        }
      } else if (href.indexOf('shiting') > -1 || href.indexOf('member') > -1) {
        $(this).attr('href', '/audition')
      } else if (href.indexOf('joinin') > -1) {
        $(this).attr('href', '/joinin')
      } else if (href.indexOf('bigbang') > -1) {
        $(this).attr('href', '/list/bigbang')
      } else if (href.indexOf('aboutus') > -1) {
        $(this).attr('href', '/about')
      } else if (href.indexOf('case') > -1) {
        $(this).attr('href', '/list/合作者说')
      } else if (href.indexOf('xuetang') > -1) {
        $(this).attr('href', '/xuetang')
      } else if (href.indexOf('shizi') > -1) {
        $(this).attr('href', '/teacher')
      } else if (href.indexOf('kecheng') > -1) {
        $(this).attr('href', '/course')
      } else if (href.indexOf('article') > -1) {
        $(this).attr('href', '/article/' + $(this).text())
      } else if (href === '#') {
        $(this).attr('href', '/')
      }
      // a.replace(/[\u4e00-\u9fa5]/g, '').replace(/\/tags\/.html/, '')
      // var reg = new RegExp(/[\u4e00-\u9fa5]+/ig, 'i');
      // reg.exec(a)
    })
  }
  if (img) {
    img.each(function() {
      const url = $(this).attr('src')
      // console.log(url) 
    })
  }
  const contentHtml = $('.section-content').html()
  const md = entities.decode(html2markdown(contentHtml))
  const video = videoUrl ? `
  <div class="markdown-component-video">
  <video loop controls width="100%" poster="${videoPoster}">
    <source src="${videoUrl}" type="video/mp4" />
  </video>
  <span></span>
</div>
  ` : ''
  const content = video + md

  const contentData = content
    .replace(/https:\/\/www.uskid.com\/uploads/g, '/uploads')
    .replace(/\/uploads/g, config.cdn + '/uploads')
    .replace(/\/templets/g, config.cdn + '/templets')
  // console.log('\n', '---', content);
  return contentData
}

function doSomeThingInTags(html) {
  const $ = cheerio.load(html)
  const a = $('.kw-lable a')
  const tags = []
  a.each(function() {
    tags.push($(this).attr('href'))
  })
  return tags
}

console.log('start express server\n at http://127.0.0.1:3000/')