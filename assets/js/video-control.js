document.addEventListener("DOMContentLoaded", () => {
  const videoCards = document.querySelectorAll(".project-video");

  videoCards.forEach((card) => {
    const video = card.querySelector(".project-video__media");
    const button = card.querySelector(".project-video__pause");

    // Try autoplay immediately
    video.play().catch(() => {});

    button.addEventListener("click", () => {
      if (video.paused) {
        video.play();
        button.textContent = "❚❚";
        button.setAttribute("aria-label", "Pause video");
      } else {
        video.pause();
        button.textContent = "▶";
        button.setAttribute("aria-label", "Play video");
      }
    });
  });
});
