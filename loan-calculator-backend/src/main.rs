// Adapted from https://medium.com/@jed.lechner/effortless-guide-to-setting-up-aws-lambda-with-rust-b2630eeaa0f0

/**
curl --location 'http://localhost:9000' --header 'Content-Type: application/json' \
--data '{"principal": 1000000.0, "annual_rate": 2.0, "years": 25}'

//see also py/pycall.py using requests

if cors is a problem, can use --disable-cors flag for cargo lambda watch (see help)
*/

use lambda_http::{run, service_fn, Body, Error, Request, RequestPayloadExt, Response};
use serde::{Deserialize, Serialize};
use serde_json;


#[derive(Deserialize, Serialize, Debug, Clone)]
struct LoanInput {
    principal: f64,
    annual_rate: f64,
    years: u32,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
struct LoanOutput {
    monthly_payment: f64,
}


fn calculate_monthly_payment(principal: f64, annual_rate: f64, years: u32) -> f64 {
    let monthly_rate = annual_rate / 12.0 / 100.0;
    let num_payments = years * 12;
    
    let numerator = monthly_rate * (1.0 + monthly_rate).powi(num_payments as i32);
    let denominator = (1.0 + monthly_rate).powi(num_payments as i32) - 1.0;
    
    principal * (numerator / denominator)
}


#[tokio::main]
async fn main() -> Result<(), Error> {
    run(service_fn(|event: Request| async {
        handle_request(event).await
    }))
    .await
}

// The handler function for incoming Lambda requests.
pub async fn handle_request(event: Request) -> Result<Response<Body>, Error> {
    println!("Received request: {:?}", event);

    // this is using the body from the request and it should fit the LoanInput struct. 
    // can also use query parameters approach (but that won't work with the frontend, which posts data in body, not query params)
    let loan_input = event.payload::<LoanInput>()?;

    //if unwrap() fails, return default 0.0 values
    let loan = loan_input.unwrap_or(LoanInput { principal: 0.0, annual_rate: 1.0, years: 1 }); // return 0


    let compute_pmt = calculate_monthly_payment(
        loan.principal,
        loan.annual_rate,
        loan.years
    );

    let pmt = LoanOutput { monthly_payment: compute_pmt };
    let message_json = serde_json::to_string(&pmt).unwrap();

    // Ok(LoanOutput { monthly_payment })

    // Construct an HTTP response.
    let resp = Response::builder()
        .status(200)
        .header("content-type", "text/html")
        .body(format!("{message_json}").into())
        .map_err(Box::new)?;
    Ok(resp)
}


