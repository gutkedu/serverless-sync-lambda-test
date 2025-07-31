package models

type Item struct {
	ID        string `json:"id" dynamodbav:"id"`
	SourceIP  string `json:"sourceIP" dynamodbav:"sourceIP"`
	Timestamp string `json:"timestamp" dynamodbav:"timestamp"`
	From      string `json:"from" dynamodbav:"from"`
}
