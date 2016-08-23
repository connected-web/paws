# PAWS

PAWS is an automated screenshot gathering tool, that can navigate a web application or game by pressing a set of keys in a sequential order. It explores an app by building up valid routes, checking at each stage to see if it has returned to an existing visual state.

## Install

### Prerequisites

Install ImageMagick:

- e.g. `brew install imagemagick`
- e.g. `sudo apt-get install imagemagick`

Install Node >= 6.

Install the project dependencies:

- `git clone`
- `npm install`

## Run PAWS

Note: PAWS will attempt to resume from its previous state based on the last `report.json`.

To run in multi-config mode, use:
- `npm start`

This will scan the `products` folder for JSON files to run PAWS against.

PAWS will then navigate the site, and create a daily report of images and places found.

## Run a specific config

- `node paws.js products/myapp.json`

## Render a specific journey

- `phantomjs phantom-harness.js ./products/myapp.json Enter,Down,Up outfile.png`

## Website

PAWS comes packed with its own nodejs based website to review rendered reports and navigate screenshots. To start it up, run:

- `npm run website`

## Configure

- Edit `paws.json`
