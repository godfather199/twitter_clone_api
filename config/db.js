import {connect, set} from 'mongoose'
import {config} from 'dotenv'


config()
set('strictQuery', true)
// console.log('Mongo string: ', process.env.MONGO_URL)


const mongoConnect = () => {
  connect(process.env.MONGO_URL)
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((err) => {
      console.log(`Cannot connect to MongoDB: ${err}`);
    });
}



export default mongoConnect