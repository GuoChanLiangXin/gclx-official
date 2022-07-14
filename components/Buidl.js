import { Box, Link } from "@mui/material";
import React from "react";

function Buidl() {
  return (<Box
    style={{
      height: "198px", background: "#F9F9F9", display: "flex", alignItems: "center", justifyContent: "center"
    }}
  >
    <Link href={`https://lxdao.io/`} target="_blank" color={"inherit"}>
      <img
        src="/buildinlxdao.png"
        style={{ margin: "0 auto", width: "160px", display: "block" }}
      />
    </Link>
  </Box>);
}

export default Buidl;
