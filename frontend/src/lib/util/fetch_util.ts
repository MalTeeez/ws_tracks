const API_BASE_URL : string = "http://localhost:9001/api/";

export async function postJSON(endpoint : string, json : JSON) {
  const req = new Request(API_BASE_URL + endpoint, {method: "POST", body: JSON.stringify(json)});
  return fetchWithRequest(req);
}

export async function getJSON(endpoint : string) {
  const req = new Request(API_BASE_URL + endpoint, {method: "GET"});
  return fetchWithRequest(req);
}

export async function simpleGETNoFollow(endpoint : string) {
  const req = new Request(API_BASE_URL + endpoint, {method: "GET", redirect: "manual"});
  return fetchWithRequestWithoutResponseBody(req)
}

export async function postBytes(endpoint : string, headers : Headers, bytes : ArrayBuffer) {
  const req = new Request(API_BASE_URL + endpoint, {method: "POST", headers: headers, body: bytes});
  return fetchWithRequestWithoutResponseBody(req);
}

export async function postMultipart(endpoint : string, headers : Headers, body : FormData) {
  const req = new Request(API_BASE_URL + endpoint, {method: "POST", headers: headers, body: body});
  return fetchWithRequestWithoutResponseBody(req);
}

export async function getJSONwithHeaders(endpoint : string, headers: Headers) {
  const req = new Request(API_BASE_URL + endpoint, {method: "GET", headers: headers});
  return fetchWithRequest(req);
}

export async function getHeadersWithHeaders(endpoint : string, headers: Headers) {
  const req = new Request(API_BASE_URL + endpoint, {method: "GET", headers: headers});
  return fetchWithRequestWithoutResponseBody(req);
}

export async function postJSONwithHeaders(endpoint : string, headers: Headers, json: JSON) {
  const req = new Request(API_BASE_URL + endpoint, {method: "POST", headers: headers, body: JSON.stringify(json)});
  return fetchWithRequest(req);
}

export async function fetchWithRequest(req : Request): Promise<any> {
  return new Promise((resolve, reject) => {
    fetch(req).then(r => {
      if (r.ok) {
        let message: string | null = r.headers.get("message");
        r.json()
          .then(json => resolve(json))
          .catch(err => {
            console.error("Failed while parsing JSON after OK. -> ", err)
          })
      } else {
        reject(r)
      }
    });
  });
}

export async function fetchWithRequestWithoutResponseBody(req : Request): Promise<any> {
  return new Promise((resolve, reject) => {
    fetch(req).then(r => {
      if (r.ok) {
        resolve(r)
      } else {
        reject(r)
      }
    });
  });
}
