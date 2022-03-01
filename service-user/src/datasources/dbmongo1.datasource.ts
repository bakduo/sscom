import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';
import config from 'config';
import {IConfigApp} from '../models/configure';


const configEnv:IConfigApp = config.get('app');

const configDB = {
  name: "dbmongo1",
  connector: 'mongodb',
  url: configEnv.db.env.url,
  host: configEnv.db.env.host,
  port: configEnv.db.env.port,
  user: configEnv.db.env.user,
  password: configEnv.db.env.password,
  database: configEnv.db.env.database,
  useNewUrlParser: true
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class Dbmongo1DataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'dbmongo1';
  static readonly defaultConfig = configDB;

  constructor(
    @inject('datasources.config.dbmongo1', {optional: true})
    dsConfig: object = configDB,
  ) {
    super(dsConfig);
  }
}
