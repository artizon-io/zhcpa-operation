// https://github.com/shadowwalker/next-pwa#available-options
// module.exports = withPWA({});

/** @type {import('next').NextConfig} */
module.exports = {
  dest: "public",
  disable: process.env.NODE_ENV === "development",
}