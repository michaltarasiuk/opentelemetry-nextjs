type PostcssConfig = {
  plugins: Record<string, object>;
};

const config: PostcssConfig = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
