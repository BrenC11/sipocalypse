import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';

export async function prerender() {
  const html = renderToString(<App />);
  return {
    html,
    links: new Set(['/']),
  };
}
