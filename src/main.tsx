import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { registerLicense } from '@syncfusion/ej2-base';

// ✅ Patch the CanvasRenderingContext2D.textAlign to fix invalid "Middle" bug
(function patchCanvasTextAlign() {
  const ctxProto = CanvasRenderingContext2D.prototype as any;
  const originalSetter = Object.getOwnPropertyDescriptor(ctxProto, 'textAlign')?.set;

  if (originalSetter) {
    Object.defineProperty(ctxProto, 'textAlign', {
      set(value: string) {
        if (value === 'Middle') {
          originalSetter.call(this, 'center'); // ✅ valid fallback
        } else {
          originalSetter.call(this, value);
        }
      },
      get: Object.getOwnPropertyDescriptor(ctxProto, 'textAlign')?.get,
      configurable: true,
      enumerable: true,
    });
  }
})();

// ✅ Register your Syncfusion license
registerLicense('ORg4AjUWIQA/Gnt3VVhhQlJDfV5AQmBIYVp/TGpJfl96cVxMZVVBJAtUQF1hTH5VdEJjXHxccnBURWJeWkd2');

// ✅ Mount the app (React 18 API)
const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);