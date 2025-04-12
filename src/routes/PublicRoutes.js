import React, { lazy } from "react";

const Home = lazy(() => import('pages/Website/Home'));
const About = lazy(() => import('pages/Website/About'));
const Contact = lazy(() => import('pages/Website/Contact'));
const Service = lazy(() => import('pages/Website/Services'));
const Quote = lazy(() => import('pages/Website/Quote'));
const Blogs = lazy(() => import('pages/Website/Blogs'));
const BlogDetail = lazy(() => import('pages/Website/Blogs/Detail'));
const Career = lazy(() => import('pages/Website/Career'));
const CareerDetail = lazy(() => import('pages/Website/Career/Detail'));

const PublicRoutes = [
  {
    path: "/",
    component: <Home />,
  },
  {
    path: "/about",
    component: <About />,
  },
  {
    path: "/contact",
    component: <Contact />,
  },
  {
    path: "/services",
    component: <Service />,
  },
  {
    path: "/quote",
    component: <Quote />,
  },
  {
    path: "/blogs",
    component: <Blogs />,
  },
  {
    path: "/blog/:id",
    component: <BlogDetail />,
  },
  {
    path: "/careers",
    component: <Career />,
  },
  {
    path: "/career/:id",
    component: <CareerDetail />,
  },

]

export default PublicRoutes