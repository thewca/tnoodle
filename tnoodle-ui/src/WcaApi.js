import { BASE_PATH } from 'App';

const WCA_ORIGIN = 'http://kaladin:3000';

let wcaAccessToken = getHashParameter('access_token', null);
if(wcaAccessToken) {
  location.hash = "";
  localStorage['TNoodle.accessToken'] = wcaAccessToken;
} else {
  wcaAccessToken = localStorage['TNoodle.accessToken'];
}

export function logIn() {
  let redirectUri = location.origin + BASE_PATH + '/oauth/wca';
  let logInUrl = `${WCA_ORIGIN}/oauth/authorize?client_id=e00488e5f685aca8b1f375d9eded764247f070bccb235903ce20f8e437123eac&redirect_uri=${redirectUri}&response_type=token&scope=public+manage_competitions`;
  localStorage['TNoodle.preLoginPath'] = location.pathname.substring(BASE_PATH.length);
  document.location = logInUrl;
}

export function logOut() {
  localStorage['TNoodle.accessToken'] = null;
  wcaAccessToken = null;
  window.location.reload();
}

export function getPreLoginPath() {
  return localStorage['TNoodle.preLoginPath'] || "/";
}

export function me() {
  return wcaApiFetch("/me").then(response => response.json()).then(json => json.me);
}

export function getCompetitionJsonAndHash(competitionId) {
  return wcaApiFetch(`/competitions/${competitionId}/wcif`).then(response => response.json());
}

export function saveCompetitionJson(competitionJson, previousHash) {
  return wcaApiFetch(`/competitions/${competitionJson.id}/wcif`, {
    method: "PUT",
    body: JSON.stringify({
      hash: previousHash,
      json: competitionJson,
    }),
  }).then(response => response.json());
}

export function getUpcomingManageableCompetitions() {
  let oneWeekAgo = new Date(Date.now() - 7*24*60*60*1000);
  return wcaApiFetch(
    `/competitions?managed_by_me=true&start=${oneWeekAgo.toISOString()}`
  ).then(response => response.json());
}

function getHashParameter(name, alt) {
  name = name.replace(/[[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\#&]" + name + "=([^&#]*)");
  var results = regex.exec(location.hash);
  return results === null ? alt : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function wcaApiFetch(path, fetchOptions) {
  // TODO - <<< refresh token https://github.com/doorkeeper-gem/doorkeeper/wiki/Enable-Refresh-Token-Credentials
  var baseApiUrl = `${WCA_ORIGIN}/api/v0`;
  fetchOptions = Object.assign({}, fetchOptions, {
    headers: new Headers({
      "Authorization": `Bearer ${wcaAccessToken}`,
      "Content-Type": "application/json",
    }),
  });

  return fetch(`${baseApiUrl}${path}`, fetchOptions).then(response => {
    if(!response.ok) {
      throw new Error(`${response.status}: ${response.statusText}`);
    }
    return response;
  });
}
