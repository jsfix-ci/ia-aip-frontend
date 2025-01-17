#!/bin/bash
#echo "${SECURITYCONTEXT}" > /zap/security.context

if [[ -z "$TEST_URL" ]]; then
    echo "TEST_URL environment variable not set" 1>&2
    exit 1
fi

export LC_ALL=C.UTF-8
export LANG=C.UTF-8

zap-x.sh -daemon -host 0.0.0.0 -port 1001 -config database.newsession=3 -config database.newsessionprompt=false -config globalexcludeurl.url_list.url.regex='^https?:\/\/.*\/(?:.*login.*)+$' -config api.disablekey=true -config scanner.attackOnStart=true -config view.mode=attack -config connection.dnsTtlSuccessfulQueries=-1 -config api.addrs.addr.name=.* -config api.addrs.addr.regex=true &
i=0
while !(curl -s http://0.0.0.0:1001) > /dev/null
  do
    i=$(( (i+1) %4 ))
    sleep .1
  done
  echo "ZAP has successfully started"
  zap-cli --zap-url http://0.0.0.0 -p 1001 status -t 120
  zap-cli --zap-url http://0.0.0.0 -p 1001 open-url "${TEST_URL}"
  zap-cli --zap-url http://0.0.0.0 -p 1001 spider ${TEST_URL}
  zap-cli --zap-url http://0.0.0.0 -p 1001 active-scan --scanners all --recursive "${TEST_URL}"
  zap-cli --zap-url http://0.0.0.0 -p 1001 report -o activescan.html -f html
  zap-cli --zap-url http://0.0.0.0 -p 1001 report -o activescanReport.xml -f xml
  echo 'Changing owner from $(id -u):$(id -g) to $(id -u):$(id -u)'
  chown -R $(id -u):$(id -u) activescan.html
  chown -R $(id -u):$(id -u) activescanReport.xml

  curl --fail http://0.0.0.0:1001/OTHER/core/other/jsonreport/?formMethod=GET --output report.json
  cp *.html functional-output/
  cp activescanReport.xml functional-output/
  zap-cli --zap-url http://0.0.0.0 -p 1001 alerts -l Medium --exit-code False

echo
echo ZAP Security vulnerabilities were found that were not ignored
echo
echo Check to see if these vulnerabilities apply to production
echo and/or if they have fixes available. If they do not have
echo fixes and they do not apply to production, you may ignore them
echo
echo To ignore these vulnerabilities, add them to:
echo
echo "./audit.json"
echo
echo and commit the change
