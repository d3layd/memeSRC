/* Amplify Params - DO NOT EDIT
  API_MEMESRC_GRAPHQLAPIENDPOINTOUTPUT
  API_MEMESRC_GRAPHQLAPIIDOUTPUT
  API_MEMESRC_GRAPHQLAPIKEYOUTPUT
  ENV
  REGION
Amplify Params - DO NOT EDIT */

import crypto from '@aws-crypto/sha256-js';
import { defaultProvider } from '@aws-sdk/credential-provider-node';
import { SignatureV4 } from '@aws-sdk/signature-v4';
import { HttpRequest } from '@aws-sdk/protocol-http';
import { default as fetch, Request } from 'node-fetch';

const GRAPHQL_ENDPOINT = process.env.API_MEMESRC_GRAPHQLAPIENDPOINTOUTPUT;
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const { Sha256 } = crypto;

function createUserDetails(params) {
  const email = params.email ? `email: "${params.email}",` : '';
  const username = params.username ? `username: "${params.username.toLowerCase()}",` : '';
  const stripeId = params.email ? `stripeId: "${params.stripeId}",` : '';
  const sub = params.sub ? `id: "${params.sub}",` : '';
  const status = params.status ? `status: "${params.status}",` : '';

  const query = `
      mutation createUserDetails {
          createUserDetails(input: {${email}${username}${stripeId}${sub}${status}}) {
              id
              email
              createdAt
              stripeId
              username
              updatedAt
              status
          }
      }
  `;

  return query;
}

async function getAllVotes(userSub, nextToken) {
  let query = `
    query ListSeriesUserVotes {
      listSeriesUserVotes(limit: 1000${nextToken ? `, nextToken: "${nextToken}"` : ''}) {
        items {
          id
          boost
          userDetailsVotesId
          seriesUserVoteSeriesId
        }
        nextToken
      }
    }
  `;

  console.log(query);
  const response = await makeRequest(query);
  if (response.statusCode !== 200) {
    throw new Error(
      `Failed to fetch votes. Status code: ${response.statusCode}. Errors: ${JSON.stringify(response.body.errors)}`
    );
  }

  let allItems = response.body.data.listSeriesUserVotes.items;
  if (response.body.data.listSeriesUserVotes.nextToken) {
    console.log('loading another page...');
    console.log(`nextToken: ${response.body.data.listSeriesUserVotes.nextToken}`)
    let newItems = await getAllVotes(userSub, response.body.data.listSeriesUserVotes.nextToken);
    allItems = allItems.concat(newItems);
    console.log('loaded another page');
  }

  return allItems;
}

async function processVotes(allItems, userSub) {
  const votesCount = {};
  const currentUserVotes = {};
  const votesCountUp = {};
  const votesCountDown = {};
  const currentUserVotesUp = {};
  const currentUserVotesDown = {};

  // console.log('CHECKING IF USER VOTES');
  allItems.forEach((vote) => {
    if (vote.boost > 0) {
      votesCountUp[vote.seriesUserVoteSeriesId] = (votesCountUp[vote.seriesUserVoteSeriesId] || 0) + vote.boost;
      if (vote.userDetailsVotesId && vote.userDetailsVotesId.normalize() === userSub.normalize()) {
        currentUserVotesUp[vote.seriesUserVoteSeriesId] =
          (currentUserVotesUp[vote.seriesUserVoteSeriesId] || 0) + vote.boost;
      }
    } else if (vote.boost < 0) {
      votesCountDown[vote.seriesUserVoteSeriesId] = (votesCountDown[vote.seriesUserVoteSeriesId] || 0) + vote.boost;
      if (vote.userDetailsVotesId && vote.userDetailsVotesId.normalize() === userSub.normalize()) {
        currentUserVotesDown[vote.seriesUserVoteSeriesId] =
          (currentUserVotesDown[vote.seriesUserVoteSeriesId] || 0) + vote.boost;
      }
    }

    votesCount[vote.seriesUserVoteSeriesId] = (votesCount[vote.seriesUserVoteSeriesId] || 0) + vote.boost;

    if (vote.userDetailsVotesId) {
      typeof vote.userDetailsVotesId;
      typeof userSub;
      if (vote.userDetailsVotesId.normalize() === userSub.normalize()) {
        currentUserVotes[vote.seriesUserVoteSeriesId] =
          (currentUserVotes[vote.seriesUserVoteSeriesId] || 0) + vote.boost;
      }
    }
  });

  // console.log('Vote Loading Results:');
  // console.log(votesCount);
  // console.log(currentUserVotes);
  // console.log(votesCountUp);
  // console.log(votesCountDown);
  // console.log(currentUserVotesUp);
  // console.log(currentUserVotesDown);

  return {
    allItems,
    votesCount,
    currentUserVotes,
    votesCountUp,
    votesCountDown,
    currentUserVotesUp,
    currentUserVotesDown,
  };
}

function updateUserDetailsCredits(params) {
  const id = params.id ? `id: "${params.id}",` : '';
  const credits = params.credits !== undefined ? `credits: ${params.credits},` : '';

  const mutation = `
    mutation updateUserDetails {
      updateUserDetails(input: {${id}${credits}}) {
        id
        credits
      }
    }
  `;

  return mutation;
}

function updateUserDetails(params) {
  const email = params.email ? `email: "${params.email}",` : '';
  const username = params.username ? `username: "${params.username.toLowerCase()}",` : '';
  const stripeId = params.email ? `stripeId: "${params.stripeId}",` : '';
  const sub = params.sub ? `id: "${params.sub}",` : '';
  const status = params.status ? `status: "${params.status}",` : '';

  const query = `
      mutation updateUserDetails {
          updateUserDetails(input: {${email}${username}${stripeId}${sub}${status}}) {
              createdAt
              email
              id
              stripeId
              username
              updatedAt
              status
          }
      }
  `;

  return query;
}

function getUserDetails(params) {
  // console.log(`getUserDetails PARAMS: ${params}`);
  if (params.username) {
    const query = `
          query listUserDetails {
              listUserDetails(filter: {username: {eq: "${params.username.toLowerCase()}"}}) {
                  items {
                      updatedAt
                      username
                      stripeId
                      id
                      email
                      createdAt
                      status
                      votes {
                        items {
                            series {
                                id
                            }
                        }
                      }
                      credits
                  }
              }
          }
      `;
    // console.log(query);
    return query;
  } else if (params.subId) {
    const query = `
          query getUserDetails {
              getUserDetails(id: "${params.subId}") {
                  createdAt
                  email
                  id
                  stripeId
                  username
                  updatedAt
                  status
                  votes {
                    items {
                        series {
                            id
                        }
                    }
                  }
                  credits
              }
          }
      `;
    // console.log(query);
    return query;
  }
}

async function makeRequest(query) {
  const endpoint = new URL(GRAPHQL_ENDPOINT);

  const signer = new SignatureV4({
    credentials: defaultProvider(),
    region: AWS_REGION,
    service: 'appsync',
    sha256: Sha256,
  });

  const requestToBeSigned = new HttpRequest({
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      host: endpoint.host,
    },
    hostname: endpoint.host,
    body: JSON.stringify({ query }),
    path: endpoint.pathname,
  });

  const signed = await signer.sign(requestToBeSigned);
  const request = new Request(endpoint, signed);

  let statusCode = 200;
  let body;
  let response;

  try {
    response = await fetch(request);
    body = await response.json();
    if (body.errors) statusCode = 400;
  } catch (error) {
    statusCode = 500;
    body = {
      error: [
        {
          message: error.message,
        },
      ],
    };
  }

  return {
    statusCode,
    body,
  };
}

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

export const handler = async (event) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);
  // Get the users sub (if it exist)
  const userSub = event.requestContext?.identity?.cognitoAuthenticationProvider
    ? event.requestContext.identity.cognitoAuthenticationProvider.split(':').pop()
    : '';
  // Grab the request body (if it exist)
  const body = event.body ? JSON.parse(event.body) : '';
  // Get the path
  const path = event.path;
  // Create the response variable
  let response;

  if (path === `/${process.env.ENV}/public/user/new`) {
    const username = body.username;
    const email = body.email;
    const sub = body.sub;
    const status = 'unverified';
    const credits = 0;
    console.log('NEW USER');
    response = await makeRequest(createUserDetails({ username, sub, email, status, credits }));
    console.log(response);
  }

  if (path === `/${process.env.ENV}/public/user/update/status`) {
    const status = 'verified';
    if (userSub && userSub !== '') {
      response = await makeRequest(updateUserDetails({ sub: userSub, status }));
    }
  }

  // This is the new route handler for getting user details.
  if (path === `/${process.env.ENV}/public/user/get`) {
    const subId = userSub;

    if (subId) {
      response = await makeRequest(getUserDetails({ subId }));
    } else {
      response = {
        statusCode: 400,
        body: {
          errors: [
            {
              message: "Request must include either 'username' or 'subId' in Payload.",
            },
          ],
        },
      };
    }
  }

  if (path === `/${process.env.ENV}/public/user/spendCredits`) {
    const subId = event.subId;
    const numCredits = event.numCredits;

    if (!subId || !numCredits) {
      response = {
        statusCode: 400,
        body: {
          errors: [
            {
              message: "Request must include 'subId' and 'numCredits' in Payload.",
            },
          ],
        },
      };
    } else {
      // First, get the user's current credit balance.
      const getUserResponse = await makeRequest(getUserDetails({ subId }));
      const credits = getUserResponse.body.data.getUserDetails.credits;
      // Check if the user has at least one credit.
      if (credits >= numCredits) {
        // The user has at least one credit, so spend one.
        const updatedCredits = credits - numCredits;
        response = getUserResponse;
        await makeRequest(updateUserDetailsCredits({ id: subId, credits: updatedCredits }));
      } else {
        // The user does not have enough credits.
        response = {
          statusCode: 400,
          body: {
            error: 'User does not have enough credits.',
          },
        };
      }
    }
  }

  if (path === `/${process.env.ENV}/public/vote`) {
    // console.log('GET SERIES ID FROM BODY');
    const seriesId = body.seriesId;
    const boost = body.boost;
    // console.log(seriesId);

    console.log('LOAD USER');
    const userDetails = await makeRequest(getUserDetails({ subId: userSub }));
    console.log(userDetails);

    // console.log('SEPERATE USER VOTES');
    const usersVotes = userDetails.body.data.getUserDetails.votes.items;
    // console.log(usersVotes);

    // console.log('CHECK IF VOTE EXIST FOR SERIES ID');
    const voteExist = usersVotes?.some((item) => item.series?.id === seriesId);
    // console.log(voteExist);

    if (!voteExist) {
      // They have not voted for this series yet

      // Build query to cast vote
      console.log('CREATE VOTE QUERY');
      const createVote = `
            mutation createSeriesUserVote {
                createSeriesUserVote(input: {userDetailsVotesId: "${userSub}", seriesUserVoteSeriesId: "${seriesId}", boost: ${
        boost > 0 ? 1 : -1
      }}) {
                  id
                }
            }
        `;
      console.log(createVote);

      // Hit GraphQL to place vote
      response = await makeRequest(createVote);
      console.log(response);
    } else {
      // The user has already voted. Return a Forbidden error with details
      response = {
        statusCode: 403,
        body: {
          name: 'MaxVotesReached',
          message: 'You have reached the maximum number of votes for this series.',
        },
      };
    }
  }

  if (path === `/${process.env.ENV}/public/vote/list`) {
    try {
      // Pull and process the votes from GraphQL
      const rawVotes = await getAllVotes(userSub);
      const { allVotes, votesCount, currentUserVotes, votesCountUp, votesCountDown, currentUserVotesUp, currentUserVotesDown } = await processVotes(rawVotes, userSub);

      const result = {
        votes: votesCount,
        userVotes: currentUserVotes,
        votesUp: votesCountUp,
        votesDown: votesCountDown,
        userVotesUp: currentUserVotesUp,
        userVotesDown: currentUserVotesDown
      };
  
      response = {
        statusCode: 200,
        body: result,
      };
    } catch (error) {
      console.log(`Failed to get votes: ${error.message}`);
      response = {
        statusCode: 500,
        body: `Failed to get votes: ${error.message}`,
      };
    }
  }
  
  // console.log(response);

  return {
    statusCode: response.statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
      ...response.headers,
    },
    body: JSON.stringify(response.body),
  };
};
