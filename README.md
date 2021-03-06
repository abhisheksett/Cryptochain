# Cryptochain

This is a full stack blockchain project which introduces a crypto currency. The following are the salient features:

- Features of the blockchain
    - Fully working blockchain
    - Contains adjusted difficulty
    - Guard against difficulty jump
    - Implements proof of work with longest chain method
    - Difficulty check happens on binary bits of the genarated hash instead of leading hasg characters

- Features of the app
    - Complete typescript support
    - Developed with TDD approach with 100% test coverage
    - Lint and Prettier enabled for maintaining code quality
    - Using Redis for pub sub
    - Uses Elliptic curve digital signature algorithm
    - Frontend is built using React
    - Webpack is used as bundler
    - Express server acts as both web and api server

- Scripts
    - *yarn dev* - To start local dev server. It runs webpack watch and serves the built files from express server. Access url: http://localhost:3000


### TODO
- Currently Redis is added with an older version and without Typescript support. Need to upgrade it and make it work with latest version

### This project is currently work in progress.