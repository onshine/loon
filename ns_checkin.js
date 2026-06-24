/**
 * V8.0 - 绕过 Cloudflare 专用版
 * 确保你的抓包数据里必须包含 cf_clearance 字段，否则 100% 报错
 */

const NS_HEADER_KEY = "NS_NodeseekHeaders";

function run() {
  const raw = $persistentStore.read(NS_HEADER_KEY);
  if (!raw) {
    $notification.post("NS签到 [V8.0]", "失败", "请确保抓包数据中包含 cf_clearance Cookie");
    return;
  }

  const savedHeaders = JSON.parse(raw);
  
  // 必须确保 Cookie 字符串中包含 cf_clearance
  if (!savedHeaders.Cookie || !savedHeaders.Cookie.includes("cf_clearance")) {
     $notification.post("NS签到 [V8.0]", "Cookie 无效", "当前 Cookie 缺少 cf_clearance，无法绕过 CF 防护。");
     return;
  }

  $httpClient.post({
    url: "https://www.nodeseek.com/api/attendance",
    headers: savedHeaders,
    body: ""
  }, (error, response, data) => {
    if (error) {
      $notification.post("NS签到", "网络错误", String(error));
    } else {
      $notification.post(`状态码: ${response.status}`, "响应内容", data.substring(0, 50));
    }
    $done();
  });
}

run();
