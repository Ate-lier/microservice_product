import app from './server/app';
import path from 'path';
import { connect } from './model/client';
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '../.env') });

const PORT = process.env.PORT || 3000;
const URI = 'mongodb://127.0.0.1:27017';
//const URI = 'mongodb://127.0.0.1:27017,127.0.0.1:27020,127.0.0.1:27021/?replicaSet=rs0&readPreference=nearest';

connect(URI)
  .then(() => app.listen(PORT, () => console.log(`listening on port ${PORT}...`)))
  .catch(err => console.log(`App listening failed on ${PORT}...`, err));
