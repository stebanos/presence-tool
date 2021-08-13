import express from 'express';
import fs from 'fs-extra';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';

const api = {
	_json: (res, obj) => {
	    res.writeHead(200, {
	        'Content-Type': 'application/json',
	        'Access-Control-Allow-Origin': '*',
	        'Access-Control-Allow-Methods': '*'
	    });
	    res.end(JSON.stringify(obj, null, 4));
	},

	_ok: res => {
	    api._json(res, {status: 'ok', message: 'OK'});
	},

	_error: (res, message) => {
	    res.writeHead(404, { 'Content-Type': 'application/json' });
	    res.end(JSON.stringify({ status: 'error', message }, null, 4));
	},
	
	/** API **/
  
  dataFile: file => {
    return async (req, res) => {
      try {
        const data = await fs.readFile(`./data/${file}`);
        api._json(res, JSON.parse(data));
      } catch (err) {
        api._error(res, err);
      }
    };
  },
  
  updatePresences: async (req, res) => {
    try {
      const reqData = JSON.parse(req.body.data);
      const { id, statuses } = reqData;
      api.validateStatuses(statuses);
      const data = await fs.readFile(`./data/presences.json`);
      const presences = JSON.parse(data);
      const index = presences.findIndex(p => p.id === id);
      if (index === -1) {
        throw `Presence with id '${id}' not found.`;
      }
      const presence = presences[index];
      presence.statuses = statuses;
      await fs.writeFile('./data/presences.json', JSON.stringify(presences));
      api._json(res, {'text-message': 'ok'});
    } catch (err) {
      // console.log(err);
      api._error(res, err);
    }
  },
  
  validateStatuses: statuses => {
    // console.log(statuses);
  }
};

export default (app, http) => {
	fs.copyFileSync('./data/initial/presences.json', './data/presences.json');
	fs.copyFileSync('./data/initial/students.json', './data/students.json');
	app.use(cors());
	app.use(bodyParser.urlencoded({extended: false}));
	app.use(bodyParser.json());
	app.use(multer().any());

  app.get('/students', api.dataFile('students.json'));
  app.get('/status-defaults', api.dataFile('status-defaults.json'));
  app.get('/presences', api.dataFile('presences.json'));
  app.post('/update-presences', api.updatePresences);
}
