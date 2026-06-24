/**
 * V7.0 - 强力伪装版
 * 修复：注入完整的浏览器特征头，绕过 High Risk Action
 */

const NS_HEADER_KEY = "NS_NodeseekHeaders";

function startSign() {
  const raw = $persistentStore.read(NS_HEADER_KEY);
  if (!raw) {
    $notification.post("NS签到", "失败", "请先在浏览器打开个人信息页抓包。");
    return;
  }

  const savedHeaders = JSON.parse(raw);

  // 核心修复：手动强化请求头，模拟真实浏览器访问
  const headers = {
    ...savedHeaders,
    "Content-Type": "application/json",
    "Referer": "https://www.nodeseek.com/board",
    "Origin": "https://www.nodeseek.com",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin",
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1"
  };

  const options = {
    url: "https://www.nodeseek.com/api/attendance",
    method: "POST",
    headers: headers,
    body: JSON.stringify({}), // 保持空对象
    timeout: 5000
  };

  $httpClient.post(options, (error, response, data) => {
    if (error) {
      $notification.post("NS签到", "网络错误", String(error));
    } else {
      console.log("NS服务器状态: " + response.status);
      console.log("NS服务器响应: " + data);
      
      // 成功解析的判断
      if (response.status === 200 || response.status === 400) { // 有时失败也会有JSON返回
        try {
          const obj = JSON.parse(data);
          $notification.post(`NS签到 (${response.status})`, "", String(obj.message || data));
        } catch(e) {
          $notification.post("NS签到", "解析失败", String(data));
        }
      } else {
        $notification.post("NS签到", "触发风控", "状态码: " + response.status);
      }
    }
    $done();
  });
}

startSign();
