const ROUTES = {
  HOME: "/",
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  PROFILE: (id: string) => `/profile/${id}`,
  QUESTION: (id: number) => `/questions/${id}`,
  TAGS: (_id: string) => `/tags/${_id}`,
  ASK_QUESTION: "/ask-question",
};

export default ROUTES;
