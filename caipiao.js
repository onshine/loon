/*
【彩票查询】修复版
*/
const $ = new API("ssq", true);
const ERR = MYERR();

// ... (省略配置代码，保持原样即可) ...

// 核心修复逻辑：在每个请求的处理函数中增加校验
async function checkssq() {
  const url = `http://www.cwl.gov.cn/cwl_admin/kjxx/findDrawNotice?name=ssq&issueCount=5`;
  const headers = {
    "User-Agent": `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36`,
    "Referer": `http://www.cwl.gov.cn/`
  };

  const response = await $.http.get({ url, headers });
  
  // 增加校验
  if (response.statusCode === 200) {
    try {
      // 检查是否包含非法字符
      if (typeof response.body === 'string' && response.body.trim().startsWith('<')) {
        throw new Error("接口返回了HTML页面，可能已被封禁或防火墙拦截");
      }
      
      const data = JSON.parse(response.body).result[0];
      // ... (后续处理逻辑) ...
      
    } catch (e) {
      $.notify("彩票查询", "❌ 数据解析失败", "目标网站接口格式已变，请检查脚本。");
    }
  }
}

// 建议对 check3d 和 checkqlc 使用同样的 try-catch 结构
