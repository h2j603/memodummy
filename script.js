let searchResults = [];
let currentResultIndex = 0;

// Custom scrollbar functionality
let isDragging = false;
let startY = 0;
let startHandleY = 0;
let currentSpacing = 30;
const minSpacing = 20;
const maxSpacing = 200;

function wrapLatinAndNumbers(text) {
    // Split the text into parts: numbers, Latin letters, punctuation, and other characters
    const parts = text.split(/(\d+|[a-zA-Z]+|[.,!?;:'"()\-–—…]+|[^a-zA-Z0-9.,!?;:'"()\-–—…]+)/);
    
    // Map each part to its appropriate span
    return parts.map(part => {
        if (/^\d+$/.test(part)) {
            return `<span class="numbers">${part}</span>`;
        } else if (/^[a-zA-Z]+$/.test(part)) {
            return `<span class="english">${part}</span>`;
        } else if (/^[.,!?;:'"()\-–—…]+$/.test(part)) {
            return `<span class="numbers">${part}</span>`;  // Use numbers class for punctuation
        }
        return part;
    }).join('');
}

function clearPapers() {
  const container = document.getElementById("container");
  container.innerHTML = "";
}

function addPapers(data = papers) {
  const container = document.getElementById("container");
  container.innerHTML = "";
  const isMobile = window.innerWidth <= 600;
  const totalPapers = data.length;
  const centerIndex = Math.floor(totalPapers / 2);

  // Create and position papers
  data.forEach((entry, index) => {
    const paper = document.createElement("div");
    paper.classList.add("paper");
    if (entry.release === "no") {
      paper.classList.add("unreleasedPaper");
    }

    const maxRotation = isMobile ? -8 : -20;
    const minRotation = isMobile ? 8 : 0;
    let randomRotation = (
      Math.random() * (minRotation - maxRotation) +
      maxRotation
    ).toFixed(2);

    // Store rotation in CSS custom property
    paper.style.setProperty("--rotation", `${randomRotation}deg`);
    
    // Set initial position with proper centering
    paper.style.transform = `translate(-50%, 0) rotate(${randomRotation}deg)`;
    paper.style.zIndex = index;

    let textClass = entry.release === "no" ? "unreleased" : "";
    // Wrap date and title in english class and add quotes to title
    const wrappedDate = wrapLatinAndNumbers(entry.date);
    const wrappedTitle = wrapLatinAndNumbers(wrapTitleWithQuotes(entry.title));
    const wrappedText = wrapLatinAndNumbers(entry.text);
    
    paper.innerHTML = `<div class="dateAndtitle">${wrappedDate} &nbsp;&nbsp;&nbsp;&nbsp;${wrappedTitle}</div>
      <p class="${textClass}">${wrappedText}</p>`;

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
        const currentY = paper.style.transform.match(/translate\([^,]+,\s*([^)]+)\)/)?.[1] || '0px';
        paper.style.transform = `translate(-50%, ${currentY}) rotate(${hoverRotation}deg) scale(1.05) translateY(-5px)`;
      });
      paper.addEventListener("mouseleave", () => {
        const currentY = paper.style.transform.match(/translate\([^,]+,\s*([^)]+)\)/)?.[1] || '0px';
        paper.style.transform = `translate(-50%, ${currentY}) rotate(${randomRotation}deg)`;
      });
    } else {
      paper.style.pointerEvents = "none";
    }

    container.appendChild(paper);
  });

  // Initialize the scrollbar and set initial positions
  initializeScrollbar();
  updatePaperSpacing(currentSpacing);
  
  // Set initial scrollbar position
  const scrollbar = document.getElementById('customScrollbar');
  const handle = document.getElementById('scrollbarHandle');
  const scrollbarHeight = scrollbar.offsetHeight;
  const handleHeight = handle.offsetHeight;
  const ratio = (currentSpacing - minSpacing) / (maxSpacing - minSpacing);
  const initialHandleY = Math.pow(ratio, 1/1.5) * (scrollbarHeight - handleHeight);
  handle.style.top = `${initialHandleY}px`;
}

function updateNextButtonVisibility() {
  const nextButton = document.getElementById("next-button");
  if (searchResults.length <= 1) {
    nextButton.style.display = "none";
  } else {
    nextButton.style.display = "block";
  }
}

function openModal(date, title, text, keyword = "") {
  document.getElementById("modal-date").innerHTML = wrapLatinAndNumbers(date);
  document.getElementById("modal-title").innerHTML = wrapLatinAndNumbers(wrapTitleWithQuotes(title));

  // 키워드가 있을 경우, 밑줄 강조 처리
  if (keyword) {
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedKeyword})`, "gi");
    const highlightedText = wrapLatinAndNumbers(text).replace(regex, '<span class="highlight">$1</span>');
    document.getElementById("modal-text").innerHTML = highlightedText;
    updateNextButtonVisibility();
  } else {
    document.getElementById("modal-text").innerHTML = wrapLatinAndNumbers(text);
    document.getElementById("next-button").style.display = "none";
  }

  document.getElementById("modal-overlay").style.display = "block";
  document.getElementById("modal").style.display = "block";
}

function searchAndDisplayPapers(keyword) {
  if (!keyword) return;

  const lowerKeyword = keyword.toLowerCase();
  searchResults = papers.filter(
    (entry) =>
      entry.release === "yes" &&
      (entry.title.toLowerCase().includes(lowerKeyword) ||
        entry.text.toLowerCase().includes(lowerKeyword))
  );

  if (searchResults.length === 0) {
    alert("검색 결과가 없습니다.");
    return;
  }

  currentResultIndex = 0;
  const first = searchResults[0];
   openModal(first.date, first.title, first.text, keyword); // ✅ keyword 추가

}


document.getElementById("modal-overlay").addEventListener("click", (e) => {
  // Only close if clicking directly on the overlay, not its children
  if (e.target === document.getElementById("modal-overlay")) {
    document.getElementById("modal-overlay").style.display = "none";
    document.getElementById("modal").style.display = "none";
  }
});

// Add click event to modal to prevent clicks inside modal from closing it
document.getElementById("modal").addEventListener("click", (e) => {
  e.stopPropagation();
});

document.getElementById("searchInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    searchAndDisplayPapers(e.target.value);
  }
});

document.getElementById("next-button").addEventListener("click", () => {
  currentResultIndex++;
  if (currentResultIndex >= searchResults.length) {
    document.getElementById("modal").style.display = "none";
    document.getElementById("modal-overlay").style.display = "none";
  } else {
    const next = searchResults[currentResultIndex];
    const keyword = document.getElementById("searchInput").value;
    openModal(next.date, next.title, next.text, document.getElementById("searchInput").value);
}
});

function updatePaperSpacing(spacing) {
  const papers = document.querySelectorAll('.paper');
  const totalPapers = papers.length;
  const centerIndex = Math.floor(totalPapers / 2);
  
  // Center position is now at 50% of viewport height
  const centerPosition = window.innerHeight * 0.5; // Changed from 0.7 to 0.5
  
  papers.forEach((paper, index) => {
    const distanceFromCenter = index - centerIndex;
    const position = distanceFromCenter * spacing;
    const rotation = paper.style.getPropertyValue('--rotation');
    
    // Reset any inline left positioning to use CSS centering
    paper.style.left = '';
    // Combine all transforms for proper positioning
    paper.style.transform = `translate(-50%, ${centerPosition + position}px) rotate(${rotation})`;
  });

  // Update container height to ensure proper scrolling
  const container = document.getElementById("container");
  const maxSpread = spacing * (totalPapers - 1);
  container.style.height = `${maxSpread + window.innerHeight}px`;
}

function initializeScrollbar() {
  const scrollbar = document.getElementById('customScrollbar');
  const handle = document.getElementById('scrollbarHandle');
  
  // Prevent any default behavior on the scrollbar container
  const preventDefault = (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  // Prevent all possible scroll-triggering events
  ['wheel', 'touchstart', 'touchmove', 'touchend', 'mousedown', 'mouseup', 'mousemove'].forEach(eventType => {
    scrollbar.addEventListener(eventType, preventDefault, { passive: false });
    handle.addEventListener(eventType, preventDefault, { passive: false });
  });

  // Handle click on the track
  scrollbar.addEventListener('click', (e) => {
    preventDefault(e);
    
    if (e.target === scrollbar) {
      const scrollbarRect = scrollbar.getBoundingClientRect();
      const handleHeight = handle.offsetHeight;
      const clickY = e.clientY - scrollbarRect.top;
      
      // Calculate new handle position
      let newY = Math.max(0, Math.min(clickY - (handleHeight / 2), scrollbarRect.height - handleHeight));
      handle.style.top = `${newY}px`;
      
      // Update spacing based on new position
      const ratio = newY / (scrollbarRect.height - handleHeight);
      const newSpacing = minSpacing + Math.pow(ratio, 1.5) * (maxSpacing - minSpacing);
      updatePaperSpacing(newSpacing);
    }
  });

  // Handle drag start
  handle.addEventListener('mousedown', (e) => {
    preventDefault(e);
    isDragging = true;
    startY = e.clientY;
    startHandleY = parseInt(handle.style.top) || 0;
    
    // Add temporary event listeners for drag
    document.addEventListener('mousemove', handleScrollbarDrag, { passive: false });
    document.addEventListener('mouseup', handleDragEnd, { passive: false });
  });

  // Prevent context menu on right-click
  scrollbar.addEventListener('contextmenu', preventDefault);
  handle.addEventListener('contextmenu', preventDefault);
}

function handleDragEnd(e) {
  if (!isDragging) return;
  e.preventDefault();
  e.stopPropagation();
  
  isDragging = false;
  document.removeEventListener('mousemove', handleScrollbarDrag);
  document.removeEventListener('mouseup', handleDragEnd);
  return false;
}

function handleScrollbarDrag(e) {
  if (!isDragging) return;
  e.preventDefault();
  e.stopPropagation();

  const scrollbar = document.getElementById('customScrollbar');
  const handle = document.getElementById('scrollbarHandle');
  const scrollbarRect = scrollbar.getBoundingClientRect();
  const handleHeight = handle.offsetHeight;
  
  // Calculate the new handle position using relative movement
  const deltaY = e.clientY - startY;
  let newY = Math.max(0, Math.min(startHandleY + deltaY, scrollbarRect.height - handleHeight));
  
  // Update handle position
  handle.style.top = `${newY}px`;
  
  // Calculate new spacing with throttling for better performance
  const ratio = newY / (scrollbarRect.height - handleHeight);
  const newSpacing = minSpacing + Math.pow(ratio, 1.5) * (maxSpacing - minSpacing);
  
  // Use requestAnimationFrame for smooth updates
  if (!window._spacingUpdateScheduled) {
    window._spacingUpdateScheduled = true;
    requestAnimationFrame(() => {
      updatePaperSpacing(newSpacing);
      window._spacingUpdateScheduled = false;
    });
  }
}

// Initialize scrollbar when the page loads
window.addEventListener('load', () => {
  addPapers();
});

// Add function to wrap title with quotation marks
function wrapTitleWithQuotes(title) {
    return `«${title}»`;
}  
