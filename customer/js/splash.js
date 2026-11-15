/**
 * LayarTix — Splash Screen Controller
 * Controls the 6-second text animation, countdown, and seamless transition.
 */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const TOTAL_DURATION_SEC = 6;
  const FADE_OUT_DURATION_MS = 1000;
  
  const splashWrapper = document.getElementById('splashWrapper');
  const countdownEl = document.getElementById('countdownTimer');
  const skipBtn = document.getElementById('skipSplashBtn');
  
  let secondsRemaining = TOTAL_DURATION_SEC;
  let hasNavigated = false;

  // Destination resolver: Always go to login.html first so the user sees the login experience,
  // or user can click skip / let timer finish to enter login.
  function getDestination() {
    return 'customer/html/login.html';
  }

  // Smooth navigation with 1s fade-out transition
  function proceedToNextPage() {
    if (hasNavigated) return;
    hasNavigated = true;

    if (splashWrapper) {
      splashWrapper.classList.add('fade-out');
    }

    setTimeout(() => {
      window.location.replace(getDestination());
    }, FADE_OUT_DURATION_MS);
  }

  // 1-second interval counter for the timer text
  const countdownInterval = setInterval(() => {
    secondsRemaining--;
    if (countdownEl) {
      countdownEl.textContent = `${secondsRemaining}s`;
    }
    if (secondsRemaining <= 0) {
      clearInterval(countdownInterval);
    }
  }, 1000);

  // Exact 6.0 seconds timeout for automatic transition
  const autoRedirectTimer = setTimeout(() => {
    proceedToNextPage();
  }, TOTAL_DURATION_SEC * 1000);

  // Allow user to skip immediately via thumb button or pressing Space/Enter
  if (skipBtn) {
    skipBtn.addEventListener('click', () => {
      clearTimeout(autoRedirectTimer);
      clearInterval(countdownInterval);
      proceedToNextPage();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') {
      clearTimeout(autoRedirectTimer);
      clearInterval(countdownInterval);
      proceedToNextPage();
    }
  });
});

