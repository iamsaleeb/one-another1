-- AlterTable: User
ALTER TABLE "User"
  ALTER COLUMN "emailVerified" TYPE TIMESTAMPTZ(6),
  ALTER COLUMN "dateOfBirth" TYPE TIMESTAMPTZ(6),
  ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(6),
  ALTER COLUMN "updatedAt" TYPE TIMESTAMPTZ(6);

-- AlterTable: Account
ALTER TABLE "Account"
  ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(6),
  ALTER COLUMN "updatedAt" TYPE TIMESTAMPTZ(6);

-- AlterTable: Session
ALTER TABLE "Session"
  ALTER COLUMN "expires" TYPE TIMESTAMPTZ(6),
  ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(6),
  ALTER COLUMN "updatedAt" TYPE TIMESTAMPTZ(6);

-- AlterTable: VerificationToken
ALTER TABLE "VerificationToken"
  ALTER COLUMN "expires" TYPE TIMESTAMPTZ(6);

-- AlterTable: Church
ALTER TABLE "Church"
  ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(6),
  ALTER COLUMN "updatedAt" TYPE TIMESTAMPTZ(6);

-- AlterTable: ChurchAdmin
ALTER TABLE "ChurchAdmin"
  ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(6);

-- AlterTable: ChurchOrganiser
ALTER TABLE "ChurchOrganiser"
  ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(6);

-- AlterTable: Series
ALTER TABLE "Series"
  ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(6),
  ALTER COLUMN "updatedAt" TYPE TIMESTAMPTZ(6);

-- AlterTable: Event
ALTER TABLE "Event"
  ALTER COLUMN "datetime" TYPE TIMESTAMPTZ(6),
  ALTER COLUMN "cancelledAt" TYPE TIMESTAMPTZ(6),
  ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(6),
  ALTER COLUMN "updatedAt" TYPE TIMESTAMPTZ(6);

-- AlterTable: EventAttendee
ALTER TABLE "EventAttendee"
  ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(6);

-- AlterTable: ChurchFollower
ALTER TABLE "ChurchFollower"
  ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(6);

-- AlterTable: SeriesFollower
ALTER TABLE "SeriesFollower"
  ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(6);

-- AlterTable: PushToken
ALTER TABLE "PushToken"
  ALTER COLUMN "updatedAt" TYPE TIMESTAMPTZ(6);

-- AlterTable: ScheduledNotification
ALTER TABLE "ScheduledNotification"
  ALTER COLUMN "scheduledFor" TYPE TIMESTAMPTZ(6),
  ALTER COLUMN "sentAt" TYPE TIMESTAMPTZ(6),
  ALTER COLUMN "cancelledAt" TYPE TIMESTAMPTZ(6),
  ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(6);
