# 拉勾网简历爬虫

## 功能描述
* 从拉钩网找到“前端开发”这一类岗位的信息，并做相应页面分析，提取出特定的几个部分如岗位名称、岗位薪资、岗位所属公司、岗位发布日期等。抓去并展示

## 设计方案
1. 获取url：https://www.lagou.com/jobs/list_%E5%89%8D%E7%AB%AF%E5%BC%80%E5%8F%91?kd=%E5%89%8D%E7%AB%AF%E5%BC%80%E5%8F%91&spc=1&pl=&gj=&xl=&yx=&gx=&st=&labelWords=label&lc=&workAddress=&city=%E5%85%A8%E5%9B%BD&requestId=&pn=1
2. 获取特定信息，就需要特定代表的标示符
  * 采用分析页面代码标签值、class值、id值来考虑
  * 审查元素