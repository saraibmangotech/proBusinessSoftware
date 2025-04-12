import React, { useEffect } from "react";

function getHighlightedText(node, highlight) {
  if (node.nodeType === Node.TEXT_NODE) {
    var parts = node.nodeValue.split(new RegExp(`(${highlight})`, "gi"));
    var fragment = document.createDocumentFragment();

    parts.forEach((part, index) => {
      fragment.appendChild(document.createTextNode(part));
      if (part.toLowerCase() === highlight.toLowerCase()) {
        var bold = document.createElement("b");
        bold.style.backgroundColor = "#e8bb49";
        bold.appendChild(document.createTextNode(part));
        fragment.appendChild(bold);
      }
    });

    node.parentNode.replaceChild(fragment, node);
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    for (var i = 0; i < node.childNodes.length; i++) {
      getHighlightedText(node.childNodes[i], highlight);
    }
  }
}

function HighlightPage({ highlightTerm }) {
  useEffect(() => {
    const mainDiv = document.getElementById("mainDiv");
    if (mainDiv) {
      for (var i = 0; i < mainDiv.childNodes.length; i++) {
        getHighlightedText(mainDiv.childNodes[i], highlightTerm);
      }
    }
  }, [highlightTerm]);

  return <></>; // Empty fragment, as this component doesn't render any UI
}

export default HighlightPage;