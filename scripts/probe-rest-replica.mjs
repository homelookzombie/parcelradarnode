/**
 * Tarayıcıdan kopyalanan ham fetch (REST) denemesi — Puppeteer yok, genelde meta -14.
 * Kullanım: npm run probe:rest-replica
 */

const url = 'https://t.17track.net/track/restapi';

const cookie =
  '_yq_bid=G-3CF511D42E69E2D2; v5_TranslateLang=tr; connectId={"ttl":86400000,"lastUsed":1777402024486,"lastSynced":1777402024486}; v5_Culture=en; __gads=ID=8011b962a3712d80:T=1777402059:RT=1777403426:S=ALNI_Mb_QDzCFbK-AEoW6fdGRj6fLsZqpg; __gpi=UID=000013da1af1743f:T=1777402059:RT=1777403426:S=ALNI_MbJ-QOKIVcqgeX6tkGhKl6OZpJDyQ; __eoi=ID=753008271d33e42a:T=1777402059:RT=1777403426:S=AA-AfjZHbatEHDe0iIo7J6bMPdMM; uid=774E59A96CD848EAA02BFD1AF558E669; _yq_rc_=yq.3.2011.en.0.0.4385282575690584163; csrf_token=enVYvYxNLMTWO1qt2ZKrGZKF3N_IBHXi-c-GMHYqoNY; crisp-client%2Fsession%2F115772b1-4fc7-471c-a364-05246aac2f53=session_8eece32d-128d-4a49-b3dc-e8a7184914ed; crisp-client%2Fsession%2F115772b1-4fc7-471c-a364-05246aac2f53%2Fkursatkarayandi%40gmail.com=session_8eece32d-128d-4a49-b3dc-e8a7184914ed; country=TR; Last-Event-ID=302f3437312e302e312f37363738363730312f3038312d2f657572742f31312f34396365353238656439312f303a303a37363738363730313a65736c61663a324432453936453234443131354643332d47467aed6be3fa0c6a1';

const sign =
  'MjAyNTA3MjJUMTE6Mjg6NDVa/eMQTGiGzjgcp/OE6Sltxnv9PoVrhDSvCzt7otjs4Ks3hRH5C/aX3UtkBzOHgxzqxirEjfLUmAY4Y3yG5Kkbi/X8g3k690u+92RH7zzplPBwKLVwDsa1rtvijhwaSXAFfNm6jEhMzi1OJtdFP6JQL7/6Y3jv0VQrrjOVDuHV2svJPmvEOk6YvqSbHB9mbtyxIZunkIaz5h1SU4/1GPLz0OqFkyA0EkYB79Ni8ZW6+w46J/lwU6JsRur2sKJirQ0qbB5nU8G3CLve9j/XA90bn+QbflzxBWdBdVsxXJqlCVfVcPXPGwvwq8v67lxQZVJbXVulwLnbZCSZTPlYCH3Ww7TCvqQ926UhBy7uUqUu+RfLBloGYppbA5SN8AGub2vNglyUlW+2KZyz4c6mRN1dawC0QsVw7xWH0+fXf+6HH3RfDG7L0cZ2yiGYltVZQkMIvv7nwCa5uLd05UEvfZUHYcX+NLEEhnc/rIo4SuTYXIhnMM7xe3UGaqnw0EmWRWPouichXrD9LPjSIgqjVzpRTRh0+nyIZ401WHFCg+VeiDuH78aM0d9mE5u7IAsWaaW+ObhX6IbIFW8EJ8ppzTLoLd3HAg302btIgF/vRXKTllGQaotMEpsvdY8F/49JyhVVTAOGYOgfHb5z05YQo54zTG7GqWFPuiuSTVqY2H9NvvlM1FNTzYYnvyJ982LQrw9Q5IXqbXd6BPhyADRigRsRtoV2KO4Hb69/qZlBriNhdV3aQ3phtuxSCaN04iTEJgW2COLUMsjzvorROAfKu6Sl3d/i9gpLD5Rak9OPm+G/pRsl8V50/iVxezDSzDzyS2V9Ib3W2YFio3lsjUNYwa4RFsqIw0BxPy1GKwvG4sqJDbIYJaiQn9ZjvZokjujM0dibU7j3xHo5iURwjrOIXTzB940DGj4OYIu9JhDq2ASOo/ac4RvQHRvM58sBBNuSzf4H+7q/e7kLtZmDathlVS5QCpmobV0cIELKyQG/he4NLLhcBCJ7iYDTTyyAMDFHhLZRom/1nv1lrYBUCrIeILhlvWMn6zue1bfvCjmnRkAnpgnICqlJGNAtgBQfRuegf/59M1+umVGZRARz9j4exIpNkO+X+WnQRQcwSx12ToGc/sYobRtMhIEzl65N+MXmbRC85gkG1GSsxHrgHVcSBkBA69kFzpVKVqi7RPBjQ9frmT90HxQBTgRSjoFe6zC+XlsoZ';

const body = {
  data: [{ num: '23074173112231', fc: 100703, sc: 0 }],
  guid: '',
  timeZoneOffset: -480,
  sign,
};

const headers = {
  accept: '*/*',
  'accept-language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
  baggage:
    'sentry-environment=production,sentry-release=default,sentry-public_key=3d22be5e024c43f5826597cdb8039a1f,sentry-trace_id=16ef4b27313343f58678c5760802618b,sentry-sampled=false,sentry-sample_rand=0.3668611682779964,sentry-sample_rate=0.01',
  'content-type': 'application/json',
  'last-event-id':
    '302f3437312e302e312f37363738363730312f3038312d2f657572742f31312f34396365353238656439312f303a303a37363738363730313a65736c61663a324432453936453234443131354643332d47467aed6be3fa0c6a1',
  priority: 'u=1, i',
  'sec-ch-ua': '"Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-origin',
  'sentry-trace': '16ef4b27313343f58678c5760802618b-af6563fb5aa61c44-0',
  'x-csrf-token': 'enVYvYxNLMTWO1qt2ZKrGZKF3N_IBHXi-c-GMHYqoNY',
  cookie,
  Referer: 'https://t.17track.net/en?nums=23074173112231&fc=100703',
  Origin: 'https://t.17track.net',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
};

async function main() {
  console.log('POST', url);
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const text = await res.text();
  console.log('HTTP', res.status);
  let parsed = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    console.log('Ham (ilk 800 karakter):\n', text.slice(0, 800));
    return;
  }
  console.log(JSON.stringify(parsed, null, 2));
  const mc = parsed?.meta?.code;
  console.log('\nmeta.code:', mc, mc === 200 ? '(OK)' : '');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
