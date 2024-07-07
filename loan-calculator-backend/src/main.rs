use actix_web::{web, App, HttpServer, Responder};
use actix_cors::Cors;
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
struct LoanInput {
    principal: f64,
    annual_rate: f64,
    years: u32,
}

#[derive(Serialize)]
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

async fn calculate_loan(input: web::Json<LoanInput>) -> impl Responder {
    let monthly_payment = calculate_monthly_payment(input.principal, input.annual_rate, input.years);
    web::Json(LoanOutput { monthly_payment })
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .wrap(Cors::permissive()) // Be careful with this in production
            .route("/calculate", web::post().to(calculate_loan))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}