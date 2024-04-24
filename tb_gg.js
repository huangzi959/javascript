// let str = $response.body;
// console.log(str);
// const mp4UrlRegex = /"url":"(http[^"]+\.mp4)"/gm;
// const match = str.match(mp4UrlRegex);
// for (let i = match.length - 1; i >= 0; i--) {
//     const lRegex = /"url":"(http[^"]+\.mp4)"/;
//     const matchs = match[i].match(lRegex);

//     const myRequest = {
//         url: "https://erp.heijiaovip.com/home/Tool/push?url="+matchs[1],
//         method: "GET",
//         headers: {"Content-Type": "application/json; charset=utf-8"}
//     };

//     $task.fetch(myRequest).then();
// }


/**
 * @fileoverview Example to compose HTTP request
 * and handle the response.
 *
 */

const url = "https://erp.heijiaovip.com/home/Tool/push";
const method = "POST";
const headers = {"Content-Type": "application/json; charset=utf-8"};
const data = {"response": $response.body};
console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
console.log(JSON.stringify(data));
const myRequest = {
    url: url,
    method: method, // Optional, default GET.
    headers: headers, // Optional.
    body: JSON.stringify(data) // Optional.
};

$task.fetch(myRequest).then(response => {
    // response.statusCode, response.headers, response.body
    console.log(response.body);
    $notify("Title", "Subtitle", response.body); // Success!
    $done();
}, reason => {
    // reason.error
    $notify("Title", "Subtitle", reason.error); // Error!
    $done();
});
