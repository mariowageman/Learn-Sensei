import { users } from '@db/schema';
import { db } from '@db';
import * as bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

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

export const authConfig = {
  adapter: DrizzleAdapter(db),
  providers: [],
  debug: false,
  logger: {
    error: (code, ...message) => {
      console.error(code, ...message);
    },
    warn: (code, ...message) => {
      console.warn(code, ...message);
    },
    debug: (code, ...message) => {
      console.debug(code, ...message);
    },
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
    async signIn({ email, password }) {
      const user = await authClass.validateUser(email, password);
      return user;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.AUTH_SECRET,
};

//Removed Auth call here.