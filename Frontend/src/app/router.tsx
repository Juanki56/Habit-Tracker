import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { LoginPage } from "../pages/LoginPage";
import { DashboardPage } from "../pages/DashboardPage";
import { HabitsPage } from "../pages/HabitsPage";
import { HabitDetailPage } from "../pages/HabitDetailPage";
import { ActivityDetailPage } from "../pages/ActivityDetailPage";
import { ResourcesPage } from "../pages/ResourcesPage";
import { ResourceDetailPage } from "../pages/ResourceDetailPage";
import { TagsPage } from "../pages/TagsPage";
import { TagDetailPage } from "../pages/TagDetailPage";
import { GoalsPage } from "../pages/GoalsPage";
import { GoalDetailPage } from "../pages/GoalDetailPage";
import { NotesPage } from "../pages/NotesPage";
import { NoteDetailPage } from "../pages/NoteDetailPage";
import { VocabularyPage } from "../pages/VocabularyPage";
import { CategoriesPage } from "../pages/CategoriesPage";
import { ActivityTypesPage } from "../pages/ActivityTypesPage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/", element: <DashboardPage /> },
          { path: "/habits", element: <HabitsPage /> },
          { path: "/habits/:id", element: <HabitDetailPage /> },
          { path: "/habits/:habitId/activities/:activityId", element: <ActivityDetailPage /> },
          { path: "/resources", element: <ResourcesPage /> },
          { path: "/resources/:id", element: <ResourceDetailPage /> },
          { path: "/tags", element: <TagsPage /> },
          { path: "/tags/:id", element: <TagDetailPage /> },
          { path: "/goals", element: <GoalsPage /> },
          { path: "/goals/:id", element: <GoalDetailPage /> },
          { path: "/notes", element: <NotesPage /> },
          { path: "/notes/:id", element: <NoteDetailPage /> },
          { path: "/vocabulary", element: <VocabularyPage /> },
          { path: "/categories", element: <CategoriesPage /> },
          { path: "/activity-types", element: <ActivityTypesPage /> },
        ],
      },
    ],
  },
]);
