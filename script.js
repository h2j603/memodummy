function clearPapers() {
  const container = document.getElementById("container");
  container.innerHTML = "";
}
function searchAndDisplayPapers(keyword) {
  clearPapers();

  const filtered = papers
    .filter((entry) => entry.release === "yes")  // 🔥 공개된 메모만 대상으로!
    .filter((entry) =>
      (entry.title + entry.text)
        .toLowerCase()
        .includes(keyword.toLowerCase())
    );

  if (filtered.length === 0) {
    const container = document.getElementById("container");
    container.innerHTML = `<div style="text-align:center; font-size:18px; margin-top:20px;">검색 결과가 없습니다.</div>`;
    return;
  }

  addPapers(filtered);
}
function addPapers(data = papers) {
  const container = document.getElementById("container");
  let totalHeight = 0;
  const isMobile = window.innerWidth <= 600;

  data.forEach((entry, index) => {
    const paper = document.createElement("div");
    paper.classList.add("paper");
    if (entry.release === "no") {
      paper.classList.add("unreleasedPaper");
    }

    const maxRotation = isMobile ? -8 : -25;
    const minRotation = isMobile ? 8 : 0;
    let randomRotation = (
      Math.random() * (minRotation - maxRotation) +
      maxRotation
    ).toFixed(2);

    let bottomPosition = totalHeight + 50;
    totalHeight += 50;

    paper.style.setProperty("--rotation", `${randomRotation}deg`);
    paper.style.transform = `translateX(-50%) rotate(${randomRotation}deg)`;
    paper.style.bottom = `${bottomPosition}px`;
    paper.style.zIndex = index;

    let textClass = entry.release === "no" ? "unreleased" : "";
    paper.innerHTML = `<div class="dateAndtitle">${entry.date} &nbsp;&nbsp;&nbsp;&nbsp;${entry.title}</div>
      <p class="${textClass}">${entry.text}</p>`;

    if (entry.release === "yes") {
      paper.classList.add("releasedPaper");
      paper.addEventListener("click", () =>
        openModal(entry.date, entry.title, entry.text)
      );
      paper.addEventListener("mouseover", () => {
        paper.style.cursor = "pointer";
        const hoverRotation = (
          parseFloat(randomRotation) - (isMobile ? 1 : 3)
        ).toFixed(2);
        paper.style.transform = `translateX(-50%) rotate(${hoverRotation}deg)`;
      });
      paper.addEventListener("mouseleave", () => {
        paper.style.transform = `translateX(-50%) rotate(${randomRotation}deg)`;
      });
    } else {
      paper.style.pointerEvents = "none";
    }

    container.appendChild(paper);
  });

  container.style.height = `${totalHeight + 50}px`;
}


function openModal(date, title, text) {
  document.getElementById("modal-date").innerText = date;
  document.getElementById("modal-title").innerText = title;
  document.getElementById("modal-text").innerText = text;
  document.getElementById("modal-overlay").style.display = "block";
  document.getElementById("modal").style.display = "block";
}

document.getElementById("modal-overlay").addEventListener("click", () => {
  document.getElementById("modal-overlay").style.display = "none";
  document.getElementById("modal").style.display = "none";
});

window.onload = addPapers;
document.getElementById("searchInput").addEventListener("input", (e) => {
  searchAndDisplayPapers(e.target.value);
});

