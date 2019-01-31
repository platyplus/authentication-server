# Authentication server with Passport and JWT

This is a sample auth JWT service for authenticating requests to the Hasura GraphQL Engine. This also exposes login and signup endpoints. Note that this repository can also be used in webhook mode in using the `/webhook` endpoint. The specifics of this repository is that it maps a `user_role` table to generate `x-hasura-allowed-roles` in the JWT claim so multiple roles can work with the Hasura Grapqh Engine as a backend of the application.

The endpoints to manage users are very limited (it is only possible to create a new user through the `/signup` endpoint). This is kind of a choice as this service is meant to be used for authentication only. The user and roles management can be done through the Hasura Graphql Engine or any other service accessing to the same database.

## Rationale

TODO:

## Database schema

Three tables are used:

- `user`
  - `id`: UUID. Primary key. Automatically generated
  - `username`: String. Unique user identifier
  - `password`: String. Hashed with bcrypt
  - `active`: Boolean. If not active, not possible to connect with this user.
- `role`
  - `id`: UUID. Primary key. Automatically generated
  - `name`: String. Unique role identifier
- `user_role`
  - `id`: UUID. Primary key. Automatically generated
  - `role_id`: UUID. Foreign key that references the `id` of the `role` table
  - `user_id`: UUID. Foreign key that references the `id` of the `user` table

## Prerequisites

- PostgreSQL
- Node.js 8.9+

## Getting Started

Note: you can find examples of keys in the repository. DO NOT USE THEM FOR PRODUCTION!

### Environment variables

- `AUTH_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nypPTIfSzZ399o........"`

  RSA private key used to sign the JWT. You need to escape the lines with "\n" in the variable. If the variable is not set, it will try to use the private.pem file.

- `AUTH_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\nV02/4RJi........"`

  RSA private key used to deliver the JWK set. You need to escape the lines with "\n" in the variable. Please not that this feature is not working yet. If the variable is not set, it will try to use the public.pem file.

- `AUTH_KEY_ID="<unique-id-for-this-key>"`

  Used to identify the key currently used to sign the tokens. If the variable is not set, a hash string will be generated from the public key and used instead.

- `DATABASE_URL=postgres://<username>:<password>@<host>:<port>/<database_name>`

  URL to connect to the Postgres database. The format is . For instance: `DATABASE_URL=postgres://postgres:@localhost:5432/postgres`

- `PORT=8080`

The port the server will listen to.

### Build and deploy on Docker

First you need to build the image and to tag it:

```bash
docker build . -t platyplus/authentication:latest
```

TODO: deploy.

### Deploy locally

```bash
# Clone the repo
git clone https://github.com/platyplus/authentication-server

# Change directory
cd authentication-server

# Install NPM dependencies
npm install

# Generate the RSA keys
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout > public.pem

export DATABASE_URL=postgres://postgres:@localhost:5432/postgres

# Apply migrations
# (Note) this step creates tables "users", "roles" and "user_roles" in the database
knex migrate:latest

# Then simply start your app
npm start
```

<!-- ### Deploy with Heroku

TODO: test deployment with heroku, and rewrite this part

```bash
 # Create heroku app
 heroku create <app-name>

 # Create PostgreSQL addon
 heroku addons:create heroku-postgresql:hobby-dev -a <app-name>

 # Add git remote
 git remote add heroku https://git.heroku.com/<app-name>.git

 # Push changes to heroku
 # Note: You need to run this command from the toplevel of the working tree (graphql-enginej)
 git subtree push --prefix community/boilerplates/auth-webhooks/passport-js heroku master

 # Apply migrations
# (Note) this step creates a "users" table in the database
 heroku run knex migrate:latest
``` -->

## Usage

### Signup/Login

Once deployed or started locally, we can create an user using `/signup` API like below:

```bash
curl -H "Content-Type: application/json" \
     -d'{"username": "test123", "password": "test123", "confirmPassword": "test123"}' \
     http://localhost:8080/signup
```

On success, we get the response:

```json
{
  "id": "907f0dc7-6887-4232-8b6e-da3d5908f137",
  "username": "test123",
  "roles": ["user"],
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoicGlsb3UiLCJodHRwczovL2hhc3VyYS5pby9qd3QvY2xhaW1zIjp7IngtaGFzdXJhLWFsbG93ZWQtcm9sZXMiOlsibWFuYWdlciIsInVzZXIiXSwieC1oYXN1cmEtZGVmYXVsdC1yb2xlIjoidXNlciIsIngtaGFzdXJhLXVzZXItaWQiOiI5MDdmMGRjNy02ODg3LTQyMzItOGI2ZS1kYTNkNTkwOGYxMzcifSwiaWF0IjoxNTQ4OTI5MTY2LCJleHAiOjE1NTE1MjExNjYsInN1YiI6IjkwN2YwZGM3LTY4ODctNDIzMi04YjZlLWRhM2Q1OTA4ZjEzNyJ9.hoY-lZ-6rbN_WVFy0Taxbf6QCtDPaTm407l6opv2bz-Hui9T7l7aafStsx9w-UscWUFWHpeStIo1ObV-lT8-j9t-nw9q5fr8wuO2zyKBMXjhD57ykR6BcKvJQMxE1JjyetVLHpj5r4mIb7_kaA8Dj8Vy2yrWFReHXDczYpQGc43mxxC05B5_xdScQrSbs9MkgQRh-Z5EknlLKWkpbuxPvoyWcH1wgLum7UABGNO7drvmcDDaRk6Lt99A3t40sod9mJ3H9UqdooLOfBAg9kcaCSgqWDkmCLBwtM8ONbKZ4cEZ8NEseCQYKqIoyHQH9vbf9Y6GBaJVbBoEay1cI48Hig"
}
```

We can also use `/login` API to fetch the JWT,

```bash
curl -H "Content-Type: application/json" \
     -d'{"username": "test123", "password": "test123"}' \
     http://localhost:8080/login
```

You can use this boilerplate to as a webhook server in using the `/webhook` endpoint to fetch a webhook token:

```bash
curl -H "Content-Type: application/json" \
     -d'{"username": "test123", "password": "test123"}' \
     http://localhost:8080/login
```

<!-- ### JWKS for GraphQL Engine

Auth webhook that can be configured with Hasura GraphQl Engine is available at `/webhook`. It accepts Authorization header to validate the token against an user.

The client just need to add `Authorization: Bearer <token>` to the request sending to GraphQL Engine.

The endpoint (say `http://localhost:8080/webhook`) can be given as an environment variable `HASURA_GRAPHQL_AUTH_HOOK` to GraphQL Engine.

[Read more about webhook here](https://docs.hasura.io/1.0/graphql/manual/auth/webhook.html). -->

<!-- TODO: JWKS endpoint -->

## Limitations

- Not tested with Heroku
- there is not user and role management except to create a single user with no specific role. I myself do this part with a frontend app that access the database through a Hasura GraphQL endpoint.
- The JWKS endpoint `/jwks` is not working, I could not find a way to format the modulus (n) part of the JWK that is read by the Hasura graphql-engine without error. Contribution welcome!
- This server is designed to work with one RSA key only, and does not handle its regular rotation.
- No handling of JWT expiration
  Contributions are welcome!
