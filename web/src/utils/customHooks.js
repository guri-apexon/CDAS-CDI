import { useEffect, useState } from "react";

export const useResize = (myRef) => {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const handleResize = () => {
    setWidth(myRef.current.offsetWidth);
    setHeight(myRef.current.offsetHeight);
  };

  useEffect(() => {
    // eslint-disable-next-line no-unused-expressions
    myRef.current && myRef.current.addEventListener("resize", handleResize);
    return () => {
      myRef.current.removeEventListener("resize", handleResize);
    };
  }, [myRef]);

  return { width, height };
};
export default useResize;
