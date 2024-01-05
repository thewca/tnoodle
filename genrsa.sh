#!/usr/bin/env bash

openssl genrsa -out tnoodle_private.pem 4096
openssl rsa -pubout -in tnoodle_private.pem -out tnoodle_public.pem
openssl pkcs8 -topk8 -in tnoodle_private.pem -inform pem -out tnoodle_private.pkcs8.pem -outform pem -nocrypt

mv tnoodle_public.pem server/src/main/resources/rsa/
rm tnoodle_private.pem

grep -v "^wca.wst.signature-private-key" gradle.properties > gradle.properties.tmp
echo "wca.wst.signature-private-key=tnoodle_private.pkcs8.pem" >> gradle.properties.tmp
mv gradle.properties.tmp gradle.properties
