const ROUTES = {
  HOME: "/",
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  PROFILE: (id: string) => `/profile/${id}`,
  QUESTION: (id: number) => `/questions/${id}`,
  TAG: (id: string) => `/tags/${id}`,
  ASK_QUESTION: "/ask-question",
  COLLECTION: "/collection",
  COMMUNITY: "/community",
  JOBS: "/jobs",
  TAGS: "/tags",
  SIGN_IN_WITH_OAUTH: "/signin-with-auth",
};

export default ROUTES;
