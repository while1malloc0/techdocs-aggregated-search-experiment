#!/usr/bin/env bash

echo "Setting up mkdocs..."
python -m virtualenv venv
source venv/bin/activate
pip install mkdocs mkdocs-techdocs-core

echo "Building docs..."
pushd first-docs-repo
mkdocs build
popd

pushd second-docs-repo
mkdocs build
popd

echo "Setting up Express server..."
npm i

echo "Ready! Run with 'node main.js'"
