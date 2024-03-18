# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

*

### Changed

*

### Fixed

*

## [0.5.1] - 2024-03-18

### Added

* New deploy script

## [0.5.0] - 2024-03-18

### Added

* Support for mode HTTP header memory space

### Changed

* Bumped packages

### Fixed

* Issue related to headers memory space allocation (`--max-http-header-size`)

## [0.4.0] - 2022-02-12

### Added

* API version support for more flexibility in CTT API consumption
* Automated API version retrieval process

### Changed

* Moved from `request` to `node-fetch`

## [0.3.1] - 2022-02-10

### Added

* Dynamic support for handlers using the `CTTPIE_HANDLER` configuration value

### Changed

* Bumped dependency packages
* Better `try` and `catch` for parsing

## [0.3.0] - 2022-02-09

### Added

* Support for JSON base API parsing for CTT

## [0.2.0] - 2021-07-22

### Added

* Support for header parsing (status, date, hour, etc.) for the tracking page
