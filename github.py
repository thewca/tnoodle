#!/usr/bin/python

import sys
import os

import urllib
import urllib2
import json
import collections

import getpass

import requests


def httpRequest(url, data=None, method=None, username=None, password=None):
        #assert not (username ^ password)
        assert username and password # TODO for now, we require credentials...

        # TODO - urllib2 isn't offering up credentials unless we get a 401
        # the github api gives a 404 if you don't have credentials, so urllib2
        # doesn't work. The following is a horrible hack. I intend to push
        # something upstream to the python library...
        passwordMgr = urllib2.HTTPPasswordMgrWithDefaultRealm()
        topLevelUrl = "https://api.github.com"
        passwordMgr.add_password(None, topLevelUrl, username, password)

        handler = urllib2.HTTPBasicAuthHandler(passwordMgr)
        opener = urllib2.build_opener(handler)

        req = urllib2.Request(url, data)
        if method is not None:
                req.get_method = lambda: method
        try:
                #response = urllib2.urlopen(req)
                #handler.http_error_auth_reqed('www-authenticate', req.get_full_url(), req, None)
                req.timeout = 5 # TODO wtf?!
                responseHttp = handler.retry_http_basic_auth(req.get_full_url(), req, "GitHub")
                #responseJson = json.loads(responseHttp.read())
                return responseHttp.read()
        except urllib2.HTTPError, e:
                print e.headers
                #responseJson = json.loads(e.read())
                return e.read()

def githubListFiles():
        listUrl = '%s/downloads' % ( baseApiUrl )
        responseText = httpRequest(listUrl, username=username, password=password)
        responseJson = json.loads(responseText)
        return responseJson


def githubDeleteFileById(fileId):
        deleteUrl = '%s/downloads/%d' % ( baseApiUrl, fileId )
        responseText = httpRequest(deleteUrl, method="DELETE", username=username, password=password)
        # TODO - check for errors!
        print responseText


def connect(organization, repo):
        # TODO - oopify library!
        global username, password, baseApiUrl, baseUrl
        baseApiUrl = 'https://api.github.com/repos/%s/%s' % ( organization, repo )
        baseUrl = 'https://github.com/%s/%s' % ( organization, repo )
        username = raw_input('Username: ')
        print "Attempting to connect to github as %s" % ( username )
        password = getpass.getpass()
        r = requests.get('https://api.github.com/user', auth=(username, password))
        assert r.status_code == requests.codes.ok

def pullRequest(title, body):
        pullUrl = '%s/pulls' % baseApiUrl
        data = json.dumps({
                "title": title,
                "body": body,
                "base": "master",
                "head": "%s:master" % username
        })
        r = requests.post(pullUrl, auth=(username, password), data=data)
        if r.status_code != requests.codes.created:
                print r.json
                assert r.status_code == requests.codes.created
        else:
                pullRequestUrl = '%s/pull/%s' % (baseUrl, r.json['number'])
                print "Pull request created at %s" % pullRequestUrl

if __name__ == "__main__":
        upload('TODO')
