import * as React from "react";
import { createRoot } from "react-dom/client";
import Login from "./login/Login";
import Signup from "./signup/Signup";
import Home from "./home/Home";
import Profile from "./profile/Profile";
import RecipeDetails from "./recipedetails/RecipeDetails";
import {
  createBrowserRouter,
  RouterProvider,
  Route,
  Link,
} from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "/recipe/:id",
    element: <RecipeDetails  />,
  },
]);

createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
