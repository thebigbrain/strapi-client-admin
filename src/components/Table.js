import React from "react";
import { styled, makeStyles } from "@material-ui/styles";

const Styles = styled("div")({
  /* This is required to make the table full-width */
  display: "block",
  maxWidth: "100%"
});

const useStyles = makeStyles({
  /* This will make the table scrollable when it gets too small */
  "table-wrap": {
    display: "block",
    maxWidth: "100%",
    overflow: "auto",
    borderTop: "1px solid black",
    borderBottom: "1px solid black"
  },

  table: {
    /* Make sure the inner table is always as wide as needed */
    width: "100%",
    borderSpacing: 0,

    "& tr": {
      "&:last-child": {
        "& td": {
          borderBottom: 0
        }
      }
    },

    "& th, & td": {
      margin: 0,
      padding: "0.5rem",
      borderBottom: "1px solid black",
      borderRight: "1px solid black",

      /* The secret sauce */
      /* Each cell should grow equally */
      width: "1%",
      "&:last-child": {
        borderRight: 0
      }
    }
  },
});

export default function Table({ title, head, body, pagination, ...tableProps}) {
  // Use the state and functions returned from useTable to build your UI
  const classes = useStyles();
  // Render the UI for your table
  return (
    <Styles>
      <div>{title || 'table title here'}</div>
      <div className={classes["table-wrap"]}>
        <table className={classes.table} {...tableProps}>
          {head}
          {body}
        </table>
      </div>
      {pagination}
    </Styles>
  );
}