// const axios = require('axios');
const fetch = require('node-fetch');

console.log('github:: process ------> ', process.env)

const directus = {
  baseUrl: process.env.PUBLIC_URL || 'http://localhost:8055',
  devUrl: 'https://dev-onrr-cms.app.cloud.gov',
};

const github = {
  publicUrl: 'https://github.com',
  baseUrl: 'https://api.github.com',
  owner: 'onrr',
  repo: 'onrr.gov-site',
  token: process.env.GITHUB_TOKEN,
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
function updateCollectionItem (collection, collectionKey, number) {
  console.log('updateCollection number: ', number)
  fetch(`${ directus.baseUrl }/items/${ collection }/${ collectionKey }`,
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
    .then(result => console.info('Succesfully updated collection item id: ', result.data.id))
    .catch(error => console.error('error', error));
}

module.exports = function registerHook({ filter, action }, { services, exceptions }) {
  const { ServiceUnavailableException, ForbiddenException } = exceptions;
  
	// return {
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
    filter('pages.items.update',  async (input, collection, payload, schema) => {
      // console.log('/******************************************************/')
      // console.log('items input: ', input);
      // console.log('items collection: ', collection);
      // console.log('items payload: ', payload);
      // console.log('items schema: ', schema);
      // console.log('/******************************************************/')

      try {
        if (input.status === 'published') {
          // console.log('Create github issue, payload--------> ', payload);
          

          // TODO: check if github issue exists already, if not create it
          
          
          fetch(`${ directus.baseUrl }/items/${ collection.collection }/${ collection.keys[0] }`)
            .then(response => response.json())
            .then(result => {
              // console.log('item result: ', result)
              // checkForGitHubIssue(result.data.title)
              const raw = JSON.stringify(
                {
                  "title": result.data.title, 
                  "labels": ["CMS", "content"],
                  "body": `New content ready for review: ${ directus.devUrl }/admin/content/${ collection.collection }/${ result.data.id }`
                }
              )
              const request = { ...requestOptions, body: raw }
              // check to see if item has github issue already and 5 mins have passed for api caching
              if (result.data.github_issue_number === null) {
                console.info('Creating github issue')
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
              if (result.number) updateCollectionItem(collection, collection.keys[0], result.number)
            })
            .catch(error => console.error('error', error));
        }
			} catch (error) {
        throw new ServiceUnavailableException(error)
			}
    });
	// };
};
