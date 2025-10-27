module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Map common utility colors to the provided palette so existing markup
        // (e.g. bg-blue-600) will use your brand colors without changing JSX.
        blue: {
          500: '#91C4C3', // secondary
          600: '#80A1BA', // primary
          700: '#60828a',
        },
        green: {
          400: '#B4DEBD', // accent
        },
        sand: '#FFF7DD',
        brand: {
          primary: '#80A1BA',
          secondary: '#91C4C3',
          accent: '#B4DEBD',
          sand: '#FFF7DD'
        }
      }
    },
  },
  plugins: [],
};
