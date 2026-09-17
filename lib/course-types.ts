export type CourseRole = "admin" | "docente" | "estudiante" | "padre";

export type CourseCatalogItem = {
  assignmentId: string;
  classroomId: string;
  classroomName: string;
  grade: string;
  section: string;
  subjectName: string;
  subjectColor: string;
  teacherName: string;
  studentsCount: number;
  studentId?: string;
  studentName?: string;
  latestLevel?: "AD" | "A" | "B" | "C" | null;
};
