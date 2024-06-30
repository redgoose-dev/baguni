#!/bin/bash

# build app
bun run build

# install app
if [[ -n $EMAIL && -n $NAME && -n $PASSWORD ]]; then
  echo "⚙️Install app"
  bun run app-install --email $EMAIL --name $NAME --password $PASSWORD
fi

# run server
bun run preview
