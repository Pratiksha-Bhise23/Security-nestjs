// Mock in-memory database for testing/development
interface User {
  id: string;
  email: string;
  otp: string | null;
  otp_expiry: Date | null;
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

class MockDatabase {
  private users: Map<string, User> = new Map();

  async query(sql: string, params: any[] = []): Promise<{ rows: any[] }> {
    // INSERT or UPDATE users
    if (sql.includes('INSERT INTO users')) {
      const email = params[0];
      const otp = params[1];
      const expiry = params[2];

      let user = this.users.get(email);
      if (!user) {
        user = {
          id: `user_${Date.now()}`,
          email,
          otp,
          otp_expiry: expiry,
          is_verified: false,
          created_at: new Date(),
          updated_at: new Date(),
        };
      } else {
        user.otp = otp;
        user.otp_expiry = expiry;
        user.updated_at = new Date();
      }

      this.users.set(email, user);
      return { rows: [] };
    }

    // SELECT users
    if (sql.includes('SELECT * FROM users WHERE email')) {
      const email = params[0];
      const user = this.users.get(email);
      return { rows: user ? [user] : [] };
    }

    if (sql.includes('SELECT id, email, is_verified, created_at FROM users')) {
      const email = params[0];
      const user = this.users.get(email);
      return {
        rows: user
          ? [
              {
                id: user.id,
                email: user.email,
                is_verified: user.is_verified,
                created_at: user.created_at,
              },
            ]
          : [],
      };
    }

    // UPDATE users
    if (sql.includes('UPDATE users SET otp = NULL')) {
      const email = params[0];
      const user = this.users.get(email);
      if (user) {
        user.otp = null;
        user.otp_expiry = null;
        user.is_verified = true;
        user.updated_at = new Date();
      }
      return { rows: [] };
    }

    return { rows: [] };
  }
}

export const mockPool = new MockDatabase();
