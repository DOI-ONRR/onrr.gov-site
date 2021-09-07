// const axios = require('axios');
const fetch = require('node-fetch');

const directus = {
  baseUrl: 'http://localhost:8055',
  devUrl: 'https://dev-onrr-cms.app.cloud.gov',
};

const github = {
  publicUrl: 'https://github.com',
  baseUrl: 'https://api.github.com',
  owner: 'onrr',
  repo: 'onrr.gov-site',
  token: process.env.GITHUB_TOKEN
};

const headers = new fetch.Headers();
headers.append("Authorization", `token ${ github.token }`);
headers.append("Content-Type", "application/json");

const requestOptions = {
  method: 'POST',
  headers: headers,
  redirect: 'follow'
};

const date = new Date();
const fiveMin = 5*60*1000;


/**
 * 
 * @param {string} collection 
 * @param {object} item 
 * @param {integer} number
 * Updates collection item with github issue number
 */
function updateCollectionItem (collection, item, number) {
  console.log('updateCollection item, data: ', item, number)
  fetch(`${ directus.baseUrl }/items/${ collection }/${ item[0] }`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        "github_issue_number": number
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    }
  )
    .then(response => response.json())
    .then(result => console.log('Succesfully updated collection item id: ', result.data.id))
    .catch(error => console.log('error', error));
}

module.exports = function registerHook({ services, exceptions, env }) {
  const { ServiceUnavailableException } = exceptions;
  
	return {
    // 'items.create': async function ({ event, collection, query, action, payload, database }) {
    //   console.log('/******************************************************/')
    //   console.log('items event: ', event);
    //   console.log('items collection: ', collection);
    //   // console.log('items query: ', query);
    //   // console.log('items action: ', action);
    //   console.log('items payload: ', payload);
    //   // console.log('items database: ', database);
    //   console.log('/******************************************************/')
    //   try {
    //     if (collection === 'pages' && payload?.status === 'review') {
    //       console.log('Create github issue, payload--------> ', payload);
    //       // const response = fetch(
    //       //   "https://api.github.com/repos/onrr/onrr.gov-site/issues", 
    //       //   { ...requestOptions, "title": payload.title })
    //       //   .then(response => response.text())
    //       //   .then(result => console.log(result))
    //       //   .catch(error => console.log('error', error));
    //       // return response;
    //     }
		// 	} catch (error) {
    //     throw new ServiceUnavailableException(error)
		// 	}
    // },
    'items.update': async function ({ event, accountability, collection, item, action, payload, schema, database }) {
      // console.log('/******************************************************/')
      // console.log('items event: ', event);
      // console.log('items accountability: ', accountability);
      // console.log('items collection: ', collection);
      // console.log('items item: ', item);
      // console.log('items action: ', action);
      // console.log('items payload: ', payload);
      // console.log('env: ', env);
      // console.log('/******************************************************/')

      try {
        if (collection === 'pages' && payload?.status === 'review') {
          console.log('Create github issue, payload--------> ', payload);
          

          // TODO: check if github issue exists already, if not create it
          
          
          fetch(`${ directus.baseUrl }/items/${ collection }/${ item[0] }`)
            .then(response => response.json())
            .then(result => {
              console.log('item result: ', result)
              // checkForGitHubIssue(result.data.title)
              const raw = JSON.stringify(
                {
                  "title": result.data.title, 
                  "labels": ["CMS", "content"],
                  "body": `New content ready for review: ${ directus.baseUrl }/admin/collections/${ collection }/${ result.data.id }`
                }
              )
              const request = { ...requestOptions, body: raw }
              // check to see if item has github issue already and 5 mins have passed for api caching
              if (result.data.github_issue_number === null) {
                console.log('Create github issue yo!!!')
                return fetch(`${ github.baseUrl }/repos/${ github.owner }/${ github.repo }/issues`, request);
              } else {
                console.warn("Github issue already exists!", 
                `${ github.publicUrl }/${ github.owner }/${ github.repo }/issues/${ result.data.github_issue_number}`)
              }
            })
            .then(response => {
              // console.log('response------->', response.json())
              return response.json()
            })
            .then(result => {
              console.log('Succesfully created github issue!', result)
              // add github issue id to page item
              if (result.number) updateCollectionItem(collection, item, result.number)
            })
            .catch(error => console.log('error', error));
        }
			} catch (error) {
        throw new ServiceUnavailableException(error)
			}
    }
	};
};
