import { db } from "@/lib/simple-db";

export const prisma = {
  ...db,
  user: db.users,
  course: db.courses,
  quiz: db.quizzes,
  resource: db.resources,
  result: db.results,
  quizResult: db.quizResults,
  courseResource: db.courseResources,
  question: db.questions,
  option: db.options,
};
