/* Amplify Params - DO NOT EDIT
	AUTH_MEMESRCC3C71449_USERPOOLID
	ENV
	REGION
Amplify Params - DO NOT EDIT */

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

const AWS = require('aws-sdk');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const region = 'us-east-1';
const identity = new AWS.CognitoIdentityServiceProvider();
const sesClient = new SESClient({ region });

async function listAllUsers(userParams) {
    let users = [];
    let paginationToken = null;

    do {
        if (paginationToken) {
            userParams.PaginationToken = paginationToken;
        }

        const { Users, PaginationToken } = await identity.listUsers(userParams).promise();
        users = users.concat(Users);
        paginationToken = PaginationToken;
        console.log("Pulled another page");
    } while (paginationToken);

    return users;
}

async function sendEmail(toAddress, subject, body) {
    const params = {
        Destination: {
            ToAddresses: [toAddress],
        },
        Message: {
            Body: {
                Text: {
                    Data: body,
                },
            },
            Subject: {
                Data: subject,
            },
        },
        Source: 'memeSRC <no-reply@memesrc.com>',
    };

    await sesClient.send(new SendEmailCommand(params));
}

exports.handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    const email = event["email"];

    if (email) {
        console.log(process.env.AUTH_MEMESRCC3C71449_USERPOOLID);
        console.log(`email = \"${email}\"`);
        const userParams = {
            UserPoolId: process.env.AUTH_MEMESRCC3C71449_USERPOOLID,
            AttributesToGet: ['email'],
            Filter: `email = \"${email}\"`,
            Limit: 60,
        };

        try {
            const filteredUsers = await listAllUsers(userParams);

            if (filteredUsers.length > 0) {
                // Sort the users by the creation date in ascending order
                filteredUsers.sort((a, b) => new Date(a.UserCreateDate) - new Date(b.UserCreateDate));
                const userList = filteredUsers.map(user => user.Username);

                // Create the email body with the list of usernames
                const emailBody = userList.length < 2 
                    ? `Your memeSRC username is: ${userList.join('\n • ')}`  // single username found
                    : `Your memeSRC username${userList.length > 0 ? 's' : ''}:\n\n • ${userList.join('\n • ')}\n\n`;  // multiple usernames found

                // Send the email
                await sendEmail(email, 'Username Recovery', emailBody);
                return {
                    statusCode: 200,
                    body: JSON.stringify('Email sent successfully'),
                }
            } else {
                // Create the email body with the list of usernames
                const emailBody = `You requested a memeSRC username recovery, but we couldn't find an account using this email address (${email}). You may have used a different email or haven't yet registered an account.`;

                // Send the email
                await sendEmail(email, 'Username Recovery', emailBody);
                return {
                    statusCode: 200,
                    body: JSON.stringify('Email sent successfully'),
                }
            }
        } catch (error) {
            console.log({ error }, JSON.stringify(error));
            return {
                statusCode: 500,
                body: JSON.stringify(`CAUGHT ERROR: ${error}`),
            };
        }
    } else {
        console.log('FAILED: MissingParameters');
        return {
            statusCode: 404,
            body: JSON.stringify('FAILED: MissingParameters'),
        };
    }
};
