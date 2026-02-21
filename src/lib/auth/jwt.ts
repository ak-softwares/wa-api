import jwt from "jsonwebtoken";

type JwtPayload = {
  id: string;
  email?: string;
  phone?: string;
};

export function generateToken(payload: JwtPayload) {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "30d",
  });
}

export function verifyToken(token: string) {
  return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
}