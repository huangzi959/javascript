/*
 * @Descripttion: 
 * @version: 
 * @Author: Mr.韦淋
 * @Date: 2022-02-23 09:43:17
 * @LastEditors: Mr.韦淋 huangzi959@gmail.com
 * @LastEditTime: 2022-02-23 10:27:16
 */
/*
邮生活每天签到

*/

const $ = new Env('邮生活每天签到');

const notify = $.isNode() ? require('./sendNotify') : '';

let cookiesArr = [process.env.YOUSHENGHUO],
    cookie = '';
    activityinfo=[];
!(async () => {
  //检查Cookie
  if (!cookiesArr[0]) {
    console.log('获取cookie失败')
    return;
  }

  for (let i = 0; i < cookiesArr.length; i++) {
    cookie = cookiesArr[i];
    $.index = i + 1;
    
    if (cookie) {
      console.log(`\n\n******开始第${$.index}个账号*********\n`);
      await run();
    }
  }
})()
    .catch((e) => $.logErr(e))
    .finally(() => $.done())

async function run(){
  try{
    
    const activityinfo = await rotaryDetail()
    await $.wait(parseInt(Math.random() * 2000 + 2000, 12))
    const remainTheNumber = await rotaryDetailByActivityId(activityinfo)
    await $.wait(parseInt(Math.random() * 2000 + 2000, 12))
    console.log("有"+remainTheNumber+"次抽奖机会")
    if(remainTheNumber==0){
      await notify.sendNotify(`${$.name}`+"所有任务已经完成","无抽奖机会")
      return false
    }
    if(remainTheNumber=='null'){
      await notify.sendNotify(`${$.name}`+"cookie失效","请重新获取")
      return false
    }
    for(let i=0;i<remainTheNumber;i++){
      await drawLottery(activityinfo)
      console.log("抽奖完成，等待下一轮")
      await $.wait(parseInt(Math.random() * 2000 + 2000, 12))
    }
    await addSignIn(activityinfo) 
    console.log("签到完成")
    await notify.sendNotify(`${$.name}`+"所有任务完成","所有任务完成")
  }catch(e){
    console.log(e)
  }
}
//获取抽奖活动数据
function rotaryDetail() {
  return new Promise(resolve => {
    let data = {}
    let options = {
      url: `https://youshenghuo.11185.cn/ZxptRestYshWECHAT/mbr/activity/rotaryDetail`,
      body: JSON.stringify(data),
      headers: {
        "Host": "youshenghuo.11185.cn",
        "Accept": "application/json, text/plain, */*",
        "Authorization":`${cookie}`,
        "channel": "wechat",
        "Accept-Language": "zh-CN,zh-Hans;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
       "Content-Type": "application/json",
        "Origin": "https://youshenghuo.11185.cn",
        "User-Agent":"Mozilla/5.0 (iPhone; CPU iPhone OS 15_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.18(0x1800122d) NetType/WIFI Language/zh_CN",
        "Connection": "keep-alive",
        "Referer": "https://youshenghuo.11185.cn/wx/"
      },
      timeout: 15000
    }
    $.post(options, (err, resp, data) => {
      try {
        if (err) {
          
        } else {
            let res = jsonParse(data)
            activityId=res.data.id;
            ruleId=res.data.activityWheelRuleRetList[0].id;
            activityinfo = {'activityId':activityId,'ruleId':ruleId}
            console.log("活动参数",activityinfo)
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(activityinfo);
      }
    })
  })
}

//获取抽奖数 
function rotaryDetailByActivityId(activityinfo){

  return new Promise(resolve => {
    let rotaryDetailByActivityId = {
        url: `https://youshenghuo.11185.cn/ZxptRestYshWECHAT/mbr/activity/rotaryDetailByActivityId`,
        body: JSON.stringify({"activityId": activityinfo.activityId}),
        headers: {
          "Host": "youshenghuo.11185.cn",
          "Accept": "application/json, text/plain, */*",
          "Authorization":`${cookie}`,
          "channel": "wechat",
          "Accept-Language": "zh-CN,zh-Hans;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
        "Content-Type": "application/json",
          "Origin": "https://youshenghuo.11185.cn",
          "User-Agent":"Mozilla/5.0 (iPhone; CPU iPhone OS 15_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.18(0x1800122d) NetType/WIFI Language/zh_CN",
          "Connection": "keep-alive",
          "Referer": "https://youshenghuo.11185.cn/wx/"
        },
        timeout: 15000
      }
        $.post(rotaryDetailByActivityId, (err, resp, result) => {
        try {
          if (err) {
            console.log('err',err);
            return false;
          } else {}
        } catch (e) {
          $.logErr(e, resp)
        } finally {
          let res = jsonParse(result)
          if(res.retCode==1){
            let remainTheNumber = res.data.activityWheelRuleRetList[0].remainTheNumber
            resolve(remainTheNumber);
          }else{
            resolve('null');
          }
          
        }
      })
  })
}
//大转盘
function drawLottery(activityinfo) {
  return new Promise(resolve => {
    //检查
    let checkedRotary = {
      url: `https://youshenghuo.11185.cn/ZxptRestYshWECHAT/mbr/activity/checkedRotary`,
      body: JSON.stringify({"activityId": activityinfo.activityId,"ruleId": activityinfo.ruleId}),
      headers: {
        "Host": "youshenghuo.11185.cn",
        "Accept": "application/json, text/plain, */*",
        "Authorization":`${cookie}`,
        "channel": "wechat",
        "Accept-Language": "zh-CN,zh-Hans;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
       "Content-Type": "application/json",
        "Origin": "https://youshenghuo.11185.cn",
        "User-Agent":"Mozilla/5.0 (iPhone; CPU iPhone OS 15_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.18(0x1800122d) NetType/WIFI Language/zh_CN",
        "Connection": "keep-alive",
        "Referer": "https://youshenghuo.11185.cn/wx/"
      },
      timeout: 15000
    }
    $.post(checkedRotary, (err, resp, data) => {
      try {
        if (err) {
          console.log("校验",`${JSON.stringify(err)}`)
          return
        } else {
          
          let res = jsonParse(data)
          if(res.retCode==1){
              //抽奖
              let drawLottery = {
                url: `https://youshenghuo.11185.cn/ZxptRestYshWECHAT/mbr/activity/drawLottery`,
                body: JSON.stringify({"activityId": activityinfo.activityId,"activityName": "0323","ruleId": activityinfo.ruleId}),
                headers: {
                  "Host": "youshenghuo.11185.cn",
                  "Accept": "application/json, text/plain, */*",
                  "Authorization":`${cookie}`,
                  "channel": "wechat",
                  "Accept-Language": "zh-CN,zh-Hans;q=0.9",
                  "Accept-Encoding": "gzip, deflate, br",
                  "Content-Type": "application/json",
                  "Origin": "https://youshenghuo.11185.cn",
                  "User-Agent":"Mozilla/5.0 (iPhone; CPU iPhone OS 15_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.18(0x1800122d) NetType/WIFI Language/zh_CN",
                  "Connection": "keep-alive",
                  "Referer": "https://youshenghuo.11185.cn/wx/"
                },
                timeout: 15000
              }
              $.post(drawLottery, (err, resp, result) => {
                try {
                  if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    //notify.sendNotify(`${$.name}`,`${JSON.stringify(err)}`)
                    return false;
                  } else {
                    console.log(result)
                  }
                } catch (e) {
                  $.logErr(e, resp)
                } finally {
                  let queryScoreBalanceSum = {
                    url: `https://youshenghuo.11185.cn/ZxptRestYshWECHAT/crmscore/queryScoreBalanceSum`,
                    body: JSON.stringify({}),
                    headers: {
                      "Host": "youshenghuo.11185.cn",
                      "Accept": "application/json, text/plain, */*",
                      "Authorization":`${cookie}`,
                      "channel": "wechat",
                      "Accept-Language": "zh-CN,zh-Hans;q=0.9",
                      "Accept-Encoding": "gzip, deflate, br",
                      "Content-Type": "application/json",
                      "Origin": "https://youshenghuo.11185.cn",
                      "User-Agent":"Mozilla/5.0 (iPhone; CPU iPhone OS 15_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.18(0x1800122d) NetType/WIFI Language/zh_CN",
                      "Connection": "keep-alive",
                      "Referer": "https://youshenghuo.11185.cn/wx/"
                    },
                    timeout: 15000
                  }
                  $.post(queryScoreBalanceSum, (err, resp, result) => {})
                  let res = jsonParse(result)
                  resolve(res);
                }
              })
          }else{
            console.log(res);
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
      }
    })
  })
}

//签到
function addSignIn() {
  return new Promise(resolve => {
    let data = {}
    let options = {
      url: `https://youshenghuo.11185.cn/ZxptRestYshWECHAT/mbr/signin/addSignIn`,
      body: JSON.stringify(data),
      headers: {
        "Host": "youshenghuo.11185.cn",
        "Accept": "application/json, text/plain, */*",
        "Authorization":`${cookie}`,
        "channel": "wechat",
        "Accept-Language": "zh-CN,zh-Hans;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
       "Content-Type": "application/json",
        "Origin": "https://youshenghuo.11185.cn",
        "User-Agent":"Mozilla/5.0 (iPhone; CPU iPhone OS 15_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.18(0x1800122d) NetType/WIFI Language/zh_CN",
        "Connection": "keep-alive",
        "Referer": "https://youshenghuo.11185.cn/wx/"
      },
      timeout: 15000
    }
   
    $.post(options, (err, resp, data) => {
      try {
        if (err) {} else {}
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

function jsonParse(str) {
  if (typeof str == "string") {
    try {
      return JSON.parse(str);
    } catch (e) {
      console.log(e);
      return [];
    }
  }
}

// prettier-ignore
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}

