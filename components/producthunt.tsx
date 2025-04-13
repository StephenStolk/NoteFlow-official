"use client"

import React from "react";

const ProductHuntBadge: React.FC = () => {
  return (
    <a
      href="https://www.producthunt.com/posts/noteflow-2?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-noteflow-2"
      target="_blank"
      rel="noopener noreferrer"
    >
      <img
        src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=952743&theme=light&t=1744561616401"
        alt="NoteFlow - Mood-based productivity | Product Hunt"
        style={{ width: "250px", height: "54px" }}
        width="250"
        height="54"
      />
    </a>
  );
};

export default ProductHuntBadge;
