#!/usr/bin/env python

import argparse
import urllib
import urlparse
import os
import re
import sys
import time

def getRelativeUrl(baseUrl, url):
    split = urlparse.urlparse(url)
    if split.scheme:
        pass
    else:
        split = list(split)
        splitBase = urlparse.urlparse(baseUrl)
        split[0] = splitBase[0]
        split[1] = splitBase[1]
        if not split[2].startswith('/'):
            split[2] = splitBase[2] + split[2]
    return urlparse.urlunparse(split)

def findAndInline(html, baseUrl, regex, template):
    unifiedHtml = ""
    lastMatch = 0
    for match in regex.finditer(html):
        url = match.group(1)
        fullUrl = getRelativeUrl(baseUrl, url)
        filename, headers = urllib.urlretrieve(fullUrl)
        contents = open(filename).read()
        unifiedHtml += html[lastMatch:match.start()]
        unifiedHtml += template % ( url, contents )
        lastMatch = match.end()
    unifiedHtml += html[lastMatch:]
    return unifiedHtml

def unify(url, try_count=1):
    for nthTry in range(try_count):
        try:
            return unify_impl(url)
        except IOError:
            if nthTry + 1 == try_count:
                sys.stderr.write("Connecting to %s failed on attempt #%s, giving up\n" % ( url, try_count ))
                raise
            # We're going to try again, but first, lets wait a second
            time.sleep(1)

def unify_impl(url):
    filename, headers = urllib.urlretrieve(url)
    ogHtml = open(filename).read()

    pieces = urlparse.urlparse(url)
    pieces = list(pieces)
    pieces[2] = os.path.dirname(pieces[2]) + '/' # path
    baseUrl = urlparse.urlunparse(pieces)

    internalCssTemplate = """<style type="text/css">
/************** %s ***************/
%s
</style>"""
    cssRe = re.compile('<link type="text/css" rel="stylesheet" href="([^"]*)" media="screen" />')
    ogHtml = findAndInline(ogHtml, baseUrl, cssRe, internalCssTemplate)

    internalJsTemplate = """<script type="text/javascript">
/************** %s ***************/
%s
</script>"""
    jsRe = re.compile('<script type="text/javascript" src="([^"]*)"></script>')
    ogHtml = findAndInline(ogHtml, baseUrl, jsRe, internalJsTemplate)

    return ogHtml

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('url', help='Url to unify to a single html file')
    args = parser.parse_args()
    print unify(args.url)

if __name__ == "__main__":
    main()
