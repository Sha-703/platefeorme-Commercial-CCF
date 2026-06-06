import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Helper functions
const readFile = (filename: string) => {
  const filepath = path.join(dataDir, filename);
  try {
    const data = fs.readFileSync(filepath, 'utf-8');
    return JSON.parse(data) || [];
  } catch {
    return [];
  }
};

const writeFile = (filename: string, data: any) => {
  const filepath = path.join(dataDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
};

const populateRelations = (type: 'course' | 'quiz', item: any, include: any): any => {
  if (!item) return item;
  if (Array.isArray(item)) {
    return item.map(i => populateRelations(type, i, include));
  }

  const copy = { ...item };

  if (type === 'course' && include) {
    if (include.resources) {
      const courseResources = readFile('course-resources.json');
      const resources = readFile('resources.json');
      
      const matchedRelations = courseResources
        .filter((cr: any) => cr.courseId === copy.id)
        .map((cr: any) => {
          const res = resources.find((r: any) => r.id === cr.resourceId);
          return { ...cr, resource: res };
        })
        .filter((cr: any) => cr.resource !== undefined);

      if (matchedRelations.length === 0) {
        const directResources = resources.filter((r: any) => r.courseId === copy.id);
        copy.resources = directResources.map((r: any) => ({
          id: r.id,
          courseId: copy.id,
          resourceId: r.id,
          resource: r
        }));
      } else {
        copy.resources = matchedRelations;
      }
    } else {
      copy.resources = copy.resources || [];
    }

    if (include.quizzes) {
      const quizzes = readFile('quizzes.json');
      const courseQuizzes = quizzes.filter((q: any) => q.courseId === copy.id);
      
      if (include.quizzes.include) {
        copy.quizzes = courseQuizzes.map((q: any) => populateRelations('quiz', q, include.quizzes.include));
      } else {
        copy.quizzes = courseQuizzes;
      }
    } else {
      copy.quizzes = copy.quizzes || [];
    }

    if (include.user) {
      const users = readFile('users.json');
      const user = users.find((u: any) => u.id === copy.userId);
      if (user) {
        if (include.user.select && include.user.select.name) {
          copy.user = { name: user.name };
        } else {
          copy.user = user;
        }
      } else {
        copy.user = { name: "Professeur principal" };
      }
    } else {
      copy.user = copy.user || { name: "Professeur principal" };
    }
  }

  if (type === 'quiz' && include) {
    if (include.course) {
      const courses = readFile('courses.json');
      const course = courses.find((c: any) => c.id === copy.courseId);
      if (course) {
        if (include.course.select && include.course.select.title) {
          copy.course = { title: course.title };
        } else {
          copy.course = course;
        }
      } else {
        copy.course = { title: "Cours inconnu" };
      }
    } else {
      copy.course = copy.course || { title: "Cours inconnu" };
    }

    if (include.questions) {
      const questions = readFile('questions.json');
      const quizQuestions = questions.filter((q: any) => q.quizId === copy.id);
      
      if (include.questions.include?.options) {
        const options = readFile('options.json');
        copy.questions = quizQuestions.map((q: any) => {
          const qOptions = options.filter((o: any) => o.questionId === q.id);
          qOptions.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
          return { ...q, options: qOptions };
        });
      } else {
        copy.questions = quizQuestions;
      }
      copy.questions.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
    } else {
      copy.questions = copy.questions || [];
    }
  }

  return copy;
};

// User operations
export const db = {
  users: {
    findUnique: (params: { where: { email?: string; id?: string } }) => {
      const users = readFile('users.json');
      const { where } = params;
      if (where.email) {
        return users.find((u: any) => u.email === where.email);
      }
      if (where.id) {
        return users.find((u: any) => u.id === where.id);
      }
      return undefined;
    },
    findMany: (params?: { where?: any; include?: any }) => {
      return readFile('users.json');
    },
    create: (params: { data: any }) => {
      const users = readFile('users.json');
      const newUser = {
        id: String(Date.now()),
        createdAt: new Date(),
        ...params.data,
      };
      users.push(newUser);
      writeFile('users.json', users);
      return newUser;
    },
    update: (params: { where: { id: string }; data: any }) => {
      const users = readFile('users.json');
      const index = users.findIndex((u: any) => u.id === params.where.id);
      if (index !== -1) {
        users[index] = { ...users[index], ...params.data };
        writeFile('users.json', users);
        return users[index];
      }
      return null;
    },
    delete: (params: { where: { id: string } }) => {
      const users = readFile('users.json');
      const index = users.findIndex((u: any) => u.id === params.where.id);
      if (index !== -1) {
        const deleted = users.splice(index, 1);
        writeFile('users.json', users);
        return deleted[0];
      }
      return null;
    },
  },

  courses: {
    findUnique: (params: { where: { id: string }; include?: any }) => {
      const courses = readFile('courses.json');
      const course = courses.find((c: any) => c.id === params.where.id);
      if (!course) return null;
      return populateRelations('course', course, params.include);
    },
    findMany: (params?: { where?: any; include?: any }) => {
      const courses = readFile('courses.json');
      let filtered = courses;
      if (params?.where?.userId) {
        filtered = courses.filter((c: any) => c.userId === params.where.userId);
      }
      return populateRelations('course', filtered, params?.include);
    },
    create: (params: { data: any }) => {
      const courses = readFile('courses.json');
      const newCourse = {
        id: String(Date.now()),
        createdAt: new Date(),
        ...params.data,
      };
      courses.push(newCourse);
      writeFile('courses.json', courses);
      return newCourse;
    },
    update: (params: { where: { id: string }; data: any }) => {
      const courses = readFile('courses.json');
      const index = courses.findIndex((c: any) => c.id === params.where.id);
      if (index !== -1) {
        courses[index] = { ...courses[index], ...params.data };
        writeFile('courses.json', courses);
        return courses[index];
      }
      return null;
    },
    delete: (params: { where: { id: string } }) => {
      const courses = readFile('courses.json');
      const index = courses.findIndex((c: any) => c.id === params.where.id);
      if (index !== -1) {
        const deleted = courses.splice(index, 1);
        writeFile('courses.json', courses);
        return deleted[0];
      }
      return null;
    },
  },

  quizzes: {
    findUnique: (params: { where: { id: string }; include?: any }) => {
      const quizzes = readFile('quizzes.json');
      const quiz = quizzes.find((q: any) => q.id === params.where.id);
      if (!quiz) return null;
      return populateRelations('quiz', quiz, params.include);
    },
    findMany: (params?: { where?: any; include?: any }) => {
      const quizzes = readFile('quizzes.json');
      let filtered = quizzes;
      if (params?.where?.courseId) {
        filtered = quizzes.filter((q: any) => q.courseId === params.where.courseId);
      } else if (params?.where?.userId) {
        filtered = quizzes.filter((q: any) => q.userId === params.where.userId);
      }
      return populateRelations('quiz', filtered, params?.include);
    },
    create: (params: { data: any }) => {
      const quizzes = readFile('quizzes.json');
      const newQuiz = {
        id: String(Date.now()),
        createdAt: new Date(),
        ...params.data,
      };
      quizzes.push(newQuiz);
      writeFile('quizzes.json', quizzes);
      return newQuiz;
    },
    update: (params: { where: { id: string }; data: any }) => {
      const quizzes = readFile('quizzes.json');
      const index = quizzes.findIndex((q: any) => q.id === params.where.id);
      if (index !== -1) {
        quizzes[index] = { ...quizzes[index], ...params.data };
        writeFile('quizzes.json', quizzes);
        return quizzes[index];
      }
      return null;
    },
    delete: (params: { where: { id: string } }) => {
      const quizzes = readFile('quizzes.json');
      const index = quizzes.findIndex((q: any) => q.id === params.where.id);
      if (index !== -1) {
        const deleted = quizzes.splice(index, 1);
        writeFile('quizzes.json', quizzes);
        return deleted[0];
      }
      return null;
    },
  },

  resources: {
    findUnique: (params: { where: { id: string }; include?: any }) => {
      const resources = readFile('resources.json');
      return resources.find((r: any) => r.id === params.where.id);
    },
    findMany: (params?: { where?: any; include?: any }) => {
      const resources = readFile('resources.json');
      if (params?.where?.userId) {
        return resources.filter((r: any) => r.userId === params.where.userId);
      }
      if (params?.where?.courseId) {
        return resources.filter((r: any) => r.courseId === params.where.courseId);
      }
      return resources;
    },
    create: (params: { data: any }) => {
      const resources = readFile('resources.json');
      const newResource = {
        id: String(Date.now()),
        createdAt: new Date(),
        ...params.data,
      };
      resources.push(newResource);
      writeFile('resources.json', resources);
      return newResource;
    },
    update: (params: { where: { id: string }; data: any }) => {
      const resources = readFile('resources.json');
      const index = resources.findIndex((r: any) => r.id === params.where.id);
      if (index !== -1) {
        resources[index] = { ...resources[index], ...params.data };
        writeFile('resources.json', resources);
        return resources[index];
      }
      return null;
    },
    delete: (params: { where: { id: string } }) => {
      const resources = readFile('resources.json');
      const index = resources.findIndex((r: any) => r.id === params.where.id);
      if (index !== -1) {
        const deleted = resources.splice(index, 1);
        writeFile('resources.json', resources);
        return deleted[0];
      }
      return null;
    },
  },

  results: {
    findUnique: (params: { where: { id: string }; include?: any }) => {
      const results = readFile('results.json');
      return results.find((r: any) => r.id === params.where.id);
    },
    findMany: (params?: { where?: any; include?: any }) => {
      const results = readFile('results.json');
      if (params?.where?.userId) {
        return results.filter((r: any) => r.userId === params.where.userId);
      }
      if (params?.where?.quizId) {
        return results.filter((r: any) => r.quizId === params.where.quizId);
      }
      return results;
    },
    create: (params: { data: any }) => {
      const results = readFile('results.json');
      const newResult = {
        id: String(Date.now()),
        createdAt: new Date(),
        ...params.data,
      };
      results.push(newResult);
      writeFile('results.json', results);
      return newResult;
    },
    update: (params: { where: { id: string }; data: any }) => {
      const results = readFile('results.json');
      const index = results.findIndex((r: any) => r.id === params.where.id);
      if (index !== -1) {
        results[index] = { ...results[index], ...params.data };
        writeFile('results.json', results);
        return results[index];
      }
      return null;
    },
  },

  quizResult: {
    findUnique: (params: { where: any; include?: any }) => {
      const results = readFile('quiz-results.json');
      return results.find((r: any) => r.id === params.where.id);
    },
    findMany: (params?: { where?: any; include?: any; orderBy?: any; select?: any }) => {
      const results = readFile('quiz-results.json');
      if (params?.where?.studentId) {
        return results.filter((r: any) => r.studentId === params.where.studentId);
      }
      return results;
    },
    create: (params: { data: any; include?: any }) => {
      const results = readFile('quiz-results.json');
      const newResult = {
        id: String(Date.now()),
        submittedAt: new Date(),
        ...params.data,
      };
      results.push(newResult);
      writeFile('quiz-results.json', results);
      return newResult;
    },
  },

  quizResults: {
    findUnique: (params: { where: any; include?: any }) => {
      const results = readFile('quiz-results.json');
      return results.find((r: any) => r.id === params.where.id);
    },
    findMany: (params?: { where?: any; include?: any; orderBy?: any; select?: any }) => {
      const results = readFile('quiz-results.json');
      if (params?.where?.studentId) {
        return results.filter((r: any) => r.studentId === params.where.studentId);
      }
      return results;
    },
    create: (params: { data: any; include?: any }) => {
      const results = readFile('quiz-results.json');
      const newResult = {
        id: String(Date.now()),
        submittedAt: new Date(),
        ...params.data,
      };
      results.push(newResult);
      writeFile('quiz-results.json', results);
      return newResult;
    },
    update: (params: { where: any; data: any; include?: any }) => {
      const results = readFile('quiz-results.json');
      const index = results.findIndex((r: any) => {
        const where = params.where;
        if (where.studentId_quizId) {
          return r.studentId === where.studentId_quizId.studentId && r.quizId === where.studentId_quizId.quizId;
        }
        return r.id === where.id;
      });
      if (index !== -1) {
        results[index] = { ...results[index], ...params.data };
        writeFile('quiz-results.json', results);
        return results[index];
      }
      return null;
    },
  },

  courseResources: {
    create: (params: { data: any }) => {
      const relations = readFile('course-resources.json');
      const newRelation = {
        id: String(Date.now()),
        ...params.data,
      };
      relations.push(newRelation);
      writeFile('course-resources.json', relations);
      return newRelation;
    },
  },

  questions: {
    create: (params: { data: any }) => {
      const questions = readFile('questions.json');
      const newQuestion = {
        id: String(Date.now()),
        ...params.data,
      };
      questions.push(newQuestion);
      writeFile('questions.json', questions);
      return newQuestion;
    },
  },

  options: {
    create: (params: { data: any }) => {
      const options = readFile('options.json');
      const newOption = {
        id: String(Date.now()),
        ...params.data,
      };
      options.push(newOption);
      writeFile('options.json', options);
      return newOption;
    },
  },
};
