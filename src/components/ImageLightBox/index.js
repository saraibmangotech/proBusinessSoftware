import { Fragment, useEffect } from "react";
import Viewer from 'viewerjs';
import 'viewerjs/dist/viewer.css';

function ImageLightBox({ viewerRef }) {

  useEffect(() => {
    const viewer = new Viewer(viewerRef?.current, {
      // options, such as zoom, navbar, etc.
    });

    // Clean up when the component unmounts
    return () => {
      viewer.destroy();
    };
  }, []);

  return (
    <>
    </>
  );
}

export default ImageLightBox