# CTTPie

Simple API service wrapping [CTT's](https://www.ctt.pt) HTML website.

## Rational

It should make use of the regular CTT website to get tracking information, but in a more programmatic way.

The underlying code should mek use of the `node-fetch` and `node-html-parser` packages to make requests to the CTT website and parse them.

## Usage

The package can be used in a simple way, by just calling the root endpoint (`/`) with a tracking number (`tracking`) as a `GET` parameter.

```bash
yarn dev
```

```bash
curl -X GET http://localhost:3000/?tracking=RR123456789PT
```

## Configuration

| Name             | Type  | Default | Description                                                                                                            |
| ---------------- | ----- | ------- | ---------------------------------------------------------------------------------------------------------------------- |
| `CTTPIE_KEY`     | `str` | `None`  | Secret key that should be passed in protected calls so that the server side "trusts" the client side (authentication). |
| `CTTPIE_HANDLER` | `str` | `neo`   | The handler that is going to be used to find and process tracking numbers (eg: `neo`, `legacy`).                       |
| `API_VERSION`    | `str` | `None`  | Secret Base64 CTT API version to be used in API requests.                                                              |
| `CSRF_TOKEN`     | `str` | `None`  | Secret [CSRF](https://en.wikipedia.org/wiki/Cross-site_request_forgery) token to be used for CTT API.                  |
| `COOKIE`         | `str` | `None`  | Secret cookie to be used for CTT API authentication.                                                                   |

## License

CTTPie is currently licensed under the [Apache License, Version 2.0](http://www.apache.org/licenses/).

## Build Automation

[![Build Status](https://app.travis-ci.com/hivesolutions/cttpie.svg?branch=master)](https://travis-ci.com/github/hivesolutions/cttpie)
[![Build Status GitHub](https://github.com/hivesolutions/cttpie/workflows/Main%20Workflow/badge.svg)](https://github.com/hivesolutions/cttpie/actions)
[![npm Status](https://img.shields.io/npm/v/cttpie.svg)](https://www.npmjs.com/package/cttpie)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://www.apache.org/licenses/)
