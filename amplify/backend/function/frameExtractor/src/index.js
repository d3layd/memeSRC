/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	STORAGE_MEMESRCGENERATEDIMAGES_BUCKETNAME
Amplify Params - DO NOT EDIT */
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');

ffmpeg.setFfmpegPath(ffmpegPath);

const CHUNK_DURATION = 25; // Duration of each chunk in seconds
const FPS = 10; // Frames per second of the source

const s3Client = new S3Client({ region: process.env.REGION });

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
  try {
    const { index, season, episode, frame } = event.pathParameters;

    if (!index || !season || !episode || !frame) {
      return {
        statusCode: 400,
        body: JSON.stringify('Missing required path parameters'),
      };
    }

    const frameNumber = parseInt(frame);

    if (isNaN(frameNumber) || frameNumber < 1) {
      return {
        statusCode: 400,
        body: JSON.stringify('Invalid frame number'),
      };
    }

    const fileIndex = Math.floor((frameNumber - 1) / (CHUNK_DURATION * FPS));
    const internalFrameIndex = ((frameNumber - 1) % (CHUNK_DURATION * FPS)) / FPS;

    const bucketName = process.env.STORAGE_MEMESRCGENERATEDIMAGES_BUCKETNAME;
    const objectKey = `protected/src/${index}/${season}/${episode}/${fileIndex}.mp4`;
    const videoFile = path.join('/tmp', `video-${Date.now()}.mp4`);
    const outputFile = path.join('/tmp', `frame-${Date.now()}.jpg`);

    const getObjectParams = {
      Bucket: bucketName,
      Key: objectKey,
    };

    const getObjectCommand = new GetObjectCommand(getObjectParams);
    const response = await s3Client.send(getObjectCommand);
    const videoStream = response.Body;

    await new Promise((resolve, reject) => {
      const fileStream = fs.createWriteStream(videoFile);
      videoStream.pipe(fileStream);
      fileStream.on('finish', resolve);
      fileStream.on('error', reject);
    });

    await new Promise((resolve, reject) => {
      const command = ffmpeg(videoFile)
        .outputOptions([
          `-ss ${internalFrameIndex}`,
          '-vframes 1',
          '-vf scale=iw*sar:ih,setsar=1',
          '-c:v mjpeg',
          '-f image2',
        ])
        .output(outputFile)
        .on('end', resolve)
        .on('error', (err) => {
          console.error('FFmpeg error:', err);
          reject(err);
        });

      console.log('FFmpeg command:', JSON.stringify(command.toString()));
      console.log('S3 Object Key:', objectKey);
      console.log('Internal Frame Index:', internalFrameIndex);
      console.log('Output File:', outputFile);

      command.run();
    });

    const imageBuffer = fs.readFileSync(outputFile);
    const base64Image = imageBuffer.toString('base64');

    // Clean up temporary files
    fs.unlinkSync(videoFile);
    fs.unlinkSync(outputFile);

    const lambdaResponse = {
      statusCode: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Cache-Control': 'max-age=31536000',
      },
      body: base64Image,
      isBase64Encoded: true,
    };

    return lambdaResponse;
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify(`An error occurred: ${error}`),
    };
  }
};
