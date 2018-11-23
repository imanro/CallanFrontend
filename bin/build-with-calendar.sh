#!/bin/bash

cd ../angular-calendar-week-hours-view
npm run bp
cd ../CallanFrontend

npm update @imanro/angular-calendar-week-hours-view
ng build --configuration=production
