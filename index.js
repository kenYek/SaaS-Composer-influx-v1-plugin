const Influx = require('influx');
const express = require('express');
var cors = require('cors')
let config = require('./config.json');
console.log(config)

var app = express();
app.use(cors())
app.use(express.json());

const port = config.port || 3500;

async function getDataInflux(req, res) {
    const data = req.body;
    const jsonData = JSON.parse(data.jsondata);
    const influx = new Influx.InfluxDB({
        host: data.url,
        database: data.database,
        port: Number(jsonData.port),
        username: data.user,
        password: data.password
    });

    const r = { errCode: 0, data: [] };

    try {
        for (let c = 0; c < data.targets.length; c++) {
            const result = await influx.query(data.targets[c].rawSql);

            if (data.targets[c].type === 'table') {
                const item = {
                    target: data.targets[c].target,
                    type: data.targets[c].type,
                    columns: Object.keys(result[0] || {}).map(key => ({ text: key })),
                    rows: result.map(obj => Object.values(obj))
                };
                r.data.push(item);
            }

            if (data.targets[c].type === 'timeseries') {
                const item = {
                    target: data.targets[c].target,
                    type: data.targets[c].type,
                    datapoints: result.map(obj => [obj.value, obj.time.getTime()])
                };
                r.data.push(item);
            }
        }
        res.json(r);
    } catch (err) {
        r.errCode = 1;
        r.data = err.message;
        res.json(r);
    }
}

async function setDataInflux(req, res) {
  const data = req.body;
  const jsonData = JSON.parse(data.jsondata);
  const influx = new Influx.InfluxDB({
      host: data.url,
      database: data.database,
      port: Number(jsonData.port),
      username: data.user,
      password: data.password
  });
  const r = { errCode: 0, data: [] };
  console.log('---- set ----');
  try {
    await influx.writePoints(data.targets);
    res.json(r);
  }  catch (err) {
    r.errCode = 1;
    r.data = err.message;
    res.json(r);
  }
}

async function checkConnect(req, res) {
    const data = req.body;
    const jsonData = JSON.parse(data.jsondata);
    const influx = new Influx.InfluxDB({
        host: data.url,
        database: data.database,
        port: Number(jsonData.port),
        username: data.user,
        password: data.password
    });

    try {
      await influx.ping(5000);
      res.json({
        errCode: 0,
        data: 'Connection successful'
      });
    } catch (err) {
      console.error('Connection error:', err);
      res.json({
        errCode: 1,
        data: 'Connection failed'
      });
    }
}

app.post('/api/databaseSource/influx/query', getDataInflux);

app.post('/api/databaseSource/influx/set', setDataInflux);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post('/api/databaseSource/influx/connect', checkConnect);
app.all('/api/databaseSource/influx/connect', (req, res) => {
    const r = { errCode: 0 };
    res.json(r);
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
