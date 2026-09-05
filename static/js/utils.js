export function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function buttonClick(buttonElement) {
    return new Promise((resolve) => {
        buttonElement.addEventListener("click", resolve, { once: true });
    });
}

export function initializeKeyboardNavigation() {
    document.addEventListener("keydown", (event) => {
        console.log("press")
        if (event.key === "ArrowDown") {
            event.preventDefault();
            document.navigationIndex = 
                Math.min(document.navigationIndex + 1, document.navigationItems.length - 1);
            document.navigationItems[document.navigationIndex].focus();

        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            document.navigationIndex = Math.max(document.navigationIndex - 1, 0);
            document.navigationItems[document.navigationIndex].focus();
            
        } else if (event.key === "Enter") {
            document.activeElement.click()
        }
    });
}
