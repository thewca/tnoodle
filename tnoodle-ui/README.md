# TNoodle Web UI

A web ui for TNoodle that uses modern technology, and interacts with the WCA website api
to minimize repeated data entry.

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

- `yarn install` - Install dependencies.
- `yarn start` - Starts a server accessible at http://localhost:3001/.
- `yarn build` - Compiles to `build/` directory.

## Connecting to a development WCA server

Create an OAuth application at http://localhost:3000/oauth/applications/new.
- Name: TNoodle
- Redirect URI: urn:ietf:wg:oauth:2.0:oob
                http://localhost:3001/oauth/wca
- Scopes: public manage_competitions

Then, run `yarn start` with the `REACT_APP_WCA_ORIGIN` and `REACT_APP_TNOODLE_APP_ID` variables set.
For example:

```
REACT_APP_WCA_ORIGIN=http://localhost:3000 REACT_APP_TNOODLE_APP_ID= yarn start
```

## Running tests

`yarn test`

## TODO

- warning when using outdated version of tnoodle
- copies input? save back to big json?
- refresh token?
