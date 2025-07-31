package store

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/google/uuid"

	"lambda-dynamodb-golang/internal/models"
)

// DynamoDBClient wraps the DynamoDB client
type DynamoDBClient struct {
	client *dynamodb.Client
}

// NewDynamoDBClient creates a new DynamoDB client
func NewDynamoDBClient(client *dynamodb.Client) *DynamoDBClient {
	return &DynamoDBClient{
		client: client,
	}
}

// AddItem adds an item to DynamoDB
func (d *DynamoDBClient) AddItem(ctx context.Context, sourceIP string) error {
	tableName := os.Getenv("TABLE_NAME")
	if tableName == "" {
		return fmt.Errorf("TABLE_NAME environment variable not set")
	}

	item := models.Item{
		ID:        uuid.New().String(),
		SourceIP:  sourceIP,
		From:      "Golang",
		Timestamp: time.Now().Format(time.RFC3339),
	}

	av, err := attributevalue.MarshalMap(item)
	if err != nil {
		return fmt.Errorf("error marshalling item: %w", err)
	}

	input := &dynamodb.PutItemInput{
		Item:      av,
		TableName: &tableName,
	}

	_, err = d.client.PutItem(ctx, input)
	if err != nil {
		return fmt.Errorf("error adding item to DynamoDB: %w", err)
	}

	return nil
}
