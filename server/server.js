// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import compression from 'compression';
import express from 'express';
import http from 'http';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import path from 'path';

import ldap from './ldap';

const router = express.Router();

const PORT = process.env.PORT || 8020;

const app = express();

app.use(compression());

app.use(cookieParser());

app.use(morgan('tiny'));

app.use(bodyParser.json());

app.use('/ldap', ldap).use('', router);

app.use('/', (req, res, next) => {
  const acceptLanguageHeader = req.headers['accept-language'];
  if (acceptLanguageHeader) {
    const acceptedLanguages = acceptLanguageHeader.match(/[a-zA-z-]{2,10}/g);
    if (acceptedLanguages) {
      res.cookie('languages', JSON.stringify(acceptedLanguages));
    }
  }
  next();
});

app.use('/', express.static(path.join(__dirname, '/../dist')));
app.get(
  '/*', (req, res) => res.sendFile(path.resolve(path.join(__dirname, '/../dist/index.html')))
);

const server = http.createServer(app);

server.listen(PORT);

console.log(`Server started, listening at: http://localhost:${PORT}...`);
