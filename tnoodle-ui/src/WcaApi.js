let redirectUri = location.origin + location.pathname + location.search;
let logInUrl = `http://kaladin:3000/oauth/authorize?client_id=e00488e5f685aca8b1f375d9eded764247f070bccb235903ce20f8e437123eac&redirect_uri=${redirectUri}&response_type=token&scope=public+manage_competitions`;

export { logInUrl };

function getHashParameter(name, alt) {
  name = name.replace(/[[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\#&]" + name + "=([^&#]*)");
  var results = regex.exec(location.hash);
  return results === null ? alt : decodeURIComponent(results[1].replace(/\+/g, " "));
}

let wcaAccessToken = getHashParameter('access_token', null);
if(wcaAccessToken) {
  location.hash = "";
}

function wcaApiFetch(path, fetchOptions) {
  // TODO - <<< refresh token https://github.com/doorkeeper-gem/doorkeeper/wiki/Enable-Refresh-Token-Credentials
  var baseApiUrl = 'http://kaladin:3000/api/v0';
  fetchOptions = Object.assign({}, fetchOptions, {
    headers: new Headers({
      "Authorization": `Bearer ${wcaAccessToken}`,
      "Content-Type": "application/json",
    }),
  });
  return fetch(`${baseApiUrl}${path}`, fetchOptions);
}

export function me() {
  return wcaApiFetch("/me").then(response => response.json()).then(json => json.me);
}

export function getCompetitionJson(competitionId) {
  return wcaApiFetch(`/competitions/${competitionId}/big-json`).then(response => response.json());
}

export function setCompetitionJson(competitionId, competitionJson) {
  return wcaApiFetch(`/competitions/${competitionId}/big-json`, {
    method: "PUT",
    body: JSON.stringify({
      big_json: competitionJson,
    }),
  });
}

export function getUpcomingManageableCompetitions() {
  let oneWeekAgo = new Date(Date.now() - 7*24*60*60*1000);
  return wcaApiFetch(
    `/competitions?managed_by_me=true&start=${oneWeekAgo.toISOString()}`
  ).then(response => response.json());
}
