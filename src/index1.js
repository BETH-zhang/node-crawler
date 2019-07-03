var superagent = require("superagent");
var cheerio = require('cheerio');
var express = require('express');
var co = require('co');

var app = express();
app.set('views', __dirname)
app.set('view engine', 'ejs');

function getContent(url) {
    return new Promise((resolve, reject) => {
        let htmlContent = '';
        let v2exContent = '';
        if (url === 'oschina') {
          console.log('---')
            superagent
                .get('http://www.oschina.net/')
                .end(function(err, res) {
                    if (err) {
                        reject(err);
                    }

                    console.log('res.text', res.text)
                    let $ = cheerio.load(res.text, {
                        decodeEntities: true
                    });

                    $('.page .news-link').each((id, element) => {
                        console.log(element);
                        let $element = $;
                        // let reg = new RegExp("^\/news", "g");
                        // let reg1 = new RegExp("^\/p", "g");
                        let address = $(element).attr('href');
                        let text = $(element).text()
                        // if (reg.test($(element).attr('href')) || reg1.test($(element).attr('href'))) {
                        //     address = 'http://www.oschina.net' + $(element).attr('href');
                        // }
                        htmlContent += '<a href=\"' + address + '\" target=\"_balank\">' + text + '</a><br><br>';
                    });
                    resolve(htmlContent);
                });
        } else if (url === 'v2ex') {
            superagent
                .get('https://www.v2ex.com/api/topics/hot.json')
                .end(function(err, res) {
                    let v2ex = '';
                    let arr = JSON.parse(res.text);
                    console.log('arr', arr)
                    if (res != '') {
                        
                        for (let i = 0; i < arr.length; i++) {
                            // console.log(arr[i]);
                            v2exContent += '<a href=\"' + arr[i].url + '\" target=\"_balank\">' + arr[i].title + '</a><br><br>';
                        }
                    }
                    resolve(v2exContent);
                });
        } else {
          const url = 'http://www.lagou.com/jobs/list_%E5%89%8D%E7%AB%AF%E5%BC%80%E5%8F%91?kd=%E5%89%8D%E7%AB%AF%E5%BC%80%E5%8F%91&spc=1&pl=&gj=&xl=&yx=&gx=&st=&labelWords=label&lc=&workAddress=&city=%E5%85%A8%E5%9B%BD&requestId=&pn=1'
          superagent.get(url)
            .end((err, res) => {
              if (err) {
                reject(err);
              }

              console.log('res.text', res.text)
              let $ = cheerio.load(res.text, {
                  decodeEntities: true
              });
            })
        }
    })


}


app.get('/', function(req, res1) {
    let gen = function*() {
            // let c1 = yield getContent('oschina');
            // let c2 = yield getContent('v2ex');
            let c2 = yield getContent('lagou');
             let c1 = null

            console.log(c1, c2)
            res1.render('index', {
              'title': 'aaa',
                'htmlContent': c1,
                'v2exContent': c2,
            });
        }
        // console.log(htmlContent)
    co(gen).then(() => {
        console.log('111');
    })
});

app.listen(8000, function() {
    console.log('Example app listening on port 8000!');
});