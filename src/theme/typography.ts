import { TypographyOptions } from '@mui/material/styles/createTypography';

export const typography: TypographyOptions = {
  "fontFamily": "\"DM Sans\",-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,\"Helvetica Neue\",Arial,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\",\"Segoe UI Symbol\"",
  "h1": {
    "fontSize": "3rem",
    "@media (min-width:600px)": {
      "fontSize": "1.8rem"
    },
    "@media (min-width:900px)": {
      "fontSize": "2.4rem"
    },
    "fontWeight": 600,
    "lineHeight": 1.167,
    "letterSpacing": "-0.01562em"
  },
  "h2": {
    "fontSize": "2.2rem",
    "@media (min-width:600px)": {
      "fontSize": "1.6rem"
    },
    "@media (min-width:900px)": {
      "fontSize": "2.2rem"
    },
    "fontWeight": 400,
    "lineHeight": 1.2,
    "letterSpacing": "-0.00833em"
  },
  "h3": {
    "fontSize": "2rem",
    "@media (min-width:600px)": {
      "fontSize": "1.4rem"
    },
    "@media (min-width:900px)": {
      "fontSize": "2rem"
    },
    "fontWeight": 400,
    "lineHeight": 1.167,
    "letterSpacing": "0em"
  },
  "h4": {
    "fontSize": "1.6rem",
    "@media (min-width:600px)": {
      "fontSize": "1.4rem"
    },
    "@media (min-width:900px)": {
      "fontSize": "1.6rem",
    },
    "fontWeight": 400,
    "lineHeight": 1.235,
    "letterSpacing": "0.00735em"
  },
  "h5": {
    "fontSize": "1.25rem",
    "@media (min-width:600px)": {
      "fontSize": "1.5rem"
    },
    "fontWeight": 400,
    "lineHeight": 1.334,
    "letterSpacing": "0em"
  },
  "h6": {
    "fontSize": "1.125rem",
    "@media (min-width:600px)": {
      "fontSize": "1.25rem"
    },
    "fontWeight": 600,
    "lineHeight": 1.6,
    "letterSpacing": "0.0075em"
  },
  "subtitle1": {
    "fontSize": "1rem",
    "fontWeight": 400,
    "lineHeight": 1.75,
    "letterSpacing": "0.00938em"
  },
  "subtitle2": {
    "fontSize": "0.875rem",
    "fontWeight": 600,
    "lineHeight": 1.57,
    "letterSpacing": "0.00714em"
  },
  "body1": {
    "fontSize": "1rem",
    "fontWeight": 400,
    "lineHeight": 1.5,
    "letterSpacing": "0.00938em"
  },
  "body2": {
    "fontSize": "0.875rem",
    "fontWeight": 400,
    "lineHeight": 1.43,
    "letterSpacing": "0.01071em"
  },
  "button": {
    "fontSize": "0.875rem",
    "fontWeight": 600,
    "lineHeight": 1.75,
    "letterSpacing": "0.01em",
    "textTransform": "none"
  },
  "caption": {
    "fontSize": "0.75rem",
    "fontWeight": 400,
    "lineHeight": 1.66,
    "letterSpacing": "0.03333em"
  },
  "overline": {
    "fontSize": "0.75rem",
    "fontWeight": 400,
    "lineHeight": 2.66,
    "letterSpacing": "0.08333em",
    "textTransform": "uppercase"
  }
};