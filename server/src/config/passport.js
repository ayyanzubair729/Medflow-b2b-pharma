import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { AppDataSource } from "./data-source.js";
import { UserSchema, UserRole } from "../entities/User.js";

const userRepo = () => AppDataSource.getRepository(UserSchema);

const buildFallbackEmail = (provider, providerId) => `${provider}_${providerId}@oauth.local`;

const resolveBusinessName = (profile) => {
  const displayName = profile?.displayName?.trim();
  if (displayName) return displayName;
  const email = profile?.emails?.[0]?.value;
  if (email) return email.split("@")[0];
  return "MedFlow Social User";
};

const findOrCreateOAuthUser = async ({ provider, providerId, profile }) => {
  const email = profile?.emails?.[0]?.value || buildFallbackEmail(provider, providerId);
  let user = await userRepo().findOne({ where: { email } });

  if (!user) {
    user = await userRepo().findOne({ where: { oauth_id: providerId, provider } });
  }

  if (!user) {
    user = userRepo().create({
      email,
      password_hash: null,
      role: UserRole.BUYER,
      business_name: resolveBusinessName(profile),
      license_number: null,
      phone: null,
      address: null,
      is_verified: true,
      is_active: true,
      provider,
      oauth_id: providerId,
    });
    await userRepo().save(user);
  }

  return user;
};

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.OAUTH_CALLBACK_BASE || "http://localhost:3000"}/api/auth/google/callback`,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const user = await findOrCreateOAuthUser({
            provider: "google",
            providerId: profile.id,
            profile,
          });
          done(null, user);
        } catch (error) {
          done(error);
        }
      }
    )
  );
} else {
  console.warn("Google OAuth disabled: missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET.");
}

if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: `${process.env.OAUTH_CALLBACK_BASE || "http://localhost:3000"}/api/auth/facebook/callback`,
        profileFields: ["id", "displayName", "emails"],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const user = await findOrCreateOAuthUser({
            provider: "facebook",
            providerId: profile.id,
            profile,
          });
          done(null, user);
        } catch (error) {
          done(error);
        }
      }
    )
  );
} else {
  console.warn("Facebook OAuth disabled: missing FACEBOOK_APP_ID or FACEBOOK_APP_SECRET.");
}

export default passport;
