import { db } from '@db';
import { users } from '@db/schema';
import * as bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import session from 'express-session';
import { pool } from '@db';
import ConnectPgSimple from 'connect-pg-simple';

const PgSession = ConnectPgSimple(session);

export class AuthClass {
  private static instance: AuthClass;

  private constructor() {
    console.log('Initializing AuthClass...');
  }

  static getInstance(): AuthClass {
    if (!AuthClass.instance) {
      AuthClass.instance = new AuthClass();
    }
    return AuthClass.instance;
  }

  async createUser(email: string, password: string, displayName: string) {
    console.log('Creating new user:', email);
    const passwordHash = await bcrypt.hash(password, 10);
    return db.insert(users).values({
      email,
      displayName,
      passwordHash
    }).returning();
  }

  async validateUser(email: string, password: string) {
    console.log('Validating user:', email);
    const user = await db.query.users.findFirst({
      where: eq(users.email, email)
    });

    if (!user) {
      console.log('User not found:', email);
      return null;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    console.log('Password validation result:', isValid);

    if (!isValid) {
      return null;
    }

    return user;
  }

  async getUserSession(req: any) {
    const sessionId = req.session?.userId;
    if (!sessionId) {
      return null;
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, sessionId)
    });

    return user ? { user } : null;
  }
}

export const authClass = AuthClass.getInstance();

export const sessionConfig = {
  store: new PgSession({
    pool,
    tableName: 'sessions'
  }),
  secret: process.env.AUTH_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  }
};

export const authConfig = {
  adapter: DrizzleAdapter(db),
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [],
  debug: false,
  logger: {
    error: (code: string, ...message: any[]) => {
      console.error(code, ...message);
    },
    warn: (code: string, ...message: any[]) => {
      console.warn(code, ...message);
    },
    debug: (code: string, ...message: any[]) => {
      console.debug(code, ...message);
    },
  },
  callbacks: {
    async session({ session, user }: { session: any, user: any }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
    async signIn({ email, password }: { email: string, password: string }) {
      const user = await authClass.validateUser(email, password);
      return user;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.AUTH_SECRET,
};