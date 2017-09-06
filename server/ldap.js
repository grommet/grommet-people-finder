// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP
import express from 'express';
import ldap from 'ldapjs';

const router = express.Router();

let client;
let timer;

router.get('/', (req, res) => {
  if (!client) {
    client = ldap.createClient({
      url: req.query.url,
    });
  }

  const options = {
    scope: req.query.scope || 'sub',
    filter: req.query.filter,
    attributes: req.query.attributes,
    sizeLimit: req.query.limit || 20,
  };

  client.search(req.query.base, options, (ldapErr, ldapRes) => {
    const entries = [];
    if (ldapErr) {
      console.log('client error:', ldapErr);
      if (client) {
        client.unbind();
        client = null;
      }
    } else {
      ldapRes.on('searchEntry', (entry) => {
        entries.push(entry.object);
      });
      ldapRes.on('error', () => res.send(entries));
      ldapRes.on('end', () => res.send(entries));
    }
  });

  // If we're idle for more than 30 seconds. Clean up and start fresh.
  clearTimeout(timer);
  timer = setTimeout(() => {
    client.unbind();
    client = undefined;
  }, 30000);
});

export default router;
