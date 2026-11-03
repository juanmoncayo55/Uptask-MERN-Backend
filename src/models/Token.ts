import mongoose, {Document, Schema, Types} from 'mongoose';

export interface IToken extends Document {
  token: string
  user: Types.ObjectId
  createdAt: Date
}

const tokenSchema: Schema = new Schema({
  token: {
    type: String,
    required: true
  },
  user: {
    type: Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expiresAt: "10m"
  }
});

const Token = mongoose.model<IToken>('token', tokenSchema);
export default Token;