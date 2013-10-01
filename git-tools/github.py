import json
import getpass
import mimetypes
import requests

connectedApis = {}
def getApi(organization, repo):
    key = "%s/%s" % (organization, repo)
    if key in connectedApis:
        return connectedApis[key]
    api = GithubApi(organization, repo)
    connectedApis[key] = api
    return api


# Copied from http://stackoverflow.com/a/12897375
from urllib.parse import urlencode
from urllib.parse import parse_qs, urlsplit, urlunsplit
def set_query_parameter(url, param_name, param_value):
    """Given a URL, set or replace a query parameter and return the
    modified URL.

    >>> set_query_parameter('http://example.com?foo=bar&biz=baz', 'foo', 'stuff')
    'http://example.com?foo=stuff&biz=baz'

    """
    scheme, netloc, path, query_string, fragment = urlsplit(url)
    query_params = parse_qs(query_string)

    query_params[param_name] = [param_value]
    new_query_string = urlencode(query_params, doseq=True)

    return urlunsplit((scheme, netloc, path, new_query_string, fragment))

# See "Preview mode" on http://developer.github.com/changes/2013-09-25-releases-api/
# This should be deletable in 30 days or so.
previewHeaders = { "Accept": "application/vnd.github.manifold-preview" }

class GithubApi(object):
    def __init__(self, organization, repo):
        self.baseApiUrl = 'https://api.github.com/repos/%s/%s' % ( organization, repo )
        self.baseUrl = 'https://github.com/%s/%s' % ( organization, repo )
        self.username = input('Username (for %s/%s): ' % (organization, repo))
        print("Attempting to connect to github as %s" % ( self.username ))
        self.password = getpass.getpass()
        self.auth = (self.username, self.password)
        r = requests.get('https://api.github.com/user', auth=self.auth)
        r.raise_for_status()

        r = requests.get(self.baseApiUrl, auth=self.auth)
        if r.status_code == requests.codes.not_found:
            assert False, "Couldn't find %s/%s, is it really a repo?" % (organization, repo)
        r.raise_for_status()

    def depaginate(self, url):
        munged = []
        page = 1
        while True:
            pageUrl = set_query_parameter(url, 'page', str(page))
            r = requests.get(pageUrl, auth=self.auth, headers=previewHeaders)
            r.raise_for_status()
            if len(r.json) == 0:
                # Once the array returned is empty, we've hit the end.
                break
            munged += r.json()
            page += 1
        return munged

    def listReleases(self):
        listUrl = '%s/releases' % self.baseApiUrl
        return self.depaginate(listUrl)

    def createRelease(self, tag, draft=True, files=[]):
        createUrl = '%s/releases' % self.baseApiUrl
        data = json.dumps({
            'tag_name': tag,
            'draft': draft
        })
        r = requests.post(createUrl, data=data, auth=self.auth, headers=previewHeaders)
        r.raise_for_status()

        uploadUrl = r.json()['upload_url']
        uploadResponses = []
        for name, data in files:
            uploadResponse = self.uploadAsset(name, data, uploadUrl)
            uploadResponses.append(uploadResponse)
        return ( r.json(), uploadResponses )

    def uploadAsset(self, name, data, uploadUrl):
        uploadUrl = uploadUrl.replace("{?name}", "?name=%s" % name)
        mime, encoding = mimetypes.guess_type(name)
        headers = dict(previewHeaders)
        headers['Content-Type'] = mime

        r = requests.post(uploadUrl, auth=self.auth, headers=headers, data=data)
        # Github's api is returning 502 Bad Gateway when uploading files larger than
        # 3430400 bytes, even though the file does appear to be uploaded correctly.
        # For now, we'll just skip this check. Hopefully we can add
        # it back soon.
        # r.raise_for_status()
        # return r.json()

    def deleteRelease(self, id):
        deleteUrl = '%s/releases/%s' % (self.baseApiUrl, id)
        r = requests.delete(deleteUrl, auth=self.auth, headers=previewHeaders)
        r.raise_for_status()

    def listAssets(self, releaseId):
        listUrl = '%s/releases/%s/assets' % (self.baseApiUrl, releaseId)
        return depaginate(listUrl)

    def pullRequest(self, title, body):
        pullUrl = '%s/pulls' % self.baseApiUrl
        data = json.dumps({
            "title": title,
            "body": body,
            "base": "master",
            "head": "%s:master" % self.username
        })
        r = requests.post(pullUrl, auth=self.auth, data=data)
        if r.status_code != requests.codes.created:
            print(r.json())
            r.raise_for_status()
        else:
            pullRequestUrl = '%s/pull/%s' % (self.baseUrl, r.json()['number'])
            print("Pull request created at %s" % pullRequestUrl)
