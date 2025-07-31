import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

const logger = new Logger();
const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Interface matching the provided model
interface Item {
    id: string;
    sourceIP: string;
    timestamp: string;
    from: string;
}

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {APIGatewayProxyEvent} event - API Gateway Lambda Proxy Input Format
 * @param {Context} object - API Gateway Lambda $context variable
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {APIGatewayProxyResult} object - API Gateway Lambda Proxy Output Format
 *
 */

export const lambdaHandler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
    let response: APIGatewayProxyResult;

    // Log the incoming event
    logger.info('Lambda invocation event', { event });
    // Append awsRequestId to each log statement
    logger.appendKeys({
        awsRequestId: context.awsRequestId,
    });

    try {
        // Create an item to store in DynamoDB
        const item: Item = {
            id: randomUUID(),
            sourceIP: event.requestContext.identity?.sourceIp || 'unknown',
            timestamp: new Date().toISOString(),
            from: 'nodejs',
        };

        const tableName = process.env.TABLE_NAME;

        // Save item to DynamoDB
        await docClient.send(
            new PutCommand({
                TableName: tableName,
                Item: item,
            }),
        );

        response = {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Item saved successfully',
                item: item,
            }),
        };
        logger.info(
            `Successfully saved item to DynamoDB and responded from API endpoint: ${event.path}`,
            response.body,
        );
        return response;
    } catch (err) {
        // Error handling
        logger.error(`Error occurred: ${err}`);
        response = {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Failed to save item to DynamoDB',
                error: err instanceof Error ? err.message : 'Unknown error',
            }),
        };
        return response;
    }
};
