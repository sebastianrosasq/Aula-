import "server-only";

import { and, count, desc, eq, gte, inArray, isNull, ne, or } from "drizzle-orm";
import { getDb } from "@/db";
import type { CourseCatalogItem, CourseRole } from "@/lib/course-types";
import {
  alerts,
  attendanceRecords,
  classrooms,
  competencyResults,
  enrollments,
  evaluations,
  guardianStudents,
  institutions,
  messages,
  notifications,
  scheduleSlots,
  studentProfiles,
  subjects,
  teacherAssignments,
  users,
} from "@/db/schema";

function peruClock() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Lima",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  const dayMap: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };

  return {
    dayOfWeek: dayMap[value("weekday")] ?? 1,
    time: `${value("hour")}:${value("minute")}:00`,
    date: `${value("year")}-${value("month")}-${value("day")}`,
  };
}

export async function getTeacherContext(teacherId: string) {
  const db = getDb();
  const now = peruClock();
  const slots = await db
    .select({
      assignmentId: teacherAssignments.id,
      classroomId: classrooms.id,
      classroomName: classrooms.name,
      grade: classrooms.grade,
      section: classrooms.section,
      subjectName: subjects.name,
      subjectColor: subjects.color,
      startsAt: scheduleSlots.startsAt,
      endsAt: scheduleSlots.endsAt,
      room: scheduleSlots.room,
    })
    .from(teacherAssignments)
    .innerJoin(scheduleSlots, eq(scheduleSlots.assignmentId, teacherAssignments.id))
    .innerJoin(classrooms, eq(classrooms.id, teacherAssignments.classroomId))
    .innerJoin(subjects, eq(subjects.id, teacherAssignments.subjectId))
    .where(
      and(
        eq(teacherAssignments.teacherId, teacherId),
        eq(teacherAssignments.active, true),
        eq(scheduleSlots.dayOfWeek, now.dayOfWeek),
      ),
    );

  const currentClass =
    slots.find((slot) => slot.startsAt <= now.time && slot.endsAt >= now.time) ?? null;
  const nextClass =
    slots
      .filter((slot) => slot.startsAt > now.time)
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0] ?? null;

  const [pendingConclusions] = await db
    .select({ total: count() })
    .from(enrollments)
    .innerJoin(classrooms, eq(classrooms.id, enrollments.classroomId))
    .innerJoin(teacherAssignments, eq(teacherAssignments.classroomId, classrooms.id))
    .where(and(eq(teacherAssignments.teacherId, teacherId), eq(enrollments.active, true)));

  return {
    currentClass,
    nextClass,
    pendingConclusions: pendingConclusions?.total ?? 0,
    date: now.date,
  };
}

export async function getAttendanceRoster(classroomId: string, date: string) {
  const db = getDb();
  return db
    .select({
      studentId: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      status: attendanceRecords.status,
      note: attendanceRecords.note,
    })
    .from(enrollments)
    .innerJoin(studentProfiles, eq(studentProfiles.userId, enrollments.studentId))
    .innerJoin(users, eq(users.id, studentProfiles.userId))
    .leftJoin(
      attendanceRecords,
      and(
        eq(attendanceRecords.studentId, studentProfiles.userId),
        eq(attendanceRecords.classroomId, classroomId),
        eq(attendanceRecords.attendanceDate, date),
      ),
    )
    .where(and(eq(enrollments.classroomId, classroomId), eq(enrollments.active, true)))
    .orderBy(users.lastName, users.firstName);
}

export async function getFamilyOverview(guardianId: string) {
  const db = getDb();
  const children = await db
    .select({
      studentId: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      classroomName: classrooms.name,
      grade: classrooms.grade,
      section: classrooms.section,
    })
    .from(guardianStudents)
    .innerJoin(users, eq(users.id, guardianStudents.studentId))
    .leftJoin(
      enrollments,
      and(eq(enrollments.studentId, guardianStudents.studentId), eq(enrollments.active, true)),
    )
    .leftJoin(classrooms, eq(classrooms.id, enrollments.classroomId))
    .where(eq(guardianStudents.guardianId, guardianId));

  const childIds = children.map((child) => child.studentId);
  const recentAlerts = childIds.length
    ? await db
        .select({
          id: alerts.id,
          studentId: alerts.studentId,
          title: alerts.title,
          description: alerts.description,
          level: alerts.level,
          createdAt: alerts.createdAt,
        })
        .from(alerts)
        .where(isNull(alerts.resolvedAt))
        .orderBy(desc(alerts.createdAt))
        .limit(8)
    : [];

  const unreadMessages = await db
    .select({ total: count() })
    .from(messages)
    .where(and(eq(messages.recipientId, guardianId), isNull(messages.readAt)));

  const recentAttendance = childIds.length
    ? await db
        .select({
          studentId: attendanceRecords.studentId,
          status: attendanceRecords.status,
          attendanceDate: attendanceRecords.attendanceDate,
        })
        .from(attendanceRecords)
        .where(inArray(attendanceRecords.studentId, childIds))
        .orderBy(desc(attendanceRecords.attendanceDate))
        .limit(20)
    : [];

  const recentProgress = childIds.length
    ? await db
        .select({
          studentId: competencyResults.studentId,
          level: competencyResults.level,
          subjectName: subjects.name,
          updatedAt: competencyResults.updatedAt,
        })
        .from(competencyResults)
        .innerJoin(evaluations, eq(evaluations.id, competencyResults.evaluationId))
        .innerJoin(teacherAssignments, eq(teacherAssignments.id, evaluations.assignmentId))
        .innerJoin(subjects, eq(subjects.id, teacherAssignments.subjectId))
        .where(inArray(competencyResults.studentId, childIds))
        .orderBy(desc(competencyResults.updatedAt))
        .limit(16)
    : [];

  const upcomingActivities = childIds.length
    ? await db
        .select({
          studentId: enrollments.studentId,
          title: evaluations.title,
          evaluationDate: evaluations.evaluationDate,
          subjectName: subjects.name,
          classroomName: classrooms.name,
        })
        .from(evaluations)
        .innerJoin(teacherAssignments, eq(teacherAssignments.id, evaluations.assignmentId))
        .innerJoin(subjects, eq(subjects.id, teacherAssignments.subjectId))
        .innerJoin(classrooms, eq(classrooms.id, teacherAssignments.classroomId))
        .innerJoin(
          enrollments,
          and(eq(enrollments.classroomId, classrooms.id), eq(enrollments.active, true)),
        )
        .where(
          and(
            inArray(enrollments.studentId, childIds),
            gte(evaluations.evaluationDate, peruClock().date),
          ),
        )
        .orderBy(evaluations.evaluationDate)
        .limit(8)
    : [];

  return {
    children,
    recentAlerts: recentAlerts.filter((alert) => childIds.includes(alert.studentId)),
    unreadMessages: unreadMessages[0]?.total ?? 0,
    recentAttendance,
    recentProgress,
    upcomingActivities,
  };
}

export async function getStudentOverview(studentId: string) {
  const db = getDb();
  const [studentRows, progress, recentAttendance] = await Promise.all([
    db
      .select({
        firstName: users.firstName,
        lastName: users.lastName,
        classroomName: classrooms.name,
        grade: classrooms.grade,
        section: classrooms.section,
      })
      .from(users)
      .leftJoin(enrollments, and(eq(enrollments.studentId, users.id), eq(enrollments.active, true)))
      .leftJoin(classrooms, eq(classrooms.id, enrollments.classroomId))
      .where(eq(users.id, studentId))
      .limit(1),
    db
      .select({
        level: competencyResults.level,
        subjectName: subjects.name,
        updatedAt: competencyResults.updatedAt,
      })
      .from(competencyResults)
      .innerJoin(evaluations, eq(evaluations.id, competencyResults.evaluationId))
      .innerJoin(teacherAssignments, eq(teacherAssignments.id, evaluations.assignmentId))
      .innerJoin(subjects, eq(subjects.id, teacherAssignments.subjectId))
      .where(eq(competencyResults.studentId, studentId))
      .orderBy(desc(competencyResults.updatedAt))
      .limit(12),
    db
      .select({ status: attendanceRecords.status, attendanceDate: attendanceRecords.attendanceDate })
      .from(attendanceRecords)
      .where(eq(attendanceRecords.studentId, studentId))
      .orderBy(desc(attendanceRecords.attendanceDate))
      .limit(10),
  ]);

  const totalAttendance = recentAttendance.length;
  const presentAttendance = recentAttendance.filter((record) => record.status === "presente").length;
  return {
    student: studentRows[0],
    progress,
    recentAttendance,
    statistics: {
      attendanceRate: totalAttendance ? Math.round((presentAttendance / totalAttendance) * 100) : null,
      achievedCompetencies: progress.filter((item) => item.level === "AD" || item.level === "A").length,
    },
  };
}

async function getEnrollmentCounts(classroomIds: string[]) {
  if (!classroomIds.length) return new Map<string, number>();
  const db = getDb();
  const rows = await db
    .select({ classroomId: enrollments.classroomId, total: count() })
    .from(enrollments)
    .where(and(inArray(enrollments.classroomId, classroomIds), eq(enrollments.active, true)))
    .groupBy(enrollments.classroomId);
  return new Map(rows.map((row) => [row.classroomId, row.total]));
}

export async function getCourseCatalog(user: {
  id: string;
  institutionId: string;
  role: CourseRole;
}): Promise<CourseCatalogItem[]> {
  const db = getDb();

  if (user.role === "docente" || user.role === "admin") {
    const conditions = [
      eq(teacherAssignments.active, true),
      eq(classrooms.active, true),
      eq(subjects.active, true),
    ];
    if (user.role === "docente") conditions.push(eq(teacherAssignments.teacherId, user.id));
    if (user.role === "admin") conditions.push(eq(classrooms.institutionId, user.institutionId));

    const rows = await db
      .select({
        assignmentId: teacherAssignments.id,
        classroomId: classrooms.id,
        classroomName: classrooms.name,
        grade: classrooms.grade,
        section: classrooms.section,
        subjectName: subjects.name,
        subjectColor: subjects.color,
        teacherFirstName: users.firstName,
        teacherLastName: users.lastName,
      })
      .from(teacherAssignments)
      .innerJoin(classrooms, eq(classrooms.id, teacherAssignments.classroomId))
      .innerJoin(subjects, eq(subjects.id, teacherAssignments.subjectId))
      .innerJoin(users, eq(users.id, teacherAssignments.teacherId))
      .where(and(...conditions));
    const counts = await getEnrollmentCounts([...new Set(rows.map((row) => row.classroomId))]);
    return rows.map((row) => ({
      ...row,
      teacherName: `${row.teacherFirstName} ${row.teacherLastName}`,
      studentsCount: counts.get(row.classroomId) ?? 0,
    }));
  }

  if (user.role === "estudiante") {
    const [rows, resultRows] = await Promise.all([
      db
        .select({
          assignmentId: teacherAssignments.id,
          classroomId: classrooms.id,
          classroomName: classrooms.name,
          grade: classrooms.grade,
          section: classrooms.section,
          subjectName: subjects.name,
          subjectColor: subjects.color,
          teacherFirstName: users.firstName,
          teacherLastName: users.lastName,
        })
        .from(enrollments)
        .innerJoin(classrooms, eq(classrooms.id, enrollments.classroomId))
        .innerJoin(
          teacherAssignments,
          and(
            eq(teacherAssignments.classroomId, classrooms.id),
            eq(teacherAssignments.active, true),
          ),
        )
        .innerJoin(subjects, eq(subjects.id, teacherAssignments.subjectId))
        .innerJoin(users, eq(users.id, teacherAssignments.teacherId))
        .where(and(eq(enrollments.studentId, user.id), eq(enrollments.active, true))),
      db
        .select({ assignmentId: evaluations.assignmentId, level: competencyResults.level })
        .from(competencyResults)
        .innerJoin(evaluations, eq(evaluations.id, competencyResults.evaluationId))
        .where(eq(competencyResults.studentId, user.id))
        .orderBy(desc(competencyResults.updatedAt)),
    ]);
    const levels = new Map<string, "AD" | "A" | "B" | "C">();
    resultRows.forEach((row) => {
      if (!levels.has(row.assignmentId)) levels.set(row.assignmentId, row.level);
    });
    return rows.map((row) => ({
      ...row,
      teacherName: `${row.teacherFirstName} ${row.teacherLastName}`,
      studentsCount: 0,
      latestLevel: levels.get(row.assignmentId) ?? null,
    }));
  }

  const [rows, linkedChildren] = await Promise.all([
    db
      .select({
        assignmentId: teacherAssignments.id,
        classroomId: classrooms.id,
        classroomName: classrooms.name,
        grade: classrooms.grade,
        section: classrooms.section,
        subjectName: subjects.name,
        subjectColor: subjects.color,
        studentId: guardianStudents.studentId,
        teacherFirstName: users.firstName,
        teacherLastName: users.lastName,
      })
      .from(guardianStudents)
      .innerJoin(studentProfiles, eq(studentProfiles.userId, guardianStudents.studentId))
      .innerJoin(
        enrollments,
        and(eq(enrollments.studentId, guardianStudents.studentId), eq(enrollments.active, true)),
      )
      .innerJoin(classrooms, eq(classrooms.id, enrollments.classroomId))
      .innerJoin(
        teacherAssignments,
        and(
          eq(teacherAssignments.classroomId, classrooms.id),
          eq(teacherAssignments.active, true),
        ),
      )
      .innerJoin(subjects, eq(subjects.id, teacherAssignments.subjectId))
      .innerJoin(users, eq(users.id, teacherAssignments.teacherId))
      .where(and(eq(guardianStudents.guardianId, user.id), eq(classrooms.active, true))),
    db
      .select({ studentId: guardianStudents.studentId })
      .from(guardianStudents)
      .where(eq(guardianStudents.guardianId, user.id)),
  ]);
  const childIds = linkedChildren.map((child) => child.studentId);
  const resultRows = childIds.length
    ? await db
        .select({
          studentId: competencyResults.studentId,
          assignmentId: evaluations.assignmentId,
          level: competencyResults.level,
        })
        .from(competencyResults)
        .innerJoin(evaluations, eq(evaluations.id, competencyResults.evaluationId))
        .where(inArray(competencyResults.studentId, childIds))
        .orderBy(desc(competencyResults.updatedAt))
    : [];
  const levels = new Map<string, "AD" | "A" | "B" | "C">();
  resultRows.forEach((row) => {
    const key = `${row.studentId}:${row.assignmentId}`;
    if (!levels.has(key)) levels.set(key, row.level);
  });
  const counts = await getEnrollmentCounts([...new Set(rows.map((row) => row.classroomId))]);
  const studentNames = await db
    .select({ id: users.id, firstName: users.firstName, lastName: users.lastName })
    .from(users)
    .where(childIds.length ? inArray(users.id, childIds) : eq(users.id, ""));
  const names = new Map(studentNames.map((student) => [student.id, `${student.firstName} ${student.lastName}`]));

  return rows.map((row) => ({
    ...row,
    studentName: names.get(row.studentId) ?? "Estudiante",
    teacherName: `${row.teacherFirstName} ${row.teacherLastName}`,
    studentsCount: counts.get(row.classroomId) ?? 0,
    latestLevel: levels.get(`${row.studentId}:${row.assignmentId}`) ?? null,
  }));
}

export async function getAdminOverview(institutionId: string) {
  const db = getDb();
  const [userCount] = await db
    .select({ total: count() })
    .from(users)
    .where(and(eq(users.institutionId, institutionId), eq(users.active, true)));
  const [classroomCount] = await db
    .select({ total: count() })
    .from(classrooms)
    .where(
      and(eq(classrooms.institutionId, institutionId), eq(classrooms.active, true)),
    );
  const [unreadNotifications] = await db
    .select({ total: count() })
    .from(notifications)
    .innerJoin(users, eq(users.id, notifications.userId))
    .where(and(eq(users.institutionId, institutionId), isNull(notifications.readAt)));

  return {
    users: userCount?.total ?? 0,
    classrooms: classroomCount?.total ?? 0,
    unreadNotifications: unreadNotifications?.total ?? 0,
  };
}

export async function getAdminManagement(institutionId: string) {
  const db = getDb();
  const [institution] = await db
    .select({
      id: institutions.id,
      name: institutions.name,
      modularCode: institutions.modularCode,
      active: institutions.active,
    })
    .from(institutions)
    .where(eq(institutions.id, institutionId))
    .limit(1);

  const members = await db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      role: users.role,
      active: users.active,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.institutionId, institutionId))
    .orderBy(users.lastName, users.firstName);

  return { institution, members };
}

export async function getMessageCenter(userId: string) {
  const db = getDb();
  return db
    .select({
      id: messages.id,
      senderId: messages.senderId,
      recipientId: messages.recipientId,
      subject: messages.subject,
      body: messages.body,
      readAt: messages.readAt,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .where(or(eq(messages.senderId, userId), eq(messages.recipientId, userId)))
    .orderBy(desc(messages.createdAt))
    .limit(40);
}

export async function getAllowedMessageRecipients(user: {
  id: string;
  institutionId: string;
  role: string;
}) {
  const db = getDb();
  if (user.role === "admin") {
    const members = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
      })
      .from(users)
      .where(
        and(
          eq(users.institutionId, user.institutionId),
          eq(users.active, true),
          ne(users.id, user.id),
        ),
      )
      .orderBy(users.lastName, users.firstName);
    return members.map((member) => ({ ...member, context: "Cuenta de la institución" }));
  }

  if (user.role === "docente") {
    const links = await db
      .select({
        guardianId: guardianStudents.guardianId,
        studentFirstName: users.firstName,
        studentLastName: users.lastName,
        classroomName: classrooms.name,
      })
      .from(teacherAssignments)
      .innerJoin(
        enrollments,
        and(
          eq(enrollments.classroomId, teacherAssignments.classroomId),
          eq(enrollments.active, true),
        ),
      )
      .innerJoin(guardianStudents, eq(guardianStudents.studentId, enrollments.studentId))
      .innerJoin(users, eq(users.id, enrollments.studentId))
      .innerJoin(classrooms, eq(classrooms.id, teacherAssignments.classroomId))
      .where(
        and(
          eq(teacherAssignments.teacherId, user.id),
          eq(teacherAssignments.active, true),
        ),
      );
    const guardianIds = [...new Set(links.map((link) => link.guardianId))];
    if (!guardianIds.length) return [];
    const guardians = await db
      .select({ id: users.id, firstName: users.firstName, lastName: users.lastName, role: users.role })
      .from(users)
      .where(and(inArray(users.id, guardianIds), eq(users.active, true)));
    const contextByGuardian = new Map(
      links.map((link) => [
        link.guardianId,
        `Familiar de ${link.studentFirstName} ${link.studentLastName} · ${link.classroomName}`,
      ]),
    );
    return guardians.map((guardian) => ({ ...guardian, context: contextByGuardian.get(guardian.id) }));
  }

  if (user.role === "estudiante") {
    const teachers = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        subjectName: subjects.name,
        classroomName: classrooms.name,
      })
      .from(teacherAssignments)
      .innerJoin(users, eq(users.id, teacherAssignments.teacherId))
      .innerJoin(subjects, eq(subjects.id, teacherAssignments.subjectId))
      .innerJoin(classrooms, eq(classrooms.id, teacherAssignments.classroomId))
      .innerJoin(
        enrollments,
        and(
          eq(enrollments.classroomId, teacherAssignments.classroomId),
          eq(enrollments.active, true),
        ),
      )
      .where(
        and(
          eq(enrollments.studentId, user.id),
          eq(teacherAssignments.active, true),
          eq(users.active, true),
        ),
      );
    return uniqueRecipients(
      teachers.map(({ subjectName, classroomName, ...teacher }) => ({
        ...teacher,
        context: `${subjectName} · ${classroomName}`,
      })),
    );
  }

  const childRows = await db
    .select({ studentId: guardianStudents.studentId })
    .from(guardianStudents)
    .where(eq(guardianStudents.guardianId, user.id));
  const childIds = childRows.map((row) => row.studentId);
  if (!childIds.length) return [];
  const linkedTeachers = await db
    .select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      role: users.role,
      subjectName: subjects.name,
      classroomName: classrooms.name,
    })
    .from(teacherAssignments)
    .innerJoin(users, eq(users.id, teacherAssignments.teacherId))
    .innerJoin(subjects, eq(subjects.id, teacherAssignments.subjectId))
    .innerJoin(classrooms, eq(classrooms.id, teacherAssignments.classroomId))
    .innerJoin(
      enrollments,
      and(
        eq(enrollments.classroomId, teacherAssignments.classroomId),
        eq(enrollments.active, true),
      ),
    )
    .where(
      and(
        inArray(enrollments.studentId, childIds),
        eq(teacherAssignments.active, true),
        eq(users.active, true),
      ),
    );

  return uniqueRecipients(
    linkedTeachers.map(({ subjectName, classroomName, ...teacher }) => ({
      ...teacher,
      context: `${subjectName} · ${classroomName}`,
    })),
  );
}

function uniqueRecipients<T extends { id: string }>(items: T[]) {
  return [...new Map(items.map((item) => [item.id, item])).values()];
}

export async function createAbsenceNotifications(
  studentId: string,
  recordedById: string,
  attendanceDate: string,
) {
  const db = getDb();
  const guardians = await db
    .select({ guardianId: guardianStudents.guardianId, studentName: users.firstName })
    .from(guardianStudents)
    .innerJoin(users, eq(users.id, guardianStudents.studentId))
    .where(eq(guardianStudents.studentId, studentId));

  if (!guardians.length) return;

  await db.insert(notifications).values(
    guardians.map((guardian) => ({
      id: crypto.randomUUID(),
      userId: guardian.guardianId,
      type: "asistencia_ausencia",
      title: "Inasistencia registrada",
      body: `Se registró una ausencia para ${guardian.studentName} el ${attendanceDate}.`,
      href: "/panel",
    })),
  );
}
