# Simple loan app with rust and react using claude sonnnet

Asked claude sonnet to create a mortgage loan calculator app using react for the front end with a rust backend.

```bash 
npx create-react-app loan-calculator-frontend
cd loan-calculator-frontend
```


```bash
cargo new loan-calculator-backend
cd loan-calculator-backend
```

After modifying the src as per Claude run both

In backend directory

```bash
cargo run
```

In frontend directory

```bash
npm start
```

### Using Cargo Lambda (serverless)

Asked Claude about serverless deployment and the top pick was AWS. It wasn't all that smmoth to get things running. Was much easier to use cargo lambda

Suggested several options: AWS Lambda, Google cloud functions + Firebase, Azure fucntions 
* In all cases, the rust code has to be modified to use the platform's crates (e.g. `lambda-http` instead of `actix-web`).
    * also the build process is changed, e.g. this for AWS  `cargo build --release --target x86_64-unknown-linux-musl`
    * handling API gateways as per the platform
* The react code is to be built `npn run build`, and then the contents of `build` directory uploaded to static service such as s3, Firebase (google), etc.


Getting lambda to work wasn't flawless, and the suggestions from Calude were helpful, but not super pricise. Better to follow documentation and examples from web searches such as https://medium.com/@jed.lechner/effortless-guide-to-setting-up-aws-lambda-with-rust-b2630eeaa0f0

But the overall idea is simple:

* Build the app using `cargo lambda`
  * test it locally using `cargo lambda watch`
  * then use `cargo lambda build --release`
  * find the `bootstrap` (executable) inside `target/lambda/app_name`  and then `zip` it. 
  * Create a new AWS lambda function (make sure it is open), upload the `bootstrap.zip` file to AWS lambda, create a function_url  
* Put the front end stuff (e.g. create react app) resources on S3
  * `App.js` must `fetch` from url Lambda functions (either function url or API gateway), or just `localhost:9000` for `cargo lambda watch`  
  * `npm run build` and copy all files and directory (e.g. `static`) over to S3 bucket. Set permissions, config.
