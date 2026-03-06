import React from "react";
const Image = React.forwardRef(function Image(props, ref) {
  const { src, alt = "", width, height, ...rest } = props;
  const resolvedSrc = typeof src === "string" ? src : src?.src ?? "";
  return React.createElement("img", { ...rest, src: resolvedSrc, alt, width, height, ref });
});
Image.displayName = "Image";
export default Image;
