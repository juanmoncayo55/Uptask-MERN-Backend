import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

type PayloadTypes = {
  id: Types.ObjectId
}

export const generateJWT = (payload: PayloadTypes) => {
  
  const encode = jwt.sign(payload, process.env.SECRET_KEY, {
    expiresIn: "3h"
  });

  return encode;
}