import {
  boolean,
  date,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  time,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const roleValues = ["admin", "docente", "estudiante", "padre"] as const;
export const attendanceStatusValues = ["presente", "tardanza", "ausente", "justificado"] as const;
export const achievementLevelValues = ["AD", "A", "B", "C"] as const;
export const alertLevelValues = ["informativa", "atencion", "urgente"] as const;

export const institutions = mysqlTable(
  "institutions",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    name: varchar("name", { length: 180 }).notNull(),
    modularCode: varchar("modular_code", { length: 30 }),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [uniqueIndex("institutions_modular_code_unique").on(table.modularCode)],
);

export const users = mysqlTable(
  "users",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    institutionId: varchar("institution_id", { length: 36 })
      .notNull()
      .references(() => institutions.id),
    email: varchar("email", { length: 190 }).notNull(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    role: mysqlEnum("role", roleValues).notNull(),
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 120 }).notNull(),
    active: boolean("active").notNull().default(true),
    lastLoginAt: timestamp("last_login_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    uniqueIndex("users_email_unique").on(table.email),
    index("users_institution_idx").on(table.institutionId),
    index("users_role_idx").on(table.role),
  ],
);

export const sessions = mysqlTable(
  "sessions",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash", { length: 64 }).notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("sessions_token_unique").on(table.tokenHash),
    index("sessions_user_idx").on(table.userId),
  ],
);

export const teacherProfiles = mysqlTable("teacher_profiles", {
  userId: varchar("user_id", { length: 36 })
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  staffCode: varchar("staff_code", { length: 40 }),
  specialty: varchar("specialty", { length: 120 }),
});

export const studentProfiles = mysqlTable(
  "student_profiles",
  {
    userId: varchar("user_id", { length: 36 })
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
    studentCode: varchar("student_code", { length: 40 }).notNull(),
    birthDate: date("birth_date", { mode: "string" }),
    active: boolean("active").notNull().default(true),
  },
  (table) => [uniqueIndex("student_profiles_code_unique").on(table.studentCode)],
);

export const guardianProfiles = mysqlTable("guardian_profiles", {
  userId: varchar("user_id", { length: 36 })
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  phone: varchar("phone", { length: 30 }),
});

export const classrooms = mysqlTable(
  "classrooms",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    institutionId: varchar("institution_id", { length: 36 })
      .notNull()
      .references(() => institutions.id),
    name: varchar("name", { length: 120 }).notNull(),
    grade: varchar("grade", { length: 40 }).notNull(),
    section: varchar("section", { length: 20 }).notNull(),
    academicYear: int("academic_year").notNull(),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("classrooms_institution_idx").on(table.institutionId),
    uniqueIndex("classrooms_year_grade_section_unique").on(
      table.institutionId,
      table.academicYear,
      table.grade,
      table.section,
    ),
  ],
);

export const subjects = mysqlTable(
  "subjects",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    institutionId: varchar("institution_id", { length: 36 })
      .notNull()
      .references(() => institutions.id),
    name: varchar("name", { length: 120 }).notNull(),
    color: varchar("color", { length: 12 }).notNull().default("#0F9D94"),
    active: boolean("active").notNull().default(true),
  },
  (table) => [index("subjects_institution_idx").on(table.institutionId)],
);

export const enrollments = mysqlTable(
  "enrollments",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    studentId: varchar("student_id", { length: 36 })
      .notNull()
      .references(() => studentProfiles.userId, { onDelete: "cascade" }),
    classroomId: varchar("classroom_id", { length: 36 })
      .notNull()
      .references(() => classrooms.id, { onDelete: "cascade" }),
    enrolledAt: timestamp("enrolled_at").notNull().defaultNow(),
    active: boolean("active").notNull().default(true),
  },
  (table) => [
    uniqueIndex("enrollments_student_classroom_unique").on(table.studentId, table.classroomId),
    index("enrollments_classroom_idx").on(table.classroomId),
  ],
);

export const guardianStudents = mysqlTable(
  "guardian_students",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    guardianId: varchar("guardian_id", { length: 36 })
      .notNull()
      .references(() => guardianProfiles.userId, { onDelete: "cascade" }),
    studentId: varchar("student_id", { length: 36 })
      .notNull()
      .references(() => studentProfiles.userId, { onDelete: "cascade" }),
    relationship: varchar("relationship", { length: 50 }).notNull(),
    primaryContact: boolean("primary_contact").notNull().default(false),
  },
  (table) => [
    uniqueIndex("guardian_student_unique").on(table.guardianId, table.studentId),
    index("guardian_students_student_idx").on(table.studentId),
  ],
);

export const teacherAssignments = mysqlTable(
  "teacher_assignments",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    teacherId: varchar("teacher_id", { length: 36 })
      .notNull()
      .references(() => teacherProfiles.userId, { onDelete: "cascade" }),
    classroomId: varchar("classroom_id", { length: 36 })
      .notNull()
      .references(() => classrooms.id, { onDelete: "cascade" }),
    subjectId: varchar("subject_id", { length: 36 })
      .notNull()
      .references(() => subjects.id),
    active: boolean("active").notNull().default(true),
  },
  (table) => [
    uniqueIndex("teacher_assignment_unique").on(
      table.teacherId,
      table.classroomId,
      table.subjectId,
    ),
    index("teacher_assignments_teacher_idx").on(table.teacherId),
  ],
);

export const scheduleSlots = mysqlTable(
  "schedule_slots",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    assignmentId: varchar("assignment_id", { length: 36 })
      .notNull()
      .references(() => teacherAssignments.id, { onDelete: "cascade" }),
    dayOfWeek: int("day_of_week").notNull(),
    startsAt: time("starts_at").notNull(),
    endsAt: time("ends_at").notNull(),
    room: varchar("room", { length: 80 }),
  },
  (table) => [
    index("schedule_slots_assignment_idx").on(table.assignmentId),
    index("schedule_slots_day_idx").on(table.dayOfWeek),
  ],
);

export const competencies = mysqlTable(
  "competencies",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    subjectId: varchar("subject_id", { length: 36 })
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 240 }).notNull(),
    description: text("description"),
    active: boolean("active").notNull().default(true),
  },
  (table) => [index("competencies_subject_idx").on(table.subjectId)],
);

export const attendanceRecords = mysqlTable(
  "attendance_records",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    classroomId: varchar("classroom_id", { length: 36 })
      .notNull()
      .references(() => classrooms.id, { onDelete: "cascade" }),
    studentId: varchar("student_id", { length: 36 })
      .notNull()
      .references(() => studentProfiles.userId, { onDelete: "cascade" }),
    recordedById: varchar("recorded_by_id", { length: 36 })
      .notNull()
      .references(() => users.id),
    attendanceDate: date("attendance_date", { mode: "string" }).notNull(),
    status: mysqlEnum("status", attendanceStatusValues).notNull(),
    note: varchar("note", { length: 500 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    uniqueIndex("attendance_student_day_unique").on(
      table.classroomId,
      table.studentId,
      table.attendanceDate,
    ),
    index("attendance_classroom_date_idx").on(table.classroomId, table.attendanceDate),
    index("attendance_student_idx").on(table.studentId),
  ],
);

export const evaluations = mysqlTable(
  "evaluations",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    assignmentId: varchar("assignment_id", { length: 36 })
      .notNull()
      .references(() => teacherAssignments.id),
    competencyId: varchar("competency_id", { length: 36 })
      .notNull()
      .references(() => competencies.id),
    title: varchar("title", { length: 200 }).notNull(),
    evaluationDate: date("evaluation_date", { mode: "string" }).notNull(),
    createdById: varchar("created_by_id", { length: 36 })
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("evaluations_assignment_idx").on(table.assignmentId)],
);

export const competencyResults = mysqlTable(
  "competency_results",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    evaluationId: varchar("evaluation_id", { length: 36 })
      .notNull()
      .references(() => evaluations.id, { onDelete: "cascade" }),
    studentId: varchar("student_id", { length: 36 })
      .notNull()
      .references(() => studentProfiles.userId, { onDelete: "cascade" }),
    level: mysqlEnum("level", achievementLevelValues).notNull(),
    observation: varchar("observation", { length: 700 }),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    uniqueIndex("competency_result_student_unique").on(table.evaluationId, table.studentId),
    index("competency_results_student_idx").on(table.studentId),
  ],
);

export const descriptiveConclusions = mysqlTable(
  "descriptive_conclusions",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    studentId: varchar("student_id", { length: 36 })
      .notNull()
      .references(() => studentProfiles.userId, { onDelete: "cascade" }),
    subjectId: varchar("subject_id", { length: 36 })
      .notNull()
      .references(() => subjects.id),
    period: varchar("period", { length: 80 }).notNull(),
    content: text("content").notNull(),
    status: mysqlEnum("status", ["borrador", "publicada"]).notNull().default("borrador"),
    authorId: varchar("author_id", { length: 36 })
      .notNull()
      .references(() => users.id),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    uniqueIndex("conclusions_student_subject_period_unique").on(
      table.studentId,
      table.subjectId,
      table.period,
    ),
    index("conclusions_student_idx").on(table.studentId),
  ],
);

export const alerts = mysqlTable(
  "alerts",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    studentId: varchar("student_id", { length: 36 })
      .notNull()
      .references(() => studentProfiles.userId, { onDelete: "cascade" }),
    createdById: varchar("created_by_id", { length: 36 })
      .notNull()
      .references(() => users.id),
    title: varchar("title", { length: 180 }).notNull(),
    description: varchar("description", { length: 700 }).notNull(),
    level: mysqlEnum("level", alertLevelValues).notNull().default("informativa"),
    resolvedAt: timestamp("resolved_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("alerts_student_idx").on(table.studentId)],
);

export const messages = mysqlTable(
  "messages",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    institutionId: varchar("institution_id", { length: 36 })
      .notNull()
      .references(() => institutions.id),
    senderId: varchar("sender_id", { length: 36 })
      .notNull()
      .references(() => users.id),
    recipientId: varchar("recipient_id", { length: 36 })
      .notNull()
      .references(() => users.id),
    studentId: varchar("student_id", { length: 36 }).references(() => studentProfiles.userId),
    subject: varchar("subject", { length: 180 }).notNull(),
    body: text("body").notNull(),
    readAt: timestamp("read_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("messages_recipient_idx").on(table.recipientId, table.createdAt),
    index("messages_student_idx").on(table.studentId),
  ],
);

export const notifications = mysqlTable(
  "notifications",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 70 }).notNull(),
    title: varchar("title", { length: 180 }).notNull(),
    body: varchar("body", { length: 500 }).notNull(),
    href: varchar("href", { length: 300 }),
    readAt: timestamp("read_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("notifications_user_idx").on(table.userId, table.createdAt)],
);
