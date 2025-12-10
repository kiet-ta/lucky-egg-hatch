// src/utils/modalButtonReorder.ts

export function initModalButtonReorder() {
  // Watch for dialog elements being added to DOM
  const observer = new MutationObserver(() => {
    const dialogs = document.querySelectorAll('[role="dialog"], [role="alertdialog"]');
    
    dialogs.forEach((dialog) => {
      // Find the Install Wallet Extension button
      const buttons = dialog.querySelectorAll('button');
      let installButton: HTMLElement | null = null;
      
      buttons.forEach((btn) => {
        if (btn.textContent?.includes('Install Wallet Extension')) {
          installButton = btn;
        }
      });
      
      // If found, move it to the end of the dialog
      if (installButton && installButton.parentNode) {
        installButton.parentNode.appendChild(installButton);
        
        // Style the button
        installButton.style.display = 'block';
        installButton.style.margin = '2rem auto 0';
        installButton.style.width = 'auto';
        // Ensure any inline positioning from other scripts is cleared
        installButton.style.position = 'static';
        installButton.style.removeProperty('left');
        installButton.style.removeProperty('right');
        installButton.style.removeProperty('bottom');
        installButton.style.removeProperty('transform');

        // Add a stable class so CSS can reliably target the button
        installButton.classList.add('oclts-install-wallet-btn');
      }
    });
  });
  
  // Start observing document for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
  
  return () => observer.disconnect();
}
