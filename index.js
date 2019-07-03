const charset = require('superagent-charset')
const request = require('superagent')
const agent = request.agent()
const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.80 Safari/537.36'
}// 通过该网址和指定字符编码来爬取文章

const url = 'http://www.lagou.com/jobs/list_%E5%89%8D%E7%AB%AF%E5%BC%80%E5%8F%91?kd=%E5%89%8D%E7%AB%AF%E5%BC%80%E5%8F%91&spc=1&pl=&gj=&xl=&yx=&gx=&st=&labelWords=label&lc=&workAddress=&city=%E5%85%A8%E5%9B%BD&requestId=&pn='

agent.get(url)
  .charset(charset)
  .timeout(20000)
  .catch(err => {
    if (err.status === 301) {
      headers.Cookie = err.response.headers['set-cookie'].toString()
      return agent.get(url).set(headers)
        .charset(charset)
        .timeout(20000)
    }
    return Promise.reject(err)
  })