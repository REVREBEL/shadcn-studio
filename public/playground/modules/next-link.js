import React from "react";
const Link = React.forwardRef(function Link(props, ref) {
  const { href, children, ...rest } = props;
  return React.createElement("a", { ...rest, href, ref }, children);
});
Link.displayName = "Link";
export default Link;
