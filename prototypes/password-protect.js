/**
 * Simple client-side password protection for prototypes.
 *
 * Usage: Add this to your prototype HTML:
 *   <script>window.PROTOTYPE_PASSWORD = 'your-password';</script>
 *   <script src="/prototypes/password-protect.js"></script>
 *
 * The script will show a password prompt and hide content until correct password is entered.
 * Password is remembered in sessionStorage for the browser session.
 */
(function() {
  'use strict';

  var PASSWORD = window.PROTOTYPE_PASSWORD;
  if (!PASSWORD) return; // No password set, skip protection

  var STORAGE_KEY = 'prototype_auth_' + window.location.pathname;

  // Check if already authenticated this session
  if (sessionStorage.getItem(STORAGE_KEY) === 'true') return;

  // Hide body content and show password prompt
  document.documentElement.style.visibility = 'hidden';

  document.addEventListener('DOMContentLoaded', function() {
    // Create overlay
    var overlay = document.createElement('div');
    overlay.id = 'password-overlay';
    overlay.innerHTML = [
      '<div class="password-box">',
      '  <h2>Dit prototype is beveiligd</h2>',
      '  <p>Voer het wachtwoord in om toegang te krijgen.</p>',
      '  <form id="password-form">',
      '    <input type="password" id="password-input" placeholder="Wachtwoord" autocomplete="off">',
      '    <button type="submit">Toegang</button>',
      '  </form>',
      '  <p class="error" id="password-error" hidden>Onjuist wachtwoord</p>',
      '</div>'
    ].join('');

    // Add styles
    var style = document.createElement('style');
    style.textContent = [
      '#password-overlay {',
      '  position: fixed; top: 0; left: 0; right: 0; bottom: 0;',
      '  background: #fff; z-index: 99999;',
      '  display: flex; align-items: center; justify-content: center;',
      '  font-family: system-ui, -apple-system, sans-serif;',
      '}',
      '.password-box {',
      '  text-align: center; padding: 48px; max-width: 360px;',
      '}',
      '.password-box h2 {',
      '  margin: 0 0 8px; font-size: 20px; font-weight: 600;',
      '}',
      '.password-box p {',
      '  margin: 0 0 24px; color: #6b7280; font-size: 14px;',
      '}',
      '.password-box form {',
      '  display: flex; gap: 8px;',
      '}',
      '.password-box input {',
      '  flex: 1; padding: 12px; font-size: 16px;',
      '  border: 1px solid #e5e7eb; border-radius: 4px;',
      '}',
      '.password-box input:focus {',
      '  outline: none; border-color: #93c5fd;',
      '  box-shadow: 0 0 0 3px rgba(147,197,253,.35);',
      '}',
      '.password-box button {',
      '  padding: 12px 20px; font-size: 16px; font-weight: 600;',
      '  background: #404040; color: #fff; border: none; border-radius: 4px;',
      '  cursor: pointer;',
      '}',
      '.password-box button:hover { background: #2b2b2b; }',
      '.password-box .error {',
      '  margin: 16px 0 0; color: #b91c1c; font-size: 14px;',
      '}'
    ].join('\n');

    document.head.appendChild(style);
    document.body.appendChild(overlay);
    document.documentElement.style.visibility = 'visible';

    // Handle form submit
    var form = document.getElementById('password-form');
    var input = document.getElementById('password-input');
    var error = document.getElementById('password-error');

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      if (input.value === PASSWORD) {
        sessionStorage.setItem(STORAGE_KEY, 'true');
        overlay.remove();
        style.remove();
      } else {
        error.hidden = false;
        input.value = '';
        input.focus();
      }
    });

    input.focus();
  });
})();
