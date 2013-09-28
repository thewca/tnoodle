#!/usr/bin/python

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

# See "Preview mode" on http://developer.github.com/changes/2013-09-25-releases-api/
# This should be deletable in 30 days or so.
previewHeaders = { "Accept": "application/vnd.github.manifold-preview" }

class GithubApi(object):
    def __init__(self, organization, repo):
        self.baseApiUrl = 'https://api.github.com/repos/%s/%s' % ( organization, repo )
        self.baseUrl = 'https://github.com/%s/%s' % ( organization, repo )
        self.username = raw_input('Username (for %s/%s): ' % (organization, repo))
        print "Attempting to connect to github as %s" % ( self.username )
        self.password = getpass.getpass()
        self.auth = (self.username, self.password)
        r = requests.get('https://api.github.com/user', auth=self.auth)
        r.raise_for_status()

    def listReleases(self):
        listUrl = '%s/releases' % self.baseApiUrl
        r = requests.get(listUrl, auth=self.auth, headers=previewHeaders)
        r.raise_for_status()
        return r.json

    def createRelease(self, tag, draft=True, files={}):
        createUrl = '%s/releases' % self.baseApiUrl
        data = json.dumps({
            'tag_name': tag,
            'draft': draft
        })
        r = requests.post(createUrl, data=data, auth=self.auth, headers=previewHeaders)
        r.raise_for_status()

        ogUploadUrl = r.json['upload_url']
        fileRequests = []
        for name, data in files.iteritems():
            uploadUrl = ogUploadUrl.replace("{?name}", "?name=%s" % name)
            mime, encoding = mimetypes.guess_type(name)
            headers = dict(previewHeaders)
            headers['Content-Type'] = mime

            # Well, this is probably a huge security hole.
            # I've contacted github about fixing their certificate. --jeremy
            # Look at the difference between
            #  openssl s_client -connect api.github.com:443 2>&1 | openssl x509 -text | grep -B 1 DNS
            # and
            #  openssl s_client -connect uploads.github.com:443 2>&1 | openssl x509 -text | grep -B 1 DNS
            verify = False

            fileRequest = requests.post(uploadUrl, auth=self.auth, headers=headers, data=data, verify=verify)
            fileRequest.raise_for_status()
            fileRequests.append(fileRequest.json)
        return ( r.json, fileRequests )

    def deleteRelease(self, id):
        deleteUrl = '%s/releases/%s' % (self.baseApiUrl, id)
        r = requests.delete(deleteUrl, auth=self.auth, headers=previewHeaders)
        r.raise_for_status()

    def listAssets(self, releaseId):
        listUrl = '%s/releases/%s/assets' % (self.baseApiUrl, releaseId)
        r = requests.get(listUrl, auth=self.auth, headers=previewHeaders)
        r.raise_for_status()
        return r.json

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
            print r.json
            r.raise_for_status()
        else:
            pullRequestUrl = '%s/pull/%s' % (self.baseUrl, r.json['number'])
            print "Pull request created at %s" % pullRequestUrl
