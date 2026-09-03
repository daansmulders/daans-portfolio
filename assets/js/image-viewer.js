document.addEventListener("DOMContentLoaded", () => {
  const images = document.querySelectorAll(".project-hero img, .project-content img");
  if (!images.length) return;

  const overlay = document.createElement("div");
  overlay.className = "image-viewer";
  overlay.innerHTML = `
    <button type="button" class="image-viewer__close" aria-label="Close image">&times;</button>
    <img class="image-viewer__img" alt="">
  `;
  document.body.appendChild(overlay);

  const viewerImg = overlay.querySelector(".image-viewer__img");

  const close = () => {
    overlay.classList.remove("is-open");
    document.body.classList.remove("image-viewer-open");
  };

  images.forEach((img) => {
    img.classList.add("is-zoomable");
    img.addEventListener("click", () => {
      viewerImg.src = img.currentSrc || img.src;
      viewerImg.alt = img.alt;
      overlay.classList.add("is-open");
      document.body.classList.add("image-viewer-open");
    });
  });

  overlay.addEventListener("click", close);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
});
