# CTTPie

Simple API service wrapping CTT's HTML website.

## Configuration

| Name         | Type  | Default | Description                                                                                                            |
| ------------ | ----- | ------- | ---------------------------------------------------------------------------------------------------------------------- |
| `CTTPIE_KEY` | `str` | `None`  | Secret key that should be passed in protected calls so that the server side "trusts" the client side (authentication). |
| `CSRF_TOKEN` | `str` | `None`  | Secret [CSRF](https://en.wikipedia.org/wiki/Cross-site_request_forgery) token to be used for CTT API.   |
| `COOKIE`     | `str` | `None`  | Secret cookie to be used for CTT API authentication.                                                                   |

## License

CTTPie is currently licensed under the [Apache License, Version 2.0](http://www.apache.org/licenses/).

## Build Automation

[![Build Status](https://app.travis-ci.com/hivesolutions/cttpie.svg?branch=master)](https://travis-ci.com/github/hivesolutions/cttpie)
[![Build Status GitHub](https://github.com/hivesolutions/cttpie/workflows/Main%20Workflow/badge.svg)](https://github.com/hivesolutions/cttpie/actions)
[![npm Status](https://img.shields.io/npm/v/cttpie.svg)](https://www.npmjs.com/package/cttpie)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://www.apache.org/licenses/)
