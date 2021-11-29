gcurl -u ${CIRCLECI_TOKEN}: -X POST --header "Content-Type: application/json" -d '{
  "parameters": {
    "run_cms_updates": true
  }
}' https://circleci.com/api/v2/project/<vcs-type>/<org>/<repo>/pipeline