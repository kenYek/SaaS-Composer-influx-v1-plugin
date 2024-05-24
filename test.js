const Influx = require('influx');
const os = require('os');
const express = require('express');
var cors = require('cors')

/*
URL > http://influxdb.eu.wise-ifactory.com (也有嘗試 http://10.1.0.8 也不行)
Organization > (username) 7067aa79-a3ae-4001-8947-915aa5527bdf 
Token > (password) g8f5u3I0ymbKJJRCHCqsQOlEp
Default Bucket > (database) 8baaf3b9-340c-445e-a5e2-1a0aa39493f4
*/

// const influx = new Influx.InfluxDB({
//   host: 'influxdb.eu.wise-ifactory.com',
//   port: 8086,
//   database: '8baaf3b9-340c-445e-a5e2-1a0aa39493f4',
//   username: '7067aa79-a3ae-4001-8947-915aa5527bdf',
//   password: 'g8f5u3I0ymbKJJRCHCqsQOlEp'
// })

const influx = new Influx.InfluxDB({
  host: 'localhost',
  port: 8086,
  database: 'testdb'
})

var app = express();
app.use(cors())
app.use(express.json());

// 测试连接的 API
app.post('/api/databaseSource/influx/connect', async (req, res) => {
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
});

// 查询数据的 API
app.post('/api/databaseSource/influx/query', async (req, res) => {
  const data = req.body;
  const rawSql = data.rawSql;
  console.log('***: '+ data.rawSql)

  try {
    const result = await influx.query(rawSql);
    res.json({
      errCode: 0,
      data: result
    });
  } catch (err) {
    console.error('Query error:', err);
    res.json({
      errCode: 1,
      data: err.message
    });
  }
});

// 监听端口
const port = 3500;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});