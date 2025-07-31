package main

import (
	"context"
	"fmt"
	"sync"
	"time"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"

	"lambda-dynamodb-golang/internal/store"
)

// Global variables for DynamoDB client and sync.Once
var (
	dynamoStore *store.DynamoDBClient
	dynamoOnce  sync.Once
)

func handler(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	var greeting string
	sourceIP := request.RequestContext.Identity.SourceIP

	// Lazy initialization of DynamoDB client
	dynamoOnce.Do(func() {
		ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
		defer cancel()
		cfg, err := config.LoadDefaultConfig(ctx)
		if err != nil {
			panic(fmt.Sprintf("Error loading AWS config: %s", err))
		}
		dynamoClient := dynamodb.NewFromConfig(cfg)
		dynamoStore = store.NewDynamoDBClient(dynamoClient)
		fmt.Println("DynamoDB client initialized (lazy)")
	})

	if dynamoStore != nil {
		err := dynamoStore.AddItem(context.TODO(), sourceIP)
		if err != nil {
			fmt.Printf("DynamoDB error: %s\n", err)
		} else {
			fmt.Println("Successfully recorded request in DynamoDB")
		}
	}

	return events.APIGatewayProxyResponse{
		Body:       greeting,
		StatusCode: 200,
	}, nil
}

func main() {
	lambda.Start(handler)
}
