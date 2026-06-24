// NS论坛签到 (Loon 完美适配版)
const NS_HEADER_KEY = "NS_NodeseekHeaders";
const isGetHeader = typeof $request !== "undefined";

const NEED_KEYS = [
  "Connection", "Accept-Encoding", "Priority", "Content-Type", "Origin",
  "refract-sign", "User-Agent", "refract-key", "Sec-Fetch-Mode",
  "Cookie", "Host", "Referer", "Accept-Language", "Accept"
];

function pickNeedHeaders(src = {}) {
  const dst = {};
  const get = (name) => src[name] ?? src[name.toLowerCase()] ?? src[name.toUpperCase()];
  for (const k of NEED_KEYS) {
    const v = get(k);
    if (v !== undefined) dst[k] = v;
  }
  return dst;
}

if (isGetHeader) {
  const picked = pickNeedHeaders($request.headers || {});
  if (!picked || Object.keys(picked).length === 0) {
    $notification.post("NS Headers 获取失败", "", "未获取到指定请求头。");
  } else {
    // Loon 使用 $persistentStore.write
    if ($persistentStore.write(JSON.stringify(picked), NS_HEADER_KEY)) {
      $notification.post("NS Headers 获取成功", "Nodeseek", "已保存请求头，签到脚本可正常运行。");
    } else {
      $notification.post("NS Headers 保存失败", "", "写入数据失败。");
    }
  }
  $done({});
} else {
  // 读取已保存的数据，Loon 使用 $persistentStore.read
  const raw = $persistentStore.read(NS_HEADER_KEY);
  if (!raw) {
    $notification.post("NS签到失败", "", "本地没有已保存的请求头，请先抓包访问个人页面。");
    $done();
    return;
  }

  let savedHeaders = {};
  try {
    savedHeaders = JSON.parse(raw);
  } catch (e) {
    $notification.post("NS签到错误", "", "请求头数据解析失败。");
    $done();
    return;
  }

  $httpClient.post({
    url: "https://www.nodeseek.com/api/attendance?random=true",
    headers: savedHeaders,
    body: ""
  }, (error, response, data) => {
    if (error) {
      $notification.post("NS签到请求失败", "", String(error));
    } else {
      try {
        const obj = JSON.parse(data);
        const msg = obj?.message || data;
        $notification.post("NS签到结果", `状态码: ${response.status}`, String(msg));
      } catch (e) {
        $notification.post("NS签到结果", `状态码: ${response.status}`, String(data));
      }
    }
    $done();
  });
}
