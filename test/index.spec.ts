import * as assert from 'assert';
import * as mongoose from 'mongoose';
import { Document, Schema } from 'mongoose';

const finderEnhancer = require('../src/index');

const connection = mongoose.createConnection('mongodb://localhost/test');

const userSchema = new Schema({
  name: String,
});
userSchema.plugin(finderEnhancer);
interface IUserDocument extends Document {
  name: string;
}
const User = connection.model<IUserDocument>('user', userSchema);

const walletSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: () => User },
});
walletSchema.plugin(finderEnhancer);
interface IWalletDocument extends Document {
  user: IUserDocument;
}
const Wallet = connection.model<IWalletDocument>('wallet', walletSchema);

describe('mongoose-finder-enhancer', () => {
  it('should ok', async () => {
    await connection.dropDatabase();
    const newUser = await User.create({ name: 'Misery' });
    await Wallet.create({ user: newUser._id });
    const user = await User.findOne();
    if (!user) {
      throw new Error('user not exists.');
    }
    assert(Object.keys(user.toJSON()).length === 1);
    const walletWithUser = await Wallet.findOne().select('user');
    if (!walletWithUser) {
      throw new Error('wallet not exists.');
    }
    assert(walletWithUser.user instanceof User);
  });
});

after(async () => {
  await connection.close();
});
