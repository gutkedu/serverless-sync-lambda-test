use aws_sdk_dynamodb::{model::AttributeValue, Client};
use lambda_http::{service_fn, Body, Error, Request, RequestExt, Response};
use std::env;
use uuid::Uuid;

/// Main function
#[tokio::main]
async fn main() -> Result<(), Error> {
    // Initialize the AWS SDK for Rust
    let config = aws_config::load_from_env().await;
    let table_name = env::var("TABLE_NAME").expect("TABLE_NAME must be set");
    let dynamodb_client = Client::new(&config);

    // Register the Lambda handler
    //
    // We use a closure to pass the `dynamodb_client` and `table_name` as arguments
    // to the handler function.
    lambda_http::run(service_fn(|request: Request| {
        put_item(&dynamodb_client, &table_name, request)
    }))
    .await?;

    Ok(())
}

/// This function will run for every invoke of the Lambda function.
async fn put_item(
    client: &Client,
    table_name: &str,
    request: Request,
) -> Result<Response<Body>, Error> {
    // Generate a unique ID
    let id = Uuid::new_v4().to_string();

    // Get source IP from request
    let source_ip = match request.request_context() {
        lambda_http::request::RequestContext::ApiGatewayV1(ctx) => ctx.identity.source_ip.unwrap_or_else(|| "unknown".to_string()),
        lambda_http::request::RequestContext::ApiGatewayV2(ctx) => ctx.http.source_ip.unwrap_or_else(|| "unknown".to_string()),
        lambda_http::request::RequestContext::Alb(_) => "unknown".to_string(),
        _ => "unknown".to_string(),
    };

    // Generate timestamp
    let timestamp = chrono::Utc::now().to_rfc3339();

    // Put the item in the DynamoDB table with the updated schema
    let res = client
        .put_item()
        .table_name(table_name)
        .item("id", AttributeValue::S(id))
        .item("sourceIP", AttributeValue::S(source_ip))
        .item("timestamp", AttributeValue::S(timestamp))
        .item("from", AttributeValue::S("rust".to_string()))
        .send()
        .await;

    // Return a response to the end-user
    match res {
        Err(err) => {
            eprintln!("Error putting item: {:?}", err);
            Ok(Response::builder().status(500).body(format!("Failed to save item: {}", err).into())?)
        },
        Ok(_) => Ok(Response::builder().status(200).body("item saved".into())?),
    }
}

