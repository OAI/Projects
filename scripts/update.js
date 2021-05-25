'use strict';

const fs = require('fs');
const http = require('http');
const https = require('https');

const fetch = require('node-fetch');

const httpAgent = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({ keepAlive: true, rejectUnauthorized: false });
const bobwAgent = function(_parsedURL) {
  if (_parsedURL.protocol == 'http:') {
    return httpAgent;
  } else {
    return httpsAgent;
  }
};

const token = process.env['GH_TOKEN'] || process.argv[2];
const auth = 'Basic ' + Buffer.from(process.env.GITHUB_ACTOR+ ':' + token).toString('base64');
const delimiter = '<!-- dynamic content -->\n';

let md = '';

function append(s = ''){
  md += s + '\n';
  return md;
}

async function main() {
  const u = `https://api.github.com/repos/OAI/Projects/projects`;
  try {
     const res = await fetch(u,{ agent: bobwAgent, headers: { 'Accept': 'application/vnd.github.inertia-preview+json', 'User-Agent': 'mermade', Authorization: auth }  });
     const p = await res.json();
     append('## Active Projects');
     append('These are the projects currently being moved forward in some capacity. Each project has a listing of to-do, in progress, and done tasks, as well as link to any open issues or discussions.');
     append();
     append('Project|Description|');
     append('|---|---|');
     for (let project of p) {
       if (project.state === 'open' && project.name.indexOf('Incubator')<0) {
          append(`|[**${project.name}**](${project.html_url})|${project.body}|`);
       }
     }
     append();
     append('## Incubator Projects');
     append();
     append('Project|Description|');
     append('|---|---|');
     for (let project of p) {
       if (project.state === 'open' && project.name.indexOf('Incubator')>=0) {
          append(`|[**${project.name}**](${project.html_url})|${project.body}|`);
       }
     }

     let readme = fs.readFileSync('./README.md','utf8');
     readme = readme.split(delimiter);
     readme = readme[0] + delimiter + md + delimiter + readme[2];
     fs.writeFileSync('./README.md',readme,'utf8');
  }
  catch (ex) {
    console.warn(ex.message);
  }
}

main();
