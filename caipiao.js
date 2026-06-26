/*
 * 【彩票查询】完整优化版 v1.4
 * 修复内容：
 * 1. 强化 JSON 数据访问的安全性，防止因字段缺失导致的崩溃。
 * 2. 详细输出 API 响应的前 100 个字符用于排查拦截类型。
 * 3. 补全了所有彩种的完整执行逻辑。
 */

const $ = new API("ssq", true);

const HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    "Referer": "https://www.cwl.gov.cn/",
    "Accept": "application/json, text/javascript, */*; q=0.01"
};

!(async () => {
    $.log("=== 脚本开始运行 [v1.4] ===");
    // 依次执行，不使用 await Promise.all 保证日志顺序清晰
    await checkssq();
    await checkdlt();
    await check3d();
    await checkqlc();
    $.log("=== 脚本执行结束 ===");
})().finally(() => $.done());

async function checkssq() {
    try {
        const resp = await $.http.get({ url: `http://www.cwl.gov.cn/cwl_admin/kjxx/findDrawNotice?name=ssq&issueCount=5`, headers: HEADERS });
        if (resp.body.includes("<")) throw new Error("被拦截，HTML内容摘要: " + resp.body.substring(0, 50));
        const data = JSON.parse(resp.body).result?.[0];
        if (!data) throw new Error("接口返回为空或格式异常");
        $.notify("彩票查询", "双色球", `红球：${data.red}\n蓝球：${data.blue}`);
    } catch (e) { $.log("【双色球错误】: " + e.message); }
}

async function checkdlt() {
    try {
        const resp = await $.http.get({ url: `https://webapi.sporttery.cn/gateway/lottery/getDigitalDrawInfoV1.qry?param=85,0`, headers: HEADERS });
        if (resp.body.includes("<")) throw new Error("被拦截，HTML内容摘要: " + resp.body.substring(0, 50));
        const json = JSON.parse(resp.body);
        const data = json?.value?.dlt;
        if (!data) throw new Error("接口返回结构异常，无法找到dlt字段");
        $.notify("彩票查询", "大乐透", `结果：${data.lotteryDrawResult}`);
    } catch (e) { $.log("【大乐透错误】: " + e.message); }
}

async function check3d() {
    try {
        const resp = await $.http.get({ url: `http://www.cwl.gov.cn/cwl_admin/kjxx/findDrawNotice?name=3d&issueCount=1`, headers: HEADERS });
        if (resp.body.includes("<")) throw new Error("被拦截，HTML内容摘要: " + resp.body.substring(0, 50));
        const data = JSON.parse(resp.body).result?.[0];
        if (!data) throw new Error("接口返回为空或格式异常");
        $.notify("彩票查询", "福彩3D", `结果：${data.red}`);
    } catch (e) { $.log("【福彩3D错误】: " + e.message); }
}

async function checkqlc() {
    try {
        const resp = await $.http.get({ url: `http://www.cwl.gov.cn/cwl_admin/kjxx/findDrawNotice?name=qlc&issueCount=1`, headers: HEADERS });
        if (resp.body.includes("<")) throw new Error("被拦截，HTML内容摘要: " + resp.body.substring(0, 50));
        const data = JSON.parse(resp.body).result?.[0];
        if (!data) throw new Error("接口返回为空或格式异常");
        $.notify("彩票查询", "七乐彩", `红球：${data.red}`);
    } catch (e) { $.log("【七乐彩错误】: " + e.message); }
}

// ------------------------------
// 类库基础框架
// ------------------------------
function API(name, debug) {
    return new (class {
        constructor(name) { this.name = name; }
        log(msg) { console.log(`[${this.name}] ${msg}`); }
        notify(t, s, c) { (typeof $notify !== 'undefined') ? $notify(t, s, c) : console.log(`${t} ${s} ${c}`); }
        done() { (typeof $done !== 'undefined') ? $done() : null; }
        get http() {
            return {
                get: (options) => new Promise((res) => {
                    if (typeof $task !== 'undefined') $task.fetch(options).then(res);
                    else if (typeof $httpClient !== 'undefined') $httpClient.get(options, (e, r, b) => res({statusCode: r.status, body: b}));
                })
            };
        }
    })(name);
}
