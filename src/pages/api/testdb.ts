import db from 'api/server/db';
import { NextApiRequest, NextApiResponse } from 'next';

export type Token = {
  name: string;
  token: string | null;
};

type TypedRequest = Omit<NextApiRequest, 'body'> & {
  body: Token;
};

const handler = async (req: TypedRequest, res: NextApiResponse) => {
  const {
    body: { name, token },
    method,
  } = req;
  switch (method) {
    case 'GET':
      try {
        const [rows] = await db.query<Token>('select * from tokens', undefined);
        res.statusCode = 200;
        res.json(rows);
      } catch (error) {
        res.status(500);
        res.json({ error: String(error) });
      }
      break;
    case 'POST': {
      await db.query<Token>(
        `insert into tokens (name,token) values ('${name}', '${token}')`,
        undefined,
      );
      res.status(201);
      res.json({ name, token });
      break;
    }
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
};

export default handler;
