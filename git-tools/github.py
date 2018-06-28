import os
import re
import json
import getpass
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

class GithubApi(object):
    def __init__(self, organization, repo):
        self.baseApiUrl = 'https://api.github.com/repos/%s/%s' % ( organization, repo )
        self.baseUrl = 'https://github.com/%s/%s' % ( organization, repo )

        ghAccessToken = os.environ.get("TNOODLE_GH_ACCESS_TOKEN")
        if not ghAccessToken:
            assert False, "You must specify a GitHub Personal Access Token by setting the TNOODLE_GH_ACCESS_TOKEN environment variable. If you do not have an auth token, you can create one here: https://github.com/settings/tokens/new. That access token only needs the `public_repo` permission."

        self.authorizationHeader = {
            "Authorization": "token {}".format(ghAccessToken),
        }

        r = requests.get(self.baseApiUrl, headers=self.authorizationHeader)
        if r.status_code == requests.codes.not_found:
            assert False, "Couldn't find %s/%s, is it really a repo?" % (organization, repo)
        r.raise_for_status()

    def depaginate(self, url):
        munged = []
        page = 1
        while True:
            pageUrl = set_query_parameter(url, 'page', str(page))
            r = requests.get(pageUrl, headers=self.authorizationHeader)
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
        r = requests.post(createUrl, data=data, headers=self.authorizationHeader)
        r.raise_for_status()

        uploadUrlTemplate = r.json()['upload_url']
        uploadResponses = []
        for name, data in files:
            uploadResponse = self.uploadAsset(name, data, uploadUrlTemplate)
            uploadResponses.append(uploadResponse)
        return ( r.json(), uploadResponses )

    def uploadAsset(self, name, data, uploadUrlTemplate):
        # See https://developer.github.com/v3/#hypermedia
        # and https://developer.github.com/v3/repos/releases/#input-2
        # for the documentation on these url templates that github provides.
        uploadUrl = re.sub(r"{\?.*name.*}", "?name=%s" % name, uploadUrlTemplate)

        filename, ext = os.path.splitext(name)
        mime = {
            ".jar": "application/zip",
        }[ext]
        headers = dict(self.authorizationHeader)
        headers['Content-Type'] = mime

        r = requests.post(uploadUrl, headers=headers, data=data)
        r.raise_for_status()
        return r.json()

    def deleteRelease(self, id):
        deleteUrl = '%s/releases/%s' % (self.baseApiUrl, id)
        r = requests.delete(deleteUrl, headers=self.authorizationHeader)
        r.raise_for_status()

    def listAssets(self, releaseId):
        listUrl = '%s/releases/%s/assets' % (self.baseApiUrl, releaseId)
        return depaginate(listUrl)
