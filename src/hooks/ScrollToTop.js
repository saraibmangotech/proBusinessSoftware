import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {

  const routePath = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [routePath]);

  return null;
}