// Clear Cache Script
// Run this in your browser console to clear all cached data

console.log("Clearing browser cache and storage...");

// Clear localStorage
localStorage.clear();
console.log("✓ localStorage cleared");

// Clear sessionStorage
sessionStorage.clear();
console.log("✓ sessionStorage cleared");

// Clear all cookies
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});
console.log("✓ cookies cleared");

// Force reload the page
console.log("Reloading page...");
window.location.reload(true); 