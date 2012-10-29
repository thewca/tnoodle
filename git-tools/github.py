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

def upload(filePath):
	fileName = os.path.basename(filePath)
	sizeBytes = os.stat(filePath).st_size

	foundDownload = None
	downloads = githubListFiles()
	if 'message' in downloads:
		print downloads['message']
		return False

	for download in downloads:
		if download['name'] == fileName:
			assert foundDownload is None
			foundDownload = download
			break
	if foundDownload:
		#print "Found %s, gonna delete it now, mkay?" % fileName
		#githubDeleteFileById(foundDownload['id'])
		print "%s has already been uploaded!" % fileName
		return False

	# We're just doing what they tell us to do.
	# See http://developer.github.com/v3/repos/downloads/

	uploadUrl = "%s/downloads" % ( baseApiUrl )
	data = { "name": fileName, "size": sizeBytes }
	dataJson = json.dumps(data)

	responseText = httpRequest(uploadUrl, data=dataJson, method="POST", username=username, password=password)
	responseJson = json.loads(responseText)

	if 'errors' in responseJson:
		if responseJson.get('code', 'already_exists'):
			# We should have deleted the file if it already exits
			# I suppose this could happen if 2 people are running this script
			# at the same time...
			assert False
		print "errors:", responseJson['errors']
		print "message:", responseJson['message']
		return False

	# We sucessfully informed github of our intent to upload a file to s3,
	# lets proceed!
	uploadData = collections.OrderedDict()
	uploadData['key'] = responseJson['path']
	uploadData['acl'] = responseJson['acl']
	uploadData['success_action_status'] = 201
	uploadData['Filename'] = responseJson['name']
	uploadData['AWSAccessKeyId'] = responseJson['accesskeyid']
	uploadData['Policy'] = responseJson['policy']
	uploadData['Signature'] = responseJson['signature']
	uploadData['Content-Type'] = responseJson['mime_type']

	curl = """curl \
-F "key=%s" \
-F "acl=%s" \
-F "success_action_status=%s" \
-F "Filename=%s" \
-F "AWSAccessKeyId=%s" \
-F "Policy=%s" \
-F "Signature=%s" \
-F "Content-Type=%s" \
-F "file=@%s" \
%s""" % ( responseJson['path'], responseJson['acl'], 201, responseJson['name'], responseJson['accesskeyid'], responseJson['policy'], responseJson['signature'], responseJson['mime_type'], filePath, responseJson['s3_url'] )
	#uploadData['file'] = file(filePath).read()
	try:
		data = urllib.urlencode(uploadData)
		uploadUrl = responseJson['s3_url']
		#print uploadData
		#print data
		#urllib2.urlopen(uploadUrl, data=data)
		retVal = os.system(curl)#TODO - this is so awful, shoot me now
		print
		return retVal == 0
	except urllib2.HTTPError, e:
		print "UH OH"
		print e.headers
		r = e.read()
		print r
		return False

if __name__ == "__main__":
	upload('TODO')
