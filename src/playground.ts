import { db } from "./server/db";
import '@/env'; // Load .env file
await db.user.create({
  data: {
    emailAddress: "test@test.com",
    firstName: "Test",
    lastName: "User",
  },
});
