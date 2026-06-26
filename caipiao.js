/*
 * 【彩票查询】完整优化版 v1.5
 * 修复内容：
 * 1. 放弃被全面拦截的官方接口，切换为更稳健的聚合 API 数据源。
 * 2. 完善异常处理，增加空数据判断。
 */

const $ = new API("ssq", true);

!(async () => {
    $.log("=== 脚本开始运行 [v1.5] ===");
    await checkData();
    $.log("=== 脚本执行结束 ===");
})().finally(() => $.done());

async function checkData() {
    try {
        // 使用一个通用的聚合接口（该接口对自动化请求相对友好）
        const url = `https://api.667.ee/lotto/latest`; 
        const resp = await $.http.get({ url });
        
        if (!resp.body) throw new Error("接口返回为空");
        
        const json = JSON.parse(resp.body);
        if (json.code !== 200) throw new Error("数据源获取失败: " + json.msg);

        // 格式化输出
        const { ssq, dlt } = json.data;
        $.notify("彩票查询", "双色球", `开奖号码: ${ssq.nums}\n奖池: ${ssq.pool}万`);
        $.notify("彩票查询", "大乐透", `开奖号码: ${dlt.nums}\n奖池: ${dlt.pool}万`);
        
    } catch (e) { 
        $.log("【数据查询错误】: " + e.message); 
    }
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
