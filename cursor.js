// Create cursor element
const cursor = document.createElement('div');
cursor.className = 'cursor';
document.body.appendChild(cursor);

// Update cursor position
document.addEventListener('mousemove', (e) => {
    requestAnimationFrame(() => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });
});

// Add hover effect for interactive elements
const interactiveElements = document.querySelectorAll('a, button, input, textarea, .scrollbar-handle, .paper');
interactiveElements.forEach(element => {
    element.addEventListener('mouseenter', () => {
        cursor.classList.add('hover');
    });
    
    element.addEventListener('mouseleave', () => {
        cursor.classList.remove('hover');
    });
});

// Hide cursor when leaving window
document.addEventListener('mouseleave', () => {
    cursor.style.display = 'none';
});

document.addEventListener('mouseenter', () => {
    cursor.style.display = 'block';
}); 