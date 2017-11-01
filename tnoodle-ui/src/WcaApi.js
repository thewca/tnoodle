import { BASE_PATH } from 'App';

const WCA_ORIGIN = process.env.REACT_APP_WCA_ORIGIN || 'https://www.worldcubeassociation.org';
const TNOODLE_APP_ID = process.env.REACT_APP_TNOODLE_APP_ID || '6145bf3e65fbad4715b049dae2d72a64b8e9a794010abf518fa9364b05a5dd40';

let wcaAccessToken = getHashParameter('access_token', null);
if(wcaAccessToken) {
  location.hash = "";
  localStorage['TNoodle.accessToken'] = wcaAccessToken;
} else {
  wcaAccessToken = localStorage['TNoodle.accessToken'];
}

export function logIn() {
  let redirectUri = location.origin + BASE_PATH + '/oauth/wca';
  let logInUrl = `${WCA_ORIGIN}/oauth/authorize?client_id=${TNOODLE_APP_ID}&redirect_uri=${redirectUri}&response_type=token&scope=public+manage_competitions`;
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
