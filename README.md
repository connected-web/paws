# paws

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

To resume or start PAWS, reusing the last state based on `report.json`, use:

- `npm start`

This will navigate the site, and create a daily report of images and places found.

## Website

PAWS comes packed with its own nodejs based website to review rendered reports and navigate screenshots. To start it up, run:

- `npm run website`

## Configure

- Edit `paws.json`
