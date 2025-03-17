import { ObjectId } from "mongodb";
import User from "@/models/User";
import Account from "@/models/Account";
import Session from "@/models/Session";
import VerificationToken from "@/models/VerificationToken";

export default function MongooseAdapter() {
  return {
    // User operations
    async createUser(userData) {
      const user = await User.create(userData);
      return convertDocToObj(user);
    },

    async getUser(id) {
      try {
        const user = await User.findById(id);
        return user ? convertDocToObj(user) : null;
      } catch (error) {
        return null;
      }
    },

    async getUserByEmail(email) {
      const user = await User.findOne({ email });
      return user ? convertDocToObj(user) : null;
    },

    async getUserByAccount({ provider, providerAccountId }) {
      const account = await Account.findOne({ provider, providerAccountId });
      if (!account) return null;

      const user = await User.findById(account.userId);
      return user ? convertDocToObj(user) : null;
    },

    async updateUser(user) {
      const updated = await User.findByIdAndUpdate(
        user.id,
        { ...user },
        { new: true }
      );
      return convertDocToObj(updated);
    },

    async deleteUser(userId) {
      await Promise.all([
        User.findByIdAndDelete(userId),
        Account.deleteMany({ userId }),
        Session.deleteMany({ userId }),
      ]);
      return null;
    },

    // Account operations
    async linkAccount(accountData) {
      const account = await Account.create({
        ...accountData,
        userId: new ObjectId(accountData.userId),
      });
      return convertDocToObj(account);
    },

    async unlinkAccount({ provider, providerAccountId }) {
      const account = await Account.findOneAndDelete({
        provider,
        providerAccountId,
      });
      return account ? convertDocToObj(account) : null;
    },

    // Session operations
    async createSession(sessionData) {
      const session = await Session.create({
        ...sessionData,
        userId: new ObjectId(sessionData.userId),
      });
      return convertDocToObj(session);
    },

    async getSessionAndUser(sessionToken) {
      const session = await Session.findOne({ sessionToken });
      if (!session) return null;

      const user = await User.findById(session.userId);
      if (!user) return null;

      return {
        session: convertDocToObj(session),
        user: convertDocToObj(user),
      };
    },

    async updateSession(session) {
      const updated = await Session.findOneAndUpdate(
        { sessionToken: session.sessionToken },
        session,
        { new: true }
      );
      return updated ? convertDocToObj(updated) : null;
    },

    async deleteSession(sessionToken) {
      const session = await Session.findOneAndDelete({ sessionToken });
      return session ? convertDocToObj(session) : null;
    },

    // Verification Token operations
    async createVerificationToken(data) {
      const verificationToken = await VerificationToken.create(data);
      return convertDocToObj(verificationToken);
    },

    async useVerificationToken({ identifier, token }) {
      const verificationToken = await VerificationToken.findOneAndDelete({
        identifier,
        token,
      });
      return verificationToken ? convertDocToObj(verificationToken) : null;
    },
  };
}

// Helper to convert Mongoose document to plain object and handle ObjectId
function convertDocToObj(doc) {
  const obj = doc.toObject ? doc.toObject() : doc;

  // Convert _id to id
  if (obj._id) {
    obj.id = obj._id.toString();
    delete obj._id;
  }

  // Convert any nested ObjectIds
  Object.keys(obj).forEach((key) => {
    if (obj[key] instanceof ObjectId) {
      obj[key] = obj[key].toString();
    }
  });

  return obj;
}
