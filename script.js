let searchResults = [];
let currentResultIndex = 0;
function clearPapers() {
  const container = document.getElementById("container");
  container.innerHTML = "";
}
function searchAndDisplayPapers(keyword) {
  searchResults = papers
    .filter((entry) => entry.release === "yes")
    .filter((entry) =>
      (entry.title + entry.text)
        .toLowerCase()
        .includes(keyword.toLowerCase())
    );

  if (searchResults.length > 0) {
    currentResultIndex = 0;
    const first = searchResults[0];
    openModal(first.date, first.title, first.text);
  } else {
    alert("검색 결과가 없습니다.");
  }
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
document.getElementById("searchInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    searchAndDisplayPapers(e.target.value);
  }
});
document.getElementById("next-button").addEventListener("click", () => {
  currentResultIndex++;
  if (currentResultIndex >= searchResults.length) {
    // 마지막이면 닫기
    document.getElementById("modal").style.display = "none";
    document.getElementById("modal-overlay").style.display = "none";
  } else {
    const next = searchResults[currentResultIndex];
    openModal(next.date, next.title, next.text);
  }
});
