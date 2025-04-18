import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Context, S3Event } from 'aws-lambda';
import axiosInstance from '../../lib/axiosInstance';
import compressPdf from './compress';

const s3Client = new S3Client();

const COMPRESSION = {
    PREFIX: process.env.COMPRESSION_PREFIX || 'compressed',
    S3_BUCKET: process.env.COMPRESSION_S3_BUCKET,
};

export const handler = async (event: S3Event, context: Context) => {
    let itemId: string = '';
    try {
        console.log(
            'Event',
            event,
            event.Records?.[0].s3,
            event.Records?.[0].requestParameters,
            event.Records?.[0].responseElements,
        );
        // const item = JSON.parse(event.body);
        if (!event.Records || event.Records.length !== 1) {
            throw new Error('Invalid event');
        }
        // const item = JSON.parse(event.Records[0]?.s3?.object?.key);
        const s3Key = event.Records[0]?.s3?.object?.key || '';
        if (!s3Key) {
            throw new Error('Invalid item');
        }
        console.log('s3Key', s3Key);
        itemId = s3Key.replace('compressed/input/', '').replace('.pdf', '');
        console.log('itemId', itemId);
        const { Body: data } = await s3Client.send(
            new GetObjectCommand({
                Bucket: COMPRESSION.S3_BUCKET,
                Key: `${COMPRESSION.PREFIX}/input/${itemId}.pdf`,
            }),
        );

        if (!data) {
            throw new Error('Error fetching input file from S3!');
        }
        console.log('Input file fetched');

        const output = await compressPdf(data as unknown as Buffer);
        await s3Client.send(
            new PutObjectCommand({
                Bucket: COMPRESSION.S3_BUCKET,
                Key: `${COMPRESSION.PREFIX}/output/${itemId}.pdf`,
                Body: output,
            }),
        );
        console.log('Output file uploaded');

        const cbResponse = await axiosInstance.get(`${itemId}`);
        // const cbResponse = await axios.get(`${COMPRESSION.CALLBACK_URL}/${itemId}?token=${COMPRESSION.CALLBACK_TOKEN}`);
        console.log('Callback response', cbResponse.data);
        return { statusCode: 200, body: 'OK' };
    } catch (error) {
        console.error('Error fetching input file', error);
        await axiosInstance.get(`${itemId}`);
        return { statusCode: 500, body: 'Internal server error' };
    }
};
