// Adapted from https://medium.com/@jed.lechner/effortless-guide-to-setting-up-aws-lambda-with-rust-b2630eeaa0f0

/** Testing
cargo lambda invoke --remote \
  --data-ascii '{"prop1": "You are awesome", "prop2": "LGTM"}' \
  --output-format json \
  http_lambda_1

curl --location 'http://localhost:9000' --header 'Content-Type: application/json' \
--data '{"principal": 1000000.0, "annual_rate": 2.0, "years": 25}'

//see also py/pycall.py using requests

if cors is a problem, can use --disable-cors flag for cargo lambda watch (see help)
*/

use lambda_http::{run, service_fn, Body, Error, Request, RequestPayloadExt, Response};
use serde::{Deserialize, Serialize};
use serde_json;

//use std::cmp::{max, min}; //does not work for floats, use f64::max and f64::min instead

// #[derive(Deserialize, Serialize, Debug, Clone)]
// struct LoanInput {
//     principal: f64,
//     annual_rate: f64,
//     years: u32,
// }

#[derive(Deserialize, Serialize, Debug, Clone)]
struct LoanInputMap {
    purch_price: f64,
    down_payment: f64, //percent
    annual_rate_first: f64, //the first mortgage rate
    duration: u32, //years
    annual_rate_map: f64, //the MAP rate
    prop_tax_and_ins: f64, //property tax and insurance percent
    hoa: f64, //homeowners association fee monthly
}

#[derive(Deserialize, Serialize, Debug, Clone)]
struct LoanOutput {
    monthly_payment: f64,
}

// this is for the conventional loan
fn calculate_monthly_payment(principal: f64, annual_rate: f64, years: u32) -> f64 {
    let monthly_rate = annual_rate / 12.0 / 100.0;
    let num_payments = years * 12;
    
    let numerator = monthly_rate * (1.0 + monthly_rate).powi(num_payments as i32);
    let denominator = (1.0 + monthly_rate).powi(num_payments as i32) - 1.0;
    
    principal * (numerator / denominator)
}

// this is for the MAP (which is interest only, with principal payments as per employee's choice)
fn calculate_monthly_payment_map(principal: f64, annual_rate_map: f64) -> f64 {
    let monthly_rate = annual_rate_map / 12.0 / 100.0;
    
    principal * monthly_rate
}

const MAP_AMT :f64 = 700_000.0;
const DIP_AMT :f64 = 250_000.0;
const RIP_AMT :f64 = 300_000.0;
const ZIP_AMT :f64 = 100_000.0;


#[tokio::main]
async fn main() -> Result<(), Error> {
    run(service_fn(|event: Request| async {
        handle_request(event).await
    }))
    .await
}

// The handler function for incoming Lambda requests.
pub async fn handle_request(event: Request) -> Result<Response<Body>, Error> {
    //println!("Received request: {:?}", event);

    // this is using the body from the request and it should fit the LoanInput struct. 
    // can also use query parameters approach (but that won't work with the frontend, which posts data in body, not query params)
    let loan_input = event.payload::<LoanInputMap>()?;

    //if unwrap() fails, return default 0.0 values
    let loan = loan_input.unwrap_or(LoanInputMap { 
        purch_price: 0.0, //treat as 0 for errors
        down_payment: 10.0,
        annual_rate_first: 7.0,
        duration: 30,
        annual_rate_map: 3.0,
        prop_tax_and_ins: 1.5,
        hoa: 0.0 
        }); // return 0

    let total_loan = loan.purch_price * (1.0 - loan.down_payment / 100.0);
    let hoa = loan.hoa;
    let prop_tax_and_ins = loan.purch_price * (loan.prop_tax_and_ins/ 12.0 /100.0);

    let mut pmnt = hoa + prop_tax_and_ins; 

    let max_map = f64::min(total_loan * 0.6, MAP_AMT); //60% of total loan or 700K, whichever is less
    let max_dip = f64::min(total_loan * 0.2, DIP_AMT); //20% of total loan or 250K, whichever is less

    let min_conv = 250_000.0; //the min conventional loan

    let conv_pmt;
    let map_pmt;

    if total_loan < (MAP_AMT + DIP_AMT + RIP_AMT + ZIP_AMT) {
        map_pmt = calculate_monthly_payment_map(max_map, loan.annual_rate_map);
        conv_pmt = calculate_monthly_payment(min_conv, loan.annual_rate_first, loan.duration);
        pmnt += map_pmt + conv_pmt;
    } else {
        map_pmt = calculate_monthly_payment_map(MAP_AMT, loan.annual_rate_map);
        let conv_loan = f64::max(total_loan - MAP_AMT - DIP_AMT - RIP_AMT - ZIP_AMT, min_conv);
        conv_pmt = calculate_monthly_payment(conv_loan, loan.annual_rate_first, loan.duration);
        pmnt += map_pmt + conv_pmt;
    }
    
    //println!("{:?}",pmnt);

    let tot_pmt = LoanOutput { monthly_payment: pmnt };
    let message_json = serde_json::to_string(&tot_pmt).unwrap();


    // Construct an HTTP response.
    let resp = Response::builder()
        .status(200)
        .header("content-type", "text/html")
        .body(format!("{message_json}").into())
        .map_err(Box::new)?;
    Ok(resp)
}