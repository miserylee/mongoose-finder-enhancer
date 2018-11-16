import * as assert from 'assert';
import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';

const schema = new Schema({
  name: String,
});

schema.plugin(require('../src/index'));

const connection = mongoose.createConnection('mongodb://localhost/test');
const User = connection.model('user', schema);

describe('mongoose-finder-enhancer', () => {
  it('should ok', async () => {
    await User.create({ name: 'Misery' });
    const user = await User.findOne();
    if (user) {
      assert(Object.keys(user.toJSON()).length === 1);
      await user.remove();
    }
  });
});

after(async () => {
  await connection.close();
});
