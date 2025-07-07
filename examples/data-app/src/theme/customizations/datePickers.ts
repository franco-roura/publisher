import { alpha, Theme } from "@mui/material/styles";
import type { PickersProComponents } from "@mui/x-date-pickers-pro/themeAugmentation";
import type { PickerComponents } from "@mui/x-date-pickers/themeAugmentation";
import { menuItemClasses } from "@mui/material/MenuItem";
import { gray, brand } from "../themePrimitives";
import { pickersInputClasses, pickersDayClasses } from "@mui/x-date-pickers";

/* eslint-disable import/prefer-default-export */
export const datePickersCustomizations: PickersProComponents<Theme> &
  PickerComponents<Theme> = {
  MuiPickerPopper: {
    styleOverrides: {
      paper: ({ theme }: { theme: Theme }) => ({
        marginTop: 4,
        borderRadius: theme.shape.borderRadius,
        border: `1px solid ${theme.palette.divider}`,
        backgroundImage: "none",
        background: "hsl(0, 0%, 100%)",
        boxShadow:
          "hsla(220, 30%, 5%, 0.07) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.07) 0px 8px 16px -5px",
        [`& .${menuItemClasses.root}`]: {
          borderRadius: 6,
          margin: "0 6px",
        },
        ...theme.applyStyles("dark", {
          background: gray[900],
          boxShadow:
            "hsla(220, 30%, 5%, 0.7) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.8) 0px 8px 16px -5px",
        }),
      }),
    },
  },
  MuiPickersArrowSwitcher: {
    styleOverrides: {
      spacer: { width: 16 },
      button: ({ theme }) => ({
        backgroundColor: "transparent",
        color: theme.palette.grey[500],
        ...theme.applyStyles("dark", {
          color: theme.palette.grey[400],
        }),
      }),
    },
  },
  MuiPickersCalendarHeader: {
    styleOverrides: {
      switchViewButton: {
        padding: 0,
        border: "none",
      },
    },
  },
  MuiPickersInput: {
    styleOverrides: {
      // Remove 'monthButton' as it is not a valid style override
    },
  },
  MuiPickersDay: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        fontSize: theme.typography.body1.fontSize,
        color: theme.palette.grey[600],
        padding: theme.spacing(0.5),
        borderRadius: theme.shape.borderRadius,
        "&:hover": {
          backgroundColor: theme.palette.action.hover,
        },
        "&:focus": {
          outline: `3px solid ${alpha(brand[500], 0.5)}`,
          outlineOffset: "2px",
          backgroundColor: "transparent",
        },
        ...theme.applyStyles("dark", {
          color: theme.palette.grey[300],
          "&:hover": {
            backgroundColor: theme.palette.action.hover,
          },
          "&:focus": {
            outline: `3px solid ${alpha(brand[500], 0.5)}`,
            outlineOffset: "2px",
            backgroundColor: "transparent",
          },
        }),
      }),
    },
  },
};
