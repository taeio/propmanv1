import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import type { Request, Response, NextFunction } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { hashPassword, comparePasswords } from "./passwordUtils";
import { User } from "../shared/schema";

declare global {
  namespace Express {
    interface User {
      id: string;
      username: string;
      email?: string | null;
      firstName?: string | null;
      lastName?: string | null;
    }
  }
}

const PostgresSessionStore = connectPg(session);

export function getSession() {
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    throw new Error("SESSION_SECRET environment variable must be set");
  }

  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  const isProduction = process.env.NODE_ENV === "production";
  
  return session({
    name: 'propman.sid',
    store: new PostgresSessionStore({
      conString: process.env.DATABASE_URL,
      tableName: "sessions",
      ttl: sessionTtl / 1000,
    }),
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    proxy: isProduction,
    cookie: {
      maxAge: sessionTtl,
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      path: '/',
    },
  });
}

export function setupLocalAuth() {
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          return done(null, false, { message: "Invalid username or password" });
        }

        if (!user.password) {
          return done(null, false, { message: "Please sign up with a password" });
        }

        const isValidPassword = await comparePasswords(password, user.password);
        
        if (!isValidPassword) {
          return done(null, false, { message: "Invalid username or password" });
        }

        return done(null, {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        });
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser((user: Express.User, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      if (user) {
        done(null, {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        });
      } else {
        done(null, false);
      }
    } catch (error) {
      done(error);
    }
  });
}

export { hashPassword, comparePasswords };
