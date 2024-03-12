let str = $response.body;
const mp4UrlRegex = /"url":"(http[^"]+\.mp4)"/gm;
const match = str.match(mp4UrlRegex);
for (let i = match.length - 1; i >= 0; i--) {
    const lRegex = /"url":"(http[^"]+\.mp4)"/;
    const matchs = match[i].match(lRegex);

    const myRequest = {
        url: "https://erp.heijiaovip.com/home/Tool/push?url="+matchs[1],
        method: "GET",
        headers: {"Content-Type": "application/json; charset=utf-8"}
    };

    $task.fetch(myRequest).then();
}
$done();
