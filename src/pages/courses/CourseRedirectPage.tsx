import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { getCourseById } from '../../data/courses';

/** `/courses/:courseId` → `/articles?course=` (U6). No collision with `dist/articles/`. */
const CourseRedirectPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  if (!courseId || !getCourseById(courseId)) {
    return <Navigate to="/articles" replace />;
  }
  return <Navigate to={`/articles?course=${courseId}`} replace />;
};

export default CourseRedirectPage;
